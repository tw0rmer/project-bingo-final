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

    // Get the master card if game is active or finished
    let masterCard = null;
    const gameEngine = req.app.get('gameEngine');
    if (gameEngine && (game.status === 'active' || game.status === 'finished')) {
      masterCard = gameEngine.getOrGenerateMasterCard(gameId);
    }

    res.json({ ...game, masterCard });
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

    // Also get the master card if game has started
    const allGames = await db.select().from(games);
    const game = allGames.find((g: any) => g.id === gameId);
    
    let masterCard = null;
    if (game && (game.status === 'active' || game.status === 'finished')) {
      const gameEngine = req.app.get('gameEngine');
      if (gameEngine) {
        masterCard = gameEngine.getOrGenerateMasterCard(gameId);
      }
    }

    res.json({ participants: participantsWithUsers, masterCard });
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

// Join a specific game
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

    // Get the game
    const allGames = await db.select().from(games);
    const game = allGames.find((g: any) => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Get the lobby to check entry fee
    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === game.lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Check if game is accepting players
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
      return res.status(400).json({ message: 'You can only select up to 2 seats' });
    }

    // Check if seat is taken by another user
    const seatTaken = allParticipants.find((p: any) => 
      p.gameId === gameId && p.seatNumber === seatNumber && p.userId !== req.user!.id
    );
    
    if (seatTaken) {
      return res.status(400).json({ message: 'Seat is already taken' });
    }

    // Get user and check balance
    const allUsers = await db.select().from(users);
    const user = allUsers.find((u: any) => u.id === req.user!.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const entryFee = parseFloat(lobby.entryFee);
    const userBalance = parseFloat(user.balance);
    
    if (userBalance < entryFee) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct entry fee from user balance
    const newBalance = userBalance - entryFee;
    await db.update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, req.user!.id));

    // Add user to game participants
    await db.insert(gameParticipants).values({
      gameId,
      userId: req.user!.id,
      seatNumber,
      card: JSON.stringify([]) // Will be populated when game starts
    });

    // Update game seats taken
    const gameParticipants_list = await db.select().from(gameParticipants);
    const currentGameParticipants = gameParticipants_list.filter((p: any) => p.gameId === gameId);
    const actualSeatsTaken = currentGameParticipants.length;
    
    await db.update(games)
      .set({ seatsTaken: actualSeatsTaken })
      .where(eq(games.id, gameId));

    // Create wallet transaction
    try {
      await db.insert(walletTransactions).values({
        userId: req.user!.id,
        amount: -entryFee,
        type: 'game_entry',
        description: `Entry fee for ${game.name}`,
        status: 'completed'
      });
    } catch (transactionError) {
      console.error('[GAME] Error creating transaction:', transactionError);
    }

    // Emit real-time events
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`game_${gameId}`).emit('seat_taken', {
          gameId,
          seatNumber,
          userId: req.user!.id,
          userEmail: user.email,
          newSeatsTaken: actualSeatsTaken
        });
      }
    } catch (socketError) {
      console.error('[GAME] Socket error:', socketError);
    }

    res.json({
      message: 'Successfully joined game',
      game: { ...game, seatsTaken: actualSeatsTaken },
      userBalance: newBalance.toString(),
      seatNumber
    });
  } catch (error) {
    console.error('[GAME] Error joining game:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Leave a specific game
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const { seatNumber } = req.body;

    // Get the game
    const allGames = await db.select().from(games);
    const game = allGames.find((g: any) => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Get the lobby to check entry fee for refund
    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === game.lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Check if game allows leaving (block only while active)
    if (game.status === 'active') {
      return res.status(400).json({ message: 'Cannot leave game once it has started' });
    }

    // Find user's participation(s)
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
      // Leave specific seat only
      participationsToRemove = userParticipations.filter((p: any) => p.seatNumber === seatNumber);
      if (participationsToRemove.length === 0) {
        return res.status(400).json({ message: 'You do not have this seat' });
      }
    }

    // Refund entry fee for each seat being left
    const entryFee = parseFloat(lobby.entryFee);
    const totalRefund = entryFee * participationsToRemove.length;
    const allUsers = await db.select().from(users);
    const user = allUsers.find((u: any) => u.id === req.user!.id);
    
    if (user) {
      const currentBalance = parseFloat(user.balance);
      const newBalance = currentBalance + totalRefund;
      
      await db.update(users)
        .set({ balance: newBalance.toString() })
        .where(eq(users.id, req.user!.id));

      // Remove participations
      for (const participation of participationsToRemove) {
        await db.delete(gameParticipants).where(eq(gameParticipants.id, participation.id));
      }

      // Update game seats taken
      const remainingParticipants = await db.select().from(gameParticipants);
      const currentGameParticipants = remainingParticipants.filter((p: any) => p.gameId === gameId);
      const actualSeatsTaken = currentGameParticipants.length;
      
      await db.update(games)
        .set({ seatsTaken: actualSeatsTaken })
        .where(eq(games.id, gameId));

      // Create refund transaction
      try {
        await db.insert(walletTransactions).values({
          userId: req.user!.id,
          amount: totalRefund,
          type: 'refund',
          description: `Refund for leaving ${game.name}`,
          status: 'completed'
        });
      } catch (transactionError) {
        console.error('[GAME] Error creating refund transaction:', transactionError);
      }

      // Emit real-time events
      try {
        const io = req.app.get('io');
        if (io) {
          participationsToRemove.forEach((participation: any) => {
            io.to(`game_${gameId}`).emit('seat_left', {
              gameId,
              seatNumber: participation.seatNumber,
              userId: req.user!.id,
              newSeatsTaken: actualSeatsTaken
            });
          });
        }
      } catch (socketError) {
        console.error('[GAME] Socket error:', socketError);
      }

      res.json({
        message: seatNumber ? 'Successfully left seat' : 'Successfully left game',
        refundAmount: totalRefund,
        userBalance: newBalance.toString(),
        seatsLeft: participationsToRemove.map((p: any) => p.seatNumber)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('[GAME] Error leaving game:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;