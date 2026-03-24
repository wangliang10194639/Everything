# -*- mode: python ; coding: utf-8 -*-
"""
CH3C Helper 打包配置 - PyInstaller spec文件
适用于Windows平台
"""

import sys
from pathlib import Path

block_cipher = None

# 获取项目路径
current_dir = Path(__file__).parent

a = Analysis(
    ['main.py'],
    pathex=[str(current_dir)],
    binaries=[],
    datas=[
        (str(current_dir / 'configs'), 'configs'),
        (str(current_dir / 'scripts'), 'scripts'),
        (str(current_dir / 'ui'), 'ui'),
    ],
    hiddenimports=[
        'core',
        'modules',
        'core.config_parser',
        'core.game_data',
        'core.memory_reader',
        'core.memory_offsets',
        'core.process_hook',
        'modules.map_hack',
        'modules.hero_tracker',
        'modules.hotkey_manager',
        'modules.script_engine',
        'modules.input_simulator',
        'pywin32',
        'pymem',
        'pynput',
        'keyboard',
        'pyautogui',
        'pillow',
        'psutil',
        'configparser',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='CH3CHelper',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # 保持控制台输出（便于调试）
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    version=None,
    description='澄海3C 游戏辅助软件',
)
