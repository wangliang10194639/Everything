/**
 * 思齐贪吃蛇 - 粒子系统
 * 负责游戏中的粒子特效
 */

const { GAME_CONSTANTS } = require('../utils/game-utils');

/**
 * 粒子类
 */
class Particle {
  /**
   * 创建粒子
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {string} color - 颜色
   */
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 4 + 2;
    this.speedX = (Math.random() - 0.5) * 8;
    this.speedY = (Math.random() - 0.5) * 8;
    this.life = 1.0;
    this.decay = Math.random() * 0.02 + 0.02;
    this.gravity = 0.1;
  }

  /**
   * 更新粒子
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.life -= this.decay;
    this.size *= 0.98;
  }

  /**
   * 检查粒子是否死亡
   * @returns {boolean} 是否死亡
   */
  isDead() {
    return this.life <= 0 || this.size <= 0.5;
  }

  /**
   * 绘制粒子
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * 粒子管理器
 */
class ParticleManager {
  /**
   * 创建粒子管理器
   */
  constructor() {
    this.particles = [];
    this.maxParticles = 100;
  }

  /**
   * 发射粒子爆炸效果
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {string} color - 颜色
   * @param {number} count - 粒子数量
   */
  emitExplosion(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift(); // 移除最早的粒子
      }
      this.particles.push(new Particle(x, y, color));
    }
  }

  /**
   * 发射食物吃掉效果
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {string} color - 颜色
   */
  emitEatEffect(x, y, color) {
    this.emitExplosion(x, y, color, 8);
  }

  /**
   * 发射穿墙效果
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  emitWallPassEffect(x, y) {
    this.emitExplosion(x, y, '#fbbf24', 6);
  }

  /**
   * 发射生命道具效果
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  emitLifeEffect(x, y) {
    this.emitExplosion(x, y, '#ef4444', 16);
  }

  /**
   * 发射游戏开始效果
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  emitStartEffect(x, y) {
    this.emitExplosion(x, y, '#10b981', 20);
  }

  /**
   * 发射游戏结束效果
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  emitGameOverEffect(x, y) {
    this.emitExplosion(x, y, '#f43f5e', 30);
  }

  /**
   * 更新所有粒子
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    // 更新所有粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update(deltaTime);

      // 移除死亡的粒子
      if (particle.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * 绘制所有粒子
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    this.particles.forEach(particle => {
      particle.draw(ctx);
    });
  }

  /**
   * 清空所有粒子
   */
  clear() {
    this.particles = [];
  }

  /**
   * 获取粒子数量
   * @returns {number} 粒子数量
   */
  getCount() {
    return this.particles.length;
  }
}

// 导出
module.exports = {
  Particle,
  ParticleManager
};
