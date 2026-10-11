@echo off
echo ======================================================================
echo Starting Enterprise Generative AI Knowledge Assistant...
echo ======================================================================

start "FastAPI Backend" cmd /k "cd backend && .\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

start "React Frontend" cmd /k "cd frontend && npm run dev"

echo Backend running on: http://127.0.0.1:8000/docs
echo Frontend running on: http://localhost:5173/
echo ======================================================================
