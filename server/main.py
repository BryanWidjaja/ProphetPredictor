from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # NEW IMPORT
from pydantic import BaseModel
import pandas as pd
import joblib
from prophet import Prophet
# ... (Other imports) ...

# ... (Model Loading code) ...

app = FastAPI(title="Prophet Forecasting API")

# --- Configure CORS Middleware ---
# This allows your React frontend to communicate with the API
origins = [
    "http://localhost:3000", # Default React development server port
    # Add your production frontend URL here when deploying!
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------------

# ... (The rest of the /predict endpoint code remains the same) ...