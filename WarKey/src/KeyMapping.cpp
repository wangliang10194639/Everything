#include "KeyMapping.h"
#include "Logger.h"
#include <algorithm>

KeyMappingManager::KeyMappingManager() {
    LOG_INFO("KeyMappingManager 初始化");
}

KeyMappingManager::~KeyMappingManager() {
    LOG_INFO("KeyMappingManager 销毁");
    ClearAllMappings();
}

bool KeyMappingManager::AddMapping(const KeyMapping& mapping) {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    // 验证映射
    if (!ValidateMapping(mapping)) {
        LOG_WARNING("无效的按键映射: " + mapping.originalKey + " -> " + mapping.mappedKey);
        return false;
    }

    // 获取对应类型的映射向量
    std::vector<KeyMapping>* mappings = GetMappingVector(mapping.type);
    if (!mappings) {
        LOG_ERROR("未知的按键类型");
        return false;
    }

    // 检查是否已存在相同位置的映射
    auto it = std::find_if(mappings->begin(), mappings->end(),
        [mapping](const KeyMapping& m) {
            return m.position == mapping.position;
        });

    if (it != mappings->end()) {
        // 更新现有映射
        *it = mapping;
        LOG_INFO("更新按键映射: " + mapping.originalKey + " -> " + mapping.mappedKey);
    } else {
        // 添加新映射
        mappings->push_back(mapping);
        LOG_INFO("添加按键映射: " + mapping.originalKey + " -> " + mapping.mappedKey);
    }

    return true;
}

bool KeyMappingManager::RemoveMapping(KeyType type, int position) {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    std::vector<KeyMapping>* mappings = GetMappingVector(type);
    if (!mappings) {
        return false;
    }

    auto it = std::find_if(mappings->begin(), mappings->end(),
        [position](const KeyMapping& m) {
            return m.position == position;
        });

    if (it != mappings->end()) {
        mappings->erase(it);
        LOG_INFO("移除位置 " + std::to_string(position) + " 的映射");
        return true;
    }

    return false;
}

bool KeyMappingManager::UpdateMapping(const KeyMapping& mapping) {
    return AddMapping(mapping);
}

KeyMapping* KeyMappingManager::FindMapping(DWORD virtualKey, KeyType type) {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    std::vector<KeyMapping>* mappings = GetMappingVector(type);
    if (!mappings) {
        return nullptr;
    }

    for (auto& mapping : *mappings) {
        if (mapping.isEnabled && mapping.originalVirtualKey == virtualKey) {
            return &mapping;
        }
    }

    return nullptr;
}

const KeyMapping* KeyMappingManager::FindMapping(DWORD virtualKey, KeyType type) const {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    std::vector<KeyMapping>* mappings = GetMappingVector(type);
    if (!mappings) {
        return nullptr;
    }

    for (const auto& mapping : *mappings) {
        if (mapping.isEnabled && mapping.originalVirtualKey == virtualKey) {
            return &mapping;
        }
    }

    return nullptr;
}

std::vector<KeyMapping> KeyMappingManager::GetMappings(KeyType type) const {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    std::vector<KeyMapping>* mappings = GetMappingVector(type);
    if (!mappings) {
        return {};
    }

    return *mappings;
}

void KeyMappingManager::SetItemMappings(const std::vector<KeyMapping>& mappings) {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);
    m_itemMappings = mappings;
}

void KeyMappingManager::SetHeroSkillMappings(const std::vector<KeyMapping>& mappings) {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);
    m_heroSkillMappings = mappings;
}

void KeyMappingManager::SetUnitSkillMappings(const std::vector<KeyMapping>& mappings) {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);
    m_unitSkillMappings = mappings;
}

void KeyMappingManager::ClearAllMappings() {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);
    m_itemMappings.clear();
    m_heroSkillMappings.clear();
    m_unitSkillMappings.clear();
}

void KeyMappingManager::ClearMappings(KeyType type) {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    std::vector<KeyMapping>* mappings = GetMappingVector(type);
    if (mappings) {
        mappings->clear();
    }
}

bool KeyMappingManager::EnableMapping(KeyType type, int position, bool enable) {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    std::vector<KeyMapping>* mappings = GetMappingVector(type);
    if (!mappings) {
        return false;
    }

    for (auto& mapping : *mappings) {
        if (mapping.position == position) {
            mapping.isEnabled = enable;
            return true;
        }
    }

    return false;
}

bool KeyMappingManager::HasMapping(DWORD virtualKey, KeyType type) const {
    return FindMapping(virtualKey, type) != nullptr;
}

size_t KeyMappingManager::GetMappingCount(KeyType type) const {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    std::vector<KeyMapping>* mappings = GetMappingVector(type);
    if (!mappings) {
        return 0;
    }

    return mappings->size();
}

bool KeyMappingManager::ValidateMappings() const {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    bool valid = true;

    for (const auto& mapping : m_itemMappings) {
        if (!ValidateMapping(mapping)) {
            valid = false;
        }
    }

    for (const auto& mapping : m_heroSkillMappings) {
        if (!ValidateMapping(mapping)) {
            valid = false;
        }
    }

    for (const auto& mapping : m_unitSkillMappings) {
        if (!ValidateMapping(mapping)) {
            valid = false;
        }
    }

    return valid;
}

void KeyMappingManager::ExportToConfig(KeyConfig& config) const {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    config.itemMappings = m_itemMappings;
    config.heroSkillMappings = m_heroSkillMappings;
    config.unitSkillMappings = m_unitSkillMappings;
}

void KeyMappingManager::ImportFromConfig(const KeyConfig& config) {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    m_itemMappings = config.itemMappings;
    m_heroSkillMappings = config.heroSkillMappings;
    m_unitSkillMappings = config.unitSkillMappings;
}

void KeyMappingManager::CreateDefaultMappings() {
    std::lock_guard<std::mutex> lock(m_mappingsMutex);

    // 物品栏默认映射 (1-6)
    for (int i = 0; i < MAX_ITEM_SLOTS; i++) {
        KeyMapping mapping;
        mapping.type = KeyType::ITEM;
        mapping.position = i;
        mapping.originalKey = std::to_string(i + 1);
        mapping.mappedKey = std::to_string(i + 1);
        mapping.isEnabled = true;
        m_itemMappings.push_back(mapping);
    }

    // 英雄技能默认映射 (Q, W, E, R)
    const char* heroSkills[] = {"Q", "W", "E", "R"};
    for (int i = 0; i < 4; i++) {
        KeyMapping mapping;
        mapping.type = KeyType::HERO_SKILL;
        mapping.position = i;
        mapping.originalKey = heroSkills[i];
        mapping.mappedKey = heroSkills[i];
        mapping.isEnabled = true;
        m_heroSkillMappings.push_back(mapping);
    }

    LOG_INFO("创建默认按键映射");
}

std::vector<KeyMapping>* KeyMappingManager::GetMappingVector(KeyType type) {
    switch (type) {
        case KeyType::ITEM:
            return &m_itemMappings;
        case KeyType::HERO_SKILL:
            return &m_heroSkillMappings;
        case KeyType::UNIT_SKILL:
            return &m_unitSkillMappings;
        default:
            return nullptr;
    }
}

const std::vector<KeyMapping>* KeyMappingManager::GetMappingVector(KeyType type) const {
    switch (type) {
        case KeyType::ITEM:
            return &m_itemMappings;
        case KeyType::HERO_SKILL:
            return &m_heroSkillMappings;
        case KeyType::UNIT_SKILL:
            return &m_unitSkillMappings;
        default:
            return nullptr;
    }
}

bool KeyMappingManager::ValidateMapping(const KeyMapping& mapping) const {
    // 检查必要字段
    if (mapping.originalKey.empty() || mapping.mappedKey.empty()) {
        return false;
    }

    // 检查位置索引
    if (mapping.position < 0) {
        return false;
    }

    // 检查按键类型
    if (mapping.type == KeyType::UNKNOWN) {
        return false;
    }

    return true;
}
