/**
 * 思齐贪吃蛇 - 游戏工具函数
 * 包含常用的游戏辅助函数
 */

// 游戏常量
const GAME_CONSTANTS = {
  // 网格配置
  GRID_SIZE: 20,           // 网格大小（像素）
  GRID_WIDTH: 20,          // 网格列数
  GRID_HEIGHT: 30,         // 网格行数

  // 速度配置（毫秒）
  INITIAL_SPEED: 150,      // 初始速度
  MIN_SPEED: 75,           // 最高速度（最快）
  SPEED_INCREMENT: 5,      // 每次提速百分比
  SPEED_THRESHOLD: 10,     // 提速间隔（分数）

  // 分数配置
  FOOD_SCORE: 1,           // 普通食物分数
  LIFE_ITEM_SCORE: 5,      // 生命道具分数
  WALL_PASS_COST: 5,       // 穿墙消耗分数

  // 生命配置
  INITIAL_LIVES: 3,        // 初始生命
  MAX_LIVES: 3,            // 最大生命
  LIFE_ITEM_THRESHOLD: 20, // 生命道具出现间隔

  // 穿墙模式
  WALL_PASS_THRESHOLD: 30, // 穿墙模式解锁分数

  // 颜色配置
  COLORS: {
    // 背景色
    BACKGROUND: '#0f172a',
    GRID: '#1e293b',

    // 蛇的颜色
    SNAKE_HEAD: '#10b981',
    SNAKE_BODY: '#14b8a6',

    // 食物颜色
    FOOD_NORMAL: '#f43f5e',
    FOOD_LIFE: '#ef4444',

    // UI颜色
    BUTTON_PRIMARY: '#8b5cf6',
    BUTTON_SECONDARY: '#3b82f6',
    TEXT_WHITE: '#ffffff',
    TEXT_SECONDARY: '#94a3b8',
    PANEL_BACKGROUND: 'rgba(0, 0, 0, 0.7)'
  }
};

/**
 * 工具函数类
 */
class GameUtils {
  /**
   * 格式化分数显示
   * @param {number} score - 分数
   * @returns {string} 格式化后的分数字符串
   */
  static formatScore(score) {
    return score.toLocaleString();
  }

  /**
   * 格式化时间显示
   * @param {number} seconds - 秒数
   * @returns {string} 格式化的时间字符串 MM:SS
   */
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 计算速度（根据分数）
   * @param {number} score - 当前分数
   * @returns {number} 速度（毫秒）
   */
  static calculateSpeed(score) {
    const speedIncrements = Math.floor(score / GAME_CONSTANTS.SPEED_THRESHOLD);
    const speedMultiplier = 1 - (speedIncrements * GAME_CONSTANTS.SPEED_INCREMENT / 100);
    const finalSpeed = GAME_CONSTANTS.INITIAL_SPEED * speedMultiplier;
    return Math.max(finalSpeed, GAME_CONSTANTS.MIN_SPEED);
  }

  /**
   * 检查是否可以穿墙
   * @param {number} score - 当前分数
   * @returns {boolean} 是否可以穿墙
   */
  static canWallPass(score) {
    return score >= GAME_CONSTANTS.WALL_PASS_THRESHOLD;
  }

  /**
   * 检查是否应该出现生命道具
   * @param {number} score - 当前分数
   * @param {number} lastLifeItemScore - 上次出现生命道具的分数
   * @returns {boolean} 是否应该出现
   */
  static shouldSpawnLifeItem(score, lastLifeItemScore) {
    return score - lastLifeItemScore >= GAME_CONSTANTS.LIFE_ITEM_THRESHOLD;
  }

  /**
   * 生成随机位置
   * @param {Array} snakeBody - 蛇身数组
   * @param {Array} obstacles - 障碍物数组（可选）
   * @returns {object} 随机位置 {x, y}
   */
  static generateRandomPosition(snakeBody, obstacles = []) {
    let position;
    let isValid = false;
    const maxAttempts = 100;
    let attempts = 0;

    while (!isValid && attempts < maxAttempts) {
      position = {
        x: Math.floor(Math.random() * GAME_CONSTANTS.GRID_WIDTH),
        y: Math.floor(Math.random() * GAME_CONSTANTS.GRID_HEIGHT)
      };

      // 检查是否与蛇身重叠
      const isOnSnake = snakeBody.some(segment =>
        segment.x === position.x && segment.y === position.y
      );

      // 检查是否与障碍物重叠
      const isOnObstacle = obstacles.some(obs =>
        obs.x === position.x && obs.y === position.y
      );

      if (!isOnSnake && !isOnObstacle) {
        isValid = true;
      }

      attempts++;
    }

    return position || { x: 0, y: 0 };
  }

  /**
   * 检查两个位置是否相邻
   * @param {object} pos1 - 位置1 {x, y}
   * @param {object} pos2 - 位置2 {x, y}
   * @returns {boolean} 是否相邻
   */
  static isAdjacent(pos1, pos2) {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  /**
   * 获取方向名称
   * @param {string} direction - 方向 ('up', 'down', 'left', 'right')
   * @returns {string} 方向中文名称
   */
  static getDirectionName(direction) {
    const names = {
      up: '上',
      down: '下',
      left: '左',
      right: '右'
    };
    return names[direction] || direction;
  }

  /**
   * 获取相反方向
   * @param {string} direction - 方向
   * @returns {string} 相反方向
   */
  static getOppositeDirection(direction) {
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };
    return opposites[direction] || direction;
  }

  /**
   * 深度克隆对象
   * @param {*} obj - 要克隆的对象
   * @returns {*} 克隆后的对象
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 限制数值范围
   * @param {number} value - 数值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 限制后的数值
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * 线性插值
   * @param {number} start - 起始值
   * @param {number} end - 结束值
   * @param {number} t - 插值因子 (0-1)
   * @returns {number} 插值结果
   */
  static lerp(start, end, t) {
    return start + (end - start) * t;
  }

  /**
   * 平滑过渡值
   * @param {number} current - 当前值
   * @param {number} target - 目标值
   * @param {number} factor - 过渡因子 (0-1)
   * @returns {number} 平滑后的值
   */
  static smoothStep(current, target, factor) {
    return this.lerp(current, target, factor);
  }
}

// 导出
module.exports = {
  GAME_CONSTANTS,
  GameUtils
};
