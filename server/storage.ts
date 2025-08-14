import { type User, type InsertUser, type GameRoom, type InsertGameRoom, type Winner, type InsertWinner, type FaqItem, type InsertFaqItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGameRooms(): Promise<GameRoom[]>;
  getGameRoom(id: string): Promise<GameRoom | undefined>;
  createGameRoom(room: InsertGameRoom): Promise<GameRoom>;
  updateGameRoom(id: string, updates: Partial<GameRoom>): Promise<GameRoom | undefined>;
  
  getWinners(): Promise<Winner[]>;
  createWinner(winner: InsertWinner): Promise<Winner>;
  
  getFaqItems(): Promise<FaqItem[]>;
  createFaqItem(faq: InsertFaqItem): Promise<FaqItem>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gameRooms: Map<string, GameRoom>;
  private winners: Map<string, Winner>;
  private faqItems: Map<string, FaqItem>;

  constructor() {
    this.users = new Map();
    this.gameRooms = new Map();
    this.winners = new Map();
    this.faqItems = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample game rooms
    const sampleRooms: GameRoom[] = [
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
}

export const storage = new MemStorage();
