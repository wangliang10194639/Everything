#include "Logger.h"
#include <ctime>
#include <iomanip>
#include <sstream>

Logger* Logger::m_instance = nullptr;
std::mutex Logger::m_instanceMutex;

Logger::Logger()
    : m_maxBufferSize(1000)
    , m_minLevel(LogLevel::DEBUG)
    , m_consoleOutput(true)
    , m_fileOutput(true) {
}

Logger::~Logger() {
    Shutdown();
}

Logger* Logger::GetInstance() {
    std::lock_guard<std::mutex> lock(m_instanceMutex);

    if (!m_instance) {
        m_instance = new Logger();
    }

    return m_instance;
}

bool Logger::Initialize(const std::string& logPath, LogLevel minLevel) {
    m_minLevel = minLevel;

    if (!logPath.empty()) {
        m_logPath = logPath;
    } else {
        // 使用程序目录下的 logs 文件夹
        char exePath[MAX_PATH];
        GetModuleFileNameA(nullptr, exePath, MAX_PATH);
        std::string exeDir = exePath;
        size_t pos = exeDir.find_last_of("\\/");
        if (pos != std::string::npos) {
            exeDir = exeDir.substr(0, pos);
        }
        m_logPath = exeDir + "\\logs\\warkey.log";
    }

    // 创建日志目录
    size_t lastSlash = m_logPath.find_last_of("\\/");
    if (lastSlash != std::string::npos) {
        std::string logDir = m_logPath.substr(0, lastSlash);
        WarKeyUtils::CreateDirectory(logDir);
    }

    // 打开日志文件
    if (m_fileOutput) {
        m_logFile.open(m_logPath, std::ios::app);
        if (!m_logFile.is_open()) {
            m_fileOutput = false;
        }
    }

    return true;
}

void Logger::Shutdown() {
    std::lock_guard<std::mutex> lock(m_logMutex);

    if (m_logFile.is_open()) {
        m_logFile.close();
    }
}

void Logger::Log(LogLevel level, const std::string& message, const std::string& file, int line) {
    if (level < m_minLevel) {
        return;
    }

    LogEntry entry;
    entry.level = level;
    entry.message = message;
    entry.timestamp = GetCurrentTimestamp();
    entry.file = file;
    entry.line = line;

    std::lock_guard<std::mutex> lock(m_logMutex);

    // 写入控制台
    if (m_consoleOutput) {
        WriteToConsole(entry);
    }

    // 写入文件
    if (m_fileOutput && m_logFile.is_open()) {
        WriteToFile(entry);
    }

    // 添加到缓冲区
    AddToBuffer(entry);
}

void Logger::Debug(const std::string& message, const std::string& file, int line) {
    Log(LogLevel::DEBUG, message, file, line);
}

void Logger::Info(const std::string& message, const std::string& file, int line) {
    Log(LogLevel::INFO, message, file, line);
}

void Logger::Warning(const std::string& message, const std::string& file, int line) {
    Log(LogLevel::WARNING, message, file, line);
}

void Logger::Error(const std::string& message, const std::string& file, int line) {
    Log(LogLevel::ERROR, message, file, line);
}

void Logger::SetMinLevel(LogLevel level) {
    m_minLevel = level;
}

void Logger::SetConsoleOutput(bool enable) {
    m_consoleOutput = enable;
}

void Logger::SetFileOutput(bool enable) {
    m_fileOutput = enable;
    if (enable && !m_logFile.is_open() && !m_logPath.empty()) {
        m_logFile.open(m_logPath, std::ios::app);
    } else if (!enable && m_logFile.is_open()) {
        m_logFile.close();
    }
}

void Logger::ClearBuffer() {
    std::lock_guard<std::mutex> lock(m_logMutex);
    m_logBuffer.clear();
}

const std::vector<Logger::LogEntry>& Logger::GetBuffer() const {
    return m_logBuffer;
}

std::vector<Logger::LogEntry> Logger::GetRecentLogs(size_t count) const {
    std::lock_guard<std::mutex> lock(m_logMutex);

    if (count >= m_logBuffer.size()) {
        return m_logBuffer;
    }

    return std::vector<LogEntry>(
        m_logBuffer.end() - static_cast<long long>(count),
        m_logBuffer.end()
    );
}

bool Logger::ExportToFile(const std::string& filePath) const {
    std::ofstream file(filePath);
    if (!file.is_open()) {
        return false;
    }

    for (const auto& entry : m_logBuffer) {
        file << FormatEntry(entry) << "\n";
    }

    file.close();
    return true;
}

std::string Logger::LevelToString(LogLevel level) {
    switch (level) {
        case LogLevel::DEBUG:
            return "DEBUG";
        case LogLevel::INFO:
            return "INFO";
        case LogLevel::WARNING:
            return "WARNING";
        case LogLevel::ERROR:
            return "ERROR";
        default:
            return "UNKNOWN";
    }
}

std::string Logger::GetLogPath() const {
    return m_logPath;
}

void Logger::WriteToFile(const LogEntry& entry) {
    if (m_logFile.is_open()) {
        m_logFile << FormatEntry(entry) << std::endl;
        m_logFile.flush();
    }
}

void Logger::WriteToConsole(const LogEntry& entry) {
    std::string formatted = FormatEntry(entry);

    // 根据日志级别设置颜色
    HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
    WORD color = FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE;

    switch (entry.level) {
        case LogLevel::DEBUG:
            color = FOREGROUND_GREEN | FOREGROUND_BLUE;
            break;
        case LogLevel::INFO:
            color = FOREGROUND_GREEN;
            break;
        case LogLevel::WARNING:
            color = FOREGROUND_RED | FOREGROUND_GREEN;
            break;
        case LogLevel::ERROR:
            color = FOREGROUND_RED;
            break;
    }

    SetConsoleTextAttribute(hConsole, color);
    std::cout << formatted << std::endl;
    SetConsoleTextAttribute(hConsole, FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE);
}

std::string Logger::FormatEntry(const LogEntry& entry) const {
    std::stringstream ss;
    ss << "[" << entry.timestamp << "] ";
    ss << "[" << LevelToString(entry.level) << "] ";
    ss << entry.message;

    if (!entry.file.empty()) {
        ss << " (" << entry.file << ":" << entry.line << ")";
    }

    return ss.str();
}

std::string Logger::GetCurrentTimestamp() const {
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
        now.time_since_epoch()
    ) % 1000;

    std::stringstream ss;
    ss << std::put_time(std::localtime(&time), "%Y-%m-%d %H:%M:%S");
    ss << "." << std::setfill('0') << std::setw(3) << ms.count();

    return ss.str();
}

void Logger::AddToBuffer(const LogEntry& entry) {
    m_logBuffer.push_back(entry);

    // 限制缓冲区大小
    if (m_logBuffer.size() > m_maxBufferSize) {
        m_logBuffer.erase(m_logBuffer.begin());
    }
}
