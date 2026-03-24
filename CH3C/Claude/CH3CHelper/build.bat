@echo off
chcp 65001 > nul
echo ========================================
echo   澄海3C辅助软件 - Windows打包脚本
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python未安装！
    echo 请先安装Python 3.7+
    pause
    exit /b 1
)

echo [1/5] 检查Python环境...
python --version
echo.

echo [2/5] 安装依赖库...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [警告] 依赖安装可能有问题，但继续尝试打包...
)
echo.

echo [3/5] 清理旧的构建文件...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
echo.

echo [4/5] 开始使用PyInstaller打包...
pyinstaller --clean CH3CHelper.spec
if %errorlevel% neq 0 (
    echo [错误] 打包失败！
    pause
    exit /b 1
)
echo.

echo [5/5] 复制配置文件...
if not exist dist\configs mkdir dist\configs
copy configs\3C.txt dist\configs\
echo.

if exist dist\CH3CHelper.exe (
    echo ========================================
    echo   打包成功！
    echo ========================================
    echo.
    echo 可执行文件位置: dist\CH3CHelper.exe
    echo 配置文件位置: dist\configs\
    echo.
    echo 使用说明：
    echo   1. 以管理员身份运行CH3CHelper.exe
    echo   2. 确保魔兽争霸III正在运行
    echo   3. 按提示操作即可
    echo.
    echo 是否立即运行测试？
    choice /c YN /m "选择"
    if errorlevel 2 goto no_test
    goto yes_test
) else (
    echo ========================================
    echo   打包可能失败，请检查错误信息
    echo ========================================
)

:end
echo.
echo 打包完成！
pause
exit /b 0

:yes_test
echo.
echo 正在启动程序...
cd dist
start CH3CHelper.exe
echo.
echo 程序已启动
goto end

:no_test
echo.
echo 跳过测试
goto end
