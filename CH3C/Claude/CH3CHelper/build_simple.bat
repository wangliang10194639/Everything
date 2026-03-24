@echo off
echo ========================================
echo   CH3C Helper - Build Script
echo ========================================
echo.

echo [1/5] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found!
    echo Please install Python 3.7+
    pause
    exit /b 1
)
python --version
echo.

echo [2/5] Installing dependencies...
pip install -r requirements.txt
echo.

echo [3/5] Cleaning old build files...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
echo.

echo [4/5] Building with PyInstaller...
pyinstaller --clean CH3CHelper.spec
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo.

echo [5/5] Copying config files...
if not exist dist\configs mkdir dist\configs
copy configs\3C.txt dist\configs\ >nul
echo.

if exist dist\CH3CHelper.exe (
    echo ========================================
    echo   Build successful!
    echo ========================================
    echo.
    echo Executable: dist\CH3CHelper.exe
    echo Config: dist\configs\
    echo.
    echo Usage:
    echo   1. Run CH3CHelper.exe as Administrator
    echo   2. Make sure Warcraft III is running
    echo.
) else (
    echo ========================================
    echo   Build may have failed, check errors
    echo ========================================
)

echo.
echo Done!
pause
