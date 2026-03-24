#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置解析器模块 - 解析3C.txt配置文件（Windows版）
"""

import configparser
import re
import sys
from pathlib import Path
from typing import Dict, List, Any

sys.path.insert(0, str(Path(__file__).parent.parent))


class ConfigParser:
    """3C.txt配置文件解析器（Windows版）"""

    def __init__(self, config_file: str):
        self.config_file = config_file
        self.config = configparser.ConfigParser(
            allow_no_value=True,
            delimiters='=',
            comment_prefixes=';',
            strict=False,
            interpolation=None
        )
        self.config.optionxform = lambda x: x  # 保留选项名大小写
        self._load_config()

    def _load_config(self):
        """加载配置文件（Windows版）"""
        try:
            # 读取配置文件（尝试GBK编码）
            try:
                with open(self.config_file, 'rb') as f:
                    raw_bytes = f.read()

                # 尝试解码（先GBK，后UTF-8）
                try:
                    content = raw_bytes.decode('gbk')
                except:
                    try:
                        content = raw_bytes.decode('utf-8')
                    except:
                        content = raw_bytes.decode('latin-1')

            except Exception as e:
                print(f"读取文件失败: {e}")
                raise

            # 预处理：修复一些特殊格式
            content = re.sub(r'\[(\w+)\.(\w+)\]', r'[\1_\2]', content)
            content = re.sub(r'hotkey\.(\w+)', r'hotkey_\1', content)

            # 临时文件路径
            temp_config = Path(__file__).parent.parent / "temp_config.txt"
            with open(temp_config, 'w', encoding='utf-8') as f:
                f.write(content)

            self.config.read(str(temp_config), encoding='utf-8')

            # 清理临时文件
            try:
                temp_config.unlink()
            except:
                pass

        except Exception as e:
            print(f"配置文件加载失败: {e}")
            raise

    def reload(self):
        """重新加载配置"""
        self._load_config()

    # ========== [normal] 节 ==========
    def get_normal_info(self) -> Dict[str, str]:
        """获取版本和描述信息"""
        info = {}
        if 'normal' in self.config:
            info['ver'] = self.config['normal'].get('ver', '')
            info['desc'] = self.config['normal'].get('desc', '')
            info['author'] = self.config['normal'].get('author', '')
            info['ff'] = self.config['normal'].get('ff', '')
        return info

    # ========== [orderdefine] 节 ==========
    def get_order_defines(self) -> Dict[str, str]:
        """获取技能命令定义"""
        if 'orderdefine' in self.config:
            return dict(self.config['orderdefine'])
        return {}

    # ========== [action] 节 ==========
    def get_actions(self) -> Dict[str, str]:
        """获取动作脚本"""
        if 'action' in self.config:
            return dict(self.config['action'])
        return {}

    # ========== [superFunc] 节 ==========
    def get_super_functions(self) -> Dict[str, int]:
        """获取超级功能配置"""
        funcs = {}
        if 'superFunc' in self.config:
            for key, value in self.config['superFunc'].items():
                funcs[key] = int(value) if value else 0
        return funcs

    # ========== [hotkey.*] 节 ==========
    def get_hotkey_configs(self) -> Dict[str, Dict[str, str]]:
        """获取所有热键配置"""
        hotkeys = {}

        # 匹配所有 hotkey_ 开头的节
        for section in self.config.sections():
            if section.startswith('hotkey_'):
                section_name = section.replace('hotkey_', '', 1)
                hotkeys[section_name] = dict(self.config[section])

        # 处理原始格式的 [hotkey.All] 等节
        for section in self.config.sections():
            if section.startswith('hotkey') and '.' in section:
                section_name = section.replace('hotkey.', '', 1)
                hotkeys[section_name] = dict(self.config[section])

        return hotkeys

    # ========== [物品] 节 ==========
    def get_item_configs(self) -> Dict[str, str]:
        """获取物品配置"""
        if '物品' in self.config:
            return dict(self.config['物品'])
        return {}

    # ========== [技能.*] 节 ==========
    def get_skill_configs(self) -> Dict[str, Dict[str, str]]:
        """获取技能配置"""
        skills = {}
        for section in self.config.sections():
            if section.startswith('技能'):
                section_name = section.replace('技能.', '', 1)
                skills[section_name] = dict(self.config[section])
        return skills

    # ========== [商店.*] 节 ==========
    def get_shop_configs(self) -> Dict[str, Dict[str, str]]:
        """获取商店配置"""
        shops = {}
        for section in self.config.sections():
            if section.startswith('商店'):
                section_name = section.replace('商店.', '', 1)
                shops[section_name] = dict(self.config[section])
        return shops

    # ========== [大招定义] 节 ==========
    def get_ultimate_skills(self) -> Dict[str, str]:
        """获取大招定义"""
        if '大招定义' in self.config:
            return dict(self.config['大招定义'])
        return {}

    # ========== [hotkey.屏蔽] 节 ==========
    def get_blocked_hotkeys(self) -> List[str]:
        """获取屏蔽的热键"""
        keys = []
        if 'hotkey.屏蔽' in self.config and '列表' in self.config['hotkey.屏蔽']:
            keys = self.config['hotkey.屏蔽']['列表'].split(',')
            keys = [key.strip() for key in keys if key.strip()]
        return keys

    # ========== [hotkey.replace] 节 ==========
    def get_replaced_hotkeys(self) -> Dict[str, str]:
        """获取替换的热键"""
        replaces = {}
        if 'hotkey.replace' in self.config:
            for key, value in self.config['hotkey.replace'].items():
                if value:
                    replaces[key] = value.strip()
        return replaces

    # ========== 获取英雄特定配置 ==========
    def get_hero_hotkeys(self, hero_name: str) -> Dict[str, str]:
        """获取特定英雄的热键配置"""
        hotkeys = self.get_hotkey_configs()

        hero_keys = {}

        # 通用热键
        if 'All' in hotkeys:
            hero_keys.update(hotkeys['All'])

        # 英雄特定热键
        if hero_name in hotkeys:
            hero_keys.update(hotkeys[hero_name])

        return hero_keys

    # ========== 保存配置 ==========
    def save_config(self):
        """保存配置到文件"""
        try:
            with open(self.config_file, 'w', encoding='gbk') as configfile:
                self.config.write(configfile)
            return True
        except Exception as e:
            print(f"配置保存失败: {e}")
            return False

    # ========== 调试功能 ==========
    def print_config_summary(self):
        """打印配置摘要"""
        print("=== CH3C 配置摘要 ===")

        normal = self.get_normal_info()
        print(f"版本: {normal['ver']}")
        print(f"描述: {normal['desc']}")

        print(f"\n技能定义数量: {len(self.get_order_defines())}")
        print(f"动作脚本数量: {len(self.get_actions())}")
        print(f"热键配置节: {len(self.get_hotkey_configs())}")

        hotkeys_all = self.get_hotkey_configs().get('All', {})
        print(f"\n通用热键数量: {len(hotkeys_all)}")


if __name__ == "__main__":
    # 测试
    import os

    config_path = os.path.join(os.path.dirname(__file__), '..', 'configs', '3C.txt')
    parser = ConfigParser(config_path)

    print("=== 配置解析器测试 ===")
    parser.print_config_summary()

    hotkey_profiles = parser.get_hotkey_configs()
    print(f"\n热键配置文件: {list(hotkey_profiles.keys())[:10]}...")

    actions = parser.get_actions()
    print(f"动作脚本数量: {len(actions)}")
    print(f"技能命令定义: {len(parser.get_order_defines())}")

    hero_hotkeys = parser.get_hero_hotkeys('牛头人酋长')
    print(f"\n牛头人酋长热键: {len(hero_hotkeys)}")
    for key in list(hero_hotkeys.keys())[:5]:
        print(f"  {key}")
