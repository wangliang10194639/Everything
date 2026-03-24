// 游戏UI界面文件
// 星球培育计划 - 微信小游戏
// 兼容不同环境的全局对象
const GlobalObject = typeof global !== 'undefined' ? global : (typeof GameGlobal !== 'undefined' ? GameGlobal : window);

GlobalObject.UIManager = {
  // UI组件引用
  components: {
    // 主界面
    mainPanel: null,
    resourcePanel: null,
    planetDisplay: null,
    
    // 合成界面
    synthesisPanel: null,
    synthesisGrid: null,
    synthesisSlots: [],
    
    // 图鉴界面
    collectionPanel: null,
    collectionTabs: null,
    collectionGrid: null,
    
    // 装饰界面
    decorationPanel: null,
    planetView: null,
    decorationSlots: [],
    decorationItems: null,
    
    // 任务界面
    taskPanel: null,
    taskList: null,
    
    // 商店界面
    shopPanel: null,
    shopTabs: null,
    shopItems: null,
    
    // 设置界面
    settingsPanel: null,
    
    // 通用UI
    loadingMask: null,
    messageBox: null,
    adButton: null
  },
  
  // UI状态
  state: {
    currentPanel: 'main', // 当前显示的界面
    isAnimating: false,    // 是否正在播放动画
    selectedElements: [],  // 当前选中的元素（用于合成）
    draggedElement: null   // 当前拖拽的元素
  },
  
  // 初始化UI
  init() {
    console.log('初始化UI管理器...');
    
    // 检查DOM是否准备就绪
    if (!document.body) {
      console.error('DOM body未准备就绪');
      return;
    }
    
    console.log('DOM body已准备就绪，开始创建UI');
    
    // 创建主界面
    this.createMainPanel();
    console.log('主界面创建完成');
    
    // 创建合成界面
    this.createSynthesisPanel();
    console.log('合成界面创建完成');
    
    // 创建图鉴界面
    this.createCollectionPanel();
    console.log('图鉴界面创建完成');
    
    // 创建装饰界面
    this.createDecorationPanel();
    console.log('装饰界面创建完成');
    
    // 创建任务界面
    this.createTaskPanel();
    console.log('任务界面创建完成');
    
    // 创建商店界面
    this.createShopPanel();
    console.log('商店界面创建完成');
    
    // 创建设置界面
    this.createSettingsPanel();
    console.log('设置界面创建完成');
    
    // 创建通用UI组件
    this.createCommonComponents();
    console.log('通用UI组件创建完成');
    
    // 绑定事件
    this.bindEvents();
    console.log('事件绑定完成');
    
    // 显示主界面
    this.showPanel('main');
    console.log('主界面已显示');
    
    console.log('UI管理器初始化完成');
  },
  
  // 创建主界面
  createMainPanel() {
    const mainPanel = document.createElement('div');
    mainPanel.id = 'main-panel';
    mainPanel.className = 'panel main-panel';
    mainPanel.innerHTML = `
      <div class="resource-bar">
        <div class="resource-item">
          <div class="resource-icon meteorite-icon"></div>
          <div class="resource-value" id="meteorite-count">0</div>
        </div>
        <div class="resource-item">
          <div class="resource-icon coins-icon"></div>
          <div class="resource-value" id="coins-count">0</div>
        </div>
        <div class="resource-item">
          <div class="resource-icon diamonds-icon"></div>
          <div class="resource-value" id="diamonds-count">0</div>
        </div>
      </div>
      
      <div class="planet-container">
        <div class="planet-display" id="planet-display">
          <div class="planet-base"></div>
          <!-- 装饰元素将动态添加到这里 -->
        </div>
        <div class="planet-info">
          <div class="planet-name">我的星球</div>
          <div class="planet-level">Lv.1</div>
        </div>
      </div>
      
      <div class="main-buttons">
        <button class="main-btn" id="synthesis-btn" data-panel="synthesis">
          <div class="btn-icon synthesis-icon"></div>
          <div class="btn-text">合成</div>
        </button>
        <button class="main-btn" id="collection-btn" data-panel="collection">
          <div class="btn-icon collection-icon"></div>
          <div class="btn-text">图鉴</div>
        </button>
        <button class="main-btn" id="decoration-btn" data-panel="decoration">
          <div class="btn-icon decoration-icon"></div>
          <div class="btn-text">装饰</div>
        </button>
        <button class="main-btn" id="task-btn" data-panel="task">
          <div class="btn-icon task-icon"></div>
          <div class="btn-text">任务</div>
        </button>
        <button class="main-btn" id="shop-btn" data-panel="shop">
          <div class="btn-icon shop-icon"></div>
          <div class="btn-text">商店</div>
        </button>
      </div>
      
      <div class="bottom-bar">
        <button class="bottom-btn" id="settings-btn">
          <div class="btn-icon settings-icon"></div>
        </button>
        <button class="bottom-btn ad-reward-btn" id="ad-reward-btn">
          <div class="btn-icon ad-icon"></div>
          <div class="btn-text">免费奖励</div>
        </button>
      </div>
    `;
    
    document.body.appendChild(mainPanel);
    this.components.mainPanel = mainPanel;
    this.components.resourcePanel = mainPanel.querySelector('.resource-bar');
    this.components.planetDisplay = mainPanel.querySelector('#planet-display');
    
    // 保存元素引用，以便兼容性方法使用
    this.components['meteorite-count'] = mainPanel.querySelector('#meteorite-count');
    this.components['coins-count'] = mainPanel.querySelector('#coins-count');
    this.components['diamonds-count'] = mainPanel.querySelector('#diamonds-count');
    this.components['settings-btn'] = mainPanel.querySelector('#settings-btn');
    this.components['ad-reward-btn'] = mainPanel.querySelector('#ad-reward-btn');
    this.components['synthesize-btn'] = mainPanel.querySelector('#synthesize-btn');
  },
  
  // 创建合成界面
  createSynthesisPanel() {
    const synthesisPanel = document.createElement('div');
    synthesisPanel.id = 'synthesis-panel';
    synthesisPanel.className = 'panel synthesis-panel hidden';
    synthesisPanel.innerHTML = `
      <div class="panel-header">
        <button class="back-btn" id="synthesis-back-btn">
          <div class="back-icon"></div>
        </button>
        <div class="panel-title">元素合成</div>
      </div>
      
      <div class="synthesis-area">
        <div class="synthesis-slots" id="synthesis-slots">
          <div class="synthesis-slot" data-slot="1"></div>
          <div class="synthesis-slot" data-slot="2"></div>
          <div class="synthesis-slot" data-slot="3"></div>
        </div>
        <div class="synthesis-result" id="synthesis-result">
          <div class="result-preview">?</div>
          <button class="synthesize-btn" id="synthesize-btn">合成</button>
        </div>
      </div>
      
      <div class="inventory-area">
        <div class="inventory-tabs">
          <button class="tab-btn active" data-tab="all">全部</button>
          <button class="tab-btn" data-tab="nature">自然</button>
          <button class="tab-btn" data-tab="tech">科技</button>
          <button class="tab-btn" data-tab="mystery">神秘</button>
        </div>
        <div class="inventory-grid" id="inventory-grid">
          <!-- 背包元素将动态添加到这里 -->
        </div>
      </div>
    `;
    
    document.body.appendChild(synthesisPanel);
    this.components.synthesisPanel = synthesisPanel;
    this.components.synthesisGrid = synthesisPanel.querySelector('#inventory-grid');
    this.components.synthesisSlots = Array.from(synthesisPanel.querySelectorAll('.synthesis-slot'));
    
    // 保存元素引用，以便兼容性方法使用
    this.components['synthesis-back-btn'] = synthesisPanel.querySelector('#synthesis-back-btn');
    this.components['inventory-grid'] = synthesisPanel.querySelector('#inventory-grid');
    this.components['synthesis-slots'] = synthesisPanel.querySelectorAll('.synthesis-slot');
    this.components['synthesis-result'] = synthesisPanel.querySelector('#synthesis-result');
  },
  
  // 创建图鉴界面
  createCollectionPanel() {
    const collectionPanel = document.createElement('div');
    collectionPanel.id = 'collection-panel';
    collectionPanel.className = 'panel collection-panel hidden';
    collectionPanel.innerHTML = `
      <div class="panel-header">
        <button class="back-btn" id="collection-back-btn">
          <div class="back-icon"></div>
        </button>
        <div class="panel-title">元素图鉴</div>
      </div>
      
      <div class="collection-stats">
        <div class="stat-item">
          <div class="stat-value" id="collection-progress">0/0</div>
          <div class="stat-label">收集进度</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="collection-bonus">0%</div>
          <div class="stat-label">收集加成</div>
        </div>
      </div>
      
      <div class="collection-tabs">
        <button class="tab-btn active" data-tab="all">全部</button>
        <button class="tab-btn" data-tab="nature">自然</button>
        <button class="tab-btn" data-tab="tech">科技</button>
        <button class="tab-btn" data-tab="mystery">神秘</button>
      </div>
      
      <div class="collection-grid" id="collection-grid">
        <!-- 图鉴元素将动态添加到这里 -->
      </div>
    `;
    
    document.body.appendChild(collectionPanel);
    this.components.collectionPanel = collectionPanel;
    this.components.collectionGrid = collectionPanel.querySelector('#collection-grid');
    
    // 保存元素引用，以便兼容性方法使用
    this.components['collection-back-btn'] = collectionPanel.querySelector('#collection-back-btn');
    this.components['collection-tabs'] = collectionPanel.querySelector('#collection-tabs');
    this.components['collection-grid'] = collectionPanel.querySelector('#collection-grid');
  },
  
  // 创建装饰界面
  createDecorationPanel() {
    const decorationPanel = document.createElement('div');
    decorationPanel.id = 'decoration-panel';
    decorationPanel.className = 'panel decoration-panel hidden';
    decorationPanel.innerHTML = `
      <div class="panel-header">
        <button class="back-btn" id="decoration-back-btn">
          <div class="back-icon"></div>
        </button>
        <div class="panel-title">星球装饰</div>
      </div>
      
      <div class="planet-view-container">
        <div class="planet-view" id="planet-view">
          <div class="planet-base"></div>
          <!-- 装饰位将动态添加到这里 -->
        </div>
        <div class="planet-controls">
          <button class="control-btn" id="rotate-left-btn">
            <div class="control-icon rotate-left-icon"></div>
          </button>
          <button class="control-btn" id="rotate-right-btn">
            <div class="control-icon rotate-right-icon"></div>
          </button>
          <button class="control-btn" id="reset-btn">
            <div class="control-icon reset-icon"></div>
          </button>
        </div>
      </div>
      
      <div class="decoration-area">
        <div class="decoration-tabs">
          <button class="tab-btn active" data-tab="all">全部</button>
          <button class="tab-btn" data-tab="nature">自然</button>
          <button class="tab-btn" data-tab="tech">科技</button>
          <button class="tab-btn" data-tab="mystery">神秘</button>
        </div>
        <div class="decoration-items" id="decoration-items">
          <!-- 装饰物品将动态添加到这里 -->
        </div>
      </div>
    `;
    
    document.body.appendChild(decorationPanel);
    this.components.decorationPanel = decorationPanel;
    this.components.planetView = decorationPanel.querySelector('#planet-view');
    this.components.decorationItems = decorationPanel.querySelector('#decoration-items');
    
    // 保存元素引用，以便兼容性方法使用
    this.components['decoration-back-btn'] = decorationPanel.querySelector('#decoration-back-btn');
    this.components['planet-view'] = decorationPanel.querySelector('#planet-view');
    this.components['decoration-slots'] = decorationPanel.querySelectorAll('.decoration-slot');
    this.components['decoration-items'] = decorationPanel.querySelector('#decoration-items');
  },
  
  // 创建任务界面
  createTaskPanel() {
    const taskPanel = document.createElement('div');
    taskPanel.id = 'task-panel';
    taskPanel.className = 'panel task-panel hidden';
    taskPanel.innerHTML = `
      <div class="panel-header">
        <button class="back-btn" id="task-back-btn">
          <div class="back-icon"></div>
        </button>
        <div class="panel-title">任务与成就</div>
      </div>
      
      <div class="task-tabs">
        <button class="tab-btn active" data-tab="daily">每日任务</button>
        <button class="tab-btn" data-tab="weekly">每周任务</button>
        <button class="tab-btn" data-tab="achievement">成就</button>
      </div>
      
      <div class="task-list" id="task-list">
        <!-- 任务列表将动态添加到这里 -->
      </div>
    `;
    
    document.body.appendChild(taskPanel);
    this.components.taskPanel = taskPanel;
    this.components.taskList = taskPanel.querySelector('#task-list');
    
    // 保存元素引用，以便兼容性方法使用
    this.components['task-back-btn'] = taskPanel.querySelector('#task-back-btn');
    this.components['task-tabs'] = taskPanel.querySelector('#task-tabs');
    this.components['task-list'] = taskPanel.querySelector('#task-list');
  },
  
  // 创建商店界面
  createShopPanel() {
    const shopPanel = document.createElement('div');
    shopPanel.id = 'shop-panel';
    shopPanel.className = 'panel shop-panel hidden';
    shopPanel.innerHTML = `
      <div class="panel-header">
        <button class="back-btn" id="shop-back-btn">
          <div class="back-icon"></div>
        </button>
        <div class="panel-title">商店</div>
      </div>
      
      <div class="shop-tabs">
        <button class="tab-btn active" data-tab="special">特惠</button>
        <button class="tab-btn" data-tab="diamonds">钻石</button>
        <button class="tab-btn" data-tab="decorations">装饰</button>
      </div>
      
      <div class="shop-items" id="shop-items">
        <!-- 商店物品将动态添加到这里 -->
      </div>
    `;
    
    document.body.appendChild(shopPanel);
    this.components.shopPanel = shopPanel;
    this.components.shopItems = shopPanel.querySelector('#shop-items');
    
    // 保存元素引用，以便兼容性方法使用
    this.components['shop-back-btn'] = shopPanel.querySelector('#shop-back-btn');
    this.components['shop-items'] = shopPanel.querySelector('#shop-items');
  },
  
  // 创建设置界面
  createSettingsPanel() {
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'settings-panel';
    settingsPanel.className = 'panel settings-panel hidden';
    settingsPanel.innerHTML = `
      <div class="panel-header">
        <button class="back-btn" id="settings-back-btn">
          <div class="back-icon"></div>
        </button>
        <div class="panel-title">设置</div>
      </div>
      
      <div class="settings-content">
        <div class="setting-item">
          <div class="setting-label">音效</div>
          <div class="setting-control">
            <label class="switch">
              <input type="checkbox" id="sound-toggle" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-label">背景音乐</div>
          <div class="setting-control">
            <label class="switch">
              <input type="checkbox" id="music-toggle" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-label">震动反馈</div>
          <div class="setting-control">
            <label class="switch">
              <input type="checkbox" id="vibration-toggle" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-label">语言</div>
          <div class="setting-control">
            <select id="language-select">
              <option value="zh-CN">简体中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-label">游戏版本</div>
          <div class="setting-value">1.0.0</div>
        </div>
      </div>
      
      <div class="settings-actions">
        <button class="action-btn" id="save-data-btn">备份数据</button>
        <button class="action-btn" id="load-data-btn">恢复数据</button>
        <button class="action-btn" id="reset-game-btn">重置游戏</button>
      </div>
    `;
    
    document.body.appendChild(settingsPanel);
    this.components.settingsPanel = settingsPanel;
    
    // 保存元素引用，以便兼容性方法使用
    this.components['settings-close-btn'] = settingsPanel.querySelector('#settings-close-btn');
  },
  
  // 创建通用UI组件
  createCommonComponents() {
    // 加载遮罩
    const loadingMask = document.createElement('div');
    loadingMask.id = 'loading-mask';
    loadingMask.className = 'loading-mask hidden';
    loadingMask.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    `;
    document.body.appendChild(loadingMask);
    this.components.loadingMask = loadingMask;
    
    // 消息框
    const messageBox = document.createElement('div');
    messageBox.id = 'message-box';
    messageBox.className = 'message-box hidden';
    messageBox.innerHTML = `
      <div class="message-content">
        <div class="message-title" id="message-title">提示</div>
        <div class="message-text" id="message-text">消息内容</div>
        <div class="message-buttons">
          <button class="message-btn" id="message-cancel">取消</button>
          <button class="message-btn primary" id="message-confirm">确定</button>
        </div>
      </div>
    `;
    document.body.appendChild(messageBox);
    this.components.messageBox = messageBox;
    
    // 保存元素引用，以便兼容性方法使用
    this.components['loading-mask'] = loadingMask;
    this.components['message-box'] = messageBox;
    this.components['message-title'] = messageBox.querySelector('#message-title');
    this.components['message-content'] = messageBox.querySelector('#message-content');
    this.components['message-confirm'] = messageBox.querySelector('#message-confirm');
    this.components['message-cancel'] = messageBox.querySelector('#message-cancel');
  },
  
  // 绑定事件
  bindEvents() {
    // 主界面按钮事件
    const mainButtons = this.querySelectorAllCompat('.main-btn');
    mainButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // 播放按钮点击音效
        if (GlobalObject.GameManager && GlobalObject.GameManager.audioManager) {
          GlobalObject.GameManager.audioManager.playButtonClick();
        }
        
        const panel = e.currentTarget.getAttribute('data-panel');
        if (panel) {
          this.showPanel(panel);
        }
      });
    });
    
    // 返回按钮事件
    const backButtons = this.querySelectorAllCompat('.back-btn');
    backButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // 播放按钮点击音效
        if (GlobalObject.GameManager && GlobalObject.GameManager.audioManager) {
          GlobalObject.GameManager.audioManager.playButtonClick();
        }
        
        this.showPanel('main');
      });
    });
    
    // 设置按钮事件
    const settingsBtn = this.getElementByIdCompat('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        // 播放按钮点击音效
        if (GlobalObject.GameManager && GlobalObject.GameManager.audioManager) {
          GlobalObject.GameManager.audioManager.playButtonClick();
        }
        
        this.showPanel('settings');
      });
    }
    
    // 广告奖励按钮事件
    const adRewardBtn = this.getElementByIdCompat('ad-reward-btn');
    if (adRewardBtn) {
      adRewardBtn.addEventListener('click', () => {
        // 播放按钮点击音效
        if (GlobalObject.GameManager && GlobalObject.GameManager.audioManager) {
          GlobalObject.GameManager.audioManager.playButtonClick();
        }
        
        this.showAdRewardDialog();
      });
    }
    
    // 合成按钮事件
    const synthesizeBtn = this.getElementByIdCompat('synthesize-btn');
    if (synthesizeBtn) {
      synthesizeBtn.addEventListener('click', () => {
        // 播放按钮点击音效
        if (GlobalObject.GameManager && GlobalObject.GameManager.audioManager) {
          GlobalObject.GameManager.audioManager.playButtonClick();
        }
        
        this.performSynthesis();
      });
    }
    
    // 标签页切换事件
    const tabButtons = this.querySelectorAllCompat('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // 播放按钮点击音效
        if (GlobalObject.GameManager && GlobalObject.GameManager.audioManager) {
          GlobalObject.GameManager.audioManager.playButtonClick();
        }
        
        const tab = e.currentTarget.getAttribute('data-tab');
        const tabContainer = e.currentTarget.parentElement;
        
        // 更新选中状态
        const allTabBtns = this.querySelectorAllCompat('.tab-btn', tabContainer);
        allTabBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // 更新内容
        this.updateTabContent(tabContainer.parentElement, tab);
      });
    });
  },
  
  // 兼容性方法：通过ID获取元素
  getElementByIdCompat(id) {
    // 尝试使用标准方法
    if (document.getElementById) {
      return document.getElementById(id);
    }
    
    // 微信小游戏环境兼容性方案：使用全局元素引用
    if (this.components && this.components[id]) {
      return this.components[id];
    }
    
    // 兼容性方案：尝试从已创建的面板中查找
    if (this.components && this.components.mainPanel) {
      return this.components.mainPanel.querySelector('#' + id);
    }
    
    return null;
  },
  
  // 兼容性方法：通过选择器获取元素列表
  querySelectorAllCompat(selector, parent = document) {
    // 尝试使用标准方法
    if (parent.querySelectorAll) {
      return Array.from(parent.querySelectorAll(selector));
    }
    
    // 微信小游戏环境兼容性方案：使用全局元素引用
    if (selector === '.main-btn' && this.components && this.components.mainPanel) {
      return this.components.mainPanel.querySelectorAll('.main-btn');
    }
    
    if (selector === '.back-btn' && this.components && this.components.mainPanel) {
      return this.components.mainPanel.querySelectorAll('.back-btn');
    }
    
    if (selector === '.tab-btn' && this.components && this.components.collectionPanel) {
      return this.components.collectionPanel.querySelectorAll('.tab-btn');
    }
    
    if (selector === '.panel' && this.components) {
      const panels = [];
      if (this.components.mainPanel) panels.push(this.components.mainPanel);
      if (this.components.synthesisPanel) panels.push(this.components.synthesisPanel);
      if (this.components.collectionPanel) panels.push(this.components.collectionPanel);
      if (this.components.decorationPanel) panels.push(this.components.decorationPanel);
      if (this.components.taskPanel) panels.push(this.components.taskPanel);
      if (this.components.shopPanel) panels.push(this.components.shopPanel);
      if (this.components.settingsPanel) panels.push(this.components.settingsPanel);
      return panels;
    }
    
    return [];
  },
  
  // 显示指定面板
  showPanel(panelName) {
    if (this.state.isAnimating) return;
    
    // 隐藏所有面板
    const panels = this.querySelectorAllCompat('.panel');
    panels.forEach(panel => {
      panel.classList.add('hidden');
    });
    
    // 显示目标面板
    const targetPanel = this.getElementByIdCompat(`${panelName}-panel`);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
      this.state.currentPanel = panelName;
      
      // 刷新面板内容
      this.refreshPanel(panelName);
    }
  },
  
  // 刷新面板内容
  refreshPanel(panelName) {
    switch (panelName) {
      case 'main':
        this.updateResourceDisplay();
        this.updatePlanetDisplay();
        break;
      case 'synthesis':
        this.updateInventoryGrid();
        this.updateSynthesisSlots();
        break;
      case 'collection':
        this.updateCollectionGrid();
        this.updateCollectionStats();
        break;
      case 'decoration':
        this.updateDecorationItems();
        this.updatePlanetView();
        break;
      case 'task':
        this.updateTaskList();
        break;
      case 'shop':
        this.updateShopItems();
        break;
    }
  },
  
  // 更新资源显示
  updateResourceDisplay() {
    const gameData = GlobalObject.GameManager.gameData;
    
    // 更新陨石数量
    const meteoriteElement = document.getElementById('meteorite-count');
    if (meteoriteElement) {
      const oldCount = parseInt(meteoriteElement.textContent) || 0;
      meteoriteElement.textContent = gameData.resources.meteorite;
      
      // 如果陨石数量增加，播放收集音效
      if (gameData.resources.meteorite > oldCount && GlobalObject.GameManager.audioManager) {
        GlobalObject.GameManager.audioManager.playCollect();
      }
    }
    
    // 更新金币数量
    const coinsElement = document.getElementById('coins-count');
    if (coinsElement) {
      coinsElement.textContent = this.formatNumber(gameData.resources.coins);
    }
    
    // 更新钻石数量
    const diamondsElement = document.getElementById('diamonds-count');
    if (diamondsElement) {
      diamondsElement.textContent = gameData.resources.diamonds;
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
  
  // 更新星球显示
  updatePlanetDisplay() {
    const planetDisplay = this.components.planetDisplay;
    if (!planetDisplay) return;
    
    // 清除现有装饰
    const existingDecorations = planetDisplay.querySelectorAll('.planet-decoration');
    existingDecorations.forEach(decoration => decoration.remove());
    
    // 添加装饰
    const decorations = GlobalObject.GameManager.gameData.decorations;
    for (const [slotId, decorationId] of Object.entries(decorations)) {
      const decorationElement = document.createElement('div');
      decorationElement.className = `planet-decoration ${decorationId}`;
      decorationElement.style.position = 'absolute';
      
      // 根据装饰类型设置位置和样式
      this.setDecorationStyle(decorationElement, decorationId, slotId);
      
      planetDisplay.appendChild(decorationElement);
    }
  },
  
  // 设置装饰样式
  setDecorationStyle(element, decorationId, slotId) {
    // 这里应该根据装饰ID和槽位ID设置具体的位置和样式
    // 简化实现，只设置基本样式
    const decorationTypes = {
      'tree': { width: '40px', height: '40px', background: 'url(assets/decorations/tree.png) no-repeat center/contain' },
      'mountain': { width: '60px', height: '40px', background: 'url(assets/decorations/mountain.png) no-repeat center/contain' },
      'house': { width: '30px', height: '30px', background: 'url(assets/decorations/house.png) no-repeat center/contain' },
      'lake': { width: '50px', height: '30px', background: 'url(assets/decorations/lake.png) no-repeat center/contain' }
    };
    
    const decorationType = decorationTypes[decorationId.split('_')[0]];
    if (decorationType) {
      Object.assign(element.style, decorationType);
    }
    
    // 根据槽位设置位置
    const slotPositions = {
      'slot1': { top: '20%', left: '30%' },
      'slot2': { top: '40%', left: '60%' },
      'slot3': { top: '60%', left: '25%' },
      'slot4': { top: '70%', left: '70%' },
      'slot5': { top: '30%', left: '50%' }
    };
    
    const position = slotPositions[slotId];
    if (position) {
      Object.assign(element.style, position);
    }
  },
  
  // 更新背包网格
  updateInventoryGrid() {
    const inventoryGrid = this.components.synthesisGrid;
    if (!inventoryGrid) return;
    
    // 清空现有内容
    inventoryGrid.innerHTML = '';
    
    // 获取背包数据
    const inventory = GlobalObject.GameManager.gameData.inventory;
    
    // 创建元素项
    inventory.forEach(item => {
      if (item.count > 0) {
        const elementItem = this.createElementItem(item);
        inventoryGrid.appendChild(elementItem);
      }
    });
  },
  
  // 创建元素项
  createElementItem(item) {
    const elementItem = document.createElement('div');
    elementItem.className = 'element-item';
    elementItem.setAttribute('data-element-id', item.id);
    elementItem.setAttribute('data-element-level', item.level);
    elementItem.draggable = true;
    
    // 设置元素图标
    const iconElement = document.createElement('div');
    iconElement.className = `element-icon element-${item.id}`;
    
    // 设置元素数量
    const countElement = document.createElement('div');
    countElement.className = 'element-count';
    countElement.textContent = item.count;
    
    // 设置元素等级
    const levelElement = document.createElement('div');
    levelElement.className = 'element-level';
    levelElement.textContent = `Lv.${item.level}`;
    
    elementItem.appendChild(iconElement);
    elementItem.appendChild(countElement);
    elementItem.appendChild(levelElement);
    
    // 添加拖拽事件
    elementItem.addEventListener('dragstart', (e) => {
      this.state.draggedElement = item;
      e.dataTransfer.effectAllowed = 'copy';
    });
    
    // 添加点击事件
    elementItem.addEventListener('click', () => {
      this.selectElementForSynthesis(item);
    });
    
    return elementItem;
  },
  
  // 选择元素进行合成
  selectElementForSynthesis(item) {
    const slots = this.components.synthesisSlots;
    
    // 查找空槽位
    const emptySlot = slots.find(slot => !slot.hasAttribute('data-element-id'));
    
    if (!emptySlot) {
      // 没有空槽位，替换第一个槽位
      slots[0].removeAttribute('data-element-id');
      slots[0].innerHTML = '';
      
      // 从选中列表中移除
      const index = this.state.selectedElements.findIndex(el => el.slot === slots[0]);
      if (index !== -1) {
        this.state.selectedElements.splice(index, 1);
      }
      
      // 使用第一个槽位
      this.fillSynthesisSlot(slots[0], item);
    } else {
      // 使用空槽位
      this.fillSynthesisSlot(emptySlot, item);
    }
    
    // 更新合成预览
    this.updateSynthesisPreview();
  },
  
  // 填充合成槽位
  fillSynthesisSlot(slot, item) {
    slot.setAttribute('data-element-id', item.id);
    slot.innerHTML = '';
    
    // 创建槽位内的元素显示
    const slotElement = document.createElement('div');
    slotElement.className = 'slot-element';
    
    const iconElement = document.createElement('div');
    iconElement.className = `element-icon element-${item.id}`;
    
    slotElement.appendChild(iconElement);
    slot.appendChild(slotElement);
    
    // 添加到选中列表
    this.state.selectedElements.push({ slot, item });
    
    // 添加点击移除事件
    slotElement.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeFromSynthesisSlot(slot);
    });
  },
  
  // 从合成槽位移除
  removeFromSynthesisSlot(slot) {
    slot.removeAttribute('data-element-id');
    slot.innerHTML = '';
    
    // 从选中列表中移除
    const index = this.state.selectedElements.findIndex(el => el.slot === slot);
    if (index !== -1) {
      this.state.selectedElements.splice(index, 1);
    }
    
    // 更新合成预览
    this.updateSynthesisPreview();
  },
  
  // 更新合成预览
  updateSynthesisPreview() {
    const resultPreview = document.querySelector('#synthesis-result .result-preview');
    const synthesizeBtn = document.getElementById('synthesize-btn');
    
    if (this.state.selectedElements.length !== 3) {
      resultPreview.textContent = '?';
      synthesizeBtn.disabled = true;
      return;
    }
    
    // 检查是否是相同元素
    const elementIds = this.state.selectedElements.map(el => el.item.id);
    const isSameElement = elementIds.every(id => id === elementIds[0]);
    
    if (!isSameElement) {
      resultPreview.textContent = 'X';
      synthesizeBtn.disabled = true;
      return;
    }
    
    // 计算合成结果
    const result = GlobalObject.GameManager.calculateSynthesisResult(elementIds[0]);
    
    if (result) {
      resultPreview.textContent = result.name;
      synthesizeBtn.disabled = false;
    } else {
      resultPreview.textContent = 'MAX';
      synthesizeBtn.disabled = true;
    }
  },
  
  // 执行合成
  performSynthesis() {
    if (this.state.selectedElements.length !== 3) return;
    
    const elementIds = this.state.selectedElements.map(el => el.item.id);
    const isSameElement = elementIds.every(id => id === elementIds[0]);
    
    if (!isSameElement) return;
    
    // 调用游戏管理器的合成方法
    const success = GlobalObject.GameManager.synthesizeElements(elementIds[0]);
    
    if (success) {
      // 清空合成槽位
      this.components.synthesisSlots.forEach(slot => {
        slot.removeAttribute('data-element-id');
        slot.innerHTML = '';
      });
      
      this.state.selectedElements = [];
      
      // 更新界面
      this.updateInventoryGrid();
      this.updateSynthesisPreview();
    }
  },
  
  // 更新合成槽位
  updateSynthesisSlots() {
    // 清空槽位
    this.components.synthesisSlots.forEach(slot => {
      slot.removeAttribute('data-element-id');
      slot.innerHTML = '';
    });
    
    // 清空选中列表
    this.state.selectedElements = [];
    
    // 更新预览
    this.updateSynthesisPreview();
  },
  
  // 更新图鉴网格
  updateCollectionGrid() {
    const collectionGrid = this.components.collectionGrid;
    if (!collectionGrid) return;
    
    // 清空现有内容
    collectionGrid.innerHTML = '';
    
    // 获取图鉴数据
    const collection = GlobalObject.GameManager.gameData.collection;
    
    // 创建图鉴项
    for (const [elementId, elementData] of Object.entries(collection)) {
      const collectionItem = this.createCollectionItem(elementId, elementData);
      collectionGrid.appendChild(collectionItem);
    }
  },
  
  // 创建图鉴项
  createCollectionItem(elementId, elementData) {
    const collectionItem = document.createElement('div');
    collectionItem.className = `collection-item ${elementData.unlocked ? 'unlocked' : 'locked'}`;
    collectionItem.setAttribute('data-element-id', elementId);
    
    // 设置元素图标
    const iconElement = document.createElement('div');
    iconElement.className = `element-icon element-${elementId}`;
    
    // 设置元素名称
    const nameElement = document.createElement('div');
    nameElement.className = 'element-name';
    const parts = elementId.split('_');
    const elementName = GlobalObject.GameManager.getElementName(parts[0]);
    const level = parts[1];
    nameElement.textContent = `${elementName} Lv.${level}`;
    
    // 设置元素数量
    const countElement = document.createElement('div');
    countElement.className = 'element-count';
    countElement.textContent = elementData.count;
    
    collectionItem.appendChild(iconElement);
    collectionItem.appendChild(nameElement);
    collectionItem.appendChild(countElement);
    
    // 添加点击事件
    collectionItem.addEventListener('click', () => {
      this.showElementDetail(elementId);
    });
    
    return collectionItem;
  },
  
  // 显示元素详情
  showElementDetail(elementId) {
    // 这里应该显示元素详情弹窗
    console.log('显示元素详情:', elementId);
  },
  
  // 更新图鉴统计
  updateCollectionStats() {
    const collection = GlobalObject.GameManager.gameData.collection;
    const totalElements = Object.keys(collection).length;
    const unlockedElements = Object.values(collection).filter(item => item.unlocked).length;
    
    // 更新收集进度
    const progressElement = document.getElementById('collection-progress');
    if (progressElement) {
      progressElement.textContent = `${unlockedElements}/${totalElements}`;
    }
    
    // 计算收集加成
    const collectionBonus = unlockedElements * 0.1; // 每个解锁元素提供10%加成
    
    // 更新收集加成
    const bonusElement = document.getElementById('collection-bonus');
    if (bonusElement) {
      bonusElement.textContent = `${(collectionBonus * 100).toFixed(0)}%`;
    }
  },
  
  // 更新装饰物品
  updateDecorationItems() {
    const decorationItems = this.components.decorationItems;
    if (!decorationItems) return;
    
    // 清空现有内容
    decorationItems.innerHTML = '';
    
    // 获取背包中的装饰物品
    const inventory = GlobalObject.GameManager.gameData.inventory;
    
    // 筛选出可装饰的元素（高级元素）
    const decorations = inventory.filter(item => item.level >= 5);
    
    // 创建装饰项
    decorations.forEach(item => {
      if (item.count > 0) {
        const decorationItem = this.createDecorationItem(item);
        decorationItems.appendChild(decorationItem);
      }
    });
  },
  
  // 创建装饰项
  createDecorationItem(item) {
    const decorationItem = document.createElement('div');
    decorationItem.className = 'decoration-item';
    decorationItem.setAttribute('data-element-id', item.id);
    
    // 设置装饰图标
    const iconElement = document.createElement('div');
    iconElement.className = `decoration-icon decoration-${item.id}`;
    
    // 设置装饰名称
    const nameElement = document.createElement('div');
    nameElement.className = 'decoration-name';
    const parts = item.id.split('_');
    const elementName = GlobalObject.GameManager.getElementName(parts[0]);
    nameElement.textContent = elementName;
    
    // 设置装饰数量
    const countElement = document.createElement('div');
    countElement.className = 'decoration-count';
    countElement.textContent = item.count;
    
    decorationItem.appendChild(iconElement);
    decorationItem.appendChild(nameElement);
    decorationItem.appendChild(countElement);
    
    // 添加点击事件
    decorationItem.addEventListener('click', () => {
      this.selectDecorationForPlacement(item);
    });
    
    return decorationItem;
  },
  
  // 选择装饰进行放置
  selectDecorationForPlacement(item) {
    // 进入装饰放置模式
    this.state.selectedDecoration = item;
    
    // 高亮可放置的槽位
    const planetView = this.components.planetView;
    const decorationSlots = planetView.querySelectorAll('.decoration-slot');
    
    decorationSlots.forEach(slot => {
      slot.classList.add('highlight');
    });
    
    // 显示提示
    this.showMessage('选择装饰位置', '点击星球上的高亮区域来放置装饰');
  },
  
  // 更新星球视图
  updatePlanetView() {
    const planetView = this.components.planetView;
    if (!planetView) return;
    
    // 清除现有装饰和槽位
    const existingElements = planetView.querySelectorAll('.decoration-slot, .planet-decoration');
    existingElements.forEach(element => element.remove());
    
    // 添加装饰槽位
    const slotPositions = [
      { id: 'slot1', top: '20%', left: '30%' },
      { id: 'slot2', top: '40%', left: '60%' },
      { id: 'slot3', top: '60%', left: '25%' },
      { id: 'slot4', top: '70%', left: '70%' },
      { id: 'slot5', top: '30%', left: '50%' }
    ];
    
    slotPositions.forEach(position => {
      const slot = document.createElement('div');
      slot.className = 'decoration-slot';
      slot.id = position.id;
      slot.style.position = 'absolute';
      slot.style.top = position.top;
      slot.style.left = position.left;
      slot.style.width = '40px';
      slot.style.height = '40px';
      slot.style.border = '2px dashed rgba(255, 255, 255, 0.5)';
      slot.style.borderRadius = '50%';
      
      // 添加点击事件
      slot.addEventListener('click', () => {
        this.placeDecoration(position.id);
      });
      
      planetView.appendChild(slot);
    });
    
    // 添加已放置的装饰
    const decorations = GlobalObject.GameManager.gameData.decorations;
    for (const [slotId, decorationId] of Object.entries(decorations)) {
      const decorationElement = document.createElement('div');
      decorationElement.className = `planet-decoration ${decorationId}`;
      decorationElement.style.position = 'absolute';
      
      // 设置装饰样式
      this.setDecorationStyle(decorationElement, decorationId, slotId);
      
      planetView.appendChild(decorationElement);
    }
  },
  
  // 放置装饰
  placeDecoration(slotId) {
    if (!this.state.selectedDecoration) return;
    
    // 检查槽位是否已有装饰
    const decorations = GlobalObject.GameManager.gameData.decorations;
    if (decorations[slotId]) {
      this.showMessage('提示', '该位置已有装饰，请先移除原有装饰');
      return;
    }
    
    // 放置装饰
    decorations[slotId] = this.state.selectedDecoration.id;
    
    // 减少装饰数量
    this.state.selectedDecoration.count -= 1;
    
    // 清除选中状态
    this.state.selectedDecoration = null;
    
    // 取消高亮
    const planetView = this.components.planetView;
    const decorationSlots = planetView.querySelectorAll('.decoration-slot');
    decorationSlots.forEach(slot => {
      slot.classList.remove('highlight');
    });
    
    // 更新界面
    this.updatePlanetView();
    this.updateDecorationItems();
    
    // 保存游戏数据
    GlobalObject.GameManager.saveGameData();
  },
  
  // 更新任务列表
  updateTaskList() {
    const taskList = this.components.taskList;
    if (!taskList) return;
    
    // 清空现有内容
    taskList.innerHTML = '';
    
    // 获取任务数据
    const tasks = GlobalObject.GameManager.gameData.tasks;
    
    // 创建任务项
    for (const [taskId, taskData] of Object.entries(tasks)) {
      const taskItem = this.createTaskItem(taskId, taskData);
      taskList.appendChild(taskItem);
    }
  },
  
  // 创建任务项
  createTaskItem(taskId, taskData) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${taskData.completed ? 'completed' : ''}`;
    taskItem.setAttribute('data-task-id', taskId);
    
    // 任务图标
    const iconElement = document.createElement('div');
    iconElement.className = 'task-icon';
    
    // 任务名称
    const nameElement = document.createElement('div');
    nameElement.className = 'task-name';
    nameElement.textContent = taskData.name;
    
    // 任务描述
    const descElement = document.createElement('div');
    descElement.className = 'task-desc';
    descElement.textContent = taskData.description;
    
    // 任务进度
    const progressElement = document.createElement('div');
    progressElement.className = 'task-progress';
    progressElement.textContent = `${taskData.current}/${taskData.target}`;
    
    // 任务奖励
    const rewardElement = document.createElement('div');
    rewardElement.className = 'task-reward';
    rewardElement.textContent = `奖励: ${taskData.reward}`;
    
    // 领取按钮
    const claimButton = document.createElement('button');
    claimButton.className = 'claim-btn';
    claimButton.textContent = taskData.completed ? '领取' : '未完成';
    claimButton.disabled = !taskData.completed;
    
    taskItem.appendChild(iconElement);
    taskItem.appendChild(nameElement);
    taskItem.appendChild(descElement);
    taskItem.appendChild(progressElement);
    taskItem.appendChild(rewardElement);
    taskItem.appendChild(claimButton);
    
    // 添加领取事件
    claimButton.addEventListener('click', () => {
      this.claimTaskReward(taskId);
    });
    
    return taskItem;
  },
  
  // 领取任务奖励
  claimTaskReward(taskId) {
    const task = GlobalObject.GameManager.gameData.tasks[taskId];
    if (!task || !task.completed) return;
    
    // 发放奖励
    // 这里应该根据任务类型发放不同奖励
    GlobalObject.GameManager.gameData.resources.coins += task.coinsReward || 0;
    GlobalObject.GameManager.gameData.resources.diamonds += task.diamondsReward || 0;
    
    // 标记任务已领取
    task.claimed = true;
    
    // 播放成就音效
    if (GlobalObject.GameManager && GlobalObject.GameManager.audioManager) {
      GlobalObject.GameManager.audioManager.playAchievement();
    }
    
    // 更新界面
    this.updateTaskList();
    this.updateResourceDisplay();
    
    // 保存游戏数据
    GlobalObject.GameManager.saveGameData();
    
    this.showMessage('奖励领取', '任务奖励已发放');
  },
  
  // 更新商店物品
  updateShopItems() {
    const shopItems = this.components.shopItems;
    if (!shopItems) return;
    
    // 清空现有内容
    shopItems.innerHTML = '';
    
    // 创建商店物品
    const shopData = this.getShopData();
    
    shopData.forEach(item => {
      const shopItem = this.createShopItem(item);
      shopItems.appendChild(shopItem);
    });
  },
  
  // 获取商店数据
  getShopData() {
    return [
      {
        id: 'newbie_pack',
        name: '新手礼包',
        description: '包含陨石、金币和钻石',
        price: 0,
        type: 'free',
        icon: 'gift',
        reward: { meteorite: 50, coins: 500, diamonds: 10 }
      },
      {
        id: 'small_diamond_pack',
        name: '小钻石包',
        description: '60钻石 + 10赠送',
        price: 6,
        type: 'iap',
        icon: 'diamond',
        reward: { diamonds: 70 }
      },
      {
        id: 'medium_diamond_pack',
        name: '中钻石包',
        description: '300钻石 + 50赠送',
        price: 30,
        type: 'iap',
        icon: 'diamond',
        reward: { diamonds: 350 }
      },
      {
        id: 'large_diamond_pack',
        name: '大钻石包',
        description: '980钻石 + 200赠送',
        price: 98,
        type: 'iap',
        icon: 'diamond',
        reward: { diamonds: 1180 }
      }
    ];
  },
  
  // 创建商店项
  createShopItem(item) {
    const shopItem = document.createElement('div');
    shopItem.className = 'shop-item';
    shopItem.setAttribute('data-item-id', item.id);
    
    // 商店图标
    const iconElement = document.createElement('div');
    iconElement.className = `shop-icon ${item.icon}-icon`;
    
    // 商店名称
    const nameElement = document.createElement('div');
    nameElement.className = 'shop-name';
    nameElement.textContent = item.name;
    
    // 商店描述
    const descElement = document.createElement('div');
    descElement.className = 'shop-desc';
    descElement.textContent = item.description;
    
    // 商店价格
    const priceElement = document.createElement('div');
    priceElement.className = 'shop-price';
    if (item.type === 'free') {
      priceElement.textContent = '免费';
    } else if (item.type === 'ad') {
      priceElement.textContent = '观看广告';
    } else {
      priceElement.textContent = `¥${item.price}`;
    }
    
    // 购买按钮
    const buyButton = document.createElement('button');
    buyButton.className = 'buy-btn';
    buyButton.textContent = item.type === 'free' ? '领取' : '购买';
    
    shopItem.appendChild(iconElement);
    shopItem.appendChild(nameElement);
    shopItem.appendChild(descElement);
    shopItem.appendChild(priceElement);
    shopItem.appendChild(buyButton);
    
    // 添加购买事件
    buyButton.addEventListener('click', () => {
      this.purchaseShopItem(item);
    });
    
    return shopItem;
  },
  
  // 购买商店物品
  purchaseShopItem(item) {
    if (item.type === 'free') {
      // 免费领取
      this.giveShopItemReward(item);
    } else if (item.type === 'ad') {
      // 观看广告领取
      GlobalObject.GameManager.watchAdForReward('shop_item');
    } else {
      // 内购
      this.processIAP(item);
    }
  },
  
  // 发放商店物品奖励
  giveShopItemReward(item) {
    const reward = item.reward;
    
    // 添加奖励到游戏数据
    if (reward.meteorite) {
      GlobalObject.GameManager.gameData.resources.meteorite += reward.meteorite;
    }
    if (reward.coins) {
      GlobalObject.GameManager.gameData.resources.coins += reward.coins;
    }
    if (reward.diamonds) {
      GlobalObject.GameManager.gameData.resources.diamonds += reward.diamonds;
    }
    
    // 更新界面
    this.updateResourceDisplay();
    
    // 保存游戏数据
    GlobalObject.GameManager.saveGameData();
    
    this.showMessage('领取成功', `已获得${item.name}奖励`);
  },
  
  // 处理内购
  processIAP(item) {
    // 这里应该调用微信支付API
    console.log('处理内购:', item);
    
    // 模拟内购成功
    setTimeout(() => {
      this.giveShopItemReward(item);
    }, 1000);
  },
  
  // 更新标签页内容
  updateTabContent(container, tab) {
    // 根据容器和标签页更新内容
    // 这里应该根据不同的容器和标签页执行不同的更新逻辑
    console.log('更新标签页内容:', container.id, tab);
    
    // 刷新当前面板
    this.refreshPanel(this.state.currentPanel);
  },
  
  // 显示广告奖励对话框
  showAdRewardDialog() {
    const messageBox = this.components.messageBox;
    const titleElement = document.getElementById('message-title');
    const textElement = document.getElementById('message-text');
    const confirmButton = document.getElementById('message-confirm');
    const cancelButton = document.getElementById('message-cancel');
    
    titleElement.textContent = '免费奖励';
    textElement.innerHTML = `
      <div class="ad-reward-options">
        <button class="ad-option" data-reward="instantHarvest">
          <div class="ad-option-icon harvest-icon"></div>
          <div class="ad-option-title">立即收获</div>
          <div class="ad-option-desc">获得4小时离线产出</div>
        </button>
        <button class="ad-option" data-reward="synthesisBoost">
          <div class="ad-option-icon synthesis-icon"></div>
          <div class="ad-option-title">合成加速</div>
          <div class="ad-option-desc">下一次合成瞬间完成</div>
        </button>
        <button class="ad-option" data-reward="doubleIncome">
          <div class="ad-option-icon income-icon"></div>
          <div class="ad-option-title">双倍收益</div>
          <div class="ad-option-desc">30分钟内所有产出翻倍</div>
        </button>
        <button class="ad-option" data-reward="extraChance">
          <div class="ad-option-icon chance-icon"></div>
          <div class="ad-option-title">额外机会</div>
          <div class="ad-option-desc">合成失败时保留材料</div>
        </button>
      </div>
    `;
    
    confirmButton.textContent = '关闭';
    confirmButton.onclick = () => {
      messageBox.classList.add('hidden');
    };
    
    cancelButton.style.display = 'none';
    
    // 绑定广告选项点击事件
    const adOptions = textElement.querySelectorAll('.ad-option');
    adOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const rewardType = e.currentTarget.getAttribute('data-reward');
        GlobalObject.GameManager.watchAdForReward(rewardType);
        messageBox.classList.add('hidden');
      });
    });
    
    messageBox.classList.remove('hidden');
  },
  
  // 显示消息
  showMessage(title, text) {
    const messageBox = this.components.messageBox;
    const titleElement = document.getElementById('message-title');
    const textElement = document.getElementById('message-text');
    const confirmButton = document.getElementById('message-confirm');
    const cancelButton = document.getElementById('message-cancel');
    
    titleElement.textContent = title;
    textElement.textContent = text;
    
    confirmButton.textContent = '确定';
    confirmButton.onclick = () => {
      messageBox.classList.add('hidden');
    };
    
    cancelButton.style.display = 'none';
    
    messageBox.classList.remove('hidden');
  },
  
  // 显示加载
  showLoading(text = '加载中...') {
    const loadingMask = this.components.loadingMask;
    const loadingText = loadingMask.querySelector('.loading-text');
    
    loadingText.textContent = text;
    loadingMask.classList.remove('hidden');
  },
  
  // 隐藏加载
  hideLoading() {
    const loadingMask = this.components.loadingMask;
    loadingMask.classList.add('hidden');
  }
};