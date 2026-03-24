import Sprite from '/js/base/sprite';
import { GAME_CONFIG, ENEMY_TYPES } from '/js/config/gameConfig';

/**
 * 敌人基类
 * 所有敌人类型的父类，包含通用属性和方法
 */
export default class Enemy extends Sprite {
  constructor(enemyType, x = 0, y = 0) {
    super('', 80, 80, x, y); // 默认尺寸，会在子类中覆盖
    
    this.enemyType = enemyType;
    this.health = enemyType.health;
    this.maxHealth = enemyType.health;
    this.damage = enemyType.damage;
    this.reward = enemyType.reward;
    this.speed = 0; // 敌人通常不移动，除非特殊类型
    this.isActive = true;
    
    // 状态效果
    this.effects = {
      frozen: false,
      burning: false,
      poisoned: false
    };
    
    // 状态计时器
    this.effectTimers = {
      frozen: 0,
      burning: 0,
      poisoned: 0
    };
    
    // 加载对应图片
    this.loadEnemyImage();
  }
  
  // 加载敌人图片
  loadEnemyImage() {
    // 根据敌人类型加载不同的图片
    const imageMap = {
      'castle': 'images/enemy.png',
      'tower': 'images/tower_enemy.png',
      'boss_castle': 'images/boss_enemy.png'
    };
    
    const imagePath = imageMap[this.enemyType.id] || 'images/enemy.png';
    this.img = wx.createImage();
    this.img.src = imagePath;
  }
  
  // 更新敌人状态
  update() {
    if (!this.isActive) return;
    
    // 更新状态效果
    this.updateEffects();
    
    // 应用减速效果
    const speedMultiplier = this.effects.frozen ? 0.4 : 1;
    
    // 更新位置（如果敌人会移动）
    this.x += this.speed * speedMultiplier;
    
    // 边界检测
    if (this.x > GAME_CONFIG.SCREEN_WIDTH || this.y > GAME_CONFIG.SCREEN_HEIGHT) {
      this.onEscape();
    }
  }
  
  // 渲染敌人
  render(ctx) {
    if (!this.visible) return;
    
    // 绘制敌人主体
    super.render(ctx);
    
    // 绘制血条
    this.renderHealthBar(ctx);
    
    // 绘制状态效果
    this.renderStatusEffects(ctx);
  }
  
  // 绘制血条
  renderHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 8;
    const healthPercent = this.health / this.maxHealth;
    
    // 血条背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x, this.y - 15, barWidth, barHeight);
    
    // 血条前景
    ctx.fillStyle = healthPercent > 0.6 ? '#4CAF50' : 
                   healthPercent > 0.3 ? '#FF9800' : '#F44336';
    ctx.fillRect(this.x, this.y - 15, barWidth * healthPercent, barHeight);
    
    // 血量数字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${Math.ceil(this.health)}/${this.maxHealth}`,
      this.x + barWidth/2,
      this.y - 18
    );
    ctx.textAlign = 'left';
  }
  
  // 绘制状态效果
  renderStatusEffects(ctx) {
    const centerX = this.x + this.width/2;
    const centerY = this.y + this.height/2;
    const effectRadius = 15;
    
    // 绘制冻结效果
    if (this.effects.frozen) {
      ctx.fillStyle = 'rgba(0, 200, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, effectRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 绘制燃烧效果
    if (this.effects.burning) {
      ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(centerX - 10, centerY - 10, effectRadius/2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 绘制中毒效果
    if (this.effects.poisoned) {
      ctx.fillStyle = 'rgba(150, 0, 200, 0.6)';
      ctx.beginPath();
      ctx.arc(centerX + 10, centerY - 10, effectRadius/2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // 更新状态效果
  updateEffects() {
    // 更新冻结效果
    if (this.effectTimers.frozen > 0) {
      this.effectTimers.frozen -= 16; // 假设60FPS
      if (this.effectTimers.frozen <= 0) {
        this.effects.frozen = false;
      }
    }
    
    // 更新燃烧效果
    if (this.effectTimers.burning > 0) {
      this.effectTimers.burning -= 16;
      // 每500ms造成一次伤害
      if (Math.floor(this.effectTimers.burning / 500) !== Math.floor((this.effectTimers.burning - 16) / 500)) {
        this.takeDamage(5);
      }
      if (this.effectTimers.burning <= 0) {
        this.effects.burning = false;
      }
    }
    
    // 更新中毒效果
    if (this.effectTimers.poisoned > 0) {
      this.effectTimers.poisoned -= 16;
      // 每1000ms造成一次伤害
      if (Math.floor(this.effectTimers.poisoned / 1000) !== Math.floor((this.effectTimers.poisoned - 16) / 1000)) {
        this.takeDamage(3);
      }
      if (this.effectTimers.poisoned <= 0) {
        this.effects.poisoned = false;
      }
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
  
  // 施加冻结效果
  applyFreeze(duration) {
    this.effects.frozen = true;
    this.effectTimers.frozen = duration;
    this.emit('frozen', { duration });
  }
  
  // 施加燃烧效果
  applyBurn(duration) {
    this.effects.burning = true;
    this.effectTimers.burning = duration;
    this.emit('burning', { duration });
  }
  
  // 施加中毒效果
  applyPoison(duration) {
    this.effects.poisoned = true;
    this.effectTimers.poisoned = duration;
    this.emit('poisoned', { duration });
  }
  
  // 逃脱处理（敌人到达终点）
  onEscape() {
    this.destroy();
    this.emit('escaped');
  }
  
  // 销毁敌人
  destroy() {
    this.isActive = false;
    this.visible = false;
    this.emit('destroyed', {
      reward: this.reward,
      type: this.enemyType.id
    });
  }
  
  // 获取敌人信息
  getInfo() {
    return {
      type: this.enemyType.id,
      name: this.enemyType.name,
      health: this.health,
      maxHealth: this.maxHealth,
      damage: this.damage,
      reward: this.reward,
      effects: { ...this.effects }
    };
  }
}

// 具体敌人类型实现
export class CastleEnemy extends Enemy {
  constructor(x, y) {
    super(ENEMY_TYPES.CASTLE, x, y);
    this.width = 80;
    this.height = 80;
  }
}

export class TowerEnemy extends Enemy {
  constructor(x, y) {
    super(ENEMY_TYPES.DEFENSE_TOWER, x, y);
    this.width = 60;
    this.height = 90;
    this.speed = 0.5; // 防御塔会缓慢移动
  }
  
  // 防御塔的特殊行为：周期性攻击
  update() {
    super.update();
    
    // 每2秒尝试攻击
    if (Math.floor(Date.now() / 2000) !== Math.floor((Date.now() - 16) / 2000)) {
      this.emit('towerAttack', {
        x: this.x,
        y: this.y,
        damage: this.damage
      });
    }
  }
}

export class BossCastle extends Enemy {
  constructor(x, y) {
    super(ENEMY_TYPES.BOSS_CASTLE, x, y);
    this.width = 120;
    this.height = 120;
    this.speed = 0.2; // Boss移动更慢
  }
  
  // Boss的特殊能力：召唤小怪
  update() {
    super.update();
    
    // 每5秒召唤一次小怪
    if (Math.floor(Date.now() / 5000) !== Math.floor((Date.now() - 16) / 5000)) {
      this.emit('summonMinions', {
        x: this.x,
        y: this.y,
        count: 2
      });
    }
  }
}

// 敌人工厂方法
export function createEnemy(enemyTypeId, x, y) {
  switch (enemyTypeId) {
    case 'castle':
      return new CastleEnemy(x, y);
    case 'tower':
      return new TowerEnemy(x, y);
    case 'boss_castle':
      return new BossCastle(x, y);
    default:
      return new CastleEnemy(x, y); // 默认返回普通城堡
  }
}