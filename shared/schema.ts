// Database schema definitions for the bingo game application
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

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
  gameId: integer("game_id").references(() => games.id),
  lobbyId: integer("lobby_id").references(() => lobbies.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: real("amount").notNull().default(0),
  note: text("note"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

// Lobbies for game rooms
export const lobbies = sqliteTable("lobbies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  entryFee: real("entry_fee").notNull(),
  maxSeats: integer("max_seats").notNull().default(15),
  seatsTaken: integer("seats_taken").notNull().default(0),
  status: text("status").notNull().default('waiting'), // 'waiting', 'active', 'finished'
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

// Games for individual game sessions
export const games = sqliteTable("games", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lobbyId: integer("lobby_id").references(() => lobbies.id).notNull(),
  winnerId: integer("winner_id").references(() => users.id),
  status: text("status").notNull().default('waiting'), // 'waiting', 'active', 'finished'
  drawnNumbers: text("drawn_numbers").default('[]'), // JSON array of drawn numbers
  currentNumber: integer("current_number"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

// Game participants (many-to-many relationship)
export const gameParticipants = sqliteTable("game_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameId: integer("game_id").references(() => games.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  seatNumber: integer("seat_number").notNull(),
  card: text("card").notNull(), // JSON array of bingo card numbers
  isWinner: integer("is_winner", { mode: 'boolean' }).default(false),
  joinedAt: integer("joined_at", { mode: 'timestamp' }).default(new Date()),
});

// Lobby participants (for seat management)
export const lobbyParticipants = sqliteTable("lobby_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lobbyId: integer("lobby_id").references(() => lobbies.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  seatNumber: integer("seat_number").notNull(),
  joinedAt: integer("joined_at", { mode: 'timestamp' }).default(new Date()),
});
