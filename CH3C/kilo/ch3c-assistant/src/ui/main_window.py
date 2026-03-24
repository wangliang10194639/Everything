"""
主窗口 - CH3C Assistant主界面

使用PyQt6实现的图形用户界面
"""

import sys
import logging
from typing import Optional, Dict, List
from pathlib import Path

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QTabWidget, QLabel, QPushButton, QCheckBox, QComboBox,
    QTableWidget, QTableWidgetItem, QHeaderView, QTextEdit,
    QGroupBox, QSplitter, QStatusBar, QMenuBar, QMenu,
    QToolBar, QMessageBox, QFileDialog, QProgressBar
)
from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QThread
from PyQt6.QtGui import QAction, QIcon, QFont

from ..core.config_parser import ConfigParser
from ..core.script_parser import ScriptParser, ScriptAST
from ..core.script_executor import ScriptExecutor, ExecutionState
from ..game.memory_reader_factory import get_memory_reader
from ..game.platform import get_platform, IS_WINDOWS

logger = logging.getLogger(__name__)


class MainWindow(QMainWindow):
    """
    主窗口 - CH3C Assistant主界面
    
    功能:
    - 脚本管理（加载、查看、启用/禁用）
    - 全图功能开关
    - 敌人英雄追踪显示
    - 热键设置
    - 日志输出
    """
    
    # 信号定义
    script_loaded = pyqtSignal(str)  # 脚本加载完成
    game_attached = pyqtSignal(bool)  # 游戏附加状态
    maphack_toggled = pyqtSignal(bool)  # 全图开关
    
    def __init__(self):
        """初始化主窗口"""
        super().__init__()
        
        # 核心组件
        self.config_parser = ConfigParser()
        self.script_parser = ScriptParser()
        self.memory_reader = None
        self.script_executor = None
        
        # 状态
        self._config_loaded = False
        self._game_attached = False
        self._maphack_enabled = False
        self._scripts: Dict[str, ScriptAST] = {}
        
        # 初始化UI
        self._init_ui()
        self._init_timers()
        
        logger.info("主窗口初始化完成")
        
    def _init_ui(self):
        """初始化用户界面"""
        # 窗口设置
        self.setWindowTitle("CH3C Assistant - 澄海3C辅助工具")
        self.setMinimumSize(1000, 700)
        self.resize(1200, 800)
        
        # 创建菜单栏
        self._create_menu_bar()
        
        # 创建工具栏
        self._create_tool_bar()
        
        # 创建中心部件
        self._create_central_widget()
        
        # 创建状态栏
        self._create_status_bar()
        
    def _create_menu_bar(self):
        """创建菜单栏"""
        menubar = self.menuBar()
        
        # 文件菜单
        file_menu = menubar.addMenu("文件(&F)")
        
        load_config_action = QAction("加载配置(&L)", self)
        load_config_action.setShortcut("Ctrl+L")
        load_config_action.triggered.connect(self._load_config)
        file_menu.addAction(load_config_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction("退出(&X)", self)
        exit_action.setShortcut("Alt+F4")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # 游戏菜单
        game_menu = menubar.addMenu("游戏(&G)")
        
        attach_action = QAction("附加到游戏(&A)", self)
        attach_action.setShortcut("Ctrl+A")
        attach_action.triggered.connect(self._attach_game)
        game_menu.addAction(attach_action)
        
        detach_action = QAction("从游戏分离(&D)", self)
        detach_action.triggered.connect(self._detach_game)
        game_menu.addAction(detach_action)
        
        # 帮助菜单
        help_menu = menubar.addMenu("帮助(&H)")
        
        about_action = QAction("关于(&A)", self)
        about_action.triggered.connect(self._show_about)
        help_menu.addAction(about_action)
        
    def _create_tool_bar(self):
        """创建工具栏"""
        toolbar = self.addToolBar("主工具栏")
        toolbar.setMovable(False)
        
        # 加载配置按钮
        self.load_btn = QPushButton("加载配置")
        self.load_btn.clicked.connect(self._load_config)
        toolbar.addWidget(self.load_btn)
        
        toolbar.addSeparator()
        
        # 附加游戏按钮
        self.attach_btn = QPushButton("附加游戏")
        self.attach_btn.clicked.connect(self._attach_game)
        toolbar.addWidget(self.attach_btn)
        
        # 全图开关
        self.maphack_cb = QCheckBox("全图")
        self.maphack_cb.setEnabled(False)
        self.maphack_cb.toggled.connect(self._toggle_maphack)
        toolbar.addWidget(self.maphack_cb)
        
        toolbar.addSeparator()
        
        # 启动/停止按钮
        self.start_btn = QPushButton("启动")
        self.start_btn.setEnabled(False)
        self.start_btn.clicked.connect(self._start_executor)
        toolbar.addWidget(self.start_btn)
        
        self.stop_btn = QPushButton("停止")
        self.stop_btn.setEnabled(False)
        self.stop_btn.clicked.connect(self._stop_executor)
        toolbar.addWidget(self.stop_btn)
        
    def _create_central_widget(self):
        """创建中心部件"""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 主布局
        main_layout = QHBoxLayout(central_widget)
        
        # 左侧面板 - 脚本列表
        left_panel = self._create_left_panel()
        
        # 右侧面板 - 英雄追踪和日志
        right_panel = self._create_right_panel()
        
        # 分割器
        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.addWidget(left_panel)
        splitter.addWidget(right_panel)
        splitter.setSizes([400, 600])
        
        main_layout.addWidget(splitter)
        
    def _create_left_panel(self) -> QWidget:
        """创建左侧面板"""
        panel = QWidget()
        layout = QVBoxLayout(panel)
        
        # 脚本列表
        scripts_group = QGroupBox("脚本列表")
        scripts_layout = QVBoxLayout(scripts_group)
        
        # 脚本表格
        self.scripts_table = QTableWidget()
        self.scripts_table.setColumnCount(4)
        self.scripts_table.setHorizontalHeaderLabels(["启用", "名称", "类型", "优先级"])
        self.scripts_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.Fixed)
        self.scripts_table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        self.scripts_table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.ResizeToContents)
        self.scripts_table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)
        self.scripts_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        scripts_layout.addWidget(self.scripts_table)
        
        # 脚本操作按钮
        scripts_btn_layout = QHBoxLayout()
        
        self.enable_all_btn = QPushButton("全部启用")
        self.enable_all_btn.clicked.connect(self._enable_all_scripts)
        scripts_btn_layout.addWidget(self.enable_all_btn)
        
        self.disable_all_btn = QPushButton("全部禁用")
        self.disable_all_btn.clicked.connect(self._disable_all_scripts)
        scripts_btn_layout.addWidget(self.disable_all_btn)
        
        scripts_layout.addLayout(scripts_btn_layout)
        layout.addWidget(scripts_group)
        
        # 脚本详情
        details_group = QGroupBox("脚本详情")
        details_layout = QVBoxLayout(details_group)
        
        self.script_details = QTextEdit()
        self.script_details.setReadOnly(True)
        self.script_details.setMaximumHeight(150)
        details_layout.addWidget(self.script_details)
        
        layout.addWidget(details_group)
        
        return panel
        
    def _create_right_panel(self) -> QWidget:
        """创建右侧面板"""
        panel = QWidget()
        layout = QVBoxLayout(panel)
        
        # 选项卡
        tab_widget = QTabWidget()
        
        # 英雄追踪选项卡
        hero_tab = self._create_hero_tracker_tab()
        tab_widget.addTab(hero_tab, "英雄追踪")
        
        # 日志选项卡
        log_tab = self._create_log_tab()
        tab_widget.addTab(log_tab, "日志")
        
        layout.addWidget(tab_widget)
        
        return panel
        
    def _create_hero_tracker_tab(self) -> QWidget:
        """创建英雄追踪选项卡"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # 敌人英雄表格
        enemy_group = QGroupBox("敌人英雄")
        enemy_layout = QVBoxLayout(enemy_group)
        
        self.enemy_table = QTableWidget()
        self.enemy_table.setColumnCount(6)
        self.enemy_table.setHorizontalHeaderLabels(["英雄", "等级", "血量", "魔法", "状态", "距离"])
        self.enemy_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        self.enemy_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        enemy_layout.addWidget(self.enemy_table)
        
        layout.addWidget(enemy_group)
        
        # 盟友英雄表格
        ally_group = QGroupBox("盟友英雄")
        ally_layout = QVBoxLayout(ally_group)
        
        self.ally_table = QTableWidget()
        self.ally_table.setColumnCount(6)
        self.ally_table.setHorizontalHeaderLabels(["英雄", "等级", "血量", "魔法", "状态", "位置"])
        self.ally_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        self.ally_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        ally_layout.addWidget(self.ally_table)
        
        layout.addWidget(ally_group)
        
        return tab
        
    def _create_log_tab(self) -> QWidget:
        """创建日志选项卡"""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        self.log_text.setFont(QFont("Consolas", 9))
        layout.addWidget(self.log_text)
        
        # 清除按钮
        clear_btn = QPushButton("清除日志")
        clear_btn.clicked.connect(self.log_text.clear)
        layout.addWidget(clear_btn)
        
        return tab
        
    def _create_status_bar(self):
        """创建状态栏"""
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        
        # 状态标签
        self.status_label = QLabel("就绪")
        self.status_bar.addWidget(self.status_label)
        
        # 平台信息
        platform_label = QLabel(f"平台: {get_platform()}")
        self.status_bar.addPermanentWidget(platform_label)
        
        # 游戏状态
        self.game_status_label = QLabel("未连接游戏")
        self.status_bar.addPermanentWidget(self.game_status_label)
        
    def _init_timers(self):
        """初始化定时器"""
        # 英雄追踪更新定时器
        self.hero_timer = QTimer(self)
        self.hero_timer.timeout.connect(self._update_hero_info)
        self.hero_timer.setInterval(100)  # 100ms更新一次
        
        # 状态更新定时器
        self.status_timer = QTimer(self)
        self.status_timer.timeout.connect(self._update_status)
        self.status_timer.setInterval(1000)  # 1秒更新一次
        
    def _load_config(self):
        """加载配置文件"""
        filepath, _ = QFileDialog.getOpenFileName(
            self, "选择配置文件", "", "配置文件 (*.txt);;所有文件 (*)"
        )
        
        if not filepath:
            return
            
        try:
            # 加载配置
            if not self.config_parser.load(filepath):
                QMessageBox.warning(self, "错误", f"加载配置文件失败: {filepath}")
                return
                
            # 解析脚本
            self._scripts.clear()
            for name, script_info in self.config_parser.get_all_actions().items():
                ast = self.script_parser.parse(name, script_info.raw_content)
                self._scripts[name] = ast
                
            # 更新脚本列表
            self._update_scripts_table()
            
            # 更新状态
            self._config_loaded = True
            self.status_label.setText(f"已加载: {Path(filepath).name}")
            self.script_loaded.emit(filepath)
            
            # 启用启动按钮
            if self._game_attached:
                self.start_btn.setEnabled(True)
                
            self._log(f"加载配置文件成功: {filepath}")
            self._log(f"解析到 {len(self._scripts)} 个脚本")
            
        except Exception as e:
            logger.error(f"加载配置文件失败: {e}")
            QMessageBox.critical(self, "错误", f"加载配置文件失败: {str(e)}")
            
    def _update_scripts_table(self):
        """更新脚本列表表格"""
        self.scripts_table.setRowCount(len(self._scripts))
        
        for row, (name, ast) in enumerate(self._scripts.items()):
            # 启用复选框
            check_item = QTableWidgetItem()
            check_item.setFlags(Qt.ItemFlag.ItemIsUserCheckable | Qt.ItemFlag.ItemIsEnabled)
            check_item.setCheckState(Qt.CheckState.Checked)
            self.scripts_table.setItem(row, 0, check_item)
            
            # 名称
            self.scripts_table.setItem(row, 1, QTableWidgetItem(name))
            
            # 类型
            script_type = "全局" if ast.is_global else ("高级" if ast.is_advanced else "普通")
            self.scripts_table.setItem(row, 2, QTableWidgetItem(script_type))
            
            # 优先级
            self.scripts_table.setItem(row, 3, QTableWidgetItem(ast.priority))
            
    def _attach_game(self):
        """附加到游戏"""
        if self._game_attached:
            return
            
        try:
            # 获取内存读取器
            if self.memory_reader is None:
                self.memory_reader = get_memory_reader()
                
            # 附加到游戏进程
            process_name = "war3.exe"
            if not self.memory_reader.attach(process_name):
                QMessageBox.warning(self, "错误", f"无法附加到游戏进程: {process_name}")
                return
                
            # 创建脚本执行器
            self.script_executor = ScriptExecutor(self.memory_reader)
            
            # 更新状态
            self._game_attached = True
            self.attach_btn.setEnabled(False)
            self.maphack_cb.setEnabled(True)
            self.game_status_label.setText("已连接")
            self.game_attached.emit(True)
            
            # 启动英雄追踪
            self.hero_timer.start()
            self.status_timer.start()
            
            self._log(f"成功附加到游戏进程: {process_name}")
            
        except Exception as e:
            logger.error(f"附加游戏失败: {e}")
            QMessageBox.critical(self, "错误", f"附加游戏失败: {str(e)}")
            
    def _detach_game(self):
        """从游戏分离"""
        if not self._game_attached:
            return
            
        try:
            # 停止执行器
            if self.script_executor:
                self.script_executor.stop()
                
            # 分离
            if self.memory_reader:
                self.memory_reader.detach()
                
            # 更新状态
            self._game_attached = False
            self.attach_btn.setEnabled(True)
            self.maphack_cb.setEnabled(False)
            self.start_btn.setEnabled(False)
            self.stop_btn.setEnabled(False)
            self.game_status_label.setText("未连接")
            self.game_attached.emit(False)
            
            # 停止定时器
            self.hero_timer.stop()
            self.status_timer.stop()
            
            self._log("已从游戏分离")
            
        except Exception as e:
            logger.error(f"分离游戏失败: {e}")
            
    def _toggle_maphack(self, enabled: bool):
        """切换全图功能"""
        if not self.memory_reader:
            return
            
        try:
            self.memory_reader.enable_maphack(enabled)
            self._maphack_enabled = enabled
            self.maphack_toggled.emit(enabled)
            self._log(f"全图功能: {'启用' if enabled else '禁用'}")
        except Exception as e:
            logger.error(f"切换全图失败: {e}")
            self.maphack_cb.setChecked(not enabled)  # 恢复状态
            
    def _start_executor(self):
        """启动脚本执行器"""
        if not self.script_executor or not self._config_loaded:
            return
            
        # 加载启用的脚本
        enabled_scripts = {}
        for row in range(self.scripts_table.rowCount()):
            check_item = self.scripts_table.item(row, 0)
            if check_item.checkState() == Qt.CheckState.Checked:
                name = self.scripts_table.item(row, 1).text()
                if name in self._scripts:
                    enabled_scripts[name] = self._scripts[name]
                    
        if not enabled_scripts:
            QMessageBox.warning(self, "警告", "请至少启用一个脚本")
            return
            
        self.script_executor.load_scripts(enabled_scripts)
        self.script_executor.start()
        
        self.start_btn.setEnabled(False)
        self.stop_btn.setEnabled(True)
        self.status_label.setText("运行中")
        
        self._log(f"启动执行器，加载 {len(enabled_scripts)} 个脚本")
        
    def _stop_executor(self):
        """停止脚本执行器"""
        if not self.script_executor:
            return
            
        self.script_executor.stop()
        
        self.start_btn.setEnabled(True)
        self.stop_btn.setEnabled(False)
        self.status_label.setText("已停止")
        
        self._log("停止执行器")
        
    def _enable_all_scripts(self):
        """启用所有脚本"""
        for row in range(self.scripts_table.rowCount()):
            self.scripts_table.item(row, 0).setCheckState(Qt.CheckState.Checked)
            
    def _disable_all_scripts(self):
        """禁用所有脚本"""
        for row in range(self.scripts_table.rowCount()):
            self.scripts_table.item(row, 0).setCheckState(Qt.CheckState.Unchecked)
            
    def _update_hero_info(self):
        """更新英雄信息"""
        if not self.memory_reader or not self._game_attached:
            return
            
        try:
            # 获取敌人英雄
            enemy_heroes = self.memory_reader.get_enemy_heroes()
            self._update_hero_table(self.enemy_table, enemy_heroes, is_enemy=True)
            
            # 获取盟友英雄
            ally_heroes = self.memory_reader.get_ally_heroes()
            self._update_hero_table(self.ally_table, ally_heroes, is_enemy=False)
            
        except Exception as e:
            logger.error(f"更新英雄信息失败: {e}")
            
    def _update_hero_table(self, table: QTableWidget, heroes: list, is_enemy: bool):
        """更新英雄表格"""
        table.setRowCount(len(heroes))
        
        my_hero = self.memory_reader.get_my_hero() if self.memory_reader else None
        
        for row, hero in enumerate(heroes):
            # 英雄名称
            table.setItem(row, 0, QTableWidgetItem(hero.hero_name))
            
            # 等级
            table.setItem(row, 1, QTableWidgetItem(str(hero.unit_info.level)))
            
            # 血量
            health_pct = self.memory_reader.get_unit_health_percent(hero.unit_info)
            health_item = QTableWidgetItem(f"{health_pct:.1f}%")
            if health_pct < 30:
                health_item.setForeground(Qt.GlobalColor.red)
            table.setItem(row, 2, health_item)
            
            # 魔法
            mana_pct = self.memory_reader.get_unit_mana_percent(hero.unit_info)
            table.setItem(row, 3, QTableWidgetItem(f"{mana_pct:.1f}%"))
            
            # 状态
            status = self._get_hero_status(hero)
            table.setItem(row, 4, QTableWidgetItem(status))
            
            # 距离/位置
            if is_enemy and my_hero:
                distance = self.memory_reader.get_distance(my_hero.unit_info, hero.unit_info)
                table.setItem(row, 5, QTableWidgetItem(f"{distance:.0f}"))
            else:
                pos = f"({hero.unit_info.x:.0f}, {hero.unit_info.y:.0f})"
                table.setItem(row, 5, QTableWidgetItem(pos))
                
    def _get_hero_status(self, hero) -> str:
        """获取英雄状态文本"""
        statuses = []
        if hero.is_silenced:
            statuses.append("沉默")
        if hero.is_stunned:
            statuses.append("眩晕")
        if hero.is_polymorphed:
            statuses.append("变羊")
        if hero.is_invisible:
            statuses.append("隐身")
        if hero.is_invulnerable:
            statuses.append("无敌")
            
        return ", ".join(statuses) if statuses else "正常"
        
    def _update_status(self):
        """更新状态"""
        if self.script_executor and self.script_executor.is_running():
            states = self.script_executor.get_all_states()
            running_count = sum(1 for s in states.values() if s == ExecutionState.RUNNING)
            self.status_label.setText(f"运行中 ({running_count} 个脚本)")
            
    def _log(self, message: str):
        """添加日志"""
        self.log_text.append(message)
        logger.info(message)
        
    def _show_about(self):
        """显示关于对话框"""
        QMessageBox.about(
            self,
            "关于 CH3C Assistant",
            """<h2>CH3C Assistant</h2>
            <p>版本: 0.1.0</p>
            <p>澄海3C游戏辅助工具</p>
            <p>功能:</p>
            <ul>
                <li>脚本加载与执行</li>
                <li>全图功能</li>
                <li>敌人英雄追踪</li>
                <li>热键管理</li>
            </ul>
            <p><b>警告:</b> 本软件仅供学习研究使用</p>
            """
        )
        
    def closeEvent(self, event):
        """窗口关闭事件"""
        # 停止执行器
        if self.script_executor:
            self.script_executor.stop()
            
        # 分离游戏
        if self.memory_reader:
            self.memory_reader.detach()
            
        event.accept()


def run_app():
    """运行应用程序"""
    app = QApplication(sys.argv)
    app.setApplicationName("CH3C Assistant")
    app.setApplicationVersion("0.1.0")
    
    # 设置样式
    app.setStyle("Fusion")
    
    # 创建主窗口
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    run_app()
