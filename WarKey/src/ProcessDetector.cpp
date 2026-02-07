#include "ProcessDetector.h"
#include "Logger.h"

const DWORD ProcessDetector::DETECTION_INTERVAL = 1000; // 1秒

ProcessDetector::ProcessDetector()
    : m_isRunning(false)
    , m_isGameRunning(false)
    , m_gameWindow(nullptr) {
    LOG_INFO("ProcessDetector 初始化");
}

ProcessDetector::~ProcessDetector() {
    Stop();
    LOG_INFO("ProcessDetector 销毁");
}

bool ProcessDetector::Initialize() {
    LOG_INFO("ProcessDetector 初始化中...");

    // 添加默认目标进程
    AddTargetProcess("war3.exe");
    AddTargetProcess("Warcraft III.exe");

    LOG_INFO("ProcessDetector 初始化完成");
    return true;
}

void ProcessDetector::AddTargetProcess(const std::string& processName) {
    if (std::find(m_targetProcesses.begin(), m_targetProcesses.end(), processName) == m_targetProcesses.end()) {
        m_targetProcesses.push_back(processName);
    }
}

void ProcessDetector::RemoveTargetProcess(const std::string& processName) {
    m_targetProcesses.erase(
        std::remove(m_targetProcesses.begin(), m_targetProcesses.end(), processName),
        m_targetProcesses.end()
    );
}

void ProcessDetector::ClearTargetProcesses() {
    m_targetProcesses.clear();
}

void ProcessDetector::SetCallback(ProcessCallback callback) {
    std::lock_guard<std::mutex> lock(m_callbackMutex);
    m_callback = callback;
}

bool ProcessDetector::Start() {
    if (m_isRunning) {
        return true;
    }

    m_isRunning = true;
    m_detectionThread = std::thread(&ProcessDetector::DetectionThread, this);

    LOG_INFO("ProcessDetector 已启动");
    return true;
}

void ProcessDetector::Stop() {
    if (!m_isRunning) {
        return;
    }

    m_isRunning = false;

    if (m_detectionThread.joinable()) {
        m_detectionThread.join();
    }

    LOG_INFO("ProcessDetector 已停止");
}

bool ProcessDetector::IsGameRunning() const {
    return m_isGameRunning;
}

HWND ProcessDetector::GetGameWindow() const {
    return m_gameWindow;
}

HWND ProcessDetector::FindWindowByTitle(const std::wstring& title) {
    return FindWindowW(nullptr, title.c_str());
}

HWND ProcessDetector::FindWindowByProcess(const std::string& processName) {
    // 枚举所有窗口
    HWND hwnd = FindWindowW(nullptr, nullptr);
    while (hwnd) {
        if (IsTargetWindow(hwnd)) {
            std::string procName = GetProcessName(hwnd);
            if (procName == processName) {
                return hwnd;
            }
        }
        hwnd = FindWindowExW(nullptr, hwnd, nullptr, nullptr);
    }
    return nullptr;
}

std::string ProcessDetector::GetProcessName(HWND hwnd) {
    DWORD processId = 0;
    GetWindowThreadProcessId(hwnd, &processId);

    if (processId == 0) {
        return "";
    }

    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION, FALSE, processId);
    if (!hProcess) {
        return "";
    }

    char path[MAX_PATH];
    if (GetProcessImageFileNameA(hProcess, path, MAX_PATH) == 0) {
        CloseHandle(hProcess);
        return "";
    }

    CloseHandle(hProcess);

    // 提取文件名
    std::string fullPath = path;
    size_t pos = fullPath.find_last_of("\\/");
    if (pos != std::string::npos) {
        return fullPath.substr(pos + 1);
    }

    return fullPath;
}

std::wstring ProcessDetector::GetWindowTitle(HWND hwnd) {
    wchar_t title[256];
    GetWindowTextW(hwnd, title, 256);
    return std::wstring(title);
}

bool ProcessDetector::IsTargetWindow(HWND hwnd) {
    if (!hwnd) {
        return false;
    }

    // 检查窗口是否可见
    if (!IsWindowVisible(hwnd)) {
        return false;
    }

    // 检查窗口类名
    wchar_t className[256];
    GetClassNameW(hwnd, className, 256);

    if (wcscmp(className, WAR3_WINDOW_CLASS) == 0) {
        return true;
    }

    // 检查窗口标题
    std::wstring title = GetWindowTitle(hwnd);
    if (title.find(WAR3_WINDOW_TITLE) != std::wstring::npos) {
        return true;
    }

    return false;
}

void ProcessDetector::DetectionThread() {
    LOG_INFO("ProcessDetector 检测线程启动");

    while (m_isRunning) {
        Detect();
        std::this_thread::sleep_for(std::chrono::milliseconds(DETECTION_INTERVAL));
    }

    LOG_INFO("ProcessDetector 检测线程退出");
}

void ProcessDetector::Detect() {
    bool wasRunning = m_isGameRunning;
    bool nowRunning = false;
    HWND foundWindow = nullptr;

    // 查找目标窗口
    for (const auto& processName : m_targetProcesses) {
        foundWindow = FindWindowByProcess(processName);
        if (foundWindow) {
            nowRunning = true;
            break;
        }

        // 也尝试通过窗口标题查找
        foundWindow = FindWindowByTitle(WAR3_WINDOW_TITLE);
        if (foundWindow) {
            nowRunning = true;
            break;
        }
    }

    m_isGameRunning = nowRunning;
    m_gameWindow = foundWindow;

    // 如果状态发生变化，通知回调
    if (wasRunning != nowRunning) {
        NotifyStatusChange(nowRunning);
    }
}

void ProcessDetector::NotifyStatusChange(bool isRunning) {
    std::lock_guard<std::mutex> lock(m_callbackMutex);

    if (m_callback) {
        m_callback(isRunning, isRunning ? "Warcraft III" : "");
    }

    LOG_INFO("游戏进程状态变化: " + std::string(isRunning ? "运行中" : "未运行"));
}
