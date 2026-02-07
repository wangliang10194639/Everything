#pragma once

#include "Common.h"
#include <functional>
#include <atomic>

// 进程检测器类
class ProcessDetector {
public:
    // 进程状态回调
    using ProcessCallback = std::function<void(bool isRunning, const std::string& processName)>;

private:
    std::vector<std::string> m_targetProcesses;    // 目标进程列表
    std::atomic<bool> m_isRunning;                 // 是否正在检测
    std::atomic<bool> m_isGameRunning;             // 游戏是否运行
    HWND m_gameWindow;                             // 游戏窗口句柄
    std::thread m_detectionThread;                 // 检测线程
    std::mutex m_callbackMutex;                    // 回调互斥锁
    ProcessCallback m_callback;                    // 状态回调

    // 检测间隔（毫秒）
    static const DWORD DETECTION_INTERVAL;

public:
    ProcessDetector();
    ~ProcessDetector();

    // 初始化进程检测器
    bool Initialize();

    // 添加目标进程
    void AddTargetProcess(const std::string& processName);

    // 移除目标进程
    void RemoveTargetProcess(const std::string& processName);

    // 清空目标进程
    void ClearTargetProcesses();

    // 设置进程状态回调
    void SetCallback(ProcessCallback callback);

    // 开始检测
    bool Start();

    // 停止检测
    void Stop();

    // 检查游戏是否运行
    bool IsGameRunning() const;

    // 获取游戏窗口句柄
    HWND GetGameWindow() const;

    // 通过窗口标题查找窗口
    static HWND FindWindowByTitle(const std::wstring& title);

    // 通过进程名查找窗口
    static HWND FindWindowByProcess(const std::string& processName);

    // 获取窗口所属进程名
    static std::string GetProcessName(HWND hwnd);

    // 获取窗口标题
    static std::wstring GetWindowTitle(HWND hwnd);

    // 检查窗口是否为目标游戏窗口
    static bool IsTargetWindow(HWND hwnd);

private:
    // 检测线程函数
    void DetectionThread();

    // 执行单次检测
    void Detect();

    // 通知状态变化
    void NotifyStatusChange(bool isRunning);
};
