from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import pandas as pd 
import numpy as np

from pydantic import BaseModel
import joblib
from prophet import Prophet

app = FastAPI(title="CSV Upload Test API")

raw_rows = []
models = {}
product_series = {}

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

    for product, g in df_all.groupby("product_name"):
        ts = (
            g.groupby("date", as_index=False)["quantity_sold"]
            .sum()
            .rename(columns={"date": "ds", "quantity_sold": "y"})
        )

        if len(ts) < 2:
            continue

        m = Prophet()
        m.fit(ts)

        models[product] = m
        product_series[product] = ts

    return {
        "status": "trained",
        "products": list(models.keys())
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

@app.post("/train")
def train_models():
    if not raw_rows:
        raise HTTPException(status_code=400, detail="No data uploaded")

    df = pd.DataFrame(raw_rows)

    trained = []

    for product, g in df.groupby("product_name"):
        ts = (
            g.groupby("date", as_index=False)["quantity_sold"]
            .sum()
            .rename(columns={
                "date": "ds",
                "quantity_sold": "y"
            })
        )

        if len(ts) < 2:
            continue

        m = Prophet()
        m.fit(ts)

        models[product] = m
        trained.append(product)

    return {
        "trained_models": trained
    }

@app.get("/forecast/{product_name}")
def forecast_product(product_name: str, days: int = 30):
    if product_name not in models:
        raise HTTPException(status_code=404, detail="Model not found")

    model = models[product_name]
    ts = product_series[product_name]

    metrics = evaluate_model(model, ts)

    future = model.make_future_dataframe(
        periods=MONTHS_AHEAD,
        freq="M"
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