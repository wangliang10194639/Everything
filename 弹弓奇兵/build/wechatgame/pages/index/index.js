// index.js
Page({
  data: {
    loading: true,
    showMenu: false,
    inGame: false,
    showResult: false,
    progress: 0,
    gold: 100,
    score: 0,
    heroes: [
      { id: 1, name: '石头兵', icon: '🗿', unlocked: true },
      { id: 2, name: '火焰精灵', icon: '🔥', unlocked: false },
      { id: 3, name: '闪电球', icon: '⚡', unlocked: false },
      { id: 4, name: '忍者镖', icon: '🗡️', unlocked: false },
      { id: 5, name: '治疗水滴', icon: '💧', unlocked: false }
    ],
    selectedHero: 0,
    result: {
      success: true,
      score: 0,
      gold: 0
    }
  },

  onLoad() {
    console.log('游戏副本加载');
    this.simulateLoading();
  },

  simulateLoading() {
    // 模拟加载过程
    const loadingInterval = setInterval(() => {
      const progress = this.data.progress + 10;
      this.setData({ progress });
      
      if (progress >= 100) {
        clearInterval(loadingInterval);
        setTimeout(() => {
          this.setData({ 
            loading: false, 
            showMenu: true 
          });
        }, 500);
      }
    }, 200);
  },

  startGame() {
    console.log('开始游戏');
    this.setData({ 
      showMenu: false, 
      inGame: true 
    });
    
    // 初始化游戏画布
    this.initGameCanvas();
  },

  initGameCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        // 设置画布尺寸
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        
        // 保存canvas引用
        this.canvas = canvas;
        this.ctx = ctx;
        
        // 开始游戏循环
        this.gameLoop();
      });
  },

  gameLoop() {
    if (!this.data.inGame) return;
    
    this.update();
    this.render();
    
    requestAnimationFrame(() => this.gameLoop());
  },

  update() {
    // 游戏逻辑更新
    // 这里可以添加具体的更新逻辑
  },

  render() {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制游戏背景
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制地面
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, height - 100, width, 100);
    
    // 绘制简单的游戏元素
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('弹弓奇兵：城堡冲刺', width/2, 50);
    ctx.fillText('拖拽屏幕发射英雄', width/2, 80);
  },

  selectHero(e) {
    const index = e.currentTarget.dataset.index;
    if (this.data.heroes[index].unlocked) {
      this.setData({ selectedHero: index });
    }
  },

  pauseGame() {
    console.log('游戏暂停');
    wx.showModal({
      title: '游戏暂停',
      content: '是否返回主菜单？',
      success: (res) => {
        if (res.confirm) {
          this.backToMenu();
        }
      }
    });
  },

  openShop() {
    wx.showToast({
      title: '商店功能开发中',
      icon: 'none'
    });
  },

  showLevelResult(success) {
    const result = {
      success: success,
      score: this.data.score,
      gold: Math.floor(Math.random() * 50) + 20
    };
    
    this.setData({ 
      inGame: false, 
      showResult: true,
      result: result,
      gold: this.data.gold + result.gold
    });
  },

  nextLevel() {
    this.setData({ 
      showResult: false, 
      inGame: true,
      score: this.data.score + 100
    });
  },

  backToMenu() {
    this.setData({ 
      showResult: false, 
      showMenu: true,
      inGame: false,
      score: 0
    });
  },

  // 触摸事件处理
  onTouchStart(e) {
    console.log('触摸开始', e.touches[0]);
  },

  onTouchMove(e) {
    console.log('触摸移动', e.touches[0]);
  },

  onTouchEnd(e) {
    console.log('触摸结束', e.changedTouches[0]);
  }
});