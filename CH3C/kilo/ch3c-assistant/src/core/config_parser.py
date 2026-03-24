"""
配置解析器 - 解析3C.txt配置文件

配置文件格式为INI风格，包含以下主要部分：
- [normal] - 普通设置
- [orderdefine] - 技能OrderID定义
- [action] - 动作脚本定义
- [hotkey.*] - 热键绑定
- [技能] - 技能ID映射
- [物品] - 物品ID映射
- [AbilityDefine] - 技能详细定义
"""

import configparser
import re
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import logging

logger = logging.getLogger(__name__)


@dataclass
class ScriptInfo:
    """脚本信息"""
    name: str
    raw_content: str
    is_global: bool = False
    is_advanced: bool = False
    priority: str = "普通"
    block_default_key: bool = False
    hotkey: Optional[str] = None
    hero: Optional[str] = None


@dataclass
class HeroInfo:
    """英雄信息"""
    name: str
    hotkeys: Dict[str, str] = field(default_factory=dict)
    skills: List[str] = field(default_factory=list)


class ConfigParser:
    """
    配置解析器 - 解析3C.txt配置文件
    
    使用方法:
        parser = ConfigParser()
        parser.load("3C.txt")
        
        # 获取所有动作脚本
        actions = parser.get_all_actions()
        
        # 获取特定英雄的热键
        hotkeys = parser.get_hero_hotkeys("剑圣")
    """
    
    def __init__(self):
        """初始化配置解析器"""
        self.config = configparser.ConfigParser()
        self._raw_content: str = ""
        self._actions: Dict[str, ScriptInfo] = {}
        self._hero_hotkeys: Dict[str, Dict[str, str]] = {}
        self._order_ids: Dict[str, int] = {}
        self._skill_ids: Dict[str, int] = {}
        self._item_ids: Dict[str, int] = {}
        self._ability_defs: Dict[str, Dict[str, Any]] = {}
        self._loaded: bool = False
        
    def load(self, filepath: str) -> bool:
        """
        加载配置文件
        
        Args:
            filepath: 配置文件路径
            
        Returns:
            是否加载成功
        """
        try:
            path = Path(filepath)
            if not path.exists():
                logger.error(f"配置文件不存在: {filepath}")
                return False
                
            # 读取原始内容
            self._raw_content = path.read_text(encoding='utf-8')
            
            # 使用configparser解析
            self.config.read(filepath, encoding='utf-8')
            
            # 解析各个部分
            self._parse_order_ids()
            self._parse_skill_ids()
            self._parse_item_ids()
            self._parse_actions()
            self._parse_hero_hotkeys()
            self._parse_ability_defs()
            
            self._loaded = True
            logger.info(f"成功加载配置文件: {filepath}")
            logger.info(f"解析到 {len(self._actions)} 个动作脚本")
            logger.info(f"解析到 {len(self._hero_hotkeys)} 个英雄热键配置")
            return True
            
        except Exception as e:
            logger.error(f"加载配置文件失败: {e}")
            return False
    
    def _parse_order_ids(self) -> None:
        """解析技能OrderID定义"""
        if 'orderdefine' not in self.config:
            return
            
        for key, value in self.config['orderdefine'].items():
            try:
                # OrderID通常是整数
                self._order_ids[key] = int(value)
            except ValueError:
                logger.warning(f"无效的OrderID: {key}={value}")
                
        logger.debug(f"解析到 {len(self._order_ids)} 个OrderID定义")
    
    def _parse_skill_ids(self) -> None:
        """解析技能ID映射"""
        if '技能' not in self.config:
            return
            
        for key, value in self.config['技能'].items():
            try:
                self._skill_ids[key] = int(value)
            except ValueError:
                logger.warning(f"无效的技能ID: {key}={value}")
                
        logger.debug(f"解析到 {len(self._skill_ids)} 个技能ID")
    
    def _parse_item_ids(self) -> None:
        """解析物品ID映射"""
        if '物品' not in self.config:
            return
            
        for key, value in self.config['物品'].items():
            try:
                self._item_ids[key] = int(value)
            except ValueError:
                logger.warning(f"无效的物品ID: {key}={value}")
                
        logger.debug(f"解析到 {len(self._item_ids)} 个物品ID")
    
    def _parse_actions(self) -> None:
        """解析动作脚本定义"""
        if 'action' not in self.config:
            return
            
        for name, content in self.config['action'].items():
            script_info = self._parse_action_script(name, content)
            self._actions[name] = script_info
            
    def _parse_action_script(self, name: str, content: str) -> ScriptInfo:
        """
        解析单个动作脚本
        
        脚本格式示例:
        - 基本动作: 动作=使用技能,目标=敌人英雄
        - 高级动作: 高级动作=等待出现,目标=敌人英雄,范围=950,技能状态=大招
        - 全局脚本: 全局脚本;高级动作=...
        """
        is_global = False
        is_advanced = False
        priority = "普通"
        block_default_key = False
        hotkey = None
        hero = None
        
        # 解析脚本属性
        parts = content.split(';')
        main_content = content
        
        for part in parts:
            part = part.strip()
            
            # 检查是否为全局脚本
            if part == '全局脚本':
                is_global = True
                continue
                
            # 检查是否屏蔽默认键
            if part == '屏蔽默认键':
                block_default_key = True
                continue
                
            # 检查优先级
            if part.startswith('优先级='):
                priority = part.split('=')[1]
                continue
                
            # 检查热键
            if part.startswith('热键='):
                hotkey = part.split('=')[1]
                continue
                
            # 检查英雄
            if part.startswith('英雄='):
                hero = part.split('=')[1]
                continue
                
            # 检查是否为高级动作
            if part.startswith('高级动作='):
                is_advanced = True
                main_content = part
                continue
                
            # 检查是否为基本动作
            if part.startswith('动作='):
                main_content = part
                
        return ScriptInfo(
            name=name,
            raw_content=content,
            is_global=is_global,
            is_advanced=is_advanced,
            priority=priority,
            block_default_key=block_default_key,
            hotkey=hotkey,
            hero=hero
        )
    
    def _parse_hero_hotkeys(self) -> None:
        """解析英雄热键配置"""
        for section in self.config.sections():
            if section.startswith('hotkey.'):
                hero_name = section[7:]  # 去掉 'hotkey.' 前缀
                hotkeys = dict(self.config[section])
                self._hero_hotkeys[hero_name] = hotkeys
                logger.debug(f"解析英雄 {hero_name} 的热键: {len(hotkeys)} 个")
    
    def _parse_ability_defs(self) -> None:
        """解析技能详细定义"""
        if 'AbilityDefine' not in self.config:
            return
            
        for key, value in self.config['AbilityDefine'].items():
            # 解析技能定义格式
            self._ability_defs[key] = {'raw': value}
            
    def get_all_actions(self) -> Dict[str, ScriptInfo]:
        """获取所有动作脚本"""
        return self._actions.copy()
    
    def get_action(self, name: str) -> Optional[ScriptInfo]:
        """获取指定动作脚本"""
        return self._actions.get(name)
    
    def get_global_scripts(self) -> List[ScriptInfo]:
        """获取所有全局脚本"""
        return [s for s in self._actions.values() if s.is_global]
    
    def get_hero_hotkeys(self, hero_name: str) -> Dict[str, str]:
        """获取指定英雄的热键配置"""
        return self._hero_hotkeys.get(hero_name, {}).copy()
    
    def get_all_heroes(self) -> List[str]:
        """获取所有英雄名称列表"""
        return list(self._hero_hotkeys.keys())
    
    def get_order_id(self, skill_name: str) -> Optional[int]:
        """获取技能的OrderID"""
        return self._order_ids.get(skill_name)
    
    def get_skill_id(self, skill_name: str) -> Optional[int]:
        """获取技能ID"""
        return self._skill_ids.get(skill_name)
    
    def get_item_id(self, item_name: str) -> Optional[int]:
        """获取物品ID"""
        return self._item_ids.get(item_name)
    
    def get_actions_by_hero(self, hero_name: str) -> List[ScriptInfo]:
        """获取指定英雄相关的动作脚本"""
        return [s for s in self._actions.values() if s.hero == hero_name]
    
    def get_actions_by_priority(self, priority: str) -> List[ScriptInfo]:
        """获取指定优先级的动作脚本"""
        return [s for s in self._actions.values() if s.priority == priority]
    
    def is_loaded(self) -> bool:
        """检查是否已加载配置"""
        return self._loaded
    
    def get_raw_content(self) -> str:
        """获取原始配置内容"""
        return self._raw_content
    
    def get_stats(self) -> Dict[str, int]:
        """获取解析统计信息"""
        return {
            'actions': len(self._actions),
            'global_scripts': len(self.get_global_scripts()),
            'heroes': len(self._hero_hotkeys),
            'order_ids': len(self._order_ids),
            'skill_ids': len(self._skill_ids),
            'item_ids': len(self._item_ids),
            'ability_defs': len(self._ability_defs)
        }
