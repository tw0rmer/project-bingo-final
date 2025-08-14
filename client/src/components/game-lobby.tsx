import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useLocation } from "wouter";

export function GameLobby() {
  const [, setLocation] = useLocation();
  const { data: lobbies, isLoading } = useQuery<any[]>({
    queryKey: ["/api/lobbies"],
    queryFn: async () => apiRequest<any[]>("/lobbies"),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-100 text-green-800">OPEN</Badge>;
      case "waiting":
        return <Badge className="bg-yellow-100 text-yellow-800">WAITING</Badge>;
      case "premium":
        return <Badge className="bg-red-100 text-red-800">PREMIUM</Badge>;
      case "playing":
        return <Badge className="bg-blue-100 text-blue-800">PLAYING</Badge>;
      default:
        return <Badge variant="secondary">{status.toUpperCase()}</Badge>;
    }
  };

  const getStatusForDisplay = (status: string, seatsTaken: number, maxSeats: number) => {
    if (seatsTaken >= maxSeats) return "full";
    return status;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-dark-brown mb-4">
              <Gamepad2 className="inline mr-3 casino-gold" size={40} />
              Upcoming Games
            </h2>
            <p className="text-xl text-gray-600">Loading game rooms...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="games" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-brown mb-4">
            <Gamepad2 className="inline mr-3 casino-gold" size={40} />
            Upcoming Games
          </h2>
          <p className="text-xl text-gray-600">Join exciting 15-player bingo rooms starting soon!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {lobbies?.map((room) => (
            <div
              key={room.id}
              className="bg-gradient-to-br from-light-cream to-white rounded-xl shadow-lg border-2 border-casino-gold p-6 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold casino-red">{room.name}</h3>
                  <p className="text-gray-600">Lobby #{room.id}</p>
                </div>
                {getStatusBadge(getStatusForDisplay(room.status, room.seatsTaken, room.maxSeats))}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Players:</span>
                  <span className="font-semibold">{room.seatsTaken}/{room.maxSeats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Prize Pool:</span>
                  <span className="font-bold casino-gold">${(parseFloat(room.entryFee) * room.seatsTaken).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Entry Fee:</span>
                  <span className="font-semibold">${room.entryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    Status:
                  </span>
                  <span className={`font-semibold ${room.status === "active" ? "text-green-600" : room.status === 'finished' ? 'text-purple-600' : 'casino-red'}`}>
                    {room.status}
                  </span>
                </div>
              </div>
              
              <Button 
                className={`w-full py-3 font-bold transition-colors ${
                  room.seatsTaken >= room.maxSeats
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-casino-gold text-white hover:bg-yellow-500"
                }`}
                disabled={room.seatsTaken >= room.maxSeats}
                onClick={() => setLocation(`/lobby/${room.id}`)}
              >
                {room.seatsTaken >= room.maxSeats ? "ROOM FULL" : "JOIN NOW"}
              </Button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4">
          <Button variant="outline" className="px-4 py-2 border-casino-gold casino-gold hover:bg-casino-gold hover:text-white">
            Previous
          </Button>
          <Button className="px-4 py-2 bg-casino-gold text-white">1</Button>
          <Button variant="outline" className="px-4 py-2 border-casino-gold casino-gold hover:bg-casino-gold hover:text-white">
            2
          </Button>
          <Button variant="outline" className="px-4 py-2 border-casino-gold casino-gold hover:bg-casino-gold hover:text-white">
            3
          </Button>
          <Button variant="outline" className="px-4 py-2 border-casino-gold casino-gold hover:bg-casino-gold hover:text-white">
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
