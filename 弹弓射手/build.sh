#!/bin/bash

# 弹弓射手构建脚本 - 直接在当前目录工作

echo "🚀 开始构建弹弓射手微信小游戏..."

# 检查必要的目录和文件
echo "🔍 检查项目结构..."

# 验证关键文件是否存在
missing_files=()

# 检查必需的配置文件
[[ ! -f "game.js" ]] && missing_files+=("game.js")
[[ ! -f "game.json" ]] && missing_files+=("game.json")
[[ ! -f "project.config.json" ]] && missing_files+=("project.config.json")
[[ ! -f "project.private.config.json" ]] && missing_files+=("project.private.config.json")

# 检查主要JS文件
[[ ! -f "js/main.js" ]] && missing_files+=("js/main.js")
[[ ! -f "js/scenes/GameScene.js" ]] && missing_files+=("js/scenes/GameScene.js")

# 检查资源文件
[[ ! -f "images/hero.png" ]] && missing_files+=("images/hero.png")
[[ ! -f "images/enemy.png" ]] && missing_files+=("images/enemy.png")
[[ ! -f "audio/bgm.mp3" ]] && missing_files+=("audio/bgm.mp3")

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "🎉 构建检查通过！项目结构完整。"
    echo "📁 项目位于当前目录: $(pwd)"
    echo "🎮 可以直接在微信开发者工具中打开当前目录进行预览和调试"
else
    echo "❌ 构建检查失败！缺少以下文件:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi