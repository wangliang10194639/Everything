"""
游戏模块 - 内存读取、游戏接口、全图功能
"""

from .platform import IS_WINDOWS, IS_WSL, get_platform
from .memory_reader_base import MemoryReaderBase
from .memory_reader_factory import get_memory_reader

__all__ = [
    'IS_WINDOWS', 'IS_WSL', 'get_platform',
    'MemoryReaderBase', 'get_memory_reader'
]
