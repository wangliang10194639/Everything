#!/bin/bash

# 完整构建检查脚本 - 适用于当前目录

echo "🏗️  开始完整构建检查流程..."

# 1. 运行兼容性检查
echo "📋 步骤1: 运行兼容性检查..."
chmod +x check_compatibility.sh
./check_compatibility.sh

if [ $? -ne 0 ]; then
    echo "❌ 兼容性检查失败，停止构建流程"
    exit 1
fi

# 2. 运行构建脚本
echo "🔨 步骤2: 运行构建检查..."
chmod +x build.sh
./build.sh

if [ $? -ne 0 ]; then
    echo "❌ 构建检查失败"
    exit 1
fi

# 3. 验证项目结构
echo "✅ 步骤3: 验证项目结构..."

MISSING_FILES=()

# 检查必需的项目文件
required_files=(
    "game.js"
    "game.json"
    "project.config.json"
    "project.private.config.json"
    "js/main.js"
    "js/scenes/GameScene.js"
    "js/config/gameConfig.js"
    "js/managers/LevelManager.js"
    "js/controllers/SlingShotController.js"
    "js/characters/Hero.js"
    "images/hero.png"
    "images/enemy.png"
    "audio/bgm.mp3"
)

echo "检查必需文件..."
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        MISSING_FILES+=("$file")
        echo "❌ 缺少文件: $file"
    else
        echo "✅ 存在: $file"
    fi
done

# 4. 生成构建报告
echo ""
echo "📊 构建检查报告"
echo "==============="

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "🎉 构建检查通过！"
    echo ""
    echo "📁 项目位置: $(pwd)"
    echo "🎮 下一步操作:"
    echo "   1. 在微信开发者工具中直接打开当前目录"
    echo "   2. 进行本地预览测试"
    echo "   3. 如无问题可上传审核"
    echo ""
    echo "⏰ 检查时间: $(date)"
    
    # 生成构建日志
    echo "$(date): 构建检查成功 - 当前目录" >> build.log
    exit 0
else
    echo "❌ 构建检查失败！缺少 ${#MISSING_FILES[@]} 个文件:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "💡 请检查文件是否存在"
    
    # 记录构建失败
    echo "$(date): 构建检查失败 - 缺少文件" >> build.log
    exit 1
fi