/**
 * 思齐贪吃蛇 - 数据存储管理
 * 负责本地数据存储和读取
 */

// 存储键名常量
const STORAGE_KEYS = {
  HIGH_SCORE: 'snake_highScore',
  SETTINGS: 'snake_settings',
  TOTAL_GAMES: 'snake_totalGames',
  TOTAL_SCORE: 'snake_totalScore'
};

/**
 * 存储管理器
 */
class StorageManager {
  /**
   * 获取存储数据
   * @param {string} key - 键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 返回存储的值或默认值
   */
  static get(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(key);
      if (value === null || value === undefined) {
        return defaultValue;
      }
      return value;
    } catch (e) {
      console.error('存储读取失败:', key, e);
      return defaultValue;
    }
  }

  /**
   * 设置存储数据
   * @param {string} key - 键名
   * @param {*} value - 值
   * @returns {boolean} 是否成功
   */
  static set(key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.error('存储写入失败:', key, e);
      return false;
    }
  }

  /**
   * 删除存储数据
   * @param {string} key - 键名
   */
  static remove(key) {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      console.error('存储删除失败:', key, e);
    }
  }

  /**
   * 清空所有存储数据
   */
  static clear() {
    try {
      wx.clearStorageSync();
    } catch (e) {
      console.error('存储清空失败:', e);
    }
  }

  // ========== 业务方法 ==========

  /**
   * 获取最高分
   * @returns {number} 最高分
   */
  static getHighScore() {
    return this.get(STORAGE_KEYS.HIGH_SCORE, 0);
  }

  /**
   * 设置最高分
   * @param {number} score - 分数
   * @returns {boolean} 是否更新成功
   */
  static setHighScore(score) {
    const currentHighScore = this.getHighScore();
    if (score > currentHighScore) {
      return this.set(STORAGE_KEYS.HIGH_SCORE, score);
    }
    return false;
  }

  /**
   * 获取游戏设置
   * @returns {object} 设置对象
   */
  static getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, {
      soundEnabled: true,
      vibrationEnabled: true,
      difficulty: 'normal' // easy, normal, hard
    });
  }

  /**
   * 设置游戏设置
   * @param {object} settings - 设置对象
   */
  static setSettings(settings) {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...settings };
    this.set(STORAGE_KEYS.SETTINGS, newSettings);
  }

  /**
   * 获取总游戏次数
   * @returns {number} 总次数
   */
  static getTotalGames() {
    return this.get(STORAGE_KEYS.TOTAL_GAMES, 0);
  }

  /**
   * 增加总游戏次数
   */
  static incrementTotalGames() {
    const total = this.getTotalGames() + 1;
    this.set(STORAGE_KEYS.TOTAL_GAMES, total);
    return total;
  }

  /**
   * 获取总分数
   * @returns {number} 总分数
   */
  static getTotalScore() {
    return this.get(STORAGE_KEYS.TOTAL_SCORE, 0);
  }

  /**
   * 增加总分数
   * @param {number} score - 增加的分数
   */
  static addTotalScore(score) {
    const total = this.getTotalScore() + score;
    this.set(STORAGE_KEYS.TOTAL_SCORE, total);
    return total;
  }
}

// 导出
module.exports = {
  STORAGE_KEYS,
  StorageManager
};
