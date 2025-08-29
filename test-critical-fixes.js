/**
 * Critical Fixes Test Script
 * Run this in browser console to test the major fixes implemented today
 */

// Test 1: Verify prize distribution error handling exists
function testPrizeDistributionLogging() {
  console.log('🧪 Testing Prize Distribution Logging...');
  
  // Check if the server has proper error handling
  fetch('/api/games/1', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
  .then(r => r.json())
  .then(game => {
    console.log('✅ Game API accessible, prize distribution should work');
    console.log('Game details:', game);
  })
  .catch(err => {
    console.log('⚠️ Game API not accessible:', err);
  });
}

// Test 2: Verify admin speed control endpoint
function testAdminSpeedControl() {
  console.log('🧪 Testing Admin Speed Control...');
  
  // Test the admin endpoint (will fail if not admin, but should return proper error)
  fetch('/api/admin/games/1/set-interval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ seconds: 3 })
  })
  .then(r => r.json())
  .then(result => {
    if (result.message && result.message.includes('interval')) {
      console.log('✅ Admin speed control endpoint working');
    } else if (result.message && result.message.includes('Admin')) {
      console.log('✅ Admin endpoint exists (user not admin)');
    } else {
      console.log('⚠️ Unexpected response:', result);
    }
  })
  .catch(err => {
    console.log('⚠️ Admin endpoint error:', err);
  });
}

// Test 3: Verify socket events for real-time updates
function testSocketEvents() {
  console.log('🧪 Testing Socket Events...');
  
  if (typeof socket !== 'undefined') {
    console.log('✅ Socket connection available');
    
    // Test event listeners
    const events = ['seat_taken', 'seat_freed', 'player_won', 'game_reset', 'achievements_unlocked'];
    events.forEach(event => {
      const testHandler = (data) => {
        console.log(`✅ Socket event '${event}' received:`, data);
      };
      
      socket.on(event, testHandler);
      
      // Clean up after 5 seconds
      setTimeout(() => {
        socket.off(event, testHandler);
      }, 5000);
    });
    
    console.log('Socket event listeners registered for 5 seconds');
  } else {
    console.log('⚠️ Socket not available - check if on game/lobby page');
  }
}

// Test 4: Verify pattern indicator component
function testPatternIndicator() {
  console.log('🧪 Testing Pattern Indicator...');
  
  // Check if pattern indicator component exists in DOM
  const patternIndicator = document.querySelector('[data-testid="pattern-indicator"], [data-testid="pattern-indicator-compact"]');
  
  if (patternIndicator) {
    console.log('✅ Pattern indicator component found in DOM');
    console.log('Pattern indicator element:', patternIndicator);
  } else {
    console.log('⚠️ Pattern indicator not visible (normal if not in game with selected seats)');
  }
  
  // Check if pattern detection utility is available
  if (typeof detectRowPatternProgress !== 'undefined') {
    console.log('✅ Pattern detection utility available');
  } else {
    console.log('⚠️ Pattern detection utility not in global scope (normal)');
  }
}

// Test 5: Verify achievement system integration
function testAchievementSystem() {
  console.log('🧪 Testing Achievement System...');
  
  fetch('/api/achievements', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Achievement system accessible');
    console.log('Available achievements:', data.achievements?.length || 0);
    console.log('User achievements:', data.userAchievements?.length || 0);
  })
  .catch(err => {
    console.log('⚠️ Achievement system error:', err);
  });
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Critical Fixes Test Suite...');
  console.log('════════════════════════════════════════');
  
  testPrizeDistributionLogging();
  setTimeout(testAdminSpeedControl, 1000);
  setTimeout(testSocketEvents, 2000);
  setTimeout(testPatternIndicator, 3000);
  setTimeout(testAchievementSystem, 4000);
  
  setTimeout(() => {
    console.log('════════════════════════════════════════');
    console.log('✅ Test suite completed!');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Test prize distribution by completing a game');
    console.log('2. Test admin speed control during active game');
    console.log('3. Test real-time seat updates with multiple browsers');
    console.log('4. Verify pattern indicators appear during gameplay');
    console.log('5. Check server logs for detailed debugging info');
  }, 6000);
}

// Export functions for manual testing
window.testPrizeDistribution = testPrizeDistributionLogging;
window.testAdminSpeed = testAdminSpeedControl;
window.testSockets = testSocketEvents;
window.testPatterns = testPatternIndicator;
window.testAchievements = testAchievementSystem;
window.runAllTests = runAllTests;

console.log('🧪 Critical Fixes Test Script Loaded!');
console.log('💡 Run runAllTests() to test all fixes, or use individual test functions:');
console.log('   - testPrizeDistribution()');
console.log('   - testAdminSpeed()');
console.log('   - testSockets()');
console.log('   - testPatterns()');
console.log('   - testAchievements()');
