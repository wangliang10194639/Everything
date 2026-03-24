// 星球培育计划 - 微信小游戏
// 这个文件用于兼容微信开发者工具，同时启动小游戏

App({
  onLaunch() {
    console.log('小程序启动');
    
    // 直接启动小游戏
    if (typeof wx !== 'undefined' && wx.createGame) {
      const game = wx.createGame();
      game.start();
    }
  },
  
  onShow() {
    console.log('小程序显示');
  },
  
  onHide() {
    console.log('小程序隐藏');
  }
});