// Admin routes for the bingo game application
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, lobbies, walletTransactions, lobbyParticipants, winners, games, gameParticipants } from '../../shared/schema';
import { eq, gte, lte } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Admin middleware - check if user is admin
const requireAdmin = async (req: AuthRequest, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Get user from database to check admin status
    const allUsers = await db.select().from(users);
    const user = allUsers.find((u: any) => u.id === req.user?.id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ========== USER MANAGEMENT ==========

// Get all users (admin)
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const allUsers = await db.select().from(users);
    // Remove passwords from response
    const sanitizedUsers = allUsers.map(user => ({
      ...user,
      password: undefined
    }));
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user balance (admin)
router.put('/users/:id/balance', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { amount, description } = req.body;
    
    if (isNaN(userId) || !amount) {
      return res.status(400).json({ message: 'Invalid user ID or amount' });
    }
    
    // Get user
    const allUsers = await db.select().from(users);
    const user = allUsers.find((u: any) => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update balance
    const newBalance = (parseFloat(user.balance) + parseFloat(amount)).toFixed(2);
    const [updatedUser] = await db.update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    
    // Create transaction record
    await db.insert(walletTransactions).values({
      userId: userId,
      amount: amount,
      type: parseFloat(amount) > 0 ? 'deposit' : 'withdrawal',
      description: description || `Admin ${parseFloat(amount) > 0 ? 'credit' : 'debit'}: ${Math.abs(parseFloat(amount))}`
    });
    
    res.json({
      message: 'User balance updated',
      user: { ...updatedUser, password: undefined }
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle user admin status (admin)
router.put('/users/:id/admin', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isAdmin } = req.body;
    
    if (isNaN(userId) || typeof isAdmin !== 'boolean') {
      return res.status(400).json({ message: 'Invalid user ID or admin status' });
    }
    
    const [updatedUser] = await db.update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId))
      .returning();
    
    res.json({
      message: `User admin status ${isAdmin ? 'granted' : 'revoked'}`,
      user: { ...updatedUser, password: undefined }
    });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ========== LOBBY MANAGEMENT ==========

// Get all lobbies (admin)
router.get('/lobbies', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const allLobbies = await db.select().from(lobbies);
    const allGames = await db.select().from(games);
    
    // Add gamesCount to each lobby
    const lobbiesWithGameCount = allLobbies.map(lobby => {
      const gameCount = allGames.filter(game => game.lobbyId === lobby.id).length;
      return {
        ...lobby,
        gamesCount: gameCount
      };
    });
    
    res.json(lobbiesWithGameCount);
  } catch (error) {
    console.error('Get lobbies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update username (admin)
router.put('/users/:id/username', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username } = req.body || {};
    if (isNaN(userId) || !username) return res.status(400).json({ message: 'Invalid user ID or username' });

    const allUsers = await db.select().from(users);
    const taken = allUsers.some((u: any) => u.id !== userId && (u.username || '').toLowerCase() === String(username).toLowerCase());
    if (taken) return res.status(409).json({ message: 'Username already taken' });

    const [updated] = await db.update(users).set({ username: String(username).slice(0, 20) }).where(eq(users.id, userId)).returning();
    res.json({ message: 'Username updated', user: { ...updated, password: undefined } });
  } catch (e: any) {
    res.status(500).json({ message: e.message || 'Failed to update username' });
  }
});

// Ban/Unban user (admin)
router.put('/users/:id/ban', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { banned } = req.body;
    
    if (isNaN(userId) || typeof banned !== 'boolean') {
      return res.status(400).json({ message: 'Invalid user ID or ban status' });
    }
    
    const [updatedUser] = await db.update(users)
      .set({ banned })
      .where(eq(users.id, userId))
      .returning();
    
    res.json({
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      user: { ...updatedUser, password: undefined }
    });
  } catch (error) {
    console.error('Ban/unban user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (admin)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if user exists
    const allUsers = await db.select().from(users);
    const user = allUsers.find((u: any) => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting admin users
    if (user.isAdmin) {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    // Delete user's transactions first (foreign key constraint)
    await db.delete(walletTransactions).where(eq(walletTransactions.userId, userId));
    
    // Remove from lobby participants
    await db.delete(lobbyParticipants).where(eq(lobbyParticipants.userId, userId));
    
    // Delete user
    await db.delete(users).where(eq(users.id, userId));
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk delete users (admin)
router.post('/users/bulk-delete', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid user IDs array' });
    }
    
    // Validate all IDs are numbers
    const userIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    if (userIds.length !== ids.length) {
      return res.status(400).json({ message: 'All user IDs must be valid numbers' });
    }
    
    // Get all users to validate they exist and check admin status
    const allUsers = await db.select().from(users);
    const usersToDelete = allUsers.filter(user => userIds.includes(user.id));
    
    if (usersToDelete.length === 0) {
      return res.status(404).json({ message: 'No users found with provided IDs' });
    }
    
    // Don't allow deleting admin users
    const adminUsers = usersToDelete.filter(user => user.isAdmin);
    if (adminUsers.length > 0) {
      return res.status(403).json({ 
        message: `Cannot delete admin users: ${adminUsers.map(u => u.email).join(', ')}` 
      });
    }
    
    // Delete transactions and participations for all users
    for (const userId of userIds) {
      await db.delete(walletTransactions).where(eq(walletTransactions.userId, userId));
      await db.delete(lobbyParticipants).where(eq(lobbyParticipants.userId, userId));
    }
    
    // Delete all users
    for (const userId of userIds) {
      await db.delete(users).where(eq(users.id, userId));
    }
    
    res.json({ 
      message: `Successfully deleted ${usersToDelete.length} users`,
      deletedUsers: usersToDelete.map(u => ({ id: u.id, email: u.email }))
    });
  } catch (error) {
    console.error('Bulk delete users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new lobby (admin)
router.post('/lobbies', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, entryFee, maxSeats } = req.body;
    
    if (!name || !entryFee) {
      return res.status(400).json({ message: 'Name and entry fee are required' });
    }
    
    const [newLobby] = await db.insert(lobbies).values({
      name,
      entryFee: entryFee.toString(),
      maxSeats: maxSeats || 15,
      seatsTaken: 0,
      status: 'waiting'
    }).returning();
    
    res.status(201).json({
      message: 'Lobby created successfully',
      lobby: newLobby
    });
  } catch (error) {
    console.error('Create lobby error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update lobby (admin)
router.put('/lobbies/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    const { name, entryFee, maxSeats, status } = req.body;
    
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (entryFee) updateData.entryFee = entryFee.toString();
    if (maxSeats) updateData.maxSeats = maxSeats;
    if (status) updateData.status = status;
    
    const [updatedLobby] = await db.update(lobbies)
      .set(updateData)
      .where(eq(lobbies.id, lobbyId))
      .returning();
    
    if (!updatedLobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }
    
    res.json({
      message: 'Lobby updated successfully',
      lobby: updatedLobby
    });
  } catch (error) {
    console.error('Update lobby error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete lobby (admin)
router.delete('/lobbies/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }
    
    console.log('[ADMIN] Deleting lobby:', lobbyId);

    // Get all games in this lobby first
    const allGames = await db.select().from(games);
    const lobbyGames = allGames.filter((game: any) => game.lobbyId === lobbyId);
    console.log('[ADMIN] Found', lobbyGames.length, 'games in lobby');

    // Delete all participants from the games
    for (const game of lobbyGames) {
      try {
        const allParticipants = await db.select().from(gameParticipants);
        const gameParticipantsList = allParticipants.filter((p: any) => p.gameId === game.id);
        console.log('[ADMIN] Found', gameParticipantsList.length, 'participants in game', game.id);
        
        for (const participant of gameParticipantsList) {
          await db.delete(gameParticipants).where(eq(gameParticipants.id, participant.id));
        }
      } catch (error) {
        console.log('[ADMIN] Error deleting game participants for game', game.id, ':', error);
      }
    }

    // Delete all games in the lobby
    for (const game of lobbyGames) {
      try {
        await db.delete(games).where(eq(games.id, game.id));
        console.log('[ADMIN] Deleted game', game.id);
      } catch (error) {
        console.log('[ADMIN] Error deleting game', game.id, ':', error);
      }
    }

    // Delete lobby participants
    try {
      const allParticipants = await db.select().from(lobbyParticipants);
      const lobbyParticipantsList = allParticipants.filter((p: any) => p.lobbyId === lobbyId);
      console.log('[ADMIN] Found', lobbyParticipantsList.length, 'lobby participants');
      
      for (const participant of lobbyParticipantsList) {
        await db.delete(lobbyParticipants).where(eq(lobbyParticipants.id, participant.id));
      }
    } catch (error) {
      console.log('[ADMIN] Error deleting lobby participants:', error);
    }

    // Delete the lobby
    try {
      await db.delete(lobbies).where(eq(lobbies.id, lobbyId));
      console.log('[ADMIN] Deleted lobby', lobbyId);
    } catch (error) {
      console.log('[ADMIN] Error deleting lobby:', error);
      return res.status(500).json({ message: 'Failed to delete lobby: ' + error.message });
    }

    console.log('[ADMIN] Successfully deleted lobby', lobbyId, 'and', lobbyGames.length, 'games');
    res.json({ message: 'Lobby deleted successfully', gamesDeleted: lobbyGames.length });
  } catch (error) {
    console.error('[ADMIN] Delete lobby error:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

// Bulk delete users (admin)
router.post('/users/bulk-delete', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const ids: number[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) return res.status(400).json({ message: 'No user IDs provided' });
    for (const id of ids) {
      try { await db.delete(users).where(eq(users.id, id)); } catch {}
    }
    res.json({ message: `Deleted ${ids.length} users` });
  } catch (e:any) {
    res.status(500).json({ message: e.message || 'Failed to bulk delete users' });
  }
});

// Fill lobby with bots (specify count; random short usernames)
router.post('/lobbies/:id/fill-bots', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }

    // Get lobby - manually filter since mock DB doesn't handle eq properly
    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === lobbyId);
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Calculate how many bots to add
    const requested = Math.max(0, Math.min(parseInt(req.body?.count ?? '0') || 0, lobby.maxSeats));
    const capacityLeft = lobby.maxSeats - lobby.seatsTaken;
    const botsToAdd = Math.min(requested || capacityLeft, capacityLeft);
    if (botsToAdd <= 0) {
      return res.status(400).json({ message: 'Lobby is already full' });
    }

    // Build list of taken seats for the lobby
    const allParticipants = await db.select().from(lobbyParticipants);
    const takenSeats = new Set<number>(
      allParticipants.filter((p: any) => p.lobbyId === lobbyId).map((p: any) => p.seatNumber)
    );

    // Simple bot name pool (<=8 chars)
    const names = ['Nova','Zed','Echo','Ivy','Rex','Lux','Axel','Mika','Nyx','Blu','Jinx','Kiro','Vex','Nori','Kato','Zuri','Faye','Puck','Cyra','Orin'];
    const pickName = () => names[Math.floor(Math.random()*names.length)] + Math.floor(10+Math.random()*89);

    const botPassword = await bcrypt.hash('bot', 8);
    const createdBots: any[] = [];
    let added = 0;
    for (let i = 0; i < botsToAdd; i++) {
      // pick a free seat
      const freeSeats = Array.from({ length: lobby.maxSeats }, (_, idx) => idx + 1).filter(n => !takenSeats.has(n));
      if (freeSeats.length === 0) break;
      const seat = freeSeats[Math.floor(Math.random()*freeSeats.length)];
      takenSeats.add(seat);

      const name = pickName().slice(0,8);
      const email = `${name.toLowerCase()}@bot.local`;
      // reuse an idle bot if available, else create one
      const allUsers = await db.select().from(users);
      let botUser = allUsers.find((u: any) => u.email === email) as any;
      if (!botUser) {
        const [created] = await db.insert(users).values({
          email,
          username: name,
          password: botPassword,
          balance: 0,
          isAdmin: false,
        }).returning();
        botUser = created;
      }

      // add to lobby participants
      const [participant] = await db.insert(lobbyParticipants).values({
        lobbyId,
        userId: botUser.id,
        seatNumber: seat,
      } as any).returning();
      createdBots.push({ user: botUser, participant });
      added++;
    }

    // Update lobby seats taken
    const [updatedLobby] = await db.update(lobbies)
      .set({ seatsTaken: lobby.seatsTaken + added })
      .where(eq(lobbies.id, lobbyId))
      .returning();

    res.json({ message: `Added ${added} bots`, lobby: updatedLobby, bots: createdBots });
  } catch (error) {
    console.error('Fill bots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset lobby (clear seatsTaken -> 0, status -> waiting)
router.post('/lobbies/:id/reset', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    if (isNaN(lobbyId)) return res.status(400).json({ message: 'Invalid lobby ID' });

    // Remove participants for this lobby
    try { await db.delete(lobbyParticipants).where(eq(lobbyParticipants.lobbyId, lobbyId)); } catch {}

    const [updated] = await db.update(lobbies)
      .set({ seatsTaken: 0, status: 'waiting' })
      .where(eq(lobbies.id, lobbyId))
      .returning();
    res.json({ message: 'Lobby reset', lobby: updated });
  } catch (error) {
    console.error('Reset lobby error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start lobby game
router.post('/lobbies/:id/start', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }

    // Get lobby - manually filter since mock DB doesn't handle eq properly
    const allLobbies = await db.select().from(lobbies);
    const lobby = allLobbies.find((l: any) => l.id === lobbyId);
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Update lobby status to active
    const [updatedLobby] = await db.update(lobbies)
      .set({ status: 'active' })
      .where(eq(lobbies.id, lobbyId))
      .returning();

    res.json({
      message: 'Lobby game started',
      lobby: updatedLobby
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ========== TRANSACTION MANAGEMENT ==========

// Get all wallet transactions (admin)
router.get('/wallet-transactions', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const allTransactions = await db.select().from(walletTransactions);
    res.json(allTransactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ========== DATABASE CLEANUP ==========

// Manual database cleanup (admin only)
router.post('/cleanup-database', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    console.log('[ADMIN CLEANUP] Manual database cleanup requested by:', req.user?.email);
    
    // Import necessary modules
    const { lobbyParticipants } = await import('../../shared/schema');
    
    // Check current state
    const currentParticipants = await db.select().from(lobbyParticipants);
    const currentLobbies = await db.select().from(lobbies);
    
    console.log(`[ADMIN CLEANUP] Found ${currentParticipants.length} participants to clean`);
    
    let participantsRemoved = 0;
    let lobbiesReset = 0;
    
    // Remove all lobby participants
    if (currentParticipants.length > 0) {
      await db.delete(lobbyParticipants);
      participantsRemoved = currentParticipants.length;
      console.log(`[ADMIN CLEANUP] Removed ${participantsRemoved} lobby participants`);
    }
    
    // Reset all lobby seat counts to 0
    const updatedLobbies = await db.update(lobbies)
      .set({ seatsTaken: 0 })
      .returning();
    
    lobbiesReset = updatedLobbies.length;
    console.log(`[ADMIN CLEANUP] Reset seat counts for ${lobbiesReset} lobbies`);
    
    // Verify cleanup
    const remainingParticipants = await db.select().from(lobbyParticipants);
    
    const result = {
      success: true,
      participantsRemoved,
      lobbiesReset,
      remainingParticipants: remainingParticipants.length,
      message: `Cleanup completed: removed ${participantsRemoved} participants, reset ${lobbiesReset} lobbies`
    };
    
    console.log('[ADMIN CLEANUP] Manual cleanup completed:', result);
    res.json(result);
    
  } catch (error) {
    console.error('[ADMIN CLEANUP] Error during manual cleanup:', error);
    res.status(500).json({ 
      success: false,
      message: 'Database cleanup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Prize Pool Distribution System - 30% house take, 70% to winner
router.post('/distribute-prize/:lobbyId', async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const lobbyId = parseInt(req.params.lobbyId);
    const { winnerId } = req.body;

    if (!lobbyId || !winnerId) {
      return res.status(400).json({ message: 'Lobby ID and Winner ID are required' });
    }

    // Get lobby details
    const lobby = await db.select().from(lobbies).where(eq(lobbies.id, lobbyId)).limit(1);
    if (!lobby.length) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Calculate prize pool (entry fee × number of seats taken)
    const totalPrizePool = lobby[0].entryFee * lobby[0].seatsTaken;
    const houseTake = Math.floor(totalPrizePool * 0.30); // 30% house take
    const winnerPrize = totalPrizePool - houseTake; // 70% to winner

    if (totalPrizePool <= 0) {
      return res.status(400).json({ message: 'No prize pool available - no players joined' });
    }

    // Get winner user details
    const winnerUser = await db.select().from(users).where(eq(users.id, winnerId)).limit(1);
    if (!winnerUser.length) {
      return res.status(404).json({ message: 'Winner not found' });
    }

    // Update winner's balance
    await db.update(users)
      .set({ balance: winnerUser[0].balance + winnerPrize })
      .where(eq(users.id, winnerId));

    // Create winner record
    await db.insert(winners).values({
      lobbyId: lobbyId,
      userId: winnerId,
      amount: winnerPrize,
      note: `Prize distribution: $${winnerPrize.toFixed(2)} from pool of $${totalPrizePool.toFixed(2)} (30% house take: $${houseTake.toFixed(2)})`
    });

    // Create wallet transaction for winner
    await db.insert(walletTransactions).values({
      userId: winnerId,
      type: 'prize_win',
      amount: winnerPrize,
      description: `Bingo win - Lobby ${lobby[0].name}`,
      status: 'completed'
    });

    // Reset lobby seats taken to 0 after distribution
    await db.update(lobbies)
      .set({ seatsTaken: 0, status: 'waiting' })
      .where(eq(lobbies.id, lobbyId));

    res.json({
      message: 'Prize distributed successfully',
      totalPrizePool: totalPrizePool.toFixed(2),
      houseTake: houseTake.toFixed(2),
      winnerPrize: winnerPrize.toFixed(2),
      winnerUsername: winnerUser[0].username || `Player #${winnerId}`,
      lobbyName: lobby[0].name
    });

  } catch (error: any) {
    console.error('Prize distribution error:', error);
    res.status(500).json({ message: 'Failed to distribute prize', error: error.message });
  }
});

// Get prize pool info for a lobby
router.get('/prize-pool/:lobbyId', async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const lobbyId = parseInt(req.params.lobbyId);
    const lobby = await db.select().from(lobbies).where(eq(lobbies.id, lobbyId)).limit(1);
    
    if (!lobby.length) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    const totalPrizePool = lobby[0].entryFee * lobby[0].seatsTaken;
    const houseTake = Math.floor(totalPrizePool * 0.30);
    const winnerPrize = totalPrizePool - houseTake;

    res.json({
      lobbyId,
      lobbyName: lobby[0].name,
      entryFee: lobby[0].entryFee,
      seatsTaken: lobby[0].seatsTaken,
      maxSeats: lobby[0].maxSeats,
      totalPrizePool: totalPrizePool.toFixed(2),
      houseTake: houseTake.toFixed(2),
      winnerPrize: winnerPrize.toFixed(2),
      status: lobby[0].status
    });

  } catch (error: any) {
    console.error('Prize pool info error:', error);
    res.status(500).json({ message: 'Failed to get prize pool info', error: error.message });
  }
});

// Game Management Endpoints

// Add new game to lobby (admin)
router.post('/lobbies/:id/games', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }

    // Get lobby details
    const lobby = await db.select().from(lobbies).where(eq(lobbies.id, lobbyId)).limit(1);
    if (!lobby.length) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Get existing games count
    const existingGames = await db.select().from(games).where(eq(games.lobbyId, lobbyId));
    const gameNumber = existingGames.length + 1;
    
    if (gameNumber > (lobby[0].maxGames || 4)) {
      return res.status(400).json({ message: 'Maximum games reached for this lobby' });
    }

    // Create new game
    const [newGame] = await db.insert(games).values({
      lobbyId,
      name: `${lobby[0].name} - Game ${gameNumber}`,
      gameNumber,
      maxSeats: lobby[0].maxSeats,
      seatsTaken: 0,
      status: 'waiting',
      drawnNumbers: '[]',
      currentNumber: null
    }).returning();

    res.status(201).json({
      message: 'Game created successfully',
      game: newGame
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete game (admin)
router.delete('/games/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    // Check if game has players - prevent deletion if active
    const game = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
    if (!game.length) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game[0].seatsTaken > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete game with active players. Remove players first.' 
      });
    }

    // Remove any participants
    await db.delete(gameParticipants).where(eq(gameParticipants.gameId, gameId));
    
    // Delete the game
    await db.delete(games).where(eq(games.id, gameId));

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start game (admin)
router.post('/games/:id/start', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    // Start the actual game engine
    const gameEngine = req.app.get('gameEngine');
    if (gameEngine) {
      await gameEngine.startGameById(gameId);
    }

    // Update game status
    const [updatedGame] = await db.update(games)
      .set({ status: 'active' })
      .where(eq(games.id, gameId))
      .returning();

    if (!updatedGame) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({
      message: 'Game started successfully',
      game: updatedGame
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset individual game (admin) - clears players from specific game
router.post('/games/:id/reset', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const gameId = parseInt(req.params.id);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    // Get game details
    const game = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
    if (!game.length) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Get lobby details for entry fee
    const lobby = await db.select().from(lobbies).where(eq(lobbies.id, game[0].lobbyId)).limit(1);
    if (!lobby.length) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Get all participants in this game
    const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.gameId, gameId));
    
    // Refund entry fees to participants
    for (const participant of participants) {
      // Get user
      const user = await db.select().from(users).where(eq(users.id, participant.userId)).limit(1);
      if (user.length) {
        // Refund entry fee
        await db.update(users)
          .set({ balance: user[0].balance + lobby[0].entryFee })
          .where(eq(users.id, participant.userId));
        
        // Create refund transaction
        await db.insert(walletTransactions).values({
          userId: participant.userId,
          type: 'withdrawal',
          amount: lobby[0].entryFee,
          description: `Game reset refund - ${game[0].name}`,
          status: 'completed'
        });
      }
    }
    
    // Remove all participants for this game
    await db.delete(gameParticipants).where(eq(gameParticipants.gameId, gameId));
    
    // Reset game status and clear game state
    await db.update(games)
      .set({ 
        seatsTaken: 0, 
        status: 'waiting',
        drawnNumbers: '[]',
        currentNumber: null,
        winnerId: null
      })
      .where(eq(games.id, gameId));

    res.json({ 
      message: 'Game reset successfully',
      participantsRefunded: participants.length
    });
  } catch (error) {
    console.error('Reset game error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset lobby games (admin) - clears all games and players from lobby
router.post('/lobbies/:id/reset-games', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const lobbyId = parseInt(req.params.id);
    if (isNaN(lobbyId)) {
      return res.status(400).json({ message: 'Invalid lobby ID' });
    }

    // Get lobby details
    const lobby = await db.select().from(lobbies).where(eq(lobbies.id, lobbyId)).limit(1);
    if (!lobby.length) {
      return res.status(404).json({ message: 'Lobby not found' });
    }

    // Get all games in this lobby
    const lobbyGames = await db.select().from(games).where(eq(games.lobbyId, lobbyId));
    
    // For each game, remove participants and refund entry fees
    for (const game of lobbyGames) {
      const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.gameId, game.id));
      
      // Refund entry fees to participants
      for (const participant of participants) {
        // Get user
        const user = await db.select().from(users).where(eq(users.id, participant.userId)).limit(1);
        if (user.length) {
          // Refund entry fee
          await db.update(users)
            .set({ balance: user[0].balance + lobby[0].entryFee })
            .where(eq(users.id, participant.userId));
          
          // Create refund transaction
          await db.insert(walletTransactions).values({
            userId: participant.userId,
            type: 'withdrawal',
            amount: lobby[0].entryFee,
            description: `Lobby reset refund - ${lobby[0].name}`,
            status: 'completed'
          });
        }
      }
      
      // Remove all participants for this game
      await db.delete(gameParticipants).where(eq(gameParticipants.gameId, game.id));
    }
    
    // Delete all games in this lobby
    await db.delete(games).where(eq(games.lobbyId, lobbyId));
    
    // Reset lobby status
    await db.update(lobbies)
      .set({ 
        seatsTaken: 0, 
        status: 'waiting' 
      })
      .where(eq(lobbies.id, lobbyId));

    res.json({ 
      message: 'Lobby reset successfully',
      gamesDeleted: lobbyGames.length,
      participantsRefunded: lobbyGames.reduce((sum, game) => sum + game.seatsTaken, 0)
    });
  } catch (error) {
    console.error('Reset lobby games error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change game calling interval (admin only)
router.post('/games/:gameId/set-interval', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { seconds } = req.body;
    
    if (!seconds || seconds < 1 || seconds > 5) {
      return res.status(400).json({ message: 'Interval must be between 1 and 5 seconds' });
    }
    
    // Find the game and its lobby
    const gameResult = await db.select().from(games).where(eq(games.id, parseInt(gameId))).limit(1);
    if (gameResult.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    const game = gameResult[0];
    const gameEngine = req.app.get('gameEngine');
    
    try {
      gameEngine.setCallInterval(game.lobbyId, seconds);
      res.json({ 
        message: 'Call interval updated successfully',
        intervalSeconds: seconds,
        gameId: parseInt(gameId),
        lobbyId: game.lobbyId
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('[ADMIN] Error setting call interval:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;