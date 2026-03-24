#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
游戏内存读取模块 - Windows版
"""

import struct
import time
import sys
from pathlib import Path
from typing import Optional, List, Any

sys.path.insert(0, str(Path(__file__).parent.parent))

from core.game_data import (
    GameState, Unit, Hero, Point, Bounds,
    UnitType, HeroState, Ability, Item
)

from core.memory_offsets import get_offsets, get_supported_versions


class MemoryReader:
    """游戏内存读取器 (Windows版 - 支持真实模式和模拟模式)"""

    # 魔兽争霸III进程名
    PROCESS_NAMES = ["War3.exe", "Warcraft III.exe"]

    def __init__(self):
        self.process = None
        self.pid = 0
        self.base_address = 0
        self.is_attached = False
        self.last_error = ""

        # 游戏状态缓存
        self.game_state = GameState()
        self.last_update_time = 0.0
        self.update_interval = 0.05  # 50ms更新间隔

        # 内存偏移
        self.offsets = None
        self.version = "1.20e"

        # 模拟数据模式 (用于没有真实游戏运行时的测试)
        self.simulation_mode = False
        self.simulated_units: List[Unit] = []
        self._init_simulation()

        # Windows API相关
        self._init_win32api()

    def _init_win32api(self):
        """初始化Windows API"""
        try:
            import pymem
            import pymem.process
            self.pymem = pymem
            self.pymem_process = pymem.process
            self.winapi_available = True
        except ImportError:
            self.winapi_available = False

    def _init_simulation(self):
        """初始化模拟数据用于测试"""
        # 创建一些模拟的英雄
        hero1 = Hero()
        hero1.name = "牛头人酋长"
        hero1.hero_id = 1
        hero1.health = 2000
        hero1.max_health = 2500
        hero1.mana = 500
        hero1.max_mana = 800
        hero1.position = Point(1000, 1000)
        hero1.is_alive = True
        hero1.is_enemy = False
        hero1.is_ally = True
        hero1.level = 10
        hero1.unit_type = UnitType.HERO

        hero2 = Hero()
        hero2.name = "炼金术士"
        hero2.hero_id = 2
        hero2.health = 1800
        hero2.max_health = 2200
        hero2.mana = 600
        hero2.max_mana = 900
        hero2.position = Point(1500, 1200)
        hero2.is_alive = True
        hero2.is_enemy = True
        hero2.is_ally = False
        hero2.level = 9
        hero2.unit_type = UnitType.HERO

        hero3 = Hero()
        hero3.name = "暗影猎手"
        hero3.hero_id = 3
        hero3.health = 1200
        hero3.max_health = 1600
        hero3.mana = 700
        hero3.max_mana = 1000
        hero3.position = Point(2000, 800)
        hero3.is_alive = True
        hero3.is_enemy = True
        hero3.is_ally = False
        hero3.level = 8
        hero3.unit_type = UnitType.HERO

        # 添加物品
        item1 = Item()
        item1.name = "飓"
        item1.slot = 0
        item1.is_usable = True
        hero1.inventory.append(item1)

        item2 = Item()
        item2.name = "沉"
        item2.slot = 1
        item2.is_usable = True
        hero1.inventory.append(item2)

        self.simulated_units = [hero1, hero2, hero3]
        self.game_state.heroes = [hero1, hero2, hero3]
        self.game_state.ally_heroes = [hero1]
        self.game_state.enemy_heroes = [hero2, hero3]
        self.game_state.all_units = [hero1, hero2, hero3]
        self.game_state.selected_units = [hero1]
        self.game_state.is_in_game = True

    def attach(self) -> bool:
        """附加到游戏进程"""
        try:
            # 检查是否有winapi支持
            if not self.winapi_available:
                print("未找到pymem库，使用模拟模式")
                self.simulation_mode = True
                self.is_attached = True
                return True

            # 尝试使用pymem附加
            import pymem

            for proc_name in self.PROCESS_NAMES:
                try:
                    self.process = pymem.Pymem(proc_name)
                    self.pid = self.process.process_id
                    self.base_address = self.process.process_base.lpBaseOfDll
                    self.is_attached = True
                    self.simulation_mode = False

                    # 获取游戏版本
                    self._detect_version()
                    print(f"成功附加到进程: {proc_name} (PID: {self.pid})")
                    print(f"游戏版本: {self.version}")
                    return True

                except Exception as e:
                    print(f"进程 {proc_name} 附加失败: {e}")
                    continue

            # 如果没有找到真实进程，使用模拟模式
            print("未找到魔兽争霸III进程，使用模拟模式")
            self.simulation_mode = True
            self.is_attached = True
            return True

        except Exception as e:
            self.last_error = str(e)
            print(f"附加进程失败: {e}")
            # 回退到模拟模式
            self.simulation_mode = True
            self.is_attached = True
            return True

    def _detect_version(self):
        """检测游戏版本"""
        # 简单的版本检测（目前返回默认值）
        self.version = "1.20e"
        self.offsets = get_offsets(self.version)
        if not self.offsets:
            self.offsets = get_offsets("1.20e")

    def detach(self):
        """分离进程"""
        if self.process and not self.simulation_mode and self.winapi_available:
            try:
                self.process.close_process()
            except:
                pass
        self.process = None
        self.is_attached = False

    def is_available(self) -> bool:
        """检查是否可用"""
        return self.is_attached

    def read_memory(self, address: int, data_type: str = "int") -> Any:
        """读取内存 (Windows版)"""
        if self.simulation_mode or not self.process or not self.winapi_available:
            return None

        try:
            if data_type == "int":
                return self.process.read_int(address)
            elif data_type == "float":
                return self.process.read_float(address)
            elif data_type == "string":
                return self.process.read_string(address)
            elif data_type == "byte":
                return self.process.read_byte(address)
        except Exception as e:
            print(f"读取内存失败: {e}")
        return None

    def write_memory(self, address: int, value: Any, data_type: str = "int"):
        """写入内存"""
        if self.simulation_mode or not self.process or not self.winapi_available:
            return

        try:
            if data_type == "int":
                self.process.write_int(address, value)
            elif data_type == "float":
                self.process.write_float(address, value)
            elif data_type == "byte":
                self.process.write_byte(address, value)
            elif data_type == "string":
                self.process.write_string(address, value)
        except Exception as e:
            print(f"写入内存失败: {e}")

    def update_game_state(self, force: bool = False) -> GameState:
        """更新游戏状态"""
        current_time = time.time()

        if not force and (current_time - self.last_update_time) < self.update_interval:
            return self.game_state

        if self.simulation_mode:
            self._update_simulation()
        else:
            self._read_real_game_state()

        self.last_update_time = current_time
        self.game_state.last_update_time = current_time
        return self.game_state

    def _update_simulation(self):
        """更新模拟数据"""
        import random

        # 轻微移动英雄
        for unit in self.simulated_units:
            if unit.is_alive and isinstance(unit, Hero):
                unit.position.x += random.uniform(-10, 10)
                unit.position.y += random.uniform(-10, 10)

                # 随机变化血量
                unit.health = max(1, unit.health + random.randint(-50, 30))
                unit.mana = max(0, unit.mana + random.randint(-20, 10))

        self.game_state.game_time = time.time() % 3600  # 模拟游戏时间
        self.game_state.is_in_game = True

    def _read_real_game_state(self):
        """读取真实游戏状态 (Windows版)"""
        if not self.process or not self.winapi_available:
            return

        try:
            # 这里需要根据实际偏移实现内存读取
            pass
        except Exception as e:
            print(f"读取游戏状态失败: {e}")

    def get_game_state(self) -> GameState:
        """获取当前游戏状态"""
        return self.game_state

    def find_unit_by_name(self, name: str) -> Optional[Unit]:
        """按名称查找单位"""
        for unit in self.game_state.all_units:
            if name in unit.name:
                return unit
        return None

    def get_heroes(self) -> List[Hero]:
        """获取所有英雄"""
        return self.game_state.heroes

    def get_enemy_heroes(self) -> List[Hero]:
        """获取敌方英雄"""
        return self.game_state.enemy_heroes

    def get_ally_heroes(self) -> List[Hero]:
        """获取己方英雄"""
        return self.game_state.ally_heroes

    def get_selected_units(self) -> List[Unit]:
        """获取选中的单位"""
        return self.game_state.selected_units

    def is_in_game(self) -> bool:
        """检查是否在游戏中"""
        return self.game_state.is_in_game

    def get_game_time(self) -> float:
        """获取游戏时间"""
        return self.game_state.game_time


if __name__ == "__main__":
    # 测试代码
    reader = MemoryReader()
    reader.attach()

    if reader.is_available():
        print("内存读取器已准备")

        for i in range(10):
            state = reader.update_game_state(force=True)
            print(f"\n=== 第 {i+1} 次更新 ===")
            print(f"游戏时间: {state.game_time:.1f}秒")
            print(f"敌方英雄数: {len(state.enemy_heroes)}")

            for hero in state.heroes:
                print(f"  {hero.name}: HP={hero.health}/{hero.max_health} "
                      f"MP={hero.mana}/{hero.max_mana} "
                      f"位置=({hero.position.x:.0f}, {hero.position.y:.0f})")

            time.sleep(0.5)

        reader.detach()
