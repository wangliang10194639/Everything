"""
配置解析器测试
"""

import pytest
from pathlib import Path
import sys

# 添加src目录到路径
src_path = Path(__file__).parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from core.config_parser import ConfigParser, ScriptInfo


class TestConfigParser:
    """配置解析器测试类"""
    
    def test_init(self):
        """测试初始化"""
        parser = ConfigParser()
        assert parser is not None
        assert not parser.is_loaded()
        
    def test_load_nonexistent_file(self):
        """测试加载不存在的文件"""
        parser = ConfigParser()
        result = parser.load("nonexistent_file.txt")
        assert result is False
        assert not parser.is_loaded()
        
    def test_load_sample_config(self, tmp_path):
        """测试加载示例配置"""
        # 创建测试配置文件
        config_content = """
[normal]
版本=测试版本

[orderdefine]
风暴之锤=1001
雷霆一击=1002

[action]
测试动作1=动作=使用技能,目标=敌人英雄,范围=600
测试动作2=全局脚本;高级动作=等待出现,目标=敌人英雄,范围=950

[hotkey.剑圣]
Q=风暴
W=剑刃风暴

[技能]
风暴之锤=1001

[物品]
传送门=2001
"""
        config_file = tmp_path / "test_config.txt"
        config_file.write_text(config_content, encoding='utf-8')
        
        # 加载配置
        parser = ConfigParser()
        result = parser.load(str(config_file))
        
        assert result is True
        assert parser.is_loaded()
        
        # 检查动作解析
        actions = parser.get_all_actions()
        assert len(actions) >= 2
        assert "测试动作1" in actions
        assert "测试动作2" in actions
        
        # 检查全局脚本
        global_scripts = parser.get_global_scripts()
        assert len(global_scripts) >= 1
        assert any(s.name == "测试动作2" for s in global_scripts)
        
        # 检查英雄热键
        hotkeys = parser.get_hero_hotkeys("剑圣")
        assert "Q" in hotkeys
        assert hotkeys["Q"] == "风暴"
        
        # 检查OrderID
        order_id = parser.get_order_id("风暴之锤")
        assert order_id == 1001
        
        # 检查统计信息
        stats = parser.get_stats()
        assert stats['actions'] >= 2
        assert stats['heroes'] >= 1
        
    def test_parse_action_script(self):
        """测试动作脚本解析"""
        parser = ConfigParser()
        
        # 测试基本动作
        script_info = parser._parse_action_script(
            "test_basic", 
            "动作=使用技能,目标=敌人英雄,范围=600"
        )
        assert script_info.name == "test_basic"
        assert not script_info.is_global
        assert not script_info.is_advanced
        
        # 测试全局脚本
        script_info = parser._parse_action_script(
            "test_global",
            "全局脚本;高级动作=等待出现,目标=敌人英雄"
        )
        assert script_info.is_global
        assert script_info.is_advanced
        
        # 测试屏蔽默认键
        script_info = parser._parse_action_script(
            "test_block",
            "屏蔽默认键;动作=使用技能"
        )
        assert script_info.block_default_key
        
        # 测试优先级
        script_info = parser._parse_action_script(
            "test_priority",
            "优先级=高;动作=使用技能"
        )
        assert script_info.priority == "高"


class TestScriptInfo:
    """脚本信息测试类"""
    
    def test_script_info_creation(self):
        """测试脚本信息创建"""
        info = ScriptInfo(
            name="test_script",
            raw_content="动作=使用技能",
            is_global=False,
            is_advanced=False
        )
        assert info.name == "test_script"
        assert info.raw_content == "动作=使用技能"
        assert not info.is_global
        assert not info.is_advanced


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
