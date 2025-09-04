import { LobbyList } from "./lobby-list";
import { Gamepad2, Sparkles, Users } from "lucide-react";

export function GameLobby() {
  return (
    <section id="games" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Gamepad2 className="text-white" size={40} />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 mb-6">
            Game Lobbies
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Choose your adventure and join exciting bingo games with players from around the world!
          </p>
          
          {/* Stats or highlights */}
          <div className="flex justify-center items-center space-x-8 text-sm font-semibold">
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span>Live Games Available</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center text-blue-600">
              <Users className="mr-2" size={16} />
              <span>Thousands of Players Online</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center text-purple-600">
              <Sparkles className="mr-2" size={16} />
              <span>Instant Payouts</span>
            </div>
          </div>
        </div>
        
        <LobbyList />
      </div>
    </section>
  );
}
