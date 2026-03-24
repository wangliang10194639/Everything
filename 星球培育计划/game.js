// 星球培育计划 - 微信小游戏入口文件

// 兼容不同环境的全局对象
const GlobalObject = typeof global !== 'undefined' ? global : (typeof GameGlobal !== 'undefined' ? GameGlobal : window);

// 导入游戏配置
import './game/config.js';

// 导入音频管理器
import './game/audio.js';

// 导入游戏逻辑
import './game/main.js';

// 导入UI管理
import './game/ui.js';

// 游戏初始化
// 注意：wx.onLaunch 已废弃，使用 wx.getLaunchOptionsSync() 代替
try {
  const launchOptions = wx.getLaunchOptionsSync();
  console.log('小游戏启动选项:', launchOptions);
} catch (error) {
  console.log('获取启动选项失败，可能是非微信环境:', error);
}

// 等待DOM加载完成
if (document.readyState === 'complete') {
  initGame();
} else {
  document.addEventListener('DOMContentLoaded', initGame);
}

// 初始化游戏
function initGame() {
  console.log('DOM加载完成，初始化游戏');
  
  // 添加调试信息
  console.log('当前环境:', typeof wx !== 'undefined' ? '微信小游戏' : '其他环境');
  console.log('GlobalObject.GameManager:', typeof GlobalObject.GameManager);
  console.log('GlobalObject.UIManager:', typeof GlobalObject.UIManager);
  console.log('document.body:', document.body);
  
  // 加载游戏样式
  loadGameStyles(() => {
    console.log('样式加载完成，开始初始化游戏');
    
    // 初始化游戏
    if (typeof GlobalObject.GameManager !== 'undefined') {
      GlobalObject.GameManager.init();
      
      // 检查UI是否正确创建
      setTimeout(() => {
        const mainPanel = document.getElementById('main-panel');
        console.log('主面板元素:', mainPanel);
        if (mainPanel) {
          console.log('主面板样式:', window.getComputedStyle(mainPanel));
          console.log('主面板是否可见:', mainPanel.offsetWidth > 0 && mainPanel.offsetHeight > 0);
        } else {
          console.error('未找到主面板元素');
        }
        
        // 检查资源显示
        const meteoriteCount = document.getElementById('meteorite-count');
        console.log('陨石数量元素:', meteoriteCount);
        if (meteoriteCount) {
          console.log('陨石数量文本:', meteoriteCount.textContent);
        }
      }, 1000);
    } else {
      console.error('GameManager未定义，游戏初始化失败');
    }
  });
}

// 加载游戏样式
function loadGameStyles(callback) {
  console.log('开始加载游戏样式...');
  
  // 创建样式元素
  const styleElement = document.createElement('style');
  
  // 直接使用内联样式，避免文件加载问题
  console.log('直接使用内联样式，避免文件加载问题');
  useFallbackStyles(styleElement, callback);
}

// 使用内联样式作为后备方案
function useFallbackStyles(styleElement, callback) {
  // 尝试使用内联样式作为后备方案
  console.log('使用内联样式作为主要方案');
  styleElement.textContent = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      background-color: #0a0e27;
      color: #ffffff;
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      overflow: hidden;
    }
    
    .panel {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #0a0e27;
      display: flex;
      flex-direction: column;
      z-index: 10;
    }
    
    .resource-bar {
      display: flex;
      justify-content: space-around;
      padding: 10px;
      background-color: rgba(15, 20, 40, 0.9);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .resource-item {
      display: flex;
      align-items: center;
    }
    
    .resource-icon {
      width: 24px;
      height: 24px;
      margin-right: 5px;
      background-color: #6a5acd;
      border-radius: 50%;
    }
    
    .meteorite-icon {
      background-color: #8b7355;
    }
    
    .coins-icon {
      background-color: #ffd700;
    }
    
    .diamonds-icon {
      background-color: #00bfff;
    }
    
    .resource-value {
      color: #ffffff;
      font-size: 16px;
    }
    
    .planet-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .planet-display {
      width: 200px;
      height: 200px;
      background-color: #4a4a4a;
      border-radius: 50%;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(106, 90, 205, 0.5);
    }
    
    .planet-base {
      width: 180px;
      height: 180px;
      background-color: #6a5acd;
      border-radius: 50%;
      position: relative;
    }
    
    .planet-info {
      text-align: center;
    }
    
    .planet-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .planet-level {
      font-size: 14px;
      color: #b8c5d6;
    }
    
    .main-buttons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      padding: 10px;
    }
    
    .main-btn {
      width: 80px;
      height: 80px;
      margin: 5px;
      background-color: rgba(106, 90, 205, 0.8);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .main-btn:hover {
      background-color: rgba(106, 90, 205, 1);
    }
    
    .btn-icon {
      width: 30px;
      height: 30px;
      margin-bottom: 5px;
      background-color: white;
      border-radius: 50%;
    }
    
    .btn-text {
      font-size: 12px;
    }
    
    .bottom-bar {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background-color: rgba(15, 20, 40, 0.9);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .bottom-btn {
      width: 40px;
      height: 40px;
      background-color: rgba(106, 90, 205, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      border: none;
      cursor: pointer;
    }
    
    .ad-reward-btn {
      width: auto;
      padding: 0 15px;
      border-radius: 20px;
      background-color: #ff6b6b;
    }
    
    .hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(styleElement);
  console.log('内联样式已添加到DOM');
  
  // 即使样式加载失败也执行回调，确保游戏能启动
  if (typeof callback === 'function') {
    callback();
  }
}

// 游戏显示
wx.onShow((res) => {
  console.log('小游戏显示', res);
  
  // 恢复游戏
  if (typeof GlobalObject.GameManager !== 'undefined') {
    GlobalObject.GameManager.resume();
  }
});

// 游戏隐藏
wx.onHide(() => {
  console.log('小游戏隐藏');
  
  // 暂停游戏
  if (typeof GlobalObject.GameManager !== 'undefined') {
    GlobalObject.GameManager.pause();
  }
});

// 游戏错误处理
wx.onError((error) => {
  console.error('小游戏错误:', error);
});

// 游戏内存警告
wx.onMemoryWarning((res) => {
  console.warn('内存警告:', res.level);
  
  // 清理资源
  if (typeof GlobalObject.GameManager !== 'undefined') {
    GlobalObject.GameManager.clearCache();
  }
});