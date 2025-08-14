// Dashboard routes for the bingo game application
import { Router } from 'express';
import { db } from '../db';
import { users, lobbies } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user dashboard
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('[DASHBOARD] Request from user ID:', req.user?.id);
    
    // Get user info - manually filter since mock DB doesn't handle eq properly
    const allUsers = await db.select().from(users);
    const user = allUsers.find((u: any) => u.id === req.user?.id);
    if (!user) {
      console.log('[DASHBOARD] User not found for ID:', req.user?.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('[DASHBOARD] User found:', { id: user.id, email: user.email, isAdmin: user.isAdmin });

    // Get all lobbies
    const allLobbies = await db.select().from(lobbies);
    console.log('[DASHBOARD] Lobbies found:', allLobbies.length);

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin || false
      },
      lobbies: allLobbies.map(lobby => ({
        id: lobby.id,
        name: lobby.name,
        entryFee: lobby.entryFee,
        maxSeats: lobby.maxSeats,
        seatsTaken: lobby.seatsTaken,
        status: lobby.status
      }))
    };

    console.log('[DASHBOARD] Sending response for user:', responseData.user.email, 'isAdmin:', responseData.user.isAdmin);
    res.json(responseData);
  } catch (error) {
    console.error('[DASHBOARD] Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;