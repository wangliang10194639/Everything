import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
游戏数据结构定义
"""

from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict
from enum import IntEnum


class UnitType(IntEnum):
    """单位类型"""
    UNKNOWN = 0
    HERO = 1
    BUILDING = 2
    CREEP = 3
    SUMMON = 4


class HeroState(IntEnum):
    """英雄状态"""
    NORMAL = 0
    STUNNED = 1
    SILENCED = 2
    POLYMORPHED = 3
    ENTANGLED = 4
    BLOWN = 5  # 被吹风
    INVINCIBLE = 6
    MAGIC_IMMUNE = 7


@dataclass
class Point:
    """2D坐标点"""
    x: float = 0.0
    y: float = 0.0

    def distance_to(self, other: 'Point') -> float:
        """计算距离"""
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5

    def to_tuple(self) -> Tuple[float, float]:
        return (self.x, self.y)


@dataclass
class Bounds:
    """边界框"""
    min_x: float = 0.0
    min_y: float = 0.0
    max_x: float = 0.0
    max_y: float = 0.0

    def contains(self, point: Point) -> bool:
        """判断点是否在边界内"""
        return (self.min_x <= point.x <= self.max_x and
                self.min_y <= point.y <= self.max_y)


@dataclass
class Ability:
    """技能信息"""
    ability_id: int = 0
    name: str = ""
    order_id: int = 0
    level: int = 0
    max_level: int = 0
    cooldown_remaining: float = 0.0
    cooldown_total: float = 0.0
    is_available: bool = True
    mana_cost: int = 0

    def on_cooldown(self) -> bool:
        return self.cooldown_remaining > 0


@dataclass
class Item:
    """物品信息"""
    item_id: int = 0
    name: str = ""
    slot: int = -1
    charges: int = 0
    max_charges: int = 0
    cooldown_remaining: float = 0.0
    is_usable: bool = True


@dataclass
class Unit:
    """单位基类"""
    unit_id: int = 0
    name: str = ""
    type_id: int = 0
    unit_type: UnitType = UnitType.UNKNOWN

    position: Point = field(default_factory=Point)
    facing: float = 0.0

    health: int = 0
    max_health: int = 0
    health_percent: float = 0.0

    mana: int = 0
    max_mana: int = 0
    mana_percent: float = 0.0

    is_alive: bool = True
    is_visible: bool = True
    is_selected: bool = False

    owner_player_id: int = 0
    is_ally: bool = True
    is_enemy: bool = False

    # 状态标记
    states: List[HeroState] = field(default_factory=list)

    # 缓存时间戳
    last_update_time: float = 0.0

    def is_in_state(self, state: HeroState) -> bool:
        return state in self.states

    def health_pct(self) -> float:
        if self.max_health <= 0:
            return 0.0
        return self.health / self.max_health

    def mana_pct(self) -> float:
        if self.max_mana <= 0:
            return 0.0
        return self.mana / self.max_mana


@dataclass
class Hero(Unit):
    """英雄单位"""
    hero_id: int = 0
    level: int = 1
    experience: int = 0

    abilities: List[Ability] = field(default_factory=list)
    inventory: List[Item] = field(default_factory=list)

    # 技能冷却追踪
    ultimate_cooldowns: Dict[int, float] = field(default_factory=dict)

    # 上次技能释放时间
    last_ability_cast_time: float = 0.0

    def get_ability_by_order(self, order_id: int) -> Optional[Ability]:
        for abil in self.abilities:
            if abil.order_id == order_id:
                return abil
        return None

    def get_ability_by_name(self, name: str) -> Optional[Ability]:
        for abil in self.abilities:
            if name in abil.name:
                return abil
        return None

    def get_item_by_name(self, name: str) -> Optional[Item]:
        for item in self.inventory:
            if name in item.name:
                return item
        return None

    def get_item_by_slot(self, slot: int) -> Optional[Item]:
        for item in self.inventory:
            if item.slot == slot:
                return item
        return None

    def has_item(self, item_name: str) -> bool:
        return self.get_item_by_name(item_name) is not None


@dataclass
class Building(Unit):
    """建筑单位"""
    is_attacking: bool = False
    is_constructing: bool = False
    upgrade_progress: float = 0.0


@dataclass
class GameState:
    """游戏全局状态"""
    game_time: float = 0.0
    is_paused: bool = False
    is_in_game: bool = False
    is_multiplayer: bool = True

    # 地图信息
    map_name: str = ""
    map_bounds: Bounds = field(default_factory=Bounds)

    # 玩家信息
    local_player_id: int = 0
    player_names: List[str] = field(default_factory=list)

    # 单位列表
    all_units: List[Unit] = field(default_factory=list)
    heroes: List[Hero] = field(default_factory=list)
    enemy_heroes: List[Hero] = field(default_factory=list)
    ally_heroes: List[Hero] = field(default_factory=list)

    # 选择的单位
    selected_units: List[Unit] = field(default_factory=list)

    # 最后更新时间
    last_update_time: float = 0.0

    def get_hero_by_id(self, hero_id: int) -> Optional[Hero]:
        for hero in self.heroes:
            if hero.hero_id == hero_id:
                return hero
        return None

    def get_hero_by_name(self, name: str) -> Optional[Hero]:
        for hero in self.heroes:
            if name in hero.name:
                return hero
        return None

    def get_enemy_heroes_in_range(self, pos: Point, range_: float) -> List[Hero]:
        result = []
        for hero in self.enemy_heroes:
            if hero.position.distance_to(pos) <= range_:
                result.append(hero)
        return result

    def get_units_in_range(self, pos: Point, range_: float,
                           unit_type: Optional[UnitType] = None) -> List[Unit]:
        result = []
        for unit in self.all_units:
            if unit_type and unit.unit_type != unit_type:
                continue
            if unit.position.distance_to(pos) <= range_:
                result.append(unit)
        return result


@dataclass
class WatchCondition:
    """监视条件（用于脚本）"""
    # 目标类型
    target_type: str = ""  # "敌人英雄", "自己英雄", "盟友英雄" 等
    target_names: List[str] = field(default_factory=list)

    # 位置条件
    center_pos: Optional[Point] = None
    range_: float = 0.0

    # 状态条件
    health_below: Optional[float] = None  # 血量百分比
    health_above: Optional[float] = None
    mana_below: Optional[float] = None
    mana_above: Optional[float] = None

    # 英雄状态
    states_required: List[HeroState] = field(default_factory=list)
    states_excluded: List[HeroState] = field(default_factory=list)

    # 物品条件
    has_item: Optional[str] = None
    has_ability_available: Optional[int] = None  # order_id
    has_ability_on_cooldown: Optional[int] = None

    # 技能状态
    ability_cast_watch: Optional[int] = None  # 监视技能释放

    def is_matching(self, unit: Unit, game_state: GameState) -> bool:
        """检查单位是否满足条件"""
        if not unit.is_alive:
            return False

        # 目标名称过滤
        if self.target_names:
            name_match = any(name in unit.name for name in self.target_names)
            if not name_match:
                return False

        # 位置过滤
        if self.center_pos and self.range_ > 0:
            if unit.position.distance_to(self.center_pos) > self.range_:
                return False

        # 血量过滤
        if self.health_below is not None:
            if unit.health_pct() >= self.health_below:
                return False
        if self.health_above is not None:
            if unit.health_pct() <= self.health_above:
                return False

        # 魔法过滤
        if self.mana_below is not None:
            if unit.mana_pct() >= self.mana_below:
                return False
        if self.mana_above is not None:
            if unit.mana_pct() <= self.mana_above:
                return False

        # 英雄特有检查
        if isinstance(unit, Hero):
            # 状态检查
            for state in self.states_required:
                if not unit.is_in_state(state):
                    return False
            for state in self.states_excluded:
                if unit.is_in_state(state):
                    return False

            # 物品检查
            if self.has_item:
                if not unit.has_item(self.has_item):
                    return False

            # 技能可用性检查
            if self.has_ability_available:
                abil = unit.get_ability_by_order(self.has_ability_available)
                if not abil or abil.on_cooldown():
                    return False

        return True


# 澄海3C 常用英雄名称列表
CH3C_HERO_NAMES = [
    "牛头人酋长", "炼金术士", "暗影猎手", "圣骑士",
    "巫妖", "恐惧魔王", "娜迦海妖", "火焰巨魔",
    "光明游侠", "黑暗游侠", "月之女祭司", "剑圣",
    "丛林守护者", "大魔法师", "先知", "深渊魔王",
    "守望者", "山丘之王", "修补匠", "血魔法师",
    "地穴领主", "死亡骑士", "恶魔猎手", "合体熊猫"
]

# 澄海3C 重要物品名称
CH3C_IMPORTANT_ITEMS = [
    "飓", "沉", "匕首", "净", "传", "统治",
    "岗哨守卫", "治疗守卫", "魔法守卫", "重生十字章"
]
