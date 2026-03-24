# 弹弓射手项目结构说明

## 📁 项目目录结构

```
弹弓射手/                    # 微信开发者工具直接打开此目录
├── audio/                  # 音频资源文件
│   ├── bgm.mp3            # 背景音乐
│   ├── boom.mp3           # 爆炸音效
│   └── bullet.mp3         # 子弹音效
├── images/                 # 图片资源文件
│   ├── hero.png           # 英雄图片
│   ├── enemy.png          # 敌人图片
│   ├── bg.jpg             # 背景图片
│   └── ...                # 其他图片资源
├── js/                     # JavaScript源代码
│   ├── base/              # 基础类
│   │   ├── sprite.js      # 精灵基类
│   │   ├── animation.js   # 动画类
│   │   └── pool.js        # 对象池
│   ├── characters/        # 角色系统
│   │   ├── Hero.js        # 英雄类
│   │   └── Enemy.js       # 敌人类
│   ├── config/            # 配置文件
│   │   └── gameConfig.js  # 游戏配置
│   ├── controllers/       # 控制器
│   │   └── SlingShotController.js  # 弹弓控制器
│   ├── libs/              # 第三方库
│   │   └── tinyemitter.js # 事件发射器
│   ├── managers/          # 管理器系统
│   │   ├── AdManager.js   # 广告管理
│   │   ├── ShopManager.js # 商店系统
│   │   ├── LevelManager.js # 关卡管理
│   │   └── RuneManager.js # 符文系统
│   ├── scenes/            # 场景管理
│   │   └── GameScene.js   # 主游戏场景
│   ├── runtime/           # 运行时组件
│   │   ├── background.js  # 背景
│   │   ├── gameinfo.js    # 游戏信息
│   │   └── music.js       # 音乐管理
│   ├── main.js            # 主入口文件
│   ├── render.js          # 渲染初始化
│   └── databus.js         # 数据总线
├── game.js                 # 游戏入口文件
├── game.json               # 游戏配置
├── project.config.json     # 项目配置
├── project.private.config.json  # 私有配置
├── build.sh                # 构建脚本
├── check_compatibility.sh  # 兼容性检查
├── full_build_check.sh     # 完整构建检查
├── README.md               # 项目说明
└── ...                     # 其他文档文件
```

## 🎮 开发使用说明

### 微信开发者工具导入
1. 直接在微信开发者工具中打开 `弹弓射手` 目录
2. 确保填入正确的AppID（在project.config.json中配置）
3. 点击"编译"进行预览

### 构建和检查
```bash
# 运行完整构建检查
./full_build_check.sh

# 运行兼容性检查
./check_compatibility.sh

# 基础构建检查
./build.sh
```

### 开发流程
1. 修改源代码文件（主要在js/目录下）
2. 运行构建检查确保没有问题
3. 在微信开发者工具中刷新预览
4. 进行真机调试测试

## 📋 核心文件说明

### 入口文件
- **game.js**: 游戏主入口，导入Main类
- **js/main.js**: 游戏主逻辑，初始化游戏场景

### 配置文件
- **game.json**: 微信小游戏基础配置
- **project.config.json**: 开发者工具项目配置
- **project.private.config.json**: 私有配置文件

### 核心系统
- **GameScene.js**: 主游戏场景控制器
- **SlingShotController.js**: 弹弓控制逻辑
- **Hero.js/Enemy.js**: 角色系统
- **各Manager.js**: 各种子系统管理器

## ✅ 质量保证

### 自动化检查
- 模块路径规范检查
- 微信API兼容性验证
- 文件完整性验证
- 构建产物验证

### 最佳实践
- 统一使用绝对路径导入
- 遵循微信小游戏开发规范
- 定期运行构建检查
- 保持代码和文档同步更新

---
*项目状态：Production Ready*
*最后更新：2026年2月16日*