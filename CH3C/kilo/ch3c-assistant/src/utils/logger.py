"""
日志模块 - 配置和管理日志输出

提供彩色日志输出，支持控制台和文件输出
"""

import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

# 尝试导入colorlog，如果不可用则使用标准logging
try:
    import colorlog
    HAS_COLORLOG = True
except ImportError:
    HAS_COLORLOG = False


# 日志格式
DEFAULT_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
COLOR_FORMAT = "%(log_color)s%(asctime)s - %(name)s - %(levelname)s%(reset)s - %(message)s"

# 日志颜色配置
LOG_COLORS = {
    'DEBUG': 'cyan',
    'INFO': 'green',
    'WARNING': 'yellow',
    'ERROR': 'red',
    'CRITICAL': 'red,bg_white',
}


def setup_logger(
    name: str = "ch3c",
    level: int = logging.INFO,
    log_file: Optional[str] = None,
    console_output: bool = True
) -> logging.Logger:
    """
    设置日志记录器
    
    Args:
        name: 日志记录器名称
        level: 日志级别
        log_file: 日志文件路径（可选）
        console_output: 是否输出到控制台
        
    Returns:
        配置好的日志记录器
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # 清除现有处理器
    logger.handlers.clear()
    
    # 控制台处理器
    if console_output:
        if HAS_COLORLOG:
            # 使用彩色日志
            handler = colorlog.StreamHandler(sys.stdout)
            handler.setFormatter(colorlog.ColoredFormatter(
                COLOR_FORMAT,
                log_colors=LOG_COLORS
            ))
        else:
            # 使用标准日志
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(logging.Formatter(DEFAULT_FORMAT))
            
        handler.setLevel(level)
        logger.addHandler(handler)
    
    # 文件处理器
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(logging.Formatter(DEFAULT_FORMAT))
        file_handler.setLevel(level)
        logger.addHandler(file_handler)
    
    return logger


def get_logger(name: str = "ch3c") -> logging.Logger:
    """
    获取日志记录器
    
    Args:
        name: 日志记录器名称
        
    Returns:
        日志记录器
    """
    return logging.getLogger(name)


class LoggerAdapter(logging.LoggerAdapter):
    """
    日志适配器 - 添加额外上下文信息
    """
    
    def __init__(self, logger: logging.Logger, extra: dict = None):
        super().__init__(logger, extra or {})
        
    def process(self, msg, kwargs):
        # 添加额外信息
        extra = self.extra.copy()
        if 'extra' in kwargs:
            extra.update(kwargs['extra'])
        kwargs['extra'] = extra
        return msg, kwargs


def create_module_logger(module_name: str) -> logging.Logger:
    """
    创建模块日志记录器
    
    Args:
        module_name: 模块名称
        
    Returns:
        模块日志记录器
    """
    return logging.getLogger(f"ch3c.{module_name}")


# 默认日志配置
def init_default_logging():
    """初始化默认日志配置"""
    # 创建日志目录
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # 日志文件名包含日期
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = log_dir / f"ch3c_{today}.log"
    
    # 设置根日志记录器
    root_logger = setup_logger(
        name="ch3c",
        level=logging.DEBUG,
        log_file=str(log_file),
        console_output=True
    )
    
    return root_logger


# 模块级日志记录器
logger = create_module_logger("utils")
