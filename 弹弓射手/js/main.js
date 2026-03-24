import 'render'; // 初始化Canvas
import GameScene from 'scenes/GameScene'; // 导入主游戏场景
import Music from 'runtime/music'; // 导入音乐类
import DataBus from 'databus'; // 导入数据总线

const ctx = canvas.getContext('2d'); // 获取canvas的2D绘图上下文

GameGlobal.databus = new DataBus(); // 全局数据管理实例
GameGlobal.musicManager = new Music(); // 全局音乐管理实例
GameGlobal.gameScene = null; // 全局游戏场景实例
GameGlobal.mainInstance = null; // 全局主实例

/**
 * 游戏主函数
 */
export default class Main {
  aniId = 0; // 用于存储动画帧的ID

  constructor() {
    // 初始化游戏场景
    GameGlobal.gameScene = new GameScene();
    
    // 开始游戏循环
    this.loop();
  }

  /**
   * 游戏主循环
   */
  loop() {
    // 更新游戏逻辑
    GameGlobal.gameScene.update(performance.now());
    
    // 渲染游戏画面
    GameGlobal.gameScene.render(ctx);
    
    // 请求下一帧
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * 暂停游戏
   */
  pause() {
    if (this.aniId) {
      cancelAnimationFrame(this.aniId);
      this.aniId = 0;
    }
  }

  /**
   * 恢复游戏
   */
  resume() {
    if (!this.aniId) {
      this.loop();
    }
  }
}

// 微信小游戏生命周期事件
wx.onShow(() => {
  if (GameGlobal.mainInstance) {
    GameGlobal.mainInstance.resume();
  }
});

wx.onHide(() => {
  if (GameGlobal.mainInstance) {
    GameGlobal.mainInstance.pause();
  }
});

// 创建主实例
GameGlobal.mainInstance = new Main();