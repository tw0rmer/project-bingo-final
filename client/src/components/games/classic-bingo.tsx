import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Target, Users, DollarSign, Clock, Sparkles, Star } from "lucide-react";
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
    <section className="py-20 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-20 animate-bounce-soft"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating sparkles */}
        <div className="absolute top-32 right-1/4 opacity-20">
          <Sparkles className="text-yellow-400 animate-pulse" size={20} />
        </div>
        <div className="absolute bottom-40 left-1/3 opacity-15">
          <Star className="text-orange-400 animate-bounce-soft" size={16} />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Enhanced Content */}
          <div>
            <div className="flex items-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mr-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <Target className="text-white" size={36} />
              </div>
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">Classic Bingo</h2>
            </div>
            
            <p className="text-2xl text-gray-700 mb-10 leading-relaxed">
              Experience the traditional bingo you know and love! Our Classic Bingo games feature the familiar 15x5 format with comfortable pacing that gives you time to mark your cards and chat with other players.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-gradient-to-r from-yellow-200 to-orange-200 transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 to-orange-50/30"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                      <DollarSign className="text-white" size={20} />
                    </div>
                    <h4 className="font-black text-gray-800">Entry Fees</h4>
                  </div>
                  <p className="text-3xl font-black text-green-600 mb-2">$3 - $25</p>
                  <p className="text-gray-700 font-medium">Affordable for everyone</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-gradient-to-r from-orange-200 to-amber-200 transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-amber-50/30"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                      <Users className="text-white" size={20} />
                    </div>
                    <h4 className="font-black text-gray-800">Players</h4>
                  </div>
                  <p className="text-3xl font-black text-blue-600 mb-2">Up to 15</p>
                  <p className="text-gray-700 font-medium">Perfect community size</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleNewGame}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-600 hover:from-yellow-600 hover:via-orange-600 hover:to-amber-700 text-white px-12 py-6 text-2xl font-black shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
            >
              <Target className="mr-3" size={24} />
              Start New Game
            </Button>
          </div>

          {/* Enhanced Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-3xl transform rotate-3 opacity-20"></div>
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-gradient-to-r from-yellow-400 via-orange-500 to-amber-500 relative z-10">
              <div className="absolute top-4 right-4">
                <Star className="text-yellow-400 animate-pulse" size={20} />
              </div>
              
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-8 text-center">
                Classic Bingo Card (15x5)
              </h3>
              
              <div className="flex gap-4 mb-8">
                {/* Seat Selection Column */}
                <SeatSelection
                  onSeatSelect={handleSeatSelect}
                  selectedSeat={selectedSeat}
                  takenSeats={takenSeats}
                />

                {/* Enhanced Bingo Card Grid */}
                <div className="grid grid-cols-5 gap-3 flex-1">
                  {/* Enhanced Header Row */}
                  <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white font-black text-center py-4 rounded-xl shadow-lg text-xl">B</div>
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-black text-center py-4 rounded-xl shadow-lg text-xl">I</div>
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-black text-center py-4 rounded-xl shadow-lg text-xl">N</div>
                  <div className="bg-gradient-to-br from-green-500 to-yellow-500 text-white font-black text-center py-4 rounded-xl shadow-lg text-xl">G</div>
                  <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white font-black text-center py-4 rounded-xl shadow-lg text-xl">O</div>
                  
                  {/* Enhanced Bingo Numbers */}
                  {bingoCard.map((row, rowIndex) => 
                    row.map((number, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleNumberClick(rowIndex, colIndex)}
                        className={`
                          text-center py-3 rounded-xl border-2 font-bold text-lg
                          transition-all duration-300 cursor-pointer transform hover:scale-105
                          ${number.isMarked 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-yellow-300 shadow-lg scale-105' 
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 hover:border-yellow-300'
                          }
                        `}
                    >
                        {number.value}
                      </button>
                  ))
                )}
                </div>
              </div>
              
              <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <p className="text-gray-700 mb-3">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">15 rows × 5 columns</span>
                  <br />
                  <span className="text-lg text-yellow-700">= 75 numbers & maximum winning chances!</span>
                </p>
                <p className="text-orange-600 font-bold flex items-center justify-center">
                  <Sparkles className="mr-2" size={16} />
                  Click numbers to mark them!
                  <Sparkles className="ml-2" size={16} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}