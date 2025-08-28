# Replit.md

## Overview
WildCard Premium Bingo is a full-stack web application for an online bingo platform. It features a React frontend and a Node.js/Express backend, utilizing PostgreSQL with Drizzle ORM. The platform aims to provide an engaging casino-themed experience, displaying game rooms, real-time bingo gameplay, winners, and an FAQ section. The architecture supports multiple simultaneous bingo games within lobby containers and includes comprehensive admin controls for game and prize management.

## User Preferences
- Preferred communication style: Simple, everyday language
- Mobile Priority: Focus on mobile-responsive design and playability

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
- **Game Engine**: Centralized GameEngine class managing game state, number drawing, and winner detection across multiple lobby instances.

### Key Components

#### Database Schema
- **Users**: Basic user authentication.
- **Lobbies**: Containers for multiple game instances.
- **Game Rooms**: Individual bingo game sessions with player counts, prize pools, entry fees.
- **Winners**: User testimonials and winning records.
- **FAQ Items**: Frequently asked questions.

#### API Endpoints
- `GET /api/game-rooms`: List all available game rooms.
- `GET /api/game-rooms/:id`: Get specific game room details.
- `GET /api/winners`: List recent winners.
- `GET /api/faq`: Get FAQ items.
- `POST /api/admin/distribute-prize/:lobbyId`: Distribute prize with 30% house take.
- `GET /api/admin/prize-pool/:lobbyId`: Get detailed prize pool information.
- Admin game management endpoints for creating, starting, deleting games, and resetting lobbies.

#### Frontend Pages & Components
- **Home Page**: Landing page with game lobby, how-to-play, winners, and FAQ.
- **Game Lobby**: Display of available bingo rooms and game instances within them.
- **HALL OF CHAMPIONS**: Showcase of winners with tiered system.
- **Admin Panel**: Comprehensive management interface for Users, Lobbies, Transactions, and Prize Pools, supporting the "lobby-as-container" architecture. Includes real-time game controls (start, speed adjustment, reset).
- **Mobile Design**: Dedicated mobile interfaces for game view, admin panel, and navigation, with touch-optimized components and conditional rendering for optimal experience.

### Data Flow
1. Frontend components fetch data from REST endpoints using TanStack Query.
2. Express server routes handle API requests.
3. Storage layer abstracts database operations using Drizzle ORM.
4. Socket.IO manages real-time communication for live game updates.
5. Frontend reactively updates based on server state and real-time events.

### Deployment Strategy
- **Development**: Vite dev server with Express API proxy.
- **Production**: Static build served by Express with API routes.
- **Database**: Drizzle migrations for schema management.
- **Environment**: Uses `DATABASE_URL` environment variable for PostgreSQL connection.

## External Dependencies
- **Database**: PostgreSQL (configured for Neon serverless)
- **UI Library**: Radix UI primitives
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Real-Time**: Socket.IO