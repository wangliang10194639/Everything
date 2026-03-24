/**
 * 思齐贪吃蛇 - 食物类
 * 负责食物的生成、绘制和效果
 */

const { GAME_CONSTANTS, GameUtils } = require('../utils/game-utils');

/**
 * 食物类型枚举
 */
const FoodType = {
  NORMAL: 'normal',
  LIFE: 'life'
};

/**
 * 食物类
 */
class Food {
  /**
   * 创建食物
   * @param {string} type - 食物类型
   */
  constructor(type = FoodType.NORMAL) {
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.visible = true;

    // 动画相关
    this.animationOffset = Math.random() * Math.PI * 2;
    this.scale = 1;
    this.targetScale = 1;
    this.opacity = 1;

    // 特效相关
    this.glowIntensity = 0;
  }

  /**
   * 生成食物位置
   * @param {Array} snakeBody - 蛇身数组
   * @param {Array} obstacles - 障碍物数组（可选）
   * @param {number} gridWidth - 网格宽度
   * @param {number} gridHeight - 网格高度
   * @returns {boolean} 是否生成成功
   */
  generate(snakeBody, obstacles = [], gridWidth, gridHeight) {
    const position = GameUtils.generateRandomPosition(snakeBody, obstacles);
    this.x = position.x;
    this.y = position.y;
    this.visible = true;

    // 播放生成动画
    this.playSpawnAnimation();

    return true;
  }

  /**
   * 播放生成动画
   */
  playSpawnAnimation() {
    this.scale = 0;
    this.targetScale = 1;
  }

  /**
   * 播放吃掉动画
   */
  playEatAnimation() {
    this.targetScale = 1.5;
    this.opacity = 0;
  }

  /**
   * 更新动画
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    // 缩放动画
    if (this.scale !== this.targetScale) {
      const speed = 0.15;
      this.scale += (this.targetScale - this.scale) * speed;
      if (Math.abs(this.scale - this.targetScale) < 0.01) {
        this.scale = this.targetScale;
      }
    }

    // 透明度动画（消失时）
    if (this.opacity < 1 && this.targetScale === 1) {
      this.opacity += 0.1;
      if (this.opacity > 1) this.opacity = 1;
    }

    // 浮动动画
    this.animationOffset += 0.05;

    // 发光动画
    this.glowIntensity = (Math.sin(this.animationOffset * 2) + 1) / 2;
  }

  /**
   * 获取食物颜色
   * @returns {string} 颜色值
   */
  getColor() {
    const colors = GAME_CONSTANTS.COLORS;
    switch (this.type) {
      case FoodType.LIFE:
        return colors.FOOD_LIFE;
      default:
        return colors.FOOD_NORMAL;
    }
  }

  /**
   * 获取食物分数
   * @returns {number} 分数
   */
  getScore() {
    switch (this.type) {
      case FoodType.LIFE:
        return GAME_CONSTANTS.LIFE_ITEM_SCORE;
      default:
        return GAME_CONSTANTS.FOOD_SCORE;
    }
  }

  /**
   * 检查是否吃到食物
   * @param {object} position - 位置
   * @returns {boolean} 是否吃到
   */
  isEaten(position) {
    return this.visible &&
           position.x === this.x &&
           position.y === this.y;
  }

  /**
   * 获取位置
   * @returns {object} 位置 {x, y}
   */
  getPosition() {
    return { x: this.x, y: this.y };
  }

  /**
   * 设置位置
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * 隐藏食物
   */
  hide() {
    this.visible = false;
  }

  /**
   * 显示食物
   */
  show() {
    this.visible = true;
  }

  /**
   * 绘制食物
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} cellSize - 单元格大小
   * @param {number} offsetX - X偏移
   * @param {number} offsetY - Y偏移
   */
  draw(ctx, cellSize, offsetX = 0, offsetY = 0) {
    if (!this.visible) return;

    const x = this.x * cellSize + offsetX;
    const y = this.y * cellSize + offsetY;
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;
    const size = (cellSize - 4) * this.scale;

    // 计算浮动偏移
    const floatOffset = Math.sin(this.animationOffset) * 3;
    const drawY = centerY + floatOffset;

    // 绘制发光效果
    if (this.type === FoodType.LIFE) {
      this.drawGlowEffect(ctx, centerX, drawY, size, this.getColor());
    }

    // 绘制食物形状
    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.type === FoodType.LIFE) {
      // 绘制心形（生命道具）
      this.drawHeart(ctx, centerX, drawY, size);
    } else {
      // 绘制圆形（普通食物）
      this.drawCircle(ctx, centerX, drawY, size);
    }

    ctx.restore();
  }

  /**
   * 绘制发光效果
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} size - 大小
   * @param {string} color - 颜色
   */
  drawGlowEffect(ctx, x, y, size, color) {
    const glowSize = size * (1.5 + this.glowIntensity * 0.3);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
    gradient.addColorStop(0, color + '80');
    gradient.addColorStop(0.5, color + '40');
    gradient.addColorStop(1, color + '00');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, glowSize, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 绘制圆形
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} size - 大小
   */
  drawCircle(ctx, x, y, size) {
    const radius = size / 2;

    // 绘制渐变填充
    const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
    gradient.addColorStop(0, '#ff6b81');
    gradient.addColorStop(1, this.getColor());

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // 绘制高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 绘制心形
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} size - 大小
   */
  drawHeart(ctx, x, y, size) {
    const heartSize = size / 2;

    ctx.fillStyle = this.getColor();
    ctx.beginPath();

    // 心形路径
    const topCurveHeight = heartSize * 0.3;
    ctx.moveTo(x, y + heartSize * 0.2);

    // 左上曲线
    ctx.bezierCurveTo(
      x - heartSize, y - heartSize * 0.3,
      x - heartSize * 1.2, y + heartSize * 0.5,
      x, y + heartSize
    );

    // 右上曲线
    ctx.bezierCurveTo(
      x + heartSize * 1.2, y + heartSize * 0.5,
      x + heartSize, y - heartSize * 0.3,
      x, y + heartSize * 0.2
    );

    ctx.fill();

    // 绘制闪光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x - heartSize * 0.3, y - heartSize * 0.2, heartSize * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 克隆食物
   * @returns {Food} 克隆的食物
   */
  clone() {
    const food = new Food(this.type);
    food.x = this.x;
    food.y = this.y;
    food.visible = this.visible;
    food.animationOffset = this.animationOffset;
    food.scale = this.scale;
    food.opacity = this.opacity;
    return food;
  }
}

// 导出
module.exports = {
  Food,
  FoodType
};
