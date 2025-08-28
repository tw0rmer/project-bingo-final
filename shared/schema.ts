// Database schema definitions for the bingo game application
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username"),
  balance: real("balance").notNull().default(1000.00),
  isAdmin: integer("is_admin", { mode: 'boolean' }).notNull().default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

// Wallet transactions for balance tracking
export const walletTransactions = sqliteTable("wallet_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'game_entry', 'game_win'
  description: text("description"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

// Winners table for public display and admin control
export const winners = sqliteTable("winners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameId: integer("game_id").references(() => games.id).notNull(),
  lobbyId: integer("lobby_id").references(() => lobbies.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: real("amount").notNull().default(0),
  note: text("note"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

// Lobbies for game room collections
export const lobbies = sqliteTable("lobbies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  entryFee: real("entry_fee").notNull(),
  maxGames: integer("max_games").notNull().default(4), // Maximum games in this lobby
  status: text("status").notNull().default('active'), // 'active', 'inactive'
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

// Games for individual game sessions within lobbies
export const games = sqliteTable("games", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lobbyId: integer("lobby_id").references(() => lobbies.id).notNull(),
  name: text("name").notNull(),
  gameNumber: integer("game_number").notNull(), // Game 1, Game 2, etc. within the lobby
  maxSeats: integer("max_seats").notNull().default(15),
  seatsTaken: integer("seats_taken").notNull().default(0),
  winnerId: integer("winner_id").references(() => users.id),
  status: text("status").notNull().default('waiting'), // 'waiting', 'active', 'finished'
  drawnNumbers: text("drawn_numbers").default('[]'), // JSON array of drawn numbers
  currentNumber: integer("current_number"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

// Game participants (for seat management within specific games)
export const gameParticipants = sqliteTable("game_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameId: integer("game_id").references(() => games.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  seatNumber: integer("seat_number").notNull(),
  card: text("card").notNull(), // JSON array of bingo card numbers
  isWinner: integer("is_winner", { mode: 'boolean' }).default(false),
  joinedAt: integer("joined_at", { mode: 'timestamp' }).default(new Date()),
});

// Legacy lobby participants table - keep for backward compatibility during migration
export const lobbyParticipants = sqliteTable("lobby_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lobbyId: integer("lobby_id").references(() => lobbies.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  seatNumber: integer("seat_number").notNull(),
  joinedAt: integer("joined_at", { mode: 'timestamp' }).default(new Date()),
});

// FAQ Items for help section
export const faqItems = sqliteTable("faq_items", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").notNull(),
});

// Achievement Badges Schema
export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // emoji or icon name
  category: text("category").notNull(), // games, social, milestone, special
  requirement: integer("requirement").notNull(), // threshold number
  rarity: text("rarity").notNull(), // common, rare, epic, legendary
  points: integer("points").notNull().default(10), // achievement points
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const userAchievements = sqliteTable("user_achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: text("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: text("unlocked_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  progress: integer("progress").notNull().default(0), // current progress toward achievement
  isNew: integer("is_new", { mode: "boolean" }).notNull().default(true), // for notification display
});

// Type definitions
export type User = typeof users.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type Winner = typeof winners.$inferSelect;
export type Lobby = typeof lobbies.$inferSelect;
export type Game = typeof games.$inferSelect;
export type GameParticipant = typeof gameParticipants.$inferSelect;
export type LobbyParticipant = typeof lobbyParticipants.$inferSelect;
export type FaqItem = typeof faqItems.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertWalletTransactionSchema = createInsertSchema(walletTransactions);
export const insertWinnerSchema = createInsertSchema(winners);
export const insertLobbySchema = createInsertSchema(lobbies);
export const insertGameSchema = createInsertSchema(games);
export const insertGameParticipantSchema = createInsertSchema(gameParticipants);
export const insertLobbyParticipantSchema = createInsertSchema(lobbyParticipants);
export const insertFaqItemSchema = createInsertSchema(faqItems);
export const insertAchievementSchema = createInsertSchema(achievements);
export const insertUserAchievementSchema = createInsertSchema(userAchievements);

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type InsertWinner = z.infer<typeof insertWinnerSchema>;
export type InsertLobby = z.infer<typeof insertLobbySchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertGameParticipant = z.infer<typeof insertGameParticipantSchema>;
export type InsertLobbyParticipant = z.infer<typeof insertLobbyParticipantSchema>;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
