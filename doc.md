# WildCard Premium Bingo - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Requirements](#system-requirements)
3. [Installation & Setup](#installation--setup)
4. [Building & Deployment](#building--deployment)
5. [Architecture Overview](#architecture-overview)
6. [Feature Documentation](#feature-documentation)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

WildCard Premium Bingo is a full-stack, real-time multiplayer bingo platform designed for modern web and mobile devices. The platform features a casino-themed interface with comprehensive user management, real-time gameplay, achievement systems, and automated prize distribution.

### Key Highlights
- **Real-time Multiplayer**: Socket.IO powered real-time bingo gameplay
- **Mobile-First Design**: Responsive interface optimized for all devices
- **Prize Pool System**: Automated 30% house take with winner distribution
- **Achievement System**: Gamified user engagement with unlockable badges
- **Admin Dashboard**: Comprehensive management tools for users, lobbies, and finances
- **Payment Integration**: E-Transfer support with transaction tracking

---

## System Requirements

### Development Environment
- **Node.js**: Version 18+ (Recommended: 20+)
- **npm**: Version 8+
- **SQLite**: Built-in with better-sqlite3
- **Operating System**: Windows, macOS, or Linux

### Production Server Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 10GB available space
- **Network**: Stable internet connection with open ports
- **SSL Certificate**: Required for HTTPS (WebSocket connections)

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd wildcard-premium-bingo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file in the root directory:
```env
# Database
DATABASE_URL="file:./data/bingo.db"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key"

# Server Configuration
NODE_ENV="production"
PORT=5000

# Optional: Payment Integration
STRIPE_SECRET_KEY="sk_..."
VITE_STRIPE_PUBLIC_KEY="pk_..."
```

### 4. Database Setup
```bash
# Generate and run migrations
npm run db:generate
npm run db:migrate
```

### 5. Build Application
```bash
# Build for production
npm run build
```

---

## Building & Deployment

### Development Mode
```bash
# Start development server with hot reload
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Socket.IO: ws://localhost:5000

### Production Build
```bash
# Clean previous builds
rm -rf dist/

# Build frontend and backend
npm run build

# Start production server
npm start
```

### Server Deployment Commands

#### Option 1: Direct Node.js Deployment
```bash
# On your server, navigate to project directory
cd /path/to/wildcard-premium-bingo

# Install dependencies (production only)
npm ci --only=production

# Build the application
npm run build

# Start with process manager (PM2 recommended)
npm install -g pm2
pm2 start npm --name "bingo-app" -- start
pm2 save
pm2 startup
```

#### Option 2: Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

Deploy commands:
```bash
# Build Docker image
docker build -t wildcard-bingo .

# Run container
docker run -d \
  --name bingo-app \
  -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  -e NODE_ENV=production \
  -e JWT_SECRET="your-secret" \
  wildcard-bingo
```

#### Option 3: Nginx Reverse Proxy Setup
Create `/etc/nginx/sites-available/bingo`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/bingo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Architecture Overview

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom casino theme
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Real-time**: Socket.IO client for live updates

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript for type safety
- **Database**: SQLite with Drizzle ORM
- **Authentication**: JWT with session management
- **Real-time**: Socket.IO server for WebSocket connections
- **API**: RESTful endpoints with comprehensive error handling

### File Structure
```
wildcard-premium-bingo/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route-based page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── styles/        # CSS and styling
├── server/                 # Backend Express application
│   ├── routes/            # API route handlers
│   │   ├── index.ts       # Main API routes
│   │   ├── admin.ts       # Admin panel endpoints
│   │   └── auth.ts        # Authentication routes
│   ├── middleware/        # Express middleware
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── data/                   # Database files and migrations
└── dist/                   # Built application (production)
```

---

## Feature Documentation

### 1. User Authentication System

#### Registration & Login
- **Email/Username Login**: Users can log in with either email or username
- **JWT Authentication**: Secure token-based authentication
- **Auto-login**: Persistent sessions with automatic token refresh
- **Session Management**: Server-side session tracking with restart detection

#### User Profile Management
- **Account Settings**: Edit profile information, username, email
- **Security Settings**: Change password with validation
- **Balance Management**: View current balance and transaction history
- **Achievement Display**: View unlocked badges and progress

### 2. Real-time Bingo Gameplay

#### Lobby System
- **15-Seat Lobbies**: Each lobby supports up to 15 players
- **Entry Fees**: Configurable entry fees per lobby
- **Real-time Updates**: Instant seat availability updates via Socket.IO
- **Join/Leave Mechanics**: Seamless lobby participation with balance handling

#### Game Engine
- **Server-authoritative Cards**: Deterministic bingo card generation
- **Number Calling**: Random number generation with proper bingo ranges (B1-15, I16-30, N31-45, G46-60, O61-75)
- **Win Detection**: Automatic pattern recognition for lines and full house
- **Real-time Broadcasting**: Live number calls to all participants

#### Game Flow
1. Players join lobby and select seats
2. Admin starts game (or automatic start when full)
3. Numbers called at configurable intervals
4. Players mark their cards automatically
5. Win detection triggers immediately
6. Prize distribution and game end

### 3. Mobile-Responsive Design

#### Desktop Interface
- **Full Layout**: Sidebar with master card, main bingo grid, participant list
- **Optimal Size**: 995px × 780px game container
- **Rich Information**: Detailed participant tooltips and status indicators

#### Mobile Interface
- **Tabbed Navigation**: My Card, Master, Players, Info tabs
- **Touch-Optimized**: 44px minimum touch targets with haptic feedback
- **Compact Design**: Paginated view showing 5 seats at a time
- **Gesture Support**: Swipe navigation between tabs and seat pages

#### Responsive Breakpoints
- **Mobile**: < 640px - Tabbed interface
- **Tablet**: 640px - 1024px - Adapted desktop layout
- **Desktop**: > 1024px - Full sidebar layout

### 4. Achievement System

#### Badge Categories
- **Games**: Play-based achievements (first game, 10 games, etc.)
- **Social**: Community-based achievements (invite friends, etc.)
- **Milestone**: Progress-based achievements (balance milestones, etc.)
- **Special**: Event-based achievements (holiday bonuses, etc.)

#### Rarity System
- **Common**: Standard achievements, gray styling
- **Rare**: Moderate difficulty, blue styling
- **Epic**: Challenging achievements, purple styling
- **Legendary**: Extremely rare achievements, gold styling

#### Automatic Triggers
- **Welcome Achievement**: Unlocked on registration
- **Game Win Achievement**: Unlocked on first game victory
- **Balance Milestones**: Triggered by wallet thresholds
- **Play Count**: Triggered by game participation

### 5. Prize Pool Distribution System

#### House Economics
- **30% House Take**: Automatic platform fee calculation
- **70% Winner Prize**: Remaining amount distributed to winner
- **Real-time Calculations**: Live updates based on entry fees × seats taken

#### Prize Management
- **Admin Interface**: Dedicated Prize Pools tab in admin panel
- **One-click Distribution**: Select winner and distribute prizes instantly
- **Balance Updates**: Automatic winner balance increases
- **Transaction Records**: Complete audit trail of all distributions
- **Lobby Reset**: Automatic seat clearing after prize distribution

#### Pool Calculation Example
```
Entry Fee: $10
Seats Taken: 8
Total Pool: $80
House Take (30%): $24
Winner Prize (70%): $56
```

### 6. HALL OF CHAMPIONS

#### Win Tier System
- **Good Win ($50+)**: Green gradient cards with celebration styling
- **Big Win ($150+)**: Blue gradient cards with enhanced effects
- **Mega Jackpot ($250+)**: Purple/gold gradient cards with premium styling

#### Winner Display
- **Username Integration**: Shows actual usernames when available
- **Fallback System**: "Player #ID" format for users without usernames
- **Win Amount**: Prominently displayed with tier-appropriate styling
- **Game Information**: Lobby name and winning timestamp

### 7. Administrative Dashboard

#### User Management
- **User List**: Complete user database with balances and status
- **Balance Editing**: Add/subtract credits with transaction logging
- **Ban/Unban System**: Suspend users with proper validation
- **Bulk Operations**: Delete multiple users (with admin protection)

#### Lobby Management
- **Lobby Creation**: Configure name, entry fee, and seat capacity
- **Status Control**: Start/stop games, adjust settings
- **Participant Monitoring**: View current players and seat allocations

#### Transaction Tracking
- **Complete History**: All financial transactions across the platform
- **Transaction Types**: Deposits, withdrawals, game entries, prize wins
- **Search & Filter**: Find transactions by user, amount, or date range

#### Prize Pool Management
- **Active Pools**: View all lobbies with players and accumulated prizes
- **Calculation Display**: Real-time house take and winner prize amounts
- **Distribution Controls**: One-click prize distribution to winners
- **Pool Statistics**: Track total pools, distributions, and house earnings

### 8. Payment Integration

#### E-Transfer Support
- **Payment Instructions**: Step-by-step guide for Canadian e-transfers
- **Multiple Options**: Email and phone number transfer methods
- **Security Information**: Password and reference details
- **Status Tracking**: Pending, completed, and failed payment states

#### Transaction System
- **Wallet Balance**: Real-time balance updates across all interfaces
- **Transaction History**: Complete record of all financial activities
- **Automatic Processing**: Balance updates on game entry, wins, and payments

### 9. Sound System

#### Audio Features
- **Achievement Sounds**: Celebration effects for badge unlocks
- **Game Sounds**: Number calling and win notification audio
- **Volume Controls**: User-configurable sound preferences
- **Mute Options**: Complete audio disable functionality

### 10. Navigation System

#### Primary Navigation
- **Header Menu**: Home, Game Lobby, Winners, FAQ sections
- **Mobile Menu**: Hamburger menu with touch-friendly navigation
- **Smooth Scrolling**: Anchor-based navigation between sections

#### Secondary Navigation (SubNav)
- **User Info**: Welcome message with current username
- **Balance Display**: Real-time balance updates
- **Dashboard Access**: Quick link to user dashboard
- **Logout Function**: Secure session termination

---

## API Reference

### Authentication Endpoints
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/session
```

### User Management
```http
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/password
GET /api/users/transactions
```

### Game Lobbies
```http
GET /api/lobbies
GET /api/lobbies/:id
POST /api/lobbies/:id/join
POST /api/lobbies/:id/leave
GET /api/lobbies/:id/cards
```

### Game Management
```http
POST /api/games/:lobbyId/start
POST /api/games/:lobbyId/stop
GET /api/games/:lobbyId/snapshot
POST /api/games/:lobbyId/claim
```

### Admin Endpoints
```http
GET /api/admin/users
PUT /api/admin/users/:id/balance
PUT /api/admin/users/:id/ban
DELETE /api/admin/users/:id

GET /api/admin/lobbies
POST /api/admin/lobbies
PUT /api/admin/lobbies/:id
DELETE /api/admin/lobbies/:id

GET /api/admin/transactions
GET /api/admin/prize-pool/:lobbyId
POST /api/admin/distribute-prize/:lobbyId
```

### Public Data
```http
GET /api/winners
GET /api/faq
```

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password TEXT NOT NULL,
  balance REAL DEFAULT 0,
  isBanned BOOLEAN DEFAULT FALSE,
  isAdmin BOOLEAN DEFAULT FALSE,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### lobbies
```sql
CREATE TABLE lobbies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  entryFee REAL NOT NULL,
  maxSeats INTEGER DEFAULT 15,
  seatsTaken INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### walletTransactions
```sql
CREATE TABLE walletTransactions (
  id INTEGER PRIMARY KEY,
  userId INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### games
```sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY,
  lobbyId INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  drawnNumbers TEXT,
  winnerId INTEGER,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  endedAt TEXT,
  FOREIGN KEY (lobbyId) REFERENCES lobbies(id),
  FOREIGN KEY (winnerId) REFERENCES users(id)
);
```

#### winners
```sql
CREATE TABLE winners (
  id INTEGER PRIMARY KEY,
  gameId INTEGER NOT NULL,
  lobbyId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  amount REAL NOT NULL,
  note TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gameId) REFERENCES games(id),
  FOREIGN KEY (lobbyId) REFERENCES lobbies(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Database Operations
```bash
# Create new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# View database
npm run db:studio

# Reset database (development only)
rm data/bingo.db && npm run db:migrate
```

---

## Configuration

### Environment Variables

#### Required Variables
```env
DATABASE_URL="file:./data/bingo.db"
JWT_SECRET="your-secure-secret-key"
NODE_ENV="production"
PORT=5000
```

#### Optional Variables
```env
# Payment Integration
STRIPE_SECRET_KEY="sk_..."
VITE_STRIPE_PUBLIC_KEY="pk_..."

# Game Configuration
DEFAULT_CALL_INTERVAL=3000
MAX_LOBBY_SIZE=15
HOUSE_TAKE_PERCENTAGE=30

# Security
SESSION_TIMEOUT=86400
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000
```

### Application Settings

#### Game Configuration
Located in `server/config/gameSettings.ts`:
```typescript
export const GAME_SETTINGS = {
  CALL_INTERVAL_MS: 3000,
  MAX_PLAYERS_PER_LOBBY: 15,
  BINGO_RANGES: {
    B: [1, 15],
    I: [16, 30], 
    N: [31, 45],
    G: [46, 60],
    O: [61, 75]
  },
  HOUSE_TAKE_PERCENTAGE: 0.30
};
```

#### Frontend Configuration
Located in `client/src/config/appConfig.ts`:
```typescript
export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  APP_NAME: 'WildCard Premium Bingo',
  VERSION: '2.0.0'
};
```

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Install dependencies
npm install

# Check for port conflicts
lsof -i :5000

# Check environment variables
cat .env
```

#### 2. Database Connection Issues
```bash
# Check database file exists
ls -la data/bingo.db

# Run migrations
npm run db:migrate

# Check database permissions
chmod 644 data/bingo.db
```

#### 3. Socket.IO Connection Problems
```bash
# Check network firewall
sudo ufw status

# Verify WebSocket support
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: test" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:5000/socket.io/
```

#### 4. Build Failures
```bash
# Clear cache
npm run clean
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Build with verbose output
npm run build -- --verbose
```

### Performance Optimization

#### Server Optimization
```bash
# Enable production optimizations
export NODE_ENV=production

# Use PM2 for process management
pm2 start npm --name "bingo" -- start
pm2 monit

# Monitor performance
pm2 show bingo
```

#### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_lobbies_status ON lobbies(status);
CREATE INDEX idx_transactions_user ON walletTransactions(userId);
CREATE INDEX idx_winners_amount ON winners(amount);
```

### Monitoring & Logs

#### Application Logs
```bash
# View real-time logs
tail -f logs/app.log

# Server logs location
./debugging/server-YYYY-MM-DD.log

# Browser logs location  
./debugging/console-YYYY-MM-DD.log
```

#### Health Checks
```bash
# API health check
curl http://localhost:5000/api/health

# Database connectivity
curl http://localhost:5000/api/admin/stats

# WebSocket connectivity
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:5000/socket.io/
```

---

## Support & Maintenance

### Regular Maintenance Tasks

#### Daily
- Monitor application logs for errors
- Check database file size and performance
- Verify WebSocket connections are stable

#### Weekly  
- Backup database file
- Review transaction logs for anomalies
- Update system dependencies

#### Monthly
- Analyze user engagement metrics
- Review prize distribution statistics
- Update SSL certificates (if applicable)

### Backup Procedures

#### Database Backup
```bash
# Create backup
cp data/bingo.db backups/bingo-$(date +%Y%m%d-%H%M%S).db

# Automated daily backup
echo "0 2 * * * cp /path/to/data/bingo.db /path/to/backups/bingo-\$(date +\%Y\%m\%d).db" | crontab -
```

#### Application Backup
```bash
# Full application backup
tar -czf backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  .
```

### Security Considerations

#### Production Security Checklist
- [ ] Strong JWT secret (32+ random characters)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Database file permissions properly restricted
- [ ] Regular security updates applied
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] SQL injection protection enabled
- [ ] XSS protection headers configured

---

## Conclusion

WildCard Premium Bingo is a comprehensive, production-ready multiplayer bingo platform with advanced features including real-time gameplay, mobile responsiveness, achievement systems, and automated prize distribution. The platform is built with modern web technologies and designed for scalability and maintainability.

For additional support or questions, refer to the source code comments and the memory bank documentation files in the `memory-bank/` directory.

**Version**: 2.0.0  
**Last Updated**: August 14, 2025  
**License**: Private/Proprietary