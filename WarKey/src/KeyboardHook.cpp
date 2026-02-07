#include "KeyboardHook.h"
#include "Logger.h"
#include <iostream>

// 全局实例指针（用于钩子回调）
static KeyboardHook* g_keyboardHookInstance = nullptr;

KeyboardHook::KeyboardHook()
    : m_keyboardHook(nullptr)
    , m_hInstance(nullptr)
    , m_isInstalled(false) {
    LOG_INFO("KeyboardHook 初始化");
}

KeyboardHook::~KeyboardHook() {
    Uninstall();
    LOG_INFO("KeyboardHook 销毁");
}

bool KeyboardHook::Install() {
    std::lock_guard<std::mutex> lock(m_hookMutex);

    if (m_isInstalled) {
        LOG_WARNING("键盘钩子已安装");
        return true;
    }

    // 获取模块句柄
    m_hInstance = GetModuleHandleW(nullptr);
    if (!m_hInstance) {
        LOG_ERROR("获取模块句柄失败");
        return false;
    }

    // 保存实例指针
    g_keyboardHookInstance = this;

    // 安装低级键盘钩子
    m_keyboardHook = SetWindowsHookExW(
        WH_KEYBOARD_LL,
        KeyboardProc,
        m_hInstance,
        0
    );

    if (!m_keyboardHook) {
        LOG_ERROR("安装键盘钩子失败，错误码: " + std::to_string(GetLastError()));
        g_keyboardHookInstance = nullptr;
        return false;
    }

    m_isInstalled = true;
    LOG_INFO("键盘钩子安装成功");
    return true;
}

bool KeyboardHook::Uninstall() {
    std::lock_guard<std::mutex> lock(m_hookMutex);

    if (!m_isInstalled) {
        return true;
    }

    if (m_keyboardHook) {
        UnhookWindowsHookEx(m_keyboardHook);
        m_keyboardHook = nullptr;
    }

    g_keyboardHookInstance = nullptr;
    m_isInstalled = false;
    LOG_INFO("键盘钩子已卸载");
    return true;
}

bool KeyboardHook::IsInstalled() const {
    return m_isInstalled;
}

void KeyboardHook::SetKeyCallback(std::function<bool(const KeyEvent&)> callback) {
    m_keyCallback = callback;
}

void KeyboardHook::SendKeyEvent(DWORD virtualKey, bool isKeyDown, bool isExtended) {
    INPUT input = {0};
    input.type = INPUT_KEYBOARD;
    input.ki.wVk = static_cast<WORD>(virtualKey);
    input.ki.dwFlags = isKeyDown ? 0 : KEYEVENTF_KEYUP;
    if (isExtended) {
        input.ki.dwFlags |= KEYEVENTF_EXTENDEDKEY;
    }
    input.ki.time = 0;
    input.ki.dwExtraInfo = 0;

    SendInput(1, &input, sizeof(INPUT));
}

void KeyboardHook::SendKeyEvent(const std::string& keyName, bool isKeyDown) {
    DWORD virtualKey = StringToVirtualKey(keyName);
    if (virtualKey) {
        SendKeyEvent(virtualKey, isKeyDown);
    }
}

void KeyboardHook::SendModifierKey(DWORD modifierKey, bool isKeyDown) {
    INPUT input = {0};
    input.type = INPUT_KEYBOARD;
    input.ki.wVk = static_cast<WORD>(modifierKey);
    input.ki.dwFlags = isKeyDown ? 0 : KEYEVENTF_KEYUP;
    input.ki.time = 0;
    input.ki.dwExtraInfo = 0;

    SendInput(1, &input, sizeof(INPUT));
}

void KeyboardHook::SendChar(char ch) {
    WORD vk = VkKeyScanW(ch);
    if (vk != 0xFFFF) {
        INPUT input = {0};
        input.type = INPUT_KEYBOARD;
        input.ki.wVk = vk;
        input.ki.wScan = static_cast<WORD>(ch);
        input.ki.dwFlags = KEYEVENTF_UNICODE;
        input.ki.time = 0;
        input.ki.dwExtraInfo = 0;

        // 按下
        SendInput(1, &input, sizeof(INPUT));

        // 释放
        input.ki.dwFlags |= KEYEVENTF_KEYUP;
        SendInput(1, &input, sizeof(INPUT));
    }
}

LRESULT CALLBACK KeyboardHook::KeyboardProc(int nCode, WPARAM wParam, LPARAM lParam) {
    if (nCode == HC_ACTION && g_keyboardHookInstance) {
        return g_keyboardHookInstance->HandleKeyboardProc(nCode, wParam, lParam);
    }

    return CallNextHookEx(nullptr, nCode, wParam, lParam);
}

LRESULT CALLBACK KeyboardHook::HandleKeyboardProc(int nCode, WPARAM wParam, LPARAM lParam) {
    if (nCode != HC_ACTION) {
        return CallNextHookEx(m_keyboardHook, nCode, wParam, lParam);
    }

    // 解析键盘事件
    KBDLLHOOKSTRUCT* kbStruct = reinterpret_cast<KBDLLHOOKSTRUCT*>(lParam);

    KeyEvent event;
    event.wParam = wParam;
    event.lParam = lParam;
    event.virtualKey = kbStruct->vkCode;
    event.scanCode = kbStruct->scanCode;
    event.isExtended = (kbStruct->flags & LLKHF_EXTENDED) != 0;
    event.isAltPressed = (kbStruct->flags & LLKHF_ALTDOWN) != 0;
    event.isCtrlPressed = (GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0;
    event.isShiftPressed = (GetAsyncKeyState(VK_SHIFT) & 0x8000) != 0;
    event.isKeyDown = (wParam == WM_KEYDOWN || wParam == WM_SYSKEYDOWN);
    event.timestamp = kbStruct->time;

    // 处理按键事件
    if (ProcessKeyEvent(event)) {
        // 如果返回true，表示已处理，阻止原始按键
        return 1;
    }

    // 未处理，传递原始按键
    return CallNextHookEx(m_keyboardHook, nCode, wParam, lParam);
}

bool KeyboardHook::ProcessKeyEvent(const KeyEvent& event) {
    // 检查是否有回调函数
    if (!m_keyCallback) {
        return false;
    }

    // 调用回调函数
    return m_keyCallback(event);
}
