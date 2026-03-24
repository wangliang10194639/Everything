import Emitter from '/js/libs/tinyemitter';
import { GAME_CONFIG } from '/js/config/gameConfig';
import Hero from '/js/characters/Hero';

/**
 * 弹弓控制器
 * 处理触摸输入、力度计算、角度控制和发射逻辑
 */
export default class SlingShotController extends Emitter {
  constructor() {
    super();
    this.hero = null;
    this.isDragging = false;
    this.startPoint = { x: 0, y: 0 };
    this.currentPoint = { x: 0, y: 0 };
    this.power = 0;
    this.angle = 0;
    
    // 弹弓固定点位置（屏幕底部中央）
    this.anchorPoint = {
      x: GAME_CONFIG.SCREEN_WIDTH / 2,
      y: GAME_CONFIG.SCREEN_HEIGHT - 100
    };
    
    this.init();
  }
  
  init() {
    this.setupTouchEvents();
  }
  
  // 设置触摸事件监听
  setupTouchEvents() {
    wx.onTouchStart(this.onTouchStart.bind(this));
    wx.onTouchMove(this.onTouchMove.bind(this));
    wx.onTouchEnd(this.onTouchEnd.bind(this));
    wx.onTouchCancel(this.onTouchCancel.bind(this));
  }
  
  // 设置英雄
  setHero(hero) {
    this.hero = hero;
  }
  
  // 触摸开始
  onTouchStart(event) {
    if (!this.hero || this.hero.isShooting) return;
    
    const touch = event.touches[0];
    const distance = this.getDistance(
      touch.clientX, touch.clientY,
      this.anchorPoint.x, this.anchorPoint.y
    );
    
    // 只有在弹弓附近触摸才开始拖拽
    if (distance < 100) {
      this.isDragging = true;
      this.startPoint = { x: touch.clientX, y: touch.clientY };
      this.currentPoint = { x: touch.clientX, y: touch.clientY };
      
      this.updatePullState();
      this.emit('dragStart', {
        power: this.power,
        angle: this.angle
      });
    }
  }
  
  // 触摸移动
  onTouchMove(event) {
    if (!this.isDragging || !this.hero) return;
    
    const touch = event.touches[0];
    this.currentPoint = { x: touch.clientX, y: touch.clientY };
    
    this.updatePullState();
    this.emit('dragMove', {
      power: this.power,
      angle: this.angle,
      startPoint: this.startPoint,
      currentPoint: this.currentPoint
    });
  }
  
  // 触摸结束
  onTouchEnd(event) {
    if (!this.isDragging || !this.hero) return;
    
    this.isDragging = false;
    
    if (this.power >= GAME_CONFIG.SLINGSHOT.MIN_PULL_DISTANCE) {
      this.shootHero();
    } else {
      // 力度不够，回弹到初始位置
      this.emit('dragCancel');
    }
  }
  
  // 触摸取消
  onTouchCancel(event) {
    this.isDragging = false;
    this.emit('dragCancel');
  }
  
  // 更新拉拽状态
  updatePullState() {
    const deltaX = this.currentPoint.x - this.anchorPoint.x;
    const deltaY = this.currentPoint.y - this.anchorPoint.y;
    
    // 计算距离和角度
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    this.angle = Math.atan2(deltaY, deltaX);
    
    // 限制最大拉拽距离
    this.power = Math.min(distance, GAME_CONFIG.SLINGSHOT.MAX_PULL_DISTANCE);
    
    // 应用最小拉拽距离
    if (this.power < GAME_CONFIG.SLINGSHOT.MIN_PULL_DISTANCE) {
      this.power = 0;
    }
  }
  
  // 发射英雄
  shootHero() {
    if (!this.hero || this.power < GAME_CONFIG.SLINGSHOT.MIN_PULL_DISTANCE) {
      return;
    }
    
    // 计算发射速度
    const velocity = this.power * GAME_CONFIG.SLINGSHOT.POWER_MULTIPLIER;
    
    // 调整角度（使发射更自然）
    const adjustedAngle = this.angle + GAME_CONFIG.SLINGSHOT.ANGLE_ADJUSTMENT;
    
    // 设置英雄发射状态
    this.hero.shoot(velocity, adjustedAngle);
    
    this.emit('heroShot', {
      power: this.power,
      angle: adjustedAngle,
      velocity: velocity
    });
    
    // 重置状态
    this.power = 0;
    this.angle = 0;
  }
  
  // 获取两点间距离
  getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // 绘制弹弓视觉效果
  render(ctx) {
    if (!this.isDragging || this.power < GAME_CONFIG.SLINGSHOT.MIN_PULL_DISTANCE) {
      return;
    }
    
    // 绘制拉拽轨迹线
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.anchorPoint.x, this.anchorPoint.y);
    ctx.lineTo(this.currentPoint.x, this.currentPoint.y);
    ctx.stroke();
    
    // 绘制力度指示器
    const indicatorRadius = Math.min(this.power / 2, 20);
    ctx.fillStyle = `rgba(255, 107, 107, ${this.power / GAME_CONFIG.SLINGSHOT.MAX_PULL_DISTANCE})`;
    ctx.beginPath();
    ctx.arc(this.currentPoint.x, this.currentPoint.y, indicatorRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制角度辅助线
    if (this.power > GAME_CONFIG.SLINGSHOT.MIN_PULL_DISTANCE) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(this.anchorPoint.x, this.anchorPoint.y);
      const lineLength = 100;
      ctx.lineTo(
        this.anchorPoint.x + Math.cos(this.angle) * lineLength,
        this.anchorPoint.y + Math.sin(this.angle) * lineLength
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  
  // 获取当前状态
  getState() {
    return {
      isDragging: this.isDragging,
      power: this.power,
      angle: this.angle,
      anchorPoint: this.anchorPoint
    };
  }
  
  // 重置控制器
  reset() {
    this.isDragging = false;
    this.power = 0;
    this.angle = 0;
  }
}