from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import pandas as pd 

from pydantic import BaseModel
import joblib
from prophet import Prophet

app = FastAPI(title="CSV Upload Test API")

raw_rows = []
models = {}

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

    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future)

    result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]

    return result.tail(days).to_dict(orient="records")
