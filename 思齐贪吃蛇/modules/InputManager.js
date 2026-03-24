/**
 * 思齐贪吃蛇 - 输入管理器
 * 负责处理触摸和键盘输入
 */

/**
 * 输入管理器
 */
class InputManager {
  /**
   * 创建输入管理器
   * @param {Function} onDirectionChange - 方向改变回调
   * @param {Function} onPause - 暂停回调
   */
  constructor(onDirectionChange, onPause) {
    this.onDirectionChange = onDirectionChange;
    this.onPause = onPause;

    // 触摸状态
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;

    // 滑动阈值
    this.swipeThreshold = 30;
    this.tapThreshold = 200; // 毫秒

    // 键盘状态
    this.keyState = {};

    // 绑定事件
    this.bindEvents();
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 触摸事件
    if (typeof wx !== 'undefined') {
      // 微信小程序环境
      wx.onTouchStart(this.handleTouchStart.bind(this));
      wx.onTouchMove(this.handleTouchMove.bind(this));
      wx.onTouchEnd(this.handleTouchEnd.bind(this));
    } else {
      // 浏览器环境
      document.addEventListener('touchstart', this.handleTouchStart.bind(this));
      document.addEventListener('touchmove', this.handleTouchMove.bind(this));
      document.addEventListener('touchend', this.handleTouchEnd.bind(this));
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
  }

  /**
   * 处理触摸开始
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchStart(event) {
    const touch = event.touches[0] || event.changedTouches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  /**
   * 处理触摸移动
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchMove(event) {
    // 防止页面滚动
    event.preventDefault && event.preventDefault();
  }

  /**
   * 处理触摸结束
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchEnd(event) {
    const touch = event.touches[0] || event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const deltaTime = Date.now() - this.touchStartTime;

    // 判断是滑动还是点击
    if (deltaTime < this.tapThreshold && Math.abs(deltaX) < this.swipeThreshold && Math.abs(deltaY) < this.swipeThreshold) {
      // 点击事件 - 暂停/继续
      if (this.onPause) {
        this.onPause();
      }
      return;
    }

    // 滑动事件 - 改变方向
    const direction = this.detectSwipeDirection(deltaX, deltaY);
    if (direction && this.onDirectionChange) {
      this.onDirectionChange(direction);
    }
  }

  /**
   * 检测滑动方向
   * @param {number} deltaX - X轴变化
   * @param {number} deltaY - Y轴变化
   * @returns {string|null} 方向或null
   */
  detectSwipeDirection(deltaX, deltaY) {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // 确保滑动距离足够
    if (absX < this.swipeThreshold && absY < this.swipeThreshold) {
      return null;
    }

    // 判断是水平还是垂直滑动
    if (absX > absY) {
      // 水平滑动
      return deltaX > 0 ? 'right' : 'left';
    } else {
      // 垂直滑动
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  /**
   * 处理键盘按下
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyDown(event) {
    this.keyState[event.code] = true;

    const direction = this.getDirectionFromKey(event.code);
    if (direction && this.onDirectionChange) {
      this.onDirectionChange(direction);
    }

    // 空格键暂停
    if (event.code === 'Space' && this.onPause) {
      this.onPause();
    }
  }

  /**
   * 处理键盘释放
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyUp(event) {
    this.keyState[event.code] = false;
  }

  /**
   * 从按键代码获取方向
   * @param {string} code - 按键代码
   * @returns {string|null} 方向或null
   */
  getDirectionFromKey(code) {
    const keyMap = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'KeyW': 'up',
      'KeyS': 'down',
      'KeyA': 'left',
      'KeyD': 'right'
    };
    return keyMap[code] || null;
  }

  /**
   * 模拟触摸滑动
   * @param {string} direction - 方向
   */
  simulateSwipe(direction) {
    if (this.onDirectionChange) {
      this.onDirectionChange(direction);
    }
  }

  /**
   * 模拟点击
   */
  simulateTap() {
    if (this.onPause) {
      this.onPause();
    }
  }

  /**
   * 销毁输入管理器
   */
  destroy() {
    if (typeof wx !== 'undefined') {
      // 微信小程序环境 - 移除监听器
    } else {
      // 浏览器环境 - 移除事件监听器
      document.removeEventListener('touchstart', this.handleTouchStart);
      document.removeEventListener('touchmove', this.handleTouchMove);
      document.removeEventListener('touchend', this.handleTouchEnd);
      document.removeEventListener('keydown', this.handleKeyDown);
      document.removeEventListener('keyup', this.handleKeyUp);
    }
  }
}

// 导出
module.exports = InputManager;
