#!/bin/bash

# 微信小游戏兼容性检查脚本

echo "🔍 开始检查微信小游戏兼容性..."

# 检查CSS兼容性
echo "🎨 检查CSS兼容性..."
css_issues=0

# 检查是否存在不兼容的CSS属性
if grep -r "gap:" . --include="*.css" --include="*.wxss" > /dev/null 2>&1; then
    echo "❌ 发现不兼容的CSS属性: gap"
    ((css_issues++))
fi

# 检查是否缺少webkit前缀
if grep -r "transform:" . --include="*.css" --include="*.wxss" | grep -v "\-webkit\-transform" > /dev/null 2>&1; then
    echo "⚠️  发现可能缺少-webkit-前缀的transform属性"
fi

if grep -r "flex:" . --include="*.css" --include="*.wxss" | grep -v "\-webkit\-flex" > /dev/null 2>&1; then
    echo "⚠️  发现可能缺少-webkit-前缀的flex属性"
fi

# 检查JavaScript兼容性
echo "💻 检查JavaScript兼容性..."
js_issues=0

# 检查ES6+语法兼容性
if grep -r "async " . --include="*.js" > /dev/null 2>&1; then
    echo "⚠️  发现async/await语法，需确认微信基础库版本支持"
fi

if grep -r "=>" . --include="*.js" | grep -v "function\|return\|{" > /dev/null 2>&1; then
    echo "⚠️  发现箭头函数，需确认微信基础库版本支持"
fi

# 检查微信API使用
echo "📱 检查微信API使用..."
api_issues=0

# 检查是否存在废弃的API
if grep -r "wx\.ready" . --include="*.js" > /dev/null 2>&1; then
    echo "❌ 发现废弃的API: wx.ready，应使用wx.onLaunch"
    ((api_issues++))
fi

# 检查配置文件完整性
echo "📄 检查配置文件..."
config_issues=0

required_configs=("game.json" "project.config.json" "project.private.config.json")

for config in "${required_configs[@]}"; do
    if [[ ! -f "$config" ]]; then
        echo "❌ 缺少必需配置文件: $config"
        ((config_issues++))
    fi
done

# 检查入口文件
if [[ ! -f "game.js" ]]; then
    echo "❌ 缺少入口文件: game.js"
    ((config_issues++))
fi

# 生成兼容性报告
echo ""
echo "📊 兼容性检查报告:"
echo "=================="

total_issues=$((css_issues + js_issues + api_issues + config_issues))

if [ $total_issues -eq 0 ]; then
    echo "✅ 所有检查项通过！项目符合微信小游戏规范。"
    exit 0
else
    echo "❌ 发现 $total_issues 个兼容性问题:"
    echo "   - CSS问题: $css_issues 个"
    echo "   - JS兼容性问题: $js_issues 个" 
    echo "   - API使用问题: $api_issues 个"
    echo "   - 配置文件问题: $config_issues 个"
    echo ""
    echo "💡 建议修复以上问题后再进行真机调试。"
    exit 1
fi