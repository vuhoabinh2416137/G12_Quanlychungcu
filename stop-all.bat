@echo off
chcp 65001 >nul
echo Đang đóng cổng 8080 (Backend)...
FOR /F "tokens=5" %%a in ('netstat -aon ^| findstr ":8080"') do taskkill /F /PID %%a 2>nul

echo Đang đóng cổng 5173 (Frontend)...
FOR /F "tokens=5" %%a in ('netstat -aon ^| findstr ":5173"') do taskkill /F /PID %%a 2>nul

echo Hoàn tất đóng cổng! Bạn có thể chạy lại .\run-all.bat
