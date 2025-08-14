# Replit.md

## Overview
This is a full-stack web application for an online bingo platform called "WildCard Premium Bingo". The application features a React frontend with a Node.js/Express backend, using PostgreSQL with Drizzle ORM for data persistence. The platform displays game rooms, winners, FAQ sections, and provides a casino-themed user interface.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom casino-themed color scheme
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Client**: Neon serverless PostgreSQL client
- **Development**: In-memory storage fallback for development/testing

### Key Components

#### Database Schema (shared/schema.ts)
- **Users**: Basic user authentication with username/password
- **Game Rooms**: Bingo game sessions with player counts, prize pools, entry fees
- **Winners**: User testimonials and winning records
- **FAQ Items**: Frequently asked questions with ordering

#### API Endpoints (server/routes.ts)
- `GET /api/game-rooms` - List all available game rooms
- `GET /api/game-rooms/:id` - Get specific game room details
- `GET /api/winners` - List recent winners and testimonials
- `GET /api/faq` - Get FAQ items

#### Frontend Pages & Components
- **Home Page**: Landing page with hero section, game lobby, how-to-play, winners, and FAQ
- **Header**: Navigation with casino branding
- **Game Lobby**: Display of available bingo rooms with real-time status
- **Recent Winners**: Testimonials and winning showcases
- **FAQ Section**: Collapsible questions and answers

## Data Flow
1. Frontend components use TanStack Query to fetch data from REST endpoints
2. Express server routes handle API requests and delegate to storage layer
3. Storage layer abstracts database operations (currently using in-memory storage with PostgreSQL schema ready)
4. Drizzle ORM provides type-safe database queries and migrations
5. Frontend updates reactively based on server state changes

## External Dependencies
- **Database**: PostgreSQL (configured for Neon serverless)
- **UI Library**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with custom casino theme
- **Development**: Replit-specific plugins for error handling and debugging

## Deployment Strategy
- **Development**: Vite dev server with Express API proxy
- **Production**: Static build served by Express with API routes
- **Database**: Drizzle migrations for schema management
- **Environment**: Uses DATABASE_URL environment variable for PostgreSQL connection

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: ESBuild bundles Express server to `dist/index.js`
- Database: Drizzle Kit handles schema migrations

### Recent Changes (August 14, 2025)
- **Mobile Responsiveness Overhaul**: Implemented comprehensive mobile-first design for the bingo game interface
- **Mobile Game View Component**: Created dedicated mobile interface with tabbed navigation (My Card, Master, Players, Info)
- **Mobile Detection Hook**: Added responsive breakpoint detection for optimal experience across devices
- **Compact Mobile Bingo Component**: Created new paginated bingo card component that shows 5 seats at a time with horizontal navigation
- **User Status Bar**: Moved balance and status information from Info tab to top of My Card tab for better visibility
- **Hamburger Menu Fix**: Added functional mobile navigation menu with proper click handlers and responsive design
- **Touch-Optimized Interface**: Larger touch targets, improved spacing, and mobile-specific interactions
- **Conditional Rendering**: Desktop vs mobile layouts provide optimal experience for each platform
- **Master Card Visibility**: Solved mobile master card issue - now prominently displayed in dedicated tab
- **Enhanced UX**: Mobile interface uses full screen height with intuitive tab navigation
- **Dashboard Cleanup**: Removed duplicate Admin Panel section from dashboard bottom as requested
- **Admin Panel Mobile Redesign**: Completely redesigned admin panel with mobile-first card layouts replacing tables
- **Leave Lobby Button Enhancement**: Made desktop Leave Lobby button more prominent with larger size and better visual emphasis
- **Mobile Admin Navigation**: Added horizontal scrollable tabs with icons and counts for mobile admin interface
- **Card-Based Admin Layout**: Converted Users, Lobbies, and Transactions from table format to mobile-friendly card layouts

### User Preferences
- **Communication Style**: Simple, everyday language
- **Mobile Priority**: Focus on mobile-responsive design and playability

### Current Status
The application is configured for PostgreSQL but currently uses in-memory storage for development. The database schema is fully defined and migration-ready. The frontend is complete with all major sections implemented. The mobile experience has been significantly improved with dedicated components and responsive design patterns.