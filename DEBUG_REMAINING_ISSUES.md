# Debugging Guide - Remaining Critical Issues

**Created**: 2025-08-28 23:50:00  
**Status**: Ready for Live Testing

## 🎯 Testing Priority Order

### 1. **Prize Pool Distribution** ✅ **FIXED - READY FOR VERIFICATION**
**Expected Result**: Winners should now receive balance updates automatically
**Test Steps**:
1. Start a game with multiple players
2. Complete a bingo pattern 
3. Verify winner receives balance update within 5 seconds
4. Check server console for detailed prize calculation logs
5. Verify achievement notifications appear for winner

**Debug Commands**:
```bash
# Check server logs for prize distribution
grep "Prize calculation" server_logs.txt
grep "Updated balance for user" server_logs.txt
grep "achievement" server_logs.txt
```

---

### 2. **Admin Speed Control** ⚠️ **NEEDS LIVE VERIFICATION**
**Issue**: Cannot adjust number calling speed during games
**Current Status**: Implementation appears correct, needs testing

**Test Steps**:
1. Start a game as admin
2. Open admin controls panel
3. Adjust speed slider (1-5 seconds)
4. Verify API call succeeds (check Network tab)
5. Confirm speed change takes effect immediately

**Debug Checklist**:
- [ ] Admin endpoint accessible: `/api/admin/games/:gameId/set-interval`
- [ ] POST request includes valid `seconds` parameter (1-5)
- [ ] Authorization header includes admin token
- [ ] Game engine `setCallInterval()` method executes
- [ ] Socket event `call_speed_changed` broadcasts to all players

**Debug Commands**:
```javascript
// Test admin endpoint directly
fetch('/api/admin/games/1/set-interval', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({ seconds: 2 })
})
.then(r => r.json())
.then(console.log);
```

---

### 3. **Real-Time Seat Updates** ⚠️ **NEEDS CROSS-BROWSER TESTING**
**Issue**: Real-time seat updates not working without page refresh
**Current Status**: Socket events properly implemented, needs verification

**Test Steps**:
1. Open lobby in 2 different browsers
2. Join a seat in browser A
3. Verify seat immediately shows as taken in browser B
4. Leave seat in browser A
5. Verify seat immediately shows as available in browser B

**Debug Checklist**:
- [ ] Socket events `seat_taken` and `seat_freed` emit from server
- [ ] Client handlers `handleSeatTaken` and `handleSeatFreed` receive events
- [ ] Lobby seat count updates in real-time
- [ ] Participant list refreshes automatically
- [ ] Username updates appear without manual refresh

**Debug Commands**:
```javascript
// Monitor socket events in browser console
socket.on('seat_taken', (data) => console.log('Seat taken:', data));
socket.on('seat_freed', (data) => console.log('Seat freed:', data));
```

---

### 4. **Pattern Probability Visuals** ⚠️ **DATA FLOW DEBUGGING NEEDED**
**Issue**: Win probability indicators not functioning
**Current Status**: Components exist but data flow may be broken

**Test Steps**:
1. Join a game and select seats
2. Wait for numbers to be called
3. Check if PatternIndicator appears (bottom-right corner)
4. Verify progress percentages update as numbers are called
5. Confirm "numbers needed" display correctly

**Debug Checklist**:
- [ ] `patternProgress` state updates when numbers are called
- [ ] `detectRowPatternProgress` receives correct card and called numbers
- [ ] `serverCardsBySeat` contains valid card data
- [ ] `PatternIndicator` component renders with correct props
- [ ] Progress calculations are accurate

**Debug Commands**:
```javascript
// Debug pattern progress in game page
console.log('Server cards:', serverCardsBySeat);
console.log('Called numbers:', calledNumbers);
console.log('Pattern progress:', patternProgress);
console.log('Selected seats:', selectedSeats);
```

**Fix Location**: `client/src/pages/game.tsx` lines 333-341
```javascript
// Check useEffect dependencies
useEffect(() => {
  console.log('Pattern effect triggered:', { serverCardsBySeat, calledNumbers });
  if (serverCardsBySeat && Object.keys(serverCardsBySeat).length > 0 && calledNumbers.length > 0) {
    const patterns = Object.entries(serverCardsBySeat).map(([seat, card]) => {
      const progress = detectRowPatternProgress(card, calledNumbers);
      console.log(`Seat ${seat} progress:`, progress);
      return { seat: parseInt(seat), ...progress };
    });
    setPatternProgress(patterns);
  }
}, [serverCardsBySeat, calledNumbers]);
```

---

### 5. **Game Auto-Reset Timing** 🟡 **INVESTIGATION ONGOING**
**Issue**: Games not automatically resetting after 30-60 seconds post-win
**Current Status**: Timer mechanism exists but needs verification

**Test Steps**:
1. Complete a game (achieve bingo)
2. Wait exactly 30 seconds after winner announcement
3. Verify game automatically resets to "waiting" status
4. Check that lobby reopens for new players
5. Confirm game state clears properly

**Debug Checklist**:
- [ ] `setTimeout` executes after `endGame()` (gameEngine.ts line 404)
- [ ] `autoResetGame()` function runs successfully
- [ ] `game_reset` socket event emits to all players
- [ ] Client `handleGameReset` receives and processes event
- [ ] Lobby status updates to "active"
- [ ] Participants list clears

**Debug Commands**:
```bash
# Server logs for auto-reset
grep "Scheduling automatic reset" server_logs.txt
grep "Auto-resetting game" server_logs.txt
grep "Successfully auto-reset" server_logs.txt
```

---

## 🔧 General Debug Setup

### Enable Debug Logging
```javascript
// Add to client-side for more verbose logging
localStorage.setItem('debug', 'bingo:*');

// Server-side environment variables
DEBUG=bingo:* node server/index.js
```

### Browser DevTools Checklist
- [ ] Network tab monitoring API calls
- [ ] Console tab for JavaScript errors
- [ ] Application tab for localStorage values
- [ ] WebSocket frames in Network tab for socket events

### Multi-Browser Test Setup
1. Chrome (Desktop)
2. Firefox (Desktop) 
3. Chrome Mobile (Responsive mode)
4. Safari Mobile (if available)

### Admin Account Test Setup
```sql
-- Ensure admin user exists for testing
UPDATE users SET isAdmin = true WHERE email = 'your-admin-email@example.com';
```

---

## 📊 Expected Test Results

### ✅ **SUCCESS INDICATORS**:
- Winners receive balance updates within 5 seconds
- Admin speed control changes calling interval immediately  
- Seat updates appear instantly across all browsers
- Pattern indicators show accurate progress percentages
- Games auto-reset exactly 30 seconds after completion

### 🚨 **FAILURE INDICATORS**:
- 404 errors on admin endpoints
- Socket events not received in browser console
- Balance doesn't update after winning
- Pattern indicators never appear or show wrong data
- Games stay "finished" indefinitely

### 📝 **LOGGING REQUIREMENTS**:
- All prize distribution steps logged with amounts
- Socket event emissions logged with room targeting
- Pattern calculation results logged with percentages
- Auto-reset timer execution logged with timestamps
- Achievement unlocks logged with user details

This debugging guide should help identify and resolve any remaining issues with the WildCard Premium Bingo platform.
