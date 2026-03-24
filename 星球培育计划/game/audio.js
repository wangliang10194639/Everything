// 星球培育计划 - 音频管理器

// 兼容不同环境的全局对象
const GlobalObject = typeof global !== 'undefined' ? global : (typeof GameGlobal !== 'undefined' ? GameGlobal : window);

GlobalObject.AudioManager = {
  // 音频上下文
  audioContext: null,
  
  // 背景音乐
  bgMusic: null,
  bgMusicVolume: 0.5,
  bgMusicEnabled: true,
  
  // 音效
  soundEnabled: true,
  soundVolume: 0.7,
  
  // 音效缓存
  soundCache: {},
  
  // 初始化音频管理器
  init() {
    try {
      // 创建音频上下文
      this.audioContext = wx.createInnerAudioContext();
      
      // 设置背景音乐
      this.setupBackgroundMusic();
      
      // 预加载音效
      this.preloadSounds();
      
      console.log('音频管理器初始化成功');
    } catch (error) {
      console.error('音频管理器初始化失败:', error);
    }
  },
  
  // 设置背景音乐
  setupBackgroundMusic() {
    this.bgMusic = wx.createInnerAudioContext();
    this.bgMusic.src = 'assets/audio/background.mp3';
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.bgMusicVolume;
    
    // 监听背景音乐事件
    this.bgMusic.onCanplay(() => {
      console.log('背景音乐可以播放');
    });
    
    this.bgMusic.onError((error) => {
      console.error('背景音乐加载失败:', error);
    });
  },
  
  // 预加载音效
  preloadSounds() {
    const soundList = [
      'synthesis_success.mp3',
      'synthesis_fail.mp3',
      'collect.mp3',
      'button_click.mp3',
      'level_up.mp3',
      'achievement.mp3'
    ];
    
    soundList.forEach(soundName => {
      try {
        const sound = wx.createInnerAudioContext();
        sound.src = `assets/audio/${soundName}`;
        
        sound.onCanplay(() => {
          this.soundCache[soundName] = sound;
        });
        
        sound.onError((error) => {
          console.error(`音效 ${soundName} 加载失败:`, error);
        });
      } catch (error) {
        console.error(`创建音效 ${soundName} 失败:`, error);
      }
    });
  },
  
  // 播放背景音乐
  playBackgroundMusic() {
    if (!this.bgMusicEnabled || !this.bgMusic) return;
    
    try {
      this.bgMusic.play();
    } catch (error) {
      console.error('播放背景音乐失败:', error);
    }
  },
  
  // 暂停背景音乐
  pauseBackgroundMusic() {
    if (!this.bgMusic) return;
    
    try {
      this.bgMusic.pause();
    } catch (error) {
      console.error('暂停背景音乐失败:', error);
    }
  },
  
  // 停止背景音乐
  stopBackgroundMusic() {
    if (!this.bgMusic) return;
    
    try {
      this.bgMusic.stop();
    } catch (error) {
      console.error('停止背景音乐失败:', error);
    }
  },
  
  // 设置背景音乐音量
  setBGMusicVolume(volume) {
    this.bgMusicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.bgMusicVolume;
    }
  },
  
  // 启用/禁用背景音乐
  setBGMusicEnabled(enabled) {
    this.bgMusicEnabled = enabled;
    
    if (enabled) {
      this.playBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }
  },
  
  // 播放音效
  playSound(soundName) {
    if (!this.soundEnabled) return;
    
    const sound = this.soundCache[soundName];
    if (!sound) {
      console.warn(`音效 ${soundName} 未找到`);
      return;
    }
    
    try {
      // 设置音量
      sound.volume = this.soundVolume;
      
      // 播放音效
      sound.play();
    } catch (error) {
      console.error(`播放音效 ${soundName} 失败:`, error);
    }
  },
  
  // 设置音效音量
  setSoundVolume(volume) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
  },
  
  // 启用/禁用音效
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  },
  
  // 播放合成成功音效
  playSynthesisSuccess() {
    this.playSound('synthesis_success.mp3');
  },
  
  // 播放合成失败音效
  playSynthesisFail() {
    this.playSound('synthesis_fail.mp3');
  },
  
  // 播放收集音效
  playCollect() {
    this.playSound('collect.mp3');
  },
  
  // 播放按钮点击音效
  playButtonClick() {
    this.playSound('button_click.mp3');
  },
  
  // 播放升级音效
  playLevelUp() {
    this.playSound('level_up.mp3');
  },
  
  // 播放成就音效
  playAchievement() {
    this.playSound('achievement.mp3');
  }
};