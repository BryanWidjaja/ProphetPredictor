from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
import time

import pandas as pd 
import numpy as np

from prophet import Prophet

app = FastAPI(title="CSV Upload Test API")

sessions = {}

MONTHS_AHEAD = 12

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def detect_frequency(ts):
    diffs = ts["ds"].sort_values().diff().dropna()
    if diffs.empty:
        return "M"

    median_days = diffs.dt.days.median()

    if median_days <= 2:
        return "D"
    elif median_days <= 10:
        return "W"
    else:
        return "M"
    
def get_seasonality_info(ts):
    span_days = (ts["ds"].max() - ts["ds"].min()).days
    freq = detect_frequency(ts)

    return {
        "frequency": freq,
        "yearly": span_days >= 730,
        "monthly": span_days >= 365,
        "weekly": freq in ["D", "W"] and span_days >= 60
    }
    
def build_prophet(ts):
    ts = ts.sort_values("ds")

    span_days = (ts["ds"].max() - ts["ds"].min()).days
    freq = detect_frequency(ts)

    yearly = span_days >= 730
    weekly = freq in ["D", "W"] and span_days >= 60
    daily = freq == "D" and span_days >= 30

    m = Prophet(
        yearly_seasonality=yearly,
        weekly_seasonality=weekly,
        daily_seasonality=daily
    )

    if span_days >= 365:
        m.add_seasonality(
            name="monthly",
            period=30.5,
            fourier_order=5
        )

    return m

def evaluate_model(model, ts):
    forecast = model.predict(ts)

    y_true = ts["y"].values
    y_pred = forecast["yhat"].values

    mask = y_true > 0
    y_true = y_true[mask]
    y_pred = y_pred[mask]

    abs_errors = np.abs(y_true - y_pred)

    mae = np.mean(abs_errors)
    rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))

    naive_errors = np.abs(y_true[1:] - y_true[:-1])

    if np.sum(naive_errors) == 0:
        mase = np.nan
    else:
        mase = np.mean(abs_errors[1:]) / np.mean(naive_errors)

    return {
        "mae": round(float(mae), 2),
        "rmse": round(float(rmse), 2),
        "mase": round(float(mase), 3) if not np.isnan(mase) else None
    }
  
def cleanup_sessions(max_age=3600):
    now = time.time()
    for sid in list(sessions.keys()):
        if now - sessions[sid]["last_used"] > max_age:
            del sessions[sid]
    
@app.post("/session")
def create_session():
    session_id = str(uuid4())

    sessions[session_id] = {
        "raw_rows": [],
        "models": {},
        "product_series": {},
        "seasonality_info": {},
        "last_used": time.time()
    }

    return { "session_id": session_id }

@app.post("/upload/{session_id}")
async def upload_csv(session_id: str, file: UploadFile = File(...)):

    cleanup_sessions()

    if session_id not in sessions:
        raise HTTPException(404, "Invalid session")

    s = sessions[session_id]
    s["last_used"] = time.time()

    file.file.seek(0)
    df = pd.read_csv(file.file)

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["quantity_sold"] = pd.to_numeric(df["quantity_sold"], errors="coerce")
    df = df.dropna(subset=["product_name", "date", "quantity_sold"])

    records = df.to_dict(orient="records")
    s["raw_rows"].extend(records)

    df_all = pd.DataFrame(s["raw_rows"])

    s["models"].clear()
    s["product_series"].clear()
    s["seasonality_info"].clear()

    for product, g in df_all.groupby("product_name"):
        ts = (
            g.groupby("date", as_index=False)["quantity_sold"]
            .sum()
            .rename(columns={"date": "ds", "quantity_sold": "y"})
            .sort_values("ds")
        )

        if len(ts) < 10:
            continue

        m = build_prophet(ts)
        m.fit(ts)

        s["models"][product] = m
        s["product_series"][product] = ts
        s["seasonality_info"][product] = get_seasonality_info(ts)

    return {
        "status": "trained",
        "products": list(s["models"].keys()),
        "seasonality": s["seasonality_info"]
    }

@app.get("/data/{session_id}")
def get_data(session_id: str):
    
    cleanup_sessions()
    
    if session_id not in sessions:
        raise HTTPException(404, "Invalid session")
    
    s = sessions[session_id]
    s["last_used"] = time.time()

    return sorted(sessions[session_id]["models"].keys())

@app.get("/")
def health_check():
    return {"status": "API running on port 8000"}

@app.get("/forecast/{session_id}/{product_name}")
def forecast_product(session_id: str, product_name: str):
    
    cleanup_sessions()

    if session_id not in sessions:
        raise HTTPException(404, "Invalid session")

    s = sessions[session_id]
    s["last_used"] = time.time()

    if product_name not in s["models"]:
        raise HTTPException(404, "Model not found")

    model = s["models"][product_name]
    ts = s["product_series"][product_name]

    metrics = evaluate_model(model, ts)

    future = model.make_future_dataframe(
        periods=MONTHS_AHEAD,
        freq="MS"
    )

    forecast = model.predict(future)

    forecast_tail = forecast.tail(MONTHS_AHEAD).copy()

    forecast_tail["yhat"] = forecast_tail["yhat"].clip(lower=0)
    forecast_tail["yhat_lower"] = forecast_tail["yhat_lower"].clip(lower=0)
    forecast_tail["yhat_upper"] = forecast_tail["yhat_upper"].clip(lower=0)

    forecast_out = (
        forecast_tail[["ds", "yhat", "yhat_lower", "yhat_upper"]]
        .assign(ds=lambda x: x["ds"].dt.strftime("%Y-%m-%d"))
        .round(0)
        .rename(columns={
            "ds": "date",
            "yhat": "predicted",
            "yhat_lower": "lower",
            "yhat_upper": "upper"
        })
        .to_dict(orient="records")
    )

    return {
        "product": product_name,
        "metrics": metrics,
        "forecast": forecast_out
    }

@app.get("/history/{session_id}/{product_name}")
def history_product(session_id: str, product_name: str):

    cleanup_sessions()

    if session_id not in sessions:
        raise HTTPException(404, "Invalid session")

    s = sessions[session_id]
    s["last_used"] = time.time()

    if product_name not in s["models"]:
        raise HTTPException(404, "Model not found")

    model = s["models"][product_name]
    ts = s["product_series"][product_name]

    forecast = model.predict(ts)

    history = (
        pd.DataFrame({
            "date": ts["ds"],
            "actual": ts["y"],
            "predicted": forecast["yhat"],
            "lower": forecast["yhat_lower"],
            "upper": forecast["yhat_upper"],
        })
        .assign(date=lambda x: x["date"].dt.strftime("%Y-%m-%d"))
        .round(0)
        .to_dict(orient="records")
    )

    return {
        "product": product_name,
        "history": history
    }
    

