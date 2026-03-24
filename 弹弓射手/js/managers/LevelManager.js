import Emitter from '/js/libs/tinyemitter';
import { GAME_CONFIG, ENEMY_TYPES } from '/js/config/gameConfig';
import Enemy from '/js/characters/Enemy';

/**
 * 关卡管理系统
 * 处理敌人生成、波次控制和关卡进度
 */
export default class LevelManager extends Emitter {
  constructor() {
    super();
    this.currentLevel = wx.getStorageSync('current_level') || 1;
    this.currentWave = 0;
    this.maxWaves = 5;
    this.isLevelComplete = false;
    this.enemiesSpawned = 0;
    this.enemiesKilled = 0;
    this.totalEnemies = 0;
    
    this.spawnTimer = 0;
    this.waveInterval = 3000; // 波次间隔毫秒
    
    this.levelConfig = this.generateLevelConfig();
  }
  
  // 生成关卡配置
  generateLevelConfig() {
    const level = this.currentLevel;
    const difficultyMultiplier = 1 + (level - 1) * 0.2;
    
    return {
      level: level,
      waves: this.maxWaves,
      enemyTypes: this.getAvailableEnemyTypes(level),
      spawnPattern: this.generateSpawnPattern(level),
      bossWave: this.maxWaves,
      difficultyMultiplier: difficultyMultiplier
    };
  }
  
  // 获取可用敌人类型
  getAvailableEnemyTypes(level) {
    const types = [ENEMY_TYPES.CASTLE];
    
    if (level >= 3) {
      types.push(ENEMY_TYPES.DEFENSE_TOWER);
    }
    
    if (level >= 5 && level % 5 === 0) {
      types.push(ENEMY_TYPES.BOSS_CASTLE);
    }
    
    return types;
  }
  
  // 生成生成模式
  generateSpawnPattern(level) {
    const pattern = [];
    const totalEnemies = 10 + (level - 1) * 2;
    const enemiesPerWave = Math.ceil(totalEnemies / this.maxWaves);
    
    for (let wave = 1; wave <= this.maxWaves; wave++) {
      const waveEnemies = Math.min(enemiesPerWave, totalEnemies - pattern.length);
      const wavePattern = [];
      
      for (let i = 0; i < waveEnemies; i++) {
        let enemyType;
        if (wave === this.maxWaves && level % 5 === 0) {
          // Boss关卡的最后一波生成Boss
          enemyType = ENEMY_TYPES.BOSS_CASTLE;
        } else {
          // 根据权重随机选择敌人类型
          const weights = this.calculateEnemyWeights(level, wave);
          enemyType = this.weightedRandom(weights);
        }
        
        wavePattern.push({
          type: enemyType.id,
          delay: i * (1000 + Math.random() * 500) // 随机延迟
        });
      }
      
      pattern.push(wavePattern);
    }
    
    return pattern;
  }
  
  // 计算敌人权重
  calculateEnemyWeights(level, wave) {
    const weights = {};
    
    // 基础城堡总是可用
    weights[ENEMY_TYPES.CASTLE.id] = 60;
    
    // 防御塔在高级关卡出现概率增加
    if (level >= 3) {
      weights[ENEMY_TYPES.DEFENSE_TOWER.id] = 25 + (level - 3) * 5;
    }
    
    // Boss只在特定波次出现
    if (wave === this.maxWaves && level % 5 === 0) {
      weights[ENEMY_TYPES.BOSS_CASTLE.id] = 100;
    }
    
    return weights;
  }
  
  // 加权随机选择
  weightedRandom(weights) {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let [key, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        return Object.values(ENEMY_TYPES).find(type => type.id === key);
      }
    }
    
    return ENEMY_TYPES.CASTLE; // 默认返回普通城堡
  }
  
  // 开始新关卡
  startLevel() {
    this.currentWave = 0;
    this.isLevelComplete = false;
    this.enemiesSpawned = 0;
    this.enemiesKilled = 0;
    this.totalEnemies = this.calculateTotalEnemies();
    
    this.emit('levelStarted', {
      level: this.currentLevel,
      totalEnemies: this.totalEnemies
    });
    
    this.startNextWave();
  }
  
  // 计算总敌人数量
  calculateTotalEnemies() {
    return this.levelConfig.spawnPattern.flat().length;
  }
  
  // 开始下一波
  startNextWave() {
    if (this.currentWave >= this.maxWaves) {
      return;
    }
    
    this.currentWave++;
    this.spawnTimer = 0;
    
    this.emit('waveStarted', {
      wave: this.currentWave,
      totalWaves: this.maxWaves
    });
  }
  
  // 更新关卡逻辑
  update(deltaTime) {
    if (this.isLevelComplete || this.currentWave === 0) {
      return;
    }
    
    this.spawnTimer += deltaTime;
    
    // 检查是否需要生成敌人
    const currentWavePattern = this.levelConfig.spawnPattern[this.currentWave - 1];
    if (currentWavePattern && this.enemiesSpawned < currentWavePattern.length) {
      const nextEnemy = currentWavePattern[this.enemiesSpawned];
      if (this.spawnTimer >= nextEnemy.delay) {
        this.spawnEnemy(nextEnemy.type);
        this.enemiesSpawned++;
        this.spawnTimer = 0;
      }
    }
    
    // 检查波次是否完成
    if (this.enemiesSpawned >= currentWavePattern.length) {
      // 等待所有敌人都被击败
      if (this.enemiesKilled >= this.enemiesSpawned) {
        if (this.currentWave < this.maxWaves) {
          // 延迟开始下一波
          setTimeout(() => {
            this.startNextWave();
          }, this.waveInterval);
        } else {
          // 关卡完成
          this.completeLevel();
        }
      }
    }
  }
  
  // 生成敌人
  spawnEnemy(enemyTypeId) {
    const enemyType = Object.values(ENEMY_TYPES).find(type => type.id === enemyTypeId);
    if (!enemyType) return;
    
    const enemy = new Enemy(enemyType);
    enemy.on('destroyed', () => {
      this.onEnemyDestroyed();
    });
    
    this.emit('enemySpawned', enemy);
  }
  
  // 敌人被击败回调
  onEnemyDestroyed() {
    this.enemiesKilled++;
    this.emit('enemyKilled', {
      killed: this.enemiesKilled,
      total: this.totalEnemies
    });
    
    // 检查关卡是否完成
    if (this.enemiesKilled >= this.totalEnemies) {
      this.completeLevel();
    }
  }
  
  // 完成关卡
  completeLevel() {
    this.isLevelComplete = true;
    
    // 计算奖励
    const reward = this.calculateLevelReward();
    
    this.emit('levelCompleted', {
      level: this.currentLevel,
      reward: reward
    });
    
    // 解锁下一关
    this.unlockNextLevel();
  }
  
  // 计算关卡奖励
  calculateLevelReward() {
    const baseCoins = 50 + (this.currentLevel - 1) * 10;
    const baseExp = 100 + (this.currentLevel - 1) * 20;
    
    // Boss关卡额外奖励
    const isBossLevel = this.currentLevel % 5 === 0;
    const multiplier = isBossLevel ? 2 : 1;
    
    return {
      coins: baseCoins * multiplier,
      exp: baseExp * multiplier,
      isBossLevel: isBossLevel
    };
  }
  
  // 解锁下一关
  unlockNextLevel() {
    this.currentLevel++;
    wx.setStorageSync('current_level', this.currentLevel);
    this.levelConfig = this.generateLevelConfig();
  }
  
  // 重置关卡
  resetLevel() {
    this.currentWave = 0;
    this.isLevelComplete = false;
    this.enemiesSpawned = 0;
    this.enemiesKilled = 0;
  }
  
  // 获取当前关卡信息
  getLevelInfo() {
    return {
      currentLevel: this.currentLevel,
      currentWave: this.currentWave,
      maxWaves: this.maxWaves,
      enemiesKilled: this.enemiesKilled,
      totalEnemies: this.totalEnemies,
      isLevelComplete: this.isLevelComplete,
      levelConfig: this.levelConfig
    };
  }
  
  // 获取关卡进度百分比
  getProgressPercentage() {
    if (this.totalEnemies === 0) return 0;
    return (this.enemiesKilled / this.totalEnemies) * 100;
  }
}