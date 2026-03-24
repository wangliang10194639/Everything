import Emitter from '/js/libs/tinyemitter';
import { GAME_CONFIG } from '/js/config/gameConfig';

/**
 * 商店管理系统
 * 处理游戏内购、货币系统和物品购买
 */
export default class ShopManager extends Emitter {
  constructor() {
    super();
    this.coins = wx.getStorageSync('coins') || 0;
    this.diamonds = wx.getStorageSync('diamonds') || 0;
    this.hasNoAds = wx.getStorageSync('no_ads') || false;
    this.ownedHeroes = wx.getStorageSync('owned_heroes') || ['stone_warrior'];
    this.selectedHero = wx.getStorageSync('selected_hero') || 'stone_warrior';
    
    this.shopItems = this.initShopItems();
    this.dailyRewards = this.initDailyRewards();
  }
  
  // 初始化商店物品
  initShopItems() {
    return {
      heroes: [
        {
          id: 'fire_mage',
          name: '火焰法师',
          price: 100,
          currency: 'diamonds',
          type: 'hero',
          purchased: this.ownedHeroes.includes('fire_mage')
        },
        {
          id: 'lightning_ninja',
          name: '闪电忍者',
          price: 150,
          currency: 'diamonds',
          type: 'hero',
          purchased: this.ownedHeroes.includes('lightning_ninja')
        },
        {
          id: 'healing_water',
          name: '治愈之水',
          price: 120,
          currency: 'diamonds',
          type: 'hero',
          purchased: this.ownedHeroes.includes('healing_water')
        },
        {
          id: 'ice_archer',
          name: '冰霜射手',
          price: 180,
          currency: 'diamonds',
          type: 'hero',
          purchased: this.ownedHeroes.includes('ice_archer')
        }
      ],
      
      consumables: [
        {
          id: 'coin_pack_small',
          name: '小金币包',
          price: 6,
          currency: 'rmb',
          type: 'coins',
          amount: 500,
          bonus: 0
        },
        {
          id: 'coin_pack_medium',
          name: '中金币包',
          price: 12,
          currency: 'rmb',
          type: 'coins',
          amount: 1200,
          bonus: 0.2
        },
        {
          id: 'coin_pack_large',
          name: '大金币包',
          price: 30,
          currency: 'rmb',
          type: 'coins',
          amount: 3500,
          bonus: 0.5
        },
        {
          id: 'diamond_pack_small',
          name: '小钻石包',
          price: 6,
          currency: 'rmb',
          type: 'diamonds',
          amount: 60
        },
        {
          id: 'diamond_pack_medium',
          name: '中钻石包',
          price: 30,
          currency: 'rmb',
          type: 'diamonds',
          amount: 350,
          bonus: 0.2
        },
        {
          id: 'diamond_pack_large',
          name: '大钻石包',
          price: 98,
          currency: 'rmb',
          type: 'diamonds',
          amount: 1200,
          bonus: 0.5
        }
      ],
      
      special: [
        {
          id: 'no_ads',
          name: '去除广告',
          price: 18,
          currency: 'rmb',
          type: 'no_ads',
          purchased: this.hasNoAds
        },
        {
          id: 'monthly_card',
          name: '月卡VIP',
          price: 18,
          currency: 'rmb',
          type: 'monthly_card',
          duration: 30, // 天
          dailyReward: 100 // 每日金币奖励
        }
      ]
    };
  }
  
  // 初始化每日奖励
  initDailyRewards() {
    return [
      { day: 1, reward: { type: 'coins', amount: 100 } },
      { day: 2, reward: { type: 'coins', amount: 150 } },
      { day: 3, reward: { type: 'diamonds', amount: 10 } },
      { day: 4, reward: { type: 'coins', amount: 200 } },
      { day: 5, reward: { type: 'coins', amount: 250 } },
      { day: 6, reward: { type: 'diamonds', amount: 15 } },
      { day: 7, reward: { type: 'coins', amount: 500 }, bonus: true }
    ];
  }
  
  // 购买物品
  purchaseItem(itemId, itemType) {
    const item = this.findItemById(itemId, itemType);
    if (!item) {
      this.emit('purchaseError', '商品不存在');
      return false;
    }
    
    if (item.purchased) {
      this.emit('purchaseError', '已拥有该商品');
      return false;
    }
    
    // 检查货币是否足够
    if (item.currency === 'rmb') {
      // 实际支付需要接入微信支付SDK
      this.processPayment(item);
    } else {
      if (this[item.currency] >= item.price) {
        this[item.currency] -= item.price;
        this.completePurchase(item);
        return true;
      } else {
        this.emit('purchaseError', '货币不足');
        return false;
      }
    }
  }
  
  // 查找商品
  findItemById(itemId, itemType) {
    for (let category in this.shopItems) {
      const items = this.shopItems[category];
      const item = items.find(item => item.id === itemId && item.type === itemType);
      if (item) return item;
    }
    return null;
  }
  
  // 处理支付
  processPayment(item) {
    // 这里应该接入微信支付SDK
    // 模拟支付成功
    setTimeout(() => {
      this.completePurchase(item);
    }, 1000);
  }
  
  // 完成购买
  completePurchase(item) {
    switch (item.type) {
      case 'hero':
        this.ownedHeroes.push(item.id);
        wx.setStorageSync('owned_heroes', this.ownedHeroes);
        break;
        
      case 'coins':
        const bonusAmount = Math.floor(item.amount * (item.bonus || 0));
        this.addCoins(item.amount + bonusAmount);
        break;
        
      case 'diamonds':
        const diamondBonus = Math.floor(item.amount * (item.bonus || 0));
        this.addDiamonds(item.amount + diamondBonus);
        break;
        
      case 'no_ads':
        this.hasNoAds = true;
        wx.setStorageSync('no_ads', true);
        break;
        
      case 'monthly_card':
        // 处理月卡逻辑
        this.activateMonthlyCard(item.duration, item.dailyReward);
        break;
    }
    
    item.purchased = true;
    this.saveData();
    this.emit('purchaseSuccess', item);
  }
  
  // 添加金币
  addCoins(amount) {
    this.coins += amount;
    wx.setStorageSync('coins', this.coins);
    this.emit('coinsChanged', this.coins);
  }
  
  // 添加钻石
  addDiamonds(amount) {
    this.diamonds += amount;
    wx.setStorageSync('diamonds', this.diamonds);
    this.emit('diamondsChanged', this.diamonds);
  }
  
  // 激活月卡
  activateMonthlyCard(duration, dailyReward) {
    const expireTime = Date.now() + (duration * 24 * 60 * 60 * 1000);
    wx.setStorageSync('monthly_card_expire', expireTime);
    wx.setStorageSync('daily_reward_amount', dailyReward);
    this.emit('monthlyCardActivated', { expireTime, dailyReward });
  }
  
  // 检查月卡是否有效
  isMonthlyCardValid() {
    const expireTime = wx.getStorageSync('monthly_card_expire');
    return expireTime && Date.now() < expireTime;
  }
  
  // 获取每日签到奖励
  getDailyReward(day) {
    const rewardData = this.dailyRewards[day - 1];
    if (rewardData) {
      if (rewardData.reward.type === 'coins') {
        this.addCoins(rewardData.reward.amount);
      } else if (rewardData.reward.type === 'diamonds') {
        this.addDiamonds(rewardData.reward.amount);
      }
      
      this.emit('dailyRewardReceived', rewardData);
      return rewardData;
    }
    return null;
  }
  
  // 选择英雄
  selectHero(heroId) {
    if (this.ownedHeroes.includes(heroId)) {
      this.selectedHero = heroId;
      wx.setStorageSync('selected_hero', heroId);
      this.emit('heroSelected', heroId);
      return true;
    }
    return false;
  }
  
  // 获取拥有的英雄列表
  getOwnedHeroes() {
    return this.ownedHeroes;
  }
  
  // 获取当前选中的英雄
  getSelectedHero() {
    return this.selectedHero;
  }
  
  // 保存数据
  saveData() {
    wx.setStorageSync('coins', this.coins);
    wx.setStorageSync('diamonds', this.diamonds);
    wx.setStorageSync('owned_heroes', this.ownedHeroes);
    wx.setStorageSync('selected_hero', this.selectedHero);
  }
  
  // 获取商店数据
  getShopData() {
    return {
      coins: this.coins,
      diamonds: this.diamonds,
      ownedHeroes: this.ownedHeroes,
      selectedHero: this.selectedHero,
      shopItems: this.shopItems,
      hasNoAds: this.hasNoAds,
      isMonthlyCardValid: this.isMonthlyCardValid()
    };
  }
}