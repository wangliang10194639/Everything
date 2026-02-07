#pragma once

#include "Common.h"
#include <functional>

// 键盘钩子管理类
class KeyboardHook {
private:
    HHOOK m_keyboardHook;           // 键盘钩子句柄
    HINSTANCE m_hInstance;          // 实例句柄
    bool m_isInstalled;             // 是否已安装
    std::mutex m_hookMutex;         // 互斥锁

    // 按键回调函数类型
    std::function<bool(const KeyEvent&)> m_keyCallback;

public:
    KeyboardHook();
    ~KeyboardHook();

    // 安装钩子
    bool Install();

    // 卸载钩子
    bool Uninstall();

    // 检查钩子是否已安装
    bool IsInstalled() const;

    // 设置按键回调函数
    void SetKeyCallback(std::function<bool(const KeyEvent&)> callback);

    // 发送键盘事件
    static void SendKeyEvent(DWORD virtualKey, bool isKeyDown, bool isExtended = false);
    static void SendKeyEvent(const std::string& keyName, bool isKeyDown);

    // 发送组合键
    static void SendModifierKey(DWORD modifierKey, bool isKeyDown);
    static void SendChar(char ch);

private:
    // 钩子回调函数
    static LRESULT CALLBACK KeyboardProc(int nCode, WPARAM wParam, LPARAM lParam);

    // 实例回调处理
    LRESULT CALLBACK HandleKeyboardProc(int nCode, WPARAM wParam, LPARAM lParam);

    // 处理按键事件
    bool ProcessKeyEvent(const KeyEvent& event);
};
