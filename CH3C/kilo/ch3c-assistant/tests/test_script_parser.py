"""
脚本解析器测试
"""

import pytest
from pathlib import Path
import sys

# 添加src目录到路径
src_path = Path(__file__).parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from core.script_parser import (
    ScriptParser, ScriptAST, Action, Condition,
    ActionType, TargetType, UnitStatus, SkillState
)


class TestScriptParser:
    """脚本解析器测试类"""
    
    def test_init(self):
        """测试初始化"""
        parser = ScriptParser()
        assert parser is not None
        
    def test_parse_basic_action(self):
        """测试基本动作解析"""
        parser = ScriptParser()
        ast = parser.parse("test", "动作=使用技能,目标=敌人英雄,范围=600")
        
        assert ast.name == "test"
        assert not ast.is_global
        assert not ast.is_advanced
        assert len(ast.actions) >= 1
        
        action = ast.actions[0]
        assert action.action_type == ActionType.USE_SKILL
        assert action.target == TargetType.ENEMY_HERO
        assert action.range == 600
        
    def test_parse_advanced_action(self):
        """测试高级动作解析"""
        parser = ScriptParser()
        ast = parser.parse("test", "高级动作=等待出现,目标=敌人英雄,范围=950,技能状态=大招")
        
        assert ast.is_advanced
        assert len(ast.conditions) >= 1
        
        condition = ast.conditions[0]
        assert condition.condition_type == "等待出现"
        assert condition.target == TargetType.ENEMY_HERO
        assert condition.range == 950
        assert condition.skill_state == SkillState.ULTIMATE
        
    def test_parse_global_script(self):
        """测试全局脚本解析"""
        parser = ScriptParser()
        ast = parser.parse("test", "全局脚本;高级动作=如果出现,目标=自己英雄,状态=被沉默的")
        
        assert ast.is_global
        assert ast.is_advanced
        
    def test_parse_target_types(self):
        """测试目标类型解析"""
        parser = ScriptParser()
        
        # 敌人英雄
        ast = parser.parse("test", "动作=使用技能,目标=敌人英雄")
        assert ast.actions[0].target == TargetType.ENEMY_HERO
        
        # 自己英雄
        ast = parser.parse("test", "动作=使用技能,目标=自己英雄")
        assert ast.actions[0].target == TargetType.SELF_HERO
        
        # 盟友建筑
        ast = parser.parse("test", "动作=使用物品,目标=盟友建筑")
        assert ast.actions[0].target == TargetType.ALLY_BUILDING
        
    def test_parse_unit_status(self):
        """测试单位状态解析"""
        parser = ScriptParser()
        
        # 被沉默的
        ast = parser.parse("test", "高级动作=如果出现,目标=自己英雄,状态=被沉默的")
        assert ast.conditions[0].status == UnitStatus.SILENCED
        
        # 被击晕的
        ast = parser.parse("test", "高级动作=如果出现,目标=敌人英雄,状态=被击晕的")
        assert ast.conditions[0].status == UnitStatus.STUNNED
        
    def test_parse_action_types(self):
        """测试动作类型解析"""
        parser = ScriptParser()
        
        # 使用技能
        ast = parser.parse("test", "动作=使用技能,目标=敌人英雄")
        assert ast.actions[0].action_type == ActionType.USE_SKILL
        
        # 使用物品
        ast = parser.parse("test", "动作=使用物品,目标=盟友建筑")
        assert ast.actions[0].action_type == ActionType.USE_ITEM
        
        # 移动
        ast = parser.parse("test", "动作=移动,目标=地面")
        assert ast.actions[0].action_type == ActionType.MOVE
        
    def test_parse_goto(self):
        """测试跳转解析"""
        parser = ScriptParser()
        
        # 跳转到步骤
        ast = parser.parse("test", "动作=使用技能;转第1步")
        assert len(ast.actions) >= 1
        
        # 跳转到标签
        ast = parser.parse("test", "动作=使用技能;转$start")
        assert len(ast.actions) >= 1
        
    def test_parse_wait(self):
        """测试等待解析"""
        parser = ScriptParser()
        ast = parser.parse("test", "动作=使用技能;等待1秒")
        
        # 应该有多个步骤
        assert len(ast.steps) >= 1
        
    def test_parse_multi_step_script(self):
        """测试多步脚本解析"""
        parser = ScriptParser()
        scripts = parser.parse_full_script("动作=使用技能A;等待1秒;动作=使用技能B")
        
        assert len(scripts) >= 1


class TestScriptAST:
    """脚本AST测试类"""
    
    def test_ast_creation(self):
        """测试AST创建"""
        ast = ScriptAST(name="test")
        assert ast.name == "test"
        assert not ast.is_global
        assert not ast.is_advanced
        assert len(ast.actions) == 0
        assert len(ast.conditions) == 0
        
    def test_ast_with_actions(self):
        """测试带动作的AST"""
        action = Action(
            action_type=ActionType.USE_SKILL,
            target=TargetType.ENEMY_HERO,
            range=600
        )
        
        ast = ScriptAST(name="test")
        ast.actions.append(action)
        
        assert len(ast.actions) == 1
        assert ast.actions[0].action_type == ActionType.USE_SKILL


class TestAction:
    """动作测试类"""
    
    def test_action_creation(self):
        """测试动作创建"""
        action = Action(
            action_type=ActionType.USE_SKILL,
            target=TargetType.ENEMY_HERO,
            range=600,
            skill_name="风暴之锤"
        )
        
        assert action.action_type == ActionType.USE_SKILL
        assert action.target == TargetType.ENEMY_HERO
        assert action.range == 600
        assert action.skill_name == "风暴之锤"


class TestCondition:
    """条件测试类"""
    
    def test_condition_creation(self):
        """测试条件创建"""
        condition = Condition(
            condition_type="等待出现",
            target=TargetType.ENEMY_HERO,
            range=950,
            skill_state=SkillState.ULTIMATE
        )
        
        assert condition.condition_type == "等待出现"
        assert condition.target == TargetType.ENEMY_HERO
        assert condition.range == 950
        assert condition.skill_state == SkillState.ULTIMATE


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
