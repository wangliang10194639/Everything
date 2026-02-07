#include "ConfigManager.h"
#include "Logger.h"
#include <ShlObj.h>
#include <fstream>
#include <sstream>
#include <algorithm>

const std::string ConfigManager::DEFAULT_CONFIG_NAME = "Default";

ConfigManager::ConfigManager()
    : m_currentConfigName(DEFAULT_CONFIG_NAME) {
    LOG_INFO("ConfigManager 初始化");
}

ConfigManager::~ConfigManager() {
    SaveAllConfigs();
    LOG_INFO("ConfigManager 销毁");
}

bool ConfigManager::Initialize(const std::string& configDir) {
    LOG_INFO("ConfigManager 初始化中...");

    if (!configDir.empty()) {
        m_configPath = configDir;
    } else {
        // 使用程序目录下的 configs 文件夹
        char exePath[MAX_PATH];
        GetModuleFileNameA(nullptr, exePath, MAX_PATH);
        std::string exeDir = exePath;
        size_t pos = exeDir.find_last_of("\\/");
        if (pos != std::string::npos) {
            exeDir = exeDir.substr(0, pos);
        }
        m_configPath = exeDir + "\\configs";
    }

    // 创建配置目录
    if (!WarKeyUtils::CreateDirectory(m_configPath)) {
        LOG_ERROR("创建配置目录失败: " + m_configPath);
        return false;
    }

    // 加载所有配置
    if (!LoadAllConfigs()) {
        LOG_WARNING("加载配置失败，创建默认配置");
        KeyConfig defaultConfig = CreateDefaultConfig(DEFAULT_CONFIG_NAME);
        SaveConfig(defaultConfig);
    }

    LOG_INFO("ConfigManager 初始化完成，配置目录: " + m_configPath);
    return true;
}

bool ConfigManager::LoadAllConfigs() {
    std::lock_guard<std::mutex> lock(m_configMutex);

    m_configs.clear();

    // 查找所有 .json 文件
    WIN32_FIND_DATAA findData;
    std::string searchPath = m_configPath + "\\*.json";

    HANDLE hFind = FindFirstFileA(searchPath.c_str(), &findData);
    if (hFind == INVALID_HANDLE_VALUE) {
        LOG_INFO("未找到配置文件");
        return true;
    }

    do {
        std::string fileName = findData.cFileName;
        if (fileName == "." || fileName == "..") {
            continue;
        }

        std::string configName = fileName.substr(0, fileName.find_last_of("."));
        KeyConfig config;

        if (LoadConfig(configName)) {
            m_configs[configName] = *GetConfig(configName);
        }
    } while (FindNextFileA(hFind, &findData));

    FindClose(hFind);

    LOG_INFO("加载了 " + std::to_string(m_configs.size()) + " 个配置");
    return true;
}

bool ConfigManager::LoadConfig(const std::string& configName) {
    std::lock_guard<std::mutex> lock(m_configMutex);

    std::string filePath = GetConfigFilePath(configName);
    KeyConfig config;

    if (!LoadConfigFromFile(filePath, config)) {
        return false;
    }

    m_configs[configName] = config;
    return true;
}

bool ConfigManager::SaveConfig(const KeyConfig& config) {
    std::lock_guard<std::mutex> lock(m_configMutex);

    std::string filePath = GetConfigFilePath(config.configName);
    if (!SaveConfigToFile(config, filePath)) {
        return false;
    }

    m_configs[config.configName] = config;
    return true;
}

bool ConfigManager::SaveAllConfigs() {
    std::lock_guard<std::mutex> lock(m_configMutex);

    for (const auto& pair : m_configs) {
        if (!SaveConfigToFile(pair.second, GetConfigFilePath(pair.first))) {
            LOG_ERROR("保存配置失败: " + pair.first);
        }
    }

    return true;
}

bool ConfigManager::DeleteConfig(const std::string& configName) {
    std::lock_guard<std::mutex> lock(m_configMutex);

    if (configName == DEFAULT_CONFIG_NAME) {
        LOG_WARNING("不能删除默认配置");
        return false;
    }

    auto it = m_configs.find(configName);
    if (it == m_configs.end()) {
        return false;
    }

    // 删除配置文件
    std::string filePath = GetConfigFilePath(configName);
    DeleteFileA(filePath.c_str());

    // 从内存中移除
    m_configs.erase(it);

    // 如果删除的是当前配置，切换到默认配置
    if (m_currentConfigName == configName) {
        m_currentConfigName = DEFAULT_CONFIG_NAME;
    }

    return true;
}

bool ConfigManager::RenameConfig(const std::string& oldName, const std::string& newName) {
    std::lock_guard<std::mutex> lock(m_configMutex);

    if (!ConfigExists(oldName) || ConfigExists(newName)) {
        return false;
    }

    auto it = m_configs.find(oldName);
    if (it == m_configs.end()) {
        return false;
    }

    // 重命名配置文件
    std::string oldPath = GetConfigFilePath(oldName);
    std::string newPath = GetConfigFilePath(newName);
    MoveFileA(oldPath.c_str(), newPath.c_str());

    // 更新内存中的配置
    KeyConfig config = it->second;
    config.configName = newName;
    m_configs.erase(it);
    m_configs[newName] = config;

    // 如果重命名的是当前配置，更新当前配置名称
    if (m_currentConfigName == oldName) {
        m_currentConfigName = newName;
    }

    return true;
}

bool ConfigManager::CopyConfig(const std::string& sourceName, const std::string& destName) {
    std::lock_guard<std::mutex> lock(m_configMutex);

    if (!ConfigExists(sourceName) || ConfigExists(destName)) {
        return false;
    }

    auto it = m_configs.find(sourceName);
    if (it == m_configs.end()) {
        return false;
    }

    KeyConfig newConfig = it->second;
    newConfig.configName = destName;
    m_configs[destName] = newConfig;

    return SaveConfig(newConfig);
}

KeyConfig* ConfigManager::GetConfig(const std::string& configName) {
    std::lock_guard<std::mutex> lock(m_configMutex);

    auto it = m_configs.find(configName);
    if (it != m_configs.end()) {
        return &it->second;
    }

    return nullptr;
}

KeyConfig* ConfigManager::GetCurrentConfig() {
    return GetConfig(m_currentConfigName);
}

bool ConfigManager::SetCurrentConfig(const std::string& configName) {
    if (!ConfigExists(configName)) {
        return false;
    }

    m_currentConfigName = configName;
    return true;
}

std::string ConfigManager::GetCurrentConfigName() const {
    return m_currentConfigName;
}

std::vector<std::string> ConfigManager::GetAllConfigNames() const {
    std::lock_guard<std::mutex> lock(m_configMutex);

    std::vector<std::string> names;
    for (const auto& pair : m_configs) {
        names.push_back(pair.first);
    }

    return names;
}

bool ConfigManager::ConfigExists(const std::string& configName) const {
    std::lock_guard<std::mutex> lock(m_configMutex);
    return m_configs.find(configName) != m_configs.end();
}

KeyConfig ConfigManager::CreateDefaultConfig(const std::string& configName) {
    KeyConfig config;
    config.configName = configName;
    config.version = WARKEY_VERSION_STRING;
    config.autoStart = false;
    config.showNotifications = true;
    config.gameProcess = "war3.exe";

    // 创建默认物品栏映射
    for (int i = 0; i < MAX_ITEM_SLOTS; i++) {
        KeyMapping mapping;
        mapping.type = KeyType::ITEM;
        mapping.position = i;
        mapping.originalKey = std::to_string(i + 1);
        mapping.mappedKey = std::to_string(i + 1);
        mapping.isEnabled = true;
        config.itemMappings.push_back(mapping);
    }

    // 创建默认英雄技能映射
    const char* skills[] = {"Q", "W", "E", "R"};
    for (int i = 0; i < 4; i++) {
        KeyMapping mapping;
        mapping.type = KeyType::HERO_SKILL;
        mapping.position = i;
        mapping.originalKey = skills[i];
        mapping.mappedKey = skills[i];
        mapping.isEnabled = true;
        config.heroSkillMappings.push_back(mapping);
    }

    return config;
}

bool ConfigManager::ImportConfig(const std::string& filePath) {
    std::lock_guard<std::mutex> lock(m_configMutex);

    KeyConfig config;
    if (!LoadConfigFromFile(filePath, config)) {
        return false;
    }

    m_configs[config.configName] = config;
    return SaveConfig(config);
}

bool ConfigManager::ExportConfig(const std::string& configName, const std::string& filePath) {
    std::lock_guard<std::mutex> lock(m_configMutex);

    auto it = m_configs.find(configName);
    if (it == m_configs.end()) {
        return false;
    }

    return SaveConfigToFile(it->second, filePath);
}

bool ConfigManager::ValidateConfig(const KeyConfig& config) const {
    if (config.configName.empty()) {
        return false;
    }

    // 验证物品栏映射
    for (const auto& mapping : config.itemMappings) {
        if (mapping.originalKey.empty() || mapping.mappedKey.empty()) {
            return false;
        }
    }

    return true;
}

std::string ConfigManager::GetConfigDirectory() const {
    return m_configPath;
}

void ConfigManager::SetConfigDirectory(const std::string& path) {
    m_configPath = path;
}

bool ConfigManager::LoadConfigFromFile(const std::string& filePath, KeyConfig& config) {
    std::ifstream file(filePath);
    if (!file.is_open()) {
        LOG_ERROR("无法打开配置文件: " + filePath);
        return false;
    }

    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string json = buffer.str();

    file.close();

    return ParseJsonConfig(json, config);
}

bool ConfigManager::SaveConfigToFile(const KeyConfig& config, const std::string& filePath) {
    std::string json = GenerateJsonConfig(config);

    std::ofstream file(filePath);
    if (!file.is_open()) {
        LOG_ERROR("无法保存配置文件: " + filePath);
        return false;
    }

    file << json;
    file.close();

    return true;
}

bool ConfigManager::ParseJsonConfig(const std::string& json, KeyConfig& config) {
    // 简单JSON解析（实际项目中建议使用 nlohmann_json）
    // 这里使用简单的字符串解析

    // 解析配置名称
    size_t namePos = json.find("\"config_name\"");
    if (namePos != std::string::npos) {
        size_t colonPos = json.find(":", namePos);
        size_t quoteStart = json.find("\"", colonPos);
        size_t quoteEnd = json.find("\"", quoteStart + 1);
        if (quoteStart != std::string::npos && quoteEnd != std::string::npos) {
            config.configName = json.substr(quoteStart + 1, quoteEnd - quoteStart - 1);
        }
    }

    // 解析版本
    size_t versionPos = json.find("\"version\"");
    if (versionPos != std::string::npos) {
        size_t colonPos = json.find(":", versionPos);
        size_t quoteStart = json.find("\"", colonPos);
        size_t quoteEnd = json.find("\"", quoteStart + 1);
        if (quoteStart != std::string::npos && quoteEnd != std::string::npos) {
            config.version = json.substr(quoteStart + 1, quoteEnd - quoteStart - 1);
        }
    }

    // 解析自动启动
    size_t autoStartPos = json.find("\"auto_start\"");
    if (autoStartPos != std::string::npos) {
        size_t colonPos = json.find(":", autoStartPos);
        config.autoStart = (json.find("true", colonPos) < json.find("}", colonPos));
    }

    // 解析显示通知
    size_t notifyPos = json.find("\"show_notifications\"");
    if (notifyPos != std::string::npos) {
        size_t colonPos = json.find(":", notifyPos);
        config.showNotifications = (json.find("true", colonPos) < json.find("}", colonPos));
    }

    return true;
}

std::string ConfigManager::GenerateJsonConfig(const KeyConfig& config) const {
    std::stringstream json;

    json << "{\n";
    json << "  \"config_name\": \"" << config.configName << "\",\n";
    json << "  \"version\": \"" << config.version << "\",\n";
    json << "  \"auto_start\": " << (config.autoStart ? "true" : "false") << ",\n";
    json << "  \"show_notifications\": " << (config.showNotifications ? "true" : "false") << ",\n";
    json << "  \"game_process\": \"" << config.gameProcess << "\",\n";

    // 物品栏映射
    json << "  \"item_mappings\": [\n";
    for (size_t i = 0; i < config.itemMappings.size(); i++) {
        const auto& mapping = config.itemMappings[i];
        json << "    {\"original\": \"" << mapping.originalKey << "\", ";
        json << "\"mapped\": \"" << mapping.mappedKey << "\", ";
        json << "\"enabled\": " << (mapping.isEnabled ? "true" : "false") << "}";
        if (i < config.itemMappings.size() - 1) {
            json << ",";
        }
        json << "\n";
    }
    json << "  ],\n";

    // 英雄技能映射
    json << "  \"hero_skill_mappings\": [\n";
    for (size_t i = 0; i < config.heroSkillMappings.size(); i++) {
        const auto& mapping = config.heroSkillMappings[i];
        json << "    {\"original\": \"" << mapping.originalKey << "\", ";
        json << "\"mapped\": \"" << mapping.mappedKey << "\", ";
        json << "\"enabled\": " << (mapping.isEnabled ? "true" : "false") << "}";
        if (i < config.heroSkillMappings.size() - 1) {
            json << ",";
        }
        json << "\n";
    }
    json << "  ]\n";

    json << "}\n";

    return json.str();
}

std::string ConfigManager::GetConfigFilePath(const std::string& configName) const {
    return m_configPath + "\\" + configName + ".json";
}
