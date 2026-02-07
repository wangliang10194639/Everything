# WarKey - 魔兽争霸改键软件

## 项目简介

WarKey 是一款专为魔兽争霸 III 玩家设计的改键软件，通过自定义按键映射帮助玩家提升操作效率和游戏体验。

## 功能特性

- **物品栏改键** - 将物品栏 1-6 映射到任意按键
- **技能改键** - 自定义英雄技能和单位技能按键
- **多配置支持** - 支持保存和切换多个改键配置
- **热键切换** - 快速在不同配置间切换
- **进程检测** - 自动检测魔兽争霸游戏状态
- **配置导入导出** - 方便分享和备份配置

## 系统要求

### Windows 原生编译
- Windows 7/8/10/11
- Visual Studio 2019 或更高版本
- CMake 3.16 或更高版本

### Linux 交叉编译（使用 MinGW）
- Ubuntu 18.04 或更高版本
- MinGW 交叉编译工具链
- Wine（用于测试运行）
- CMake 3.16 或更高版本

## 编译说明

### 使用 CMake GUI

1. 打开 CMake GUI
2. 设置源码目录为 `WarKey`
3. 设置构建目录为 `WarKey/build`
4. 点击 "Configure" 选择 Visual Studio 版本
5. 点击 "Generate"
6. 打开生成的 `WarKey.sln` 并编译

### 使用 Visual Studio（推荐）

1. **安装 Visual Studio 2022**
   - 下载地址：https://visualstudio.microsoft.com/downloads/
   - 安装时选择 "使用 C++ 的桌面开发" 工作负载

2. **打开项目**
   - 打开 Visual Studio
   - 选择 "打开本地文件夹"，选择 `WarKey` 目录
   - 或者直接打开生成的 `WarKey.sln` 文件

3. **编译项目**
   - 选择配置：Release 或 Debug
   - 选择平台：x64
   - 点击 "生成" → "生成解决方案"

4. **运行程序**
   - 编译成功后，`bin\Release\WarKey.exe` 即为可执行文件
   - 右键点击 "以管理员身份运行"

### 使用命令行（Windows）

1. **安装 Visual Studio Build Tools**
   ```bash
   # 下载并安装 Visual Studio Build Tools 2022
   # 或使用 Chocolatey:
   choco install visualstudio2022buildtools
   ```

2. **打开 "x64 Native Tools Command Prompt for VS 2022"**
   （在开始菜单中搜索）

3. **编译步骤：**
   ```bash
   # 进入项目目录
   cd C:\你的路径\WarKey

   # 创建构建目录
   mkdir build
   cd build

   # 配置项目
   cmake .. -G "Visual Studio 17 2022" -A x64

   # 编译项目
   cmake --build . --config Release
   ```

4. **运行程序：**
   ```bash
   bin\Release\WarKey.exe
   ```

### 使用 WSL 编译

如果你在 WSL 中开发，想在 Windows 上运行：

**在 WSL 中编译：**
```bash
# 安装 MinGW 交叉编译工具
sudo apt install mingw-w64

# 编译 64 位版本
cd /mnt/c/你的路径/WarKey
mkdir build
cd build
cmake .. -G "MinGW Makefiles" \
    -DCMAKE_C_COMPILER=x86_64-w64-mingw32-gcc \
    -DCMAKE_CXX_COMPILER=x86_64-w64-mingw32-g++ \
    -DCMAKE_BUILD_TYPE=Release
cmake --build .

# 编译产物在 bin/ 目录
```

**在 Windows 中运行：**
```bash
# 直接双击运行或使用 cmd
C:\你的路径\build\bin\WarKey.exe
```

### Linux 交叉编译（使用 MinGW）

在 Ubuntu 上交叉编译 Windows 程序：

**1. 安装 MinGW 工具链：**
```bash
sudo apt update
sudo apt install mingw-w64
```

**2. 编译 64 位 Windows 程序：**
```bash
cd WarKey
mkdir build
cd build

# 配置交叉编译
cmake .. -G "MinGW Makefiles" \
    -DCMAKE_RC_COMPILER=x86_64-w64-mingw32-rc \
    -DCMAKE_C_COMPILER=x86_64-w64-mingw32-gcc \
    -DCMAKE_CXX_COMPILER=x86_64-w64-mingw32-g++ \
    -DCMAKE_BUILD_TYPE=Release

# 编译
cmake --build .
```

**3. 编译 32 位 Windows 程序：**
```bash
cmake .. -G "MinGW Makefiles" \
    -DCMAKE_RC_COMPILER=i686-w64-mingw32-rc \
    -DCMAKE_C_COMPILER=i686-w64-mingw32-gcc \
    -DCMAKE_CXX_COMPILER=i686-w64-mingw32-g++ \
    -DCMAKE_BUILD_TYPE=Release
```

**4. 使用 Wine 测试运行：**
```bash
# 安装 Wine
sudo apt install wine

# 运行编译好的程序
wine bin/WarKey.exe
```

### 使用 WSL 编译

如果你在 Windows 上使用 WSL：

```bash
# 在 WSL 中安装工具
sudo apt install mingw-w64

# 进入 Windows 文件系统
cd /mnt/c/你的项目路径/WarKey

# 创建构建目录
mkdir build
cd build

# 编译
cmake .. -G "MinGW Makefiles"
cmake --build . --config Release

# 在 Windows 中运行
/mnt/c/Windows/system32/cmd.exe /c "C:\你的路径\build\bin\WarKey.exe"
```

### 常见错误解决

| 错误信息 | 解决方法 |
|---------|---------|
| `Could not create named generator` | 运行 `cmake --help` 查看可用的生成器名称 |
| `could not find any instance of Visual Studio` | 安装 Visual Studio 并确保选择了 CMake 组件 |
| `No CMAKE_CXX_COMPILER could be found` | 安装 C++ 编译器（Visual Studio 或 MinGW） |
| `cannot find -lxxx` (Linux) | 安装对应的开发库，如 `sudo apt install libxxx-dev` |
| `Windows.h: No such file or directory` (MinGW) | 重新安装 MinGW 头文件：`sudo apt install --reinstall mingw-w64-x86-64-dev` |

### MinGW 环境问题排查

如果遇到 Windows.h 找不到的问题：

1. **检查头文件是否存在：**
   ```bash
   ls /usr/x86_64-w64-mingw32/include/windows.h
   ```

2. **如果文件是符号链接且损坏，重新安装：**
   ```bash
   sudo apt install --reinstall mingw-w64-x86-64-dev -y
   ```

3. **手动修复符号链接：**
   ```bash
   sudo rm /usr/x86_64-w64-mingw32/include/windows.h
   sudo cp /usr/share/mingw-w64/include/windows.h /usr/x86_64-w64-mingw32/include/
   ```

4. **验证编译器路径：**
   ```bash
   x86_64-w64-mingw32-g++ -v -E -x c++ /dev/null -o /dev/null 2>&1 | grep "search starts here"
   ```

## 目录结构

```
WarKey/
├── CMakeLists.txt          # CMake 构建配置
├── README.md               # 项目说明文档
├── 说明书.md               # 详细设计文档
├── include/                # 头文件目录
│   ├── Common.h            # 公共定义和工具函数
│   ├── KeyMapping.h        # 按键映射管理
│   ├── KeyboardHook.h      # 键盘钩子拦截
│   ├── KeyRemapper.h       # 按键重映射核心
│   ├── ConfigManager.h     # 配置管理
│   ├── ProcessDetector.h   # 进程检测
│   ├── Logger.h            # 日志系统
│   └── UI/                 # 用户界面
│       ├── MainWindow.h    # 主窗口
│       └── KeyMappingDialog.h  # 按键映射对话框
├── src/                    # 源文件目录
│   ├── main.cpp            # 程序入口
│   ├── KeyMapping.cpp      # 按键映射实现
│   ├── KeyboardHook.cpp    # 键盘钩子实现
│   ├── KeyRemapper.cpp     # 按键重映射实现
│   ├── ConfigManager.cpp   # 配置管理实现
│   ├── ProcessDetector.cpp # 进程检测实现
│   ├── Logger.cpp          # 日志系统实现
│   └── UI/                 # 用户界面实现
│       ├── MainWindow.cpp
│       └── KeyMappingDialog.cpp
├── configs/                # 配置文件目录
│   ├── Default.json        # 默认配置
│   └── Human_Standard.json # 人族标准配置
└── logs/                   # 日志文件目录
```

## 使用方法

### 运行程序

**重要：程序需要管理员权限运行！**

**方法 1：直接运行**
1. 在文件资源管理器中找到 `WarKey.exe`
2. 右键点击 → "以管理员身份运行"

**方法 2：使用命令行**
```cmd
# 打开管理员命令提示符
# 然后运行：
C:\你的路径\build\bin\Release\WarKey.exe
```

**方法 3：固定到任务栏**
1. 右键点击 WarKey.exe → "以管理员身份运行"
2. 程序运行后，右键点击任务栏图标 → "固定到任务栏"
3. 以后点击任务栏图标会自动以管理员权限运行

### 配置改键

1. **选择配置**
   - 在下拉框中选择现有配置或创建新配置

2. **设置物品栏映射**
   - 选择原始按键（如 1）
   - 选择映射后的按键（如 F1）
   - 勾选"启用"

3. **设置技能映射**
   - 选择原始技能（如 Q）
   - 选择映射后的按键（如 1）
   - 勾选"启用"

4. **应用配置**
   - 点击"应用"按钮启用改键
   - 点击"保存"保存配置

5. **启动游戏**
   - 启动魔兽争霸 III
   - 改键会自动生效

### 注意事项

- 程序必须在魔兽争霸窗口激活时才会生效
- 建议先在单人游戏中测试改键是否正常
- 如果改键不生效，请检查：
  1. 程序是否以管理员权限运行
  2. 魔兽争霸窗口是否处于激活状态
  3. 配置是否已应用

## 默认按键映射

### 物品栏
| 位置 | 默认按键 |
|------|---------|
| 物品1 | 1 |
| 物品2 | 2 |
| 物品3 | 3 |
| 物品4 | 4 |
| 物品5 | 5 |
| 物品6 | 6 |

### 英雄技能
| 技能 | 默认按键 |
|------|---------|
| Q | Q |
| W | W |
| E | E |
| R | R |

## 配置文件格式

```json
{
  "config_name": "配置名称",
  "version": "1.0.0",
  "auto_start": false,
  "show_notifications": true,
  "game_process": "war3.exe",
  "item_mappings": [
    {"original": "原始按键", "mapped": "映射按键", "enabled": true}
  ],
  "hero_skill_mappings": [
    {"original": "Q", "mapped": "1", "enabled": true}
  ]
}
```

## 常见问题

### Q: 改键不生效怎么办？
A: 请确保：
1. 以管理员权限运行程序
2. 魔兽争霸窗口处于激活状态
3. 检查配置是否已应用

### Q: 如何恢复默认配置？
A: 点击"重置"按钮可恢复默认配置

### Q: 支持哪些游戏版本？
A: 支持魔兽争霸 1.24e - 1.32.10 版本

## 技术实现

- **键盘钩子**: 使用 Windows Low-Level Keyboard Hook 拦截按键
- **按键模拟**: 使用 SendInput API 发送键盘事件
- **进程检测**: 定期检测游戏进程和窗口状态
- **配置存储**: JSON 格式配置文件

## 许可证

MIT License

## 作者

AI Assistant

## 更新日志

### v1.0.0 (2024)
- 初始版本发布
- 物品栏改键功能
- 技能改键功能
- 多配置支持
- 配置文件导入导出
