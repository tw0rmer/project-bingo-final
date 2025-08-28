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

#### API Endpoints (server/routes/index.ts)
- `GET /api/game-rooms` - List all available game rooms
- `GET /api/game-rooms/:id` - Get specific game room details
- `GET /api/winners` - List recent winners with username/email data (joined from users table)
- `GET /api/faq` - Get FAQ items
- `POST /api/admin/distribute-prize/:lobbyId` - Distribute prize with 30% house take to specified winner
- `GET /api/admin/prize-pool/:lobbyId` - Get detailed prize pool information for lobby management

#### Frontend Pages & Components
- **Home Page**: Landing page with hero section, game lobby, how-to-play, winners, and FAQ
- **Header**: Navigation with casino branding
- **Game Lobby**: Display of available bingo rooms with real-time status
- **HALL OF CHAMPIONS**: Dramatic winners showcase with gradient cards and win tier system ($50+, $150+, $250+)
- **FAQ Section**: Collapsible questions and answers
- **Admin Panel**: Comprehensive management interface with Users, Lobbies, Transactions, and Prize Pools tabs
- **Prize Pool Management**: Real-time prize pool tracking with 30% house take calculations and distribution controls

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
- **Enhanced Admin Controls**: Added user banning and deleting functionality with confirmation dialogs
- **User Profile Management**: Created comprehensive profile page with account settings, security, and winnings tabs
- **ADD BALANCE System**: Implemented full payment system with E-Transfer support and multiple payment options
- **Navigation Improvements**: Fixed Winners section scrolling, navigation layout at various widths, and dashboard access from lobby
- **Section IDs**: Added proper IDs to all navigation sections for smooth scrolling functionality
- **Achievement System Implementation**: Built comprehensive achievement badge system with animated notifications, rarity-based styling, and progress tracking
- **SubNav Creation**: Developed secondary navigation bar to reduce header crowding by moving Dashboard, Logout, and Welcome user info
- **Achievement API Integration**: Added backend endpoints for fetching achievements, marking as viewed, and automatic unlocking triggers
- **Automatic Achievement Triggers**: Implemented system for unlocking achievements on signup welcome and game wins
- **Mobile-Responsive SubNav**: Created user-friendly subnav that works across all device sizes with compact design
- **Login/Register Page Updates**: Modified auth pages to hide subnav for cleaner focused experience
- **Achievement Categories**: Added multiple achievement types including games, social, milestone, and special categories with rarity levels
- **HALL OF CHAMPIONS Redesign**: Transformed Winners section with larger, more dramatic presentation and win tier system
- **Win Category System**: Implemented $50+ (Good Win), $150+ (Big Win), $250+ (Mega Jackpot) with color-coded gradient cards
- **Username Integration**: Winners now display actual usernames when available, falling back to "Player #ID" for legacy users
- **Winners API Enhancement**: Updated database query to join users table for username and email information display
- **Functional Prize Pool System**: Built complete 30% house take prize distribution system in admin dashboard
- **Prize Pool Management Tab**: Added dedicated "Prize Pools" tab in admin panel for managing game winnings distribution
- **Automated Prize Calculations**: Real-time calculation of total pools, house take (30%), and winner prizes (70%) based on entry fees × seats taken
- **Prize Distribution API**: Backend endpoints for distributing prizes, updating user balances, and creating transaction records
- **Wallet Integration**: Prize distributions automatically update winner balances and create wallet transaction history
- **Lobby Reset System**: Automatic lobby seat reset after prize distribution to prepare for next game session

### Latest Updates (August 28, 2025) - Lobby-as-Container Architecture Overhaul
- **Critical Architecture Change**: Completely restructured the system from "lobbies are games" to "lobbies are containers holding multiple games"
- **Database Schema Evolution**: Updated schema to separate `lobbies` (containers) from `games` (actual playable instances within lobbies)
- **Navigation Flow Redesign**: Fixed home page navigation to match dashboard experience - users now select lobbies first, then choose specific games within
- **Admin Panel Complete Overhaul**: Completely rewrote admin panel lobby management system to support the new architecture
- **Game Management System**: Added comprehensive game management modal allowing admins to view, create, start, and delete individual games within each lobby
- **Capacity Management**: Implemented maximum 4 games per lobby limit with proper UI feedback when at capacity
- **Add Game Functionality**: Created robust "Add Game" system with proper validation and error handling for lobby capacity limits
- **Reset Lobby Feature**: Added "Reset Lobby" functionality that clears ALL games from a lobby and automatically refunds all players' entry fees
- **Backend API Expansion**: Added new admin endpoints for game management: POST `/admin/lobbies/:id/games`, DELETE `/admin/games/:id`, POST `/admin/games/:id/start`, POST `/admin/lobbies/:id/reset-games`
- **UI/UX Improvements**: Enhanced admin interface with disabled states for full lobbies, proper loading states, and clear capacity indicators
- **Error Handling Enhancement**: Improved error messages and user feedback for game management operations
- **Data Consistency**: Ensured proper cleanup of game participants and refund processing during lobby resets
- **Status Management**: Implemented proper game status tracking (waiting, active, finished) with admin controls for each state

### Technical Struggles & Solutions (August 28, 2025)
- **Architecture Confusion**: Initial struggle with understanding the difference between lobbies and games - resolved by clearly defining lobbies as containers
- **Navigation Mismatch**: Home page was using different selection flow than dashboard - fixed by standardizing on lobby-first selection
- **Admin Panel Obsolescence**: Old admin panel assumed lobbies were games - completely rebuilt to manage games within lobbies
- **Capacity Error Handling**: "Add Game" button was throwing errors when lobbies were at maximum capacity - fixed with proper validation and UI feedback
- **Missing Reset Functionality**: Users needed way to clear lobbies and start fresh - implemented comprehensive reset system with automatic refunds
- **Database Relationship Issues**: Had to ensure proper foreign key relationships between lobbies, games, and participants with cascading cleanup
- **Import Dependencies**: Multiple LSP errors due to missing table imports in admin routes - resolved by adding games and gameParticipants to imports
- **State Management**: Complex state management for modals and loading states in admin panel - implemented with careful React state handling

### User Preferences
- **Communication Style**: Simple, everyday language
- **Mobile Priority**: Focus on mobile-responsive design and playability

### Current Status
The application is configured for PostgreSQL but currently uses SQLite for development. The database schema is fully defined and migration-ready. The frontend is complete with all major sections implemented. The mobile experience has been significantly improved with dedicated components and responsive design patterns.

**Architecture Status**: The application has undergone a major architectural shift to support the lobby-as-container model. Lobbies now serve as containers that hold multiple individual game instances, allowing for better scalability and game management. The admin panel has been completely rebuilt to support this new architecture, with comprehensive game management tools and proper capacity handling.

**Current Challenges**: The system is working well with the new architecture, but there may be edge cases around concurrent game creation and lobby state management that need monitoring. The reset functionality provides a clean slate when needed.

**Next Development Priorities**: 
1. Real-time game state synchronization across multiple games within lobbies
2. Enhanced lobby analytics and reporting
3. Automated game scheduling and rotation within lobbies
4. Advanced player matchmaking within lobby games