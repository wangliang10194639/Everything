#pragma once

#include "Common.h"
#include <string>
#include <fstream>
#include <sstream>
#include <vector>
#include <chrono>
#include <mutex>

// 日志管理器类
class Logger {
public:
    // 日志条目
    struct LogEntry {
        LogLevel level;                     // 日志级别
        std::string message;                // 日志消息
        std::string timestamp;              // 时间戳
        std::string file;                   // 文件名
        int line;                           // 行号
    };

private:
    std::string m_logPath;                  // 日志文件路径
    std::ofstream m_logFile;                // 日志文件流
    std::vector<LogEntry> m_logBuffer;      // 日志缓冲区
    size_t m_maxBufferSize;                 // 最大缓冲区大小
    LogLevel m_minLevel;                    // 最小日志级别
    bool m_consoleOutput;                   // 是否输出到控制台
    bool m_fileOutput;                      // 是否输出到文件
    std::mutex m_logMutex;                  // 互斥锁

    // 静态实例（单例模式）
    static Logger* m_instance;
    static std::mutex m_instanceMutex;

public:
    Logger();
    ~Logger();

    // 获取单例实例
    static Logger* GetInstance();

    // 初始化日志系统
    bool Initialize(const std::string& logPath = "", LogLevel minLevel = LogLevel::INFO);

    // 关闭日志系统
    void Shutdown();

    // 记录日志
    void Log(LogLevel level, const std::string& message, const std::string& file = "", int line = 0);

    // 便捷日志方法
    void Debug(const std::string& message, const std::string& file = "", int line = 0);
    void Info(const std::string& message, const std::string& file = "", int line = 0);
    void Warning(const std::string& message, const std::string& file = "", int line = 0);
    void Error(const std::string& message, const std::string& file = "", int line = 0);

    // 设置最小日志级别
    void SetMinLevel(LogLevel level);

    // 设置是否输出到控制台
    void SetConsoleOutput(bool enable);

    // 设置是否输出到文件
    void SetFileOutput(bool enable);

    // 清空日志缓冲区
    void ClearBuffer();

    // 获取日志缓冲区
    const std::vector<LogEntry>& GetBuffer() const;

    // 获取最近的日志
    std::vector<LogEntry> GetRecentLogs(size_t count) const;

    // 导出日志到文件
    bool ExportToFile(const std::string& filePath) const;

    // 获取日志级别字符串
    static std::string LevelToString(LogLevel level);

    // 获取日志文件路径
    std::string GetLogPath() const;

private:
    // 写入日志到文件
    void WriteToFile(const LogEntry& entry);

    // 写入日志到控制台
    void WriteToConsole(const LogEntry& entry);

    // 格式化日志条目
    std::string FormatEntry(const LogEntry& entry) const;

    // 获取当前时间戳
    std::string GetCurrentTimestamp() const;

    // 添加到缓冲区
    void AddToBuffer(const LogEntry& entry);
};

// 便捷宏定义
#define LOG_DEBUG(message) Logger::GetInstance()->Debug(message, __FILE__, __LINE__)
#define LOG_INFO(message) Logger::GetInstance()->Info(message, __FILE__, __LINE__)
#define LOG_WARNING(message) Logger::GetInstance()->Warning(message, __FILE__, __LINE__)
#define LOG_ERROR(message) Logger::GetInstance()->Error(message, __FILE__, __LINE__)
