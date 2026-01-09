@echo off
echo Starting Emotion Recognition Frontend...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the development server
echo.
echo Starting React development server on http://localhost:3000
echo.
npm start