# 微信小游戏模块路径修复说明

## 🐛 问题描述

在微信开发者工具中构建时出现以下错误：
```
Error: module 'js/js/scenes/GameScene.js' is not defined, require args is '/js/scenes/GameScene'
```

## 🔍 问题原因

微信小游戏的模块系统对路径解析比较严格：
1. 混用相对路径和绝对路径会导致路径解析错误
2. `game.js` 中使用相对路径 `./js/main` 与其他文件的绝对路径冲突
3. 微信小游戏要求整个项目统一使用绝对路径

## 🔧 修复方案

### 已修复的文件列表

1. **game.js** (新增修复)
   ```javascript
   // 修复前
   import Main from './js/main';
   
   // 修复后
   import Main from '/js/main';
   ```

2. **js/main.js**
   ```javascript
   // 修复前
   import GameScene from './scenes/GameScene';
   import Music from './runtime/music';
   
   // 修复后
   import GameScene from '/js/scenes/GameScene';
   import Music from '/js/runtime/music';
   ```

2. **js/scenes/GameScene.js**
   ```javascript
   // 修复前
   import Emitter from '../libs/tinyemitter';
   import { GAME_CONFIG } from '../config/gameConfig';
   // ... 其他相对路径导入
   
   // 修复后
   import Emitter from '/js/libs/tinyemitter';
   import { GAME_CONFIG } from '/js/config/gameConfig';
   // ... 其他绝对路径导入
   ```

3. **js/controllers/SlingShotController.js**
   ```javascript
   // 修复前
   import Emitter from '../libs/tinyemitter';
   import { GAME_CONFIG } from '../config/gameConfig';
   import Hero from '../characters/Hero';
   
   // 修复后
   import Emitter from '/js/libs/tinyemitter';
   import { GAME_CONFIG } from '/js/config/gameConfig';
   import Hero from '/js/characters/Hero';
   ```

4. **js/characters/Hero.js 和 Enemy.js**
   ```javascript
   // 修复前
   import Sprite from '../base/sprite';
   import { GAME_CONFIG, ... } from '../config/gameConfig';
   
   // 修复后
   import Sprite from '/js/base/sprite';
   import { GAME_CONFIG, ... } from '/js/config/gameConfig';
   ```

5. **所有管理器文件** (LevelManager.js, RuneManager.js, AdManager.js, ShopManager.js)
   ```javascript
   // 修复前
   import Emitter from '../libs/tinyemitter';
   import { ... } from '../config/gameConfig';
   
   // 修复后
   import Emitter from '/js/libs/tinyemitter';
   import { ... } from '/js/config/gameConfig';
   ```

6. **基础类文件** (sprite.js, animation.js)
   ```javascript
   // 修复前
   import Emitter from '../libs/tinyemitter';
   import Sprite from './sprite';
   
   // 修复后
   import Emitter from '/js/libs/tinyemitter';
   import Sprite from '/js/base/sprite';
   ```

## ✅ 验证结果

修复后已通过完整构建检查：
- ✅ 兼容性检查通过
- ✅ 构建成功
- ✅ 所有必需文件存在
- ✅ 可在微信开发者工具中正常导入

## 📝 微信小游戏模块导入规范

### 正确的导入方式
```javascript
// 绝对路径导入（推荐）
import MyClass from '/js/path/to/MyClass';
import { myFunction } from '/js/path/to/module';

// 项目根目录结构参考
/
├── game.js          # 入口文件
├── js/             # JavaScript目录
│   ├── main.js
│   ├── scenes/
│   ├── controllers/
│   └── ...
├── images/         # 图片资源
└── audio/          # 音频资源
```

### 错误的导入方式
```javascript
// 相对路径导入（会导致错误）
import MyClass from './path/to/MyClass';
import { myFunction } from '../path/to/module';
```

## 🚀 使用说明

1. 重新运行构建脚本：
   ```bash
   ./full_build_check.sh
   ```

2. 在微信开发者工具中导入 `dist/` 目录

3. 应该不会再出现模块未定义的错误

## 💡 注意事项

- 所有模块导入都必须使用绝对路径
- 路径以 `/` 开头，相对于项目根目录
- 构建脚本会自动处理路径复制
- 建议在开发过程中就使用正确的导入方式

---
*修复时间：2026年2月16日*