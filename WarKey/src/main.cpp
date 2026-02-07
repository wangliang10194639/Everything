#include "Common.h"
#include "Logger.h"
#include "ConfigManager.h"
#include "KeyRemapper.h"
#include "ProcessDetector.h"
#include "UI/MainWindow.h"
#include <Windows.h>
#include <iostream>

// 全局变量
std::atomic<AppState> g_appState(AppState::STOPPED);
std::mutex g_configMutex;
std::mutex g_logMutex;

// 工具函数实现
namespace WarKeyUtils {
    std::string WCharToString(const std::wstring& wstr) {
        if (wstr.empty()) return "";
        int size = WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), -1, nullptr, 0, nullptr, nullptr);
        std::string result(size, 0);
        WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), -1, &result[0], size, nullptr, nullptr);
        return result;
    }

    std::wstring StringToWChar(const std::string& str) {
        if (str.empty()) return L"";
        int size = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, nullptr, 0);
        std::wstring result(size, 0);
        MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, &result[0], size);
        return result;
    }

    std::string VirtualKeyToString(DWORD virtualKey) {
        char keyName[256];
        if (GetKeyNameTextA(virtualKey << 16, keyName, sizeof(keyName)) > 0) {
            return std::string(keyName);
        }
        return "";
    }

    DWORD StringToVirtualKey(const std::string& keyName) {
        // 常见按键映射
        static const std::map<std::string, DWORD> keyMap = {
            {"1", '1'}, {"2", '2'}, {"3", '3'}, {"4", '4'}, {"5", '5'}, {"6", '6'},
            {"Q", 'Q'}, {"W", 'W'}, {"E", 'E'}, {"R", 'R'}, {"T", 'T'}, {"Y", 'Y'},
            {"A", 'A'}, {"S", 'S'}, {"D", 'D'}, {"F", 'F'}, {"G", 'G'}, {"H", 'H'},
            {"Z", 'Z'}, {"X", 'X'}, {"C", 'C'}, {"V", 'V'},
            {"F1", VK_F1}, {"F2", VK_F2}, {"F3", VK_F3}, {"F4", VK_F4},
            {"F5", VK_F5}, {"F6", VK_F6}, {"F7", VK_F7}, {"F8", VK_F8},
            {"F9", VK_F9}, {"F10", VK_F10}, {"F11", VK_F11}, {"F12", VK_F12},
            {"SPACE", VK_SPACE}, {"ENTER", VK_RETURN}, {"ESCAPE", VK_ESCAPE},
            {"TAB", VK_TAB}, {"BACKSPACE", VK_BACK},
            {"CTRL", VK_CONTROL}, {"ALT", VK_MENU}, {"SHIFT", VK_SHIFT},
        };

        auto it = keyMap.find(keyName);
        if (it != keyMap.end()) {
            return it->second;
        }
        return 0;
    }

    std::string KeyTypeToString(KeyType type) {
        switch (type) {
            case KeyType::ITEM: return "物品栏";
            case KeyType::HERO_SKILL: return "英雄技能";
            case KeyType::UNIT_SKILL: return "单位技能";
            default: return "未知";
        }
    }

    KeyType StringToKeyType(const std::string& typeStr) {
        if (typeStr == "物品栏" || typeStr == "item") return KeyType::ITEM;
        if (typeStr == "英雄技能" || typeStr == "hero_skill") return KeyType::HERO_SKILL;
        if (typeStr == "单位技能" || typeStr == "unit_skill") return KeyType::UNIT_SKILL;
        return KeyType::UNKNOWN;
    }

    DWORD GetCurrentTimestamp() {
        return GetTickCount();
    }

    bool FileExists(const std::string& filename) {
        return GetFileAttributesA(filename.c_str()) != INVALID_FILE_ATTRIBUTES;
    }

    bool FileExists(const std::wstring& filename) {
        return GetFileAttributesW(filename.c_str()) != INVALID_FILE_ATTRIBUTES;
    }

    bool CreateDirectory(const std::string& path) {
        return CreateDirectoryA(path.c_str(), nullptr) || GetLastError() == ERROR_ALREADY_EXISTS;
    }

    bool CreateDirectory(const std::wstring& path) {
        return CreateDirectoryW(path.c_str(), nullptr) || GetLastError() == ERROR_ALREADY_EXISTS;
    }

    std::string GetExecutablePath() {
        char path[MAX_PATH];
        GetModuleFileNameA(nullptr, path, MAX_PATH);
        std::string result = path;
        size_t pos = result.find_last_of("\\/");
        if (pos != std::string::npos) {
            result = result.substr(0, pos);
        }
        return result;
    }

    std::wstring GetExecutablePathW() {
        wchar_t path[MAX_PATH];
        GetModuleFileNameW(nullptr, path, MAX_PATH);
        std::wstring result = path;
        size_t pos = result.find_last_of(L"\\/");
        if (pos != std::wstring::npos) {
            result = result.substr(0, pos);
        }
        return result;
    }
}

// 程序入口
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    // 初始化日志系统
    Logger::GetInstance()->Initialize("", LogLevel::INFO);
    LOG_INFO("========================================");
    LOG_INFO("WarKey 魔兽争霸改键软件启动");
    LOG_INFO("版本: " + std::string(WARKEY_VERSION_STRING));
    LOG_INFO("========================================");

    // 创建主窗口
    MainWindow mainWindow;
    if (!mainWindow.Create(hInstance, nCmdShow)) {
        LOG_ERROR("创建主窗口失败");
        return 1;
    }

    LOG_INFO("主窗口创建成功");

    // 显示窗口
    mainWindow.Show(nCmdShow);

    // 消息循环
    int result = mainWindow.MessageLoop();

    LOG_INFO("WarKey 退出");
    Logger::GetInstance()->Shutdown();

    return result;
}
