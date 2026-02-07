#pragma once

#include "Common.h"
#include <string>
#include <memory>
#include <functional>

// 前向声明
class ConfigManager;
class KeyRemapper;
class ProcessDetector;

// 主窗口类
class MainWindow {
private:
    HWND m_hwnd;                              // 窗口句柄
    HWND m_comboConfig;                       // 配置选择下拉框
    HWND m_btnNew;                            // 新建按钮
    HWND m_btnImport;                         // 导入按钮
    HWND m_btnExport;                         // 导出按钮
    HWND m_btnSave;                           // 保存按钮
    HWND m_btnApply;                          // 应用按钮
    HWND m_btnReset;                          // 重置按钮
    HWND m_chkEnable;                         // 启用改键复选框
    HWND m_chkAutoStart;                      // 自动启动复选框
    HWND m_statusText;                        // 状态文本
    HWND m_tabControl;                        // Tab控件

    // 物品栏控件
    std::vector<HWND> m_itemOriginalCombo;   // 原始按键下拉框
    std::vector<HWND> m_itemMappedCombo;     // 映射按键下拉框
    std::vector<HWND> m_itemEnableCheck;     // 启用复选框

    // 技能控件
    std::vector<HWND> m_skillOriginalCombo;  // 原始技能下拉框
    std::vector<HWND> m_skillMappedCombo;    // 映射按键下拉框
    std::vector<HWND> m_skillEnableCheck;    // 启用复选框

    std::unique_ptr<ConfigManager> m_configManager;   // 配置管理器
    std::unique_ptr<KeyRemapper> m_keyRemapper;       // 按键重映射器
    std::unique_ptr<ProcessDetector> m_processDetector; // 进程检测器

    bool m_isInitialized;                     // 是否已初始化
    std::mutex m_windowMutex;                 // 窗口互斥锁

    // 回调函数类型
    using StatusUpdateCallback = std::function<void(const std::string& status)>;
    StatusUpdateCallback m_statusCallback;

public:
    MainWindow();
    ~MainWindow();

    // 创建窗口
    bool Create(HINSTANCE hInstance, int nCmdShow);

    // 显示窗口
    void Show(int nCmdShow);

    // 隐藏窗口
    void Hide();

    // 关闭窗口
    void Close();

    // 消息循环
    int MessageLoop();

    // 更新界面
    void UpdateUI();

    // 更新状态栏
    void UpdateStatus(const std::string& status);

    // 刷新配置列表
    void RefreshConfigList();

    // 应用当前配置
    void ApplyConfig();

    // 保存当前配置
    void SaveConfig();

    // 重置为默认配置
    void ResetConfig();

    // 设置状态更新回调
    void SetStatusCallback(StatusUpdateCallback callback);

    // 获取配置管理器
    ConfigManager* GetConfigManager() const;

    // 获取按键重映射器
    KeyRemapper* GetKeyRemapper() const;

    // 获取进程检测器
    ProcessDetector* GetProcessDetector() const;

private:
    // 初始化窗口类
    bool InitWindowClass(HINSTANCE hInstance);

    // 创建控件
    bool CreateControls();

    // 创建菜单
    HMENU CreateMenu();

    // 窗口过程
    static LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

    // 实例窗口过程
    LRESULT HandleMessage(UINT uMsg, WPARAM wParam, LPARAM lParam);

    // 处理命令
    void HandleCommand(WPARAM wParam, LPARAM lParam);

    // 处理通知
    void HandleNotify(WPARAM wParam, LPARAM lParam);

    // 创建物品栏设置控件
    void CreateItemSettings();

    // 创建技能设置控件
    void CreateSkillSettings();

    // 填充按键下拉框
    void PopulateKeyComboBox(HWND hCombo, const std::string& selectedKey = "");

    // 填充技能下拉框
    void PopulateSkillComboBox(HWND hCombo, const std::string& selectedSkill = "");

    // 更新物品栏设置
    void UpdateItemSettings();

    // 更新技能设置
    void UpdateSkillSettings();

    // 获取物品栏设置
    void GetItemSettings(KeyConfig& config);

    // 获取技能设置
    void GetSkillSettings(KeyConfig& config);

    // 显示托盘图标
    bool ShowTrayIcon(HINSTANCE hInstance);

    // 隐藏托盘图标
    void HideTrayIcon();

    // 托盘消息处理
    void HandleTrayMessage(WPARAM wParam, LPARAM lParam);
};
