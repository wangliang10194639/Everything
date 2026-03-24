import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全图视野模块
"""

import time
import sys
from pathlib import Path
from typing import Callable, Optional
from threading import Thread, Lock

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from core import MemoryReader, GameState


class MapHack:
    """地图破解 - 全图视野功能"""

    def __init__(self, memory_reader: MemoryReader):
        self.memory_reader = memory_reader
        self.is_enabled = False
        self.is_running = False
        self.hack_thread = None
        self.update_lock = Lock()

        # 回调函数
        self.on_status_change: Optional[Callable[[bool], None]] = None

        # 功能开关
        self.remove_fog = True
        self.show_hidden_units = True
        self.always_visible = True

    def enable(self):
        """启用全图功能"""
        if self.is_enabled:
            return

        self.is_enabled = True
        self.is_running = True
        self.hack_thread = Thread(target=self._hack_loop, daemon=True)
        self.hack_thread.start()

        if self.on_status_change:
            self.on_status_change(True)

        print("全图功能已启用")

    def disable(self):
        """禁用全图功能"""
        if not self.is_enabled:
            return

        self.is_enabled = False
        self.is_running = False

        if self.hack_thread:
            self.hack_thread.join(timeout=1.0)
            self.hack_thread = None

        if self.on_status_change:
            self.on_status_change(False)

        print("全图功能已禁用")

    def toggle(self):
        """切换全图功能"""
        if self.is_enabled:
            self.disable()
        else:
            self.enable()

    def set_remove_fog(self, enabled: bool):
        """设置是否移除迷雾"""
        with self.update_lock:
            self.remove_fog = enabled

    def set_show_hidden_units(self, enabled: bool):
        """设置是否显示隐藏单位"""
        with self.update_lock:
            self.show_hidden_units = enabled

    def set_always_visible(self, enabled: bool):
        """设置是否始终可见"""
        with self.update_lock:
            self.always_visible = enabled

    def _hack_loop(self):
        """全图功能主循环"""
        while self.is_running and self.is_enabled:
            try:
                game_state = self.memory_reader.get_game_state()
                if game_state.is_in_game:
                    self._apply_hacks(game_state)
            except Exception as e:
                print(f"全图功能错误: {e}")

            time.sleep(0.05)  # 50ms 刷新间隔

    def _apply_hacks(self, game_state: GameState):
        """应用全图修改"""
        # 在实际实现中，这里会修改游戏内存
        # 这里仅作为框架

        # 1. 移除战争迷雾
        if self.remove_fog:
            self._remove_fog_of_war()

        # 2. 显示隐藏单位
        if self.show_hidden_units:
            self._reveal_hidden_units(game_state)

        # 3. 强制可见
        if self.always_visible:
            self._force_visibility(game_state)

    def _remove_fog_of_war(self):
        """移除战争迷雾"""
        # 实际实现需要修改游戏内存
        # 这里模拟操作
        pass

    def _reveal_hidden_units(self, game_state: GameState):
        """显示隐藏单位"""
        # 标记所有单位为可见
        for unit in game_state.all_units:
            unit.is_visible = True

    def _force_visibility(self, game_state: GameState):
        """强制可见性"""
        # 强制所有单位可见
        for unit in game_state.all_units:
            unit.is_visible = True

    def get_status(self) -> dict:
        """获取当前状态"""
        return {
            'enabled': self.is_enabled,
            'remove_fog': self.remove_fog,
            'show_hidden_units': self.show_hidden_units,
            'always_visible': self.always_visible
        }


class MinimapOverlay:
    """小地图覆盖层"""

    def __init__(self):
        self.is_visible = False
        self.enemy_hero_dots = {}
        self.ally_hero_dots = {}
        self.important_units = []

    def show(self):
        """显示覆盖层"""
        self.is_visible = True
        print("小地图覆盖层已显示")

    def hide(self):
        """隐藏覆盖层"""
        self.is_visible = False
        print("小地图覆盖层已隐藏")

    def update_enemy_hero(self, hero_id: int, x: float, y: float, health: float):
        """更新敌方英雄位置"""
        self.enemy_hero_dots[hero_id] = (x, y, health)

    def update_ally_hero(self, hero_id: int, x: float, y: float, health: float):
        """更新己方英雄位置"""
        self.ally_hero_dots[hero_id] = (x, y, health)

    def clear(self):
        """清除所有标记"""
        self.enemy_hero_dots.clear()
        self.ally_hero_dots.clear()
        self.important_units.clear()


if __name__ == "__main__":
    # 测试代码
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from core import MemoryReader

    reader = MemoryReader()
    reader.attach()

    map_hack = MapHack(reader)
    minimap = MinimapOverlay()

    print("测试全图功能...")
    map_hack.enable()
    minimap.show()

    try:
        for i in range(30):
            state = reader.update_game_state(force=True)

            for hero in state.enemy_heroes:
                minimap.update_enemy_hero(
                    hero.hero_id,
                    hero.position.x,
                    hero.position.y,
                    hero.health_pct()
                )

            for hero in state.ally_heroes:
                minimap.update_ally_hero(
                    hero.hero_id,
                    hero.position.x,
                    hero.position.y,
                    hero.health_pct()
                )

            status = map_hack.get_status()
            print(f"第{i+1}秒 - 全图: {'开启' if status['enabled'] else '关闭'}, "
                  f"敌方英雄: {len(minimap.enemy_hero_dots)}")

            time.sleep(0.5)

    except KeyboardInterrupt:
        pass

    map_hack.disable()
    minimap.hide()
    reader.detach()
