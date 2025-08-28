import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { lobbies, games, gameParticipants, lobbyParticipants, users, winners } from '../shared/schema';

// Initialize database connection
const sqlite = new Database('./data/bingo.db');
const db = drizzle(sqlite);

async function cleanAndSeedFresh() {
  console.log('[CLEAN SEED] Starting fresh database setup...');

  try {
    // Clean all game-related data
    console.log('[CLEAN SEED] Cleaning existing data...');
    await db.delete(gameParticipants);
    await db.delete(lobbyParticipants);
    await db.delete(winners);
    await db.delete(games);
    await db.delete(lobbies);

    console.log('[CLEAN SEED] Creating 3 fresh lobbies...');
    
    // Create 3 simple lobbies
    const newLobbies = [
      {
        name: '$5 Classic Bingo',
        description: 'Classic bingo games with $5 entry fee',
        entryFee: 5,
        maxGames: 4,
        status: 'active'
      },
      {
        name: '$10 Premium Bingo',
        description: 'Premium bingo experience with $10 entry fee',
        entryFee: 10,
        maxGames: 4,
        status: 'active'
      },
      {
        name: '$25 High Stakes',
        description: 'High stakes bingo for serious players',
        entryFee: 25,
        maxGames: 4,
        status: 'active'
      }
    ];

    const createdLobbies = await db.insert(lobbies).values(newLobbies).returning();
    console.log('[CLEAN SEED] Created lobbies:', createdLobbies.map(l => l.name));

    // Create 4 games for each lobby
    for (const lobby of createdLobbies) {
      console.log(`[CLEAN SEED] Creating 4 games for ${lobby.name}...`);
      
      const lobbyGames = [];
      for (let i = 1; i <= 4; i++) {
        lobbyGames.push({
          lobbyId: lobby.id,
          name: `${lobby.name} - Game ${i}`,
          gameNumber: i,
          maxSeats: 15,
          seatsTaken: 0,
          winnerId: null,
          status: 'waiting',
          drawnNumbers: '[]',
          currentNumber: null
        });
      }
      
      await db.insert(games).values(lobbyGames);
      console.log(`[CLEAN SEED] Created 4 games for ${lobby.name}`);
    }

    console.log('[CLEAN SEED] Fresh database setup complete!');
    console.log('[CLEAN SEED] Summary:');
    console.log('- 3 lobbies: $5, $10, $25');
    console.log('- 12 total games (4 per lobby)');
    console.log('- All games ready with 0 players');
    
  } catch (error) {
    console.error('[CLEAN SEED] Error:', error);
    throw error;
  }
}

cleanAndSeedFresh()
  .then(() => {
    console.log('[CLEAN SEED] Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[CLEAN SEED] Script failed:', error);
    process.exit(1);
  });