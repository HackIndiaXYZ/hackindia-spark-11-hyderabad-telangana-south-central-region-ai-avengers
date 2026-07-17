@echo off
echo Killing any process on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do (
    taskkill /F /PID %%a 2>nul
)
echo Done. Starting fresh frontend...
cd /d "c:\Users\manoh\OneDrive\Desktop\hack the marix\visioncare-frontend"
npm start
