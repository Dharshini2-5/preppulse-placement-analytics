@echo off
setlocal EnableDelayedExpansion
title PrepPulse Analytics - One-Click Launcher

echo ========================================================================
echo   PrepPulse Analytics - Placement Readiness Analytics Platform
echo   Spring Boot 3.4 (Java 21) + MySQL/H2 + React 19 + ReactBits UI
echo ========================================================================
echo.

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

:: 1. Verify Java 21+
where java >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Java is not installed or not in PATH. Please install Java 21 LTS.
    pause
    exit /b 1
)
for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do set "JAVA_VER=%%~v"
echo [OK] Java detected: %JAVA_VER%

:: 2. Verify Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 20+.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set "NODE_VER=%%v"
echo [OK] Node.js detected: %NODE_VER%
echo.

:: 3. Auto-install frontend dependencies if missing
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [SETUP] Installing frontend npm dependencies for the first time...
    pushd "%FRONTEND_DIR%"
    call npm.cmd install
    if errorlevel 1 (
        popd
        echo [ERROR] npm install failed. Check your network connection and retry.
        pause
        exit /b 1
    )
    popd
    echo [OK] Frontend dependencies installed.
    echo.
)

:: 4. Launch Spring Boot Backend (:8081)
echo [1/2] Launching Spring Boot Backend on http://localhost:8081 ...
start "PrepPulse Backend (Spring Boot :8081)" /D "%BACKEND_DIR%" cmd /k "mvnw.cmd spring-boot:run"

:: 5. Launch Vite React Frontend (:5171)
echo [2/2] Launching React + Vite Frontend on http://localhost:5171 ...
start "PrepPulse Frontend (React :5171)" /D "%FRONTEND_DIR%" cmd /k "npm.cmd run dev"
echo.

:: 6. Poll Backend Health Endpoint
echo [WAIT] Waiting for Spring Boot API (http://localhost:8081/api/health) to come online...
set /a TRIES=0
:WAIT_BACKEND
set /a TRIES+=1
powershell -NoProfile -Command "try { $r = Invoke-RestMethod -Uri 'http://localhost:8081/api/health' -TimeoutSec 2; if ($r.status -eq 'UP') { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
if %errorlevel%==0 (
    echo [READY] Spring Boot API is UP on http://localhost:8081
    goto WAIT_FRONTEND
)
if !TRIES! GEQ 45 (
    echo [WARN] Backend is still starting up in its terminal window. Proceeding to check frontend...
    goto WAIT_FRONTEND
)
echo        Checking backend... (!TRIES!/45)
timeout /t 2 /nobreak >nul
goto WAIT_BACKEND

:WAIT_FRONTEND
echo [WAIT] Waiting for Vite Frontend (http://localhost:5171) to come online...
set /a FTRIES=0
:LOOP_FRONTEND
set /a FTRIES+=1
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5171' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
if %errorlevel%==0 (
    echo [READY] Frontend UI is UP on http://localhost:5171
    goto OPEN_APP
)
if !FTRIES! GEQ 25 (
    echo [WARN] Frontend may still be compiling. Opening browser anyway...
    goto OPEN_APP
)
timeout /t 1 /nobreak >nul
goto LOOP_FRONTEND

:OPEN_APP
echo.
echo ========================================================================
echo   PrepPulse Analytics is LIVE!
echo   Frontend UI : http://localhost:5171
echo   Backend API : http://localhost:8081/api/health
echo   Demo Logins : dharshini@placement.edu / Student@123 (STUDENT)
echo                 mentor@placement.edu    / Mentor@123  (MENTOR)
echo                 admin@placement.edu     / Admin@123   (ADMIN)
echo ========================================================================
start "" "http://localhost:5171"
echo.
echo Leave the two server windows open while using PrepPulse Analytics.
if /I not "%~1"=="--no-pause" pause
endlocal
