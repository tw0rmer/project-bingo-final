# System Patterns *Optional*

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-07-28 18:59:06 - Updated with detailed tech stack patterns and standards
2025-07-28 20:47:06 - Added API utility pattern for consistent API calls
2025-01-27 23:32:00 - Added admin dashboard patterns and lobby system preparation
2025-07-30 22:19:00 - Added robust error handling patterns for lobby operations

*

## Error Handling Patterns - 2025-07-30

### **Transaction-like Operations Pattern**

For operations that involve multiple database updates (especially those affecting user balance):

1. **Wrap in Try-Catch Blocks**:
   ```typescript
   try {
     // 1. Validate all inputs and preconditions
     // 2. Perform main operation
     // 3. Update related records
     // 4. Send response only after all operations succeed
   } catch (error) {
     // 1. Log detailed error information
     // 2. Rollback any partial changes
     // 3. Return appropriate error response
   }
   ```

2. **Balance Operation Safety**:
   - Always store original balance before modification
   - Implement explicit rollback for failed operations
   - Use decimal string representation for all currency values
   - Validate balance sufficiency before any deduction

3. **Mock Database Compatibility**:
   - Check database type before operations (mock vs real)
   - Use appropriate methods based on database type
   - Implement fallback mechanisms for mock database limitations
   - Maintain consistent interfaces regardless of database type

4. **State Synchronization**:
   - Fetch fresh data after modifications before sending responses
   - Ensure socket events contain data from latest database state
   - Implement validation checks between expected and actual counts
   - Use debug endpoints for state verification and repair

5. **Debugging Instrumentation**:
   - Add detailed logging at each operation step
   - Include before/after state in critical operations
   - Log all socket events with payload details
   - Capture and log all error stacks

These patterns should be applied consistently across all routes and operations to prevent similar issues in the future.


## Coding Patterns

- **Frontend**: React 18 functional components with TypeScript
- **Styling**: Tailwind CSS dark theme with custom component library
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: wouter for lightweight SPA navigation
- **API**: RESTful endpoints with JWT authentication headers
- **API Utilities**: Centralized API request handling with type-safe responses
- **Real-time**: Socket.io client integration for game events
- **Admin Interface**: Tabbed interface with modal forms for CRUD operations
- **Role-based UI**: Conditional rendering based on user privileges

*

## Architectural Patterns

- **Client-Server Architecture**: Separate client and server directories
- **Component-Based UI**: Modular React components in client/src/components/
- **Shared Types**: Common interfaces in shared/ directory
- **Database ORM**: Drizzle ORM for type-safe PostgreSQL operations
- **Authentication**: JWT middleware protecting all /api/* routes
- **Error Handling**: Centralized error handling middleware
- **API Client**: Centralized API utility for consistent error handling and type safety
- **Admin CRUD**: Standardized patterns for Create, Read, Update, Delete operations
- **Mock Database**: Fallback in-memory storage for development without external dependencies

*

## Testing Patterns

- **Database**: Migration files for schema versioning
- **Seeding**: Drizzle seed scripts for test data
- **Development**: Vite dev server with hot reload
- **Environment**: Separate configs for dev/staging/prod
- **Quick Login**: Pre-populated test accounts for rapid development iteration
- **Mock Data**: Persistent test data across server restarts for consistent testing

## API Endpoint Structure

- **Auth**: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- **User**: GET /api/dashboard (user info + lobbies)
- **Lobbies**: POST /api/lobbies/:id/join
- **Admin**: 
  - CRUD for /api/admin/users (GET, PUT balance, PUT admin status)
  - CRUD for /api/admin/lobbies (GET, POST, PUT, DELETE)
  - Read for /api/admin/walletTransactions (GET)
  - Actions: POST /api/admin/lobbies/:id/fill-bots, POST /api/admin/lobbies/:id/start

## Socket.io Events

- **Namespace**: /game
- **Events**: number draws every 3s, game end with winnerId
- **Planned**: lobby updates, seat changes, real-time player join/leave

## Frontend Patterns

- **API Utility**:
  - Centralized in `client/src/lib/api.ts`
  - Type-safe request/response handling with TypeScript generics
  - Consistent error handling for all API calls
  - Environment-aware base URL configuration
  - Authentication token management
  - JSON response validation

- **Authentication Context**:
  - Centralized auth state management
  - JWT token storage in localStorage
  - Protected routes with automatic redirects
  - Admin-only route protection

- **Admin Dashboard Patterns**:
  - **Tabbed Interface**: Single page with multiple data views
  - **Modal Forms**: Inline editing without navigation disruption
  - **Real-time Updates**: Immediate data refresh after mutations
  - **Error Boundaries**: Graceful error handling with retry options
  - **Loading States**: Consistent loading indicators across all operations
  - **Confirmation Dialogs**: User confirmation for destructive actions

## Database Patterns

- **Schema Design**: Clear separation of entities (users, lobbies, games, transactions)
- **Mock Database**: 
  - Synchronous initialization for reliable startup
  - Manual array filtering for query compatibility
  - Persistent test data with admin and user accounts
  - Type-safe interfaces matching real database schema
- **CRUD Operations**: Standardized create, read, update, delete patterns
- **Audit Trail**: Transaction logging for balance changes and admin actions

### **2025-08-01 – Migration Notice**
- Mock DB remains for unit-tests only (`USE_MOCK_DB=true`).
- Default runtime uses PostgreSQL; Drizzle migrations must be applied before start.
- Seed script seeds both engines.

### **2025-08-02 – SQLite Migration Completed**
- **Database Layer**: Migrated from mock DB to SQLite using `better-sqlite3`
- **Configuration**: Simplified `drizzle.config.ts` - removed invalid `driver` option
- **Development Tools**: Enhanced Python GUI with SQLite management features:
  - Full environment setup (no Docker required)
  - Database backup and restore functionality
  - Live progress indicators and detailed error messages
  - Windows-compatible executable finding with proper PATH resolution
- **Benefits**: File-based database, no external dependencies, persistent data, easy backups
- **Patterns**: Clean separation between SQLite (development) and potential PostgreSQL (production)

### **2025-08-02 07:00 – Schema Migration & Testing Phase**
- **Schema Conversion Pattern**: Complete migration from PostgreSQL to SQLite types
  - `pgTable` → `sqliteTable` (all table definitions)
  - `serial` → `integer` with `autoIncrement: true` (primary keys)
  - `varchar` → `text` (string fields)
  - `decimal` → `real` (currency/numeric fields)
  - `boolean` → `integer` with `mode: 'boolean'` (boolean fields)
  - `timestamp` → `integer` with `mode: 'timestamp'` (date/time fields)
- **Seed Data Pattern**: Environment-specific test credentials
  - Admin account: `admin@bingo.com` / `admin123` (Balance: $10,000)
  - Test user: `user@test.com` / `user123` (Balance: $1,000)
  - Proper role assignment (`isAdmin: true/false`)
- **Windows Compatibility Pattern**: Quoted executable paths in subprocess calls
  - Pattern: `f'"{executable_path}" {arguments}'` for shell commands
  - Prevents path parsing issues with spaces in Windows directories
- **Testing Protocol Pattern**: Systematic multi-browser verification
  - Phase-based testing with clear success criteria
  - Real-time state synchronization validation
  - Database persistence verification across server restarts

## Role-Based Access Patterns

- **Authentication**: JWT-based user identification
- **Authorization**: Middleware-level admin privilege checking
- **UI Conditional Rendering**: Admin features only visible to admin users
- **API Protection**: Admin endpoints require verified admin status
- **Visual Indicators**: Admin badges and themed UI elements

## Development Efficiency Patterns

- **Quick Login**: Single-click login for different user types
- **Pre-populated Data**: Ready-to-use test accounts and lobbies
- **Debug Logging**: Comprehensive server-side logging for development
- **Error Recovery**: Graceful fallbacks and retry mechanisms
- **Hot Reload**: Fast development cycle with Vite and TypeScript

## Upcoming Lobby System Patterns

- **Seat Management**: Visual 15-seat grid with real-time status updates
- **State Management**: Lobby states (waiting → active → finished)
- **Real-time Updates**: Socket.io for live seat changes and player notifications
- **Wallet Integration**: Entry fee deduction and balance validation
- **Participant Tracking**: Join/leave mechanics with seat assignment

---

## 2025-08-08 – Patterns for Deterministic, Server‑Authoritative Cards

- **Server Authoritative State**: Server generates and owns the canonical 5‑number row per seat. Clients never randomize card numbers locally when server data is available.
- **Deterministic Generation**: Use seeded RNG keyed by stable context (`lobbyId`) to create 15 consistent rows (B/I/N/G/O ranges). Enables reproducible sessions for debugging and consistent pre‑game display.
- **Pre‑Game Discovery Endpoint**: `GET /api/lobbies/:lobbyId/cards` lets all clients render identical rows in the waiting phase.
- **Snapshot & Recovery**: `GET /api/games/:lobbyId/snapshot` includes `cards` + `drawnNumbers` to restore UI after reconnects; always trust snapshot over local cache.
- **Idempotent Client Rendering**: `BingoCard` composes the full 15x5 grid from server mapping; persists per `lobbyId/seat` to survive reloads; auto‑highlights from `calledNumbers`.
- **Secure Win Validation**: Server validates claim numbers against `game_participants.card` and current `drawnNumbers` before ending the game.

## 2025-08-08 – UI Composition Patterns (Game Sidebar)

- **Information Hierarchy**: Place live/ephemeral data (Last/Recent) above reference data (Master Card) for faster scan.
- **Context‑Aware Controls**: Admin Start/Stop visibility follows game state; prevents invalid actions and reduces confusion.
- **Compact Reference Blocks**: Dense grids (1–75) use compact cells and optional headers to conserve space without losing clarity.
- **Layout Headroom**: Slightly increased container height to avoid cramping participant lists while preserving 995px width constraint.

## 2025-08-08 – Patterns: Winners Pipeline, Bot Handling, Usernames, Admin UX

- Winners Pipeline Pattern
  - Server authoritative endGame inserts a row into `winners` table; public list and admin CRUD endpoints manage display state.
  - Client section renders a table; admin-only actions hidden using `AuthContext` `user?.isAdmin`.

- Auto-Winner Detection Pattern
  - Cache `participants` with their canonical rows on `startGame`.
  - After each `number_called`, iterate participants; if `row.every(called)` → `endGame`.

- Bot Handling Pattern
  - Fill Bots computes free seats and assigns randomly.
  - Reuse existing bot users whenever possible; generate compact username and bot email if needed; insert into `lobby_participants`.

- Username Pattern
  - Register accepts `username` (unique check); login accepts email or username; `users.username` added via PRAGMA check.
  - UI prefers `username || email` to improve readability.

- Admin UX Pattern
  - Users grid shows key attributes (email, username, role, balance) with inline actions (edit balance, set username, toggle admin).
  - Bulk operations exposed via dedicated endpoints; UI multi-select planned.

## 2025-08-08 – Patterns: Admin Controls, Seat Locking, Finished Snapshot, Theming

- **Admin Control Pattern**: Engine exposes imperative methods `pauseGame`, `resumeGame`, `setCallInterval(ms)`; emits `game_paused`, `game_resumed`, `call_speed_changed`; snapshot includes `isPaused`, `callIntervalMs` for hydration.
- **Seat Locking Pattern**: Treat lobby `status` as join/leave gate. On start: set to `active` (block joins/leaves). On end: set to `finished` (allow leave, no refund). Pre‑game: `waiting` (allow join/leave with refund).
- **Finished Snapshot Pattern**: Cache final game snapshot (drawnNumbers + cards) per lobby in memory; serve from snapshot endpoint when no active game so post‑game refresh still shows highlights. Option to persist to DB later for durability.
- **Theme Consistency Pattern**: Introduce a `SiteLayout` wrapper that standardizes header/footer, base background, and color tokens across app pages to mirror the marketing site look.
