/**
 * 思齐贪吃蛇 - 游戏主类
 * 负责游戏的核心逻辑和状态管理
 */

const Snake = require('./Snake');
const { Food, FoodType } = require('./Food');
const { ParticleManager } = require('./ParticleManager');
const { UIManager, UIState } = require('./UIManager');
const InputManager = require('./InputManager');
const { GAME_CONSTANTS, GameUtils } = require('../utils/game-utils');
const { StorageManager } = require('../utils/storage');

/**
 * 游戏状态枚举
 */
const GameState = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
};

/**
 * 游戏主类
 */
class Game {
  /**
   * 创建游戏实例
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   */
  constructor(ctx, canvasWidth, canvasHeight) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // 计算网格大小
    this.calculateGridSize();

    // 游戏状态
    this.state = GameState.IDLE;

    // 游戏数据
    this.score = 0;
    this.highScore = StorageManager.getHighScore();
    this.lives = GAME_CONSTANTS.INITIAL_LIVES;

    // 游戏对象
    this.snake = new Snake(this.gridWidth, this.gridHeight);
    this.food = new Food();
    this.particleManager = new ParticleManager();

    // UI管理
    this.uiManager = new UIManager(this);

    // 输入管理
    this.inputManager = new InputManager(
      this.handleDirectionChange.bind(this),
      this.handlePause.bind(this)
    );

    // 生命道具相关
    this.lastLifeItemScore = 0;

    // 动画帧
    this.animationFrameId = null;
    this.lastFrameTime = 0;

    // 绑定事件
    this.bindEvents();
  }

  /**
   * 计算网格大小
   */
  calculateGridSize() {
    // 根据画布大小计算网格
    const aspectRatio = this.canvasWidth / this.canvasHeight;
    const gridHeight = 30; // 固定高度
    const gridWidth = Math.floor(gridHeight * aspectRatio);

    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.cellSize = this.canvasHeight / gridHeight;
    this.offsetX = (this.canvasWidth - gridWidth * this.cellSize) / 2;
    this.offsetY = 0;
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 微信小程序环境
    if (typeof wx !== 'undefined') {
      wx.onResize(this.handleResize.bind(this));
    }
  }

  /**
   * 处理窗口大小变化
   */
  handleResize() {
    // 重新计算网格大小
    this.calculateGridSize();
  }

  /**
   * 处理方向改变
   * @param {string} direction - 新方向
   */
  handleDirectionChange(direction) {
    if (this.state === GameState.PLAYING) {
      this.snake.changeDirection(direction);
    }
  }

  /**
   * 处理暂停
   */
  handlePause() {
    if (this.state === GameState.PLAYING) {
      this.pause();
    } else if (this.state === GameState.PAUSED) {
      this.resume();
    }
  }

  /**
   * 开始游戏
   */
  start() {
    // 重置游戏数据
    this.score = 0;
    this.lives = GAME_CONSTANTS.INITIAL_LIVES;
    this.lastLifeItemScore = 0;

    // 重置蛇
    this.snake = new Snake(this.gridWidth, this.gridHeight);

    // 生成食物
    this.food = new Food();
    this.food.generate(this.snake.getBody(), [], this.gridWidth, this.gridHeight);

    // 清空粒子
    this.particleManager.clear();

    // 更新UI
    this.uiManager.setTargetScore(0);
    this.uiManager.setState(UIState.PLAYING);

    // 设置状态
    this.state = GameState.PLAYING;

    // 播放开始效果
    const head = this.snake.getHead();
    const headX = head.x * this.cellSize + this.offsetX + this.cellSize / 2;
    const headY = head.y * this.cellSize + this.offsetY + this.cellSize / 2;
    this.particleManager.emitStartEffect(headX, headY);

    // 开始游戏循环
    this.lastFrameTime = Date.now();
    this.gameLoop();
  }

  /**
   * 外部调用：开始游戏循环（由game.js控制）
   */
  startLoop() {
    this.lastFrameTime = Date.now();
    this.gameLoop();
  }

  /**
   * 外部调用：停止游戏循环
   */
  stopLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 暂停游戏
   */
  pause() {
    this.state = GameState.PAUSED;
    this.uiManager.setState(UIState.PAUSED);

    // 取消动画帧
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 继续游戏
   */
  resume() {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.uiManager.setState(UIState.PLAYING);
      this.lastFrameTime = Date.now();
      this.gameLoop();
    }
  }

  /**
   * 重新开始游戏
   */
  restart() {
    this.start();
  }

  /**
   * 返回主菜单
   */
  backToMenu() {
    // 取消动画帧
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // 设置状态
    this.state = GameState.IDLE;
    this.uiManager.setState(UIState.MENU);
  }

  /**
   * 游戏主循环
   */
  gameLoop() {
    if (this.state !== GameState.PLAYING) {
      return;
    }

    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // 更新游戏
    this.update(deltaTime);

    // 绘制游戏
    this.draw();

    // 继续循环
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * 更新游戏状态
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    // 更新蛇
    const moveResult = this.snake.update(Date.now());

    // 检查移动结果
    if (moveResult === null) {
      // 撞墙或撞自己
      this.handleDeath();
      return;
    }

    // 检查是否吃到食物
    const head = this.snake.getHead();
    if (this.food.isEaten(head)) {
      this.handleEatFood();
    }

    // 更新速度（根据分数）
    const newSpeed = GameUtils.calculateSpeed(this.score);
    this.snake.setSpeed(newSpeed);

    // 检查是否应该出现生命道具
    if (GameUtils.shouldSpawnLifeItem(this.score, this.lastLifeItemScore)) {
      this.spawnLifeItem();
      this.lastLifeItemScore = this.score;
    }

    // 更新粒子
    this.particleManager.update(deltaTime);

    // 更新UI
    this.uiManager.setTargetScore(this.score);
    this.uiManager.update(deltaTime);

    // 更新食物动画
    this.food.update(deltaTime);
  }

  /**
   * 处理吃到食物
   */
  handleEatFood() {
    // 获取分数
    const foodScore = this.food.getScore();
    this.score += foodScore;

    // 播放粒子效果
    const foodX = this.food.x * this.cellSize + this.offsetX + this.cellSize / 2;
    const foodY = this.food.y * this.cellSize + this.offsetY + this.cellSize / 2;

    if (this.food.type === FoodType.LIFE) {
      this.particleManager.emitLifeEffect(foodX, foodY);
      // 恢复生命
      if (this.lives < GAME_CONSTANTS.MAX_LIVES) {
        this.lives++;
      }
    } else {
      this.particleManager.emitEatEffect(foodX, foodY, this.food.getColor());
    }

    // 蛇身增长
    this.snake.grow();

    // 生成新食物
    this.food = new Food();
    this.food.generate(this.snake.getBody(), [], this.gridWidth, this.gridHeight);

    // 检查是否解锁穿墙能力
    if (GameUtils.canWallPass(this.score) && !this.snake.canWallPass) {
      this.snake.enableWallPass();
    }
  }

  /**
   * 生成生命道具
   */
  spawnLifeItem() {
    if (this.lives >= GAME_CONSTANTS.MAX_LIVES) {
      return; // 生命已满，不生成
    }

    this.food = new Food(FoodType.LIFE);
    this.food.generate(this.snake.getBody(), [], this.gridWidth, this.gridHeight);
  }

  /**
   * 处理死亡
   */
  handleDeath() {
    // 减少生命
    this.lives--;

    if (this.lives <= 0) {
      // 游戏结束
      this.gameOver();
    } else {
      // 重置蛇的位置
      this.snake.reset();

      // 播放死亡效果
      const head = this.snake.getHead();
      const headX = head.x * this.cellSize + this.offsetX + this.cellSize / 2;
      const headY = head.y * this.cellSize + this.offsetY + this.cellSize / 2;
      this.particleManager.emitGameOverEffect(headX, headY);

      // 重新生成食物
      this.food = new Food();
      this.food.generate(this.snake.getBody(), [], this.gridWidth, this.gridHeight);
    }
  }

  /**
   * 游戏结束
   */
  gameOver() {
    // 设置状态
    this.state = GameState.GAME_OVER;
    this.uiManager.setState(UIState.GAME_OVER);

    // 更新最高分
    if (this.score > this.highScore) {
      this.highScore = this.score;
      StorageManager.setHighScore(this.highScore);
    }

    // 更新统计数据
    StorageManager.incrementTotalGames();
    StorageManager.addTotalScore(this.score);

    // 播放游戏结束效果
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    this.particleManager.emitGameOverEffect(centerX, centerY);

    // 取消动画帧
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // 绘制最终画面
    this.draw();
  }

  /**
   * 绘制游戏
   */
  draw() {
    const ctx = this.ctx;
    const colors = GAME_CONSTANTS.COLORS;

    // 清空画布
    ctx.fillStyle = colors.BACKGROUND;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 绘制网格
    this.drawGrid();

    // 绘制游戏区域边框
    this.drawGameBorder();

    // 绘制食物
    this.food.draw(ctx, this.cellSize, this.offsetX, this.offsetY);

    // 绘制蛇
    this.snake.draw(ctx, this.cellSize, this.offsetX, this.offsetY);

    // 绘制粒子
    this.particleManager.draw(ctx);

    // 根据状态绘制UI
    switch (this.state) {
      case GameState.IDLE:
        this.uiManager.drawMenu(ctx, this.canvasWidth, this.canvasHeight);
        break;
      case GameState.PLAYING:
        this.uiManager.drawGame(ctx, this.canvasWidth, this.canvasHeight);
        break;
      case GameState.PAUSED:
        this.uiManager.drawGame(ctx, this.canvasWidth, this.canvasHeight);
        this.uiManager.drawPaused(ctx, this.canvasWidth, this.canvasHeight);
        break;
      case GameState.GAME_OVER:
        this.uiManager.drawGameOver(ctx, this.canvasWidth, this.canvasHeight);
        break;
    }
  }

  /**
   * 绘制网格
   */
  drawGrid() {
    const ctx = this.ctx;
    const colors = GAME_CONSTANTS.COLORS;

    ctx.strokeStyle = colors.GRID;
    ctx.lineWidth = 0.5;

    // 绘制垂直线
    for (let x = 0; x <= this.gridWidth; x++) {
      const xPos = x * this.cellSize + this.offsetX;
      ctx.beginPath();
      ctx.moveTo(xPos, this.offsetY);
      ctx.lineTo(xPos, this.offsetY + this.gridHeight * this.cellSize);
      ctx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= this.gridHeight; y++) {
      const yPos = y * this.cellSize + this.offsetY;
      ctx.beginPath();
      ctx.moveTo(this.offsetX, yPos);
      ctx.lineTo(this.offsetX + this.gridWidth * this.cellSize, yPos);
      ctx.stroke();
    }
  }

  /**
   * 绘制游戏区域边框
   */
  drawGameBorder() {
    const ctx = this.ctx;
    const colors = GAME_CONSTANTS.COLORS;

    ctx.strokeStyle = colors.SNAKE_HEAD;
    ctx.lineWidth = 2;

    const x = this.offsetX;
    const y = this.offsetY;
    const width = this.gridWidth * this.cellSize;
    const height = this.gridHeight * this.cellSize;

    ctx.strokeRect(x, y, width, height);
  }

  /**
   * 处理点击事件
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {string|null} 按钮ID或null
   */
  handleClick(x, y) {
    const buttonId = this.uiManager.handleClick(x, y, this.canvasWidth, this.canvasHeight);

    if (buttonId) {
      this.handleButtonClick(buttonId);
    }

    return buttonId;
  }

  /**
   * 处理按钮点击
   * @param {string} buttonId - 按钮ID
   */
  handleButtonClick(buttonId) {
    switch (buttonId) {
      case 'start':
        this.start();
        break;
      case 'settings':
        this.uiManager.setState(UIState.MENU); // 暂时不实现设置界面
        break;
      case 'pause':
        this.handlePause();
        break;
      case 'continue':
        this.resume();
        break;
      case 'restart':
        this.restart();
        break;
      case 'menu':
        this.backToMenu();
        break;
    }
  }

  /**
   * 销毁游戏
   */
  destroy() {
    // 取消动画帧
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // 销毁输入管理器
    if (this.inputManager) {
      this.inputManager.destroy();
    }
  }
}

// 导出
module.exports = {
  Game,
  GameState
};
