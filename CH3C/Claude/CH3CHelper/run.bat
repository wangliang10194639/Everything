@echo off
title 澄海3C辅助软件
chcp 65001 > nul

REM 检查是否以管理员身份运行
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [提示] 请以管理员身份运行！
    echo.
    echo 正在尝试以管理员身份重新启动...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================
echo   澄海3C 游戏辅助软件
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python！
    echo.
    echo 请先安装Python 3.7+，然后重新运行
    echo.
    echo 或者使用打包好的exe文件
    pause
    exit /b 1
)

REM 检查依赖是否安装
echo 检查依赖...
python -c "import pymem" >nul 2>&1
if %errorlevel% neq 0 (
    echo [提示] 正在安装依赖...
    pip install -r requirements.txt
    echo.
)

REM 运行主程序
echo 正在启动...
echo.
python main.py

if %errorlevel% neq 0 (
    echo.
    echo [错误] 程序异常退出
    pause
)
