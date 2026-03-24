// 微信小游戏模块路径测试
// 用于测试不同的导入方式在微信环境中的表现

console.log('=== 微信小游戏模块路径测试 ===');

// 测试不同的导入方式
const testCases = [
  {
    name: '相对路径 ./scenes/GameScene',
    importStatement: "import GameScene from './scenes/GameScene';",
    expected: '可能解析为 js/scenes/GameScene.js'
  },
  {
    name: '无前缀路径 scenes/GameScene', 
    importStatement: "import GameScene from 'scenes/GameScene';",
    expected: '可能解析为 scenes/GameScene.js'
  },
  {
    name: '绝对路径 /js/scenes/GameScene',
    importStatement: "import GameScene from '/js/scenes/GameScene';",
    expected: '可能解析为 /js/scenes/GameScene.js'
  },
  {
    name: '完整路径 js/scenes/GameScene',
    importStatement: "import GameScene from 'js/scenes/GameScene';",
    expected: '可能解析为 js/scenes/GameScene.js'
  }
];

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   导入语句: ${testCase.importStatement}`);
  console.log(`   期望解析: ${testCase.expected}`);
  console.log('');
});

console.log('建议在微信开发者工具中逐一测试以上导入方式');
console.log('观察控制台输出的错误信息来确定正确的路径格式');