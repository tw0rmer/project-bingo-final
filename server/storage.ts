import { type User, type InsertUser, type Lobby, type InsertLobby, type Winner, type InsertWinner, type FaqItem, type InsertFaqItem, type Achievement, type InsertAchievement, type UserAchievement, type InsertUserAchievement } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameRooms: Map<number, Lobby>;
  private winners: Map<number, Winner>;
  private faqItems: Map<string, FaqItem>;
  private achievements: Map<string, Achievement>;
  private userAchievements: Map<number, UserAchievement>;

  constructor() {
    this.users = new Map();
    this.gameRooms = new Map();
    this.winners = new Map();
    this.faqItems = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample game rooms
    const sampleRooms: Lobby[] = [
      {
        id: "1",
        name: "Bingo-Go-The-Go!",
        roomNumber: 1847,
        currentPlayers: 12,
        maxPlayers: 15,
        prizePool: 250,
        entryFee: 5,
        status: "open",
        startsIn: 2,
        category: "regular"
      },
      {
        id: "2",
        name: "Bingo 101",
        roomNumber: 1848,
        currentPlayers: 8,
        maxPlayers: 15,
        prizePool: 180,
        entryFee: 3,
        status: "waiting",
        startsIn: 5,
        category: "regular"
      },
      {
        id: "3",
        name: "Friday $1000 Special",
        roomNumber: 1849,
        currentPlayers: 15,
        maxPlayers: 15,
        prizePool: 1000,
        entryFee: 25,
        status: "playing",
        startsIn: 0,
        category: "premium"
      },
      {
        id: "4",
        name: "Bingo-Go-The-Go!",
        roomNumber: 1850,
        currentPlayers: 6,
        maxPlayers: 15,
        prizePool: 250,
        entryFee: 5,
        status: "open",
        startsIn: 8,
        category: "regular"
      },
      {
        id: "5",
        name: "Bingo 101",
        roomNumber: 1851,
        currentPlayers: 10,
        maxPlayers: 15,
        prizePool: 180,
        entryFee: 3,
        status: "open",
        startsIn: 12,
        category: "regular"
      },
      {
        id: "6",
        name: "Friday $1000 Special",
        roomNumber: 1852,
        currentPlayers: 3,
        maxPlayers: 15,
        prizePool: 1000,
        entryFee: 25,
        status: "waiting",
        startsIn: 15,
        category: "premium"
      }
    ];

    sampleRooms.forEach(room => this.gameRooms.set(room.id, room));

    // Sample winners
    const sampleWinners: Winner[] = [
      {
        id: "w1",
        name: "Sarah M.",
        location: "California",
        amount: 1250,
        game: "Friday Special Room",
        testimonial: "Amazing experience! The 15x5 format gives so many more chances to win. I'll definitely be back!",
        createdAt: new Date()
      },
      {
        id: "w2",
        name: "Robert K.",
        location: "Texas",
        amount: 875,
        game: "Bingo-Go-The-Go",
        testimonial: "Fast payouts and fair play. This is my new favorite bingo site!",
        createdAt: new Date()
      },
      {
        id: "w3",
        name: "Linda S.",
        location: "Florida",
        amount: 650,
        game: "Bingo 101",
        testimonial: "Love the community feel and the exciting gameplay. Highly recommended!",
        createdAt: new Date()
      }
    ];

    sampleWinners.forEach(winner => this.winners.set(winner.id, winner));

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
      },
      {
        id: "f3",
        question: "How does the 15x5 program work?",
        answer: "Our unique 15x5 bingo cards have 15 rows and 5 columns, giving you 75 numbers instead of the traditional 25. This means more chances to win and more exciting gameplay!",
        order: 3
      },
      {
        id: "f4",
        question: "Is my personal information secure?",
        answer: "Absolutely! We use bank-level SSL encryption to protect all your personal and financial information. We are also licensed and regulated by gaming authorities.",
        order: 4
      },
      {
        id: "f5",
        question: "How do withdrawals work?",
        answer: "Withdrawals are processed within 24-48 hours to the same method you used to deposit. All winnings are automatically credited to your account balance.",
        order: 5
      }
    ];

    sampleFaqs.forEach(faq => this.faqItems.set(faq.id, faq));
    
    // Initialize sample achievements
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

    sampleAchievements.forEach(achievement => this.achievements.set(achievement.id, achievement));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGameRooms(): Promise<GameRoom[]> {
    return Array.from(this.gameRooms.values());
  }

  async getGameRoom(id: string): Promise<GameRoom | undefined> {
    return this.gameRooms.get(id);
  }

  async createGameRoom(insertRoom: InsertGameRoom): Promise<GameRoom> {
    const id = randomUUID();
    const room: GameRoom = { ...insertRoom, id };
    this.gameRooms.set(id, room);
    return room;
  }

  async updateGameRoom(id: string, updates: Partial<GameRoom>): Promise<GameRoom | undefined> {
    const room = this.gameRooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.gameRooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async getWinners(): Promise<Winner[]> {
    return Array.from(this.winners.values());
  }

  async createWinner(insertWinner: InsertWinner): Promise<Winner> {
    const id = randomUUID();
    const winner: Winner = { ...insertWinner, id, createdAt: new Date() };
    this.winners.set(id, winner);
    return winner;
  }

  async getFaqItems(): Promise<FaqItem[]> {
    return Array.from(this.faqItems.values()).sort((a, b) => a.order - b.order);
  }

  async createFaqItem(insertFaq: InsertFaqItem): Promise<FaqItem> {
    const id = randomUUID();
    const faq: FaqItem = { ...insertFaq, id };
    this.faqItems.set(id, faq);
    return faq;
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(a => a.isActive);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = { 
      ...insertAchievement, 
      id,
      createdAt: new Date().toISOString()
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(ua => ua.userId === userId);
  }

  async createUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = Date.now(); // Simple ID for in-memory storage
    const userAchievement: UserAchievement = { 
      ...insertUserAchievement, 
      id,
      unlockedAt: new Date().toISOString()
    };
    this.userAchievements.set(id.toString(), userAchievement);
    return userAchievement;
  }

  async markAchievementAsViewed(userId: number, achievementId: string): Promise<void> {
    const userAchievement = Array.from(this.userAchievements.values())
      .find(ua => ua.userId === userId && ua.achievementId === achievementId);
    
    if (userAchievement) {
      userAchievement.isNew = false;
      this.userAchievements.set(userAchievement.id.toString(), userAchievement);
    }
  }

  async checkAndUnlockAchievements(userId: number): Promise<UserAchievement[]> {
    const user = Array.from(this.users.values()).find(u => u.id === userId.toString());
    if (!user) return [];

    const userAchievements = await this.getUserAchievements(userId);
    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
    const allAchievements = await this.getAchievements();
    const newlyUnlocked: UserAchievement[] = [];

    for (const achievement of allAchievements) {
      if (unlockedAchievementIds.has(achievement.id)) continue;

      let shouldUnlock = false;
      let progress = 0;

      // Check achievement conditions
      switch (achievement.id) {
        case "balance_keeper":
          shouldUnlock = user.balance > 0;
          progress = user.balance > 0 ? 1 : 0;
          break;
        case "high_roller":
          shouldUnlock = user.balance >= 500;
          progress = Math.min(user.balance, 500);
          break;
        // Add more achievement logic here as needed
      }

      if (shouldUnlock) {
        const newAchievement = await this.createUserAchievement({
          userId,
          achievementId: achievement.id,
          progress: achievement.requirement,
          isNew: true
        });
        newlyUnlocked.push(newAchievement);
      }
    }

    return newlyUnlocked;
  }
}

export const storage = new MemStorage();
