import Emitter from '/js/libs/tinyemitter';
import { GAME_CONFIG, RUNE_CONFIG } from '/js/config/gameConfig';

/**
 * 符文管理系统
 * 处理符文掉落、收集、组合和效果应用
 */
export default class RuneManager extends Emitter {
  constructor() {
    super();
    this.collectedRunes = wx.getStorageSync('collected_runes') || [];
    this.runeInventory = this.initRuneInventory();
    this.activeCombos = [];
    this.runeEffects = {};
    
    this.loadCollectedRunes();
  }
  
  // 初始化符文库存
  initRuneInventory() {
    const inventory = {
      attack: [],
      defense: [],
      special: []
    };
    
    // 将所有符文添加到库存中
    RUNE_CONFIG.ATTACK_RUNES.forEach(rune => {
      inventory.attack.push({ ...rune, collected: false });
    });
    
    RUNE_CONFIG.DEFENSE_RUNES.forEach(rune => {
      inventory.defense.push({ ...rune, collected: false });
    });
    
    RUNE_CONFIG.SPECIAL_RUNES.forEach(rune => {
      inventory.special.push({ ...rune, collected: false });
    });
    
    return inventory;
  }
  
  // 加载已收集的符文
  loadCollectedRunes() {
    this.collectedRunes.forEach(runeId => {
      this.markRuneAsCollected(runeId);
    });
    
    this.updateActiveCombos();
  }
  
  // 从敌人掉落符文
  dropRuneFromEnemy(enemy, x, y) {
    // 根据掉落率决定是否掉落符文
    if (Math.random() > GAME_CONFIG.RUNE.DROP_RATE) {
      return null;
    }
    
    // 随机选择符文类型
    const runeTypes = ['attack', 'defense', 'special'];
    const randomType = runeTypes[Math.floor(Math.random() * runeTypes.length)];
    
    // 从该类型中随机选择一个未收集的符文
    const availableRunes = this.runeInventory[randomType].filter(rune => !rune.collected);
    
    if (availableRunes.length === 0) {
      // 如果该类型都已收集完，选择已收集的符文
      const allRunes = this.runeInventory[randomType];
      if (allRunes.length === 0) return null;
      
      const randomRune = allRunes[Math.floor(Math.random() * allRunes.length)];
      return {
        ...randomRune,
        x: x,
        y: y,
        isNew: false
      };
    }
    
    const selectedRune = availableRunes[Math.floor(Math.random() * availableRunes.length)];
    
    return {
      ...selectedRune,
      x: x,
      y: y,
      isNew: true
    };
  }
  
  // 收集符文
  collectRune(rune) {
    if (!rune) return false;
    
    // 如果是新符文，标记为已收集
    if (rune.isNew) {
      this.markRuneAsCollected(rune.id);
      this.collectedRunes.push(rune.id);
      wx.setStorageSync('collected_runes', this.collectedRunes);
      
      this.emit('newRuneCollected', rune);
    } else {
      this.emit('runeCollected', rune);
    }
    
    this.updateActiveCombos();
    return true;
  }
  
  // 标记符文为已收集
  markRuneAsCollected(runeId) {
    for (let type in this.runeInventory) {
      const runes = this.runeInventory[type];
      const runeIndex = runes.findIndex(rune => rune.id === runeId);
      if (runeIndex !== -1) {
        this.runeInventory[type][runeIndex].collected = true;
        break;
      }
    }
  }
  
  // 更新激活的符文组合
  updateActiveCombos() {
    this.activeCombos = [];
    
    // 检查攻击符文组合
    const attackRunes = this.runeInventory.attack.filter(rune => rune.collected);
    if (attackRunes.length >= 2) {
      this.activeCombos.push({
        name: '狂暴战士',
        description: '攻击力提升30%',
        effect: 'damage_boost',
        value: 1.3,
        runes: attackRunes.slice(0, 2).map(r => r.id)
      });
    }
    
    if (attackRunes.length >= 3) {
      this.activeCombos.push({
        name: '毁灭之力',
        description: '暴击率提升25%',
        effect: 'crit_boost',
        value: 1.25,
        runes: attackRunes.slice(0, 3).map(r => r.id)
      });
    }
    
    // 检查防御符文组合
    const defenseRunes = this.runeInventory.defense.filter(rune => rune.collected);
    if (defenseRunes.length >= 2) {
      this.activeCombos.push({
        name: '钢铁意志',
        description: '受到伤害减少20%',
        effect: 'damage_reduction',
        value: 0.8,
        runes: defenseRunes.slice(0, 2).map(r => r.id)
      });
    }
    
    if (defenseRunes.length >= 3) {
      this.activeCombos.push({
        name: '不朽守护',
        description: '生命值提升50%',
        effect: 'health_boost',
        value: 1.5,
        runes: defenseRunes.slice(0, 3).map(r => r.id)
      });
    }
    
    // 检查特殊符文组合
    const specialRunes = this.runeInventory.special.filter(rune => rune.collected);
    if (specialRunes.length >= 2) {
      this.activeCombos.push({
        name: '幸运之星',
        description: '金币获得量翻倍',
        effect: 'gold_double',
        value: 2.0,
        runes: specialRunes.slice(0, 2).map(r => r.id)
      });
    }
    
    if (specialRunes.length >= 3) {
      this.activeCombos.push({
        name: '智慧大师',
        description: '经验值获得量提升100%',
        effect: 'exp_double',
        value: 2.0,
        runes: specialRunes.slice(0, 3).map(r => r.id)
      });
    }
    
    // 应用组合效果
    this.applyComboEffects();
    
    this.emit('combosUpdated', this.activeCombos);
  }
  
  // 应用组合效果
  applyComboEffects() {
    this.runeEffects = {};
    
    this.activeCombos.forEach(combo => {
      this.runeEffects[combo.effect] = combo.value;
    });
    
    this.emit('effectsApplied', this.runeEffects);
  }
  
  // 获取攻击力加成
  getDamageBonus() {
    return this.runeEffects.damage_boost || 1.0;
  }
  
  // 获取暴击率加成
  getCritChanceBonus() {
    return (this.runeEffects.crit_boost || 1.0) - 1.0;
  }
  
  // 获取伤害减免
  getDamageReduction() {
    return this.runeEffects.damage_reduction || 1.0;
  }
  
  // 获取生命值加成
  getHealthBonus() {
    return this.runeEffects.health_boost || 1.0;
  }
  
  // 获取金币加成
  getGoldBonus() {
    return this.runeEffects.gold_double || 1.0;
  }
  
  // 获取经验加成
  getExpBonus() {
    return this.runeEffects.exp_double || 1.0;
  }
  
  // 获取符文统计信息
  getRuneStats() {
    const stats = {
      totalCollected: this.collectedRunes.length,
      byType: {
        attack: this.runeInventory.attack.filter(r => r.collected).length,
        defense: this.runeInventory.defense.filter(r => r.collected).length,
        special: this.runeInventory.special.filter(r => r.collected).length
      },
      activeCombos: this.activeCombos.length,
      comboNames: this.activeCombos.map(combo => combo.name)
    };
    
    return stats;
  }
  
  // 获取符文图鉴
  getRuneCollection() {
    return {
      attack: [...this.runeInventory.attack],
      defense: [...this.runeInventory.defense],
      special: [...this.runeInventory.special]
    };
  }
  
  // 重置符文收集（用于测试）
  resetCollection() {
    this.collectedRunes = [];
    this.runeInventory = this.initRuneInventory();
    this.activeCombos = [];
    this.runeEffects = {};
    
    wx.setStorageSync('collected_runes', []);
    this.emit('collectionReset');
  }
  
  // 获取指定类型的随机未收集符文
  getRandomUncollectedRune(type) {
    const uncollected = this.runeInventory[type].filter(rune => !rune.collected);
    if (uncollected.length === 0) return null;
    
    return uncollected[Math.floor(Math.random() * uncollected.length)];
  }
}