// Type definitions for the bingo game application
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, walletTransactions, lobbies, games, gameParticipants, lobbyParticipants } from './schema';

// User types
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

// Wallet transaction types
export type WalletTransaction = InferSelectModel<typeof walletTransactions>;
export type InsertWalletTransaction = InferInsertModel<typeof walletTransactions>;

// Lobby types
export type Lobby = InferSelectModel<typeof lobbies>;
export type InsertLobby = InferInsertModel<typeof lobbies>;

// Game types
export type Game = InferSelectModel<typeof games>;
export type InsertGame = InferInsertModel<typeof games>;

// Game participant types
export type GameParticipant = InferSelectModel<typeof gameParticipants>;
export type InsertGameParticipant = InferInsertModel<typeof gameParticipants>;

// Lobby participant types
export type LobbyParticipant = InferSelectModel<typeof lobbyParticipants>;
export type InsertLobbyParticipant = InferInsertModel<typeof lobbyParticipants>;

// API Response Types
export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    balance: string;
  };
}

export interface DashboardResponse {
  user: {
    id: number;
    email: string;
    balance: string;
  };
  lobbies: Array<{
    id: number;
    name: string;
    entryFee: string;
    maxSeats: number;
    seatsTaken: number;
    status: string;
  }>;
}

export interface LobbyJoinResponse {
  message: string;
  lobby: Lobby;
  userBalance: string;
}