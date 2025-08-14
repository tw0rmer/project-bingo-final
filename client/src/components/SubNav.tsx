import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { User, LogOut, Home } from "lucide-react";

interface SubNavProps {
  className?: string;
}

export function SubNav({ className = "" }: SubNavProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={`bg-gray-50 border-b border-gray-200 px-4 py-2 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* User Welcome */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Welcome,</span>
          <span className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">
            {user.email}
          </span>
          <span className="hidden md:inline text-gray-500">
            | Balance: ${user.balance?.toFixed(2) || '0.00'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button 
              size="sm" 
              className="bg-casino-gold text-white hover:bg-yellow-500 text-xs px-3 py-1"
              data-testid="button-subnav-dashboard"
            >
              <Home className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="border-casino-red text-casino-red hover:bg-casino-red hover:text-white text-xs px-3 py-1"
            onClick={logout}
            data-testid="button-subnav-logout"
          >
            <LogOut className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}