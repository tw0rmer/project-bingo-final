import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Target, Users, DollarSign, Clock } from "lucide-react";
import { SeatSelection } from "./seat-selection";

interface BingoNumber {
  value: number;
  isMarked: boolean;
}

export function ClassicBingo() {
  const [selectedSeat, setSelectedSeat] = useState<number>();
  const [takenSeats, setTakenSeats] = useState<number[]>([2, 5, 8]); // Example taken seats
  const [bingoCard, setBingoCard] = useState<BingoNumber[][]>([]);

  // Generate random unique numbers within a range
  const getRandomNumbersInRange = (start: number, end: number, count: number): number[] => {
    const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers.slice(0, count);
  };

  // Generate a new bingo card with correct number ranges
  const generateNewBingoCard = () => {
    // Generate numbers for each column
    const bColumn = getRandomNumbersInRange(1, 15, 15);   // B: 1-15
    const iColumn = getRandomNumbersInRange(16, 30, 15);  // I: 16-30
    const nColumn = getRandomNumbersInRange(31, 45, 15);  // N: 31-45
    const gColumn = getRandomNumbersInRange(46, 60, 15);  // G: 46-60
    const oColumn = getRandomNumbersInRange(61, 75, 15);  // O: 61-75

    // Create the 15x5 card
    const newCard: BingoNumber[][] = [];
    for (let row = 0; row < 15; row++) {
      newCard.push([
        { value: bColumn[row], isMarked: false },
        { value: iColumn[row], isMarked: false },
        { value: nColumn[row], isMarked: false },
        { value: gColumn[row], isMarked: false },
        { value: oColumn[row], isMarked: false }
      ]);
    }
    return newCard;
  };

  // Initialize bingo card on component mount
  useEffect(() => {
    setBingoCard(generateNewBingoCard());
  }, []);

  const handleSeatSelect = (seatNumber: number) => {
    setSelectedSeat(seatNumber);
    // Here you would emit a socket event or make an API call
  };

  const handleNumberClick = (rowIndex: number, colIndex: number) => {
    setBingoCard(prevCard => {
      const newCard = [...prevCard];
      newCard[rowIndex] = [...newCard[rowIndex]];
      newCard[rowIndex][colIndex] = {
        ...newCard[rowIndex][colIndex],
        isMarked: !newCard[rowIndex][colIndex].isMarked
      };
      return newCard;
    });
  };

  const handleNewGame = () => {
    setBingoCard(generateNewBingoCard());
    setSelectedSeat(undefined);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-cream to-light-cream">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-casino-gold rounded-full flex items-center justify-center mr-4">
                <Target className="text-white" size={28} />
              </div>
              <h2 className="text-4xl font-bold text-dark-brown">Classic Bingo</h2>
            </div>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Experience the traditional bingo you know and love! Our Classic Bingo games feature the familiar 15x6 format with comfortable pacing that gives you time to mark your cards and chat with other players.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-casino-gold">
                <div className="flex items-center mb-3">
                  <DollarSign className="casino-gold mr-2" size={20} />
                  <h4 className="font-bold text-dark-brown">Entry Fees</h4>
                </div>
                <p className="text-2xl font-bold casino-gold">$3 - $25</p>
                <p className="text-gray-600">Affordable for everyone</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-casino-gold">
                <div className="flex items-center mb-3">
                  <Users className="casino-gold mr-2" size={20} />
                  <h4 className="font-bold text-dark-brown">Players</h4>
                </div>
                <p className="text-2xl font-bold casino-gold">Up to 15</p>
                <p className="text-gray-600">Perfect community size</p>
              </div>
            </div>

            <Button 
              onClick={handleNewGame}
              size="lg"
              className="bg-casino-gold text-white px-8 py-4 text-xl font-bold hover:bg-yellow-500 shadow-lg"
            >
              New Game
            </Button>
          </div>

          {/* Visual */}
          <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-casino-gold">
            <h3 className="text-2xl font-bold casino-red mb-6 text-center">Classic Bingo Card</h3>
            <div className="flex gap-2 mb-6">
              {/* Seat Selection Column */}
              <SeatSelection
                onSeatSelect={handleSeatSelect}
                selectedSeat={selectedSeat}
                takenSeats={takenSeats}
              />

              {/* Bingo Card Grid */}
              <div className="grid grid-cols-5 gap-2 flex-1">
              {/* Header Row */}
              <div className="bg-casino-red text-white font-bold text-center py-3 rounded text-lg">B</div>
              <div className="bg-casino-red text-white font-bold text-center py-3 rounded text-lg">I</div>
              <div className="bg-casino-red text-white font-bold text-center py-3 rounded text-lg">N</div>
              <div className="bg-casino-red text-white font-bold text-center py-3 rounded text-lg">G</div>
              <div className="bg-casino-red text-white font-bold text-center py-3 rounded text-lg">O</div>
              
                {/* Bingo Numbers */}
                {bingoCard.map((row, rowIndex) => 
                  row.map((number, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleNumberClick(rowIndex, colIndex)}
                      className={`
                        text-center py-3 rounded border font-bold text-lg
                        transition-colors cursor-pointer
                        ${number.isMarked 
                        ? 'bg-casino-gold text-white' 
                          : 'bg-gray-100 text-dark-brown hover:bg-casino-gold hover:text-white'
                        }
                      `}
                  >
                      {number.value}
                    </button>
                ))
              )}
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                <strong>15 rows × 6 columns</strong> = 15 seats + 75 numbers
              </p>
              <p className="text-casino-red font-semibold">
                Click numbers to mark them!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}