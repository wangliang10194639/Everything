"""
脚本解析器 - 将动作脚本解析为可执行的AST

支持的脚本语法:
- 基本动作: 动作=使用技能,目标=敌人英雄
- 高级动作: 高级动作=等待出现,目标=敌人英雄,范围=950,技能状态=大招
- 条件判断: 如果出现,等待出现
- 目标类型: 敌人英雄,自己英雄,盟友建筑,敌人建筑等
- 状态检测: 被沉默的,被击晕的,被变羊的等
- 控制流: 转第N步,转$label,等待X秒
"""

import re
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field
import logging

logger = logging.getLogger(__name__)


class ActionType(Enum):
    """动作类型"""
    USE_SKILL = "使用技能"
    USE_ITEM = "使用物品"
    MOVE = "移动"
    ATTACK = "攻击"
    STOP = "停止"
    HOLD = "保持"
    PATROL = "巡逻"
    SELECT = "选择"
    RIGHT_CLICK = "右键"
    WAIT = "等待"
    GOTO = "转"
    SEND_KEY = "发送按键"
    COMBO = "连招"
    UNKNOWN = "未知"


class TargetType(Enum):
    """目标类型"""
    ENEMY_HERO = "敌人英雄"
    ALLY_HERO = "盟友英雄"
    SELF_HERO = "自己英雄"
    ENEMY_BUILDING = "敌人建筑"
    ALLY_BUILDING = "盟友建筑"
    ENEMY_UNIT = "敌人单位"
    ALLY_UNIT = "盟友单位"
    NEUTRAL = "中立单位"
    GROUND = "地面"
    SELF = "自己"
    UNKNOWN = "未知"


class UnitStatus(Enum):
    """单位状态"""
    SILENCED = "被沉默的"
    STUNNED = "被击晕的"
    POLYMORPHED = "被变羊的"
    SLEEPING = "被睡眠的"
    INVISIBLE = "隐身的"
    INVULNERABLE = "无敌的"
    ROOTED = "被定身的"
    SLOWED = "被减速的"
    POISONED = "被中毒的"
    BURNING = "被燃烧的"
    FROZEN = "被冰冻的"
    CHARMED = "被魅惑的"
    HEXED = "被妖术的"
    DOOMED = "被末日的"
    POSSESSED = "被附身的"
    UNKNOWN = "未知"


class SkillState(Enum):
    """技能状态"""
    ULTIMATE = "大招"
    NORMAL = "普通技能"
    ITEM_TELEPORT = "使用物品传"
    ALL = "全部技能"
    READY = "就绪"
    COOLDOWN = "冷却中"
    UNKNOWN = "未知"


@dataclass
class Condition:
    """条件"""
    condition_type: str  # 如果出现, 等待出现
    target: TargetType = TargetType.UNKNOWN
    range: int = 100000
    status: Optional[UnitStatus] = None
    skill_state: Optional[SkillState] = None
    health_percent: Optional[int] = None
    mana_percent: Optional[int] = None
    has_item: Optional[str] = None
    has_buff: Optional[str] = None
    custom_condition: Optional[str] = None


@dataclass
class Action:
    """动作"""
    action_type: ActionType
    target: TargetType = TargetType.UNKNOWN
    range: int = 100000
    skill_name: Optional[str] = None
    item_name: Optional[str] = None
    position: Optional[tuple] = None
    key: Optional[str] = None
    delay: float = 0.0
    goto_step: Optional[int] = None
    goto_label: Optional[str] = None
    custom_action: Optional[str] = None


@dataclass
class ScriptAST:
    """脚本抽象语法树"""
    name: str
    is_global: bool = False
    is_advanced: bool = False
    priority: str = "普通"
    block_default_key: bool = False
    conditions: List[Condition] = field(default_factory=list)
    actions: List[Action] = field(default_factory=list)
    steps: List[Union[Condition, Action]] = field(default_factory=list)
    labels: Dict[str, int] = field(default_factory=dict)  # label -> step index


class ScriptParser:
    """
    脚本解析器 - 将动作脚本解析为可执行的AST
    
    使用方法:
        parser = ScriptParser()
        ast = parser.parse("动作=使用技能,目标=敌人英雄,范围=600")
    """
    
    # 目标类型映射
    TARGET_MAP = {
        "敌人英雄": TargetType.ENEMY_HERO,
        "盟友英雄": TargetType.ALLY_HERO,
        "自己英雄": TargetType.SELF_HERO,
        "敌人建筑": TargetType.ENEMY_BUILDING,
        "盟友建筑": TargetType.ALLY_BUILDING,
        "敌人单位": TargetType.ENEMY_UNIT,
        "盟友单位": TargetType.ALLY_UNIT,
        "中立单位": TargetType.NEUTRAL,
        "地面": TargetType.GROUND,
        "自己": TargetType.SELF,
    }
    
    # 单位状态映射
    STATUS_MAP = {
        "被沉默的": UnitStatus.SILENCED,
        "被击晕的": UnitStatus.STUNNED,
        "被变羊的": UnitStatus.POLYMORPHED,
        "被睡眠的": UnitStatus.SLEEPING,
        "隐身的": UnitStatus.INVISIBLE,
        "无敌的": UnitStatus.INVULNERABLE,
        "被定身的": UnitStatus.ROOTED,
        "被减速的": UnitStatus.SLOWED,
        "被中毒的": UnitStatus.POISONED,
        "被燃烧的": UnitStatus.BURNING,
        "被冰冻的": UnitStatus.FROZEN,
        "被魅惑的": UnitStatus.CHARMED,
        "被妖术的": UnitStatus.HEXED,
        "被末日的": UnitStatus.DOOMED,
        "被附身的": UnitStatus.POSSESSED,
    }
    
    # 技能状态映射
    SKILL_STATE_MAP = {
        "大招": SkillState.ULTIMATE,
        "普通技能": SkillState.NORMAL,
        "使用物品传": SkillState.ITEM_TELEPORT,
        "全部技能": SkillState.ALL,
        "就绪": SkillState.READY,
        "冷却中": SkillState.COOLDOWN,
    }
    
    def __init__(self):
        """初始化脚本解析器"""
        pass
    
    def parse(self, script_name: str, script_content: str) -> ScriptAST:
        """
        解析脚本内容
        
        Args:
            script_name: 脚本名称
            script_content: 脚本内容
            
        Returns:
            脚本AST
        """
        ast = ScriptAST(name=script_name)
        
        # 分割脚本各部分
        parts = script_content.split(';')
        
        for part in parts:
            part = part.strip()
            
            # 解析全局脚本标记
            if part == '全局脚本':
                ast.is_global = True
                continue
                
            # 解析屏蔽默认键标记
            if part == '屏蔽默认键':
                ast.block_default_key = True
                continue
                
            # 解析优先级
            if part.startswith('优先级='):
                ast.priority = part.split('=')[1]
                continue
                
            # 解析高级动作
            if part.startswith('高级动作='):
                ast.is_advanced = True
                self._parse_advanced_action(ast, part)
                continue
                
            # 解析基本动作
            if part.startswith('动作='):
                self._parse_basic_action(ast, part)
                continue
        
        return ast
    
    def _parse_advanced_action(self, ast: ScriptAST, content: str) -> None:
        """
        解析高级动作
        
        格式: 高级动作=等待出现/如果出现,目标=xxx,范围=xxx,状态=xxx,技能状态=xxx,条件=xxx
        """
        # 提取动作内容
        action_content = content[len('高级动作='):]
        
        # 解析参数
        params = self._parse_params(action_content)
        
        # 获取条件类型
        condition_type = params.get('type', '等待出现')
        
        # 创建条件
        condition = Condition(
            condition_type=condition_type,
            target=self._parse_target(params.get('目标', '')),
            range=int(params.get('范围', 100000)),
        )
        
        # 解析状态
        if '状态' in params:
            condition.status = self._parse_status(params['状态'])
            
        # 解析技能状态
        if '技能状态' in params:
            condition.skill_state = self._parse_skill_state(params['技能状态'])
            
        # 解析血量条件
        if '条件' in params:
            cond_str = params['条件']
            if '血少于' in cond_str:
                match = re.search(r'血少于(\d+)%?', cond_str)
                if match:
                    condition.health_percent = int(match.group(1))
            if '魔少于' in cond_str:
                match = re.search(r'魔少于(\d+)%?', cond_str)
                if match:
                    condition.mana_percent = int(match.group(1))
            if '拥有物品' in cond_str:
                match = re.search(r'拥有物品(\S+)', cond_str)
                if match:
                    condition.has_item = match.group(1)
                    
        ast.conditions.append(condition)
        ast.steps.append(condition)
    
    def _parse_basic_action(self, ast: ScriptAST, content: str) -> None:
        """
        解析基本动作
        
        格式: 动作=使用技能/使用物品/移动/...,目标=xxx,范围=xxx,...
        """
        # 提取动作内容
        action_content = content[len('动作='):]
        
        # 解析参数
        params = self._parse_params(action_content)
        
        # 获取动作类型
        action_type_str = params.get('type', '')
        action_type = self._parse_action_type(action_type_str)
        
        # 创建动作
        action = Action(
            action_type=action_type,
            target=self._parse_target(params.get('目标', '')),
            range=int(params.get('范围', 100000)),
        )
        
        # 解析技能名称
        if '技能' in params:
            action.skill_name = params['技能']
            
        # 解析物品名称
        if '物品' in params:
            action.item_name = params['物品']
            
        # 解析按键
        if '按键' in params:
            action.key = params['按键']
            
        # 解析跳转
        if '转第' in action_content:
            match = re.search(r'转第(\d+)步', action_content)
            if match:
                action.goto_step = int(match.group(1))
        elif '转$' in action_content:
            match = re.search(r'转\$(\w+)', action_content)
            if match:
                action.goto_label = match.group(1)
                
        # 解析等待时间
        if '等待' in action_content:
            match = re.search(r'等待(\d+)秒', action_content)
            if match:
                action.delay = float(match.group(1))
                
        ast.actions.append(action)
        ast.steps.append(action)
    
    def _parse_params(self, content: str) -> Dict[str, str]:
        """
        解析参数字符串
        
        格式: type,arg1=val1,arg2=val2,...
        """
        params = {}
        
        # 分割参数
        parts = content.split(',')
        
        for i, part in enumerate(parts):
            part = part.strip()
            
            if i == 0:
                # 第一个参数是类型
                params['type'] = part
            elif '=' in part:
                # 键值对参数
                key, value = part.split('=', 1)
                params[key.strip()] = value.strip()
            else:
                # 位置参数
                params[f'arg{i}'] = part
                
        return params
    
    def _parse_target(self, target_str: str) -> TargetType:
        """解析目标类型"""
        return self.TARGET_MAP.get(target_str, TargetType.UNKNOWN)
    
    def _parse_status(self, status_str: str) -> UnitStatus:
        """解析单位状态"""
        return self.STATUS_MAP.get(status_str, UnitStatus.UNKNOWN)
    
    def _parse_skill_state(self, state_str: str) -> SkillState:
        """解析技能状态"""
        return self.SKILL_STATE_MAP.get(state_str, SkillState.UNKNOWN)
    
    def _parse_action_type(self, action_str: str) -> ActionType:
        """解析动作类型"""
        action_map = {
            "使用技能": ActionType.USE_SKILL,
            "使用物品": ActionType.USE_ITEM,
            "移动": ActionType.MOVE,
            "攻击": ActionType.ATTACK,
            "停止": ActionType.STOP,
            "保持": ActionType.HOLD,
            "巡逻": ActionType.PATROL,
            "选择": ActionType.SELECT,
            "右键": ActionType.RIGHT_CLICK,
            "等待": ActionType.WAIT,
            "发送按键": ActionType.SEND_KEY,
            "连招": ActionType.COMBO,
        }
        return action_map.get(action_str, ActionType.UNKNOWN)
    
    def parse_full_script(self, script_content: str) -> List[ScriptAST]:
        """
        解析完整脚本（可能包含多个步骤）
        
        某些脚本可能包含多个动作步骤，如：
        动作=使用技能A;动作=等待1秒;动作=使用技能B
        """
        # 检查是否包含多个动作步骤
        if '转第' in script_content or '转$' in script_content:
            # 包含控制流，需要解析为多个步骤
            return self._parse_multi_step_script(script_content)
        else:
            # 单步脚本
            return [self.parse('script', script_content)]
    
    def _parse_multi_step_script(self, script_content: str) -> List[ScriptAST]:
        """解析多步脚本"""
        # 这里简化处理，实际可能需要更复杂的解析逻辑
        ast = ScriptAST(name='multi_step')
        
        # 分割步骤
        steps = script_content.split(';')
        
        step_index = 0
        for step in steps:
            step = step.strip()
            
            # 解析标签
            if step.startswith('$'):
                label = step[1:]
                ast.labels[label] = step_index
                continue
                
            # 解析动作或条件
            if step.startswith('动作='):
                self._parse_basic_action(ast, step)
                step_index += 1
            elif step.startswith('高级动作='):
                ast.is_advanced = True
                self._parse_advanced_action(ast, step)
                step_index += 1
            elif step.startswith('等待'):
                # 等待动作
                match = re.search(r'等待(\d+)秒', step)
                if match:
                    action = Action(
                        action_type=ActionType.WAIT,
                        delay=float(match.group(1))
                    )
                    ast.actions.append(action)
                    ast.steps.append(action)
                    step_index += 1
            elif step.startswith('转第'):
                # 跳转
                match = re.search(r'转第(\d+)步', step)
                if match:
                    action = Action(
                        action_type=ActionType.GOTO,
                        goto_step=int(match.group(1))
                    )
                    ast.actions.append(action)
                    ast.steps.append(action)
                    step_index += 1
            elif step.startswith('转$'):
                # 标签跳转
                match = re.search(r'转\$(\w+)', step)
                if match:
                    action = Action(
                        action_type=ActionType.GOTO,
                        goto_label=match.group(1)
                    )
                    ast.actions.append(action)
                    ast.steps.append(action)
                    step_index += 1
        
        return [ast]
