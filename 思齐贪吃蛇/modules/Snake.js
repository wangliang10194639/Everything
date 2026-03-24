/**
 * 思齐贪吃蛇 - 蛇类
 * 负责蛇的移动、增长、碰撞检测和绘制
 */

const { GAME_CONSTANTS, GameUtils } = require('../utils/game-utils');

/**
 * 蛇类
 */
class Snake {
  /**
   * 创建蛇
   * @param {number} gridWidth - 网格宽度
   * @param {number} gridHeight - 网格高度
   */
  constructor(gridWidth, gridHeight) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // 初始化蛇身（从中间开始）
    const startX = Math.floor(gridWidth / 2);
    const startY = Math.floor(gridHeight / 2);
    this.body = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];

    // 方向控制
    this.direction = 'right';
    this.nextDirection = 'right';

    // 速度控制
    this.speed = GAME_CONSTANTS.INITIAL_SPEED;
    this.lastMoveTime = 0;

    // 穿墙能力
    this.canWallPass = false;
    this.wallPassAvailable = false;

    // 动画相关
    this.animationOffset = 0;
  }

  /**
   * 更新蛇的状态
   * @param {number} currentTime - 当前时间戳
   * @returns {boolean} 是否移动成功
   */
  update(currentTime) {
    // 检查是否到达移动时间
    if (currentTime - this.lastMoveTime < this.speed) {
      return false;
    }

    // 更新方向
    this.direction = this.nextDirection;

    // 计算新头部位置
    const head = this.body[0];
    let newHead = { x: head.x, y: head.y };

    switch (this.direction) {
      case 'up':
        newHead.y -= 1;
        break;
      case 'down':
        newHead.y += 1;
        break;
      case 'left':
        newHead.x -= 1;
        break;
      case 'right':
        newHead.x += 1;
        break;
    }

    // 穿墙处理
    if (this.canWallPass && this.wallPassAvailable) {
      if (newHead.x < 0) newHead.x = this.gridWidth - 1;
      if (newHead.x >= this.gridWidth) newHead.x = 0;
      if (newHead.y < 0) newHead.y = this.gridHeight - 1;
      if (newHead.y >= this.gridHeight) newHead.y = 0;
    }

    // 检查是否撞墙（没有穿墙能力时）
    if (newHead.x < 0 || newHead.x >= this.gridWidth ||
        newHead.y < 0 || newHead.y >= this.gridHeight) {
      return null; // 撞墙死亡
    }

    // 检查是否撞到自己
    if (this.checkSelfCollision(newHead)) {
      return null; // 撞自己死亡
    }

    // 移动蛇身
    this.body.unshift(newHead);
    this.body.pop();

    // 更新动画偏移
    this.animationOffset = (this.animationOffset + 0.1) % (Math.PI * 2);

    this.lastMoveTime = currentTime;
    return true;
  }

  /**
   * 改变方向
   * @param {string} newDirection - 新方向
   */
  changeDirection(newDirection) {
    // 不能直接反向
    const oppositeDirection = GameUtils.getOppositeDirection(this.direction);
    if (newDirection !== oppositeDirection) {
      this.nextDirection = newDirection;
    }
  }

  /**
   * 蛇身增长
   */
  grow() {
    const tail = this.body[this.body.length - 1];
    this.body.push({ x: tail.x, y: tail.y });
  }

  /**
   * 检查是否撞到自己
   * @param {object} position - 位置
   * @returns {boolean} 是否撞到自己
   */
  checkSelfCollision(position) {
    // 跳过最后一段（它会移动）
    for (let i = 0; i < this.body.length - 1; i++) {
      if (this.body[i].x === position.x && this.body[i].y === position.y) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查是否撞到边界
   * @param {object} position - 位置
   * @returns {boolean} 是否撞到边界
   */
  checkWallCollision(position) {
    return position.x < 0 || position.x >= this.gridWidth ||
           position.y < 0 || position.y >= this.gridHeight;
  }

  /**
   * 设置速度
   * @param {number} speed - 速度（毫秒）
   */
  setSpeed(speed) {
    this.speed = Math.max(speed, GAME_CONSTANTS.MIN_SPEED);
  }

  /**
   * 启用穿墙能力
   */
  enableWallPass() {
    this.canWallPass = true;
    this.wallPassAvailable = true;
  }

  /**
   * 使用穿墙能力
   * @returns {boolean} 是否使用成功
   */
  useWallPass() {
    if (this.wallPassAvailable) {
      this.wallPassAvailable = false;
      return true;
    }
    return false;
  }

  /**
   * 检查穿墙能力是否可用
   * @returns {boolean} 是否可用
   */
  isWallPassAvailable() {
    return this.canWallPass && this.wallPassAvailable;
  }

  /**
   * 获取头部位置
   * @returns {object} 头部位置
   */
  getHead() {
    return this.body[0];
  }

  /**
   * 获取蛇身
   * @returns {Array} 蛇身数组
   */
  getBody() {
    return this.body;
  }

  /**
   * 获取长度
   * @returns {number} 长度
   */
  getLength() {
    return this.body.length;
  }

  /**
   * 重置蛇
   */
  reset() {
    const startX = Math.floor(this.gridWidth / 2);
    const startY = Math.floor(this.gridHeight / 2);
    this.body = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    this.direction = 'right';
    this.nextDirection = 'right';
    this.speed = GAME_CONSTANTS.INITIAL_SPEED;
    this.canWallPass = false;
    this.wallPassAvailable = false;
    this.animationOffset = 0;
  }

  /**
   * 绘制蛇
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} cellSize - 单元格大小
   * @param {number} offsetX - X偏移
   * @param {number} offsetY - Y偏移
   */
  draw(ctx, cellSize, offsetX = 0, offsetY = 0) {
    const colors = GAME_CONSTANTS.COLORS;

    // 绘制蛇身
    this.body.forEach((segment, index) => {
      const x = segment.x * cellSize + offsetX;
      const y = segment.y * cellSize + offsetY;
      const padding = 1;

      // 计算动画偏移（身体摆动效果）
      const waveOffset = Math.sin(this.animationOffset + index * 0.3) * 2;
      const animatedSize = cellSize - padding * 2 + (index === 0 ? 0 : waveOffset * 0.5);
      const animatedX = x + padding - (animatedSize - (cellSize - padding * 2)) / 2;
      const animatedY = y + padding - (animatedSize - (cellSize - padding * 2)) / 2;

      // 选择颜色
      let color;
      if (index === 0) {
        color = colors.SNAKE_HEAD;
      } else {
        // 渐变色效果
        const gradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
        gradient.addColorStop(0, colors.SNAKE_BODY);
        gradient.addColorStop(1, colors.SNAKE_HEAD);
        color = gradient;
      }

      // 绘制圆角矩形
      ctx.fillStyle = color;
      this.drawRoundedRect(ctx, animatedX, animatedY, animatedSize, animatedSize, 4);

      // 绘制眼睛（头部）
      if (index === 0) {
        this.drawEyes(ctx, segment, cellSize, offsetX, offsetY);
      }
    });

    // 绘制穿墙能力指示器
    if (this.isWallPassAvailable()) {
      const head = this.body[0];
      const x = head.x * cellSize + offsetX;
      const y = head.y * cellSize + offsetY;

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
    }
  }

  /**
   * 绘制圆角矩形
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 绘制眼睛
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {object} segment - 蛇身段
   * @param {number} cellSize - 单元格大小
   * @param {number} offsetX - X偏移
   * @param {number} offsetY - Y偏移
   */
  drawEyes(ctx, segment, cellSize, offsetX, offsetY) {
    const eyeSize = cellSize * 0.2;
    const eyeOffset = cellSize * 0.25;
    const x = segment.x * cellSize + offsetX;
    const y = segment.y * cellSize + offsetY;

    ctx.fillStyle = '#ffffff';

    // 根据方向绘制眼睛位置
    let eye1X, eye1Y, eye2X, eye2Y;

    switch (this.direction) {
      case 'up':
        eye1X = x + eyeOffset;
        eye1Y = y + eyeOffset;
        eye2X = x + cellSize - eyeOffset - eyeSize;
        eye2Y = y + eyeOffset;
        break;
      case 'down':
        eye1X = x + eyeOffset;
        eye1Y = y + cellSize - eyeOffset - eyeSize;
        eye2X = x + cellSize - eyeOffset - eyeSize;
        eye2Y = y + cellSize - eyeOffset - eyeSize;
        break;
      case 'left':
        eye1X = x + eyeOffset;
        eye1Y = y + eyeOffset;
        eye2X = x + eyeOffset;
        eye2Y = y + cellSize - eyeOffset - eyeSize;
        break;
      case 'right':
        eye1X = x + cellSize - eyeOffset - eyeSize;
        eye1Y = y + eyeOffset;
        eye2X = x + cellSize - eyeOffset - eyeSize;
        eye2Y = y + cellSize - eyeOffset - eyeSize;
        break;
    }

    // 绘制眼睛
    ctx.beginPath();
    ctx.arc(eye1X + eyeSize / 2, eye1Y + eyeSize / 2, eyeSize / 2, 0, Math.PI * 2);
    ctx.arc(eye2X + eyeSize / 2, eye2Y + eyeSize / 2, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // 绘制瞳孔
    ctx.fillStyle = '#000000';
    const pupilSize = eyeSize * 0.4;
    ctx.beginPath();
    ctx.arc(eye1X + eyeSize / 2, eye1Y + eyeSize / 2, pupilSize / 2, 0, Math.PI * 2);
    ctx.arc(eye2X + eyeSize / 2, eye2Y + eyeSize / 2, pupilSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 导出
module.exports = Snake;
