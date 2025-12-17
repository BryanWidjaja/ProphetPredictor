from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import pandas as pd 
import numpy as np

from prophet import Prophet

app = FastAPI(title="CSV Upload Test API")

raw_rows = []
models = {}
product_series = {}
seasonality_info = {}

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

    mae = np.mean(np.abs(y_true - y_pred))
    rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
    mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100

    return {
        "mae": round(float(mae), 2),
        "rmse": round(float(rmse), 2),
        "mape": f"{round(float(mape), 2)}%"
    }
    
@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["quantity_sold"] = pd.to_numeric(df["quantity_sold"], errors="coerce")
    df = df.dropna(subset=["product_name", "date", "quantity_sold"])

    records = df.to_dict(orient="records")
    raw_rows.extend(records)

    df_all = pd.DataFrame(raw_rows)

    models.clear()
    product_series.clear()

    seasonality_info.clear()

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

        models[product] = m
        product_series[product] = ts
        seasonality_info[product] = get_seasonality_info(ts)

    return {
        "status": "trained",
        "products": list(models.keys()),
        "seasonality": seasonality_info
    }

@app.get("/data")
def get_data():
    return sorted({
        item["product_name"]
        for item in raw_rows
        if "product_name" in item
    })


@app.get("/")
def health_check():
    return {"status": "API running on port 8000"}


@app.get("/forecast/{product_name}")
def forecast_product(product_name: str):
    if product_name not in models:
        raise HTTPException(status_code=404, detail="Model not found")

    model = models[product_name]
    ts = product_series[product_name]

    metrics = evaluate_model(model, ts)

    future = model.make_future_dataframe(
        periods=MONTHS_AHEAD,
        freq="MS"
    )

    forecast = model.predict(future)

    forecast_out = (
        forecast.tail(MONTHS_AHEAD)[["ds", "yhat", "yhat_lower", "yhat_upper"]]
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

@app.get("/seasonality/{product_name}")
def get_product_seasonality(product_name: str):
    if product_name not in seasonality_info:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "product": product_name,
        "seasonality": seasonality_info[product_name]
    }

@app.get("/history/{product_name}")
def history_product(product_name: str):
    if product_name not in models:
        raise HTTPException(status_code=404, detail="Model not found")

    model = models[product_name]
    ts = product_series[product_name]

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