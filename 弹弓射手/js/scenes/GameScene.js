import Emitter from '../libs/tinyemitter';
import { GAME_CONFIG } from '../config/gameConfig';
import { createHero } from '../characters/Hero';
import { createEnemy } from '../characters/Enemy';
import SlingShotController from '../controllers/SlingShotController';
import LevelManager from '../managers/LevelManager';
import RuneManager from '../managers/RuneManager';
import AdManager from '../managers/AdManager';
import ShopManager from '../managers/ShopManager';
import Background from '../runtime/background';
import GameInfo from '../runtime/gameinfo';
import Music from '../runtime/music';

/**
 * 主游戏场景控制器
 * 整合所有游戏系统，管理游戏流程
 */
export default class GameScene extends Emitter {
  constructor() {
    super();
    
    // 游戏状态
    this.state = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.coins = 0;
    this.level = 1;
    
    // 游戏对象
    this.hero = null;
    this.enemies = [];
    this.activeRunes = [];
    
    // 管理器系统
    this.slingShotController = new SlingShotController();
    this.levelManager = new LevelManager();
    this.runeManager = new RuneManager();
    this.adManager = new AdManager();
    this.shopManager = new ShopManager();
    
    // 运行时系统
    this.background = new Background();
    this.gameInfo = new GameInfo();
    this.musicManager = new Music();
    
    // 游戏计时器
    this.lastTime = 0;
    this.deltaTime = 0;
    
    this.init();
  }
  
  init() {
    // 初始化各个系统
    this.setupEventListeners();
    this.loadGameData();
    
    // 设置初始状态
    this.setState('menu');
  }
  
  // 设置事件监听器
  setupEventListeners() {
    // 弹弓控制器事件
    this.slingShotController.on('heroShot', this.onHeroShot.bind(this));
    this.slingShotController.on('dragStart', this.onDragStart.bind(this));
    this.slingShotController.on('dragMove', this.onDragMove.bind(this));
    this.slingShotController.on('dragCancel', this.onDragCancel.bind(this));
    
    // 关卡管理器事件
    this.levelManager.on('levelStarted', this.onLevelStarted.bind(this));
    this.levelManager.on('enemySpawned', this.onEnemySpawned.bind(this));
    this.levelManager.on('enemyKilled', this.onEnemyKilled.bind(this));
    this.levelManager.on('levelCompleted', this.onLevelCompleted.bind(this));
    
    // 符文管理器事件
    this.runeManager.on('newRuneCollected', this.onNewRuneCollected.bind(this));
    this.runeManager.on('runeCollected', this.onRuneCollected.bind(this));
    this.runeManager.on('effectsApplied', this.onRuneEffectsApplied.bind(this));
    
    // 广告管理器事件
    this.adManager.on('rewardedVideoSuccess', this.onRewardedVideoSuccess.bind(this));
    this.adManager.on('rewardedVideoSkip', this.onRewardedVideoSkip.bind(this));
    
    // 商店管理器事件
    this.shopManager.on('purchaseSuccess', this.onPurchaseSuccess.bind(this));
    this.shopManager.on('purchaseError', this.onPurchaseError.bind(this));
    
    // 游戏信息UI事件
    this.gameInfo.on('restart', this.restartGame.bind(this));
    this.gameInfo.on('pause', this.pauseGame.bind(this));
    this.gameInfo.on('resume', this.resumeGame.bind(this));
  }
  
  // 加载游戏数据
  loadGameData() {
    this.coins = wx.getStorageSync('coins') || 0;
    this.level = wx.getStorageSync('current_level') || 1;
    this.score = wx.getStorageSync('high_score') || 0;
  }
  
  // 设置游戏状态
  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    
    this.emit('stateChanged', { from: oldState, to: newState });
    
    switch (newState) {
      case 'menu':
        this.showMenu();
        break;
      case 'playing':
        this.startPlaying();
        break;
      case 'paused':
        this.pausePlaying();
        break;
      case 'gameOver':
        this.handleGameOver();
        break;
    }
  }
  
  // 显示菜单
  showMenu() {
    this.gameInfo.showMenu({
      coins: this.coins,
      level: this.level,
      highScore: this.score
    });
  }
  
  // 开始游戏
  startGame() {
    this.setState('playing');
    this.levelManager.startLevel();
  }
  
  // 开始游玩状态
  startPlaying() {
    // 创建英雄
    const selectedHero = this.shopManager.getSelectedHero();
    this.hero = createHero(selectedHero, 
      GAME_CONFIG.SCREEN_WIDTH / 2 - 30,
      GAME_CONFIG.SCREEN_HEIGHT - 150
    );
    
    this.slingShotController.setHero(this.hero);
    
    // 重置游戏数据
    this.score = 0;
    this.enemies = [];
    this.activeRunes = [];
    
    // 预加载广告
    this.adManager.preloadAds();
    
    this.emit('gameStarted');
  }
  
  // 暂停游戏
  pauseGame() {
    if (this.state === 'playing') {
      this.setState('paused');
    }
  }
  
  // 恢复游戏
  resumeGame() {
    if (this.state === 'paused') {
      this.setState('playing');
    }
  }
  
  // 暂停游玩状态
  pausePlaying() {
    // 暂停游戏逻辑更新
    this.emit('gamePaused');
  }
  
  // 重启游戏
  restartGame() {
    this.cleanupGame();
    this.startGame();
  }
  
  // 清理游戏对象
  cleanupGame() {
    if (this.hero) {
      this.hero.destroy();
      this.hero = null;
    }
    
    this.enemies.forEach(enemy => enemy.destroy());
    this.enemies = [];
    
    this.activeRunes = [];
    
    this.slingShotController.reset();
    this.levelManager.resetLevel();
  }
  
  // 处理游戏结束
  handleGameOver() {
    // 保存最高分
    const highScore = wx.getStorageSync('high_score') || 0;
    if (this.score > highScore) {
      wx.setStorageSync('high_score', this.score);
    }
    
    // 显示游戏结束界面
    this.gameInfo.showGameOver({
      score: this.score,
      level: this.level,
      coinsEarned: Math.floor(this.score / 10)
    });
    
    // 显示插屏广告
    if (!this.shopManager.hasNoAds) {
      this.adManager.showInterstitial();
    }
    
    this.emit('gameOver', { score: this.score });
  }
  
  // 游戏主循环
  update(timestamp) {
    if (this.lastTime === 0) {
      this.lastTime = timestamp;
    }
    
    this.deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // 只在游戏进行时更新
    if (this.state !== 'playing') {
      return;
    }
    
    // 更新背景
    this.background.update();
    
    // 更新英雄
    if (this.hero) {
      this.hero.update();
      
      // 检查英雄是否越界
      if (!this.hero.isActive) {
        this.spawnNewHero();
      }
    }
    
    // 更新敌人
    this.enemies.forEach((enemy, index) => {
      enemy.update();
      
      // 移除不活跃的敌人
      if (!enemy.isActive) {
        this.enemies.splice(index, 1);
      }
    });
    
    // 更新关卡管理器
    this.levelManager.update(this.deltaTime);
    
    // 检查碰撞
    this.checkCollisions();
    
    // 更新符文
    this.updateRunes();
  }
  
  // 渲染游戏画面
  render(ctx) {
    // 清空画布
    ctx.clearRect(0, 0, GAME_CONFIG.SCREEN_WIDTH, GAME_CONFIG.SCREEN_HEIGHT);
    
    // 渲染背景
    this.background.render(ctx);
    
    // 渲染敌人
    this.enemies.forEach(enemy => enemy.render(ctx));
    
    // 渲染英雄
    if (this.hero) {
      this.hero.render(ctx);
    }
    
    // 渲染符文
    this.activeRunes.forEach(rune => {
      this.renderRune(ctx, rune);
    });
    
    // 渲染弹弓控制器视觉效果
    this.slingShotController.render(ctx);
    
    // 渲染UI信息
    this.gameInfo.render(ctx, {
      score: this.score,
      level: this.level,
      coins: this.coins,
      state: this.state,
      levelProgress: this.levelManager.getProgressPercentage()
    });
  }
  
  // 检查碰撞
  checkCollisions() {
    if (!this.hero || !this.hero.isShooting) return;
    
    this.enemies.forEach(enemy => {
      if (this.hero.isCollideWith(enemy)) {
        // 英雄击中敌人
        const damage = this.hero.damage * this.runeManager.getDamageBonus();
        enemy.takeDamage(damage);
        
        // 应用暴击
        if (Math.random() < this.runeManager.getCritChanceBonus()) {
          enemy.takeDamage(damage * 0.5); // 50%额外暴击伤害
        }
        
        // 敌人掉落符文
        const rune = this.runeManager.dropRuneFromEnemy(enemy, enemy.x, enemy.y);
        if (rune) {
          this.activeRunes.push(rune);
        }
        
        // 销毁英雄
        this.hero.destroy();
      }
    });
  }
  
  // 更新符文
  updateRunes() {
    this.activeRunes.forEach((rune, index) => {
      // 简单的符文收集检测（英雄靠近时收集）
      if (this.hero && this.getDistance(this.hero.x, this.hero.y, rune.x, rune.y) < 50) {
        if (this.runeManager.collectRune(rune)) {
          this.activeRunes.splice(index, 1);
          
          // 应用符文效果到游戏
          this.applyRuneEffect(rune);
        }
      }
    });
  }
  
  // 渲染符文
  renderRune(ctx, rune) {
    ctx.fillStyle = rune.isNew ? '#FFD700' : '#C0C0C0';
    ctx.beginPath();
    ctx.arc(rune.x, rune.y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制符文图标（简化）
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(rune.id.charAt(0).toUpperCase(), rune.x, rune.y + 4);
    ctx.textAlign = 'left';
  }
  
  // 应用符文效果
  applyRuneEffect(rune) {
    switch (rune.effect) {
      case 'damage_bonus':
        // 伤害加成已在runeManager中处理
        break;
      case 'crit_chance':
        // 暴击率加成已在runeManager中处理
        break;
      case 'gold_bonus':
        this.coins += Math.floor(10 * this.runeManager.getGoldBonus());
        break;
    }
  }
  
  // 生成新英雄
  spawnNewHero() {
    const selectedHero = this.shopManager.getSelectedHero();
    this.hero = createHero(selectedHero,
      GAME_CONFIG.SCREEN_WIDTH / 2 - 30,
      GAME_CONFIG.SCREEN_HEIGHT - 150
    );
    
    this.slingShotController.setHero(this.hero);
  }
  
  // 计算两点间距离
  getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // 事件处理方法
  onHeroShot(data) {
    this.musicManager.playShoot();
    wx.vibrateShort({ type: 'light' });
  }
  
  onDragStart(data) {
    // 可以在这里添加拖拽开始的音效或视觉效果
  }
  
  onDragMove(data) {
    // 实时显示力度和角度信息
    this.gameInfo.showPowerIndicator(data.power, data.angle);
  }
  
  onDragCancel() {
    // 拖拽取消的处理
  }
  
  onLevelStarted(data) {
    this.level = data.level;
    this.emit('levelStarted', data);
  }
  
  onEnemySpawned(enemy) {
    this.enemies.push(enemy);
    enemy.on('destroyed', (data) => {
      this.onEnemyDestroyed(enemy, data);
    });
  }
  
  onEnemyKilled(data) {
    this.score += 10;
    this.emit('scoreChanged', this.score);
  }
  
  onEnemyDestroyed(enemy, data) {
    this.coins += Math.floor(data.reward * this.runeManager.getGoldBonus());
    this.emit('coinsChanged', this.coins);
  }
  
  onLevelCompleted(data) {
    this.coins += Math.floor(data.reward.coins * this.runeManager.getGoldBonus());
    this.shopManager.addCoins(Math.floor(data.reward.coins * this.runeManager.getGoldBonus()));
    
    // 显示关卡完成奖励
    this.gameInfo.showLevelComplete(data.reward);
    
    this.emit('levelCompleted', data);
  }
  
  onNewRuneCollected(rune) {
    this.gameInfo.showRuneNotification(rune);
    this.musicManager.playCollect();
  }
  
  onRuneCollected(rune) {
    // 重复收集符文也给予少量奖励
    this.coins += 5;
    this.emit('coinsChanged', this.coins);
  }
  
  onRuneEffectsApplied(effects) {
    // 符文效果已应用，可以在UI上显示
    this.gameInfo.showRuneEffects(effects);
  }
  
  onRewardedVideoSuccess() {
    // 激励视频观看成功，给予奖励
    this.coins += 100;
    this.emit('coinsChanged', this.coins);
  }
  
  onRewardedVideoSkip() {
    // 视频未完整观看，不给奖励
    this.gameInfo.showMessage('完整观看视频才能获得奖励');
  }
  
  onPurchaseSuccess(item) {
    this.gameInfo.showMessage(`购买成功：${item.name}`);
  }
  
  onPurchaseError(error) {
    this.gameInfo.showMessage(`购买失败：${error}`);
  }
  
  // 获取游戏状态
  getGameState() {
    return {
      state: this.state,
      score: this.score,
      coins: this.coins,
      level: this.level,
      hero: this.hero ? this.hero.getInfo() : null,
      enemiesCount: this.enemies.length,
      runesCount: this.activeRunes.length
    };
  }
}