import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
进程钩子与输入模拟模块
"""

import time
from typing import Optional, Tuple, Callable
from threading import Thread, Lock


class InputSimulator:
    """输入模拟器 - 模拟键盘和鼠标操作"""

    def __init__(self):
        self.use_pynput = False
        self.use_keyboard = False
        self.keyboard = None
        self.mouse = None
        self._init_input_libraries()

        # 按键状态
        self.key_states = {}
        self.state_lock = Lock()

    def _init_input_libraries(self):
        """初始化输入库"""
        # 尝试使用 pynput
        try:
            from pynput.keyboard import Controller as KeyboardController
            from pynput.keyboard import Key, KeyCode
            from pynput.mouse import Controller as MouseController, Button
            self.keyboard = KeyboardController()
            self.mouse = MouseController()
            self.Key = Key
            self.KeyCode = KeyCode
            self.Button = Button
            self.use_pynput = True
            print("使用 pynput 输入库")
            return
        except ImportError:
            pass

        # 尝试使用 keyboard 库
        try:
            import keyboard
            self.keyboard_lib = keyboard
            self.use_keyboard = True
            print("使用 keyboard 输入库")
            return
        except ImportError:
            pass

        print("警告: 未找到输入库，将使用模拟模式")

    def press_key(self, key: str) -> bool:
        """按下按键"""
        try:
            if self.use_pynput:
                pynput_key = self._convert_to_pynput_key(key)
                self.keyboard.press(pynput_key)
                return True
            elif self.use_keyboard:
                self.keyboard_lib.press(key)
                return True
            else:
                with self.state_lock:
                    self.key_states[key] = True
                print(f"[模拟] 按下: {key}")
                return True
        except Exception as e:
            print(f"按键按下失败: {e}")
            return False

    def release_key(self, key: str) -> bool:
        """释放按键"""
        try:
            if self.use_pynput:
                pynput_key = self._convert_to_pynput_key(key)
                self.keyboard.release(pynput_key)
                return True
            elif self.use_keyboard:
                self.keyboard_lib.release(key)
                return True
            else:
                with self.state_lock:
                    self.key_states[key] = False
                print(f"[模拟] 释放: {key}")
                return True
        except Exception as e:
            print(f"按键释放失败: {e}")
            return False

    def tap_key(self, key: str, delay: float = 0.05) -> bool:
        """点击按键（按下并释放）"""
        if self.press_key(key):
            time.sleep(delay)
            return self.release_key(key)
        return False

    def key_combination(self, keys: list) -> bool:
        """组合按键"""
        try:
            # 按下所有按键
            for key in keys:
                if not self.press_key(key):
                    # 释放已按下的键
                    for k in reversed(keys[:keys.index(key)]):
                        self.release_key(k)
                    return False
                time.sleep(0.02)

            # 释放所有按键
            for key in reversed(keys):
                self.release_key(key)
                time.sleep(0.02)

            return True
        except Exception as e:
            print(f"组合按键失败: {e}")
            return False

    def hold_key(self, key: str, duration: float) -> bool:
        """按住按键一段时间"""
        if self.press_key(key):
            time.sleep(duration)
            return self.release_key(key)
        return False

    def move_mouse(self, x: int, y: int) -> bool:
        """移动鼠标到指定位置"""
        try:
            if self.use_pynput:
                self.mouse.position = (x, y)
                return True
            else:
                print(f"[模拟] 鼠标移动到: ({x}, {y})")
                return True
        except Exception as e:
            print(f"鼠标移动失败: {e}")
            return False

    def mouse_click(self, button: str = 'left', x: Optional[int] = None,
                    y: Optional[int] = None) -> bool:
        """鼠标点击"""
        try:
            if x is not None and y is not None:
                self.move_mouse(x, y)
                time.sleep(0.02)

            if self.use_pynput:
                pynput_button = self.Button.left
                if button == 'right':
                    pynput_button = self.Button.right
                elif button == 'middle':
                    pynput_button = self.Button.middle

                self.mouse.click(pynput_button)
                return True
            else:
                print(f"[模拟] 鼠标{button}点击")
                return True
        except Exception as e:
            print(f"鼠标点击失败: {e}")
            return False

    def mouse_press(self, button: str = 'left') -> bool:
        """按下鼠标键"""
        try:
            if self.use_pynput:
                pynput_button = self.Button.left
                if button == 'right':
                    pynput_button = self.Button.right
                elif button == 'middle':
                    pynput_button = self.Button.middle

                self.mouse.press(pynput_button)
                return True
            else:
                print(f"[模拟] 按下鼠标{button}键")
                return True
        except Exception as e:
            print(f"鼠标按下失败: {e}")
            return False

    def mouse_release(self, button: str = 'left') -> bool:
        """释放鼠标键"""
        try:
            if self.use_pynput:
                pynput_button = self.Button.left
                if button == 'right':
                    pynput_button = self.Button.right
                elif button == 'middle':
                    pynput_button = self.Button.middle

                self.mouse.release(pynput_button)
                return True
            else:
                print(f"[模拟] 释放鼠标{button}键")
                return True
        except Exception as e:
            print(f"鼠标释放失败: {e}")
            return False

    def _convert_to_pynput_key(self, key: str):
        """转换按键名称到pynput格式"""
        key_map = {
            'space': self.Key.space,
            'enter': self.Key.enter,
            'esc': self.Key.esc,
            'escape': self.Key.esc,
            'tab': self.Key.tab,
            'backspace': self.Key.backspace,
            'delete': self.Key.delete,
            'shift': self.Key.shift,
            'ctrl': self.Key.ctrl,
            'alt': self.Key.alt,
            'up': self.Key.up,
            'down': self.Key.down,
            'left': self.Key.left,
            'right': self.Key.right,
            'f1': self.Key.f1,
            'f2': self.Key.f2,
            'f3': self.Key.f3,
            'f4': self.Key.f4,
            'f5': self.Key.f5,
            'f6': self.Key.f6,
            'f7': self.Key.f7,
            'f8': self.Key.f8,
            'f9': self.Key.f9,
            'f10': self.Key.f10,
            'f11': self.Key.f11,
            'f12': self.Key.f12,
            'num_1': '1',
            'num_2': '2',
            'num_3': '3',
            'num_4': '4',
            'num_5': '5',
            'num_6': '6',
            'num_7': '7',
            'num_8': '8',
            'num_9': '9',
            'num_0': '0',
        }

        if key.lower() in key_map:
            return key_map[key.lower()]

        # 处理num_格式
        if key.lower().startswith('num_'):
            return key[4:]

        return key


class KeyboardHook:
    """键盘钩子 - 监听全局热键"""

    def __init__(self):
        self.hotkeys = {}
        self.callbacks = {}
        self.is_running = False
        self.listener = None
        self.listener_thread = None

    def register_hotkey(self, hotkey: str, callback: Callable) -> bool:
        """注册热键"""
        try:
            import keyboard
            keyboard.add_hotkey(hotkey, callback)
            self.hotkeys[hotkey] = callback
            return True
        except:
            pass

        try:
            from pynput.keyboard import Listener, Key, KeyCode
            self.callbacks[hotkey] = callback
            if not self.is_running:
                self._start_pynput_listener()
            return True
        except:
            pass

        print(f"无法注册热键: {hotkey} (使用模拟模式)")
        self.hotkeys[hotkey] = callback
        return True

    def unregister_hotkey(self, hotkey: str):
        """取消注册热键"""
        if hotkey in self.hotkeys:
            try:
                import keyboard
                keyboard.remove_hotkey(hotkey)
            except:
                pass
            del self.hotkeys[hotkey]

    def _start_pynput_listener(self):
        """使用pynput启动监听"""
        def on_press(key):
            pass

        def on_release(key):
            pass

        from pynput.keyboard import Listener
        self.listener = Listener(on_press=on_press, on_release=on_release)
        self.listener_thread = Thread(target=self.listener.start, daemon=True)
        self.listener_thread.start()
        self.is_running = True

    def start(self):
        """开始监听"""
        self.is_running = True
        print("键盘钩子已启动")

    def stop(self):
        """停止监听"""
        self.is_running = False
        if self.listener:
            self.listener.stop()
        print("键盘钩子已停止")

    def simulate_hotkey(self, hotkey: str) -> bool:
        """模拟触发热键 (用于测试)"""
        if hotkey in self.hotkeys:
            self.hotkeys[hotkey]()
            return True
        return False


class ProcessHook:
    """进程钩子 - 整合内存读取和输入模拟"""

    def __init__(self):
        self.input_simulator = InputSimulator()
        self.keyboard_hook = KeyboardHook()
        self.is_initialized = False

    def initialize(self) -> bool:
        """初始化"""
        self.is_initialized = True
        return True

    def shutdown(self):
        """关闭"""
        self.keyboard_hook.stop()
        self.is_initialized = False


if __name__ == "__main__":
    # 测试输入模拟器
    simulator = InputSimulator()

    print("测试输入模拟器...")
    print("5秒后开始测试...")
    time.sleep(5)

    # 测试按键
    simulator.tap_key('a')
    time.sleep(0.5)
    simulator.tap_key('b')
    time.sleep(0.5)
    simulator.tap_key('c')

    print("测试完成")
