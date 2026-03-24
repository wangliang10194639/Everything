// 星球培育计划 - 微信小游戏
// 这个文件用于兼容微信开发者工具，同时启动小游戏

Page({
  data: {
    
  },
  
  onLoad() {
    console.log('页面加载');
    
    // 直接启动小游戏
    if (typeof wx !== 'undefined' && wx.createGame) {
      const game = wx.createGame();
      game.start();
    }
  },
  
  onReady() {
    console.log('页面渲染完成');
  },
  
  onShow() {
    console.log('页面显示');
  },
  
  onHide() {
    console.log('页面隐藏');
  },
  
  onUnload() {
    console.log('页面卸载');
  }
});