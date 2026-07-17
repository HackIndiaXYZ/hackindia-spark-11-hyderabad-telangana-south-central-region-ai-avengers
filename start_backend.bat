@echo off
cd /d "c:\Users\manoh\OneDrive\Desktop\hack the marix\backend"
echo Starting VisionCare AI backend on port 8001...
.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8001
pause
