import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
脚本引擎模块 - 执行动作脚本
"""

import time
import threading
import re
from typing import List, Dict, Callable, Optional, Any
from dataclasses import dataclass, field
from enum import Enum

from core import (
    ConfigParser, MemoryReader, InputSimulator,
    GameState, Hero, Point, WatchCondition
)


class ScriptStatus(Enum):
    """脚本状态"""
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    FINISHED = "finished"
    ERROR = "error"


@dataclass
class ScriptAction:
    """单个脚本动作"""
    action_type: str
    parameters: Dict[str, str] = field(default_factory=dict)
    delay: float = 0.0
    label: str = ""


@dataclass
class ScriptContext:
    """脚本执行上下文"""
    variables: Dict[str, Any] = field(default_factory=dict)
    current_label: str = ""
    jump_target: Optional[str] = None
    wait_until: float = 0.0
    selected_hero: Optional[Hero] = None
    target_unit: Optional[Hero] = None
    matched_conditions: List[Hero] = field(default_factory=list)


class Script:
    """脚本实例"""

    def __init__(self, name: str, actions: List[ScriptAction]):
        self.name = name
        self.actions = actions
        self.status = ScriptStatus.IDLE
        self.current_step = 0
        self.context = ScriptContext()
        self.loop_count = 0
        self.max_loops = -1  # -1 表示无限循环
        self.priority = 0

        # 回调
        self.on_step: Optional[Callable[[int, ScriptAction], None]] = None
        self.on_finish: Optional[Callable[[], None]] = None
        self.on_error: Optional[Callable[[str], None]] = None

    def reset(self):
        """重置脚本"""
        self.current_step = 0
        self.status = ScriptStatus.IDLE
        self.context = ScriptContext()
        self.loop_count = 0


class ScriptEngine:
    """脚本引擎"""

    def __init__(self, config: ConfigParser, memory_reader: MemoryReader,
                 input_sim: InputSimulator):
        self.config = config
        self.memory_reader = memory_reader
        self.input_sim = input_sim

        # 脚本管理
        self.scripts: Dict[str, Script] = {}
        self.running_scripts: List[Script] = []
        self.engine_lock = threading.Lock()

        # 执行线程
        self.is_running = False
        self.engine_thread: Optional[threading.Thread] = None

        # 加载配置中的动作
        self._load_action_scripts()

    def _load_action_scripts(self):
        """从配置加载动作脚本"""
        actions = self.config.get_actions()

        for name, script_text in actions.items():
            if script_text and not name.startswith(';'):
                try:
                    script = self._parse_script(name, script_text)
                    self.scripts[name] = script
                except Exception as e:
                    print(f"解析脚本失败 '{name}': {e}")

        print(f"已加载 {len(self.scripts)} 个动作脚本")

    def _parse_script(self, name: str, script_text: str) -> Script:
        """解析脚本文本"""
        actions: List[ScriptAction] = []

        # 按分号分割动作
        parts = re.split(r';\s*(?![^()]*\))', script_text)

        for part in parts:
            part = part.strip()
            if not part:
                continue

            action = self._parse_action(part)
            if action:
                actions.append(action)

        return Script(name, actions)

    def _parse_action(self, action_text: str) -> Optional[ScriptAction]:
        """解析单个动作"""
        action_text = action_text.strip()

        # 标签
        if action_text.endswith(':'):
            return ScriptAction("label", label=action_text[:-1])

        # 跳转
        if action_text.startswith('转'):
            target = action_text[1:].strip()
            return ScriptAction("goto", {"target": target})

        # 等待
        if action_text.startswith('等待'):
            time_text = action_text[2:].strip()
            delay = self._parse_time(time_text)
            return ScriptAction("wait", {}, delay=delay)

        # 高级动作
        if action_text.startswith('高级动作='):
            return self._parse_advanced_action(action_text[5:])

        # 普通动作
        if action_text.startswith('动作='):
            return self._parse_simple_action(action_text[3:])

        # 按键
        if action_text.startswith('按键'):
            key = action_text[2:].strip()
            return ScriptAction("key", {"key": key})

        # 按住SHIFT
        if action_text.startswith('按住SHIFT'):
            return ScriptAction("hold_shift", {})

        # 松开SHIFT
        if action_text.startswith('松开SHIFT'):
            return ScriptAction("release_shift", {})

        # 左击/右击
        if action_text == '左击':
            return ScriptAction("mouse_click", {"button": "left"})
        if action_text == '右击':
            return ScriptAction("mouse_click", {"button": "right"})

        # 屏蔽默认键
        if action_text.startswith('屏蔽默认键'):
            return ScriptAction("block_default", {})

        # 优先级
        if action_text.startswith('优先级='):
            priority = action_text[4:].strip()
            return ScriptAction("set_priority", {"priority": priority})

        # 默认尝试当作简单动作
        return self._parse_simple_action(action_text)

    def _parse_time(self, time_text: str) -> float:
        """解析时间文本"""
        time_text = time_text.lower()
        if '秒' in time_text:
            num = float(re.search(r'(\d+\.?\d*)', time_text).group(1))
            return num
        elif '毫秒' in time_text:
            num = float(re.search(r'(\d+\.?\d*)', time_text).group(1))
            return num / 1000
        else:
            # 默认秒
            try:
                return float(time_text)
            except:
                return 1.0

    def _parse_simple_action(self, text: str) -> ScriptAction:
        """解析简单动作"""
        params = {}
        action_type = "simple"

        # 处理动作类型
        if text.startswith('使用物品'):
            action_type = "use_item"
            item_name = text[4:].strip()
            params['item'] = item_name
        elif text.startswith('attack'):
            action_type = "attack"
            text = text[6:].strip()
        elif text.startswith('move'):
            action_type = "move"
            text = text[4:].strip()
        else:
            # 可能是技能名称
            action_type = "use_ability"
            params['ability'] = text

        # 解析参数
        param_parts = re.split(r',\s*(?![^()]*\))', text)
        for part in param_parts:
            if '=' in part:
                key, value = part.split('=', 1)
                params[key.strip()] = value.strip()

        return ScriptAction(action_type, params)

    def _parse_advanced_action(self, text: str) -> ScriptAction:
        """解析高级动作"""
        params = {}

        if text.startswith('等待出现'):
            return self._parse_wait_appear(text[4:])
        elif text.startswith('选择物体'):
            return self._parse_select_object(text[4:])
        elif text.startswith('批量选择'):
            return self._parse_select_object(text[4:], batch=True)
        elif text.startswith('如果出现'):
            return self._parse_if_appear(text[4:])
        elif text.startswith('散开'):
            return ScriptAction("spread", {})
        elif text.startswith('购买物品'):
            return self._parse_buy_item(text[4:])
        else:
            return self._parse_simple_action(text)

    def _parse_wait_appear(self, text: str) -> ScriptAction:
        """解析等待出现"""
        params = self._parse_condition(text)
        return ScriptAction("wait_appear", params)

    def _parse_select_object(self, text: str, batch: bool = False) -> ScriptAction:
        """解析选择物体"""
        params = self._parse_condition(text)
        action_type = "batch_select" if batch else "select_object"
        return ScriptAction(action_type, params)

    def _parse_if_appear(self, text: str) -> ScriptAction:
        """解析如果出现"""
        params = self._parse_condition(text)
        return ScriptAction("if_appear", params)

    def _parse_buy_item(self, text: str) -> ScriptAction:
        """解析购买物品"""
        params = {}
        if text:
            params['item'] = text
        return ScriptAction("buy_item", params)

    def _parse_condition(self, text: str) -> Dict[str, str]:
        """解析条件文本"""
        params = {}
        parts = re.split(r',\s*(?![^()]*\))', text)

        for part in parts:
            part = part.strip()
            if '=' in part:
                key, value = part.split('=', 1)
                params[key.strip()] = value.strip()
            else:
                # 无值参数
                params[part] = ""

        return params

    def start(self):
        """启动引擎"""
        if self.is_running:
            return

        self.is_running = True
        self.engine_thread = threading.Thread(target=self._engine_loop, daemon=True)
        self.engine_thread.start()
        print("脚本引擎已启动")

    def stop(self):
        """停止引擎"""
        self.is_running = False
        if self.engine_thread:
            self.engine_thread.join(timeout=1.0)
            self.engine_thread = None
        print("脚本引擎已停止")

    def _engine_loop(self):
        """引擎主循环"""
        while self.is_running:
            try:
                self._update_scripts()
            except Exception as e:
                print(f"脚本引擎错误: {e}")

            time.sleep(0.02)

    def _update_scripts(self):
        """更新所有运行中的脚本"""
        game_state = self.memory_reader.update_game_state()

        with self.engine_lock:
            # 按优先级排序
            self.running_scripts.sort(key=lambda s: -s.priority)

            scripts_to_remove = []

            for script in self.running_scripts:
                if script.status != ScriptStatus.RUNNING:
                    continue

                # 检查等待时间
                if script.context.wait_until > 0:
                    if time.time() < script.context.wait_until:
                        continue
                    script.context.wait_until = 0

                # 执行当前步骤
                try:
                    if script.current_step < len(script.actions):
                        action = script.actions[script.current_step]
                        self._execute_action(script, action, game_state)

                        if script.on_step:
                            script.on_step(script.current_step, action)

                        script.current_step += 1
                    else:
                        # 脚本结束
                        if script.max_loops < 0 or script.loop_count < script.max_loops:
                            # 循环
                            script.current_step = 0
                            script.loop_count += 1
                        else:
                            # 完成
                            script.status = ScriptStatus.FINISHED
                            scripts_to_remove.append(script)
                            if script.on_finish:
                                script.on_finish()
                except Exception as e:
                    print(f"脚本执行错误 '{script.name}': {e}")
                    script.status = ScriptStatus.ERROR
                    scripts_to_remove.append(script)
                    if script.on_error:
                        script.on_error(str(e))

            # 移除已结束的脚本
            for script in scripts_to_remove:
                self.running_scripts.remove(script)

    def _execute_action(self, script: Script, action: ScriptAction,
                        game_state: GameState):
        """执行单个动作"""
        ctx = script.context

        if action.action_type == "wait":
            ctx.wait_until = time.time() + action.delay

        elif action.action_type == "label":
            ctx.current_label = action.label

        elif action.action_type == "goto":
            target = action.parameters.get("target", "")
            self._jump_to_label(script, target)

        elif action.action_type == "key":
            key = action.parameters.get("key", "")
            self.input_sim.tap_key(key)

        elif action.action_type == "mouse_click":
            button = action.parameters.get("button", "left")
            self.input_sim.mouse_click(button)

        elif action.action_type == "hold_shift":
            self.input_sim.press_key("shift")

        elif action.action_type == "release_shift":
            self.input_sim.release_key("shift")

        elif action.action_type == "wait_appear":
            matched = self._check_conditions(action.parameters, game_state)
            if not matched:
                # 不匹配，回退一步等待
                script.current_step -= 1
            else:
                ctx.matched_conditions = matched
                if matched:
                    ctx.target_unit = matched[0]

        elif action.action_type == "select_object":
            matched = self._check_conditions(action.parameters, game_state)
            if matched:
                ctx.selected_hero = matched[0]
                ctx.matched_conditions = matched
                print(f"选择: {matched[0].name}")
            else:
                # 选择失败，检查是否有失败跳转
                if "失败" in action.parameters:
                    self._jump_to_label(script, action.parameters["失败"])

        elif action.action_type == "if_appear":
            matched = self._check_conditions(action.parameters, game_state)
            if not matched:
                if "失败" in action.parameters:
                    self._jump_to_label(script, action.parameters["失败"])
            else:
                ctx.matched_conditions = matched

        elif action.action_type == "use_item":
            item_name = action.parameters.get("item", "")
            self._use_item(item_name, ctx)

        elif action.action_type == "use_ability":
            ability_name = action.parameters.get("ability", "")
            self._use_ability(ability_name, ctx, action.parameters)

        elif action.action_type == "spread":
            # 散开动作
            self.input_sim.tap_key('h')

        elif action.action_type == "set_priority":
            priority = action.parameters.get("priority", "0")
            try:
                script.priority = int(priority)
            except:
                pass

        if action.delay > 0:
            ctx.wait_until = time.time() + action.delay

    def _jump_to_label(self, script: Script, target: str):
        """跳转到标签"""
        target = target.strip()

        # 处理特殊跳转
        if target.startswith('第') and target.endswith('步'):
            try:
                step_num = int(target[1:-1]) - 1
                if 0 <= step_num < len(script.actions):
                    script.current_step = step_num
                return
            except:
                pass

        # 处理 $a, $b 等标签
        if target.startswith('$'):
            target = target + ':'

        # 查找标签
        for i, action in enumerate(script.actions):
            if action.action_type == "label" and action.label == target:
                script.current_step = i
                return

        print(f"未找到标签: {target}")

    def _check_conditions(self, params: Dict[str, str],
                            game_state: GameState) -> List[Hero]:
        """检查条件"""
        target_type = params.get("目标", "")
        target_names = params.get("名字", "").split('、')
        range_str = params.get("范围", "0")
        state_filters = [k for k in params.keys() if k.startswith('状态')]

        condition = WatchCondition()
        condition.target_type = target_type
        condition.target_names = [n.strip() for n in target_names if n.strip()]
        try:
            condition.range_ = float(range_str)
        except:
            condition.range_ = 0

        # 收集匹配的英雄
        candidates: List[Hero] = []

        if "敌人英雄" in target_type:
            candidates.extend(game_state.enemy_heroes)
        if "自己英雄" in target_type or "盟友英雄" in target_type:
            candidates.extend(game_state.ally_heroes)
        if not candidates:
            candidates.extend(game_state.heroes)

        # 过滤
        matched: List[Hero] = []
        for hero in candidates:
            if condition.target_names and not any(n in hero.name for n in condition.target_names):
                continue
            matched.append(hero)

        return matched

    def _use_item(self, item_name: str, ctx: ScriptContext):
        """使用物品"""
        # 简化实现 - 实际需要内存操作
        print(f"使用物品: {item_name}")

    def _use_ability(self, ability_name: str, ctx: ScriptContext,
                      params: Dict[str, str]):
        """使用技能"""
        # 简化实现 - 实际需要内存操作
        print(f"使用技能: {ability_name}")

    def run_script(self, name: str, max_loops: int = -1) -> bool:
        """运行脚本"""
        if name not in self.scripts:
            print(f"未找到脚本: {name}")
            return False

        script = self.scripts[name]
        script.reset()
        script.status = ScriptStatus.RUNNING
        script.max_loops = max_loops

        with self.engine_lock:
            self.running_scripts.append(script)

        print(f"开始运行脚本: {name}")
        return True

    def stop_script(self, name: str):
        """停止脚本"""
        with self.engine_lock:
            for script in self.running_scripts:
                if script.name == name:
                    script.status = ScriptStatus.IDLE
                    self.running_scripts.remove(script)
                    print(f"已停止脚本: {name}")
                    return

    def get_script_names(self) -> List[str]:
        """获取所有脚本名称"""
        return list(self.scripts.keys())

    def get_running_scripts(self) -> List[str]:
        """获取运行中的脚本"""
        with self.engine_lock:
            return [s.name for s in self.running_scripts]


if __name__ == "__main__":
    # 测试代码
    import os
    from core import ConfigParser, MemoryReader, InputSimulator

    config_path = os.path.join(os.path.dirname(__file__), '..', 'configs', '3C.txt')
    config = ConfigParser(config_path)

    reader = MemoryReader()
    reader.attach()

    input_sim = InputSimulator()

    engine = ScriptEngine(config, reader, input_sim)

    print(f"可用脚本: {engine.get_script_names()[:10]}")

    engine.start()

    # 测试运行一个脚本
    if engine.get_script_names():
        script_name = engine.get_script_names()[0]
        print(f"\n测试脚本: {script_name}")
        engine.run_script(script_name, max_loops=1)

        try:
            for i in range(20):
                running = engine.get_running_scripts()
                print(f"运行中的脚本: {running}")
                time.sleep(0.5)
        except KeyboardInterrupt:
            pass

    engine.stop()
    reader.detach()
