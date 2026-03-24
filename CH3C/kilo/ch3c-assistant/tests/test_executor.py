"""
脚本执行器测试
"""

import pytest
import time
from pathlib import Path
import sys

# 添加src目录到路径
src_path = Path(__file__).parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from core.script_parser import ScriptParser, ScriptAST, Action, Condition, ActionType, TargetType
from core.script_executor import ScriptExecutor, ExecutionState
from game.memory_reader_mock import MockMemoryReader


class TestScriptExecutor:
    """脚本执行器测试类"""
    
    def test_init(self):
        """测试初始化"""
        memory_reader = MockMemoryReader()
        executor = ScriptExecutor(memory_reader)
        assert executor is not None
        assert not executor.is_running()
        
    def test_load_scripts(self):
        """测试加载脚本"""
        memory_reader = MockMemoryReader()
        executor = ScriptExecutor(memory_reader)
        
        parser = ScriptParser()
        ast = parser.parse("test", "动作=使用技能,目标=敌人英雄")
        
        scripts = {"test": ast}
        executor.load_scripts(scripts)
        
        assert len(executor._scripts) == 1
        assert "test" in executor._scripts
        
    def test_unload_script(self):
        """测试卸载脚本"""
        memory_reader = MockMemoryReader()
        executor = ScriptExecutor(memory_reader)
        
        parser = ScriptParser()
        ast = parser.parse("test", "动作=使用技能")
        
        executor.load_scripts({"test": ast})
        executor.unload_script("test")
        
        assert len(executor._scripts) == 0
        
    def test_clear_scripts(self):
        """测试清除脚本"""
        memory_reader = MockMemoryReader()
        executor = ScriptExecutor(memory_reader)
        
        parser = ScriptParser()
        ast1 = parser.parse("test1", "动作=使用技能")
        ast2 = parser.parse("test2", "动作=使用物品")
        
        executor.load_scripts({"test1": ast1, "test2": ast2})
        executor.clear_scripts()
        
        assert len(executor._scripts) == 0
        
    def test_start_stop(self):
        """测试启动和停止"""
        memory_reader = MockMemoryReader()
        executor = ScriptExecutor(memory_reader)
        
        # 启动
        executor.start()
        assert executor.is_running()
        
        # 停止
        executor.stop()
        assert not executor.is_running()
        
    def test_pause_resume(self):
        """测试暂停和恢复"""
        memory_reader = MockMemoryReader()
        executor = ScriptExecutor(memory_reader)
        
        executor.start()
        assert executor.is_running()
        
        executor.pause()
        # 暂停后仍然running，但内部paused
        assert executor._paused
        
        executor.resume()
        assert not executor._paused
        
        executor.stop()
        
    def test_execute_script(self):
        """测试执行脚本"""
        memory_reader = MockMemoryReader()
        memory_reader.attach("war3.exe")
        
        executor = ScriptExecutor(memory_reader)
        
        parser = ScriptParser()
        ast = parser.parse("test", "动作=使用技能,目标=敌人英雄")
        
        executor.load_scripts({"test": ast})
        
        # 手动执行脚本
        result = executor.execute_script("test")
        assert result is True
        
    def test_callback(self):
        """测试回调"""
        memory_reader = MockMemoryReader()
        executor = ScriptExecutor(memory_reader)
        
        callback_called = []
        
        def on_action(action):
            callback_called.append("action")
            
        executor.add_callback('on_action', on_action)
        
        parser = ScriptParser()
        ast = parser.parse("test", "动作=使用技能")
        
        executor.load_scripts({"test": ast})
        executor.execute_script("test")
        
        # 回调应该被调用
        assert len(callback_called) > 0
        
    def test_get_script_state(self):
        """测试获取脚本状态"""
        memory_reader = MockMemoryReader()
        executor = ScriptExecutor(memory_reader)
        
        parser = ScriptParser()
        ast = parser.parse("test", "动作=使用技能")
        
        executor.load_scripts({"test": ast})
        
        state = executor.get_script_state("test")
        assert state == ExecutionState.IDLE
        
    def test_get_all_states(self):
        """测试获取所有状态"""
        memory_reader = MockMemoryReader()
        executor = ScriptExecutor(memory_reader)
        
        parser = ScriptParser()
        ast1 = parser.parse("test1", "动作=使用技能")
        ast2 = parser.parse("test2", "动作=使用物品")
        
        executor.load_scripts({"test1": ast1, "test2": ast2})
        
        states = executor.get_all_states()
        assert len(states) == 2
        assert "test1" in states
        assert "test2" in states


class TestMockMemoryReader:
    """Mock内存读取器测试类"""
    
    def test_attach_detach(self):
        """测试附加和分离"""
        reader = MockMemoryReader()
        
        result = reader.attach("war3.exe")
        assert result is True
        assert reader.is_attached()
        
        result = reader.detach()
        assert result is True
        assert not reader.is_attached()
        
    def test_get_heroes(self):
        """测试获取英雄"""
        reader = MockMemoryReader()
        reader.attach("war3.exe")
        
        # 获取敌人英雄
        enemies = reader.get_enemy_heroes()
        assert len(enemies) > 0
        
        # 获取盟友英雄
        allies = reader.get_ally_heroes()
        assert len(allies) > 0
        
    def test_get_my_hero(self):
        """测试获取自己的英雄"""
        reader = MockMemoryReader()
        reader.attach("war3.exe")
        
        my_hero = reader.get_my_hero()
        assert my_hero is not None
        assert not my_hero.unit_info.is_enemy
        
    def test_get_game_info(self):
        """测试获取游戏信息"""
        reader = MockMemoryReader()
        reader.attach("war3.exe")
        
        info = reader.get_game_info()
        assert info.is_in_game
        assert info.map_name != ""
        
    def test_maphack(self):
        """测试全图功能"""
        reader = MockMemoryReader()
        reader.attach("war3.exe")
        
        # 启用全图
        result = reader.enable_maphack(True)
        assert result is True
        assert reader.is_maphack_enabled()
        
        # 禁用全图
        result = reader.enable_maphack(False)
        assert result is True
        assert not reader.is_maphack_enabled()
        
    def test_unit_status(self):
        """测试单位状态"""
        reader = MockMemoryReader()
        reader.attach("war3.exe")
        
        # 设置英雄状态
        reader.set_mock_hero_status("剑圣", "被沉默的", True)
        
        # 获取英雄并检查状态
        enemies = reader.get_enemy_heroes()
        for hero in enemies:
            if hero.hero_name == "剑圣":
                assert hero.is_silenced
                break
                
    def test_distance(self):
        """测试距离计算"""
        reader = MockMemoryReader()
        reader.attach("war3.exe")
        
        my_hero = reader.get_my_hero()
        enemies = reader.get_enemy_heroes()
        
        if my_hero and enemies:
            distance = reader.get_distance(my_hero.unit_info, enemies[0].unit_info)
            assert distance >= 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
