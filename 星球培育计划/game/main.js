// 游戏主入口文件
// 星球培育计划 - 微信小游戏

// 导入音频管理器
import './audio.js';

// 兼容不同环境的全局对象
const GlobalObject = typeof global !== 'undefined' ? global : (typeof GameGlobal !== 'undefined' ? GameGlobal : window);

GlobalObject.GameManager = {
  // 游戏状态
  gameState: {
    isPlaying: false,
    isPaused: false,
    lastSaveTime: Date.now(),
    offlineTime: 0
  },
  
  // 游戏数据
  gameData: {
    // 资源
    resources: {
      meteorite: 0,  // 陨石
      coins: 0,      // 金币
      diamonds: 0    // 钻石
    },
    
    // 基地等级
    baseLevel: 1,
    
    // 元素背包
    inventory: [],
    
    // 图鉴收集
    collection: {},
    
    // 星球装饰
    decorations: {},
    
    // 任务进度
    tasks: {},
    
    // 成就
    achievements: {}
  },
  
  // 游戏配置
  config: {
    // 陨石产出间隔（毫秒）
    meteoriteInterval: 5000,
    
    // 离线收益最大时长（小时）
    maxOfflineHours: 12,
    
    // 合成基础成功率
    baseSynthesisSuccessRate: 0.8,
    
    // 广告奖励配置
    adRewards: {
      instantHarvest: 4 * 60 * 60 * 1000,  // 4小时（毫秒）
      synthesisBoost: 1,                   // 立即完成一次合成
      doubleIncome: 30 * 60 * 1000,        // 30分钟双倍收益
      extraChance: 1                       // 合成失败额外机会
    }
  },
  
  // 初始化游戏
  init() {
    console.log('初始化星球培育计划游戏...');
    
    // 初始化音频管理器
    if (typeof GlobalObject.AudioManager !== 'undefined') {
      GlobalObject.AudioManager.init();
      this.audioManager = GlobalObject.AudioManager;
    }
    
    // 加载本地存储的游戏数据
    this.loadGameData();
    
    // 计算离线收益
    this.calculateOfflineEarnings();
    
    // 初始化UI
    this.initUI();
    
    // 开始游戏循环
    this.startGameLoop();
    
    // 设置自动保存
    this.setupAutoSave();
    
    this.gameState.isPlaying = true;
    console.log('游戏初始化完成！');
  },
  
  // 加载游戏数据
  loadGameData() {
    try {
      const savedData = wx.getStorageSync('gameData');
      if (savedData) {
        this.gameData = { ...this.gameData, ...savedData };
        console.log('游戏数据加载成功');
      } else {
        // 新游戏，初始化默认数据
        this.initNewGameData();
      }
    } catch (error) {
      console.error('加载游戏数据失败:', error);
      this.initNewGameData();
    }
  },
  
  // 初始化新游戏数据
  initNewGameData() {
    // 新手礼包
    this.gameData.resources.meteorite = 10;
    this.gameData.resources.coins = 100;
    this.gameData.resources.diamonds = 5;
    
    // 初始化背包
    this.gameData.inventory = [
      { id: 'meteorite_1', level: 1, count: 10 }
    ];
    
    // 初始化图鉴
    this.gameData.collection = {
      'meteorite_1': { unlocked: true, count: 10 }
    };
    
    // 初始化任务
    this.initTasks();
    
    console.log('新游戏数据初始化完成');
  },
  
  // 初始化任务
  initTasks() {
    // 从配置中加载任务
    const taskConfig = GlobalObject.GameConfig.tasks;
    
    // 初始化每日任务
    this.gameData.tasks.daily = {};
    taskConfig.daily.forEach(task => {
      this.gameData.tasks.daily[task.id] = {
        ...task,
        current: 0,
        completed: false,
        claimed: false,
        lastReset: this.getTodayStart()
      };
    });
    
    // 初始化每周任务
    this.gameData.tasks.weekly = {};
    taskConfig.weekly.forEach(task => {
      this.gameData.tasks.weekly[task.id] = {
        ...task,
        current: 0,
        completed: false,
        claimed: false,
        lastReset: this.getWeekStart()
      };
    });
    
    // 初始化成就
    this.gameData.tasks.achievement = {};
    taskConfig.achievement.forEach(task => {
      this.gameData.tasks.achievement[task.id] = {
        ...task,
        current: 0,
        completed: false,
        claimed: false
      };
    });
  },
  
  // 获取今日开始时间
  getTodayStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  },
  
  // 获取本周开始时间
  getWeekStart() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff).getTime();
  },
  
  // 保存游戏数据
  saveGameData() {
    try {
      wx.setStorageSync('gameData', this.gameData);
      this.gameState.lastSaveTime = Date.now();
      console.log('游戏数据保存成功');
    } catch (error) {
      console.error('保存游戏数据失败:', error);
    }
  },
  
  // 计算离线收益
  calculateOfflineEarnings() {
    const currentTime = Date.now();
    const lastTime = this.gameState.lastSaveTime || currentTime;
    const offlineDuration = currentTime - lastTime;
    
    // 限制最大离线收益时长
    const maxOfflineTime = this.config.maxOfflineHours * 60 * 60 * 1000;
    const effectiveOfflineTime = Math.min(offlineDuration, maxOfflineTime);
    
    if (effectiveOfflineTime > 60000) { // 至少离线1分钟才计算收益
      // 计算离线期间产生的陨石数量
      const meteoritePerInterval = this.getMeteoriteProduction();
      const intervals = Math.floor(effectiveOfflineTime / this.config.meteoriteInterval);
      const offlineEarnings = intervals * meteoritePerInterval;
      
      this.gameData.resources.meteorite += offlineEarnings;
      this.gameState.offlineTime = effectiveOfflineTime;
      
      console.log(`离线收益计算完成: 获得 ${offlineEarnings} 个陨石`);
      
      // 显示离线收益弹窗
      this.showOfflineEarnings(offlineEarnings, effectiveOfflineTime);
    }
  },
  
  // 获取陨石产出数量
  getMeteoriteProduction() {
    // 基础产出 + 基地等级加成
    const baseProduction = 1;
    const levelBonus = this.gameData.baseLevel * 0.2;
    
    // 图鉴加成
    let collectionBonus = 0;
    const unlockedCount = Object.values(this.gameData.collection).filter(item => item.unlocked).length;
    collectionBonus = unlockedCount * 0.1;
    
    // 装饰加成
    let decorationBonus = 0;
    // 这里可以根据装饰系统计算加成
    
    const totalProduction = Math.floor(baseProduction * (1 + levelBonus + collectionBonus + decorationBonus));
    return Math.max(totalProduction, 1); // 至少产出1个
  },
  
  // 显示离线收益
  showOfflineEarnings(earnings, duration) {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    const timeText = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
    
    wx.showModal({
      title: '离线收益',
      content: `您已离线${timeText}\n获得 ${earnings} 个陨石！`,
      showCancel: false,
      confirmText: '领取奖励'
    });
  },
  
  // 初始化UI
  initUI() {
    // 初始化UI管理器
    if (typeof GlobalObject.UIManager !== 'undefined') {
      GlobalObject.UIManager.init();
      console.log('UI管理器初始化完成');
    } else {
      console.error('UIManager未定义，无法初始化UI');
    }
    
    // 更新资源显示
    this.updateResourceDisplay();
  },
  
  // 更新资源显示
  updateResourceDisplay() {
    // 更新陨石数量
    if (GlobalObject.UIManager && GlobalObject.UIManager.components && GlobalObject.UIManager.components.resourcePanel) {
      const meteoriteElement = GlobalObject.UIManager.getElementByIdCompat ? 
        GlobalObject.UIManager.getElementByIdCompat('meteorite-count') : 
        (document.getElementById ? document.getElementById('meteorite-count') : null);
      if (meteoriteElement) {
        meteoriteElement.textContent = this.gameData.resources.meteorite;
      }
      
      // 更新金币数量
      const coinsElement = GlobalObject.UIManager.getElementByIdCompat ? 
        GlobalObject.UIManager.getElementByIdCompat('coins-count') : 
        (document.getElementById ? document.getElementById('coins-count') : null);
      if (coinsElement) {
        coinsElement.textContent = this.formatNumber(this.gameData.resources.coins);
      }
      
      // 更新钻石数量
      const diamondsElement = GlobalObject.UIManager.getElementByIdCompat ? 
        GlobalObject.UIManager.getElementByIdCompat('diamonds-count') : 
        (document.getElementById ? document.getElementById('diamonds-count') : null);
      if (diamondsElement) {
        diamondsElement.textContent = this.gameData.resources.diamonds;
      }
    }
  },
  
  // 格式化数字显示
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },
  
  // 初始化合成界面
  initSynthesisUI() {
    // 这里应该初始化合成界面
    // 简化实现，只打印日志
    console.log('初始化合成界面');
  },
  
  // 初始化图鉴界面
  initCollectionUI() {
    // 这里应该初始化图鉴界面
    // 简化实现，只打印日志
    console.log('初始化图鉴界面');
  },
  
  // 初始化装饰界面
  initDecorationUI() {
    // 这里应该初始化装饰界面
    // 简化实现，只打印日志
    console.log('初始化装饰界面');
  },
  
  // 开始游戏循环
  startGameLoop() {
    // 设置陨石产出定时器
    this.meteoriteTimer = setInterval(() => {
      if (!this.gameState.isPaused) {
        const production = this.getMeteoriteProduction();
        this.gameData.resources.meteorite += production;
        this.updateResourceDisplay();
      }
    }, this.config.meteoriteInterval);
  },
  
  // 设置自动保存
  setupAutoSave() {
    // 每30秒自动保存一次
    this.autoSaveTimer = setInterval(() => {
      this.saveGameData();
    }, 30000);
    
    // 页面隐藏时保存
    wx.onHide(() => {
      this.saveGameData();
    });
  },
  
  // 暂停游戏
  pauseGame() {
    this.gameState.isPaused = true;
  },
  
  // 恢复游戏
  resumeGame() {
    this.gameState.isPaused = false;
  },
  
  // 合成元素
  synthesizeElements(elementId) {
    // 查找背包中的元素
    const element = this.gameData.inventory.find(item => item.id === elementId);
    
    if (!element) {
      console.error('未找到元素:', elementId);
      return false;
    }
    
    // 检查数量是否足够（需要3个）
    if (element.count < 3) {
      wx.showToast({
        title: '元素数量不足',
        icon: 'none'
      });
      return false;
    }
    
    // 计算合成结果
    const result = this.calculateSynthesisResult(elementId);
    
    if (!result) {
      wx.showToast({
        title: '无法合成更高级元素',
        icon: 'none'
      });
      return false;
    }
    
    // 计算成功率
    const successRate = this.calculateSynthesisSuccessRate(element.level);
    
    if (Math.random() < successRate) {
      // 合成成功
      element.count -= 3;
      
      // 添加新元素到背包
      const newElement = this.gameData.inventory.find(item => item.id === result.id);
      if (newElement) {
        newElement.count += 1;
      } else {
        this.gameData.inventory.push({
          id: result.id,
          level: result.level,
          count: 1
        });
      }
      
      // 更新图鉴
      this.updateCollection(result.id);
      
      // 更新任务进度
      this.updateTaskProgress('synthesis', 1);
      
      // 播放合成成功动画
      this.playSynthesisAnimation(true);
      
      // 播放合成成功音效
      if (this.audioManager) {
        this.audioManager.playSynthesisSuccess();
      }
      
      wx.showToast({
        title: `合成成功！获得 ${result.name}`,
        icon: 'success'
      });
    } else {
      // 合成失败
      element.count -= 2; // 失败只消耗2个
      
      // 播放合成失败动画
      this.playSynthesisAnimation(false);
      
      // 播放合成失败音效
      if (this.audioManager) {
        this.audioManager.playSynthesisFail();
      }
      
      wx.showToast({
        title: '合成失败',
        icon: 'none'
      });
    }
    
    // 更新UI
    this.updateResourceDisplay();
    if (GlobalObject.UIManager && GlobalObject.UIManager.updateInventoryGrid) {
      GlobalObject.UIManager.updateInventoryGrid();
    }
    
    return true;
  },
  
  // 计算合成结果
  calculateSynthesisResult(elementId) {
    // 这里应该根据元素配置表查找合成结果
    // 简化实现，假设元素ID格式为 type_level
    const parts = elementId.split('_');
    const type = parts[0];
    const level = parseInt(parts[1]);
    
    // 如果已经是最高级，无法合成
    if (level >= 10) {
      return null;
    }
    
    // 返回下一级元素
    const nextLevelId = `${type}_${level + 1}`;
    const elementConfig = GlobalObject.GameConfig.elements[nextLevelId];
    
    if (!elementConfig) {
      return null;
    }
    
    return {
      id: nextLevelId,
      level: level + 1,
      name: elementConfig.name
    };
  },
  
  // 获取元素名称
  getElementName(type) {
    const elementNames = {
      'meteorite': '陨石',
      'water': '水',
      'soil': '土壤',
      'fire': '火',
      'wind': '风',
      'plant': '植物',
      'animal': '动物',
      'mountain': '山脉',
      'ocean': '海洋',
      'life': '生命星球',
      'metal': '金属',
      'crystal': '晶体',
      'circuit': '电路',
      'machine': '机械',
      'station': '太空站',
      'city': '星际城市',
      'energy': '能量',
      'darkmatter': '暗物质',
      'magic': '魔法',
      'rune': '符文',
      'stargate': '星门',
      'void': '虚空生物'
    };
    
    return elementNames[type] || '未知元素';
  },
  
  // 计算合成成功率
  calculateSynthesisSuccessRate(elementLevel) {
    // 基础成功率随等级降低
    const levelPenalty = Math.max(0, (elementLevel - 1) * 0.05);
    const finalRate = Math.max(0.1, this.config.baseSynthesisSuccessRate - levelPenalty);
    
    return finalRate;
  },
  
  // 更新图鉴
  updateCollection(elementId) {
    if (!this.gameData.collection[elementId]) {
      this.gameData.collection[elementId] = {
        unlocked: true,
        count: 0
      };
    }
    
    this.gameData.collection[elementId].count += 1;
    
    // 检查是否是新解锁的元素
    if (this.gameData.collection[elementId].count === 1) {
      // 首次解锁奖励
      this.giveFirstUnlockReward(elementId);
      
      // 更新任务进度
      this.updateTaskProgress('collection', 1);
    }
  },
  
  // 首次解锁奖励
  giveFirstUnlockReward(elementId) {
    // 根据元素等级给予不同奖励
    const parts = elementId.split('_');
    const level = parseInt(parts[1]);
    
    let coinsReward = 10 * level;
    let diamondsReward = level >= 5 ? 1 : 0;
    
    this.gameData.resources.coins += coinsReward;
    this.gameData.resources.diamonds += diamondsReward;
    
    // 播放成就音效
    if (this.audioManager) {
      this.audioManager.playAchievement();
    }
    
    wx.showModal({
      title: '新发现！',
      content: `首次合成${this.getElementName(parts[0])}！\n获得 ${coinsReward} 金币${diamondsReward > 0 ? ` 和 ${diamondsReward} 钻石` : ''}`,
      showCancel: false
    });
  },
  
  // 播放合成动画
  playSynthesisAnimation(success) {
    // 这里应该实现合成动画效果
    // 简化实现，只打印日志
    console.log(`播放合成动画: ${success ? '成功' : '失败'}`);
    
    // 播放音效
    if (this.audioManager) {
      if (success) {
        this.audioManager.playSynthesisSuccess();
      } else {
        this.audioManager.playSynthesisFail();
      }
    }
  },
  
  // 更新任务进度
  updateTaskProgress(taskType, progress) {
    // 更新每日任务
    for (const taskId in this.gameData.tasks.daily) {
      const task = this.gameData.tasks.daily[taskId];
      if (task.type === taskType && !task.completed) {
        task.current = Math.min(task.current + progress, task.target);
        if (task.current >= task.target) {
          task.completed = true;
        }
      }
    }
    
    // 更新每周任务
    for (const taskId in this.gameData.tasks.weekly) {
      const task = this.gameData.tasks.weekly[taskId];
      if (task.type === taskType && !task.completed) {
        task.current = Math.min(task.current + progress, task.target);
        if (task.current >= task.target) {
          task.completed = true;
        }
      }
    }
    
    // 更新成就
    for (const taskId in this.gameData.tasks.achievement) {
      const task = this.gameData.tasks.achievement[taskId];
      if (task.type === taskType && !task.completed) {
        task.current = Math.min(task.current + progress, task.target);
        if (task.current >= task.target) {
          task.completed = true;
        }
      }
    }
  },
  
  // 观看广告获取奖励
  watchAdForReward(rewardType) {
    // 创建视频广告组件
    const videoAd = wx.createRewardedVideoAd({
      adUnitId: 'your-ad-unit-id' // 需要替换为实际的广告单元ID
    });
    
    videoAd.load()
      .then(() => videoAd.show())
      .catch(err => {
        console.error('广告加载失败:', err);
        wx.showToast({
          title: '广告加载失败',
          icon: 'none'
        });
      });
    
    // 监听广告关闭事件
    videoAd.onClose((status) => {
      if (status && status.isEnded || status === undefined) {
        // 广告观看完成，发放奖励
        this.giveAdReward(rewardType);
      } else {
        // 广告观看未完成
        wx.showToast({
          title: '需要完整观看广告才能获得奖励',
          icon: 'none'
        });
      }
    });
  },
  
  // 发放广告奖励
  giveAdReward(rewardType) {
    switch (rewardType) {
      case 'instantHarvest':
        // 立即收获4小时离线产出
        const meteorites = Math.floor((4 * 60 * 60 * 1000) / this.config.meteoriteInterval) * this.getMeteoriteProduction();
        this.gameData.resources.meteorite += meteorites;
        wx.showToast({
          title: `获得 ${meteorites} 个陨石`,
          icon: 'success'
        });
        break;
        
      case 'synthesisBoost':
        // 下一次合成立即完成
        this.gameData.synthesisBoost = true;
        wx.showToast({
          title: '下一次合成将立即完成',
          icon: 'success'
        });
        break;
        
      case 'doubleIncome':
        // 30分钟双倍收益
        this.gameData.doubleIncomeEndTime = Date.now() + this.config.adRewards.doubleIncome;
        wx.showToast({
          title: '已激活30分钟双倍收益',
          icon: 'success'
        });
        break;
        
      case 'extraChance':
        // 合成失败额外机会
        this.gameData.extraSynthesisChance = true;
        wx.showToast({
          title: '获得一次合成失败额外机会',
          icon: 'success'
        });
        break;
    }
    
    this.updateResourceDisplay();
  },
  
  // 检查并重置任务
  checkAndResetTasks() {
    const todayStart = this.getTodayStart();
    const weekStart = this.getWeekStart();
    
    // 检查每日任务
    for (const taskId in this.gameData.tasks.daily) {
      const task = this.gameData.tasks.daily[taskId];
      if (task.lastReset < todayStart) {
        // 重置任务
        task.current = 0;
        task.completed = false;
        task.claimed = false;
        task.lastReset = todayStart;
      }
    }
    
    // 检查每周任务
    for (const taskId in this.gameData.tasks.weekly) {
      const task = this.gameData.tasks.weekly[taskId];
      if (task.lastReset < weekStart) {
        // 重置任务
        task.current = 0;
        task.completed = false;
        task.claimed = false;
        task.lastReset = weekStart;
      }
    }
  },
  
  // 装饰星球
  decoratePlanet(slotId, decorationId) {
    // 检查装饰是否存在
    const decoration = this.gameData.inventory.find(item => item.id === decorationId);
    if (!decoration || decoration.count <= 0) {
      wx.showToast({
        title: '装饰数量不足',
        icon: 'none'
      });
      return false;
    }
    
    // 检查槽位是否已有装饰
    if (this.gameData.decorations[slotId]) {
      wx.showToast({
        title: '该位置已有装饰',
        icon: 'none'
      });
      return false;
    }
    
    // 放置装饰
    this.gameData.decorations[slotId] = decorationId;
    decoration.count -= 1;
    
    // 更新任务进度
    this.updateTaskProgress('decoration', 1);
    
    // 保存游戏数据
    this.saveGameData();
    
    wx.showToast({
      title: '装饰成功',
      icon: 'success'
    });
    
    return true;
  },
  
  // 升级基地
  upgradeBase() {
    const currentLevel = this.gameData.baseLevel;
    const upgradeConfig = GlobalObject.GameConfig.baseUpgrades.find(config => config.level === currentLevel + 1);
    
    if (!upgradeConfig) {
      wx.showToast({
        title: '已达到最高等级',
        icon: 'none'
      });
      return false;
    }
    
    // 检查资源是否足够
    if (this.gameData.resources.coins < upgradeConfig.cost.coins) {
      wx.showToast({
        title: '金币不足',
        icon: 'none'
      });
      return false;
    }
    
    // 扣除资源
    this.gameData.resources.coins -= upgradeConfig.cost.coins;
    
    // 升级基地
    this.gameData.baseLevel = currentLevel + 1;
    
    // 播放升级音效
    if (this.audioManager) {
      this.audioManager.playLevelUp();
    }
    
    // 更新任务进度
    this.updateTaskProgress('baseLevel', 1);
    
    // 保存游戏数据
    this.saveGameData();
    
    wx.showToast({
      title: `基地升级到 Lv.${this.gameData.baseLevel}`,
      icon: 'success'
    });
    
    return true;
  },
  
  // 购买装饰
  purchaseDecoration(decorationId) {
    const decorationConfig = GlobalObject.GameConfig.shop.decorations.find(item => item.id === decorationId);
    
    if (!decorationConfig) {
      console.error('未找到装饰配置:', decorationId);
      return false;
    }
    
    // 检查钻石是否足够
    if (this.gameData.resources.diamonds < decorationConfig.price) {
      wx.showToast({
        title: '钻石不足',
        icon: 'none'
      });
      return false;
    }
    
    // 扣除钻石
    this.gameData.resources.diamonds -= decorationConfig.price;
    
    // 添加装饰到背包
    const existingDecoration = this.gameData.inventory.find(item => item.id === decorationId);
    if (existingDecoration) {
      existingDecoration.count += 1;
    } else {
      this.gameData.inventory.push({
        id: decorationId,
        level: 5, // 装饰默认为5级
        count: 1
      });
    }
    
    // 保存游戏数据
    this.saveGameData();
    
    wx.showToast({
      title: `购买成功`,
      icon: 'success'
    });
    
    return true;
  },
  
  // 恢复游戏
  resume() {
    console.log('游戏恢复');
    this.gameState.isPaused = false;
    
    // 恢复游戏循环
    if (this.meteoriteTimer) {
      clearInterval(this.meteoriteTimer);
    }
    
    this.meteoriteTimer = setInterval(() => {
      if (!this.gameState.isPaused) {
        const production = this.getMeteoriteProduction();
        this.gameData.resources.meteorite += production;
        this.updateResourceDisplay();
      }
    }, this.config.meteoriteInterval);
  },
  
  // 暂停游戏
  pause() {
    console.log('游戏暂停');
    this.gameState.isPaused = true;
    
    // 清除定时器
    if (this.meteoriteTimer) {
      clearInterval(this.meteoriteTimer);
      this.meteoriteTimer = null;
    }
  },
  
  // 清理缓存
  clearCache() {
    console.log('清理游戏缓存');
    
    // 这里可以添加清理缓存的逻辑
    // 例如清理图片缓存、音频缓存等
  }
};

// 游戏启动
window.onload = function() {
  // 检查是否在微信小游戏环境中
  if (typeof wx !== 'undefined') {
    // 微信小游戏环境
    wx.showLoading({
      title: '加载中...'
    });
    
    // 初始化游戏
    GlobalObject.GameManager.init();
    
    wx.hideLoading();
  } else {
    // 非微信环境，可能是浏览器调试
    console.log('非微信环境，使用模拟数据');
    
    // 模拟微信API
    global.wx = {
      getStorageSync(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      },
      
      setStorageSync(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
      },
      
      showToast(options) {
        console.log('Toast:', options.title);
      },
      
      showModal(options) {
        console.log('Modal:', options.title, options.content);
        if (options.showCancel === false) {
          options.confirm && options.confirm();
        }
      },
      
      showLoading(options) {
        console.log('Loading:', options.title);
      },
      
      hideLoading() {
        console.log('Hide Loading');
      },
      
      createRewardedVideoAd(options) {
        return {
          load() {
            return Promise.resolve();
          },
          
          show() {
            console.log('显示广告:', options.adUnitId);
            return Promise.resolve();
          },
          
          onClose(callback) {
            // 模拟用户看完广告
            setTimeout(() => {
              callback({ isEnded: true });
            }, 1000);
          }
        };
      },
      
      onHide(callback) {
        // 浏览器环境下模拟页面隐藏
        window.addEventListener('beforeunload', callback);
      }
    };
    
    // 初始化游戏
    GlobalObject.GameManager.init();
  }
};