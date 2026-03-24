# CH3C Assistant - 澪海3C游戏辅助工具

一款用于魔兽争霸3澪海3C地图的游戏辅助软件。

## 功能特性

- **脚本加载与执行**: 支持加载3C.txt配置文件，解析并执行脚本动作
- **全图功能**: 去除战争迷雾，显示全地图
- **敌人英雄追踪**: 实时显示敌人英雄位置、血量、状态等信息
- **热键管理**: 支持自定义热键绑定
- **跨平台支持**: 支持WSL开发和Windows运行环境

## 项目结构

```
ch3c-assistant/
├── src/
│   ├── core/                    # 核心模块
│   │   ├── config_parser.py     # 配置解析器
│   │   ├── script_parser.py     # 脚本解析器
│   │   └── script_executor.py   # 脚本执行引擎
│   ├── game/                    # 游戏模块
│   │   ├── platform.py          # 平台检测
│   │   ├── memory_reader_base.py # 内存读取器基类
│   │   ├── memory_reader_factory.py # 内存读取器工厂
│   │   ├── memory_reader_mock.py    # Mock实现(WSL测试)
│   │   └── memory_reader_windows.py # Windows实现
│   ├── ui/                      # 用户界面
│   │   └── main_window.py       # 主窗口
│   └── utils/                   # 工具模块
│       └── logger.py            # 日志模块
├── scripts/                     # 脚本目录
│   └── 3C.txt                   # 默认配置文件
├── tests/                       # 测试目录
├── requirements.txt             # 通用依赖
├── requirements-windows.txt     # Windows特有依赖
├── requirements-dev.txt         # 开发依赖
└── main.py                      # 主入口
```

## 安装

### WSL开发环境

```bash
# 安装通用依赖
pip install -r requirements.txt

# 安装开发依赖
pip install -r requirements-dev.txt
```

### Windows运行环境

```bash
# 安装所有依赖
pip install -r requirements.txt
pip install -r requirements-windows.txt
```

## 使用方法

### 启动程序

```bash
python main.py
```

### 基本操作

1. **加载配置**: 点击"加载配置"按钮，选择3C.txt配置文件
2. **附加游戏**: 点击"附加游戏"按钮，连接到Warcraft III进程
3. **启用功能**: 
   - 勾选"全图"复选框启用全图功能
   - 在脚本列表中勾选要启用的脚本
4. **启动执行**: 点击"启动"按钮开始执行脚本

## 脚本语法

### 基本动作

```
动作=使用技能,目标=敌人英雄,范围=600
动作=使用物品,目标=盟友建筑
动作=移动,目标=地面
```

### 高级动作

```
高级动作=等待出现,目标=敌人英雄,范围=950,技能状态=大招
高级动作=如果出现,目标=敌人英雄,范围=600,状态=被沉默的
```

### 条件判断

```
条件=血少于30%
条件=魔少于50%
条件=拥有物品传
```

### 控制流

```
转第1步      # 跳转到第1步
转$start    # 跳转到标签$start
等待1秒      # 等待1秒
```

### 全局脚本

```
全局脚本;高级动作=如果出现,目标=自己英雄,范围=100000,状态=被沉默的
```

## 开发说明

### 平台检测

程序会自动检测运行平台：
- Windows: 使用真实的内存读取功能
- WSL/Linux: 使用Mock实现进行测试

### 添加新功能

1. 在 `src/core/` 添加核心逻辑
2. 在 `src/game/` 添加游戏交互功能
3. 在 `src/ui/` 添加用户界面

### 运行测试

```bash
pytest tests/
```

## 注意事项

⚠️ **警告**: 
- 本软件仅供学习研究使用
- 使用游戏辅助工具可能违反游戏服务条款
- 使用可能导致游戏账号被封禁
- 请勿用于商业用途

## 许可证

MIT License

## 版本历史

- v0.1.0 - 初始版本
  - 基本的配置解析和脚本执行
  - 全图功能
  - 敌人英雄追踪
  - 用户界面
