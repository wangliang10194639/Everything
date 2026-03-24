#!/usr/bin/env python3
"""
CH3C Assistant - 澪海3C游戏辅助工具

主入口文件
"""

import sys
import os

# 添加src目录到路径
src_path = os.path.dirname(os.path.abspath(__file__))
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from src.utils.logger import init_default_logging, get_logger
from src.ui.main_window import run_app


def main():
    """主函数"""
    # 初始化日志
    logger = init_default_logging()
    logger.info("=" * 50)
    logger.info("CH3C Assistant 启动")
    logger.info("=" * 50)
    
    # 记录平台信息
    from src.game.platform import log_platform_info
    log_platform_info()
    
    try:
        # 运行应用程序
        run_app()
    except Exception as e:
        logger.exception(f"应用程序错误: {e}")
        sys.exit(1)
    finally:
        logger.info("CH3C Assistant 退出")


if __name__ == "__main__":
    main()
