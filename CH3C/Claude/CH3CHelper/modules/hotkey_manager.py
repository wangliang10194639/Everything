import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
热键管理模块
"""

import time
import threading
from typing import Dict, List, Callable, Optional
from core import ConfigParser, InputSimulator, KeyboardHook


class HotkeyAction:
    """热键动作"""

    def __init__(self, name: str, action_type: str = "key",
                 target_key: str = "", callback: Optional[Callable] = None):
        self.name = name
        self.action_type = action_type  # "key", "replace", "callback", "macro"
        self.target_key = target_key
        self.callback = callback
        self.macro_steps: List[dict] = []


class HotkeyManager:
    """热键管理器"""

    def __init__(self, config: ConfigParser, input_sim: InputSimulator):
        self.config = config
        self.input_sim = input_sim
        self.keyboard_hook = KeyboardHook()

        # 热键映射
        self.active_hotkeys: Dict[str, HotkeyAction] = {}
        self.blocked_keys: List[str] = []
        self.replaced_keys: Dict[str, str] = {}

        # 当前英雄配置
        self.current_hero = ""
        self.hotkey_profiles: Dict[str, Dict[str, str]] = {}

        # 状态
        self.is_running = False
        self.is_blocking = True
        self.is_replacing = True

        # 加载配置
        self._load_config()

    def _load_config(self):
        """从配置文件加载热键"""
        # 加载屏蔽的按键
        self.blocked_keys = self.config.get_blocked_hotkeys()

        # 加载替换的按键
        self.replaced_keys = self.config.get_replaced_hotkeys()

        # 加载所有热键配置
        self.hotkey_profiles = self.config.get_hotkey_configs()

        print(f"已加载 {len(self.hotkey_profiles)} 个热键配置")
        print(f"屏蔽按键: {len(self.blocked_keys)} 个")
        print(f"替换按键: {len(self.replaced_keys)} 个")

    def start(self):
        """启动热键管理"""
        if self.is_running:
            return

        self.is_running = True
        self.keyboard_hook.start()

        # 注册热键
        self._register_hotkeys()

        print("热键管理已启动")

    def stop(self):
        """停止热键管理"""
        self.is_running = False
        self.keyboard_hook.stop()
        print("热键管理已停止")

    def _register_hotkeys(self):
        """注册热键"""
        # 先注册通用热键
        if 'All' in self.hotkey_profiles:
            self._apply_profile(self.hotkey_profiles['All'])

        # 如果有当前英雄，应用英雄热键
        if self.current_hero and self.current_hero in self.hotkey_profiles:
            self._apply_profile(self.hotkey_profiles[self.current_hero])

    def _apply_profile(self, profile: Dict[str, str]):
        """应用热键配置文件"""
        for key, value in profile.items():
            if value and not key.startswith(';'):  # 跳过注释
                self._register_single_hotkey(key, value)

    def _register_single_hotkey(self, key: str, action: str):
        """注册单个热键"""
        # 处理特殊格式
        if '=' in key:
            parts = key.split('=', 1)
            key = parts[0]
            action = parts[1] if len(parts) > 1 else ""

        # 清理按键名
        key = key.strip().lower()
        action = action.strip()

        if not key or not action:
            return

        # 创建热键动作
        hotkey_action = HotkeyAction(
            name=f"{key}->{action}",
            action_type="callback",
            callback=lambda a=action: self._execute_action(a)
        )

        # 转换按键名
        mapped_key = self._map_key_name(key)

        self.active_hotkeys[mapped_key] = hotkey_action

        try:
            self.keyboard_hook.register_hotkey(mapped_key, hotkey_action.callback)
        except Exception as e:
            print(f"注册热键失败 {mapped_key}: {e}")

    def _map_key_name(self, key: str) -> str:
        """映射按键名称"""
        key_map = {
            'num_7': '7',
            'num_8': '8',
            'num_4': '4',
            'num_5': '5',
            'num_1': '1',
            'num_2': '2',
            'space': 'space',
            'esc': 'escape',
            'ctrl': 'ctrl',
            'shift': 'shift',
            'alt': 'alt',
        }
        return key_map.get(key.lower(), key.lower())

    def _execute_action(self, action: str):
        """执行热键动作"""
        if not self.is_running:
            return

        # 分析动作
        action = action.strip()

        if not action:
            return

        # 简单的动作解析
        if action.startswith('按键'):
            key = action[2:].strip()
            self.input_sim.tap_key(key)
        elif action.startswith('按住'):
            key = action[2:].strip()
            self.input_sim.hold_key(key, 0.1)
        elif action.startswith('左击'):
            self.input_sim.mouse_click('left')
        elif action.startswith('右击'):
            self.input_sim.mouse_click('right')
        elif action.startswith('屏蔽'):
            pass  # 不执行任何操作
        else:
            # 默认当作按键处理
            self.input_sim.tap_key(action)

    def set_current_hero(self, hero_name: str):
        """设置当前英雄"""
        if hero_name == self.current_hero:
            return

        self.current_hero = hero_name
        self._reload_hotkeys()
        print(f"切换英雄热键: {hero_name}")

    def _reload_hotkeys(self):
        """重新加载热键"""
        self.active_hotkeys.clear()
        self._register_hotkeys()

    def toggle_blocking(self, enabled: Optional[bool] = None):
        """切换按键屏蔽"""
        if enabled is None:
            self.is_blocking = not self.is_blocking
        else:
            self.is_blocking = enabled
        return self.is_blocking

    def toggle_replacing(self, enabled: Optional[bool] = None):
        """切换按键替换"""
        if enabled is None:
            self.is_replacing = not self.is_replacing
        else:
            self.is_replacing = enabled
        return self.is_replacing

    def add_custom_hotkey(self, hotkey: str, action: Callable) -> bool:
        """添加自定义热键"""
        try:
            self.keyboard_hook.register_hotkey(hotkey, action)
            return True
        except Exception as e:
            print(f"添加自定义热键失败: {e}")
            return False

    def get_status(self) -> dict:
        """获取状态"""
        return {
            'running': self.is_running,
            'blocking': self.is_blocking,
            'replacing': self.is_replacing,
            'current_hero': self.current_hero,
            'hotkey_count': len(self.active_hotkeys),
            'blocked_count': len(self.blocked_keys),
            'replaced_count': len(self.replaced_keys)
        }

    def reload_config(self):
        """重新加载配置"""
        self.config.reload()
        self._load_config()
        self._reload_hotkeys()
        print("热键配置已重新加载")


class QuickItemSwitch:
    """快速物品切换"""

    def __init__(self, input_sim: InputSimulator):
        self.input_sim = input_sim
        self.item_slots = ['num_7', 'num_8', 'num_4', 'num_5', 'num_1', 'num_2']
        self.current_slot = 0

    def use_item(self, slot: int) -> bool:
        """使用指定物品栏"""
        if 0 <= slot < len(self.item_slots):
            return self.input_sim.tap_key(self.item_slots[slot])
        return False

    def use_item_by_name(self, name: str) -> bool:
        """通过名称使用物品（需要追踪）"""
        # 这里需要与游戏内存配合
        print(f"尝试使用物品: {name}")
        return True

    def cycle_items(self):
        """循环物品栏"""
        self.current_slot = (self.current_slot + 1) % len(self.item_slots)
        return self.use_item(self.current_slot)


if __name__ == "__main__":
    # 测试代码
    import os
    from core import ConfigParser, InputSimulator

    config_path = os.path.join(os.path.dirname(__file__), '..', 'configs', '3C.txt')
    config = ConfigParser(config_path)

    input_sim = InputSimulator()
    manager = HotkeyManager(config, input_sim)

    print("热键管理器测试")
    print(f"状态: {manager.get_status()}")

    print("\n可用热键配置:")
    for name in manager.hotkey_profiles.keys():
        print(f"  - {name}")

    manager.start()

    try:
        time.sleep(3)
    except KeyboardInterrupt:
        pass

    manager.stop()
