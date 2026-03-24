// 游戏配置文件
export const GAME_CONFIG = {
  // 屏幕尺寸
  SCREEN_WIDTH: 750,
  SCREEN_HEIGHT: 1334,
  
  // 游戏平衡参数
  HERO: {
    INITIAL_HEALTH: 100,
    DAMAGE_REDUCTION: 0.1,
    SPEED: 8,
    SHOOT_COOLDOWN: 500 // 毫秒
  },
  
  ENEMY: {
    CASTLE_HEALTH: 200,
    TOWER_HEALTH: 100,
    BOSS_HEALTH: 500,
    CASTLE_DAMAGE: 10,
    TOWER_DAMAGE: 5,
    BOSS_DAMAGE: 20
  },
  
  SLINGSHOT: {
    MAX_PULL_DISTANCE: 150,
    MIN_PULL_DISTANCE: 30,
    POWER_MULTIPLIER: 0.8,
    ANGLE_ADJUSTMENT: 0.1
  },
  
  RUNE: {
    DROP_RATE: 0.3, // 30%掉率
    COMBO_BONUS: 1.5, // 组合加成
    TYPES: ['attack', 'defense', 'special']
  },
  
  LEVEL: {
    ENEMY_SPAWN_INTERVAL: 2000, // 毫秒
    WAVE_SIZE: 5,
    BOSS_LEVEL_INTERVAL: 5
  }
};

// 英雄类型配置
export const HERO_TYPES = {
  STONE_WARRIOR: {
    id: 'stone_warrior',
    name: '石头战士',
    damage: 25,
    speed: 6,
    specialAbility: 'stone_blast',
    description: '基础型英雄，攻击力稳定'
  },
  
  FIRE_MAGE: {
    id: 'fire_mage',
    name: '火焰法师',
    damage: 35,
    speed: 5,
    specialAbility: 'fire_storm',
    description: '高攻击力，附带燃烧效果'
  },
  
  LIGHTNING_NINJA: {
    id: 'lightning_ninja',
    name: '闪电忍者',
    damage: 20,
    speed: 10,
    specialAbility: 'chain_lightning',
    description: '高速度，可连锁攻击'
  },
  
  HEALING_WATER: {
    id: 'healing_water',
    name: '治愈之水',
    damage: 15,
    speed: 7,
    specialAbility: 'heal_aura',
    description: '治疗友军，持续恢复生命'
  },
  
  ICE_ARCHER: {
    id: 'ice_archer',
    name: '冰霜射手',
    damage: 30,
    speed: 8,
    specialAbility: 'freeze_shot',
    description: '减速敌人，控制战场'
  }
};

// 敌人类型配置
export const ENEMY_TYPES = {
  CASTLE: {
    id: 'castle',
    name: '普通城堡',
    health: 200,
    damage: 10,
    speed: 0,
    reward: 10
  },
  
  DEFENSE_TOWER: {
    id: 'tower',
    name: '防御塔',
    health: 100,
    damage: 5,
    speed: 0,
    reward: 15
  },
  
  BOSS_CASTLE: {
    id: 'boss_castle',
    name: 'Boss城堡',
    health: 500,
    damage: 20,
    speed: 0,
    reward: 50
  }
};

// 符文配置
export const RUNE_CONFIG = {
  ATTACK_RUNES: [
    { id: 'power_strike', name: '强力打击', effect: 'damage_bonus', value: 1.2 },
    { id: 'critical_hit', name: '暴击', effect: 'crit_chance', value: 0.15 },
    { id: 'rapid_fire', name: '急速射击', effect: 'attack_speed', value: 1.3 }
  ],
  
  DEFENSE_RUNES: [
    { id: 'shield_wall', name: '护盾壁垒', effect: 'damage_reduction', value: 0.2 },
    { id: 'life_steal', name: '生命汲取', effect: 'lifesteal', value: 0.1 },
    { id: 'thorns_armor', name: '荆棘护甲', effect: 'reflect_damage', value: 0.15 }
  ],
  
  SPECIAL_RUNES: [
    { id: 'gold_rush', name: '金币狂潮', effect: 'gold_bonus', value: 2.0 },
    { id: 'experience_boost', name: '经验加成', effect: 'exp_bonus', value: 1.5 },
    { id: 'lucky_drop', name: '幸运掉落', effect: 'drop_rate', value: 2.0 }
  ]
};