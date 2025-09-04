import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { User, LogOut, Home, Wallet, Crown, Star } from "lucide-react";

interface SubNavProps {
  className?: string;
}

export function SubNav({ className = "" }: SubNavProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={`relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-4 border-gradient-to-r from-blue-300 to-purple-300 px-4 py-4 overflow-hidden ${className}`}>
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-indigo-100/20 to-purple-100/20"></div>
      <div className="absolute top-1 right-10 opacity-15">
        <Star className="text-blue-400 animate-pulse" size={12} />
      </div>
      <div className="absolute top-2 left-1/4 opacity-10">
        <Crown className="text-purple-400 animate-bounce-soft" size={10} />
      </div>
      
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        {/* Enhanced User Welcome */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {user.isAdmin ? (
                <Crown className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">
                Welcome, {user.username || user.email?.split('@')[0]}
              </span>
              {user.isAdmin && (
                <span className="text-xs text-purple-600 font-semibold">Administrator</span>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
            <Wallet className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-gray-800">
              Balance: <span className="text-green-600">${user.balance?.toFixed(2) || '0.00'}</span>
            </span>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center space-x-3">
          <Link href="/dashboard">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
              data-testid="button-subnav-dashboard"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="border-2 border-red-400 text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 hover:text-white px-4 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
            onClick={logout}
            data-testid="button-subnav-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}