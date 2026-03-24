#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Windows输入模拟模块
"""

import sys
import time
import threading
from pathlib import Path
from typing import Optional, Callable

sys.path.insert(0, str(Path(__file__).parent.parent))


class WindowsInputSimulator:
    """Windows输入模拟器"""

    def __init__(self):
        self.use_win32 = False
        self.use_pyautogui = False
        self.use_pynput = False

        self.keyboard = None
        self.mouse = None
        self.Key = None
        self.KeyCode = None
        self.Button = None

        self.key_states = {}
        self.state_lock = threading.Lock()

        self._init_input_libraries()

    def _init_input_libraries(self):
        """初始化输入库（Windows优先使用win32api）"""

        # 尝试使用 win32api (Windows原生)
        if self._try_win32():
            print("使用 win32api 输入库")
            return

        # 尝试使用 pynput
        if self._try_pynput():
            print("使用 pynput 输入库")
            return

        # 尝试使用 pyautogui
        if self._try_pyautogui():
            print("使用 pyautogui 输入库")
            return

        print("警告: 未找到输入库，将使用模拟模式")

    def _try_win32(self) -> bool:
        """尝试使用win32api"""
        try:
            import win32api
            import win32con
            import win32gui

            self.win32api = win32api
            self.win32con = win32con
            self.win32gui = win32gui
            self.use_win32 = True
            return True
        except ImportError:
            return False

    def _try_pynput(self) -> bool:
        """尝试使用pynput"""
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
            return True
        except ImportError:
            return False

    def _try_pyautogui(self) -> bool:
        """尝试使用pyautogui"""
        try:
            import pyautogui

            self.pyautogui = pyautogui
            self.use_pyautogui = True
            return True
        except ImportError:
            return False

    # ========== 键盘操作 ==========

    def press_key(self, key: str) -> bool:
        """按下按键"""
        try:
            if self.use_win32:
                vk_code = self._get_vk_code(key)
                self.win32api.keybd_event(vk_code, 0, 0, 0)
                return True
            elif self.use_pynput:
                pynput_key = self._convert_to_pynput_key(key)
                self.keyboard.press(pynput_key)
                return True
            elif self.use_pyautogui:
                self.pyautogui.keyDown(key)
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
            if self.use_win32:
                vk_code = self._get_vk_code(key)
                self.win32api.keybd_event(vk_code, 0, self.win32con.KEYEVENTF_KEYUP, 0)
                return True
            elif self.use_pynput:
                pynput_key = self._convert_to_pynput_key(key)
                self.keyboard.release(pynput_key)
                return True
            elif self.use_pyautogui:
                self.pyautogui.keyUp(key)
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

    # ========== 鼠标操作 ==========

    def move_mouse(self, x: int, y: int) -> bool:
        """移动鼠标到指定位置"""
        try:
            if self.use_win32:
                self.win32api.SetCursorPos((x, y))
                return True
            elif self.use_pynput:
                self.mouse.position = (x, y)
                return True
            elif self.use_pyautogui:
                self.pyautogui.moveTo(x, y)
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

            if self.use_win32:
                if button == 'left':
                    self.win32api.mouse_event(self.win32con.MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
                    time.sleep(0.02)
                    self.win32api.mouse_event(self.win32con.MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
                elif button == 'right':
                    self.win32api.mouse_event(self.win32con.MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0)
                    time.sleep(0.02)
                    self.win32api.mouse_event(self.win32con.MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0)
                return True
            elif self.use_pynput:
                pynput_button = self.Button.left
                if button == 'right':
                    pynput_button = self.Button.right
                elif button == 'middle':
                    pynput_button = self.Button.middle

                self.mouse.click(pynput_button)
                return True
            elif self.use_pyautogui:
                self.pyautogui.click(button=button)
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
            if self.use_win32:
                if button == 'left':
                    self.win32api.mouse_event(self.win32con.MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
                elif button == 'right':
                    self.win32api.mouse_event(self.win32con.MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0)
                return True
            elif self.use_pynput:
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
            if self.use_win32:
                if button == 'left':
                    self.win32api.mouse_event(self.win32con.MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
                elif button == 'right':
                    self.win32api.mouse_event(self.win32con.MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0)
                return True
            elif self.use_pynput:
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

    # ========== 辅助函数 ==========

    def _get_vk_code(self, key: str) -> int:
        """获取虚拟键码"""
        key_map = {
            'space': self.win32con.VK_SPACE,
            'enter': self.win32con.VK_RETURN,
            'esc': self.win32con.VK_ESCAPE,
            'escape': self.win32con.VK_ESCAPE,
            'tab': self.win32con.VK_TAB,
            'backspace': self.win32con.VK_BACK,
            'delete': self.win32con.VK_DELETE,
            'shift': self.win32con.VK_SHIFT,
            'ctrl': self.win32con.VK_CONTROL,
            'alt': self.win32con.VK_MENU,
            'up': self.win32con.VK_UP,
            'down': self.win32con.VK_DOWN,
            'left': self.win32con.VK_LEFT,
            'right': self.win32con.VK_RIGHT,
            'f1': self.win32con.VK_F1,
            'f2': self.win32con.VK_F2,
            'f3': self.win32con.VK_F3,
            'f4': self.win32con.VK_F4,
            'f5': self.win32con.VK_F5,
            'f6': self.win32con.VK_F6,
            'f7': self.win32con.VK_F7,
            'f8': self.win32con.VK_F8,
            'f9': self.win32con.VK_F9,
            'f10': self.win32con.VK_F10,
            'f11': self.win32con.VK_F11,
            'f12': self.win32con.VK_F12,
            'num_1': ord('1'),
            'num_2': ord('2'),
            'num_3': ord('3'),
            'num_4': ord('4'),
            'num_5': ord('5'),
            'num_6': ord('6'),
            'num_7': ord('7'),
            'num_8': ord('8'),
            'num_9': ord('9'),
            'num_0': ord('0'),
        }

        key_lower = key.lower()
        if key_lower in key_map:
            return key_map[key_lower]

        if key_lower.startswith('num_'):
            return ord(key[4:])

        if len(key) == 1:
            return ord(key.upper())

        return 0

    def _convert_to_pynput_key(self, key: str):
        """转换按键名称到pynput格式"""
        if not self.use_pynput or not self.Key:
            return key

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

        key_lower = key.lower()
        if key_lower in key_map:
            return key_map[key_lower]

        if key_lower.startswith('num_'):
            return key[4:]

        return key


if __name__ == "__main__":
    print("Windows输入模拟器测试")

    sim = WindowsInputSimulator()

    print(f"使用win32: {sim.use_win32}")
    print(f"使用pynput: {sim.use_pynput}")
    print(f"使用pyautogui: {sim.use_pyautogui}")

    if sim.use_win32 or sim.use_pynput or sim.use_pyautogui:
        print("\n5秒后开始测试...")
        time.sleep(5)

        print("测试按键A")
        sim.tap_key('a')
        time.sleep(0.5)

        print("测试按键B")
        sim.tap_key('b')
        time.sleep(0.5)

        print("测试按键C")
        sim.tap_key('c')
        time.sleep(0.5)

        print("测试完成")
    else:
        print("未找到输入库，仅使用模拟模式")
        print("\n模拟按键A")
        sim.tap_key('a')
