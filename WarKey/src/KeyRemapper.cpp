#include "KeyRemapper.h"
#include "Logger.h"

KeyRemapper::KeyRemapper()
    : m_isRunning(false)
    , m_isPaused(false)
    , m_targetWindow(nullptr)
    , m_isCtrlPressed(false)
    , m_isAltPressed(false)
    , m_isShiftPressed(false) {
    LOG_INFO("KeyRemapper 初始化");
    m_mappingManager = std::make_unique<KeyMappingManager>();
    m_keyboardHook = std::make_unique<KeyboardHook>();
}

KeyRemapper::~KeyRemapper() {
    Stop();
    LOG_INFO("KeyRemapper 销毁");
}

bool KeyRemapper::Initialize() {
    LOG_INFO("KeyRemapper 初始化中...");

    // 设置键盘钩子回调
    m_keyboardHook->SetKeyCallback([this](const KeyEvent& event) {
        return ProcessKeyEvent(event);
    });

    LOG_INFO("KeyRemapper 初始化完成");
    return true;
}

bool KeyRemapper::Start() {
    std::lock_guard<std::mutex> lock(m_remapperMutex);

    if (m_isRunning) {
        LOG_WARNING("KeyRemapper 已在运行");
        return true;
    }

    // 安装键盘钩子
    if (!m_keyboardHook->Install()) {
        LOG_ERROR("安装键盘钩子失败");
        return false;
    }

    m_isRunning = true;
    m_isPaused = false;
    LOG_INFO("KeyRemapper 已启动");
    return true;
}

bool KeyRemapper::Stop() {
    std::lock_guard<std::mutex> lock(m_remapperMutex);

    if (!m_isRunning) {
        return true;
    }

    // 卸载键盘钩子
    m_keyboardHook->Uninstall();

    m_isRunning = false;
    m_isPaused = false;
    LOG_INFO("KeyRemapper 已停止");
    return true;
}

void KeyRemapper::Pause() {
    std::lock_guard<std::mutex> lock(m_remapperMutex);
    m_isPaused = true;
    LOG_INFO("KeyRemapper 已暂停");
}

void KeyRemapper::Resume() {
    std::lock_guard<std::mutex> lock(m_remapperMutex);
    m_isPaused = false;
    LOG_INFO("KeyRemapper 已恢复");
}

bool KeyRemapper::IsRunning() const {
    return m_isRunning;
}

bool KeyRemapper::IsPaused() const {
    return m_isPaused;
}

void KeyRemapper::SetTargetWindow(HWND hwnd) {
    m_targetWindow = hwnd;
}

HWND KeyRemapper::GetTargetWindow() const {
    return m_targetWindow;
}

void KeyRemapper::SetMappingManager(std::unique_ptr<KeyMappingManager> manager) {
    m_mappingManager = std::move(manager);
}

KeyMappingManager* KeyRemapper::GetMappingManager() const {
    return m_mappingManager.get();
}

bool KeyRemapper::ProcessKeyEvent(const KeyEvent& event) {
    // 如果暂停，不处理
    if (m_isPaused) {
        return false;
    }

    // 更新修饰键状态
    UpdateModifierState(event);

    // 检查是否为目标窗口
    if (m_targetWindow) {
        HWND foregroundWindow = GetForegroundWindow();
        if (foregroundWindow != m_targetWindow) {
            return false;
        }
    }

    // 应用映射
    KeyEvent mappedEvent = ApplyMapping(event);

    // 如果有映射，发送映射后的按键
    if (mappedEvent.virtualKey != event.virtualKey) {
        // 发送修饰键（如果需要）
        if (event.isCtrlPressed) {
            KeyboardHook::SendModifierKey(VK_CONTROL, true);
        }
        if (event.isAltPressed) {
            KeyboardHook::SendModifierKey(VK_MENU, true);
        }
        if (event.isShiftPressed) {
            KeyboardHook::SendModifierKey(VK_SHIFT, true);
        }

        // 发送映射后的按键
        KeyboardHook::SendKeyEvent(mappedEvent.virtualKey, event.isKeyDown, mappedEvent.isExtended);

        // 释放修饰键
        if (event.isShiftPressed) {
            KeyboardHook::SendModifierKey(VK_SHIFT, false);
        }
        if (event.isAltPressed) {
            KeyboardHook::SendModifierKey(VK_MENU, false);
        }
        if (event.isCtrlPressed) {
            KeyboardHook::SendModifierKey(VK_CONTROL, false);
        }

        return true; // 阻止原始按键
    }

    return false; // 放行原始按键
}

KeyEvent KeyRemapper::ApplyMapping(const KeyEvent& input) {
    KeyEvent output = input;

    // 查找物品栏映射
    if (m_mappingManager) {
        const KeyMapping* mapping = m_mappingManager->FindMapping(input.virtualKey, KeyType::ITEM);
        if (mapping && ShouldApplyMapping(*mapping)) {
            output.virtualKey = mapping->mappedVirtualKey;
            output.isExtended = (mapping->mappedVirtualKey & 0x1000000) != 0;
            return output;
        }

        // 查找英雄技能映射
        mapping = m_mappingManager->FindMapping(input.virtualKey, KeyType::HERO_SKILL);
        if (mapping && ShouldApplyMapping(*mapping)) {
            output.virtualKey = mapping->mappedVirtualKey;
            output.isExtended = (mapping->mappedVirtualKey & 0x1000000) != 0;
            return output;
        }

        // 查找单位技能映射
        mapping = m_mappingManager->FindMapping(input.virtualKey, KeyType::UNIT_SKILL);
        if (mapping && ShouldApplyMapping(*mapping)) {
            output.virtualKey = mapping->mappedVirtualKey;
            output.isExtended = (mapping->mappedVirtualKey & 0x1000000) != 0;
            return output;
        }
    }

    return output;
}

void KeyRemapper::SendMappedKey(const KeyMapping& mapping, bool isKeyDown) {
    KeyboardHook::SendKeyEvent(mapping.mappedVirtualKey, isKeyDown);
}

bool KeyRemapper::ShouldApplyMapping(const KeyMapping& mapping) const {
    // 检查映射是否启用
    if (!mapping.isEnabled) {
        return false;
    }

    // 检查修饰键状态
    // 这里可以添加更复杂的修饰键逻辑

    return true;
}

void KeyRemapper::UpdateModifierState(const KeyEvent& event) {
    if (event.virtualKey == VK_CONTROL) {
        m_isCtrlPressed = event.isKeyDown;
    } else if (event.virtualKey == VK_MENU) {
        m_isAltPressed = event.isKeyDown;
    } else if (event.virtualKey == VK_SHIFT) {
        m_isShiftPressed = event.isKeyDown;
    }
}

void KeyRemapper::EnableMappings(KeyType type, bool enable) {
    if (!m_mappingManager) {
        return;
    }

    auto mappings = m_mappingManager->GetMappings(type);
    for (const auto& mapping : mappings) {
        m_mappingManager->EnableMapping(type, mapping.position, enable);
    }
}

void KeyRemapper::EnableAllMappings(bool enable) {
    EnableMappings(KeyType::ITEM, enable);
    EnableMappings(KeyType::HERO_SKILL, enable);
    EnableMappings(KeyType::UNIT_SKILL, enable);
}
