#include "UI/MainWindow.h"
#include "ConfigManager.h"
#include "KeyRemapper.h"
#include "ProcessDetector.h"
#include "Logger.h"
#include <CommCtrl.h>

// 窗口类名
static const wchar_t WINDOW_CLASS_NAME[] = L"WarKeyWindow";
static const wchar_t WINDOW_TITLE[] = L"魔兽争霸改键助手 v1.0";

// 控件ID
enum {
    IDC_COMBO_CONFIG = 1001,
    IDC_BTN_NEW,
    IDC_BTN_IMPORT,
    IDC_BTN_EXPORT,
    IDC_BTN_SAVE,
    IDC_BTN_APPLY,
    IDC_BTN_RESET,
    IDC_CHK_ENABLE,
    IDC_CHK_AUTOSTART,
    IDC_TAB_CONTROL,
    IDC_STATUS_TEXT,
    // 物品栏控件起始ID
    IDC_ITEM_FIRST = 2000,
    // 技能控件起始ID
    IDC_SKILL_FIRST = 3000
};

MainWindow::MainWindow()
    : m_hwnd(nullptr)
    , m_isInitialized(false) {
    LOG_INFO("MainWindow 初始化");
}

MainWindow::~MainWindow() {
    LOG_INFO("MainWindow 销毁");
}

bool MainWindow::Create(HINSTANCE hInstance, int nCmdShow) {
    LOG_INFO("MainWindow 创建中...");

    // 初始化窗口类
    if (!InitWindowClass(hInstance)) {
        LOG_ERROR("初始化窗口类失败");
        return false;
    }

    // 创建窗口
    m_hwnd = CreateWindowExW(
        0,
        WINDOW_CLASS_NAME,
        WINDOW_TITLE,
        WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN,
        CW_USEDEFAULT, CW_USEDEFAULT,
        800, 600,
        nullptr,
        nullptr,
        hInstance,
        this
    );

    if (!m_hwnd) {
        LOG_ERROR("创建窗口失败");
        return false;
    }

    // 创建控件
    if (!CreateControls()) {
        LOG_ERROR("创建控件失败");
        return false;
    }

    m_isInitialized = true;
    LOG_INFO("MainWindow 创建成功");
    return true;
}

bool MainWindow::InitWindowClass(HINSTANCE hInstance) {
    WNDCLASSEXW wc = {0};
    wc.cbSize = sizeof(WNDCLASSEXW);
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = WINDOW_CLASS_NAME;
    wc.hIcon = LoadIcon(nullptr, IDI_APPLICATION);
    wc.hIconSm = LoadIcon(nullptr, IDI_APPLICATION);

    return RegisterClassExW(&wc) != 0;
}

bool MainWindow::CreateControls() {
    // 配置选择下拉框
    m_comboConfig = CreateWindowW(
        L"COMBOBOX", nullptr,
        CBS_DROPDOWNLIST | WS_CHILD | WS_VISIBLE,
        10, 10, 200, 200,
        m_hwnd, (HMENU)IDC_COMBO_CONFIG,
        (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE),
        nullptr
    );

    // 按钮
    m_btnNew = CreateWindowW(L"BUTTON", L"新建",
        WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
        220, 10, 60, 25, m_hwnd, (HMENU)IDC_BTN_NEW,
        (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

    m_btnImport = CreateWindowW(L"BUTTON", L"导入",
        WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
        290, 10, 60, 25, m_hwnd, (HMENU)IDC_BTN_IMPORT,
        (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

    m_btnExport = CreateWindowW(L"BUTTON", L"导出",
        WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
        360, 10, 60, 25, m_hwnd, (HMENU)IDC_BTN_EXPORT,
        (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

    m_btnSave = CreateWindowW(L"BUTTON", L"保存",
        WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
        430, 10, 60, 25, m_hwnd, (HMENU)IDC_BTN_SAVE,
        (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

    m_btnApply = CreateWindowW(L"BUTTON", L"应用",
        WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
        500, 10, 60, 25, m_hwnd, (HMENU)IDC_BTN_APPLY,
        (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

    m_btnReset = CreateWindowW(L"BUTTON", L"重置",
        WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
        570, 10, 60, 25, m_hwnd, (HMENU)IDC_BTN_RESET,
        (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

    // 启用复选框
    m_chkEnable = CreateWindowW(L"BUTTON", L"启用改键",
        WS_CHILD | WS_VISIBLE | BS_AUTOCHECKBOX,
        640, 10, 100, 25, m_hwnd, (HMENU)IDC_CHK_ENABLE,
        (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

    // 状态文本
    m_statusText = CreateWindowW(L"STATIC", L"就绪",
        WS_CHILD | WS_VISIBLE | SS_LEFT,
        10, 50, 760, 20, m_hwnd, nullptr,
        (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

    // 创建物品栏设置
    CreateItemSettings();

    // 创建技能设置
    CreateSkillSettings();

    return true;
}

void MainWindow::CreateItemSettings() {
    const wchar_t* itemLabels[] = {L"物品1", L"物品2", L"物品3", L"物品4", L"物品5", L"物品6"};

    for (int i = 0; i < 6; i++) {
        int y = 80 + i * 35;

        // 标签
        CreateWindowW(L"STATIC", itemLabels[i],
            WS_CHILD | WS_VISIBLE | SS_LEFT,
            10, y + 3, 50, 20, m_hwnd, nullptr,
            (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

        // 原始按键下拉框
        m_itemOriginalCombo.push_back(CreateWindowW(
            L"COMBOBOX", nullptr,
            CBS_DROPDOWNLIST | WS_CHILD | WS_VISIBLE,
            70, y, 80, 200, m_hwnd, (HMENU)(IDC_ITEM_FIRST + i * 3),
            (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr));

        // 箭头标签
        CreateWindowW(L"STATIC", L"→",
            WS_CHILD | WS_VISIBLE | SS_CENTER,
            160, y + 3, 20, 20, m_hwnd, nullptr,
            (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

        // 映射按键下拉框
        m_itemMappedCombo.push_back(CreateWindowW(
            L"COMBOBOX", nullptr,
            CBS_DROPDOWNLIST | WS_CHILD | WS_VISIBLE,
            190, y, 80, 200, m_hwnd, (HMENU)(IDC_ITEM_FIRST + i * 3 + 1),
            (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr));

        // 启用复选框
        m_itemEnableCheck.push_back(CreateWindowW(L"BUTTON", L"启用",
            WS_CHILD | WS_VISIBLE | BS_AUTOCHECKBOX,
            280, y + 3, 60, 20, m_hwnd, (HMENU)(IDC_ITEM_FIRST + i * 3 + 2),
            (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr));
    }
}

void MainWindow::CreateSkillSettings() {
    const wchar_t* skillLabels[] = {L"技能Q", L"技能W", L"技能E", L"技能R"};

    for (int i = 0; i < 4; i++) {
        int y = 300 + i * 35;

        // 标签
        CreateWindowW(L"STATIC", skillLabels[i],
            WS_CHILD | WS_VISIBLE | SS_LEFT,
            10, y + 3, 50, 20, m_hwnd, nullptr,
            (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

        // 原始技能下拉框
        m_skillOriginalCombo.push_back(CreateWindowW(
            L"COMBOBOX", nullptr,
            CBS_DROPDOWNLIST | WS_CHILD | WS_VISIBLE,
            70, y, 80, 200, m_hwnd, (HMENU)(IDC_SKILL_FIRST + i * 3),
            (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr));

        // 箭头标签
        CreateWindowW(L"STATIC", L"→",
            WS_CHILD | WS_VISIBLE | SS_CENTER,
            160, y + 3, 20, 20, m_hwnd, nullptr,
            (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr);

        // 映射按键下拉框
        m_skillMappedCombo.push_back(CreateWindowW(
            L"COMBOBOX", nullptr,
            CBS_DROPDOWNLIST | WS_CHILD | WS_VISIBLE,
            190, y, 80, 200, m_hwnd, (HMENU)(IDC_SKILL_FIRST + i * 3 + 1),
            (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr));

        // 启用复选框
        m_skillEnableCheck.push_back(CreateWindowW(L"BUTTON", L"启用",
            WS_CHILD | WS_VISIBLE | BS_AUTOCHECKBOX,
            280, y + 3, 60, 20, m_hwnd, (HMENU)(IDC_SKILL_FIRST + i * 3 + 2),
            (HINSTANCE)GetWindowLongPtr(m_hwnd, GWLP_HINSTANCE), nullptr));
    }
}

void MainWindow::Show(int nCmdShow) {
    ShowWindow(m_hwnd, nCmdShow);
    UpdateWindow(m_hwnd);
}

void MainWindow::Hide() {
    ShowWindow(m_hwnd, SW_HIDE);
}

void MainWindow::Close() {
    PostMessage(m_hwnd, WM_CLOSE, 0, 0);
}

int MainWindow::MessageLoop() {
    MSG msg;
    while (GetMessage(&msg, nullptr, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
    return (int)msg.wParam;
}

void MainWindow::UpdateUI() {
    RefreshConfigList();
}

void MainWindow::UpdateStatus(const std::string& status) {
    SetWindowTextA(m_statusText, status.c_str());
}

void MainWindow::RefreshConfigList() {
    // 清空下拉框
    SendMessage(m_comboConfig, CB_RESETCONTENT, 0, 0);

    // 获取配置列表
    auto configNames = m_configManager->GetAllConfigNames();
    for (const auto& name : configNames) {
        SendMessageA(m_comboConfig, CB_ADDSTRING, 0, (LPARAM)name.c_str());
    }

    // 设置当前配置
    SendMessage(m_comboConfig, CB_SETCURSEL, 0, 0);
}

void MainWindow::ApplyConfig() {
    KeyConfig* config = m_configManager->GetCurrentConfig();
    if (config) {
        m_keyRemapper->GetMappingManager()->ImportFromConfig(*config);
        m_keyRemapper->Start();
        UpdateStatus("配置已应用");
    }
}

void MainWindow::SaveConfig() {
    KeyConfig config;
    GetItemSettings(config);
    GetSkillSettings(config);

    if (m_configManager->SaveConfig(config)) {
        UpdateStatus("配置已保存");
    } else {
        UpdateStatus("保存配置失败");
    }
}

void MainWindow::ResetConfig() {
    KeyConfig defaultConfig = m_configManager->CreateDefaultConfig("Default");
    m_configManager->SaveConfig(defaultConfig);
    RefreshConfigList();
    UpdateStatus("已重置为默认配置");
}

void MainWindow::PopulateKeyComboBox(HWND hCombo, const std::string& selectedKey) {
    const char* keys[] = {"1", "2", "3", "4", "5", "6",
        "Q", "W", "E", "R", "T", "Y",
        "A", "S", "D", "F", "G", "H",
        "Z", "X", "C", "V",
        "F1", "F2", "F3", "F4", "F5", "F6",
        "Space", "Enter", "Escape"};

    for (const auto& key : keys) {
        SendMessageA(hCombo, CB_ADDSTRING, 0, (LPARAM)key);
    }

    if (!selectedKey.empty()) {
        SendMessageA(hCombo, CB_SELECTSTRING, -1, (LPARAM)selectedKey.c_str());
    }
}

void MainWindow::PopulateSkillComboBox(HWND hCombo, const std::string& selectedSkill) {
    const char* skills[] = {"Q", "W", "E", "R", "T", "Y",
        "1", "2", "3", "4", "5", "6",
        "A", "S", "D", "F"};

    for (const auto& skill : skills) {
        SendMessageA(hCombo, CB_ADDSTRING, 0, (LPARAM)skill);
    }

    if (!selectedSkill.empty()) {
        SendMessageA(hCombo, CB_SELECTSTRING, -1, (LPARAM)selectedSkill.c_str());
    }
}

void MainWindow::GetItemSettings(KeyConfig& config) {
    config.itemMappings.clear();

    for (int i = 0; i < 6; i++) {
        char original[256] = {0};
        char mapped[256] = {0};

        SendMessageA(m_itemOriginalCombo[i], WM_GETTEXT, sizeof(original), (LPARAM)original);
        SendMessageA(m_itemMappedCombo[i], WM_GETTEXT, sizeof(mapped), (LPARAM)mapped);

        KeyMapping mapping;
        mapping.type = KeyType::ITEM;
        mapping.position = i;
        mapping.originalKey = original;
        mapping.mappedKey = mapped;
        mapping.isEnabled = (SendMessage(m_itemEnableCheck[i], BM_GETCHECK, 0, 0) == BST_CHECKED);

        config.itemMappings.push_back(mapping);
    }
}

void MainWindow::GetSkillSettings(KeyConfig& config) {
    config.heroSkillMappings.clear();

    for (int i = 0; i < 4; i++) {
        char original[256] = {0};
        char mapped[256] = {0};

        SendMessageA(m_skillOriginalCombo[i], WM_GETTEXT, sizeof(original), (LPARAM)original);
        SendMessageA(m_skillMappedCombo[i], WM_GETTEXT, sizeof(mapped), (LPARAM)mapped);

        KeyMapping mapping;
        mapping.type = KeyType::HERO_SKILL;
        mapping.position = i;
        mapping.originalKey = original;
        mapping.mappedKey = mapped;
        mapping.isEnabled = (SendMessage(m_skillEnableCheck[i], BM_GETCHECK, 0, 0) == BST_CHECKED);

        config.heroSkillMappings.push_back(mapping);
    }
}

LRESULT CALLBACK MainWindow::WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    MainWindow* window = nullptr;

    if (uMsg == WM_NCCREATE) {
        CREATESTRUCT* cs = reinterpret_cast<CREATESTRUCT*>(lParam);
        window = reinterpret_cast<MainWindow*>(cs->lpCreateParams);
        SetWindowLongPtr(hwnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(window));
    } else {
        window = reinterpret_cast<MainWindow*>(GetWindowLongPtr(hwnd, GWLP_USERDATA));
    }

    if (window) {
        return window->HandleMessage(uMsg, wParam, lParam);
    }

    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

LRESULT MainWindow::HandleMessage(UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_DESTROY:
            PostQuitMessage(0);
            return 0;

        case WM_COMMAND:
            HandleCommand(wParam, lParam);
            return 0;

        case WM_NOTIFY:
            HandleNotify(wParam, lParam);
            return 0;
    }

    return DefWindowProc(m_hwnd, uMsg, wParam, lParam);
}

void MainWindow::HandleCommand(WPARAM wParam, LPARAM lParam) {
    WORD id = LOWORD(wParam);

    switch (id) {
        case IDC_BTN_NEW:
            UpdateStatus("新建配置");
            break;

        case IDC_BTN_IMPORT:
            UpdateStatus("导入配置");
            break;

        case IDC_BTN_EXPORT:
            UpdateStatus("导出配置");
            break;

        case IDC_BTN_SAVE:
            SaveConfig();
            break;

        case IDC_BTN_APPLY:
            ApplyConfig();
            break;

        case IDC_BTN_RESET:
            ResetConfig();
            break;

        case IDC_CHK_ENABLE:
            if (HIWORD(wParam) == BN_CLICKED) {
                bool enabled = (SendMessage(m_chkEnable, BM_GETCHECK, 0, 0) == BST_CHECKED);
                m_keyRemapper->EnableAllMappings(enabled);
            }
            break;
    }
}

void MainWindow::HandleNotify(WPARAM wParam, LPARAM lParam) {
    // 处理通知消息
}

ConfigManager* MainWindow::GetConfigManager() const {
    return m_configManager.get();
}

KeyRemapper* MainWindow::GetKeyRemapper() const {
    return m_keyRemapper.get();
}

ProcessDetector* MainWindow::GetProcessDetector() const {
    return m_processDetector.get();
}

void MainWindow::SetStatusCallback(StatusUpdateCallback callback) {
    m_statusCallback = callback;
}
