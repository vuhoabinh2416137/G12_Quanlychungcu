@echo off
cd /d "%~dp0"

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
start "Backend Server" cmd /k "cd backend && .\mvnw.cmd spring-boot:run"

echo [3/3] Starting Vite Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Done! The services are running in new terminal windows.
