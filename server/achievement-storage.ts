import { type Achievement, type UserAchievement } from "@shared/schema";

// Simple in-memory achievement storage for demo purposes
export class AchievementStorage {
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement[]> = new Map();

  constructor() {
    this.initializeSampleAchievements();
  }

  private initializeSampleAchievements() {
    const sampleAchievements: Achievement[] = [
      {
        id: "first_game",
        name: "First Game",
        description: "Play your first bingo game",
        icon: "🎯",
        category: "games",
        requirement: 1,
        rarity: "common",
        points: 10,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "early_bird",
        name: "Early Bird",
        description: "Join a game room within 5 minutes of it opening",
        icon: "🐦",
        category: "games",
        requirement: 1,
        rarity: "rare",
        points: 25,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "game_master",
        name: "Game Master",
        description: "Win 10 bingo games",
        icon: "👑",
        category: "games",
        requirement: 10,
        rarity: "epic",
        points: 100,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "social_butterfly",
        name: "Social Butterfly",
        description: "Join 5 different game rooms",
        icon: "🦋",
        category: "social",
        requirement: 5,
        rarity: "rare",
        points: 50,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "balance_keeper",
        name: "Balance Keeper",
        description: "Add funds to your account",
        icon: "💰",
        category: "milestone",
        requirement: 1,
        rarity: "common",
        points: 15,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "high_roller",
        name: "High Roller",
        description: "Maintain a balance of $500 or more",
        icon: "💎",
        category: "milestone",
        requirement: 500,
        rarity: "legendary",
        points: 200,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "lucky_seven",
        name: "Lucky Seven",
        description: "Win 7 games in a row",
        icon: "🍀",
        category: "special",
        requirement: 7,
        rarity: "legendary",
        points: 500,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    sampleAchievements.forEach(achievement => 
      this.achievements.set(achievement.id, achievement)
    );
  }

  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.isActive);
  }

  getUserAchievements(userId: number): UserAchievement[] {
    return this.userAchievements.get(userId.toString()) || [];
  }

  createUserAchievement(userId: number, achievementId: string): UserAchievement {
    const userAchievement: UserAchievement = {
      id: Date.now(),
      userId,
      achievementId,
      unlockedAt: new Date().toISOString(),
      progress: this.achievements.get(achievementId)?.requirement || 0,
      isNew: true
    };

    const userAchievements = this.getUserAchievements(userId);
    userAchievements.push(userAchievement);
    this.userAchievements.set(userId.toString(), userAchievements);
    
    return userAchievement;
  }

  markAchievementAsViewed(userId: number, achievementId: string): void {
    const userAchievements = this.getUserAchievements(userId);
    const achievement = userAchievements.find(ua => ua.achievementId === achievementId);
    if (achievement) {
      achievement.isNew = false;
    }
  }

  checkAndUnlockAchievements(userId: number, userBalance: number): UserAchievement[] {
    const userAchievements = this.getUserAchievements(userId);
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
    const newlyUnlocked: UserAchievement[] = [];

    // Check balance-based achievements
    if (!unlockedIds.has("balance_keeper") && userBalance > 1000) {
      newlyUnlocked.push(this.createUserAchievement(userId, "balance_keeper"));
    }

    if (!unlockedIds.has("high_roller") && userBalance >= 5000) {
      newlyUnlocked.push(this.createUserAchievement(userId, "high_roller"));
    }

    return newlyUnlocked;
  }
}

export const achievementStorage = new AchievementStorage();