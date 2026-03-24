#!/bin/bash

# 弹弓射手项目清理脚本
# 检测并处理可能的微信默认模板冲突文件

echo "🧹 开始项目清理和冲突检测..."

# 定义可能的冲突文件列表
CONFLICT_FILES=(
    "js/player/index.js"
    "js/player/bullet.js" 
    "js/npc/enemy.js"
    "js/databus.js"
)

# 定义我们的核心文件列表
CORE_FILES=(
    "js/characters/Hero.js"
    "js/characters/Enemy.js"
    "js/controllers/SlingShotController.js"
    "js/managers/LevelManager.js"
    "js/scenes/GameScene.js"
    "js/main.js"
)

echo "🔍 检测潜在冲突文件..."

CONFLICTS_FOUND=false

# 检查冲突文件是否存在
for file in "${CONFLICT_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "⚠️  发现可能的冲突文件: $file"
        CONFLICTS_FOUND=true
        
        # 检查是否被其他文件引用
        REFERENCE_COUNT=$(grep -r "$file" . --exclude-dir=node_modules --exclude-dir=.git | wc -l)
        if [[ $REFERENCE_COUNT -gt 0 ]]; then
            echo "   ⚠️  该文件被其他文件引用 $REFERENCE_COUNT 次"
        else
            echo "   ✅ 该文件未被引用，可以安全删除"
        fi
    fi
done

echo ""
echo "✅ 检查核心文件..."

# 检查核心文件是否存在
for file in "${CORE_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ 存在: $file"
    else
        echo "❌ 缺少: $file"
    fi
done

echo ""
echo "📊 冲突分析报告:"
echo "================"

if [[ "$CONFLICTS_FOUND" == true ]]; then
    echo "⚠️  发现潜在冲突文件，建议处理方案："
    echo "   1. 删除未被引用的默认模板文件"
    echo "   2. 确保使用我们自己的实现文件"
    echo "   3. 运行构建检查验证"
else
    echo "✅ 未发现明显冲突文件"
fi

echo ""
echo "🔧 建议的清理操作："

# 生成具体的清理命令
CLEANUP_COMMANDS=()

for file in "${CONFLICT_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        REFERENCE_COUNT=$(grep -r "$file" . --exclude-dir=node_modules --exclude-dir=.git | wc -l)
        if [[ $REFERENCE_COUNT -eq 0 ]]; then
            CLEANUP_COMMANDS+=("rm $file")
        fi
    fi
done

if [[ ${#CLEANUP_COMMANDS[@]} -gt 0 ]]; then
    echo "可以执行以下清理命令："
    for cmd in "${CLEANUP_COMMANDS[@]}"; do
        echo "   $cmd"
    done
else
    echo "暂无可自动清理的文件"
fi

echo ""
echo "🧪 运行兼容性检查..."
./check_compatibility.sh

echo ""
echo "🔨 运行构建检查..."  
./build.sh

echo ""
echo "📋 清理完成！请检查上述报告并根据需要执行清理操作。"