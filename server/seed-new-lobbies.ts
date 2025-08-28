// Seed script to populate the new lobby -> games structure
import { db } from './db';
import { lobbies, games } from '../shared/schema';

async function seedNewLobbies() {
  console.log('[SEED] Starting to seed new lobby-games structure...');
  
  try {
    // Create parent lobbies with different entry fees
    const newLobbies = [
      {
        name: '$5 Classic Bingo Lobby',
        description: 'Fast-paced bingo games for $5 entry fee',
        entryFee: 5.00,
        maxGames: 4,
        status: 'active' as const
      },
      {
        name: '$10 Premium Bingo Lobby',
        description: 'Premium bingo experience with $10 entry fee',
        entryFee: 10.00,
        maxGames: 4,
        status: 'active' as const
      },
      {
        name: '$25 High Stakes Lobby',
        description: 'High stakes bingo for serious players',
        entryFee: 25.00,
        maxGames: 4,
        status: 'active' as const
      }
    ];

    // Insert lobbies
    for (const lobbyData of newLobbies) {
      const insertedLobby = await db.insert(lobbies).values(lobbyData).returning();
      const lobbyId = insertedLobby[0].id;
      console.log(`[SEED] Created lobby: ${lobbyData.name} (ID: ${lobbyId})`);

      // Create 4 games for each lobby
      for (let gameNum = 1; gameNum <= 4; gameNum++) {
        const gameData = {
          lobbyId: lobbyId,
          name: `${lobbyData.name.replace(' Lobby', '')} - Game ${gameNum}`,
          gameNumber: gameNum,
          maxSeats: 15,
          seatsTaken: Math.floor(Math.random() * 8), // Random seats taken (0-7)
          status: 'waiting' as const,
          drawnNumbers: '[]'
        };

        const insertedGame = await db.insert(games).values(gameData).returning();
        console.log(`[SEED] Created game: ${gameData.name} (ID: ${insertedGame[0].id})`);
      }
    }

    console.log('[SEED] Successfully seeded new lobby-games structure!');
    return true;
  } catch (error) {
    console.error('[SEED] Error seeding new structure:', error);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNewLobbies()
    .then((success) => {
      console.log(`[SEED] Completed with ${success ? 'success' : 'failure'}`);
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('[SEED] Fatal error:', error);
      process.exit(1);
    });
}

export { seedNewLobbies };