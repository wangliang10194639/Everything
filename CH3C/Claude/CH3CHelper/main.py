#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
澄海3C游戏辅助软件 - 主程序入口
"""

import os
import sys
import time
import threading
import signal
from pathlib import Path

# 添加当前目录到路径
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from core import (
    ConfigParser, MemoryReader, InputSimulator, KeyboardHook, ProcessHook,
    CH3C_HERO_NAMES
)
from modules import (
    MapHack, MinimapOverlay,
    HeroTracker, HeroOverlay,
    HotkeyManager, QuickItemSwitch,
    ScriptEngine
)


class CH3CHelper:
    """澄海3C辅助主程序"""

    def __init__(self, config_file: str = None):
        # 设置配置文件路径
        if config_file is None:
            config_file = current_dir / "configs" / "3C.txt"

        self.config_file = str(config_file)
        self.is_running = False
        self.main_thread: threading.Thread = None

        # 初始化核心组件
        print("正在初始化组件...")
        self.config = ConfigParser(self.config_file)
        self.memory_reader = MemoryReader()
        self.input_simulator = InputSimulator()
        self.process_hook = ProcessHook()

        # 初始化功能模块
        self.map_hack = MapHack(self.memory_reader)
        self.hero_tracker = HeroTracker(self.memory_reader)
        self.hotkey_manager = HotkeyManager(self.config, self.input_simulator)
        self.script_engine = ScriptEngine(
            self.config,
            self.memory_reader,
            self.input_simulator
        )

        # 覆盖层
        self.minimap_overlay = MinimapOverlay()
        self.hero_overlay = HeroOverlay(self.hero_tracker)

        # 设置信号处理
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

        print("初始化完成！")

    def _signal_handler(self, signum, frame):
        """处理终止信号"""
        print("\n接收到终止信号，正在关闭...")
        self.stop()
        sys.exit(0)

    def print_welcome(self):
        """打印欢迎信息"""
        normal = self.config.get_normal_info()
        print("\n" + "="*50)
        print("  澄海3C 游戏辅助软件")
        print("="*50)
        print(f"  配置版本: {normal.get('ver', 'N/A')}")
        print(f"  描述: {normal.get('desc', 'N/A')}")
        print(f"  作者: {normal.get('author', 'N/A')}")
        print("="*50)

    def attach_to_game(self) -> bool:
        """附加到游戏进程"""
        print("\n正在查找魔兽争霸III进程...")
        if self.memory_reader.attach():
            print("✓ 成功附加到游戏进程")
            return True
        else:
            print("✗ 无法附加到游戏进程 (使用模拟模式)")
            return False

    def start(self):
        """启动所有功能"""
        if self.is_running:
            print("程序已经在运行中")
            return

        self.is_running = True
        self.print_welcome()

        # 附加到游戏
        self.attach_to_game()

        # 启动模块
        print("\n正在启动功能模块...")
        self.hero_tracker.start()
        self.hotkey_manager.start()
        self.script_engine.start()

        # 注册回调
        self._setup_callbacks()

        # 启动主循环
        self.main_thread = threading.Thread(target=self._main_loop, daemon=True)
        self.main_thread.start()

        print("\n✓ 程序已启动！")
        print("\n可用命令:")
        print("  status  - 显示当前状态")
        print("  map     - 切换全图功能")
        print("  heroes  - 显示英雄列表")
        print("  scripts - 显示可用脚本")
        print("  run <script> - 运行脚本")
        print("  stop <script> - 停止脚本")
        print("  hero <name> - 切换英雄热键")
        print("  quit    - 退出程序")
        print("")

    def _setup_callbacks(self):
        """设置回调函数"""
        # 英雄追踪回调
        self.hero_tracker.on_enemy_appear = lambda h: print(f"⚠ 敌方英雄出现: {h.name}")
        self.hero_tracker.on_skill_cast = lambda h, a: print(f"⚡ {h.name} 释放 {a.name}")
        self.hero_tracker.on_low_health = lambda h: print(f"❤️  {h.name} 血量危急!")
        self.hero_tracker.on_hero_death = lambda h: print(f"💀 {h.name} 死亡!")

    def _main_loop(self):
        """主循环"""
        update_count = 0
        while self.is_running:
            try:
                game_state = self.memory_reader.update_game_state()

                if game_state.is_in_game:
                    # 更新覆盖层
                    for hero in game_state.enemy_heroes:
                        self.minimap_overlay.update_enemy_hero(
                            hero.hero_id,
                            hero.position.x,
                            hero.position.y,
                            hero.health_pct()
                        )
                    for hero in game_state.ally_heroes:
                        self.minimap_overlay.update_ally_hero(
                            hero.hero_id,
                            hero.position.x,
                            hero.position.y,
                            hero.health_pct()
                        )

                update_count += 1
                time.sleep(0.1)

            except Exception as e:
                print(f"主循环错误: {e}")
                time.sleep(0.5)

    def stop(self):
        """停止程序"""
        if not self.is_running:
            return

        print("\n正在停止程序...")
        self.is_running = False

        # 停止模块
        self.map_hack.disable()
        self.hero_tracker.stop()
        self.hotkey_manager.stop()
        self.script_engine.stop()

        # 分离进程
        self.memory_reader.detach()

        if self.main_thread:
            self.main_thread.join(timeout=1.0)

        print("✓ 程序已停止")

    def print_status(self):
        """打印当前状态"""
        print("\n" + "-"*50)
        print("当前状态:")
        print(f"  游戏运行: {'是' if self.memory_reader.is_in_game() else '否'}")
        print(f"  全图功能: {'开启' if self.map_hack.is_enabled else '关闭'}")
        print(f"  英雄追踪: {'运行中' if self.hero_tracker.is_running else '停止'}")
        print(f"  热键管理: {'运行中' if self.hotkey_manager.is_running else '停止'}")

        hk_status = self.hotkey_manager.get_status()
        print(f"  当前英雄: {hk_status['current_hero'] or '未设置'}")
        print(f"  热键数量: {hk_status['hotkey_count']}")

        running_scripts = self.script_engine.get_running_scripts()
        print(f"  运行脚本: {len(running_scripts)} 个")
        if running_scripts:
            print(f"    - {', '.join(running_scripts)}")

        print("-"*50)

    def print_heroes(self):
        """显示英雄状态"""
        print("\n" + self.hero_overlay.get_display_text())

    def print_scripts(self):
        """显示可用脚本"""
        scripts = self.script_engine.get_script_names()
        print(f"\n可用脚本 ({len(scripts)} 个):")
        for i, name in enumerate(scripts[:30], 1):  # 只显示前30个
            print(f"  {i:2d}. {name}")
        if len(scripts) > 30:
            print(f"  ... 还有 {len(scripts) - 30} 个脚本")

    def run_script(self, script_name: str):
        """运行脚本"""
        if self.script_engine.run_script(script_name):
            print(f"✓ 已启动脚本: {script_name}")
        else:
            print(f"✗ 脚本未找到: {script_name}")

    def stop_script(self, script_name: str):
        """停止脚本"""
        self.script_engine.stop_script(script_name)
        print(f"已停止脚本: {script_name}")

    def set_hero(self, hero_name: str):
        """设置当前英雄"""
        # 查找匹配的英雄名
        matched = None
        for hero in CH3C_HERO_NAMES:
            if hero_name in hero:
                matched = hero
                break

        if matched:
            self.hotkey_manager.set_current_hero(matched)
            print(f"✓ 已切换英雄: {matched}")
        else:
            # 尝试直接设置
            self.hotkey_manager.set_current_hero(hero_name)
            print(f"已尝试切换英雄: {hero_name}")

    def interactive_shell(self):
        """交互命令行"""
        print("\n进入交互模式 (输入 'help' 获取帮助)")

        while self.is_running:
            try:
                cmd = input("> ").strip().lower()

                if not cmd:
                    continue

                parts = cmd.split(maxsplit=1)
                main_cmd = parts[0]

                if main_cmd in ['quit', 'exit', 'q']:
                    break
                elif main_cmd in ['help', '?']:
                    self._print_help()
                elif main_cmd == 'status':
                    self.print_status()
                elif main_cmd == 'map':
                    self.map_hack.toggle()
                    status = '开启' if self.map_hack.is_enabled else '关闭'
                    print(f"全图功能: {status}")
                elif main_cmd == 'heroes':
                    self.print_heroes()
                elif main_cmd == 'scripts':
                    self.print_scripts()
                elif main_cmd == 'run' and len(parts) > 1:
                    self.run_script(parts[1])
                elif main_cmd == 'stop' and len(parts) > 1:
                    self.stop_script(parts[1])
                elif main_cmd == 'hero' and len(parts) > 1:
                    self.set_hero(parts[1])
                elif main_cmd == 'clear':
                    os.system('cls' if os.name == 'nt' else 'clear')
                else:
                    print(f"未知命令: {cmd}")

            except KeyboardInterrupt:
                break
            except EOFError:
                break
            except Exception as e:
                print(f"命令错误: {e}")

    def _print_help(self):
        """打印帮助信息"""
        print("\n命令列表:")
        print("  help/?    - 显示帮助")
        print("  status    - 显示当前状态")
        print("  map       - 切换全图功能")
        print("  heroes    - 显示英雄状态")
        print("  scripts   - 显示可用脚本")
        print("  run <name>  - 运行脚本")
        print("  stop <name> - 停止脚本")
        print("  hero <name> - 切换英雄热键")
        print("  clear     - 清屏")
        print("  quit/exit - 退出程序")


def main():
    """主函数"""
    print("正在启动澄海3C辅助软件...")

    # 创建辅助实例
    helper = CH3CHelper()

    try:
        # 启动程序
        helper.start()

        # 进入交互模式
        helper.interactive_shell()

    except Exception as e:
        print(f"程序错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # 确保停止
        helper.stop()


if __name__ == "__main__":
    main()
