import Emitter from '/js/libs/tinyemitter';

/**
 * 广告管理系统
 * 处理激励视频、插屏广告、Banner广告的展示和回调
 */
export default class AdManager extends Emitter {
  constructor() {
    super();
    this.rewardedVideoAd = null;
    this.interstitialAd = null;
    this.bannerAd = null;
    this.isAdReady = false;
    
    this.init();
  }
  
  init() {
    // 初始化微信广告SDK
    this.createRewardedVideoAd();
    this.createInterstitialAd();
    this.createBannerAd();
  }
  
  // 创建激励视频广告
  createRewardedVideoAd() {
    if (wx.createRewardedVideoAd) {
      this.rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-rewarded-video-id' // 替换为实际广告位ID
      });
      
      this.rewardedVideoAd.onLoad(() => {
        console.log('激励视频广告加载成功');
        this.isAdReady = true;
        this.emit('rewardedVideoLoaded');
      });
      
      this.rewardedVideoAd.onError((err) => {
        console.error('激励视频广告加载失败', err);
        this.emit('rewardedVideoError', err);
      });
      
      this.rewardedVideoAd.onClose((res) => {
        // 用户点击了【关闭广告】按钮
        if (res && res.isEnded) {
          // 正常播放结束，可以下发游戏奖励
          this.emit('rewardedVideoSuccess');
        } else {
          // 播放中途退出，不下发游戏奖励
          this.emit('rewardedVideoSkip');
        }
      });
    }
  }
  
  // 创建插屏广告
  createInterstitialAd() {
    if (wx.createInterstitialAd) {
      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-interstitial-id' // 替换为实际广告位ID
      });
      
      this.interstitialAd.onLoad(() => {
        console.log('插屏广告加载成功');
        this.emit('interstitialLoaded');
      });
      
      this.interstitialAd.onError((err) => {
        console.error('插屏广告加载失败', err);
        this.emit('interstitialError', err);
      });
      
      this.interstitialAd.onClose(() => {
        console.log('插屏广告关闭');
        this.emit('interstitialClosed');
      });
    }
  }
  
  // 创建Banner广告
  createBannerAd() {
    if (wx.createBannerAd) {
      this.bannerAd = wx.createBannerAd({
        adUnitId: 'adunit-banner-id', // 替换为实际广告位ID
        style: {
          left: 0,
          top: 0,
          width: 300
        }
      });
      
      this.bannerAd.onLoad(() => {
        console.log('Banner广告加载成功');
        this.emit('bannerLoaded');
      });
      
      this.bannerAd.onError((err) => {
        console.error('Banner广告加载失败', err);
        this.emit('bannerError', err);
      });
    }
  }
  
  // 显示激励视频广告
  showRewardedVideo(successCallback, failCallback) {
    if (this.rewardedVideoAd) {
      this.rewardedVideoAd.show().catch(() => {
        // 失败重试加载
        this.rewardedVideoAd.load()
          .then(() => this.rewardedVideoAd.show())
          .catch(err => {
            console.error('激励视频广告显示失败', err);
            if (failCallback) failCallback(err);
          });
      });
      
      // 设置临时回调
      if (successCallback) {
        const onSuccess = () => {
          successCallback();
          this.off('rewardedVideoSuccess', onSuccess);
        };
        this.on('rewardedVideoSuccess', onSuccess);
      }
      
      if (failCallback) {
        const onError = (err) => {
          failCallback(err);
          this.off('rewardedVideoError', onError);
        };
        this.on('rewardedVideoError', onError);
      }
    }
  }
  
  // 显示插屏广告
  showInterstitial() {
    if (this.interstitialAd) {
      this.interstitialAd.show().catch((err) => {
        console.error('插屏广告显示失败', err);
      });
    }
  }
  
  // 显示Banner广告
  showBanner() {
    if (this.bannerAd) {
      this.bannerAd.show();
    }
  }
  
  // 隐藏Banner广告
  hideBanner() {
    if (this.bannerAd) {
      this.bannerAd.hide();
    }
  }
  
  // 预加载广告
  preloadAds() {
    if (this.rewardedVideoAd) {
      this.rewardedVideoAd.load();
    }
    if (this.interstitialAd) {
      this.interstitialAd.load();
    }
  }
}