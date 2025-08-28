import { LobbyList } from "./lobby-list";
import { Gamepad2 } from "lucide-react";

export function GameLobby() {
  return (
    <section id="games" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-brown mb-4">
            <Gamepad2 className="inline mr-3 casino-gold" size={40} />
            Game Lobbies
          </h2>
          <p className="text-xl text-gray-600">Choose your lobby and join exciting bingo games!</p>
        </div>
        
        <LobbyList />
      </div>
    </section>
  );
}
