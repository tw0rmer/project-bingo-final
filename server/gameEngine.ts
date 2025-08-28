// Game engine for the bingo game application
import { Server as SocketIOServer } from 'socket.io';
import { db } from './db';
import { lobbies, games, lobbyParticipants, gameParticipants, winners as winnersTable } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

// Game state management
interface GameState {
  gameId: number;
  lobbyId: number;
  currentNumber: number | null;
  drawnNumbers: number[];
  isRunning: boolean;
  intervalId: NodeJS.Timeout | null;
  winnerId?: number | null;
  isPaused: boolean;
  callIntervalMs: number;
  participants?: Array<{ userId: number; seatNumber: number; card: number[] }>;
}

// Simple LCG for deterministic RNG across server instances
function makeSeededRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    // LCG constants (Numerical Recipes)
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function seededShuffle<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeterministicLobbyCards(lobbyId: number): Record<number, number[]> {
  const rand = makeSeededRng(lobbyId * 2654435761);
  const bColumn = seededShuffle(Array.from({ length: 15 }, (_, i) => 1 + i), rand);
  const iColumn = seededShuffle(Array.from({ length: 15 }, (_, i) => 16 + i), rand);
  const nColumn = seededShuffle(Array.from({ length: 15 }, (_, i) => 31 + i), rand);
  const gColumn = seededShuffle(Array.from({ length: 15 }, (_, i) => 46 + i), rand);
  const oColumn = seededShuffle(Array.from({ length: 15 }, (_, i) => 61 + i), rand);
  const cards: Record<number, number[]> = {};
  for (let row = 0; row < 15; row++) {
    cards[row + 1] = [bColumn[row], iColumn[row], nColumn[row], gColumn[row], oColumn[row]];
  }
  return cards;
}

class GameEngine {
  private io: SocketIOServer;
  private gamesMap: Map<number, GameState> = new Map(); // key: gameId
  private lobbyToGameId: Map<number, number> = new Map(); // key: lobbyId
  private lobbyCardsCache: Map<number, Record<number, number[]>> = new Map();
  private lastSnapshotByLobby: Map<number, any> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io; // use default namespace; clients already connected here
  }

  getGameIdByLobby(lobbyId: number) {
    return this.lobbyToGameId.get(lobbyId) || null;
  }

  getStateByLobby(lobbyId: number) {
    const id = this.getGameIdByLobby(lobbyId);
    if (!id) return null;
    return this.gamesMap.get(id) || null;
  }

  getOrGenerateLobbyCards(lobbyId: number): Record<number, number[]> {
    if (!this.lobbyCardsCache.has(lobbyId)) {
      this.lobbyCardsCache.set(lobbyId, buildDeterministicLobbyCards(lobbyId));
    }
    return this.lobbyCardsCache.get(lobbyId)!;
  }

  // Start a specific game by ID (new architecture)
  async startGameById(gameId: number) {
    console.log(`[GAME ENGINE] Starting game ${gameId}`);
    
    // Get game details
    const [game] = await db.select().from(games).where(eq(games.id, gameId));
    if (!game) throw new Error('Game not found');
    
    if (game.status !== 'waiting') {
      throw new Error('Game is not in waiting status');
    }

    // Get game participants
    const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.gameId, gameId));
    
    if (participants.length === 0) {
      throw new Error('No participants in game');
    }

    // Generate deterministic cards for this game
    const lobbyCards = this.getOrGenerateLobbyCards(game.lobbyId);
    
    // Store the generated cards in participant records
    for (const participant of participants) {
      const card = lobbyCards[participant.seatNumber] || [];
      try {
        await db.update(gameParticipants)
          .set({ card: JSON.stringify(card) })
          .where(and(eq(gameParticipants.gameId, gameId), eq(gameParticipants.seatNumber, participant.seatNumber)))
          .run();
      } catch (e) {
        console.error(`Failed to store card for participant ${participant.seatNumber}:`, e);
      }
    }
    
    const gameState: GameState = {
      gameId: game.id,
      lobbyId: game.lobbyId,
      currentNumber: null,
      drawnNumbers: [],
      isRunning: true,
      intervalId: null,
      winnerId: null,
      isPaused: false,
      callIntervalMs: 5000, // 5 seconds
      participants: participants.map((p: any) => ({
        userId: p.userId,
        seatNumber: p.seatNumber,
        card: lobbyCards[p.seatNumber] || []
      }))
    };

    this.gamesMap.set(game.id, gameState);

    // Start number calling interval
    gameState.intervalId = setInterval(() => this.drawNumber(game.id), gameState.callIntervalMs);
    
    // Emit game started event
    this.io.to(`lobby_${game.lobbyId}`).emit('gameStarted', {
      gameId: game.id,
      lobbyId: game.lobbyId
    });
    
    console.log(`[GAME ENGINE] Game ${gameId} started with ${participants.length} participants`);
    console.log(`[GAME ENGINE] Number calling interval set for ${gameState.callIntervalMs}ms`);
    console.log(`[GAME ENGINE] Game state stored:`, { gameId: game.id, isRunning: gameState.isRunning, participantCount: gameState.participants.length });
    
    // Test number calling immediately
    setTimeout(() => {
      console.log(`[GAME ENGINE] Testing immediate number call for game ${gameId}`);
      this.drawNumber(gameId);
    }, 2000);
    
    return game;
  }

  // Start a game for a lobby (legacy method)
  async startGame(lobbyId: number) {
    const [lobby] = await db.select().from(lobbies).where(eq(lobbies.id, lobbyId));
    if (!lobby) throw new Error('Lobby not found');

    const existingGameId = this.lobbyToGameId.get(lobbyId);
    if (existingGameId) {
      const state = this.gamesMap.get(existingGameId);
      if (state?.isRunning) return { id: existingGameId } as any;
    }

    const [game] = await db.insert(games).values({ lobbyId: lobby.id, status: 'active' }).returning();
    // Mark lobby status as active to lock seats
    try { await db.update(lobbies).set({ status: 'active' }).where(eq(lobbies.id, lobby.id)).run(); } catch {}

    const gameState: GameState = {
      gameId: game.id,
      lobbyId: lobby.id,
      currentNumber: null,
      drawnNumbers: [],
      isRunning: true,
      intervalId: null,
      winnerId: null,
      isPaused: false,
      callIntervalMs: 3000,
    };

    this.gamesMap.set(game.id, gameState);
    this.lobbyToGameId.set(lobby.id, game.id);

    // Use deterministic lobby cards so everyone saw identical rows pre-game
    const lobbyCards = this.getOrGenerateLobbyCards(lobby.id);

    // Persist cards for currently seated participants
    const participants = await db.select().from(lobbyParticipants).where(eq(lobbyParticipants.lobbyId, lobby.id));
    const cardsBySeat: Record<number, number[]> = {};
    for (const p of participants) {
      const row = lobbyCards[p.seatNumber];
      cardsBySeat[p.seatNumber] = row;
      await db.insert(gameParticipants).values({ gameId: game.id, userId: p.userId, seatNumber: p.seatNumber, card: JSON.stringify(row) }).run();
    }

    // Cache participants in memory for fast win checks
    gameState.participants = participants.map((p: any) => ({
      userId: p.userId,
      seatNumber: p.seatNumber,
      card: lobbyCards[p.seatNumber],
    }));

    this.io.to(`lobby_${lobby.id}`).emit('game_started', { gameId: game.id, lobbyId: lobby.id, startedAt: Date.now(), cards: lobbyCards });
    // Clear any previous finished snapshot for this lobby
    this.lastSnapshotByLobby.delete(lobby.id);

    gameState.intervalId = setInterval(() => this.drawNumber(game.id), gameState.callIntervalMs);
    return game;
  }

  // Draw next number
  private async drawNumber(gameId: number) {
    console.log(`[GAME ENGINE] drawNumber called for game ${gameId}`);
    const gameState = this.gamesMap.get(gameId);
    if (!gameState) {
      console.log(`[GAME ENGINE] No game state found for game ${gameId}`);
      return;
    }
    if (!gameState.isRunning) {
      console.log(`[GAME ENGINE] Game ${gameId} is not running`);
      return;
    }

    let newNumber: number;
    do {
      newNumber = Math.floor(Math.random() * 75) + 1;
    } while (gameState.drawnNumbers.includes(newNumber));

    gameState.currentNumber = newNumber;
    gameState.drawnNumbers.push(newNumber);

    try {
      db.update(games)
        .set({ currentNumber: newNumber, drawnNumbers: JSON.stringify(gameState.drawnNumbers) })
        .where(eq(games.id, gameId))
        .run();
    } catch (_e) {}

    console.log(`[GAME ENGINE] Number called: ${newNumber} for game ${gameId}`);
    this.io.to(`lobby_${gameState.lobbyId}`).emit('number_called', {
      gameId,
      number: newNumber,
      order: gameState.drawnNumbers.length,
      calledAt: Date.now(),
      drawnNumbers: gameState.drawnNumbers,
    });

    // Auto-detect winner after each call (server-authoritative)
    try {
      if (!gameState.isRunning) return;
      const participants = gameState.participants;
      if (!participants || participants.length === 0) return;
      for (const p of participants) {
        const isWinner = p.card.every((n) => gameState.drawnNumbers.includes(n));
        if (isWinner) {
          // End game with server-detected winner
          await this.endGame(gameId, p.userId);
          break;
        }
      }
    } catch (_e) {
      // ignore detection errors
    }
  }

  async endGame(gameId: number, winnerId?: number) {
    const gameState = this.gamesMap.get(gameId);
    if (!gameState) throw new Error('Game not found');

    if (gameState.intervalId) clearInterval(gameState.intervalId);
    gameState.isRunning = false;
    gameState.winnerId = winnerId ?? null;

    await db
      .update(games)
      .set({ status: 'finished', currentNumber: null, drawnNumbers: JSON.stringify(gameState.drawnNumbers), winnerId: winnerId || null })
      .where(eq(games.id, gameId))
      .run();

    if (winnerId) {
      this.io.to(`lobby_${gameState.lobbyId}`).emit('player_won', { gameId, lobbyId: gameState.lobbyId, userId: winnerId });
    }

    this.io.to(`lobby_${gameState.lobbyId}`).emit('game_ended', {
      gameId,
      lobbyId: gameState.lobbyId,
      winners: winnerId ? [winnerId] : [],
      endedAt: Date.now(),
    });

    // Persist winner row for public page if present
    try {
      if (winnerId) {
        // Calculate actual prize: 70% of total entry fees
        const [gameWithLobby] = await db.select().from(games).innerJoin(lobbies, eq(games.lobbyId, lobbies.id)).where(eq(games.id, gameId));
        const entryFee = gameWithLobby ? gameWithLobby.lobbies.entryFee : 5;
        const participantCount = gameState.participants.length;
        const prizeAmount = Math.floor(entryFee * participantCount * 0.7 * 100) / 100; // 70% for winner
        
        await db.insert(winnersTable).values({ gameId, lobbyId: gameState.lobbyId, userId: winnerId, amount: prizeAmount, note: 'Auto-recorded' }).run();
      }
    } catch {}

    // Mark lobby as finished to unlock for next round
    try { await db.update(lobbies).set({ status: 'finished' }).where(eq(lobbies.id, gameState.lobbyId)).run(); } catch {}

    // Build and save a final snapshot so reconnects still see numbers and cards
    try {
      const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.gameId, gameId));
      const cards: Record<number, number[]> = {};
      for (const p of participants) cards[p.seatNumber] = JSON.parse(p.card || '[]');
      this.lastSnapshotByLobby.set(gameState.lobbyId, {
        gameId,
        lobbyId: gameState.lobbyId,
        currentNumber: null,
        drawnNumbers: gameState.drawnNumbers,
        status: 'finished',
        cards,
        isPaused: false,
        callIntervalMs: gameState.callIntervalMs,
        startedAt: null,
      });
    } catch {}

    // Clear pre-game cards cache so next game gets a fresh shuffle
    this.lobbyCardsCache.delete(gameState.lobbyId);

    this.gamesMap.delete(gameId);
    this.lobbyToGameId.delete(gameState.lobbyId);
  }

  async claimWin(lobbyId: number, userId: number, seatNumber: number, numbers: number[]) {
    const state = this.getStateByLobby(lobbyId);
    if (!state || !state.isRunning) throw new Error('No active game');

    // Validate the claimer is seated in this lobby and seat matches
    const [lp] = await db
      .select()
      .from(lobbyParticipants)
      .where(and(eq(lobbyParticipants.lobbyId, lobbyId), eq(lobbyParticipants.userId, userId)));
    if (!lp || lp.seatNumber !== seatNumber) throw new Error('Not seated');

    // Fetch canonical card for this participant
    const [gp] = await db
      .select()
      .from(gameParticipants)
      .where(and(eq(gameParticipants.gameId, state.gameId), eq(gameParticipants.userId, userId)));
    if (!gp) throw new Error('No card on record');
    const cardRow: number[] = JSON.parse(gp.card || '[]');

    // Verify claimed numbers MATCH the stored card row
    const sameSet = cardRow.length === numbers.length && cardRow.every((n) => numbers.includes(n));
    if (!sameSet) throw new Error('Card mismatch');

    // Validate all numbers are drawn
    const valid = numbers.every((n) => state.drawnNumbers.includes(n));
    if (!valid) throw new Error('Invalid claim');

    // End game with winner
    await this.endGame(state.gameId, userId);

    return { gameId: state.gameId, winnerId: userId };
  }

  // Snapshot for reconnects/late joiners
  async getSnapshotByLobby(lobbyId: number) {
    const gameId = this.lobbyToGameId.get(lobbyId);
    if (!gameId) return this.lastSnapshotByLobby.get(lobbyId) || null;
    const state = this.gamesMap.get(gameId);
    if (!state) return this.lastSnapshotByLobby.get(lobbyId) || null;
    const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.gameId, gameId));
    const cards: Record<number, number[]> = {};
    for (const p of participants) cards[p.seatNumber] = JSON.parse(p.card || '[]');
    return {
      gameId: state.gameId,
      lobbyId: state.lobbyId,
      currentNumber: state.currentNumber,
      drawnNumbers: state.drawnNumbers,
      status: state.isRunning ? 'active' : 'finished',
      cards,
      isPaused: (state as any).isPaused ?? false,
      callIntervalMs: (state as any).callIntervalMs ?? 3000,
      startedAt: null,
    };
  }

  // Admin controls: pause/resume and call speed
  pauseGame(lobbyId: number) {
    const state = this.getStateByLobby(lobbyId);
    if (!state || !state.isRunning) throw new Error('No active game');
    if (state.isPaused) return;
    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = null;
    state.isPaused = true;
    const gameId = state.gameId;
    this.io.to(`lobby_${lobbyId}`).emit('game_paused', { gameId, lobbyId });
  }

  resumeGame(lobbyId: number) {
    const state = this.getStateByLobby(lobbyId);
    if (!state || !state.isRunning) throw new Error('No active game');
    if (!state.isPaused) return;
    state.isPaused = false;
    const gameId = state.gameId;
    state.intervalId = setInterval(() => this.drawNumber(gameId), state.callIntervalMs);
    this.io.to(`lobby_${lobbyId}`).emit('game_resumed', { gameId, lobbyId });
  }

  setCallInterval(lobbyId: number, seconds: number) {
    const state = this.getStateByLobby(lobbyId);
    if (!state || !state.isRunning) throw new Error('No active game');
    
    // Convert seconds to milliseconds, minimum 1 second, maximum 5 seconds
    const ms = Math.max(1000, Math.min(5000, Math.floor(seconds * 1000)));
    const actualSeconds = ms / 1000;
    
    console.log(`[GAME ENGINE] Changing call interval for lobby ${lobbyId} from ${state.callIntervalMs}ms to ${ms}ms (${actualSeconds}s)`);
    state.callIntervalMs = ms;
    
    if (state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
    if (!state.isPaused) {
      const gameId = state.gameId;
      state.intervalId = setInterval(() => this.drawNumber(gameId), state.callIntervalMs);
      console.log(`[GAME ENGINE] Restarted interval for game ${gameId} with ${actualSeconds}s interval`);
    }
    this.io.to(`lobby_${lobbyId}`).emit('call_speed_changed', { 
      lobbyId, 
      intervalMs: state.callIntervalMs, 
      intervalSeconds: actualSeconds 
    });
  }
}

export default GameEngine;