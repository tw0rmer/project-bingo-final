// Admin routes for the bingo game application
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, lobbies, walletTransactions, lobbyParticipants, winners } from '../../shared/schema';
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
    res.json(allLobbies);
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
    
    // In a real app, you'd want to check if there are active games first
    await db.delete(lobbies).where(eq(lobbies.id, lobbyId));
    
    res.json({ message: 'Lobby deleted successfully' });
  } catch (error) {
    console.error('Delete lobby error:', error);
    res.status(500).json({ message: 'Internal server error' });
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

export default router;