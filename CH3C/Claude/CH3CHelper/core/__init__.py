#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CH3C Helper Core Module
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from .config_parser import ConfigParser
from .game_data import (
    GameState, Unit, Hero, Point, Bounds,
    UnitType, HeroState, Ability, Item,
    WatchCondition, CH3C_HERO_NAMES, CH3C_IMPORTANT_ITEMS
)
from .memory_reader import MemoryReader
from .memory_offsets import get_offsets, get_supported_versions, detect_version, GameOffsets
from .process_hook import InputSimulator, KeyboardHook, ProcessHook

__all__ = [
    'ConfigParser',
    'GameState', 'Unit', 'Hero', 'Point', 'Bounds',
    'UnitType', 'HeroState', 'Ability', 'Item',
    'WatchCondition', 'CH3C_HERO_NAMES', 'CH3C_IMPORTANT_ITEMS',
    'MemoryReader',
    'InputSimulator', 'KeyboardHook', 'ProcessHook',
    'GameOffsets', 'get_offsets', 'get_supported_versions', 'detect_version'
]
