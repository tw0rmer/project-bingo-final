// Pattern detection utilities for bingo cards
export type Pattern = 'row' | 'column' | 'diagonal' | 'corners' | 'fullCard';

export interface PatternProgress {
  pattern: Pattern;
  progress: number; // 0-1 percentage
  numbersNeeded: number[];
  numbersMatched: number[];
  isComplete: boolean;
}

// Check pattern progress for a single 5-number row (seat)
export function detectRowPatternProgress(
  card: number[],
  calledNumbers: number[]
): PatternProgress {
  const matched = card.filter(n => calledNumbers.includes(n));
  const needed = card.filter(n => !calledNumbers.includes(n));
  
  return {
    pattern: 'row',
    progress: matched.length / card.length,
    numbersNeeded: needed,
    numbersMatched: matched,
    isComplete: needed.length === 0
  };
}

// Check all possible winning patterns for a full 15-row bingo card
export function detectAllPatternsProgress(
  fullCard: number[][], // 15x5 array
  calledNumbers: number[]
): PatternProgress[] {
  const patterns: PatternProgress[] = [];
  
  // Check all 15 rows
  fullCard.forEach((row, index) => {
    const pattern = detectRowPatternProgress(row, calledNumbers);
    patterns.push({
      ...pattern,
      pattern: 'row' as Pattern
    });
  });
  
  // Check 5 columns
  for (let col = 0; col < 5; col++) {
    const column = fullCard.map(row => row[col]);
    const matched = column.filter(n => calledNumbers.includes(n));
    const needed = column.filter(n => !calledNumbers.includes(n));
    
    patterns.push({
      pattern: 'column',
      progress: matched.length / column.length,
      numbersNeeded: needed,
      numbersMatched: matched,
      isComplete: needed.length === 0
    });
  }
  
  // Check diagonals (if card is square, otherwise skip)
  if (fullCard.length >= 5) {
    // Top-left to bottom-right diagonal
    const diagonal1 = [];
    for (let i = 0; i < Math.min(5, fullCard.length); i++) {
      diagonal1.push(fullCard[i][i]);
    }
    const d1Matched = diagonal1.filter(n => calledNumbers.includes(n));
    const d1Needed = diagonal1.filter(n => !calledNumbers.includes(n));
    
    patterns.push({
      pattern: 'diagonal',
      progress: d1Matched.length / diagonal1.length,
      numbersNeeded: d1Needed,
      numbersMatched: d1Matched,
      isComplete: d1Needed.length === 0
    });
    
    // Top-right to bottom-left diagonal
    const diagonal2 = [];
    for (let i = 0; i < Math.min(5, fullCard.length); i++) {
      diagonal2.push(fullCard[i][4 - i]);
    }
    const d2Matched = diagonal2.filter(n => calledNumbers.includes(n));
    const d2Needed = diagonal2.filter(n => !calledNumbers.includes(n));
    
    patterns.push({
      pattern: 'diagonal',
      progress: d2Matched.length / diagonal2.length,
      numbersNeeded: d2Needed,
      numbersMatched: d2Matched,
      isComplete: d2Needed.length === 0
    });
  }
  
  // Check 4 corners pattern
  if (fullCard.length >= 5) {
    const corners = [
      fullCard[0][0], // Top-left
      fullCard[0][4], // Top-right
      fullCard[4][0], // Bottom-left (5th row)
      fullCard[4][4]  // Bottom-right (5th row)
    ];
    const cornersMatched = corners.filter(n => calledNumbers.includes(n));
    const cornersNeeded = corners.filter(n => !calledNumbers.includes(n));
    
    patterns.push({
      pattern: 'corners',
      progress: cornersMatched.length / 4,
      numbersNeeded: cornersNeeded,
      numbersMatched: cornersMatched,
      isComplete: cornersNeeded.length === 0
    });
  }
  
  return patterns;
}

// Get the best patterns (closest to winning)
export function getBestPatterns(patterns: PatternProgress[], limit = 3): PatternProgress[] {
  return patterns
    .filter(p => !p.isComplete)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit);
}

// Recommend best seats based on pattern analysis
export function recommendSeats(
  availableSeats: number[],
  seatCards: Record<number, number[]>,
  calledNumbers: number[],
  topN = 3
): { seat: number; score: number; nearWinPatterns: PatternProgress[] }[] {
  const seatScores = availableSeats.map(seat => {
    const card = seatCards[seat];
    if (!card) return { seat, score: 0, nearWinPatterns: [] };
    
    const pattern = detectRowPatternProgress(card, calledNumbers);
    
    // Score based on progress and numbers needed
    let score = pattern.progress * 100;
    
    // Bonus for being very close to winning
    if (pattern.numbersNeeded.length === 1) score += 50;
    if (pattern.numbersNeeded.length === 2) score += 25;
    
    return {
      seat,
      score,
      nearWinPatterns: [pattern]
    };
  });
  
  return seatScores
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}