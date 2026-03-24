/**
 * 思齐贪吃蛇 - UI管理器
 * 负责游戏UI的绘制和交互
 */

const { GAME_CONSTANTS, GameUtils } = require('../utils/game-utils');

/**
 * UI状态枚举
 */
const UIState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
};

/**
 * UI管理器
 */
class UIManager {
  /**
   * 创建UI管理器
   * @param {object} game - 游戏实例
   */
  constructor(game) {
    this.game = game;
    this.state = UIState.MENU;

    // 按钮区域
    this.buttons = [];

    // 动画相关
    this.scoreAnimation = 0;
    this.targetScore = 0;
    this.livesAnimation = [];

    // 字体设置
    this.fontFamily = 'Arial, sans-serif';
  }

  /**
   * 设置UI状态
   * @param {string} state - UI状态
   */
  setState(state) {
    this.state = state;
  }

  /**
   * 更新UI动画
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    // 分数动画
    if (this.scoreAnimation !== this.targetScore) {
      const diff = this.targetScore - this.scoreAnimation;
      this.scoreAnimation += diff * 0.2;
      if (Math.abs(diff) < 0.5) {
        this.scoreAnimation = this.targetScore;
      }
    }

    // 生命动画
    this.livesAnimation = this.livesAnimation.map((animated, index) => {
      const target = index < this.game.lives ? 1 : 0;
      return animated + (target - animated) * 0.2;
    });
  }

  /**
   * 设置目标分数
   * @param {number} score - 分数
   */
  setTargetScore(score) {
    this.targetScore = score;
  }

  /**
   * 绘制主菜单
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   */
  drawMenu(ctx, canvasWidth, canvasHeight) {
    const colors = GAME_CONSTANTS.COLORS;

    // 绘制背景
    ctx.fillStyle = colors.BACKGROUND;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制标题
    ctx.fillStyle = colors.TEXT_WHITE;
    ctx.font = `bold ${canvasWidth * 0.1}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐍 思齐贪吃蛇', canvasWidth / 2, canvasHeight * 0.2);

    // 绘制最高分
    const highScore = this.game.highScore;
    ctx.fillStyle = colors.TEXT_SECONDARY;
    ctx.font = `${canvasWidth * 0.04}px ${this.fontFamily}`;
    ctx.fillText(`最高分: ${GameUtils.formatScore(highScore)}`, canvasWidth / 2, canvasHeight * 0.32);

    // 绘制开始按钮
    this.drawButton(ctx, canvasWidth / 2, canvasHeight * 0.5, canvasWidth * 0.5, canvasHeight * 0.1, '🎮 开始游戏', colors.BUTTON_PRIMARY);

    // 绘制设置按钮
    this.drawButton(ctx, canvasWidth / 2, canvasHeight * 0.65, canvasWidth * 0.4, canvasHeight * 0.08, '⚙️ 设置', colors.BUTTON_SECONDARY);

    // 绘制说明
    ctx.fillStyle = colors.TEXT_SECONDARY;
    ctx.font = `${canvasWidth * 0.03}px ${this.fontFamily}`;
    ctx.fillText('滑动屏幕或使用方向键控制', canvasWidth / 2, canvasHeight * 0.8);
    ctx.fillText('点击屏幕暂停游戏', canvasWidth / 2, canvasHeight * 0.85);
  }

  /**
   * 绘制游戏界面
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   */
  drawGame(ctx, canvasWidth, canvasHeight) {
    const colors = GAME_CONSTANTS.COLORS;

    // 绘制顶部信息栏
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.08);

    // 绘制分数
    ctx.fillStyle = colors.TEXT_WHITE;
    ctx.font = `bold ${canvasWidth * 0.05}px ${this.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`得分: ${Math.floor(this.scoreAnimation)}`, 20, canvasHeight * 0.04);

    // 绘制最高分
    ctx.textAlign = 'right';
    ctx.fillText(`最高: ${GameUtils.formatScore(this.game.highScore)}`, canvasWidth - 20, canvasHeight * 0.04);

    // 绘制生命值
    this.drawLives(ctx, canvasWidth, canvasHeight);

    // 绘制穿墙能力指示
    if (this.game.snake && this.game.snake.isWallPassAvailable()) {
      this.drawWallPassIndicator(ctx, canvasWidth, canvasHeight);
    }
  }

  /**
   * 绘制生命值
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   */
  drawLives(ctx, canvasWidth, canvasHeight) {
    const colors = GAME_CONSTANTS.COLORS;
    const heartSize = canvasWidth * 0.05;
    const startX = canvasWidth / 2 - heartSize * 1.5;
    const y = canvasHeight * 0.04;

    ctx.textAlign = 'center';
    ctx.font = `${canvasWidth * 0.03}px ${this.fontFamily}`;
    ctx.fillText('生命:', startX - heartSize, y);

    for (let i = 0; i < 3; i++) {
      const x = startX + heartSize * (i + 1.5);
      const scale = this.livesAnimation[i] || 0;

      if (scale > 0.1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        this.drawHeart(ctx, 0, 0, heartSize * 0.8, colors.FOOD_LIFE);
        ctx.restore();
      }
    }
  }

  /**
   * 绘制穿墙能力指示
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   */
  drawWallPassIndicator(ctx, canvasWidth, canvasHeight) {
    const colors = GAME_CONSTANTS.COLORS;

    ctx.fillStyle = '#fbbf24';
    ctx.font = `${canvasWidth * 0.03}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('🌀 穿墙可用', canvasWidth / 2, canvasHeight * 0.075);
  }

  /**
   * 绘制暂停界面
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   */
  drawPaused(ctx, canvasWidth, canvasHeight) {
    const colors = GAME_CONSTANTS.COLORS;

    // 绘制半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制暂停标题
    ctx.fillStyle = colors.TEXT_WHITE;
    ctx.font = `bold ${canvasWidth * 0.08}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('暂停', canvasWidth / 2, canvasHeight * 0.35);

    // 绘制继续按钮
    this.drawButton(ctx, canvasWidth / 2, canvasHeight * 0.5, canvasWidth * 0.4, canvasHeight * 0.08, '▶️ 继续', colors.BUTTON_PRIMARY);

    // 绘制重新开始按钮
    this.drawButton(ctx, canvasWidth / 2, canvasHeight * 0.62, canvasWidth * 0.4, canvasHeight * 0.08, '🔄 重新开始', colors.BUTTON_SECONDARY);

    // 绘制返回菜单按钮
    this.drawButton(ctx, canvasWidth / 2, canvasHeight * 0.74, canvasWidth * 0.4, canvasHeight * 0.08, '🏠 返回菜单', colors.BUTTON_SECONDARY);
  }

  /**
   * 绘制游戏结束界面
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   */
  drawGameOver(ctx, canvasWidth, canvasHeight) {
    const colors = GAME_CONSTANTS.COLORS;

    // 绘制半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制游戏结束标题
    ctx.fillStyle = colors.FOOD_NORMAL;
    ctx.font = `bold ${canvasWidth * 0.1}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', canvasWidth / 2, canvasHeight * 0.25);

    // 绘制最终分数
    ctx.fillStyle = colors.TEXT_WHITE;
    ctx.font = `${canvasWidth * 0.06}px ${this.fontFamily}`;
    ctx.fillText(`得分: ${Math.floor(this.scoreAnimation)}`, canvasWidth / 2, canvasHeight * 0.4);

    // 绘制最高分
    if (this.game.score > this.game.highScore) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = `${canvasWidth * 0.04}px ${this.fontFamily}`;
      ctx.fillText('🎉 新纪录!', canvasWidth / 2, canvasHeight * 0.5);
    }

    ctx.fillStyle = colors.TEXT_SECONDARY;
    ctx.fillText(`最高分: ${GameUtils.formatScore(this.game.highScore)}`, canvasWidth / 2, canvasHeight * 0.58);

    // 绘制重新开始按钮
    this.drawButton(ctx, canvasWidth / 2, canvasHeight * 0.72, canvasWidth * 0.5, canvasHeight * 0.1, '🔄 再来一局', colors.BUTTON_PRIMARY);

    // 绘制返回菜单按钮
    this.drawButton(ctx, canvasWidth / 2, canvasHeight * 0.85, canvasWidth * 0.4, canvasHeight * 0.08, '🏠 返回菜单', colors.BUTTON_SECONDARY);
  }

  /**
   * 绘制按钮
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {string} text - 按钮文字
   * @param {string} color - 按钮颜色
   */
  drawButton(ctx, x, y, width, height, text, color) {
    const radius = height * 0.2;

    // 绘制按钮背景
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height, radius);
    ctx.fill();

    // 绘制按钮文字
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${height * 0.4}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  /**
   * 绘制心形
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} size - 大小
   * @param {string} color - 颜色
   */
  drawHeart(ctx, x, y, size, color) {
    const heartSize = size / 2;

    ctx.fillStyle = color;
    ctx.beginPath();

    const topCurveHeight = heartSize * 0.3;
    ctx.moveTo(x, y + heartSize * 0.2);

    ctx.bezierCurveTo(
      x - heartSize, y - heartSize * 0.3,
      x - heartSize * 1.2, y + heartSize * 0.5,
      x, y + heartSize
    );

    ctx.bezierCurveTo(
      x + heartSize * 1.2, y + heartSize * 0.5,
      x + heartSize, y - heartSize * 0.3,
      x, y + heartSize * 0.2
    );

    ctx.fill();
  }

  /**
   * 绘制设置界面
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   */
  drawSettings(ctx, canvasWidth, canvasHeight) {
    const colors = GAME_CONSTANTS.COLORS;

    // 绘制背景
    ctx.fillStyle = colors.BACKGROUND;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制标题
    ctx.fillStyle = colors.TEXT_WHITE;
    ctx.font = `bold ${canvasWidth * 0.08}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('设置', canvasWidth / 2, canvasHeight * 0.15);

    // 绘制返回按钮
    this.drawButton(ctx, canvasWidth / 2, canvasHeight * 0.9, canvasWidth * 0.3, canvasHeight * 0.08, '🔙 返回', colors.BUTTON_SECONDARY);
  }

  /**
   * 处理按钮点击
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   * @returns {string|null} 点击的按钮ID或null
   */
  handleClick(x, y, canvasWidth, canvasHeight) {
    // 根据当前状态处理点击
    switch (this.state) {
      case UIState.MENU:
        return this.handleMenuClick(x, y, canvasWidth, canvasHeight);
      case UIState.PLAYING:
        return this.handlePlayingClick(x, y, canvasWidth, canvasHeight);
      case UIState.PAUSED:
        return this.handlePausedClick(x, y, canvasWidth, canvasHeight);
      case UIState.GAME_OVER:
        return this.handleGameOverClick(x, y, canvasWidth, canvasHeight);
    }
    return null;
  }

  /**
   * 处理主菜单点击
   */
  handleMenuClick(x, y, canvasWidth, canvasHeight) {
    const startButton = {
      x: canvasWidth / 2 - canvasWidth * 0.25,
      y: canvasHeight * 0.5 - canvasHeight * 0.05,
      width: canvasWidth * 0.5,
      height: canvasHeight * 0.1,
      id: 'start'
    };

    const settingsButton = {
      x: canvasWidth / 2 - canvasWidth * 0.2,
      y: canvasHeight * 0.65 - canvasHeight * 0.04,
      width: canvasWidth * 0.4,
      height: canvasHeight * 0.08,
      id: 'settings'
    };

    if (this.isInButton(x, y, startButton)) return 'start';
    if (this.isInButton(x, y, settingsButton)) return 'settings';
    return null;
  }

  /**
   * 处理游戏界面点击
   */
  handlePlayingClick(x, y, canvasWidth, canvasHeight) {
    // 游戏进行中点击不处理（用于暂停）
    return 'pause';
  }

  /**
   * 处理暂停界面点击
   */
  handlePausedClick(x, y, canvasWidth, canvasHeight) {
    const continueButton = {
      x: canvasWidth / 2 - canvasWidth * 0.2,
      y: canvasHeight * 0.5 - canvasHeight * 0.04,
      width: canvasWidth * 0.4,
      height: canvasHeight * 0.08,
      id: 'continue'
    };

    const restartButton = {
      x: canvasWidth / 2 - canvasWidth * 0.2,
      y: canvasHeight * 0.62 - canvasHeight * 0.04,
      width: canvasWidth * 0.4,
      height: canvasHeight * 0.08,
      id: 'restart'
    };

    const menuButton = {
      x: canvasWidth / 2 - canvasWidth * 0.2,
      y: canvasHeight * 0.74 - canvasHeight * 0.04,
      width: canvasWidth * 0.4,
      height: canvasHeight * 0.08,
      id: 'menu'
    };

    if (this.isInButton(x, y, continueButton)) return 'continue';
    if (this.isInButton(x, y, restartButton)) return 'restart';
    if (this.isInButton(x, y, menuButton)) return 'menu';
    return null;
  }

  /**
   * 处理游戏结束界面点击
   */
  handleGameOverClick(x, y, canvasWidth, canvasHeight) {
    const restartButton = {
      x: canvasWidth / 2 - canvasWidth * 0.25,
      y: canvasHeight * 0.72 - canvasHeight * 0.05,
      width: canvasWidth * 0.5,
      height: canvasHeight * 0.1,
      id: 'restart'
    };

    const menuButton = {
      x: canvasWidth / 2 - canvasWidth * 0.2,
      y: canvasHeight * 0.85 - canvasHeight * 0.04,
      width: canvasWidth * 0.4,
      height: canvasHeight * 0.08,
      id: 'menu'
    };

    if (this.isInButton(x, y, restartButton)) return 'restart';
    if (this.isInButton(x, y, menuButton)) return 'menu';
    return null;
  }

  /**
   * 检查点击是否在按钮区域内
   */
  isInButton(x, y, button) {
    return x >= button.x &&
           x <= button.x + button.width &&
           y >= button.y &&
           y <= button.y + button.height;
  }
}

// 导出
module.exports = {
  UIManager,
  UIState
};
