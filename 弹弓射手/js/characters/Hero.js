import Sprite from '/js/base/sprite';
import { GAME_CONFIG, HERO_TYPES } from '/js/config/gameConfig';

/**
 * 英雄基类
 * 所有英雄类型的父类，包含通用属性和方法
 */
export default class Hero extends Sprite {
  constructor(heroType, x = 0, y = 0) {
    super('', 60, 60, x, y); // 默认尺寸，会在子类中覆盖
    
    this.heroType = heroType;
    this.health = GAME_CONFIG.HERO.INITIAL_HEALTH;
    this.maxHealth = GAME_CONFIG.HERO.INITIAL_HEALTH;
    this.damage = heroType.damage;
    this.speed = heroType.speed;
    this.isShooting = false;
    this.velocity = { x: 0, y: 0 };
    this.gravity = 0.5;
    this.isActive = true;
    
    // 特殊能力冷却时间
    this.specialCooldown = 0;
    this.maxSpecialCooldown = 3000; // 3秒
    
    // 加载对应图片
    this.loadHeroImage();
  }
  
  // 加载英雄图片
  loadHeroImage() {
    // 根据英雄类型加载不同的图片
    const imageMap = {
      'stone_warrior': 'images/hero.png',
      'fire_mage': 'images/fire_hero.png',
      'lightning_ninja': 'images/lightning_hero.png',
      'healing_water': 'images/water_hero.png',
      'ice_archer': 'images/ice_hero.png'
    };
    
    const imagePath = imageMap[this.heroType.id] || 'images/hero.png';
    this.img = wx.createImage();
    this.img.src = imagePath;
  }
  
  // 发射英雄
  shoot(power, angle) {
    if (this.isShooting) return;
    
    this.isShooting = true;
    this.velocity.x = Math.cos(angle) * power;
    this.velocity.y = Math.sin(angle) * power;
    
    this.emit('shoot', { power, angle });
  }
  
  // 更新英雄状态
  update() {
    if (!this.isShooting) return;
    
    // 应用重力
    this.velocity.y += this.gravity;
    
    // 更新位置
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    // 边界检测
    if (this.x < 0 || this.x > GAME_CONFIG.SCREEN_WIDTH || 
        this.y > GAME_CONFIG.SCREEN_HEIGHT) {
      this.onOutOfBounds();
    }
    
    // 更新特殊能力冷却
    if (this.specialCooldown > 0) {
      this.specialCooldown -= 16; // 假设60FPS
    }
  }
  
  // 渲染英雄
  render(ctx) {
    if (!this.visible) return;
    
    // 绘制英雄主体
    super.render(ctx);
    
    // 绘制血条
    this.renderHealthBar(ctx);
    
    // 绘制特殊效果
    this.renderSpecialEffects(ctx);
  }
  
  // 绘制血条
  renderHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 6;
    const healthPercent = this.health / this.maxHealth;
    
    // 血条背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
    
    // 血条前景
    ctx.fillStyle = healthPercent > 0.6 ? '#4CAF50' : 
                   healthPercent > 0.3 ? '#FF9800' : '#F44336';
    ctx.fillRect(this.x, this.y - 10, barWidth * healthPercent, barHeight);
  }
  
  // 绘制特殊效果
  renderSpecialEffects(ctx) {
    // 如果有特殊能力正在冷却，绘制冷却指示器
    if (this.specialCooldown > 0) {
      const cooldownPercent = this.specialCooldown / this.maxSpecialCooldown;
      ctx.fillStyle = `rgba(0, 150, 255, ${0.3 * (1 - cooldownPercent)})`;
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, 
              Math.max(this.width, this.height) * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // 受到伤害
  takeDamage(damage) {
    this.health -= damage;
    
    // 触发受伤效果
    this.emit('damaged', { damage, health: this.health });
    
    if (this.health <= 0) {
      this.destroy();
    }
  }
  
  // 治疗
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.emit('healed', { amount, health: this.health });
  }
  
  // 使用特殊能力
  useSpecialAbility() {
    if (this.specialCooldown > 0) return false;
    
    this.specialCooldown = this.maxSpecialCooldown;
    this.emit('specialAbilityUsed', this.heroType.specialAbility);
    return true;
  }
  
  // 越界处理
  onOutOfBounds() {
    this.destroy();
  }
  
  // 销毁英雄
  destroy() {
    this.isActive = false;
    this.visible = false;
    this.emit('destroyed');
  }
  
  // 重置英雄状态
  reset() {
    this.health = this.maxHealth;
    this.isShooting = false;
    this.velocity = { x: 0, y: 0 };
    this.specialCooldown = 0;
    this.isActive = true;
    this.visible = true;
  }
  
  // 获取英雄信息
  getInfo() {
    return {
      type: this.heroType.id,
      name: this.heroType.name,
      health: this.health,
      maxHealth: this.maxHealth,
      damage: this.damage,
      speed: this.speed,
      specialAbility: this.heroType.specialAbility,
      cooldownRemaining: this.specialCooldown
    };
  }
}

// 具体英雄类实现
export class StoneWarrior extends Hero {
  constructor(x, y) {
    super(HERO_TYPES.STONE_WARRIOR, x, y);
    this.width = 60;
    this.height = 60;
  }
  
  // 石头战士的特殊能力：石爆
  useSpecialAbility() {
    if (super.useSpecialAbility()) {
      // 造成范围伤害
      this.emit('stoneBlast', {
        x: this.x,
        y: this.y,
        radius: 100,
        damage: this.damage * 1.5
      });
      return true;
    }
    return false;
  }
}

export class FireMage extends Hero {
  constructor(x, y) {
    super(HERO_TYPES.FIRE_MAGE, x, y);
    this.width = 55;
    this.height = 55;
  }
  
  // 火焰法师的特殊能力：火风暴
  useSpecialAbility() {
    if (super.useSpecialAbility()) {
      // 持续燃烧效果
      this.emit('fireStorm', {
        x: this.x,
        y: this.y,
        duration: 3000,
        damagePerSecond: this.damage * 0.5
      });
      return true;
    }
    return false;
  }
}

export class LightningNinja extends Hero {
  constructor(x, y) {
    super(HERO_TYPES.LIGHTNING_NINJA, x, y);
    this.width = 50;
    this.height = 70;
  }
  
  // 闪电忍者的特殊能力：连锁闪电
  useSpecialAbility() {
    if (super.useSpecialAbility()) {
      // 连锁攻击多个目标
      this.emit('chainLightning', {
        startX: this.x,
        startY: this.y,
        maxTargets: 3,
        damage: this.damage * 1.2
      });
      return true;
    }
    return false;
  }
}

export class HealingWater extends Hero {
  constructor(x, y) {
    super(HERO_TYPES.HEALING_WATER, x, y);
    this.width = 55;
    this.height = 55;
  }
  
  // 治愈之水的特殊能力：治疗光环
  useSpecialAbility() {
    if (super.useSpecialAbility()) {
      // 持续治疗周围单位
      this.emit('healAura', {
        x: this.x,
        y: this.y,
        radius: 120,
        healPerSecond: this.damage * 0.3,
        duration: 5000
      });
      return true;
    }
    return false;
  }
}

export class IceArcher extends Hero {
  constructor(x, y) {
    super(HERO_TYPES.ICE_ARCHER, x, y);
    this.width = 50;
    this.height = 65;
  }
  
  // 冰霜射手的特殊能力：冻结射击
  useSpecialAbility() {
    if (super.useSpecialAbility()) {
      // 减速敌人
      this.emit('freezeShot', {
        x: this.x,
        y: this.y,
        radius: 80,
        slowPercent: 0.6,
        duration: 2000
      });
      return true;
    }
    return false;
  }
}

// 英雄工厂方法
export function createHero(heroTypeId, x, y) {
  switch (heroTypeId) {
    case 'stone_warrior':
      return new StoneWarrior(x, y);
    case 'fire_mage':
      return new FireMage(x, y);
    case 'lightning_ninja':
      return new LightningNinja(x, y);
    case 'healing_water':
      return new HealingWater(x, y);
    case 'ice_archer':
      return new IceArcher(x, y);
    default:
      return new StoneWarrior(x, y); // 默认返回石头战士
  }
}