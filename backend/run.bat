@echo off
echo Starting Emotion Recognition FastAPI Server...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo Please edit .env file with your configuration
)

REM Start the server
echo.
echo Starting FastAPI server on http://localhost:8000
echo API documentation available at http://localhost:8000/docs
echo.
python start.py