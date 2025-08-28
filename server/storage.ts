import { type User, type InsertUser, type Lobby, type InsertLobby, type Winner, type InsertWinner, type FaqItem, type InsertFaqItem, type Achievement, type InsertAchievement, type UserAchievement, type InsertUserAchievement, type UserNotificationPreference, type InsertUserNotificationPreference } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGameRooms(): Promise<Lobby[]>;
  getGameRoom(id: number): Promise<Lobby | undefined>;
  createGameRoom(room: InsertLobby): Promise<Lobby>;
  updateGameRoom(id: number, updates: Partial<Lobby>): Promise<Lobby | undefined>;
  
  getWinners(): Promise<Winner[]>;
  createWinner(winner: InsertWinner): Promise<Winner>;
  
  getFaqItems(): Promise<FaqItem[]>;
  createFaqItem(faq: InsertFaqItem): Promise<FaqItem>;
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  markAchievementAsViewed(userId: number, achievementId: string): Promise<void>;
  checkAndUnlockAchievements(userId: number): Promise<UserAchievement[]>;

  // Notification preferences methods
  getUserNotificationPreference(userId: number, notificationType: string): Promise<UserNotificationPreference | undefined>;
  setUserNotificationPreference(preference: InsertUserNotificationPreference): Promise<UserNotificationPreference>;
  updateUserNotificationPreference(userId: number, notificationType: string, updates: Partial<UserNotificationPreference>): Promise<UserNotificationPreference | undefined>;
}

// Simple in-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private gameRooms: Map<number, Lobby> = new Map();
  private winners: Map<number, Winner> = new Map();
  private faqItems: Map<string, FaqItem> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<number, UserAchievement> = new Map();
  private userNotificationPreferences: Map<string, UserNotificationPreference> = new Map();
  private nextUserId = 1;
  private nextRoomId = 1;
  private nextWinnerId = 1;
  private nextAchievementUserId = 1;
  private nextNotificationPrefId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample users
    const sampleUsers: User[] = [
      {
        id: 1,
        email: "admin@bingo.com",
        password: "$2b$10$hashedpassword", // This would be properly hashed
        username: "admin",
        balance: 10000,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
      this.nextUserId = Math.max(this.nextUserId, user.id + 1);
    });

    // Sample FAQ items
    const sampleFaqs: FaqItem[] = [
      {
        id: "f1",
        question: "How do I get started playing bingo?",
        answer: "Simply sign up for a free account, make your first deposit to claim your welcome bonus, and join any available bingo room. Our tutorial will guide you through your first game!",
        order: 1
      },
      {
        id: "f2", 
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, PayPal, bank transfers, and various e-wallet options. All transactions are secured with SSL encryption.",
        order: 2
      }
    ];

    sampleFaqs.forEach(faq => this.faqItems.set(faq.id, faq));

    // Sample achievements
    const sampleAchievements: Achievement[] = [
      {
        id: "welcome",
        name: "Welcome to WildCard!",
        description: "Join the WildCard Premium Bingo community",
        icon: "🎉",
        category: "social",
        requirement: 1,
        rarity: "common",
        points: 10,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    sampleAchievements.forEach(achievement => this.achievements.set(achievement.id, achievement));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextUserId++,
      email: user.email,
      password: user.password,
      username: user.username || null,
      balance: user.balance || 1000,
      isAdmin: user.isAdmin || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getGameRooms(): Promise<Lobby[]> {
    return Array.from(this.gameRooms.values());
  }

  async getGameRoom(id: number): Promise<Lobby | undefined> {
    return this.gameRooms.get(id);
  }

  async createGameRoom(room: InsertLobby): Promise<Lobby> {
    const newRoom: Lobby = {
      id: this.nextRoomId++,
      name: room.name,
      description: room.description || null,
      entryFee: room.entryFee,
      maxGames: room.maxGames || 4,
      status: room.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.gameRooms.set(newRoom.id, newRoom);
    return newRoom;
  }

  async updateGameRoom(id: number, updates: Partial<Lobby>): Promise<Lobby | undefined> {
    const room = this.gameRooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates, updatedAt: new Date() };
    this.gameRooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async getWinners(): Promise<Winner[]> {
    return Array.from(this.winners.values());
  }

  async createWinner(winner: InsertWinner): Promise<Winner> {
    const newWinner: Winner = {
      id: this.nextWinnerId++,
      gameId: winner.gameId,
      lobbyId: winner.lobbyId || null,
      userId: winner.userId,
      amount: winner.amount || 0,
      note: winner.note || null,
      createdAt: new Date()
    };
    this.winners.set(newWinner.id, newWinner);
    return newWinner;
  }

  async getFaqItems(): Promise<FaqItem[]> {
    return Array.from(this.faqItems.values()).sort((a, b) => a.order - b.order);
  }

  async createFaqItem(faq: InsertFaqItem): Promise<FaqItem> {
    const newFaq: FaqItem = {
      ...faq,
      id: `f${Date.now()}`
    };
    this.faqItems.set(newFaq.id, newFaq);
    return newFaq;
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const newAchievement: Achievement = {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      requirement: achievement.requirement,
      rarity: achievement.rarity,
      points: achievement.points || 10,
      isActive: achievement.isActive || true,
      createdAt: new Date().toISOString()
    };
    this.achievements.set(achievement.id, newAchievement);
    return newAchievement;
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    const allAchievements = Array.from(this.userAchievements.values());
    return allAchievements.filter(ua => ua.userId === userId);
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const newUserAchievement: UserAchievement = {
      id: this.nextAchievementUserId++,
      ...userAchievement,
      unlockedAt: new Date().toISOString(),
      progress: userAchievement.progress || 100,
      isNew: userAchievement.isNew || true
    };
    this.userAchievements.set(newUserAchievement.id, newUserAchievement);
    return newUserAchievement;
  }

  async markAchievementAsViewed(userId: number, achievementId: string): Promise<void> {
    for (const userAchievement of Array.from(this.userAchievements.values())) {
      if (userAchievement.userId === userId && userAchievement.achievementId === achievementId) {
        userAchievement.isNew = false;
        break;
      }
    }
  }

  async checkAndUnlockAchievements(userId: number): Promise<UserAchievement[]> {
    // Simple implementation - just unlock welcome achievement for new users
    const existingAchievements = await this.getUserAchievements(userId);
    const hasWelcome = existingAchievements.some(ua => ua.achievementId === "welcome");
    
    if (!hasWelcome) {
      const welcomeAchievement = await this.createUserAchievement({
        userId,
        achievementId: "welcome",
        progress: 100,
        isNew: true
      });
      return [welcomeAchievement];
    }
    
    return [];
  }

  async getUserNotificationPreference(userId: number, notificationType: string): Promise<UserNotificationPreference | undefined> {
    const key = `${userId}-${notificationType}`;
    const preference = this.userNotificationPreferences.get(key);
    
    // Check if preference exists and if it's within 24 hours of dismissal
    if (preference && preference.isDismissed && preference.dismissedAt) {
      const dismissedTime = new Date(preference.dismissedAt).getTime();
      const now = new Date().getTime();
      const hoursSinceDismissal = (now - dismissedTime) / (1000 * 60 * 60);
      
      // Reset if 24 hours have passed
      if (hoursSinceDismissal >= 24) {
        preference.isDismissed = false;
        preference.dismissedAt = null;
        preference.updatedAt = new Date();
      }
    }
    
    return preference;
  }

  async setUserNotificationPreference(preference: InsertUserNotificationPreference): Promise<UserNotificationPreference> {
    const key = `${preference.userId}-${preference.notificationType}`;
    const newPreference: UserNotificationPreference = {
      id: this.nextNotificationPrefId++,
      ...preference,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userNotificationPreferences.set(key, newPreference);
    return newPreference;
  }

  async updateUserNotificationPreference(userId: number, notificationType: string, updates: Partial<UserNotificationPreference>): Promise<UserNotificationPreference | undefined> {
    const key = `${userId}-${notificationType}`;
    const existing = this.userNotificationPreferences.get(key);
    
    if (!existing) {
      // Create if doesn't exist
      return this.setUserNotificationPreference({
        userId,
        notificationType,
        isDismissed: updates.isDismissed ?? false,
        dismissedAt: updates.dismissedAt ?? null
      });
    }
    
    // Update existing
    const updated: UserNotificationPreference = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    
    this.userNotificationPreferences.set(key, updated);
    return updated;
  }
}

export const storage = new MemStorage();