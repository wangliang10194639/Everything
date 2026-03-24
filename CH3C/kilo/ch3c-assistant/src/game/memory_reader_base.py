"""
内存读取器基类 - 定义内存读取接口

提供抽象基类，Windows和Mock实现都需要继承此类
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass, field
from enum import IntEnum
import logging

logger = logging.getLogger(__name__)


class UnitType(IntEnum):
    """单位类型"""
    HERO = 0
    BUILDING = 1
    UNIT = 2
    ITEM = 3
    UNKNOWN = 255


class PlayerSlot(IntEnum):
    """玩家槽位"""
    PLAYER_1 = 0
    PLAYER_2 = 1
    PLAYER_3 = 2
    PLAYER_4 = 3
    PLAYER_5 = 4
    PLAYER_6 = 5
    PLAYER_7 = 6
    PLAYER_8 = 7
    PLAYER_9 = 8
    PLAYER_10 = 9
    PLAYER_11 = 10
    PLAYER_12 = 11
    NEUTRAL = 12
    UNKNOWN = 255


@dataclass
class UnitInfo:
    """单位信息"""
    unit_id: int = 0
    unit_type: UnitType = UnitType.UNKNOWN
    player_slot: PlayerSlot = PlayerSlot.UNKNOWN
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0
    health: float = 0.0
    max_health: float = 0.0
    mana: float = 0.0
    max_mana: float = 0.0
    is_alive: bool = True
    is_visible: bool = True
    is_enemy: bool = False
    hero_id: int = 0  # 英雄ID（如果是英雄）
    level: int = 1
    name: str = ""
    custom_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class HeroInfo:
    """英雄信息"""
    unit_info: UnitInfo
    hero_name: str = ""
    skills: List[int] = field(default_factory=list)
    items: List[int] = field(default_factory=list)
    has_ultimate: bool = False
    ultimate_ready: bool = False
    is_silenced: bool = False
    is_stunned: bool = False
    is_polymorphed: bool = False
    is_invisible: bool = False
    is_invulnerable: bool = False


@dataclass
class GameInfo:
    """游戏信息"""
    is_in_game: bool = False
    map_name: str = ""
    game_time: float = 0.0
    player_slot: PlayerSlot = PlayerSlot.UNKNOWN
    allies: List[PlayerSlot] = field(default_factory=list)
    enemies: List[PlayerSlot] = field(default_factory=list)


class MemoryReaderBase(ABC):
    """
    内存读取器基类 - 定义内存读取接口
    
    所有平台特定的内存读取器都需要继承此类并实现所有抽象方法
    """
    
    def __init__(self):
        """初始化内存读取器"""
        self._attached = False
        self._process_name = ""
        self._base_address = 0
        self._game_info: Optional[GameInfo] = None
        
    @abstractmethod
    def attach(self, process_name: str) -> bool:
        """
        附加到进程
        
        Args:
            process_name: 进程名称（如 "war3.exe"）
            
        Returns:
            是否附加成功
        """
        pass
    
    @abstractmethod
    def detach(self) -> bool:
        """
        从进程分离
        
        Returns:
            是否分离成功
        """
        pass
    
    @abstractmethod
    def is_attached(self) -> bool:
        """
        检查是否已附加到进程
        
        Returns:
            是否已附加
        """
        pass
    
    @abstractmethod
    def read_bytes(self, address: int, size: int) -> bytes:
        """
        读取内存字节
        
        Args:
            address: 内存地址
            size: 读取字节数
            
        Returns:
            读取的字节数据
        """
        pass
    
    @abstractmethod
    def read_int(self, address: int) -> int:
        """
        读取32位整数
        
        Args:
            address: 内存地址
            
        Returns:
            读取的整数值
        """
        pass
    
    @abstractmethod
    def read_float(self, address: int) -> float:
        """
        读取浮点数
        
        Args:
            address: 内存地址
            
        Returns:
            读取的浮点数值
        """
        pass
    
    @abstractmethod
    def read_string(self, address: int, max_length: int = 256) -> str:
        """
        读取字符串
        
        Args:
            address: 内存地址
            max_length: 最大长度
            
        Returns:
            读取的字符串
        """
        pass
    
    @abstractmethod
    def write_bytes(self, address: int, data: bytes) -> bool:
        """
        写入内存字节
        
        Args:
            address: 内存地址
            data: 要写入的数据
            
        Returns:
            是否写入成功
        """
        pass
    
    @abstractmethod
    def write_int(self, address: int, value: int) -> bool:
        """
        写入32位整数
        
        Args:
            address: 内存地址
            value: 要写入的值
            
        Returns:
            是否写入成功
        """
        pass
    
    @abstractmethod
    def write_float(self, address: int, value: float) -> bool:
        """
        写入浮点数
        
        Args:
            address: 内存地址
            value: 要写入的值
            
        Returns:
            是否写入成功
        """
        pass
    
    @abstractmethod
    def get_module_base(self, module_name: str) -> int:
        """
        获取模块基址
        
        Args:
            module_name: 模块名称
            
        Returns:
            模块基址
        """
        pass
    
    @abstractmethod
    def find_pattern(self, pattern: str, mask: str, start: int = 0, end: int = 0) -> int:
        """
        搜索内存模式
        
        Args:
            pattern: 字节模式
            mask: 掩码（x=匹配, ?=通配）
            start: 起始地址
            end: 结束地址
            
        Returns:
            找到的地址，未找到返回0
        """
        pass
    
    # === 游戏特定方法 ===
    
    @abstractmethod
    def get_game_info(self) -> GameInfo:
        """
        获取游戏信息
        
        Returns:
            游戏信息
        """
        pass
    
    @abstractmethod
    def get_all_units(self) -> List[UnitInfo]:
        """
        获取所有单位
        
        Returns:
            单位列表
        """
        pass
    
    @abstractmethod
    def get_heroes(self, include_allies: bool = True, include_enemies: bool = True) -> List[HeroInfo]:
        """
        获取英雄列表
        
        Args:
            include_allies: 是否包含盟友英雄
            include_enemies: 是否包含敌人英雄
            
        Returns:
            英雄列表
        """
        pass
    
    @abstractmethod
    def get_enemy_heroes(self) -> List[HeroInfo]:
        """
        获取敌人英雄列表
        
        Returns:
            敌人英雄列表
        """
        pass
    
    @abstractmethod
    def get_ally_heroes(self) -> List[HeroInfo]:
        """
        获取盟友英雄列表
        
        Returns:
            盟友英雄列表
        """
        pass
    
    @abstractmethod
    def get_my_hero(self) -> Optional[HeroInfo]:
        """
        获取自己控制的英雄
        
        Returns:
            自己的英雄，未找到返回None
        """
        pass
    
    @abstractmethod
    def get_units_in_range(self, x: float, y: float, range: float, 
                           include_allies: bool = False, 
                           include_enemies: bool = True) -> List[UnitInfo]:
        """
        获取范围内的单位
        
        Args:
            x: X坐标
            y: Y坐标
            range: 搜索范围
            include_allies: 是否包含盟友
            include_enemies: 是否包含敌人
            
        Returns:
            范围内的单位列表
        """
        pass
    
    @abstractmethod
    def is_unit_in_status(self, unit: UnitInfo, status: str) -> bool:
        """
        检查单位是否处于特定状态
        
        Args:
            unit: 单位信息
            status: 状态名称
            
        Returns:
            是否处于该状态
        """
        pass
    
    @abstractmethod
    def get_unit_health_percent(self, unit: UnitInfo) -> float:
        """
        获取单位血量百分比
        
        Args:
            unit: 单位信息
            
        Returns:
            血量百分比 (0-100)
        """
        pass
    
    @abstractmethod
    def get_unit_mana_percent(self, unit: UnitInfo) -> float:
        """
        获取单位魔法百分比
        
        Args:
            unit: 单位信息
            
        Returns:
            魔法百分比 (0-100)
        """
        pass
    
    # === 全图功能相关 ===
    
    @abstractmethod
    def enable_maphack(self, enable: bool = True) -> bool:
        """
        启用/禁用全图功能
        
        Args:
            enable: 是否启用
            
        Returns:
            是否操作成功
        """
        pass
    
    @abstractmethod
    def is_maphack_enabled(self) -> bool:
        """
        检查全图功能是否启用
        
        Returns:
            是否启用
        """
        pass
    
    @abstractmethod
    def reveal_area(self, x: float, y: float, radius: float) -> bool:
        """
        揭示指定区域（去除战争迷雾）
        
        Args:
            x: X坐标
            y: Y坐标
            radius: 半径
            
        Returns:
            是否操作成功
        """
        pass
    
    # === 辅助方法 ===
    
    def get_distance(self, unit1: UnitInfo, unit2: UnitInfo) -> float:
        """
        计算两个单位之间的距离
        
        Args:
            unit1: 单位1
            unit2: 单位2
            
        Returns:
            距离
        """
        dx = unit1.x - unit2.x
        dy = unit1.y - unit2.y
        return (dx * dx + dy * dy) ** 0.5
    
    def get_distance_xy(self, x1: float, y1: float, x2: float, y2: float) -> float:
        """
        计算两点之间的距离
        
        Args:
            x1, y1: 点1坐标
            x2, y2: 点2坐标
            
        Returns:
            距离
        """
        dx = x1 - x2
        dy = y1 - y2
        return (dx * dx + dy * dy) ** 0.5
    
    def is_in_range(self, unit1: UnitInfo, unit2: UnitInfo, range: float) -> bool:
        """
        检查两个单位是否在指定范围内
        
        Args:
            unit1: 单位1
            unit2: 单位2
            range: 范围
            
        Returns:
            是否在范围内
        """
        return self.get_distance(unit1, unit2) <= range
