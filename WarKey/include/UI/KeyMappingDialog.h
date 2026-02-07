#pragma once

#include "Common.h"
#include <string>

// 按键映射对话框类
class KeyMappingDialog {
private:
    HWND m_hwnd;                              // 对话框句柄
    HWND m_comboOriginalKey;                  // 原始按键下拉框
    HWND m_comboMappedKey;                    // 映射按键下拉框
    HWND m_chkEnabled;                        // 启用复选框
    HWND m_comboKeyType;                      // 按键类型下拉框
    HWND m_spinPosition;                      // 位置微调框

    KeyMapping m_mapping;                     // 当前映射
    bool m_isEditMode;                        // 是否为编辑模式

public:
    KeyMappingDialog();
    ~KeyMappingDialog();

    // 创建对话框
    HWND Create(HWND hParent, KeyType type = KeyType::UNKNOWN, int position = -1);

    // 编辑现有映射
    HWND Edit(HWND hParent, const KeyMapping& mapping);

    // 获取映射结果
    KeyMapping GetMapping() const;

    // 检查是否已确认
    bool IsConfirmed() const;

private:
    // 对话框过程
    static INT_PTR CALLBACK DialogProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

    // 实例对话框过程
    INT_PTR HandleMessage(UINT uMsg, WPARAM wParam, LPARAM lParam);

    // 初始化对话框
    void OnInitDialog();

    // 处理命令
    void OnCommand(WPARAM wParam, LPARAM lParam);

    // 确定按钮
    void OnOK();

    // 取消按钮
    void OnCancel();

    // 填充按键下拉框
    void PopulateKeyComboBoxes();

    // 填充类型下拉框
    void PopulateTypeComboBox();

    // 验证输入
    bool ValidateInput();

    // 设置映射数据到控件
    void SetMappingToControls(const KeyMapping& mapping);

    // 从控件获取映射数据
    void GetMappingFromControls();
};

// 消息映射对话框类
class KeyPressDialog {
private:
    HWND m_hwnd;                              // 对话框句柄
    std::string m_pressedKey;                 // 按下的键
    bool m_captureActive;                     // 是否正在捕获
    bool m_isConfirmed;                       // 是否已确认

public:
    KeyPressDialog();
    ~KeyPressDialog();

    // 创建对话框
    std::string Show(HWND hParent);

private:
    // 对话框过程
    static INT_PTR CALLBACK DialogProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

    // 实例对话框过程
    INT_PTR HandleMessage(UINT uMsg, WPARAM wParam, LPARAM lParam);

    // 初始化对话框
    void OnInitDialog();

    // 处理键盘输入
    void OnKeyDown(WPARAM wParam, LPARAM lParam);

    // 确定按钮
    void OnOK();

    // 取消按钮
    void OnCancel();

    // 获取按键名称
    std::string GetKeyName(WPARAM wParam, LPARAM lParam);
};
