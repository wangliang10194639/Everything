@echo off
title CH3C Helper

echo ========================================
echo   CH3C Helper
echo ========================================
echo.

REM Check admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Please run as Administrator!
    echo.
    echo Trying to restart as Administrator...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [1/3] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found!
    echo.
    echo Please install Python 3.7+ first
    echo.
    pause
    exit /b 1
)
python --version
echo.

echo [2/3] Checking dependencies...
python -c "import pymem" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing dependencies...
    pip install -r requirements.txt
    echo.
)

echo [3/3] Starting program...
echo.
python main.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Program exited with error
    pause
)
