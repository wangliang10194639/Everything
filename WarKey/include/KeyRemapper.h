#pragma once

#include "Common.h"
#include "KeyMapping.h"
#include "KeyboardHook.h"
#include <memory>

// 按键重映射核心类
class KeyRemapper {
private:
    std::unique_ptr<KeyMappingManager> m_mappingManager;  // 映射管理器
    std::unique_ptr<KeyboardHook> m_keyboardHook;         // 键盘钩子
    bool m_isRunning;                                     // 是否运行中
    bool m_isPaused;                                      // 是否暂停
    HWND m_targetWindow;                                  // 目标窗口句柄
    std::mutex m_remapperMutex;                           // 互斥锁

    // 修饰键状态
    bool m_isCtrlPressed;
    bool m_isAltPressed;
    bool m_isShiftPressed;

public:
    KeyRemapper();
    ~KeyRemapper();

    // 初始化
    bool Initialize();

    // 启动改键
    bool Start();

    // 停止改键
    bool Stop();

    // 暂停改键
    void Pause();

    // 恢复改键
    void Resume();

    // 检查是否正在运行
    bool IsRunning() const;

    // 检查是否暂停
    bool IsPaused() const;

    // 设置目标窗口
    void SetTargetWindow(HWND hwnd);

    // 获取目标窗口
    HWND GetTargetWindow() const;

    // 设置映射管理器
    void SetMappingManager(std::unique_ptr<KeyMappingManager> manager);

    // 获取映射管理器
    KeyMappingManager* GetMappingManager() const;

    // 处理按键事件
    bool ProcessKeyEvent(const KeyEvent& event);

    // 启用/禁用指定类型的映射
    void EnableMappings(KeyType type, bool enable);

    // 启用/禁用所有映射
    void EnableAllMappings(bool enable);

    // 切换修饰键状态
    void UpdateModifierState(const KeyEvent& event);

private:
    // 按键回调处理
    static bool KeyCallback(const KeyEvent& event, void* userData);

    // 查找并应用映射
    KeyEvent ApplyMapping(const KeyEvent& input);

    // 发送映射后的按键
    void SendMappedKey(const KeyMapping& mapping, bool isKeyDown);

    // 检查是否应该应用映射
    bool ShouldApplyMapping(const KeyMapping& mapping) const;
};
