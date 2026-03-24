"""
Mock内存读取器 - 用于WSL开发测试

提供模拟的内存读取功能，用于在非Windows环境下进行开发和测试
"""

import random
import time
import math
from typing import Optional, List, Dict, Any
import logging

from .memory_reader_base import (
    MemoryReaderBase, UnitInfo, HeroInfo, GameInfo,
    UnitType, PlayerSlot
)

logger = logging.getLogger(__name__)


class MockMemoryReader(MemoryReaderBase):
    """
    Mock内存读取器 - 用于WSL开发测试
    
    模拟游戏内存数据，提供测试用的假数据
    """
    
    # 英雄ID映射
    HERO_IDS = {
        "剑圣": 0x0001,
        "恶魔猎手": 0x0002,
        "守望者": 0x0003,
        "山丘之王": 0x0004,
        "大魔法师": 0x0005,
        "圣骑士": 0x0006,
        "血魔法师": 0x0007,
        "先知": 0x0008,
        "牛头人酋长": 0x0009,
        "暗影猎手": 0x000A,
        "巫妖": 0x000B,
        "死亡骑士": 0x000C,
        "恐惧魔王": 0x000D,
        "地穴领主": 0x000E,
        "娜迦女海巫": 0x000F,
        "熊猫酒仙": 0x0010,
        "修补匠": 0x0011,
        "炼金术士": 0x0012,
        "深渊魔王": 0x0013,
        "火焰巨魔": 0x0014,
        "兽王领袖": 0x0015,
        "大德鲁伊": 0x0016,
        "黑暗游侠": 0x0017,
        "光明游侠": 0x0018,
        "丛林守护者": 0x0019,
        "月之女祭司": 0x001A,
        "女巫": 0x001B,
        "黑暗骑士": 0x001C,
    }
    
    def __init__(self):
        """初始化Mock内存读取器"""
        super().__init__()
        self._mock_data: Dict[int, Any] = {}
        self._units: List[UnitInfo] = []
        self._heroes: List[HeroInfo] = []
        self._maphack_enabled = False
        self._game_time = 0.0
        self._last_update = 0.0
        self._init_mock_data()
        
    def _init_mock_data(self):
        """初始化模拟数据"""
        # 创建模拟的英雄数据
        self._create_mock_heroes()
        
        # 创建模拟的游戏信息
        self._game_info = GameInfo(
            is_in_game=True,
            map_name="澄海3C 5.56",
            game_time=0.0,
            player_slot=PlayerSlot.PLAYER_1,
            allies=[PlayerSlot.PLAYER_1, PlayerSlot.PLAYER_3, PlayerSlot.PLAYER_5],
            enemies=[PlayerSlot.PLAYER_2, PlayerSlot.PLAYER_4, PlayerSlot.PLAYER_6]
        )
        
    def _create_mock_heroes(self):
        """创建模拟英雄数据"""
        # 敌人英雄
        enemy_heroes = [
            ("剑圣", 1000.0, 2000.0),
            ("恶魔猎手", 1500.0, 2500.0),
            ("守望者", 1200.0, 1800.0),
        ]
        
        # 盟友英雄
        ally_heroes = [
            ("大魔法师", 500.0, 1000.0),
            ("山丘之王", 600.0, 1100.0),
            ("圣骑士", 550.0, 1050.0),
        ]
        
        for hero_name, x, y in enemy_heroes:
            unit_info = UnitInfo(
                unit_id=random.randint(1000, 9999),
                unit_type=UnitType.HERO,
                player_slot=PlayerSlot.PLAYER_2,
                x=x,
                y=y,
                z=0.0,
                health=random.uniform(500, 1500),
                max_health=1500.0,
                mana=random.uniform(200, 500),
                max_mana=500.0,
                is_alive=True,
                is_visible=True,
                is_enemy=True,
                hero_id=self.HERO_IDS.get(hero_name, 0),
                level=random.randint(1, 10),
                name=hero_name
            )
            hero_info = HeroInfo(
                unit_info=unit_info,
                hero_name=hero_name,
                has_ultimate=random.choice([True, False]),
                ultimate_ready=random.choice([True, False]),
                is_silenced=random.choice([True, False]),
                is_stunned=False,
                is_polymorphed=False,
                is_invisible=random.choice([True, False]),
                is_invulnerable=False
            )
            self._heroes.append(hero_info)
            self._units.append(unit_info)
            
        for hero_name, x, y in ally_heroes:
            unit_info = UnitInfo(
                unit_id=random.randint(1000, 9999),
                unit_type=UnitType.HERO,
                player_slot=PlayerSlot.PLAYER_1,
                x=x,
                y=y,
                z=0.0,
                health=random.uniform(500, 1500),
                max_health=1500.0,
                mana=random.uniform(200, 500),
                max_mana=500.0,
                is_alive=True,
                is_visible=True,
                is_enemy=False,
                hero_id=self.HERO_IDS.get(hero_name, 0),
                level=random.randint(1, 10),
                name=hero_name
            )
            hero_info = HeroInfo(
                unit_info=unit_info,
                hero_name=hero_name,
                has_ultimate=random.choice([True, False]),
                ultimate_ready=random.choice([True, False]),
                is_silenced=False,
                is_stunned=False,
                is_polymorphed=False,
                is_invisible=False,
                is_invulnerable=False
            )
            self._heroes.append(hero_info)
            self._units.append(unit_info)
    
    def _update_mock_data(self):
        """更新模拟数据（模拟游戏状态变化）"""
        current_time = time.time()
        if current_time - self._last_update < 0.1:  # 100ms更新一次
            return
            
        self._last_update = current_time
        self._game_time += 0.1
        
        # 随机移动英雄位置
        for hero in self._heroes:
            if hero.unit_info.is_alive:
                # 随机小范围移动
                hero.unit_info.x += random.uniform(-50, 50)
                hero.unit_info.y += random.uniform(-50, 50)
                
                # 随机改变状态
                if random.random() < 0.01:  # 1%概率改变状态
                    hero.is_silenced = not hero.is_silenced
                if random.random() < 0.005:  # 0.5%概率改变状态
                    hero.is_stunned = not hero.is_stunned
                    
                # 随机改变血量
                if random.random() < 0.1:  # 10%概率改变血量
                    hero.unit_info.health = max(1, min(
                        hero.unit_info.max_health,
                        hero.unit_info.health + random.uniform(-100, 100)
                    ))
    
    # === 基本内存操作 ===
    
    def attach(self, process_name: str) -> bool:
        """附加到进程（模拟）"""
        logger.info(f"[Mock] 附加到进程: {process_name}")
        self._attached = True
        self._process_name = process_name
        self._base_address = 0x400000  # 模拟基址
        return True
    
    def detach(self) -> bool:
        """从进程分离（模拟）"""
        logger.info("[Mock] 从进程分离")
        self._attached = False
        return True
    
    def is_attached(self) -> bool:
        """检查是否已附加"""
        return self._attached
    
    def read_bytes(self, address: int, size: int) -> bytes:
        """读取内存字节（模拟）"""
        return self._mock_data.get(address, b'\x00' * size)
    
    def read_int(self, address: int) -> int:
        """读取整数（模拟）"""
        return self._mock_data.get(address, 0)
    
    def read_float(self, address: int) -> float:
        """读取浮点数（模拟）"""
        return self._mock_data.get(address, 0.0)
    
    def read_string(self, address: int, max_length: int = 256) -> str:
        """读取字符串（模拟）"""
        return self._mock_data.get(address, "")
    
    def write_bytes(self, address: int, data: bytes) -> bool:
        """写入内存字节（模拟）"""
        self._mock_data[address] = data
        return True
    
    def write_int(self, address: int, value: int) -> bool:
        """写入整数（模拟）"""
        self._mock_data[address] = value
        return True
    
    def write_float(self, address: int, value: float) -> bool:
        """写入浮点数（模拟）"""
        self._mock_data[address] = value
        return True
    
    def get_module_base(self, module_name: str) -> int:
        """获取模块基址（模拟）"""
        return self._base_address
    
    def find_pattern(self, pattern: str, mask: str, start: int = 0, end: int = 0) -> int:
        """搜索内存模式（模拟）"""
        return 0  # 未找到
    
    # === 游戏特定方法 ===
    
    def get_game_info(self) -> GameInfo:
        """获取游戏信息"""
        self._update_mock_data()
        self._game_info.game_time = self._game_time
        return self._game_info
    
    def get_all_units(self) -> List[UnitInfo]:
        """获取所有单位"""
        self._update_mock_data()
        return self._units.copy()
    
    def get_heroes(self, include_allies: bool = True, include_enemies: bool = True) -> List[HeroInfo]:
        """获取英雄列表"""
        self._update_mock_data()
        result = []
        for hero in self._heroes:
            if hero.unit_info.is_enemy and include_enemies:
                result.append(hero)
            elif not hero.unit_info.is_enemy and include_allies:
                result.append(hero)
        return result
    
    def get_enemy_heroes(self) -> List[HeroInfo]:
        """获取敌人英雄列表"""
        return self.get_heroes(include_allies=False, include_enemies=True)
    
    def get_ally_heroes(self) -> List[HeroInfo]:
        """获取盟友英雄列表"""
        return self.get_heroes(include_allies=True, include_enemies=False)
    
    def get_my_hero(self) -> Optional[HeroInfo]:
        """获取自己控制的英雄"""
        self._update_mock_data()
        for hero in self._heroes:
            if not hero.unit_info.is_enemy:
                return hero
        return None
    
    def get_units_in_range(self, x: float, y: float, range: float,
                           include_allies: bool = False,
                           include_enemies: bool = True) -> List[UnitInfo]:
        """获取范围内的单位"""
        self._update_mock_data()
        result = []
        for unit in self._units:
            if not unit.is_alive:
                continue
            distance = self.get_distance_xy(x, y, unit.x, unit.y)
            if distance <= range:
                if unit.is_enemy and include_enemies:
                    result.append(unit)
                elif not unit.is_enemy and include_allies:
                    result.append(unit)
        return result
    
    def is_unit_in_status(self, unit: UnitInfo, status: str) -> bool:
        """检查单位是否处于特定状态"""
        # 查找对应的英雄信息
        for hero in self._heroes:
            if hero.unit_info.unit_id == unit.unit_id:
                status_map = {
                    "被沉默的": hero.is_silenced,
                    "被击晕的": hero.is_stunned,
                    "被变羊的": hero.is_polymorphed,
                    "隐身的": hero.is_invisible,
                    "无敌的": hero.is_invulnerable,
                }
                return status_map.get(status, False)
        return False
    
    def get_unit_health_percent(self, unit: UnitInfo) -> float:
        """获取单位血量百分比"""
        if unit.max_health <= 0:
            return 0.0
        return (unit.health / unit.max_health) * 100.0
    
    def get_unit_mana_percent(self, unit: UnitInfo) -> float:
        """获取单位魔法百分比"""
        if unit.max_mana <= 0:
            return 0.0
        return (unit.mana / unit.max_mana) * 100.0
    
    # === 全图功能相关 ===
    
    def enable_maphack(self, enable: bool = True) -> bool:
        """启用/禁用全图功能"""
        self._maphack_enabled = enable
        logger.info(f"[Mock] 全图功能: {'启用' if enable else '禁用'}")
        return True
    
    def is_maphack_enabled(self) -> bool:
        """检查全图功能是否启用"""
        return self._maphack_enabled
    
    def reveal_area(self, x: float, y: float, radius: float) -> bool:
        """揭示指定区域"""
        logger.info(f"[Mock] 揭示区域: ({x}, {y}), 半径: {radius}")
        return True
    
    # === 测试辅助方法 ===
    
    def set_mock_hero_status(self, hero_name: str, status: str, value: bool):
        """设置模拟英雄状态（用于测试）"""
        for hero in self._heroes:
            if hero.hero_name == hero_name:
                if status == "被沉默的":
                    hero.is_silenced = value
                elif status == "被击晕的":
                    hero.is_stunned = value
                elif status == "被变羊的":
                    hero.is_polymorphed = value
                elif status == "隐身的":
                    hero.is_invisible = value
                elif status == "无敌的":
                    hero.is_invulnerable = value
                break
    
    def set_mock_hero_position(self, hero_name: str, x: float, y: float):
        """设置模拟英雄位置（用于测试）"""
        for hero in self._heroes:
            if hero.hero_name == hero_name:
                hero.unit_info.x = x
                hero.unit_info.y = y
                break
    
    def set_mock_hero_health(self, hero_name: str, health_percent: float):
        """设置模拟英雄血量百分比（用于测试）"""
        for hero in self._heroes:
            if hero.hero_name == hero_name:
                hero.unit_info.health = hero.unit_info.max_health * health_percent / 100.0
                break
