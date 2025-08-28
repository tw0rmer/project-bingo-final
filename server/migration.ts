// Migration script to convert current lobbies to new lobby->games structure
import { db } from './db';
import { lobbies, games, gameParticipants, lobbyParticipants } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface LegacyLobby {
  id: number;
  name: string;
  entryFee: number;
  maxSeats: number;
  seatsTaken: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function migrateLobbiesToGames() {
  console.log('[MIGRATION] Starting lobby to games migration...');
  
  try {
    // Get all existing lobbies
    const existingLobbies = await db.select().from(lobbies) as LegacyLobby[];
    console.log('[MIGRATION] Found', existingLobbies.length, 'existing lobbies');
    
    // Create new lobby structure for each existing lobby type
    const lobbyGroups = new Map<string, LegacyLobby[]>();
    
    // Group lobbies by entry fee to create lobby categories
    existingLobbies.forEach(lobby => {
      const key = `$${lobby.entryFee}`;
      if (!lobbyGroups.has(key)) {
        lobbyGroups.set(key, []);
      }
      lobbyGroups.get(key)!.push(lobby);
    });
    
    // Create new lobby structure
    for (const [entryFeeKey, lobbyGroup] of lobbyGroups) {
      const entryFee = lobbyGroup[0].entryFee;
      
      // Create new parent lobby
      const newLobby = await db.insert(lobbies).values({
        name: `${entryFeeKey} Bingo Lobby`,
        description: `Bingo games with ${entryFeeKey} entry fee`,
        entryFee: entryFee,
        maxGames: 4,
        status: 'active'
      }).returning();
      
      const parentLobbyId = newLobby[0].id;
      console.log('[MIGRATION] Created parent lobby:', parentLobbyId, newLobby[0].name);
      
      // Convert each old lobby to a game within the new lobby
      for (let i = 0; i < lobbyGroup.length; i++) {
        const oldLobby = lobbyGroup[i];
        
        const newGame = await db.insert(games).values({
          lobbyId: parentLobbyId,
          name: oldLobby.name,
          gameNumber: i + 1,
          maxSeats: oldLobby.maxSeats,
          seatsTaken: oldLobby.seatsTaken,
          status: oldLobby.status,
          drawnNumbers: '[]'
        }).returning();
        
        console.log('[MIGRATION] Created game:', newGame[0].id, newGame[0].name);
        
        // Migrate participants from old lobby to new game
        const oldParticipants = await db.select().from(lobbyParticipants)
          .where(eq(lobbyParticipants.lobbyId, oldLobby.id));
          
        for (const participant of oldParticipants) {
          await db.insert(gameParticipants).values({
            gameId: newGame[0].id,
            userId: participant.userId,
            seatNumber: participant.seatNumber,
            card: JSON.stringify([]), // Empty card for now
            isWinner: false
          });
        }
        
        console.log('[MIGRATION] Migrated', oldParticipants.length, 'participants to game', newGame[0].id);
      }
    }
    
    console.log('[MIGRATION] Migration completed successfully');
    return true;
  } catch (error) {
    console.error('[MIGRATION] Migration failed:', error);
    return false;
  }
}

export async function clearLegacyData() {
  console.log('[MIGRATION] Clearing legacy lobby data...');
  
  try {
    // Clear old lobby participants
    await db.delete(lobbyParticipants);
    console.log('[MIGRATION] Cleared legacy lobby participants');
    
    // Note: We keep the old lobbies table for now in case we need to rollback
    // await db.delete(lobbies);
    
    console.log('[MIGRATION] Legacy data cleanup completed');
    return true;
  } catch (error) {
    console.error('[MIGRATION] Legacy data cleanup failed:', error);
    return false;
  }
}