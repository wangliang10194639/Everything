import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
英雄追踪模块
"""

import time
import threading
from typing import List, Dict, Callable, Optional
from dataclasses import dataclass, field
from core import (
    MemoryReader, GameState, Hero, Point, HeroState, Ability, Item
)


@dataclass
class HeroAlert:
    """英雄状态变更记录"""
    hero_name: str
    alert_type: str  # "appear", "skill_cast", "low_health", "dead", etc.
    position: Point
    timestamp: float
    details: str = ""


class HeroTracker:
    """英雄追踪器"""

    def __init__(self, memory_reader: MemoryReader):
        self.memory_reader = memory_reader
        self.is_running = False
        self.tracker_thread = None
        self.update_lock = threading.Lock()

        # 追踪数据
        self.hero_history: Dict[int, Hero] = {}
        self.enemy_heroes: Dict[int, Hero] = {}
        self.ally_heroes: Dict[int, Hero] = {}

        # 警报
        self.alerts: List[HeroAlert] = []
        self.max_alerts = 50

        # 回调函数
        self.on_enemy_appear: Optional[Callable[[Hero], None]] = None
        self.on_skill_cast: Optional[Callable[[Hero, Ability], None]] = None
        self.on_low_health: Optional[Callable[[Hero], None]] = None
        self.on_hero_death: Optional[Callable[[Hero], None]] = None
        self.on_alert: Optional[Callable[[HeroAlert], None]] = None

        # 监控设置
        self.track_skill_casts = True
        self.track_low_health = True
        self.track_positions = True
        self.low_health_threshold = 0.3  # 30%血量触发低血量
        self.alert_cooldowns: Dict[str, float] = {}
        self.alert_interval = 2.0  # 相同警报间隔秒

    def start(self):
        """启动追踪"""
        if self.is_running:
            return

        self.is_running = True
        self.tracker_thread = threading.Thread(target=self._track_loop, daemon=True)
        self.tracker_thread.start()
        print("英雄追踪已启动")

    def stop(self):
        """停止追踪"""
        self.is_running = False
        if self.tracker_thread:
            self.tracker_thread.join(timeout=1.0)
            self.tracker_thread = None
        print("英雄追踪已停止")

    def _track_loop(self):
        """追踪主循环"""
        last_hero_states = {}

        while self.is_running:
            try:
                game_state = self.memory_reader.update_game_state()

                if not game_state.is_in_game:
                    time.sleep(0.1)
                    continue

                # 更新英雄数据
                self._update_hero_lists(game_state)

                # 检测英雄状态变化
                if self.track_skill_casts or self.track_low_health:
                    self._detect_changes(game_state, last_hero_states)

                # 更新历史状态
                for hero in game_state.heroes:
                    last_hero_states[hero.hero_id] = (
                        hero.health,
                        [a.cooldown_remaining for a in hero.abilities]
                    )

            except Exception as e:
                print(f"追踪错误: {e}")

            time.sleep(0.05)

    def _update_hero_lists(self, game_state: GameState):
        """更新英雄列表"""
        with self.update_lock:
            self.hero_history.clear()
            self.enemy_heroes.clear()
            self.ally_heroes.clear()

            for hero in game_state.heroes:
                self.hero_history[hero.hero_id] = hero

                if hero.is_enemy:
                    self.enemy_heroes[hero.hero_id] = hero
                else:
                    self.ally_heroes[hero.hero_id] = hero

    def _detect_changes(self, game_state: GameState, last_states: dict):
        """检测英雄状态变化"""
        current_time = time.time()

        for hero in game_state.heroes:
            hero_id = hero.hero_id

            # 检查上次状态
            if hero_id not in last_states:
                continue

            last_health, last_cooldowns = last_states[hero_id]

            # 检测技能释放
            if self.track_skill_casts and len(hero.abilities) == len(last_cooldowns):
                for i, (abil, last_cd) in enumerate(zip(hero.abilities, last_cooldowns)):
                    if last_cd <= 0 and abil.cooldown_remaining > 0:
                        self._on_skill_casted(hero, abil)

            # 检测低血量
            if self.track_low_health:
                health_pct = hero.health_pct()
                if health_pct < self.low_health_threshold and last_health > 0:
                    if hero.health < last_health:
                        self._on_low_health_detected(hero)

            # 检测死亡
            if not hero.is_alive and last_health > 0:
                self._on_hero_died(hero)

    def _on_skill_casted(self, hero: Hero, ability: Ability):
        """技能释放时触发"""
        if not hero.is_enemy:
            return

        alert_key = f"skill_{hero.hero_id}_{ability.order_id}"
        current_time = time.time()

        if self._can_send_alert(alert_key, current_time):
            alert = HeroAlert(
                hero_name=hero.name,
                alert_type="skill_cast",
                position=Point(hero.position.x, hero.position.y),
                timestamp=current_time,
                details=f"释放了 {ability.name}"
            )
            self._add_alert(alert)

            if self.on_skill_cast:
                self.on_skill_cast(hero, ability)

    def _on_low_health_detected(self, hero: Hero):
        """检测到低血量时触发"""
        alert_key = f"lowhp_{hero.hero_id}"
        current_time = time.time()

        if self._can_send_alert(alert_key, current_time):
            alert = HeroAlert(
                hero_name=hero.name,
                alert_type="low_health",
                position=Point(hero.position.x, hero.position.y),
                timestamp=current_time,
                details=f"血量低于 {self.low_health_threshold * 100:.0f}%"
            )
            self._add_alert(alert)

            if self.on_low_health:
                self.on_low_health(hero)

    def _on_hero_died(self, hero: Hero):
        """英雄死亡时触发"""
        alert_key = f"death_{hero.hero_id}"
        current_time = time.time()

        if self._can_send_alert(alert_key, current_time):
            alert = HeroAlert(
                hero_name=hero.name,
                alert_type="dead",
                position=Point(hero.position.x, hero.position.y),
                timestamp=current_time,
                details="死亡了"
            )
            self._add_alert(alert)

            if self.on_hero_death:
                self.on_hero_death(hero)

    def _can_send_alert(self, key: str, current_time: float) -> bool:
        """检查是否可以发送警报（避免重复）"""
        if key in self.alert_cooldowns:
            if current_time - self.alert_cooldowns[key] < self.alert_interval:
                return False
        self.alert_cooldowns[key] = current_time
        return True

    def _add_alert(self, alert: HeroAlert):
        """添加警报"""
        with self.update_lock:
            self.alerts.append(alert)
            if len(self.alerts) > self.max_alerts:
                self.alerts.pop(0)

        if self.on_alert:
            self.on_alert(alert)

    def get_enemy_heroes(self) -> List[Hero]:
        """获取敌方英雄列表"""
        with self.update_lock:
            return list(self.enemy_heroes.values())

    def get_ally_heroes(self) -> List[Hero]:
        """获取己方英雄列表"""
        with self.update_lock:
            return list(self.ally_heroes.values())

    def get_alerts(self, since: float = 0) -> List[HeroAlert]:
        """获取警报列表"""
        with self.update_lock:
            since_time = time.time() - since
            return [a for a in self.alerts if a.timestamp >= since_time]

    def get_hero_by_name(self, name: str) -> Optional[Hero]:
        """按名称查找英雄"""
        with self.update_lock:
            for hero in self.hero_history.values():
                if name in hero.name:
                    return hero
        return None

    def get_enemies_in_range(self, pos: Point, range_: float) -> List[Hero]:
        """获取范围内的敌方英雄"""
        result = []
        with self.update_lock:
            for hero in self.enemy_heroes.values():
                if hero.position.distance_to(pos) <= range_:
                    result.append(hero)
        return result

    def set_low_health_threshold(self, threshold: float):
        """设置低血量阈值"""
        self.low_health_threshold = max(0.05, min(0.9, threshold))


class HeroOverlay:
    """英雄状态覆盖层"""

    def __init__(self, tracker: HeroTracker):
        self.tracker = tracker
        self.is_visible = True

    def get_display_text(self) -> str:
        """获取显示文本"""
        lines = []
        lines.append("=== 敌方英雄 ===")

        enemies = self.tracker.get_enemy_heroes()
        if not enemies:
            lines.append("未发现敌方英雄")
        else:
            for hero in sorted(enemies, key=lambda h: h.name):
                hp_pct = hero.health_pct() * 100
                mp_pct = hero.mana_pct() * 100
                status_icon = "🟢" if hero.is_alive else "🔴"
                lines.append(
                    f"{status_icon} {hero.name} "
                    f"HP:{hp_pct:.0f}% MP:{mp_pct:.0f}% "
                    f"Lv.{hero.level}"
                )

        alerts = self.tracker.get_alerts(since=5.0)
        if alerts:
            lines.append("\n=== 最近警报 ===")
            for alert in alerts[-5:]:
                time_ago = time.time() - alert.timestamp
                lines.append(f"[{time_ago:.1f}s {alert.hero_name} {alert.details}")

        return "\n".join(lines)


if __name__ == "__main__":
    # 测试代码
    from core import MemoryReader

    reader = MemoryReader()
    reader.attach()

    tracker = HeroTracker(reader)
    overlay = HeroOverlay(tracker)

    tracker.start()
    print("英雄追踪测试...")

    try:
        for i in range(30):
            print("\n" + overlay.get_display_text())
            time.sleep(1.0)

    except KeyboardInterrupt:
        pass

    tracker.stop()
    reader.detach()
