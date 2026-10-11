Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Starting Enterprise Generative AI Knowledge Assistant..." -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "FastAPI Backend API: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "React Workspace:     http://localhost:5173" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

