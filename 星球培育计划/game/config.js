// 游戏配置文件
// 星球培育计划 - 微信小游戏

// 兼容不同环境的全局对象
const GlobalObject = typeof global !== 'undefined' ? global : (typeof GameGlobal !== 'undefined' ? GameGlobal : window);

GlobalObject.GameConfig = {
  // 元素配置
  elements: {
    // 自然系
    meteorite_1: { id: 'meteorite_1', name: '原始陨石', level: 1, type: 'nature', rarity: 'common', icon: 'meteorite_1' },
    meteorite_2: { id: 'meteorite_2', name: '陨石碎片', level: 2, type: 'nature', rarity: 'common', icon: 'meteorite_2' },
    meteorite_3: { id: 'meteorite_3', name: '陨石结晶', level: 3, type: 'nature', rarity: 'common', icon: 'meteorite_3' },
    
    water_1: { id: 'water_1', name: '水滴', level: 2, type: 'nature', rarity: 'common', icon: 'water_1' },
    water_2: { id: 'water_2', name: '水珠', level: 3, type: 'nature', rarity: 'common', icon: 'water_2' },
    water_3: { id: 'water_3', name: '水流', level: 4, type: 'nature', rarity: 'uncommon', icon: 'water_3' },
    water_4: { id: 'water_4', name: '水潭', level: 5, type: 'nature', rarity: 'uncommon', icon: 'water_4' },
    water_5: { id: 'water_5', name: '湖泊', level: 6, type: 'nature', rarity: 'rare', icon: 'water_5' },
    water_6: { id: 'water_6', name: '海洋', level: 7, type: 'nature', rarity: 'rare', icon: 'water_6' },
    
    soil_1: { id: 'soil_1', name: '土壤', level: 2, type: 'nature', rarity: 'common', icon: 'soil_1' },
    soil_2: { id: 'soil_2', name: '泥土', level: 3, type: 'nature', rarity: 'common', icon: 'soil_2' },
    soil_3: { id: 'soil_3', name: '土地', level: 4, type: 'nature', rarity: 'uncommon', icon: 'soil_3' },
    soil_4: { id: 'soil_4', name: '大地', level: 5, type: 'nature', rarity: 'uncommon', icon: 'soil_4' },
    soil_5: { id: 'soil_5', name: '陆地', level: 6, type: 'nature', rarity: 'rare', icon: 'soil_5' },
    soil_6: { id: 'soil_6', name: '大陆', level: 7, type: 'nature', rarity: 'rare', icon: 'soil_6' },
    
    fire_1: { id: 'fire_1', name: '火星', level: 2, type: 'nature', rarity: 'common', icon: 'fire_1' },
    fire_2: { id: 'fire_2', name: '火苗', level: 3, type: 'nature', rarity: 'common', icon: 'fire_2' },
    fire_3: { id: 'fire_3', name: '火焰', level: 4, type: 'nature', rarity: 'uncommon', icon: 'fire_3' },
    fire_4: { id: 'fire_4', name: '烈火', level: 5, type: 'nature', rarity: 'uncommon', icon: 'fire_4' },
    fire_5: { id: 'fire_5', name: '熔岩', level: 6, type: 'nature', rarity: 'rare', icon: 'fire_5' },
    fire_6: { id: 'fire_6', name: '火山', level: 7, type: 'nature', rarity: 'rare', icon: 'fire_6' },
    
    wind_1: { id: 'wind_1', name: '微风', level: 2, type: 'nature', rarity: 'common', icon: 'wind_1' },
    wind_2: { id: 'wind_2', name: '清风', level: 3, type: 'nature', rarity: 'common', icon: 'wind_2' },
    wind_3: { id: 'wind_3', name: '强风', level: 4, type: 'nature', rarity: 'uncommon', icon: 'wind_3' },
    wind_4: { id: 'wind_4', name: '狂风', level: 5, type: 'nature', rarity: 'uncommon', icon: 'wind_4' },
    wind_5: { id: 'wind_5', name: '风暴', level: 6, type: 'nature', rarity: 'rare', icon: 'wind_5' },
    wind_6: { id: 'wind_6', name: '龙卷风', level: 7, type: 'nature', rarity: 'rare', icon: 'wind_6' },
    
    plant_1: { id: 'plant_1', name: '种子', level: 4, type: 'nature', rarity: 'uncommon', icon: 'plant_1' },
    plant_2: { id: 'plant_2', name: '嫩芽', level: 5, type: 'nature', rarity: 'uncommon', icon: 'plant_2' },
    plant_3: { id: 'plant_3', name: '小草', level: 6, type: 'nature', rarity: 'rare', icon: 'plant_3' },
    plant_4: { id: 'plant_4', name: '花朵', level: 7, type: 'nature', rarity: 'rare', icon: 'plant_4' },
    plant_5: { id: 'plant_5', name: '树木', level: 8, type: 'nature', rarity: 'epic', icon: 'plant_5' },
    plant_6: { id: 'plant_6', name: '森林', level: 9, type: 'nature', rarity: 'epic', icon: 'plant_6' },
    
    animal_1: { id: 'animal_1', name: '微生物', level: 4, type: 'nature', rarity: 'uncommon', icon: 'animal_1' },
    animal_2: { id: 'animal_2', name: '小虫', level: 5, type: 'nature', rarity: 'uncommon', icon: 'animal_2' },
    animal_3: { id: 'animal_3', name: '小鱼', level: 6, type: 'nature', rarity: 'rare', icon: 'animal_3' },
    animal_4: { id: 'animal_4', name: '小鸟', level: 7, type: 'nature', rarity: 'rare', icon: 'animal_4' },
    animal_5: { id: 'animal_5', name: '野兽', level: 8, type: 'nature', rarity: 'epic', icon: 'animal_5' },
    animal_6: { id: 'animal_6', name: '神兽', level: 9, type: 'nature', rarity: 'epic', icon: 'animal_6' },
    
    mountain_1: { id: 'mountain_1', name: '小山丘', level: 7, type: 'nature', rarity: 'rare', icon: 'mountain_1' },
    mountain_2: { id: 'mountain_2', name: '山峰', level: 8, type: 'nature', rarity: 'epic', icon: 'mountain_2' },
    mountain_3: { id: 'mountain_3', name: '山脉', level: 9, type: 'nature', rarity: 'epic', icon: 'mountain_3' },
    
    ocean_1: { id: 'ocean_1', name: '小海', level: 7, type: 'nature', rarity: 'rare', icon: 'ocean_1' },
    ocean_2: { id: 'ocean_2', name: '大海', level: 8, type: 'nature', rarity: 'epic', icon: 'ocean_2' },
    ocean_3: { id: 'ocean_3', name: '深海', level: 9, type: 'nature', rarity: 'epic', icon: 'ocean_3' },
    
    life_1: { id: 'life_1', name: '生命星球', level: 10, type: 'nature', rarity: 'legendary', icon: 'life_1' },
    
    // 科技系
    metal_1: { id: 'metal_1', name: '金属', level: 2, type: 'tech', rarity: 'common', icon: 'metal_1' },
    metal_2: { id: 'metal_2', name: '铁块', level: 3, type: 'tech', rarity: 'common', icon: 'metal_2' },
    metal_3: { id: 'metal_3', name: '钢板', level: 4, type: 'tech', rarity: 'uncommon', icon: 'metal_3' },
    metal_4: { id: 'metal_4', name: '合金', level: 5, type: 'tech', rarity: 'uncommon', icon: 'metal_4' },
    metal_5: { id: 'metal_5', name: '精金', level: 6, type: 'tech', rarity: 'rare', icon: 'metal_5' },
    metal_6: { id: 'metal_6', name: '超合金', level: 7, type: 'tech', rarity: 'rare', icon: 'metal_6' },
    
    crystal_1: { id: 'crystal_1', name: '水晶', level: 2, type: 'tech', rarity: 'common', icon: 'crystal_1' },
    crystal_2: { id: 'crystal_2', name: '宝石', level: 3, type: 'tech', rarity: 'common', icon: 'crystal_2' },
    crystal_3: { id: 'crystal_3', name: '晶石', level: 4, type: 'tech', rarity: 'uncommon', icon: 'crystal_3' },
    crystal_4: { id: 'crystal_4', name: '晶核', level: 5, type: 'tech', rarity: 'uncommon', icon: 'crystal_4' },
    crystal_5: { id: 'crystal_5', name: '能量晶', level: 6, type: 'tech', rarity: 'rare', icon: 'crystal_5' },
    crystal_6: { id: 'crystal_6', name: '源晶', level: 7, type: 'tech', rarity: 'rare', icon: 'crystal_6' },
    
    circuit_1: { id: 'circuit_1', name: '电路', level: 4, type: 'tech', rarity: 'uncommon', icon: 'circuit_1' },
    circuit_2: { id: 'circuit_2', name: '芯片', level: 5, type: 'tech', rarity: 'uncommon', icon: 'circuit_2' },
    circuit_3: { id: 'circuit_3', name: '处理器', level: 6, type: 'tech', rarity: 'rare', icon: 'circuit_3' },
    circuit_4: { id: 'circuit_4', name: '量子芯片', level: 7, type: 'tech', rarity: 'rare', icon: 'circuit_4' },
    circuit_5: { id: 'circuit_5', name: '光脑', level: 8, type: 'tech', rarity: 'epic', icon: 'circuit_5' },
    circuit_6: { id: 'circuit_6', name: '量子计算机', level: 9, type: 'tech', rarity: 'epic', icon: 'circuit_6' },
    
    machine_1: { id: 'machine_1', name: '零件', level: 4, type: 'tech', rarity: 'uncommon', icon: 'machine_1' },
    machine_2: { id: 'machine_2', name: '装置', level: 5, type: 'tech', rarity: 'uncommon', icon: 'machine_2' },
    machine_3: { id: 'machine_3', name: '机械', level: 6, type: 'tech', rarity: 'rare', icon: 'machine_3' },
    machine_4: { id: 'machine_4', name: '机器人', level: 7, type: 'tech', rarity: 'rare', icon: 'machine_4' },
    machine_5: { id: 'machine_5', name: '机甲', level: 8, type: 'tech', rarity: 'epic', icon: 'machine_5' },
    machine_6: { id: 'machine_6', name: '泰坦机甲', level: 9, type: 'tech', rarity: 'epic', icon: 'machine_6' },
    
    station_1: { id: 'station_1', name: '空间站', level: 8, type: 'tech', rarity: 'epic', icon: 'station_1' },
    station_2: { id: 'station_2', name: '星际基地', level: 9, type: 'tech', rarity: 'epic', icon: 'station_2' },
    
    city_1: { id: 'city_1', name: '未来城市', level: 10, type: 'tech', rarity: 'legendary', icon: 'city_1' },
    
    // 神秘系
    energy_1: { id: 'energy_1', name: '能量', level: 2, type: 'mystery', rarity: 'common', icon: 'energy_1' },
    energy_2: { id: 'energy_2', name: '能量球', level: 3, type: 'mystery', rarity: 'common', icon: 'energy_2' },
    energy_3: { id: 'energy_3', name: '能量核', level: 4, type: 'mystery', rarity: 'uncommon', icon: 'energy_3' },
    energy_4: { id: 'energy_4', name: '能量源', level: 5, type: 'mystery', rarity: 'uncommon', icon: 'energy_4' },
    energy_5: { id: 'energy_5', name: '能量井', level: 6, type: 'mystery', rarity: 'rare', icon: 'energy_5' },
    energy_6: { id: 'energy_6', name: '能量海', level: 7, type: 'mystery', rarity: 'rare', icon: 'energy_6' },
    
    darkmatter_1: { id: 'darkmatter_1', name: '暗物质', level: 2, type: 'mystery', rarity: 'common', icon: 'darkmatter_1' },
    darkmatter_2: { id: 'darkmatter_2', name: '暗物质团', level: 3, type: 'mystery', rarity: 'common', icon: 'darkmatter_2' },
    darkmatter_3: { id: 'darkmatter_3', name: '暗物质云', level: 4, type: 'mystery', rarity: 'uncommon', icon: 'darkmatter_3' },
    darkmatter_4: { id: 'darkmatter_4', name: '暗物质星', level: 5, type: 'mystery', rarity: 'uncommon', icon: 'darkmatter_4' },
    darkmatter_5: { id: 'darkmatter_5', name: '暗物质系', level: 6, type: 'mystery', rarity: 'rare', icon: 'darkmatter_5' },
    darkmatter_6: { id: 'darkmatter_6', name: '暗物质宇宙', level: 7, type: 'mystery', rarity: 'rare', icon: 'darkmatter_6' },
    
    magic_1: { id: 'magic_1', name: '魔法', level: 4, type: 'mystery', rarity: 'uncommon', icon: 'magic_1' },
    magic_2: { id: 'magic_2', name: '魔法阵', level: 5, type: 'mystery', rarity: 'uncommon', icon: 'magic_2' },
    magic_3: { id: 'magic_3', name: '魔法球', level: 6, type: 'mystery', rarity: 'rare', icon: 'magic_3' },
    magic_4: { id: 'magic_4', name: '魔法塔', level: 7, type: 'mystery', rarity: 'rare', icon: 'magic_4' },
    magic_5: { id: 'magic_5', name: '魔法城', level: 8, type: 'mystery', rarity: 'epic', icon: 'magic_5' },
    magic_6: { id: 'magic_6', name: '魔法界', level: 9, type: 'mystery', rarity: 'epic', icon: 'magic_6' },
    
    rune_1: { id: 'rune_1', name: '符文', level: 4, type: 'mystery', rarity: 'uncommon', icon: 'rune_1' },
    rune_2: { id: 'rune_2', name: '符文石', level: 5, type: 'mystery', rarity: 'uncommon', icon: 'rune_2' },
    rune_3: { id: 'rune_3', name: '符文板', level: 6, type: 'mystery', rarity: 'rare', icon: 'rune_3' },
    rune_4: { id: 'rune_4', name: '符文阵', level: 7, type: 'mystery', rarity: 'rare', icon: 'rune_4' },
    rune_5: { id: 'rune_5', name: '符文塔', level: 8, type: 'mystery', rarity: 'epic', icon: 'rune_5' },
    rune_6: { id: 'rune_6', name: '符文界', level: 9, type: 'mystery', rarity: 'epic', icon: 'rune_6' },
    
    stargate_1: { id: 'stargate_1', name: '星门', level: 8, type: 'mystery', rarity: 'epic', icon: 'stargate_1' },
    stargate_2: { id: 'stargate_2', name: '星际之门', level: 9, type: 'mystery', rarity: 'epic', icon: 'stargate_2' },
    
    void_1: { id: 'void_1', name: '虚空生物', level: 10, type: 'mystery', rarity: 'legendary', icon: 'void_1' }
  },
  
  // 合成配方
  synthesisRecipes: {
    // 基础合成：3个相同等级的元素合成1个更高等级的元素
    // 特殊合成：不同元素组合合成特殊元素
    specialRecipes: [
      { inputs: ['water_3', 'soil_3'], output: 'plant_1', name: '水+土壤=种子' },
      { inputs: ['plant_3', 'water_4'], output: 'animal_1', name: '植物+水=微生物' },
      { inputs: ['soil_4', 'fire_4'], output: 'mountain_1', name: '土地+火=山丘' },
      { inputs: ['water_5', 'water_5'], output: 'ocean_1', name: '湖泊+湖泊=小海' },
      { inputs: ['metal_3', 'crystal_3'], output: 'circuit_1', name: '金属+水晶=电路' },
      { inputs: ['circuit_3', 'machine_3'], output: 'station_1', name: '处理器+机械=空间站' },
      { inputs: ['energy_3', 'darkmatter_3'], output: 'magic_1', name: '能量+暗物质=魔法' },
      { inputs: ['magic_3', 'rune_3'], output: 'stargate_1', name: '魔法+符文=星门' },
      { inputs: ['plant_5', 'animal_5', 'water_5'], output: 'life_1', name: '树木+神兽+湖泊=生命星球' },
      { inputs: ['station_2', 'city_1'], output: 'city_1', name: '星际基地+未来城市=未来城市' },
      { inputs: ['stargate_2', 'void_1'], output: 'void_1', name: '星际之门+虚空生物=虚空生物' }
    ]
  },
  
  // 任务配置
  tasks: {
    daily: [
      {
        id: 'daily_synthesis_10',
        name: '合成新手',
        description: '完成10次元素合成',
        type: 'synthesis',
        target: 10,
        reward: { coins: 100, diamonds: 1 },
        refreshType: 'daily'
      },
      {
        id: 'daily_collect_5',
        name: '收集达人',
        description: '收集5种不同的元素',
        type: 'collection',
        target: 5,
        reward: { coins: 150, diamonds: 2 },
        refreshType: 'daily'
      },
      {
        id: 'daily_watch_ad_3',
        name: '广告支持者',
        description: '观看3次广告获得奖励',
        type: 'ad',
        target: 3,
        reward: { diamonds: 3 },
        refreshType: 'daily'
      },
      {
        id: 'daily_decoration_3',
        name: '装饰师',
        description: '装饰星球3次',
        type: 'decoration',
        target: 3,
        reward: { coins: 200, diamonds: 2 },
        refreshType: 'daily'
      }
    ],
    weekly: [
      {
        id: 'weekly_synthesis_50',
        name: '合成大师',
        description: '本周完成50次元素合成',
        type: 'synthesis',
        target: 50,
        reward: { coins: 1000, diamonds: 10 },
        refreshType: 'weekly'
      },
      {
        id: 'weekly_collect_20',
        name: '收藏家',
        description: '本周收集20种不同的元素',
        type: 'collection',
        target: 20,
        reward: { coins: 1500, diamonds: 15 },
        refreshType: 'weekly'
      },
      {
        id: 'weekly_level_5',
        name: '基地升级',
        description: '本周将基地升级到5级',
        type: 'baseLevel',
        target: 5,
        reward: { coins: 2000, diamonds: 20 },
        refreshType: 'weekly'
      }
    ],
    achievement: [
      {
        id: 'achievement_first_synthesis',
        name: '初次合成',
        description: '完成第一次元素合成',
        type: 'synthesis',
        target: 1,
        reward: { diamonds: 5 },
        refreshType: 'once'
      },
      {
        id: 'achievement_collect_10',
        name: '初级收集者',
        description: '收集10种不同的元素',
        type: 'collection',
        target: 10,
        reward: { diamonds: 10 },
        refreshType: 'once'
      },
      {
        id: 'achievement_collect_50',
        name: '中级收集者',
        description: '收集50种不同的元素',
        type: 'collection',
        target: 50,
        reward: { diamonds: 50 },
        refreshType: 'once'
      },
      {
        id: 'achievement_collect_all',
        name: '收集大师',
        description: '收集所有元素',
        type: 'collection',
        target: 999,
        reward: { diamonds: 200 },
        refreshType: 'once'
      },
      {
        id: 'achievement_legendary',
        name: '传奇缔造者',
        description: '合成一个传奇元素',
        type: 'legendary',
        target: 1,
        reward: { diamonds: 100 },
        refreshType: 'once'
      },
      {
        id: 'achievement_base_10',
        name: '基地大师',
        description: '将基地升级到10级',
        type: 'baseLevel',
        target: 10,
        reward: { diamonds: 100 },
        refreshType: 'once'
      }
    ]
  },
  
  // 商店配置
  shop: {
    // 新手礼包
    newbiePack: {
      id: 'newbie_pack',
      name: '新手礼包',
      description: '包含陨石、金币和钻石',
      price: 0,
      type: 'free',
      icon: 'gift',
      reward: { meteorite: 50, coins: 500, diamonds: 10 },
      limit: 1,
      condition: 'playerLevel <= 5'
    },
    
    // 钻石包
    diamondPacks: [
      {
        id: 'small_diamond_pack',
        name: '小钻石包',
        description: '60钻石 + 10赠送',
        price: 6,
        type: 'iap',
        icon: 'diamond',
        reward: { diamonds: 70 }
      },
      {
        id: 'medium_diamond_pack',
        name: '中钻石包',
        description: '300钻石 + 50赠送',
        price: 30,
        type: 'iap',
        icon: 'diamond',
        reward: { diamonds: 350 }
      },
      {
        id: 'large_diamond_pack',
        name: '大钻石包',
        description: '980钻石 + 200赠送',
        price: 98,
        type: 'iap',
        icon: 'diamond',
        reward: { diamonds: 1180 }
      }
    ],
    
    // 装饰商店
    decorations: [
      {
        id: 'decoration_tree',
        name: '魔法树',
        description: '增加5%陨石产出',
        price: 50,
        type: 'diamond',
        icon: 'tree',
        effect: { meteoriteProduction: 0.05 },
        category: 'nature'
      },
      {
        id: 'decoration_mountain',
        name: '水晶山',
        description: '增加10%陨石产出',
        price: 100,
        type: 'diamond',
        icon: 'mountain',
        effect: { meteoriteProduction: 0.1 },
        category: 'nature'
      },
      {
        id: 'decoration_house',
        name: '科技屋',
        description: '增加15%陨石产出',
        price: 150,
        type: 'diamond',
        icon: 'house',
        effect: { meteoriteProduction: 0.15 },
        category: 'tech'
      },
      {
        id: 'decoration_lake',
        name: '能量湖',
        description: '增加20%陨石产出',
        price: 200,
        type: 'diamond',
        icon: 'lake',
        effect: { meteoriteProduction: 0.2 },
        category: 'mystery'
      }
    ]
  },
  
  // 基地升级配置
  baseUpgrades: [
    { level: 1, cost: { coins: 0 }, production: 1, storage: 100 },
    { level: 2, cost: { coins: 100 }, production: 1.2, storage: 200 },
    { level: 3, cost: { coins: 300 }, production: 1.5, storage: 400 },
    { level: 4, cost: { coins: 600 }, production: 1.8, storage: 800 },
    { level: 5, cost: { coins: 1000 }, production: 2.2, storage: 1600 },
    { level: 6, cost: { coins: 2000 }, production: 2.6, storage: 3200 },
    { level: 7, cost: { coins: 4000 }, production: 3.1, storage: 6400 },
    { level: 8, cost: { coins: 8000 }, production: 3.7, storage: 12800 },
    { level: 9, cost: { coins: 16000 }, production: 4.4, storage: 25600 },
    { level: 10, cost: { coins: 32000 }, production: 5.2, storage: 51200 }
  ],
  
  // 游戏平衡参数
  balance: {
    // 陨石产出间隔（毫秒）
    meteoriteInterval: 5000,
    
    // 离线收益最大时长（小时）
    maxOfflineHours: 12,
    
    // 合成基础成功率
    baseSynthesisSuccessRate: 0.8,
    
    // 合成成功率随等级降低的幅度
    synthesisSuccessRateDecay: 0.05,
    
    // 最低合成成功率
    minSynthesisSuccessRate: 0.1,
    
    // 图鉴收集加成（每个解锁元素）
    collectionBonusPerElement: 0.1,
    
    // 装饰加成上限
    maxDecorationBonus: 2.0,
    
    // 广告奖励配置
    adRewards: {
      instantHarvest: {
        name: '立即收获',
        description: '立刻获得4小时的离线产出',
        duration: 4 * 60 * 60 * 1000 // 4小时（毫秒）
      },
      synthesisBoost: {
        name: '合成加速',
        description: '下一次合成瞬间完成',
        count: 1
      },
      doubleIncome: {
        name: '双倍收益',
        description: '接下来30分钟内，所有产出翻倍',
        duration: 30 * 60 * 1000 // 30分钟（毫秒）
      },
      extraChance: {
        name: '额外机会',
        description: '合成失败时，可保留高级材料',
        count: 1
      }
    },
    
    // 任务刷新时间
    taskRefreshTime: {
      daily: '00:00', // 每日刷新时间
      weekly: '00:00' // 每周刷新时间（周一）
    },
    
    // 新手任务
    tutorialTasks: [
      {
        id: 'tutorial_first_synthesis',
        name: '初次合成',
        description: '完成第一次元素合成',
        action: 'synthesis',
        target: 1,
        reward: { diamonds: 5 }
      },
      {
        id: 'tutorial_first_decoration',
        name: '装饰星球',
        description: '第一次装饰你的星球',
        action: 'decoration',
        target: 1,
        reward: { diamonds: 5 }
      },
      {
        id: 'tutorial_watch_ad',
        name: '观看广告',
        description: '观看一次广告获得奖励',
        action: 'watchAd',
        target: 1,
        reward: { diamonds: 3 }
      }
    ]
  },
  
  // 稀有度配置
  rarity: {
    common: { name: '普通', color: '#9e9e9e', chance: 0.6 },
    uncommon: { name: '稀有', color: '#4caf50', chance: 0.25 },
    rare: { name: '罕见', color: '#2196f3', chance: 0.1 },
    epic: { name: '史诗', color: '#9c27b0', chance: 0.04 },
    legendary: { name: '传奇', color: '#ff9800', chance: 0.01 }
  },
  
  // 活动配置
  events: {
    // 限时活动
    limitedEvents: [
      {
        id: 'event_double_collection',
        name: '双倍收集周',
        description: '本周收集元素获得双倍奖励',
        duration: 7 * 24 * 60 * 60 * 1000, // 7天
        effect: { collectionReward: 2.0 },
        icon: 'double'
      },
      {
        id: 'event_synthesis_festival',
        name: '合成节',
        description: '合成成功率提升20%',
        duration: 3 * 24 * 60 * 60 * 1000, // 3天
        effect: { synthesisBonus: 0.2 },
        icon: 'synthesis'
      },
      {
        id: 'event_meteor_shower',
        name: '流星雨',
        description: '陨石产出速度提升50%',
        duration: 2 * 24 * 60 * 60 * 1000, // 2天
        effect: { meteoriteProduction: 1.5 },
        icon: 'meteorite'
      }
    ],
    
    // 节日活动
    holidayEvents: [
      {
        id: 'event_new_year',
        name: '新年快乐',
        description: '新年特惠，所有钻石包8折',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        effect: { diamondDiscount: 0.8 },
        icon: 'newyear'
      },
      {
        id: 'event_spring_festival',
        name: '春节快乐',
        description: '春节限定元素：福字、灯笼、鞭炮',
        startDate: '2024-02-10',
        endDate: '2024-02-17',
        effect: { specialElements: ['fu', 'lantern', 'firecracker'] },
        icon: 'spring'
      }
    ]
  },
  
  // 社交配置
  social: {
    // 好友互动奖励
    friendInteraction: {
      visitReward: { coins: 50 },
      dailyVisitLimit: 10,
      giftReward: { meteorite: 10 },
      dailyGiftLimit: 5
    },
    
    // 分享奖励
    shareRewards: {
      achievementShare: { diamonds: 1 },
      planetShare: { diamonds: 1 },
      eventShare: { diamonds: 2 },
      dailyShareLimit: 5
    },
    
    // 排行榜奖励
    leaderboardRewards: {
      daily: [
        { rank: 1, reward: { diamonds: 50 } },
        { rank: 2, reward: { diamonds: 30 } },
        { rank: 3, reward: { diamonds: 20 } },
        { rank: '4-10', reward: { diamonds: 10 } },
        { rank: '11-50', reward: { diamonds: 5 } }
      ],
      weekly: [
        { rank: 1, reward: { diamonds: 200 } },
        { rank: 2, reward: { diamonds: 150 } },
        { rank: 3, reward: { diamonds: 100 } },
        { rank: '4-10', reward: { diamonds: 50 } },
        { rank: '11-50', reward: { diamonds: 25 } },
        { rank: '51-100', reward: { diamonds: 10 } }
      ]
    }
  },
  
  // 版本更新配置
  version: {
    current: '1.0.0',
    updateInfo: {
      '1.0.0': '初始版本发布，包含核心合成、放置、图鉴、装饰系统',
      '1.1.0': '新增社交系统，支持好友互访和分享',
      '1.2.0': '新增公会系统，支持多人协作',
      '1.3.0': '新增限定元素和节日活动'
    }
  }
};