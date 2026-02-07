#include "UI/KeyMappingDialog.h"
#include "Common.h"
#include <Windows.h>
#include <string>

KeyMappingDialog::KeyMappingDialog()
    : m_hwnd(nullptr)
    , m_isEditMode(false) {
}

KeyMappingDialog::~KeyMappingDialog() {
}

HWND KeyMappingDialog::Create(HWND hParent, KeyType type, int position) {
    m_isEditMode = false;
    m_mapping.type = type;
    m_mapping.position = position;

    HWND hwnd = CreateDialogParamW(
        nullptr,
        MAKEINTRESOURCEW(100),  // 需要定义对话框模板
        hParent,
        DialogProc,
        (LPARAM)this
    );

    return hwnd;
}

HWND KeyMappingDialog::Edit(HWND hParent, const KeyMapping& mapping) {
    m_isEditMode = true;
    m_mapping = mapping;

    HWND hwnd = CreateDialogParamW(
        nullptr,
        MAKEINTRESOURCEW(100),
        hParent,
        DialogProc,
        (LPARAM)this
    );

    return hwnd;
}

KeyMapping KeyMappingDialog::GetMapping() const {
    return m_mapping;
}

bool KeyMappingDialog::IsConfirmed() const {
    return m_isConfirmed;
}

INT_PTR CALLBACK KeyMappingDialog::DialogProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    KeyMappingDialog* dialog = nullptr;

    if (uMsg == WM_INITDIALOG) {
        dialog = reinterpret_cast<KeyMappingDialog*>(lParam);
        SetWindowLongPtr(hwnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(dialog));
    } else {
        dialog = reinterpret_cast<KeyMappingDialog*>(GetWindowLongPtr(hwnd, GWLP_USERDATA));
    }

    if (dialog) {
        return dialog->HandleMessage(uMsg, wParam, lParam);
    }

    return FALSE;
}

INT_PTR KeyMappingDialog::HandleMessage(UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_INITDIALOG:
            OnInitDialog();
            return TRUE;

        case WM_COMMAND:
            OnCommand(wParam, lParam);
            return TRUE;
    }

    return FALSE;
}

void KeyMappingDialog::OnInitDialog() {
    // 填充下拉框
    PopulateKeyComboBoxes();
    PopulateTypeComboBox();

    // 如果是编辑模式，设置现有值
    if (m_isEditMode) {
        SetMappingToControls(m_mapping);
    }
}

void KeyMappingDialog::OnCommand(WPARAM wParam, LPARAM lParam) {
    WORD id = LOWORD(wParam);

    if (id == IDOK) {
        OnOK();
    } else if (id == IDCANCEL) {
        OnCancel();
    }
}

void KeyMappingDialog::OnOK() {
    if (ValidateInput()) {
        GetMappingFromControls();
        m_isConfirmed = true;
        EndDialog(m_hwnd, IDOK);
    }
}

void KeyMappingDialog::OnCancel() {
    m_isConfirmed = false;
    EndDialog(m_hwnd, IDCANCEL);
}

void KeyMappingDialog::PopulateKeyComboBoxes() {
    const char* keys[] = {
        "1", "2", "3", "4", "5", "6",
        "Q", "W", "E", "R", "T", "Y",
        "A", "S", "D", "F", "G", "H",
        "Z", "X", "C", "V",
        "F1", "F2", "F3", "F4", "F5", "F6",
        "F7", "F8", "F9", "F10", "F11", "F12",
        "Space", "Enter", "Escape", "Tab",
        "Ctrl", "Alt", "Shift"
    };

    for (const auto& key : keys) {
        SendMessageA(m_comboOriginalKey, CB_ADDSTRING, 0, (LPARAM)key);
        SendMessageA(m_comboMappedKey, CB_ADDSTRING, 0, (LPARAM)key);
    }
}

void KeyMappingDialog::PopulateTypeComboBox() {
    const char* types[] = {"物品栏", "英雄技能", "单位技能"};

    for (const auto& type : types) {
        SendMessageA(m_comboKeyType, CB_ADDSTRING, 0, (LPARAM)type);
    }
}

bool KeyMappingDialog::ValidateInput() {
    char original[256] = {0};
    char mapped[256] = {0};

    SendMessageA(m_comboOriginalKey, WM_GETTEXT, sizeof(original), (LPARAM)original);
    SendMessageA(m_comboMappedKey, WM_GETTEXT, sizeof(mapped), (LPARAM)mapped);

    if (strlen(original) == 0 || strlen(mapped) == 0) {
        MessageBoxW(m_hwnd, L"请选择按键", L"错误", MB_OK | MB_ICONERROR);
        return false;
    }

    return true;
}

void KeyMappingDialog::SetMappingToControls(const KeyMapping& mapping) {
    SendMessageA(m_comboOriginalKey, CB_SELECTSTRING, -1, (LPARAM)mapping.originalKey.c_str());
    SendMessageA(m_comboMappedKey, CB_SELECTSTRING, -1, (LPARAM)mapping.mappedKey.c_str());
    SendMessage(m_chkEnabled, BM_SETCHECK, mapping.isEnabled ? BST_CHECKED : BST_UNCHECKED, 0);
}

void KeyMappingDialog::GetMappingFromControls() {
    char original[256] = {0};
    char mapped[256] = {0};

    SendMessageA(m_comboOriginalKey, WM_GETTEXT, sizeof(original), (LPARAM)original);
    SendMessageA(m_comboMappedKey, WM_GETTEXT, sizeof(mapped), (LPARAM)mapped);

    m_mapping.originalKey = original;
    m_mapping.mappedKey = mapped;
    m_mapping.isEnabled = (SendMessage(m_chkEnabled, BM_GETCHECK, 0, 0) == BST_CHECKED);
}

// KeyPressDialog 实现
KeyPressDialog::KeyPressDialog()
    : m_captureActive(false)
    , m_isConfirmed(false) {
}

KeyPressDialog::~KeyPressDialog() {
}

std::string KeyPressDialog::Show(HWND hParent) {
    m_pressedKey.clear();
    m_captureActive = true;
    m_isConfirmed = false;

    DialogBoxParamW(
        nullptr,
        MAKEINTRESOURCEW(101),  // 需要定义对话框模板
        hParent,
        DialogProc,
        (LPARAM)this
    );

    return m_pressedKey;
}

INT_PTR CALLBACK KeyPressDialog::DialogProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    KeyPressDialog* dialog = nullptr;

    if (uMsg == WM_INITDIALOG) {
        dialog = reinterpret_cast<KeyPressDialog*>(lParam);
        SetWindowLongPtr(hwnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(dialog));
    } else {
        dialog = reinterpret_cast<KeyPressDialog*>(GetWindowLongPtr(hwnd, GWLP_USERDATA));
    }

    if (dialog) {
        return dialog->HandleMessage(uMsg, wParam, lParam);
    }

    return FALSE;
}

INT_PTR KeyPressDialog::HandleMessage(UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_INITDIALOG:
            OnInitDialog();
            return TRUE;

        case WM_KEYDOWN:
            OnKeyDown(wParam, lParam);
            return TRUE;

        case WM_COMMAND:
            if (LOWORD(wParam) == IDOK) {
                OnOK();
            } else if (LOWORD(wParam) == IDCANCEL) {
                OnCancel();
            }
            return TRUE;
    }

    return FALSE;
}

void KeyPressDialog::OnInitDialog() {
    // 设置提示文本
    SetWindowTextW(GetDlgItem(m_hwnd, IDC_STATIC), L"请按下要设置的按键...");
}

void KeyPressDialog::OnKeyDown(WPARAM wParam, LPARAM lParam) {
    if (!m_captureActive) return;

    m_pressedKey = GetKeyName(wParam, lParam);

    if (!m_pressedKey.empty()) {
        m_captureActive = false;
        m_isConfirmed = true;
        EndDialog(m_hwnd, IDOK);
    }
}

void KeyPressDialog::OnOK() {
    m_isConfirmed = true;
    EndDialog(m_hwnd, IDOK);
}

void KeyPressDialog::OnCancel() {
    m_pressedKey.clear();
    m_isConfirmed = false;
    EndDialog(m_hwnd, IDCANCEL);
}

std::string KeyPressDialog::GetKeyName(WPARAM wParam, LPARAM lParam) {
    char keyName[256] = {0};

    // 获取按键名称
    if (GetKeyNameTextA(lParam, keyName, sizeof(keyName)) > 0) {
        return std::string(keyName);
    }

    // 特殊按键处理
    switch (wParam) {
        case VK_SPACE: return "Space";
        case VK_RETURN: return "Enter";
        case VK_ESCAPE: return "Escape";
        case VK_TAB: return "Tab";
        case VK_BACK: return "Backspace";
        case VK_CONTROL: return "Ctrl";
        case VK_MENU: return "Alt";
        case VK_SHIFT: return "Shift";
        case VK_F1: return "F1";
        case VK_F2: return "F2";
        case VK_F3: return "F3";
        case VK_F4: return "F4";
        case VK_F5: return "F5";
        case VK_F6: return "F6";
        case VK_F7: return "F7";
        case VK_F8: return "F8";
        case VK_F9: return "F9";
        case VK_F10: return "F10";
        case VK_F11: return "F11";
        case VK_F12: return "F12";
        default:
            if (wParam >= '0' && wParam <= '9') {
                return std::string(1, static_cast<char>(wParam));
            }
            if (wParam >= 'A' && wParam <= 'Z') {
                return std::string(1, static_cast<char>(wParam));
            }
            return "";
    }
}
