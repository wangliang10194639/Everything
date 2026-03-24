#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
内存偏移定义模块 - 支持不同版本的魔兽争霸III
"""

from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class GameOffsets:
    """游戏内存偏移定义"""
    version: str = ""

    # 游戏对象管理器
    game_object_manager: int = 0
    first_object: int = 0

    # 本地玩家
    local_player: int = 0
    player_name: int = 0

    # 游戏时间
    game_time: int = 0

    # 单位相关
    unit_list: int = 0
    unit_count: int = 0

    # 单位结构
    unit_name: int = 0
    unit_health: int = 0
    unit_max_health: int = 0
    unit_mana: int = 0
    unit_max_mana: int = 0
    unit_position_x: int = 0
    unit_position_y: int = 0
    unit_owner: int = 0
    unit_type: int = 0
    unit_flags: int = 0

    # 技能相关
    ability_list: int = 0
    ability_count: int = 0
    ability_id: int = 0
    ability_level: int = 0
    ability_cooldown: int = 0

    # 物品栏
    inventory: int = 0
    item_slot: int = 0
    item_id: int = 0

    # 战争迷雾
    fog_of_war: int = 0
    reveal_map: int = 0

    # 视野相关
    vision_range: int = 0


# ========== 版本定义 ==========

# 1.20e 版本偏移（占位符）
OFFSETS_120E = GameOffsets(
    version="1.20e",
    game_object_manager=0x00AE0000,
    first_object=0x00AE0004,
    local_player=0x00AE0008,
    player_name=0x00AE0010,
    game_time=0x00AE0020,
    unit_list=0x00AE0030,
    unit_count=0x00AE0034,
    unit_name=0x04,
    unit_health=0x10,
    unit_max_health=0x14,
    unit_mana=0x18,
    unit_max_mana=0x1C,
    unit_position_x=0x24,
    unit_position_y=0x28,
    unit_owner=0x30,
    unit_type=0x34,
    unit_flags=0x38,
    ability_list=0x40,
    ability_count=0x44,
    ability_id=0x04,
    ability_level=0x08,
    ability_cooldown=0x10,
    inventory=0x50,
    item_slot=0x04,
    item_id=0x08,
    fog_of_war=0x00AE0040,
    reveal_map=0x00AE0044,
    vision_range=0x00AE0048
)

# 1.24b 版本偏移（占位符）
OFFSETS_124B = GameOffsets(
    version="1.24b",
    game_object_manager=0x00B00000,
    first_object=0x00B00004,
    local_player=0x00B00008,
    player_name=0x00B00010,
    game_time=0x00B00020,
    unit_list=0x00B00030,
    unit_count=0x00B00034,
    unit_name=0x04,
    unit_health=0x10,
    unit_max_health=0x14,
    unit_mana=0x18,
    unit_max_mana=0x1C,
    unit_position_x=0x24,
    unit_position_y=0x28,
    unit_owner=0x30,
    unit_type=0x34,
    unit_flags=0x38,
    ability_list=0x40,
    ability_count=0x44,
    ability_id=0x04,
    ability_level=0x08,
    ability_cooldown=0x10,
    inventory=0x50,
    item_slot=0x04,
    item_id=0x08,
    fog_of_war=0x00B00040,
    reveal_map=0x00B00044,
    vision_range=0x00B00048
)

# 1.27 版本偏移（占位符）
OFFSETS_127 = GameOffsets(
    version="1.27",
    game_object_manager=0x00B20000,
    first_object=0x00B20004,
    local_player=0x00B20008,
    player_name=0x00B20010,
    game_time=0x00B20020,
    unit_list=0x00B20030,
    unit_count=0x00B20034,
    unit_name=0x04,
    unit_health=0x10,
    unit_max_health=0x14,
    unit_mana=0x18,
    unit_max_mana=0x1C,
    unit_position_x=0x24,
    unit_position_y=0x28,
    unit_owner=0x30,
    unit_type=0x34,
    unit_flags=0x38,
    ability_list=0x40,
    ability_count=0x44,
    ability_id=0x04,
    ability_level=0x08,
    ability_cooldown=0x10,
    inventory=0x50,
    item_slot=0x04,
    item_id=0x08,
    fog_of_war=0x00B20040,
    reveal_map=0x00B20044,
    vision_range=0x00B20048
)

# 偏移映射
OFFSET_MAP = {
    "1.20e": OFFSETS_120E,
    "1.24b": OFFSETS_124B,
    "1.27": OFFSETS_127
}


def get_offsets(version: str) -> Optional[GameOffsets]:
    """获取指定版本的偏移"""
    return OFFSET_MAP.get(version)


def detect_version(process_handle: int = None) -> str:
    """
    检测游戏版本
    返回: "1.20e", "1.24b", "1.27" 或 "unknown"
    """
    # 默认返回1.20e
    return "1.20e"


def get_supported_versions() -> list:
    """获取支持的版本列表"""
    return list(OFFSET_MAP.keys())


if __name__ == "__main__":
    print("=== 内存偏移定义 ===")
    print(f"支持版本: {get_supported_versions()}")

    for version in get_supported_versions():
        offsets = get_offsets(version)
        if offsets:
            print(f"\n版本 {version}:")
            print(f"  游戏对象管理器: 0x{offsets.game_object_manager:08X}")
            print(f"  本地玩家: 0x{offsets.local_player:08X}")
            print(f"  游戏时间: 0x{offsets.game_time:08X}")
            print(f"  战争迷雾: 0x{offsets.fog_of_war:08X}")
