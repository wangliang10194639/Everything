/**
 * 思齐贪吃蛇 - 游戏主入口
 * 微信小游戏入口文件
 */

// 导入游戏模块
const { Game, GameState } = require('./modules/Game');

// 游戏实例
let game = null;
let canvas = null;
let ctx = null;

/**
 * 游戏初始化
 */
function init() {
  console.log('思齐贪吃蛇 - 初始化');

  // 获取画布
  canvas = wx.createCanvas();
  ctx = canvas.getContext('2d');

  // 设置画布尺寸
  resizeCanvas();

  // 监听窗口大小变化
  wx.onResize(resizeCanvas);

  // 创建游戏实例
  game = new Game(ctx, canvas.width, canvas.height);

  // 绘制初始界面
  game.draw();

  // 绑定触摸事件
  bindTouchEvents();

  console.log('思齐贪吃蛇 - 初始化完成');
}

/**
 * 调整画布尺寸
 */
function resizeCanvas() {
  if (canvas && wx.getWindowInfo) {
    const windowInfo = wx.getWindowInfo();
    canvas.width = windowInfo.windowWidth;
    canvas.height = windowInfo.windowHeight;

    // 重新计算游戏网格
    if (game) {
      game.canvasWidth = canvas.width;
      game.canvasHeight = canvas.height;
      game.calculateGridSize();
      game.draw();
    }
  }
}

/**
 * 绑定触摸事件
 */
function bindTouchEvents() {
  // 触摸开始事件
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    handleTouch(touch.clientX, touch.clientY);
  });

  // 触摸移动事件（用于滑动控制）
  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
  });

  // 触摸结束事件
  canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
  });

  // 点击事件（用于按钮点击）
  canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (game) {
      const buttonId = game.handleClick(x, y);
      if (buttonId) {
        console.log('按钮点击:', buttonId);
      }
    }
  });
}

/**
 * 处理触摸
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function handleTouch(x, y) {
  if (!game) return;

  // 根据游戏状态处理触摸
  switch (game.state) {
    case GameState.IDLE:
      // 主菜单状态
      const menuButtonId = game.uiManager.handleClick(x, y, canvas.width, canvas.height);
      if (menuButtonId) {
        game.handleButtonClick(menuButtonId);
      }
      break;

    case GameState.PLAYING:
      // 游戏进行中
      game.handlePause();
      break;

    case GameState.PAUSED:
      // 暂停状态
      const pausedButtonId = game.uiManager.handleClick(x, y, canvas.width, canvas.height);
      if (pausedButtonId) {
        game.handleButtonClick(pausedButtonId);
      }
      break;

    case GameState.GAME_OVER:
      // 游戏结束状态
      const gameOverButtonId = game.uiManager.handleClick(x, y, canvas.width, canvas.height);
      if (gameOverButtonId) {
        game.handleButtonClick(gameOverButtonId);
      }
      break;
  }
}

// 导出模块
module.exports = {
  init,
  game
};

// 微信小游戏生命周期
wx.onLoad(function() {
  init();
});

wx.onShow(function() {
  // 游戏显示时恢复
  if (game && game.state === GameState.PAUSED) {
    game.resume();
  }
});

wx.onHide(function() {
  // 游戏隐藏时暂停
  if (game && game.state === GameState.PLAYING) {
    game.pause();
  }
});

wx.onUnload(function() {
  // 游戏卸载时清理
  if (game) {
    game.destroy();
  }
});
