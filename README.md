# 🎯 WildCard Premium Bingo

**A full-stack, real-time multiplayer bingo platform with casino-themed styling - Currently in Development.**

![Bingo Game](https://img.shields.io/badge/Game-Bingo-red?style=for-the-badge) ![Real-time](https://img.shields.io/badge/Real--time-Socket.io-blue?style=for-the-badge) ![Mobile](https://img.shields.io/badge/Mobile-Responsive-green?style=for-the-badge) ![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge)

## 🌟 Project Overview

WildCard Premium Bingo is a real-time multiplayer bingo platform **currently under active development**. The project aims to feature 15-seat lobbies, entry fees, prize pools, user authentication, admin management, and a complete wallet system. Built with modern web technologies and designed for mobile-first gameplay with casino-themed aesthetics.

## ⚠️ **CURRENT STATUS: IN DEVELOPMENT**

**Known Issues Requiring Investigation:**
- 🚫 **Prize Pool Distribution** - Winners not receiving balance updates (CRITICAL)
- 🚫 **Admin Live Speed Control** - Cannot adjust number calling speed during games (CRITICAL)  
- 🚫 **User Profile Achievements** - Achievement system not properly implemented
- 🚫 **Pattern Probability Visuals** - Win probability indicators not functioning
- 🚫 **Live Seat Selection** - Real-time seat updates not working without page refresh
- 🔍 **Additional Issues** - More functionality needs thorough testing and debugging

**This project is NOT production-ready and requires significant debugging and feature completion.**

### ✨ Key Features

- 🎮 **Real-time Multiplayer** - Up to 15 players per game with instant synchronization
- 💰 **Multi-tier Lobbies** - $5, $10, and $25 entry fee games
- 🏆 **Prize Pool System** - Automatic prize distribution with house fee management
- 👥 **User Authentication** - Secure login system with balance tracking
- 📱 **Mobile-Responsive** - Touch-friendly interface optimized for all devices
- ⚡ **Real-time Features** - Live number calling, instant winner detection
- 🎉 **Winner Celebrations** - Animated confetti and prize announcements
- 🎯 **Pattern Recognition** - Automatic win detection with multiple pattern support
- 😊 **Social Interactions** - Emoji reactions with floating animations
- 🎛️ **Admin Controls** - Live game management and speed adjustments
- 📊 **Analytics Dashboard** - User statistics and game history
- 🔧 **GUI Management Tools** - Visual server control interface

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with custom casino theme
- **Shadcn/UI** component library
- **Socket.IO Client** for real-time communication
- **TanStack Query** for state management
- **Wouter** for client-side routing
- **Framer Motion** for animations
- **Vite** for build tooling

### Backend
- **Node.js** with TypeScript
- **Express.js** REST API
- **Socket.IO** for real-time events
- **SQLite** with Drizzle ORM
- **JWT** authentication
- **Bcrypt** password hashing

### Database Schema
- **Users** - Authentication and balance management
- **Lobbies** - Game room containers with different entry fees
- **Game Rooms** - Individual bingo sessions
- **Winners** - Prize distribution records
- **FAQ** - Dynamic help content

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wildcard-premium-bingo.git
   cd wildcard-premium-bingo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=file:./data/bingo.db
   USE_MOCK_DB=false
   PORT=5000
   JWT_SECRET=your-secure-jwt-secret-here
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Initialize database and schema
   npm run db:push
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Open `http://localhost:5000`
   - Default admin login: `admin@bingo.com` / `admin123`

## 🎮 Game Features

### Real-Time Gameplay
- **Live Number Calling** - Automated number announcements with visual highlights
- **Instant Win Detection** - Automatic pattern recognition across all seats
- **Multi-Seat Support** - Players can occupy multiple seats per game
- **Synchronized State** - All players see identical game state in real-time

### Lobby System
- **$5 Classic Bingo** - Entry-level games with standard prizes
- **$10 Premium Bingo** - Enhanced experience with bigger rewards
- **$25 High Stakes** - Professional-tier games for serious players

### Winner Experience
- **Celebration Animations** - Confetti effects and victory sounds
- **Prize Breakdown** - Transparent fee structure (70% winner, 30% house)
- **Instant Balance Updates** - Real-time wallet adjustments
- **Winner History** - Public leaderboard with recent victories

### Social Features
- **Emoji Reactions** - Express yourself with floating emoji animations
- **Player Interactions** - See other players' reactions in real-time
- **Community Atmosphere** - Shared excitement and celebrations

## 🎛️ Admin Features

### Game Management
- **Live Speed Control** - Adjust number calling intervals (1-5 seconds)
- **Game Reset** - Manually restart games or fix issues
- **Player Management** - Monitor seats and remove problematic players
- **Prize Distribution** - Override automatic payouts when needed

### Analytics Dashboard
- **Real-time Metrics** - Active players, games, and revenue
- **Winner Statistics** - Track payout patterns and game performance
- **User Activity** - Monitor login patterns and engagement
- **Financial Reports** - Revenue tracking and profit analysis

### GUI Management Tools
- **Visual Server Control** (`server_manager_gui.py`)
- **Database Management** - Backup, restore, and maintenance
- **Real-time Monitoring** - Server status and performance metrics
- **Command Line Interface** (`server_manager_cli.py`)

## 📱 Mobile Optimization

### Touch-First Design
- **Large Touch Targets** - Optimized for finger navigation
- **Responsive Layouts** - Adapts to all screen sizes
- **Mobile Gestures** - Swipe navigation and touch interactions
- **Performance Optimized** - Smooth 60fps gameplay on mobile devices

### Cross-Device Synchronization
- **Seamless Switching** - Move between devices mid-game
- **Persistent Sessions** - Maintain login across device changes
- **Real-time Updates** - Instant synchronization across all connected devices

## 🔧 Development Tools

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run db:push      # Sync database schema
npm run db:seed      # Populate with sample data
npm run db:studio    # Visual database editor
```

### GUI Management
```bash
python server_manager_gui.py    # Visual server control interface
python server_manager_cli.py    # Command-line management tools
```

### Testing & Debugging
- **Comprehensive Logging** - Detailed server and client logs
- **Error Handling** - Graceful error recovery and user feedback
- **Development Tools** - Hot reload and debugging support

## 🌐 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
PORT=5000
```

### Deployment Platforms
- **Replit** - Ready-to-deploy with built-in database
- **Heroku** - Easy deployment with PostgreSQL addon
- **Vercel** - Frontend with separate backend deployment
- **AWS/DigitalOcean** - Full VPS deployment

## 🗄️ Database Schema

### Core Tables
- **users** - User authentication and wallet balances
- **lobbies** - Game room configurations and settings
- **games** - Individual bingo game sessions
- **game_participants** - Player seat assignments
- **winners** - Prize distribution records
- **faq_items** - Dynamic help content

### Relationships
- Users can participate in multiple games
- Lobbies contain multiple game sessions
- Games track multiple participants
- Winners are linked to specific games and users

## 🎯 Game Mechanics

### Card Generation
- **Deterministic Algorithm** - Reproducible cards using player ID + game ID
- **Standard Bingo Format** - 5x5 grid with FREE center space
- **Column Ranges** - B(1-15), I(16-30), N(31-45), G(46-60), O(61-75)
- **Duplicate Prevention** - Ensures unique numbers per card

### Winner Detection
- **Pattern Recognition** - Standard bingo patterns (rows, columns, diagonals)
- **Multi-Seat Logic** - Handles players with multiple seats
- **Chronological Ordering** - First completion wins in case of ties
- **Instant Validation** - Real-time pattern checking

### Prize Distribution
- **Automatic Payouts** - Instant balance updates upon winning
- **House Fee** - 30% platform fee, 70% to winner
- **Multi-Seat Bonuses** - Increased prizes for multiple winning seats
- **Transaction Logging** - Complete audit trail of all payouts

## 📊 Performance Features

### Real-Time Optimization
- **Socket.IO** - Efficient WebSocket communication
- **Event Batching** - Reduced network overhead
- **Client-Side Prediction** - Smooth user experience
- **Connection Recovery** - Automatic reconnection handling

### Database Optimization
- **SQLite** - Lightweight, serverless database
- **Indexed Queries** - Fast data retrieval
- **Connection Pooling** - Efficient resource management
- **Query Optimization** - Minimal database calls

## 🔐 Security Features

### Authentication
- **JWT Tokens** - Secure session management
- **Password Hashing** - Bcrypt with salt rounds
- **Session Validation** - Server-side token verification
- **CSRF Protection** - Cross-site request forgery prevention

### Data Protection
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Content sanitization
- **Rate Limiting** - API endpoint protection

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use (Windows)**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Database Connection Issues**
```bash
# Check database file exists
ls -la data/bingo.db

# Reset database
npm run db:push --force
```

**Real-time Connection Problems**
- Check firewall settings
- Verify Socket.IO port accessibility
- Clear browser cache and localStorage

### Development Tips
- Use the GUI manager for visual debugging
- Check server logs in `debugging/` folder
- Monitor browser console for client-side errors
- Use database studio for data inspection

## 📈 Recent Updates (August 2025)

### Critical Fixes Resolved
- ✅ **Admin Speed Control** - Fixed API endpoint mismatches
- ✅ **Game Auto-Reset** - Proper event handling for game completion
- ✅ **Winner Detection** - Improved multi-seat logic and chronological ordering
- ✅ **Emoji Animations** - Fixed cleanup and timing issues
- ✅ **Pattern Indicators** - Real-time progress tracking
- ✅ **SQLite Compatibility** - Removed PostgreSQL dependencies
- ✅ **Windows Deployment** - Cross-platform compatibility fixes

### Performance Improvements
- Enhanced Socket.IO event handling
- Optimized database queries
- Improved mobile responsiveness
- Streamlined real-time synchronization

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially real-time features)
5. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

### Testing Guidelines
- Test real-time functionality across multiple browser tabs
- Verify mobile responsiveness
- Check admin controls work correctly
- Validate winner detection logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Socket.IO** - Real-time communication
- **Drizzle ORM** - Type-safe database operations
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

## 📞 Support

For support, questions, or feature requests:
- Create an issue on GitHub
- Check the FAQ section in the application
- Review the debugging guide in `DEBUGGING_GUIDE.md`

---

**Built with ❤️ for the bingo community**

*Ready for production deployment with all critical bugs resolved and comprehensive testing completed.*