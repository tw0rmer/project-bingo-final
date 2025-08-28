import { Router } from 'express';
import { db } from '../db';
import { games, gameParticipants, lobbies, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

// Get all games within a lobby
router.get('/:lobbyId/games', async (req, res) => {
  try {
    const lobbyId = parseInt(req.params.lobbyId);
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }

    const allGames = await db.select().from(games);
    const lobbyGames = allGames.filter((game: any) => game.lobbyId === lobbyId);

    // Calculate prize pools for each game
    const gamesWithPrizePool = await Promise.all(
      lobbyGames.map(async (game: any) => {
        const lobby = await db.select().from(lobbies).where(eq(lobbies.id, lobbyId));
        const entryFee = lobby[0]?.entryFee || 0;
        const prizePool = entryFee * game.seatsTaken;
        
        return {
          ...game,
          prizePool
        };
      })
    );

    res.json(gamesWithPrizePool);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ message: 'Failed to fetch games' });
  }
});

// Get specific game details
router.get('/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const allGames = await db.select().from(games);
    const game = allGames.find((g: any) => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ message: 'Failed to fetch game' });
  }
});

// Get participants for a specific game
router.get('/:id/participants', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const allParticipants = await db.select().from(gameParticipants);
    const gameParticipantsList = allParticipants.filter((p: any) => p.gameId === gameId);

    // Join with user data
    const participantsWithUsers = await Promise.all(
      gameParticipantsList.map(async (participant: any) => {
        const allUsers = await db.select().from(users);
        const user = allUsers.find((u: any) => u.id === participant.userId);
        return {
          ...participant,
          user: user ? { id: user.id, email: user.email } : null
        };
      })
    );

    res.json(participantsWithUsers);
  } catch (error) {
    console.error('Error fetching game participants:', error);
    res.status(500).json({ message: 'Failed to fetch game participants' });
  }
});

// Join a game (select seats)
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const { seatNumber } = req.body;
    if (!seatNumber || seatNumber < 1 || seatNumber > 15) {
      return res.status(400).json({ message: 'Invalid seat number' });
    }

    // Get game and lobby details
    const allGames = await db.select().from(games);
    const game = allGames.find((g: any) => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === game.lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Check if game accepts players
    if (game.status !== 'waiting') {
      return res.status(400).json({ message: 'Game is not accepting new players' });
    }

    // Check if game is full
    if (game.seatsTaken >= game.maxSeats) {
      return res.status(400).json({ message: 'Game is full' });
    }

    // Check user's current participation in this game
    const allParticipants = await db.select().from(gameParticipants);
    const userParticipations = allParticipants.filter((p: any) => 
      p.gameId === gameId && p.userId === req.user!.id
    );
    
    // Check if user already has this specific seat
    const alreadyHasSeat = userParticipations.some((p: any) => p.seatNumber === seatNumber);
    if (alreadyHasSeat) {
      return res.status(400).json({ message: 'You already have this seat' });
    }
    
    // Check if user already has maximum seats (2)
    if (userParticipations.length >= 2) {
      return res.status(400).json({ message: 'You can only select up to 2 seats per game' });
    }

    // Check if seat is taken by another user
    const seatTaken = allParticipants.find((p: any) => 
      p.gameId === gameId && p.seatNumber === seatNumber && p.userId !== req.user!.id
    );
    
    if (seatTaken) {
      return res.status(400).json({ message: 'Seat is already taken' });
    }

    // Check user balance
    const allUsers = await db.select().from(users);
    const user = allUsers.find((u: any) => u.id === req.user!.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userBalance = parseFloat(user.balance);
    const entryFee = parseFloat(lobby.entryFee);
    
    if (userBalance < entryFee) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Debit entry fee
    const newBalance = userBalance - entryFee;
    await db.update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, req.user!.id));

    // Add participant to game
    await db.insert(gameParticipants).values({
      gameId,
      userId: req.user!.id,
      seatNumber,
      card: JSON.stringify([]), // Empty card for now
      isWinner: false
    });

    // Update game seat count
    const newSeatCount = game.seatsTaken + 1;
    await db.update(games)
      .set({ seatsTaken: newSeatCount })
      .where(eq(games.id, gameId));

    res.json({
      message: 'Successfully joined game',
      game: { ...game, seatsTaken: newSeatCount },
      userBalance: newBalance.toString(),
      seatNumber
    });

  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ message: 'Failed to join game' });
  }
});

// Leave a game (deselect seats)
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const { seatNumber } = req.body;

    // Get game and lobby details
    const allGames = await db.select().from(games);
    const game = allGames.find((g: any) => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === game.lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Check if game allows leaving
    if (game.status === 'active') {
      return res.status(400).json({ message: 'Cannot leave game once it has started' });
    }

    // Find user's participations
    const allParticipants = await db.select().from(gameParticipants);
    const userParticipations = allParticipants.filter((p: any) => 
      p.gameId === gameId && p.userId === req.user!.id
    );
    
    if (userParticipations.length === 0) {
      return res.status(400).json({ message: 'You are not in this game' });
    }

    // Determine which participations to remove
    let participationsToRemove = userParticipations;
    if (seatNumber) {
      participationsToRemove = userParticipations.filter((p: any) => p.seatNumber === seatNumber);
      if (participationsToRemove.length === 0) {
        return res.status(400).json({ message: 'You do not have this seat' });
      }
    }

    // Refund entry fees
    const entryFee = parseFloat(lobby.entryFee);
    const totalRefund = entryFee * participationsToRemove.length;
    
    const allUsers = await db.select().from(users);
    const user = allUsers.find((u: any) => u.id === req.user!.id);
    
    if (user && game.status === 'waiting') {
      const currentBalance = parseFloat(user.balance);
      const newBalance = currentBalance + totalRefund;
      
      await db.update(users)
        .set({ balance: newBalance.toString() })
        .where(eq(users.id, req.user!.id));
    }

    // Remove participations
    for (const participation of participationsToRemove) {
      await db.delete(gameParticipants)
        .where(and(
          eq(gameParticipants.gameId, gameId),
          eq(gameParticipants.userId, req.user!.id),
          eq(gameParticipants.seatNumber, participation.seatNumber)
        ));
    }

    // Update game seat count
    const newSeatCount = game.seatsTaken - participationsToRemove.length;
    await db.update(games)
      .set({ seatsTaken: newSeatCount })
      .where(eq(games.id, gameId));

    res.json({
      message: 'Successfully left game',
      seatsRemoved: participationsToRemove.length,
      refundAmount: totalRefund
    });

  } catch (error) {
    console.error('Error leaving game:', error);
    res.status(500).json({ message: 'Failed to leave game' });
  }
});

export default router;