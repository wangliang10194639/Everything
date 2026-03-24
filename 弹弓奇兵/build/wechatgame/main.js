// 弹弓奇兵：城堡冲刺 - 主入口文件
cc.game.onStart = function () {
    // 初始化游戏配置
    cc.view.enableRetina(true);
    cc.view.setDesignResolutionSize(750, 1334, cc.ResolutionPolicy.FIXED_WIDTH);
    cc.view.resizeWithBrowserSize(true);
    
    // 加载启动场景
    cc.director.loadScene('LaunchScene');
};

cc.game.run();