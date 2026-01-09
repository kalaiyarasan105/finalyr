#!/usr/bin/env python3
"""
Startup script for the Emotion Recognition FastAPI application
"""
import uvicorn
from config import settings

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.environment == "development" else False,
        log_level="info"
    )