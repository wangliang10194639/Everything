#pragma once

#include <windows.h>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <mutex>
#include <atomic>

// 项目版本信息
#define WARKEY_VERSION_MAJOR 1
#define WARKEY_VERSION_MINOR 0
#define WARKEY_VERSION_PATCH 0
#define WARKEY_VERSION_STRING "1.0.0"

// 魔兽争霸进程信息
#define WAR3_PROCESS_NAME L"war3.exe"
#define WAR3_WINDOW_CLASS L"Warcraft III"
#define WAR3_WINDOW_TITLE L"Warcraft III"

// 最大映射数量
#define MAX_ITEM_SLOTS 6
#define MAX_HERO_SKILLS 6
#define MAX_UNIT_SKILLS 10

// 按键类型枚举
enum class KeyType {
    ITEM,           // 物品栏按键
    HERO_SKILL,     // 英雄技能
    UNIT_SKILL,     // 单位技能
    UNKNOWN         // 未知类型
};

// 按键事件结构
struct KeyEvent {
    WPARAM wParam;          // 按键消息类型
    LPARAM lParam;          // 按键详细信息
    DWORD virtualKey;       // 虚拟键码
    DWORD scanCode;         // 扫描码
    bool isExtended;        // 是否为扩展键
    bool isAltPressed;      // Alt键状态
    bool isCtrlPressed;     // Ctrl键状态
    bool isShiftPressed;    // Shift键状态
    bool isKeyDown;         // 是否按下
    DWORD timestamp;        // 时间戳
    
    KeyEvent() : wParam(0), lParam(0), virtualKey(0), scanCode(0), 
                  isExtended(false), isAltPressed(false), isCtrlPressed(false), 
                  isShiftPressed(false), isKeyDown(false), timestamp(0) {}
};

// 按键映射结构
struct KeyMapping {
    std::string originalKey;      // 原始按键名称
    std::string mappedKey;        // 映射后的按键名称
    KeyType type;                 // 按键类型
    int position;                 // 位置索引
    bool isEnabled;               // 是否启用
    DWORD originalVirtualKey;     // 原始虚拟键码
    DWORD mappedVirtualKey;       // 映射虚拟键码
    
    KeyMapping() : type(KeyType::UNKNOWN), position(-1), isEnabled(false), 
                   originalVirtualKey(0), mappedVirtualKey(0) {}
};

// 配置结构
struct KeyConfig {
    std::string configName;                           // 配置名称
    std::string version;                              // 配置版本
    std::vector<KeyMapping> itemMappings;            // 物品栏映射
    std::vector<KeyMapping> heroSkillMappings;        // 英雄技能映射
    std::vector<KeyMapping> unitSkillMappings;        // 单位技能映射
    bool useModifierKey;                              // 是否使用修饰键
    std::string modifierKey;                          // 修饰键
    bool autoStart;                                    // 自动启动
    bool showNotifications;                            // 显示通知
    std::string gameProcess;                          // 游戏进程名
    
    KeyConfig() : useModifierKey(false), autoStart(false), 
                  showNotifications(true), gameProcess("war3.exe") {}
};

// 应用程序状态
enum class AppState {
    STOPPED,        // 已停止
    STARTING,       // 正在启动
    RUNNING,        // 正在运行
    STOPPING,       // 正在停止
    ERROR           // 错误状态
};

// 日志级别
enum class LogLevel {
    DEBUG,
    INFO,
    WARNING,
    ERROR
};

// 常用工具函数
namespace WarKeyUtils {
    // 字符串转换
    std::string WCharToString(const std::wstring& wstr);
    std::wstring StringToWChar(const std::string& str);
    
    // 按键名称转换
    std::string VirtualKeyToString(DWORD virtualKey);
    DWORD StringToVirtualKey(const std::string& keyName);
    
    // 按键类型转换
    std::string KeyTypeToString(KeyType type);
    KeyType StringToKeyType(const std::string& typeStr);
    
    // 获取当前时间戳
    DWORD GetCurrentTimestamp();
    
    // 检查文件是否存在
    bool FileExists(const std::string& filename);
    bool FileExists(const std::wstring& filename);
    
    // 创建目录
    bool CreateDirectory(const std::string& path);
    bool CreateDirectory(const std::wstring& path);
    
    // 获取可执行文件路径
    std::string GetExecutablePath();
    std::wstring GetExecutablePathW();
}

// 全局变量声明
extern std::atomic<AppState> g_appState;
extern std::mutex g_configMutex;
extern std::mutex g_logMutex;