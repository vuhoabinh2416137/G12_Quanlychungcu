@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [0/3] Dọn dẹp cổng mạng cũ (nếu có)...
FOR /F "tokens=5" %%a in ('netstat -aon ^| findstr ":8080"') do taskkill /F /PID %%a 2>nul
FOR /F "tokens=5" %%a in ('netstat -aon ^| findstr ":5173"') do taskkill /F /PID %%a 2>nul

echo [1/3] Starting Database (Docker)...
docker info >nul 2>&1
if %errorlevel% equ 0 goto docker_ready

echo Docker is not running. Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo Waiting for Docker to be ready...

:wait_docker
timeout /t 3 /nobreak >nul
docker info >nul 2>&1
if %errorlevel% neq 0 goto wait_docker

:docker_ready
docker-compose up -d

echo [2/3] Starting Spring Boot Backend...
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [Loi] Khong tim thay 'java'. Ban can phai cai dat Java - JDK 17 tro len truoc khi chay he thong.
    pause
    exit /b 1
)
start "Backend Server" cmd /k "cd backend && .\mvnw.cmd spring-boot:run"

echo [3/3] Starting Vite Frontend...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ========================================================
    echo [LOI NGHIEM TRONG] KHONG TIM THAY 'npm' tren may tinh cua ban!
    echo He thong Frontend doi hoi phai co Node.js de chay.
    echo Ban vui long tai va cai dat Node.js ban moi nhat tai link sau:
    echo https://nodejs.org/ - Vui long tai ban LTS
    echo Sau khi cai dat xong, hay khoi dong lai file nay.
    echo ========================================================
    pause
    exit /b 1
)

if not exist "frontend\node_modules\" (
    echo [Thong bao] Dang tu dong tai cac thu vien Frontend - npm install - lan dau tien...
    cmd /c "cd frontend && npm install"
)

start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Done! The services are running in new terminal windows.
