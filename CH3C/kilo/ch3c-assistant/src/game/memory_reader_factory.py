"""
内存读取器工厂 - 根据平台选择合适的内存读取器实现
"""

import logging
from .memory_reader_base import MemoryReaderBase
from .platform import IS_WINDOWS, WINDOWS_MODULES_AVAILABLE

logger = logging.getLogger(__name__)


def get_memory_reader() -> MemoryReaderBase:
    """
    获取适合当前平台的内存读取器
    
    Returns:
        内存读取器实例
    """
    if IS_WINDOWS and WINDOWS_MODULES_AVAILABLE:
        # Windows平台，使用真实的内存读取器
        try:
            from .memory_reader_windows import WindowsMemoryReader
            logger.info("使用Windows内存读取器")
            return WindowsMemoryReader()
        except ImportError as e:
            logger.warning(f"无法导入Windows内存读取器: {e}")
            logger.info("回退到Mock内存读取器")
    else:
        # 非Windows平台或模块不可用，使用Mock实现
        logger.info("使用Mock内存读取器（开发/测试模式）")
        
    from .memory_reader_mock import MockMemoryReader
    return MockMemoryReader()


def create_memory_reader(reader_type: str = "auto") -> MemoryReaderBase:
    """
    创建指定类型的内存读取器
    
    Args:
        reader_type: 读取器类型 ("auto", "windows", "mock")
        
    Returns:
        内存读取器实例
    """
    if reader_type == "auto":
        return get_memory_reader()
    elif reader_type == "windows":
        if IS_WINDOWS:
            try:
                from .memory_reader_windows import WindowsMemoryReader
                return WindowsMemoryReader()
            except ImportError:
                raise RuntimeError("Windows内存读取器不可用")
        else:
            raise RuntimeError("Windows内存读取器只能在Windows平台使用")
    elif reader_type == "mock":
        from .memory_reader_mock import MockMemoryReader
        return MockMemoryReader()
    else:
        raise ValueError(f"未知的读取器类型: {reader_type}")
