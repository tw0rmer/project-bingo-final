// Seed script for the bingo game application
import { db } from './db';
import { lobbies, users } from '../shared/schema';
import { InsertLobby, InsertUser } from '../shared/types';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  // Create two lobbies
  const lobby1: InsertLobby = {
    name: 'Classic Bingo',
    entryFee: '5.00',
    maxSeats: 15,
    seatsTaken: 0,
    status: 'waiting',
  };

  const lobby2: InsertLobby = {
    name: 'Speed Bingo',
    entryFee: '10.00',
    maxSeats: 15,
    seatsTaken: 0,
    status: 'waiting',
  };

  await db.insert(lobbies).values([lobby1, lobby2]);
  console.log('Seeded 2 lobbies');

  // Create admin and test users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  
  const adminUser: InsertUser = {
    email: 'admin@bingo.com',
    password: adminPassword,
    balance: '10000.00',
    isAdmin: true,
  };
  
  const testUser: InsertUser = {
    email: 'user@test.com',
    password: userPassword,
    balance: '1000.00',
    isAdmin: false,
  };

  await db.insert(users).values([adminUser, testUser]);
  console.log('Seeded admin and test users with balances');

  console.log('Database seeding complete.');
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});