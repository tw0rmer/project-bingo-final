// Lobby routes for the bingo game application
import { Router } from 'express';
import { db } from '../db';
import { lobbies, games, gameParticipants, users, walletTransactions, lobbyParticipants } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { InsertLobbyParticipant, InsertWalletTransaction } from '../../shared/types';

const router = Router();

// Get all lobbies (with backward compatibility)
router.get('/', async (req, res) => {
  try {
    // Try the new schema first
    const allLobbies = await db.select().from(lobbies);
    
    // Add computed fields for lobby list compatibility
    const lobbiesWithStats = allLobbies.map((lobby: any) => ({
      ...lobby,
      maxGames: lobby.maxGames || 4,
      gamesCount: 0, // TODO: Count actual games when schema is migrated
      totalPlayers: 0 // TODO: Count actual players when schema is migrated
    }));
    
    res.json(lobbiesWithStats);
  } catch (error) {
    console.error('Get lobbies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific lobby
router.get('/:id', async (req, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }

    // Handle mock database
    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    res.json(lobby);
  } catch (error) {
    console.error('Get lobby error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get lobby participants (backward compatibility - returns empty for new lobbies)
router.get('/:id/participants', async (req, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }

    // For the new lobby structure, participants are managed at the game level
    // Return empty array for backward compatibility since the frontend 
    // should redirect to game selection instead of showing this lobby view
    res.json([]);
  } catch (error) {
    console.error('Get lobby participants error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Join a lobby
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('[LOBBY] Join request:', { lobbyId: req.params.id, userId: req.user?.id, body: req.body });
    
    const lobbyId = parseInt(req.params.id);
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }

    const { seatNumber } = req.body;
    if (!seatNumber || seatNumber < 1 || seatNumber > 15) {
      return res.status(400).json({ message: 'Invalid seat number' });
    }

    // Get lobby with manual filtering for mock database
    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    console.log('[LOBBY] Found lobby:', { id: lobby.id, name: lobby.name, status: lobby.status, seatsTaken: lobby.seatsTaken });

    // Check if lobby is accepting players
    if (lobby.status !== 'waiting') {
      return res.status(400).json({ message: 'Lobby is not accepting new players' });
    }

    // Check if lobby is full
    if (lobby.seatsTaken >= lobby.maxSeats) {
      return res.status(400).json({ message: 'Lobby is full' });
    }

    // Check user's current participation in this lobby
    console.log('[LOBBY] About to query lobby participants...');
    let allParticipants;
    try {
      allParticipants = await db.select().from(lobbyParticipants);
      console.log('[LOBBY] Successfully queried participants:', allParticipants.length);
    } catch (queryError) {
      console.error('[LOBBY] Error querying participants:', queryError);
      return res.status(500).json({ message: 'Database query error' });
    }
    const userParticipations = allParticipants.filter((p: any) => 
      p.lobbyId === lobbyId && p.userId === req.user!.id
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
      p.lobbyId === lobbyId && p.seatNumber === seatNumber && p.userId !== req.user!.id
    );
    
    if (seatTaken) {
      return res.status(400).json({ message: 'Seat is already taken' });
    }

    // Get user balance with manual filtering for mock database
    const allUsers = await db.select().from(users);
    const user = allUsers.find((u: any) => u.id === req.user!.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('[LOBBY] Found user:', { id: user.id, email: user.email, balance: user.balance });

    // Check if user has enough balance
    const userBalance = parseFloat(user.balance);
    const entryFee = parseFloat(lobby.entryFee);
    
    if (userBalance < entryFee) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Debit entry fee from user balance
    const newBalance = userBalance - entryFee;
    
    // For mock database, we need to update the user in the mock data
    try {
    await db.update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, req.user!.id));
    } catch (updateError) {
      console.error('[LOBBY] Error updating user balance:', updateError);
      return res.status(500).json({ message: 'Failed to update balance' });
    }

    console.log('[LOBBY] Updated user balance:', { userId: user.id, oldBalance: userBalance, newBalance });

    // Create wallet transaction
    try {
    await db.insert(walletTransactions).values({
      userId: req.user!.id,
      amount: -entryFee,
      type: 'game_entry',
      description: `Joined lobby ${lobby.name}`
    } as InsertWalletTransaction);
    } catch (transactionError) {
      console.error('[LOBBY] Error creating transaction:', transactionError);
      // Continue even if transaction logging fails
    }

    // Add user to lobby participants FIRST
    try {
      await db.insert(lobbyParticipants).values({
        lobbyId,
        userId: req.user!.id,
        seatNumber
      } as InsertLobbyParticipant);

      console.log('[LOBBY] Added participant:', { lobbyId, userId: req.user!.id, seatNumber });

      // Update lobby seats taken - calculate based on actual participants AFTER adding
      const allParticipantsForCount = await db.select().from(lobbyParticipants);
      const currentLobbyParticipants = allParticipantsForCount.filter((p: any) => p.lobbyId === lobbyId);
      const actualSeatsTaken = currentLobbyParticipants.length;
      
      console.log('[LOBBY] Calculating seats taken:', { 
        lobbyId, 
        participantsFound: currentLobbyParticipants.length,
        actualSeatsTaken 
      });
      
      // For mock database, manually update the lobby
      const allLobbiesAfter = await db.select().from(lobbies);
      const lobbyToUpdate = allLobbiesAfter.find((l: any) => l.id === lobbyId);
      if (lobbyToUpdate) {
        lobbyToUpdate.seatsTaken = actualSeatsTaken;
        console.log('[LOBBY] Updated lobby seats for mock DB:', { lobbyId, newSeatsTaken: actualSeatsTaken });
      }
      
      // Update the lobby with the new seat count
      await db.update(lobbies)
        .set({ seatsTaken: actualSeatsTaken })
        .where(eq(lobbies.id, lobbyId));

      // Get final lobby state for response - ALWAYS fetch fresh data after participant operations
      let finalLobby;
      try {
        // Force a fresh query to get the most up-to-date lobby data
        await db.select().from(lobbies).where(eq(lobbies.id, lobbyId));
        const finalLobbies = await db.select().from(lobbies);
        finalLobby = finalLobbies.find((l: any) => l.id === lobbyId);
        
        if (!finalLobby) {
          console.error('[LOBBY] Could not find lobby after update:', lobbyId);
        } else {
          // Validate that the seat count matches the actual participants
          const participantCount = currentLobbyParticipants.length;
          if (finalLobby.seatsTaken !== participantCount) {
            console.error('[LOBBY] Seat count mismatch! DB:', finalLobby.seatsTaken, 'Actual:', participantCount);
            // Force correction
            finalLobby.seatsTaken = participantCount;
            await db.update(lobbies)
              .set({ seatsTaken: participantCount })
              .where(eq(lobbies.id, lobbyId));
            console.log('[LOBBY] Corrected seat count to match actual participants:', participantCount);
          }
        }
      } catch (error) {
        console.error('[LOBBY] Error getting final lobby state:', error);
        // Continue with the original lobby object if we can't get the updated one
      }

      // Emit real-time events for lobby updates
      try {
        const io = req.app.get('io');
        console.log('[SOCKET DEBUG] io instance available:', !!io);
        console.log('[SOCKET DEBUG] io instance type:', typeof io);
        
        if (io) {
          const lobbyRoom = `lobby_${lobbyId}`;
          const userRoom = `user_${req.user!.id}`;
          
          try {
            // Use the most up-to-date lobby data for socket events
            const currentLobbyData = finalLobby || lobby;
            const currentSeatsTaken = currentLobbyData.seatsTaken;
            
            // Notify all users in the lobby about the seat being taken
            io.to(lobbyRoom).emit('seat_taken', {
              lobbyId,
              seatNumber,
              userId: req.user!.id,
              userEmail: user.email,
              newSeatsTaken: currentSeatsTaken,
              timestamp: new Date().toISOString()
            });
            
            // Notify the user that they successfully joined
            io.to(userRoom).emit('lobby_joined', {
              lobbyId,
              lobbyName: currentLobbyData.name,
              seatNumber,
              seatsTaken: currentSeatsTaken,
              maxSeats: currentLobbyData.maxSeats,
              newBalance: newBalance.toString(),
              timestamp: new Date().toISOString()
            });
            
            console.log('[SOCKET] Emitted seat_taken to lobby room:', lobbyRoom);
            console.log('[SOCKET] Emitted lobby_joined to user room:', userRoom);
          } catch (socketError) {
            console.error('[SOCKET] Error emitting socket events:', socketError);
            // Continue even if socket emission fails
          }
        }
      } catch (socketSetupError) {
        console.error('[SOCKET] Error setting up socket communication:', socketSetupError);
        // Continue even if socket setup fails
      }

      // Send success response with updated lobby data
      try {
        res.json({
          message: 'Successfully joined lobby',
          lobby: finalLobby || lobby,
          userBalance: newBalance.toString(),
          seatNumber
        });
      } catch (responseError) {
        console.error('[LOBBY] Error sending success response:', responseError);
        // If we can't send a success response, try to send a generic one
        res.status(200).json({ message: 'Operation completed but response data could not be generated' });
      }

    } catch (error) {
      console.error('[LOBBY] Error joining lobby:', error);
      // Try to rollback the balance update
      try {
        await db.update(users)
          .set({ balance: userBalance.toString() })
          .where(eq(users.id, req.user!.id));
        console.log('[LOBBY] Successfully rolled back balance update');
      } catch (rollbackError) {
        console.error('[LOBBY] Failed to rollback balance update:', rollbackError);
      }
      res.status(500).json({ message: 'Failed to join lobby. Your balance has been refunded.' });
    }
  } catch (error) {
    console.error('[LOBBY] Join lobby error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Leave a lobby
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('[DEBUG ENDPOINT] =========================');
    console.log('[DEBUG ENDPOINT] Leave Lobby requested');
    console.log('[DEBUG ENDPOINT] Lobby ID:', req.params.id);
    console.log('[DEBUG ENDPOINT] User ID:', req.user?.id);
    console.log('[DEBUG ENDPOINT] User email:', req.user?.email);
    console.log('[DEBUG ENDPOINT] Request body:', req.body);
    
    const lobbyId = parseInt(req.params.id);
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }

    // Get seat number from request body (optional - if not provided, leave all seats)
    const { seatNumber } = req.body;

    // Get lobby with manual filtering for mock database
    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === lobbyId);
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Check if lobby allows leaving (block only while active)
    if (lobby.status === 'active') {
      return res.status(400).json({ message: 'Cannot leave lobby once game has started' });
    }

    // Find user's participation(s)
    const allParticipants = await db.select().from(lobbyParticipants);
    const userParticipations = allParticipants.filter((p: any) => 
      p.lobbyId === lobbyId && p.userId === req.user!.id
    );
    
    if (userParticipations.length === 0) {
      return res.status(400).json({ message: 'You are not in this lobby' });
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

    console.log('[LOBBY] Found participations to remove:', participationsToRemove.length);

    // Refund entry fee for each seat being left (only if lobby is still waiting)
    const entryFee = parseFloat(lobby.entryFee);
    const totalRefund = entryFee * participationsToRemove.length;
    const allUsers = await db.select().from(users);
    const user = allUsers.find((u: any) => u.id === req.user!.id);
    
    if (user && lobby.status === 'waiting') {
      const currentBalance = parseFloat(user.balance);
      const newBalance = currentBalance + totalRefund;
      
      try {
        await db.update(users)
          .set({ balance: newBalance.toString() })
          .where(eq(users.id, req.user!.id));
        
        console.log('[LOBBY] Refunded balance:', { 
          userId: user.id, 
          oldBalance: currentBalance, 
          newBalance, 
          refundAmount: totalRefund,
          seatsLeft: participationsToRemove.length
        });
      } catch (error) {
        console.error('[LOBBY] Error refunding balance:', error);
      }

      // Create refund transaction
      try {
        const description = seatNumber 
          ? `Left seat ${seatNumber} in lobby ${lobby.name} - entry fee refunded`
          : `Left lobby ${lobby.name} - entry fees refunded`;
          
        await db.insert(walletTransactions).values({
          userId: req.user!.id,
          amount: totalRefund,
          type: 'withdrawal',
          description
        } as InsertWalletTransaction);
      } catch (error) {
        console.error('[LOBBY] Error creating refund transaction:', error);
      }
    }

    // Variables to track lobby state, defined outside try blocks for wider scope
    let actualSeatsTaken = 0;
    let updatedLobby: any = null;
    
    // Remove specific participations
    try {
      // Remove each participation that should be removed
      for (const participation of participationsToRemove) {
        try {
          await db.delete(lobbyParticipants)
            .where(and(
              eq(lobbyParticipants.lobbyId, lobbyId),
              eq(lobbyParticipants.userId, req.user!.id),
              eq(lobbyParticipants.seatNumber, participation.seatNumber)
            ));
          console.log('[LOBBY] Deleted participation for seat:', participation.seatNumber);
        } catch (deleteError) {
          console.warn('[LOBBY] Could not delete participation using database API, likely using mock database:', deleteError);
          // This is expected with mock database as it doesn't fully implement delete
        }
      }
      
      // For both real and mock database, get the updated participants list
      const allParticipantsAfter = await db.select().from(lobbyParticipants);
      const seatsToRemove = participationsToRemove.map(p => p.seatNumber);
      const updatedParticipants = allParticipantsAfter.filter((p) =>
        !(p.lobbyId === lobbyId && p.userId === req.user!.id && seatsToRemove.includes(p.seatNumber))
      );
      
      console.log('[LOBBY] Removed participations for seats:', seatsToRemove);
      console.log('[LOBBY] Updated participants count:', updatedParticipants.length);
      
      // Update the seat count based on actual participants
      actualSeatsTaken = updatedParticipants.filter((p: any) => p.lobbyId === lobbyId).length;
      
      // Update lobby seats
      await db.update(lobbies)
        .set({ seatsTaken: actualSeatsTaken })
        .where(eq(lobbies.id, lobbyId));
      
      // Fetch fresh lobby data after update
      let updatedLobby;
      try {
        // Force a fresh query to get the most up-to-date lobby data
        await db.select().from(lobbies).where(eq(lobbies.id, lobbyId));
        const updatedLobbies = await db.select().from(lobbies);
        updatedLobby = updatedLobbies.find((l: any) => l.id === lobbyId);
        
        if (!updatedLobby) {
          console.error('[LOBBY] Could not find lobby after leave update:', lobbyId);
          updatedLobby = { ...lobby, seatsTaken: actualSeatsTaken };
        } else {
          // Validate that the seat count matches the actual participants
          const participantCount = updatedParticipants.filter((p: any) => p.lobbyId === lobbyId).length;
          if (updatedLobby.seatsTaken !== participantCount) {
            console.error('[LOBBY] Seat count mismatch after leave! DB:', updatedLobby.seatsTaken, 'Actual:', participantCount);
            // Force correction
            updatedLobby.seatsTaken = participantCount;
            await db.update(lobbies)
              .set({ seatsTaken: participantCount })
              .where(eq(lobbies.id, lobbyId));
            console.log('[LOBBY] Corrected seat count to match actual participants:', participantCount);
          }
        }
      } catch (error) {
        console.error('[LOBBY] Error getting updated lobby after leave:', error);
        updatedLobby = { ...lobby, seatsTaken: actualSeatsTaken };
      }
      
      console.log('[LOBBY] Updated lobby seats after leave:', {
        lobbyId,
        oldSeatsTaken: lobby.seatsTaken,
        newSeatsTaken: updatedLobby.seatsTaken
      });
    } catch (error) {
      console.error('[LOBBY] Error removing participant:', error);
      res.status(500).json({ error: 'Failed to leave lobby' });
      return;
    }

    // Emit real-time events for lobby leave
    try {
      const io = req.app.get('io');
      if (io) {
      const lobbyRoom = `lobby_${lobbyId}`;
      const userRoom = `user_${req.user!.id}`;
      
      // Use the most up-to-date lobby data for socket events
      const currentLobbyData = updatedLobby || lobby;
      const currentSeatsTaken = currentLobbyData.seatsTaken;
      
      // Notify all users in the lobby about the seat being freed
      io.to(lobbyRoom).emit('seat_freed', {
        lobbyId,
        seatNumber: participationsToRemove[0]?.seatNumber || seatNumber,
        userId: req.user!.id,
        newSeatsTaken: currentSeatsTaken,
        timestamp: new Date().toISOString()
      });
      
      // Notify the user that they successfully left
      const updatedUser = allUsers.find((u: any) => u.id === req.user!.id);
      io.to(userRoom).emit('lobby_left', {
        lobbyId,
        lobbyName: currentLobbyData.name,
        seatsTaken: currentSeatsTaken,
        maxSeats: currentLobbyData.maxSeats,
        refundAmount: entryFee.toString(),
        newBalance: updatedUser ? updatedUser.balance : user?.balance,
        timestamp: new Date().toISOString()
      });
      
      console.log('[SOCKET] Emitted seat_freed to lobby room:', lobbyRoom);
      console.log('[SOCKET] Emitted lobby_left to user room:', userRoom);
    }
  } catch (socketError) {
    console.error('[SOCKET] Error in socket communication:', socketError);
    // Continue even if socket communication fails
  }

    try {
      const response = {
        message: 'Successfully left lobby',
        refundAmount: entryFee.toString(),
        lobbyId: lobbyId,
        participationRemoved: participationsToRemove[0]?.id || 'unknown',
        lobby: updatedLobby || { ...lobby, seatsTaken: actualSeatsTaken }
      };
      
      console.log('[DEBUG ENDPOINT] Leave lobby successful');
      console.log('[DEBUG ENDPOINT] Response:', JSON.stringify(response, null, 2));
      console.log('[DEBUG ENDPOINT] =========================');
      
      res.json(response);
    } catch (responseError) {
      console.error('[LOBBY] Error sending success response:', responseError);
      // If we can't send the detailed response, try to send a generic one
      res.status(200).json({ message: 'Successfully left lobby' });
    }
  } catch (error) {
    console.error('[DEBUG ENDPOINT] Leave lobby error:', error);
    console.error('[DEBUG ENDPOINT] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Debug endpoint to fix lobby seat counts
router.post('/:id/fix-seats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    console.log('[DEBUG ENDPOINT] =========================');
    console.log('[DEBUG ENDPOINT] Fix Seat Count requested');
    console.log('[DEBUG ENDPOINT] Lobby ID:', lobbyId);
    console.log('[DEBUG ENDPOINT] Requested by user:', req.user?.email);
    
    // Get current participants
    const allParticipants = await db.select().from(lobbyParticipants);
    console.log('[DEBUG ENDPOINT] All participants in database:', allParticipants.length);
    console.log('[DEBUG ENDPOINT] All participants data:', JSON.stringify(allParticipants, null, 2));
    
    const currentLobbyParticipants = allParticipants.filter((p: any) => p.lobbyId === lobbyId);
    const actualCount = currentLobbyParticipants.length;
    console.log('[DEBUG ENDPOINT] Participants for lobby', lobbyId + ':', actualCount);
    console.log('[DEBUG ENDPOINT] Participant details:', JSON.stringify(currentLobbyParticipants, null, 2));
    
    // Update lobby
    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === lobbyId);
    console.log('[DEBUG ENDPOINT] Found lobby before update:', JSON.stringify(lobby, null, 2));
    
    if (lobby) {
      const oldSeatCount = lobby.seatsTaken;
      lobby.seatsTaken = actualCount;
      console.log('[DEBUG ENDPOINT] Updated seat count from', oldSeatCount, 'to', actualCount);
    } else {
      console.log('[DEBUG ENDPOINT] ERROR: Lobby not found!');
    }
    
    const response = {
      message: 'Seat count fixed',
      lobbyId: lobbyId,
      actualParticipants: actualCount,
      participantList: currentLobbyParticipants,
      updatedLobby: lobby
    };
    
    console.log('[DEBUG ENDPOINT] Sending response:', JSON.stringify(response, null, 2));
    console.log('[DEBUG ENDPOINT] =========================');
    
    res.json(response);
  } catch (error) {
    console.error('[DEBUG ENDPOINT] Fix seats error:', error);
    console.error('[DEBUG ENDPOINT] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ message: 'Failed to fix seats', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Add new route for getting games within a lobby
router.get('/:id/games', async (req, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }

    const allGames = await db.select().from(games);
    const lobbyGames = allGames.filter((game: any) => game.lobbyId === lobbyId);

    // Calculate prize pools for each game
    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === lobbyId);
    const entryFee = lobby?.entryFee || 0;
    
    const gamesWithPrizePool = lobbyGames.map((game: any) => ({
      ...game,
      prizePool: entryFee * game.seatsTaken
    }));

    res.json(gamesWithPrizePool);
  } catch (error) {
    console.error('Error fetching lobby games:', error);
    res.status(500).json({ message: 'Failed to fetch lobby games' });
  }
});

// Admin: Create new lobby
router.post('/admin/create', async (req, res) => {
  try {
    const { name, description, entryFee, maxGames } = req.body;

    if (!name || !entryFee) {
      return res.status(400).json({ message: 'Name and entry fee are required' });
    }

    console.log('[ADMIN] Creating new lobby:', { name, description, entryFee, maxGames });

    // Create the lobby
    const newLobby = await db.insert(lobbies).values({
      name,
      description: description || null,
      entryFee: parseFloat(entryFee),
      maxGames: maxGames || 4,
      status: 'active'
    }).returning();

    const lobby = newLobby[0];
    console.log('[ADMIN] Created lobby:', lobby);

    // Create games for the lobby
    const lobbyGames = [];
    for (let i = 1; i <= (maxGames || 4); i++) {
      lobbyGames.push({
        lobbyId: lobby.id,
        name: `${name} - Game ${i}`,
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
    console.log('[ADMIN] Created', lobbyGames.length, 'games for lobby');

    res.json({ lobby, gamesCreated: lobbyGames.length });
  } catch (error) {
    console.error('[ADMIN] Create lobby error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin: Delete lobby and all its games
router.delete('/admin/:id', async (req, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    
    console.log('[ADMIN] Deleting lobby:', lobbyId);

    // Get all games in this lobby first
    const allGames = await db.select().from(games);
    const lobbyGames = allGames.filter((game: any) => game.lobbyId === lobbyId);

    // Delete all participants from the games
    for (const game of lobbyGames) {
      const allParticipants = await db.select().from(gameParticipants);
      const gameParticipantsList = allParticipants.filter((p: any) => p.gameId === game.id);
      
      for (const participant of gameParticipantsList) {
        await db.delete(gameParticipants).where(eq(gameParticipants.id, participant.id));
      }
    }

    // Delete all games in the lobby
    for (const game of lobbyGames) {
      await db.delete(games).where(eq(games.id, game.id));
    }

    // Delete the lobby
    await db.delete(lobbies).where(eq(lobbies.id, lobbyId));

    console.log('[ADMIN] Deleted lobby', lobbyId, 'and', lobbyGames.length, 'games');
    res.json({ message: 'Lobby deleted successfully', gamesDeleted: lobbyGames.length });
  } catch (error) {
    console.error('[ADMIN] Delete lobby error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;