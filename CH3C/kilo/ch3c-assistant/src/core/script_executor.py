"""
脚本执行引擎 - 执行解析后的脚本动作

负责:
- 管理全局脚本的持续运行
- 执行条件检测
- 执行动作序列
- 处理控制流跳转
"""

import time
import threading
import logging
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass
from enum import Enum
from queue import Queue, Empty
import random

from .script_parser import (
    ScriptAST, Action, Condition, ActionType, TargetType, UnitStatus, SkillState
)
from ..game.memory_reader_base import (
    MemoryReaderBase, UnitInfo, HeroInfo, GameInfo
)

logger = logging.getLogger(__name__)


class ExecutionState(Enum):
    """执行状态"""
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    WAITING = "waiting"
    COMPLETED = "completed"
    ERROR = "error"


@dataclass
class ExecutionContext:
    """执行上下文"""
    script_name: str
    ast: ScriptAST
    current_step: int = 0
    state: ExecutionState = ExecutionState.IDLE
    start_time: float = 0.0
    last_condition_check: float = 0.0
    matched_units: List[UnitInfo] = None
    
    def __post_init__(self):
        if self.matched_units is None:
            self.matched_units = []


class ScriptExecutor:
    """
    脚本执行引擎
    
    使用方法:
        executor = ScriptExecutor(memory_reader)
        executor.load_scripts(scripts)
        executor.start()
    """
    
    def __init__(self, memory_reader: MemoryReaderBase):
        """
        初始化脚本执行引擎
        
        Args:
            memory_reader: 内存读取器实例
        """
        self.memory_reader = memory_reader
        self._scripts: Dict[str, ScriptAST] = {}
        self._contexts: Dict[str, ExecutionContext] = {}
        self._global_scripts: List[str] = []
        self._running = False
        self._paused = False
        self._thread: Optional[threading.Thread] = None
        self._action_queue: Queue = Queue()
        self._callbacks: Dict[str, List[Callable]] = {
            'on_action': [],
            'on_condition_met': [],
            'on_error': [],
            'on_log': [],
        }
        
    def load_scripts(self, scripts: Dict[str, ScriptAST]) -> None:
        """
        加载脚本
        
        Args:
            scripts: 脚本字典 {name: AST}
        """
        self._scripts.update(scripts)
        
        # 识别全局脚本
        for name, ast in scripts.items():
            if ast.is_global:
                self._global_scripts.append(name)
                logger.info(f"加载全局脚本: {name}")
                
        # 创建执行上下文
        for name, ast in scripts.items():
            self._contexts[name] = ExecutionContext(
                script_name=name,
                ast=ast
            )
            
        logger.info(f"加载了 {len(scripts)} 个脚本，其中 {len(self._global_scripts)} 个全局脚本")
    
    def unload_script(self, name: str) -> None:
        """卸载脚本"""
        if name in self._scripts:
            del self._scripts[name]
        if name in self._contexts:
            del self._contexts[name]
        if name in self._global_scripts:
            self._global_scripts.remove(name)
            
    def clear_scripts(self) -> None:
        """清除所有脚本"""
        self._scripts.clear()
        self._contexts.clear()
        self._global_scripts.clear()
        
    def start(self) -> None:
        """启动执行引擎"""
        if self._running:
            logger.warning("执行引擎已在运行")
            return
            
        self._running = True
        self._paused = False
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._thread.start()
        logger.info("脚本执行引擎已启动")
        
    def stop(self) -> None:
        """停止执行引擎"""
        self._running = False
        self._paused = False
        if self._thread:
            self._thread.join(timeout=2.0)
            self._thread = None
        logger.info("脚本执行引擎已停止")
        
    def pause(self) -> None:
        """暂停执行"""
        self._paused = True
        logger.info("脚本执行已暂停")
        
    def resume(self) -> None:
        """恢复执行"""
        self._paused = False
        logger.info("脚本执行已恢复")
        
    def is_running(self) -> bool:
        """检查是否正在运行"""
        return self._running and not self._paused
    
    def _run_loop(self) -> None:
        """主执行循环"""
        logger.info("执行循环开始")
        
        while self._running:
            if self._paused:
                time.sleep(0.1)
                continue
                
            try:
                # 执行全局脚本
                self._execute_global_scripts()
                
                # 处理动作队列
                self._process_action_queue()
                
                # 短暂休眠
                time.sleep(0.05)  # 50ms
                
            except Exception as e:
                logger.error(f"执行循环错误: {e}")
                self._trigger_callback('on_error', str(e))
                
        logger.info("执行循环结束")
        
    def _execute_global_scripts(self) -> None:
        """执行全局脚本"""
        for name in self._global_scripts:
            if name not in self._contexts:
                continue
                
            ctx = self._contexts[name]
            ast = ctx.ast
            
            # 检查执行间隔
            current_time = time.time()
            if current_time - ctx.last_condition_check < 0.1:  # 100ms间隔
                continue
                
            ctx.last_condition_check = current_time
            
            # 执行条件检测
            if ast.conditions:
                for condition in ast.conditions:
                    if self._check_condition(condition, ctx):
                        # 条件满足，触发动作
                        self._trigger_callback('on_condition_met', name, condition, ctx.matched_units)
                        logger.debug(f"全局脚本 '{name}' 条件满足")
                        
    def _check_condition(self, condition: Condition, ctx: ExecutionContext) -> bool:
        """
        检查条件是否满足
        
        Args:
            condition: 条件对象
            ctx: 执行上下文
            
        Returns:
            条件是否满足
        """
        ctx.matched_units.clear()
        
        # 获取游戏信息
        game_info = self.memory_reader.get_game_info()
        if not game_info.is_in_game:
            return False
            
        # 获取目标单位
        target_units = self._get_target_units(condition.target, condition.range)
        
        if not target_units:
            return False
            
        # 检查每个单位是否满足条件
        for unit in target_units:
            if self._check_unit_condition(unit, condition):
                ctx.matched_units.append(unit)
                
        # 根据条件类型返回结果
        if condition.condition_type == "等待出现":
            return len(ctx.matched_units) > 0
        elif condition.condition_type == "如果出现":
            return len(ctx.matched_units) > 0
            
        return len(ctx.matched_units) > 0
        
    def _get_target_units(self, target_type: TargetType, range: float) -> List[UnitInfo]:
        """获取目标单位"""
        my_hero = self.memory_reader.get_my_hero()
        if not my_hero:
            return []
            
        my_x = my_hero.unit_info.x
        my_y = my_hero.unit_info.y
        
        if target_type == TargetType.ENEMY_HERO:
            heroes = self.memory_reader.get_enemy_heroes()
            return [h.unit_info for h in heroes if self.memory_reader.is_in_range(
                my_hero.unit_info, h.unit_info, range
            )]
        elif target_type == TargetType.ALLY_HERO:
            heroes = self.memory_reader.get_ally_heroes()
            return [h.unit_info for h in heroes if self.memory_reader.is_in_range(
                my_hero.unit_info, h.unit_info, range
            )]
        elif target_type == TargetType.SELF_HERO:
            return [my_hero.unit_info]
        elif target_type == TargetType.ENEMY_BUILDING:
            units = self.memory_reader.get_units_in_range(
                my_x, my_y, range, include_allies=False, include_enemies=True
            )
            return [u for u in units if u.unit_type.name == 'BUILDING']
        elif target_type == TargetType.ALLY_BUILDING:
            units = self.memory_reader.get_units_in_range(
                my_x, my_y, range, include_allies=True, include_enemies=False
            )
            return [u for u in units if u.unit_type.name == 'BUILDING']
            
        return []
        
    def _check_unit_condition(self, unit: UnitInfo, condition: Condition) -> bool:
        """检查单位是否满足条件"""
        # 检查状态
        if condition.status:
            if not self.memory_reader.is_unit_in_status(unit, condition.status.name):
                return False
                
        # 检查血量
        if condition.health_percent is not None:
            health_pct = self.memory_reader.get_unit_health_percent(unit)
            if health_pct >= condition.health_percent:
                return False
                
        # 检查魔法
        if condition.mana_percent is not None:
            mana_pct = self.memory_reader.get_unit_mana_percent(unit)
            if mana_pct >= condition.mana_percent:
                return False
                
        return True
        
    def _process_action_queue(self) -> None:
        """处理动作队列"""
        try:
            while True:
                action = self._action_queue.get_nowait()
                self._execute_action(action)
        except Empty:
            pass
            
    def _execute_action(self, action: Action) -> bool:
        """
        执行动作
        
        Args:
            action: 动作对象
            
        Returns:
            是否执行成功
        """
        logger.info(f"执行动作: {action.action_type.name}")
        
        # 触发回调
        self._trigger_callback('on_action', action)
        
        # 根据动作类型执行
        if action.action_type == ActionType.WAIT:
            time.sleep(action.delay)
            return True
            
        elif action.action_type == ActionType.GOTO:
            # 跳转由调用者处理
            return True
            
        elif action.action_type == ActionType.USE_SKILL:
            return self._execute_use_skill(action)
            
        elif action.action_type == ActionType.USE_ITEM:
            return self._execute_use_item(action)
            
        elif action.action_type == ActionType.MOVE:
            return self._execute_move(action)
            
        elif action.action_type == ActionType.ATTACK:
            return self._execute_attack(action)
            
        elif action.action_type == ActionType.SEND_KEY:
            return self._execute_send_key(action)
            
        return False
        
    def _execute_use_skill(self, action: Action) -> bool:
        """执行使用技能动作"""
        # 这里需要实际的技能释放逻辑
        # 在Windows实现中会调用keyboard模块模拟按键
        logger.info(f"[Mock] 使用技能: {action.skill_name}")
        return True
        
    def _execute_use_item(self, action: Action) -> bool:
        """执行使用物品动作"""
        logger.info(f"[Mock] 使用物品: {action.item_name}")
        return True
        
    def _execute_move(self, action: Action) -> bool:
        """执行移动动作"""
        logger.info(f"[Mock] 移动到目标")
        return True
        
    def _execute_attack(self, action: Action) -> bool:
        """执行攻击动作"""
        logger.info(f"[Mock] 攻击目标")
        return True
        
    def _execute_send_key(self, action: Action) -> bool:
        """执行发送按键动作"""
        logger.info(f"[Mock] 发送按键: {action.key}")
        return True
        
    def execute_script(self, name: str) -> bool:
        """
        手动执行指定脚本
        
        Args:
            name: 脚本名称
            
        Returns:
            是否执行成功
        """
        if name not in self._scripts:
            logger.error(f"脚本不存在: {name}")
            return False
            
        ast = self._scripts[name]
        ctx = self._contexts.get(name)
        
        if ctx:
            ctx.state = ExecutionState.RUNNING
            ctx.start_time = time.time()
            
        try:
            # 执行脚本动作序列
            self._execute_script_steps(ast, ctx)
            
            if ctx:
                ctx.state = ExecutionState.COMPLETED
            return True
            
        except Exception as e:
            logger.error(f"执行脚本 '{name}' 失败: {e}")
            if ctx:
                ctx.state = ExecutionState.ERROR
            return False
            
    def _execute_script_steps(self, ast: ScriptAST, ctx: Optional[ExecutionContext]) -> None:
        """执行脚本步骤"""
        step_index = 0
        
        while step_index < len(ast.steps):
            if ctx:
                ctx.current_step = step_index
                
            step = ast.steps[step_index]
            
            if isinstance(step, Action):
                # 执行动作
                self._execute_action(step)
                
                # 处理跳转
                if step.action_type == ActionType.GOTO:
                    if step.goto_step is not None:
                        step_index = step.goto_step - 1  # 转为0-based索引
                    elif step.goto_label and step.goto_label in ast.labels:
                        step_index = ast.labels[step.goto_label]
                    continue
                    
            elif isinstance(step, Condition):
                # 检查条件
                if ctx and not self._check_condition(step, ctx):
                    logger.debug(f"条件不满足，跳过动作")
                    
            step_index += 1
            
    def add_callback(self, event: str, callback: Callable) -> None:
        """添加事件回调"""
        if event in self._callbacks:
            self._callbacks[event].append(callback)
            
    def remove_callback(self, event: str, callback: Callable) -> None:
        """移除事件回调"""
        if event in self._callbacks and callback in self._callbacks[event]:
            self._callbacks[event].remove(callback)
            
    def _trigger_callback(self, event: str, *args) -> None:
        """触发事件回调"""
        for callback in self._callbacks.get(event, []):
            try:
                callback(*args)
            except Exception as e:
                logger.error(f"回调执行错误: {e}")
                
    def get_script_state(self, name: str) -> Optional[ExecutionState]:
        """获取脚本执行状态"""
        if name in self._contexts:
            return self._contexts[name].state
        return None
        
    def get_all_states(self) -> Dict[str, ExecutionState]:
        """获取所有脚本状态"""
        return {name: ctx.state for name, ctx in self._contexts.items()}
