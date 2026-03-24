"""
平台检测模块 - 检测当前运行平台

支持的平台:
- Windows: 完整功能支持
- WSL: 开发测试环境，使用Mock实现
- Linux: 不支持，使用Mock实现
"""

import sys
import platform
import logging

logger = logging.getLogger(__name__)

# 检测平台类型
IS_WINDOWS = sys.platform == 'win32' or platform.system() == 'Windows'
IS_LINUX = sys.platform.startswith('linux')
IS_WSL = IS_LINUX and 'microsoft' in platform.release().lower()
IS_MACOS = sys.platform == 'darwin'


def get_platform() -> str:
    """
    获取当前平台类型
    
    Returns:
        平台类型字符串: 'windows', 'wsl', 'linux', 'macos', 'unknown'
    """
    if IS_WINDOWS:
        return 'windows'
    elif IS_WSL:
        return 'wsl'
    elif IS_LINUX:
        return 'linux'
    elif IS_MACOS:
        return 'macos'
    else:
        return 'unknown'


def get_platform_info() -> dict:
    """
    获取详细平台信息
    
    Returns:
        平台信息字典
    """
    return {
        'platform': get_platform(),
        'system': platform.system(),
        'release': platform.release(),
        'version': platform.version(),
        'machine': platform.machine(),
        'processor': platform.processor(),
        'python_version': platform.python_version(),
        'is_windows': IS_WINDOWS,
        'is_wsl': IS_WSL,
        'is_linux': IS_LINUX,
        'is_macos': IS_MACOS,
    }


def is_windows_modules_available() -> bool:
    """
    检查Windows特有模块是否可用
    
    Returns:
        Windows模块是否可用
    """
    if not IS_WINDOWS:
        return False
        
    try:
        import pymem
        import win32api
        import keyboard
        import mouse
        return True
    except ImportError as e:
        logger.warning(f"Windows模块导入失败: {e}")
        return False


def check_admin_rights() -> bool:
    """
    检查是否有管理员权限
    
    Returns:
        是否有管理员权限
    """
    if IS_WINDOWS:
        try:
            import ctypes
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        except Exception:
            return False
    else:
        # Linux/WSL下检查root权限
        return os.geteuid() == 0 if hasattr(os, 'geteuid') else False


# 延迟导入os，避免在模块加载时出错
import os

# 模块可用性标志
WINDOWS_MODULES_AVAILABLE = is_windows_modules_available() if IS_WINDOWS else False


def log_platform_info():
    """记录平台信息日志"""
    info = get_platform_info()
    logger.info(f"平台信息: {info['platform']}")
    logger.info(f"系统: {info['system']} {info['release']}")
    logger.info(f"Python: {info['python_version']}")
    logger.info(f"Windows模块可用: {WINDOWS_MODULES_AVAILABLE}")
    
    if IS_WINDOWS:
        logger.info(f"管理员权限: {check_admin_rights()}")
