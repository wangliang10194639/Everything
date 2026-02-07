#pragma once

#include "Common.h"
#include <string>
#include <vector>
#include <map>

// 配置管理器类
class ConfigManager {
private:
    std::string m_configPath;              // 配置文件路径
    std::string m_currentConfigName;       // 当前配置名称
    std::map<std::string, KeyConfig> m_configs;  // 配置缓存
    std::mutex m_configMutex;              // 互斥锁

    // 默认配置名称
    static const std::string DEFAULT_CONFIG_NAME;

public:
    ConfigManager();
    ~ConfigManager();

    // 初始化配置管理器
    bool Initialize(const std::string& configDir = "");

    // 加载所有配置
    bool LoadAllConfigs();

    // 加载指定配置
    bool LoadConfig(const std::string& configName);

    // 保存配置
    bool SaveConfig(const KeyConfig& config);

    // 保存所有配置
    bool SaveAllConfigs();

    // 删除配置
    bool DeleteConfig(const std::string& configName);

    // 重命名配置
    bool RenameConfig(const std::string& oldName, const std::string& newName);

    // 复制配置
    bool CopyConfig(const std::string& sourceName, const std::string& destName);

    // 获取配置
    KeyConfig* GetConfig(const std::string& configName);
    KeyConfig* GetCurrentConfig();

    // 设置当前配置
    bool SetCurrentConfig(const std::string& configName);

    // 获取当前配置名称
    std::string GetCurrentConfigName() const;

    // 获取所有配置名称
    std::vector<std::string> GetAllConfigNames() const;

    // 检查配置是否存在
    bool ConfigExists(const std::string& configName) const;

    // 创建默认配置
    KeyConfig CreateDefaultConfig(const std::string& configName);

    // 导入配置
    bool ImportConfig(const std::string& filePath);

    // 导出配置
    bool ExportConfig(const std::string& configName, const std::string& filePath);

    // 验证配置
    bool ValidateConfig(const KeyConfig& config) const;

    // 获取配置目录
    std::string GetConfigDirectory() const;

    // 设置配置目录
    void SetConfigDirectory(const std::string& path);

private:
    // 从文件加载配置
    bool LoadConfigFromFile(const std::string& filePath, KeyConfig& config);

    // 保存配置到文件
    bool SaveConfigToFile(const KeyConfig& config, const std::string& filePath);

    // 解析JSON配置
    bool ParseJsonConfig(const std::string& json, KeyConfig& config);

    // 生成JSON配置
    std::string GenerateJsonConfig(const KeyConfig& config) const;

    // 获取配置文件路径
    std::string GetConfigFilePath(const std::string& configName) const;
};
