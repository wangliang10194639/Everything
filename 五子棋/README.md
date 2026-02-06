# 五子棋闯关游戏 (Gomoku Puzzle)

## 🎯 项目概述

五子棋闯关游戏是一个专注于渐进式挑战和学习体验的五子棋游戏。玩家将通过解决精心设计的棋局，逐步学习战术、提升棋力，最终攻克所有关卡。

## 📱 平台支持

- **Android**: ✅ 原生支持
- **iOS**: ✅ 通过 Flutter 跨平台支持
- **Web**: ✅ 可通过 Flutter Web 部署

## 🏗️ 技术架构

- **框架**: Flutter 3.x
- **状态管理**: Provider
- **本地存储**: SharedPreferences
- **编程语言**: Dart

## 🎮 游戏特性

### 关卡设计
- **基础篇 (第1章)**: 掌握基本规则与初级战术
  - 活三、冲四、简单的五子连珠
  - 关卡1-7，难度循序渐进

- **进阶篇 (第2章)**: 引入复杂战术
  - 双三战术、活四技巧、假眼陷阱
  - VCF（连续冲四胜）
  - 关卡8-12，需要多步计算

### 核心机制
- ✅ 胜利条件: 在限定步数内完成五子连珠
- ✅ 禁手规则: 高阶关卡引入三三禁手、四四禁手、长连禁手
- ✅ 提示系统: 提供关键落子点提示
- ✅ 悔棋功能: 每关最多3次悔棋机会

### 玩家成长
- 阶段性目标与数据分析
- 成就与反馈系统
- 解锁新的棋盘外观

## 📁 项目结构

```
五子棋/
├── lib/
│   ├── main.dart              # 应用入口
│   ├── models/
│   │   ├── level.dart         # 关卡数据模型
│   │   └── board.dart         # 棋盘逻辑模型
│   ├── data/
│   │   └── levels.dart        # 关卡数据
│   ├── providers/
│   │   └── game_provider.dart # 游戏状态管理
│   ├── screens/
│   │   ├── home_screen.dart       # 首页
│   │   ├── level_screen.dart     # 关卡选择
│   │   ├── game_screen.dart       # 游戏界面
│   │   └── result_screen.dart    # 结果页面
│   └── widgets/
│       └── board_widget.dart  # 棋盘组件
├── pubspec.yaml               # 依赖配置
└── README.md                  # 项目说明
```

## 🚀 快速开始

### 环境要求
- Flutter SDK 3.0+
- Dart SDK 3.0+
- Android Studio / VS Code

### 安装步骤

1. **克隆项目**
   ```bash
   cd /root/Everything
   ```

2. **安装依赖**
   ```bash
   cd 五子棋
   flutter pub get
   ```

3. **运行项目**
   ```bash
   flutter run
   ```

### 构建 APK

```bash
flutter build apk --release
```

生成的 APK 文件位于: `build/app/outputs/flutter-apk/app-release.apk`

## 🎯 关卡设计

### 难度等级
| 等级 | 名称 | 说明 |
|------|------|------|
| 1 | 入门 | 基本规则学习 |
| 2 | 简单 | 初级战术入门 |
| 3 | 中等 | 组合战术 |
| 4 | 困难 | 复杂计算 |
| 5 | 专家 | 高阶技巧 |

### 关卡列表

#### 基础篇 (第1章)
- 第1关: 第一步 - 认识五子连珠
- 第2关: 横连竖通 - 横向连接
- 第3关: 斜线追击 - 斜向连接
- 第4关: 活三布局 - 活三基础
- 第5关: 冲四威胁 - 冲四战术
- 第6关: 攻防兼备 - 攻防转换
- 第7关: VCF入门 - 连续冲四

#### 进阶篇 (第2章)
- 第8关: 双三制胜 - 双三战术
- 第9关: 活四必胜 - 活四技巧
- 第10关: 识破假眼 - 假眼陷阱
- 第11关: 连环冲四 - 复杂VCF
- 第12关: 禁手规则 - 禁手限制

## 🔧 自定义关卡

可以在 [`lib/data/levels.dart`](lib/data/levels.dart) 文件中添加新关卡:

```dart
Level(
  id: 13,
  title: '新关卡名称',
  description: '关卡描述',
  chapter: 1,        // 章节号
  difficulty: Difficulty.medium,
  initialBoard: [
    LevelMove(row: 7, col: 7, player: Player.black),
  ],
  playerColor: Player.black,
  maxMoves: 3,
  useForbiddenMoves: false,
  hints: [
    Hint(
      description: '提示描述',
      hintMoves: [
        LevelMove(row: 7, col: 8, player: Player.black),
      ],
    ),
  ],
),
```

## 📖 游戏规则

### 基本规则
- 双方轮流在15×15棋盘上落子
- 黑棋先手
- 五子连珠（横/竖/斜）获胜

### 禁手规则（部分关卡）
- **双三**: 同时形成两个活三
- **双四**: 同时形成两个四连
- **长连**: 形成超过五子的连珠

违反禁手规则直接判负。

## 🎨 界面预览

### 首页
- 章节选择卡片
- 章节进度显示
- 难度标识

### 游戏界面
- 15×15 标准棋盘
- 关卡信息栏
- 步数统计
- 悔棋/提示按钮

## 📝 更新日志

### v1.0.0 (2024)
- ✨ 初始版本发布
- ✨ 12个精心设计的关卡
- ✨ 渐进式难度设计
- ✨ 提示和悔棋功能
- ✨ 响应式界面设计

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

---

**祝您闯关顺利，棋艺精进！** 🎉
