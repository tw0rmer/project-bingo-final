# Replit.md

## Overview
WildCard Premium Bingo is a fully functional, real-time multiplayer bingo platform with 15-seat lobbies, entry fees, prize pools, user authentication, admin management, and wallet system. Features mobile-responsive design with casino-themed styling, cross-device real-time gameplay, automatic number calling, winner celebration system, admin-controlled speed settings, pattern recognition, social interactions, and comprehensive error handling. All critical bugs have been resolved and the system is production-ready.

## User Preferences
- Preferred communication style: Simple, everyday language
- Mobile Priority: Focus on mobile-responsive design and playability
- Production Quality: All features must work reliably without bugs
- Real-time Performance: Instant updates and smooth gameplay experience

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom casino-themed color scheme
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Client**: Neon serverless PostgreSQL client
- **Real-Time Communication**: Socket.IO for live game events (number calling, winner detection)
- **Game Engine**: Centralized GameEngine class with fixed winner detection logic that properly handles multiple seats and chronological winner determination
- **Authentication**: Replit Auth integration with secure session management
- **Performance**: Optimized real-time updates with proper error handling

### Key Components

#### Database Schema
- **Users**: Basic user authentication.
- **Lobbies**: Containers for multiple game instances.
- **Game Rooms**: Individual bingo game sessions with player counts, prize pools, entry fees.
- **Winners**: User testimonials and winning records.
- **FAQ Items**: Frequently asked questions.

#### API Endpoints
- `GET /api/games/:id`: Get specific game details and state
- `GET /api/games/:id/participants`: Get game participants and seat information
- `POST /api/games/:id/join`: Join a game with seat selection
- `POST /api/games/:id/claim`: Claim a win with validation
- `POST /api/games/:id/set-interval`: Admin speed control (1-5 seconds)
- `GET /api/lobbies`: List all available lobbies
- `GET /api/lobbies/:id/games`: Get games within a specific lobby
- `GET /api/winners`: List recent winners with prize amounts
- `GET /api/faq`: Get FAQ items
- `GET /api/dashboard`: User dashboard with balance and lobby info
- Admin endpoints for game management, prize distribution, and lobby control

#### Frontend Pages & Components
- **Home Page**: Landing page with live lobby status, winner showcase, and FAQ
- **Game View**: Real-time bingo game interface with pattern indicators, emoji reactions, and winner celebration
- **Lobby Selection**: Choose and join specific lobbies with different entry fees
- **Admin Panel**: Comprehensive management with real-time game controls and prize distribution
- **Winner Celebration Modal**: Animated celebration with confetti and prize display
- **Pattern Indicators**: Live progress tracking showing how close each seat is to winning
- **Emoji Reactions**: Social interaction system with floating animations
- **Mobile Optimization**: Touch-friendly interface with responsive design and mobile-specific navigation
- **Real-time Features**: Live number calling, instant winner detection, and synchronized game state

### Data Flow
1. Frontend components fetch data from REST endpoints using TanStack Query
2. Express server routes handle API requests with authentication
3. Drizzle ORM manages database operations with proper transaction handling
4. Socket.IO provides real-time communication for:
   - Live number calling with countdown timers
   - Instant winner detection and celebration
   - Game state synchronization across all clients
   - Admin controls (speed changes, game management)
   - Social features (emoji reactions)
5. Frontend reactively updates with optimistic UI and error handling
6. Game Engine manages deterministic card generation and fair winner detection

### Deployment Strategy
- **Development**: Vite dev server with Express API proxy.
- **Production**: Static build served by Express with API routes.
- **Database**: Drizzle migrations for schema management.
- **Environment**: Uses `DATABASE_URL` environment variable for PostgreSQL connection.

## Recent Critical Fixes (August 2025)
### Winner Detection System
- **Issue**: Multiple seat winners were incorrectly detected due to loop-break logic
- **Solution**: Implemented chronological winner detection that finds ALL winning seats and declares the seat that completed first as the winner
- **Impact**: Fair and accurate winner determination for users with multiple seats

### Emoji Reactions
- **Issue**: Floating emoji animations not disappearing properly
- **Solution**: Fixed animation timing and cleanup logic (2.5 second duration)
- **Impact**: Smooth social interactions without UI clutter

### Admin Speed Control
- **Issue**: Incorrect API endpoint prevented live speed adjustments
- **Solution**: Corrected endpoint from `/api/admin/games/` to `/api/games/` 
- **Impact**: Real-time game speed control during active games

### Pattern Indicators
- **Issue**: Pattern progress calculations not updating during gameplay
- **Solution**: Added proper useEffect dependencies for real-time pattern tracking
- **Impact**: Live feedback showing players how close they are to winning

### Winner Experience System (August 28, 2025)
- **Issue**: Winners were recorded but prizes not shown in balance, no celebration modal, poor winner announcements
- **Root Cause**: Frontend not refreshing balance after winning, celebration modal missing prize breakdown, socket events not handled properly
- **Solution**: 
  - Added automatic balance refresh in `handlePlayerWon` using `/api/auth/me` endpoint
  - Enhanced celebration modal with house fee breakdown (30% house, 70% winner)
  - Improved winner announcements with player names and seat numbers for all players
  - Fixed celebration modal props and TypeScript interfaces
- **Impact**: Complete winner experience with real-time balance updates, detailed prize breakdown, and prominent winner announcements

## External Dependencies
- **Database**: PostgreSQL (configured for Neon serverless)
- **UI Library**: Radix UI primitives with Shadcn/ui components
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom casino theme
- **Real-Time**: Socket.IO for live gameplay
- **Authentication**: Replit Auth integration
- **State Management**: TanStack Query for server state
- **Animations**: Framer Motion for celebrations and transitions