// Authentication routes for the bingo game application
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, walletTransactions } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';
import { InsertUser, InsertWalletTransaction } from '../../shared/types';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    console.log('[AUTH] Registration attempt:', { email: req.body?.email });
    const { email, password, username } = req.body;

    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists - manually filter since mock DB doesn't handle eq properly
    console.log('[AUTH] Checking for existing user...');
    const allUsers = await db.select().from(users);
    console.log('[AUTH] Current users in database:', allUsers.length);
    const existingUser = allUsers.find((user: any) => user.email === email);
    if (existingUser) {
      console.log('[AUTH] User already exists');
      return res.status(409).json({ message: 'User already exists' });
    }

    // Optional: ensure username uniqueness if provided
    if (username) {
      const usernameTaken = allUsers.some((u: any) => (u.username || '').toLowerCase() === String(username).toLowerCase());
      if (usernameTaken) {
        return res.status(409).json({ message: 'Username already taken' });
      }
    }

    // Hash password
    console.log('[AUTH] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with 1000 test credits
    console.log('[AUTH] Creating new user...');
    const [newUser] = await db.insert(users).values({
      email,
      username: username ? String(username).slice(0, 20) : null,
      password: hashedPassword,
      balance: '1000.00'
    } as InsertUser).returning();
    console.log('[AUTH] New user created:', { id: newUser.id, email: newUser.email });

    // Create initial wallet transaction
    console.log('[AUTH] Creating initial wallet transaction...');
    await db.insert(walletTransactions).values({
      userId: newUser.id,
      amount: '1000.00',
      type: 'deposit',
      description: 'Initial test credits'
    } as InsertWalletTransaction);

    console.log('[AUTH] Generating token...');
    const token = generateToken(newUser.id, newUser.email);

    console.log('[AUTH] Registration successful');
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        balance: newUser.balance
      }
    });
  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    console.log('[AUTH] Login attempt:', { email: req.body?.email });
    const { identifier, email, username, password } = req.body;

    const idf = identifier || email || username;
    if (!idf || !password) {
      console.log('[AUTH] Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user - manually filter since mock DB doesn't handle eq properly
    console.log('[AUTH] Searching for user...');
    const allUsers = await db.select().from(users);
    console.log('[AUTH] Available users:', allUsers.map(u => ({ id: u.id, email: u.email, isAdmin: u.isAdmin })));
    const user = allUsers.find((u: any) => u.email === idf || (u.username && u.username.toLowerCase() === String(idf).toLowerCase()));
    if (!user) {
      console.log('[AUTH] User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[AUTH] User found:', { id: user.id, email: user.email, isAdmin: user.isAdmin });

    // Check password
    console.log('[AUTH] Checking password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('[AUTH] Password valid:', isValidPassword);
    if (!isValidPassword) {
      console.log('[AUTH] Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email);
    console.log('[AUTH] Login successful for:', email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        balance: user.balance,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user from database - manually filter since mock DB doesn't handle eq properly
    const allUsers = await db.select().from(users);
    const user = allUsers.find((user: any) => user.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data without password
    res.json({
      id: user.id,
      email: user.email,
      username: user.username || null,
      balance: user.balance,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Server session endpoint to detect server restarts
router.get('/session', (req, res) => {
  // Get server session ID from app (set in main server file)
  const serverSessionId = req.app.get('serverSessionId') || 'unknown';
  res.json({ sessionId: serverSessionId });
});

export default router;