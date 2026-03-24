// 思齐贪吃蛇 - 开放数据域
// 用于处理排行榜等需要隔离的数据

// 监听主域发送的消息
wx.onMessage(function(data) {
  if (data.type === 'getLeaderboard') {
    // 获取排行榜数据
    getLeaderboardData();
  }
});

/**
 * 获取排行榜数据
 */
function getLeaderboardData() {
  // 从本地存储获取数据
  try {
    const highScore = wx.getStorageSync('snake_highScore') || 0;

    // 发送数据回主域
    wx.postMessage({
      type: 'leaderboardData',
      data: {
        highScore: highScore,
        userScore: highScore
      }
    });
  } catch (e) {
    wx.postMessage({
      type: 'leaderboardData',
      data: {
        highScore: 0,
        userScore: 0
      }
    });
  }
}
