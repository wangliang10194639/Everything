#pragma once

#include "Common.h"
#include <vector>
#include <string>

// 按键映射管理类
class KeyMappingManager {
private:
    std::vector<KeyMapping> m_itemMappings;        // 物品栏映射
    std::vector<KeyMapping> m_heroSkillMappings;   // 英雄技能映射
    std::vector<KeyMapping> m_unitSkillMappings;   // 单位技能映射
    mutable std::mutex m_mappingsMutex;

public:
    KeyMappingManager();
    ~KeyMappingManager();

    // 添加映射
    bool AddMapping(const KeyMapping& mapping);
    
    // 移除映射
    bool RemoveMapping(KeyType type, int position);
    
    // 更新映射
    bool UpdateMapping(const KeyMapping& mapping);
    
    // 获取映射
    KeyMapping* FindMapping(DWORD virtualKey, KeyType type);
    const KeyMapping* FindMapping(DWORD virtualKey, KeyType type) const;
    
    // 获取指定类型的所有映射
    std::vector<KeyMapping> GetMappings(KeyType type) const;
    
    // 设置映射
    void SetItemMappings(const std::vector<KeyMapping>& mappings);
    void SetHeroSkillMappings(const std::vector<KeyMapping>& mappings);
    void SetUnitSkillMappings(const std::vector<KeyMapping>& mappings);
    
    // 清空所有映射
    void ClearAllMappings();
    void ClearMappings(KeyType type);
    
    // 启用/禁用映射
    bool EnableMapping(KeyType type, int position, bool enable);
    
    // 检查映射是否存在
    bool HasMapping(DWORD virtualKey, KeyType type) const;
    
    // 获取映射数量
    size_t GetMappingCount(KeyType type) const;
    
    // 验证映射配置
    bool ValidateMappings() const;
    
    // 导出映射到配置结构
    void ExportToConfig(KeyConfig& config) const;
    
    // 从配置结构导入映射
    void ImportFromConfig(const KeyConfig& config);
    
    // 创建默认映射
    void CreateDefaultMappings();
    
private:
    // 查找映射的内部实现
    std::vector<KeyMapping>* GetMappingVector(KeyType type);
    const std::vector<KeyMapping>* GetMappingVector(KeyType type) const;
    
    // 验证单个映射
    bool ValidateMapping(const KeyMapping& mapping) const;
};