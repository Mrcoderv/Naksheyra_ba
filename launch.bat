@echo off
setlocal
cd /d "%~dp0"

if "%PORT%"=="" set "PORT=3000"
set "URL=http://localhost:%PORT%"
set "ADMIN=%URL%/admin"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install it from https://nodejs.org
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies ^(first run, this may take a minute^)...
  where pnpm >nul 2>nul
  if errorlevel 1 (
    call npm install
  ) else (
    call pnpm install
  )
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo.
echo   Nakshatra Business Advisory - local CMS
echo   ----------------------------------------
echo   Site  :  %URL%
echo   Admin :  %ADMIN%
echo   Press Ctrl+C to stop.
echo.

start "" "%URL%"
node server.js
pause
