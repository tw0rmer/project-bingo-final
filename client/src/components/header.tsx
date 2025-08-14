import { Button } from "@/components/ui/button";
import { Crown, Menu } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export function Header({ hideAuthButtons = false }: { hideAuthButtons?: boolean }) {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white shadow-lg border-b-4 border-casino-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-orange-600 rounded-full flex items-center justify-center">
              <Crown className="text-white text-xl" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold casino-red">WildCard</h1>
              <p className="text-sm text-gray-600">Premium Bingo</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-lg font-medium casino-red hover:text-rose-gold transition-colors">
              Home
            </Link>
            <Link href="/games" className="text-lg font-medium text-gray-700 hover:casino-red transition-colors">
              Games
            </Link>
            <a href="#how-to-play" className="text-lg font-medium text-gray-700 hover:casino-red transition-colors">
              How to Play
            </a>
            <a href="#winners" className="text-lg font-medium text-gray-700 hover:casino-red transition-colors">
              Winners
            </a>
            <a href="#about" className="text-lg font-medium text-gray-700 hover:casino-red transition-colors">
              About
            </a>
            <a href="#contact" className="text-lg font-medium text-gray-700 hover:casino-red transition-colors">
              Contact
            </a>
          </nav>

          {/* Auth Buttons / User Menu */}
          {!hideAuthButtons && (
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="hidden sm:inline text-sm text-gray-700">Welcome, {user.email}</span>
                  <Link href="/dashboard">
                    <Button size="lg" className="px-4 py-2 bg-casino-gold text-white hover:bg-yellow-500">Dashboard</Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-4 py-2 border-2 border-casino-red text-casino-red hover:bg-casino-red hover:text-white"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-6 py-3 text-lg font-medium casino-red border-2 border-casino-red hover:bg-casino-red hover:text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="px-6 py-3 text-lg font-medium bg-casino-gold text-white hover:bg-yellow-500 shadow-lg"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <Button variant="ghost" className="md:hidden">
            <Menu className="text-2xl casino-red" />
          </Button>
        </div>
      </div>
    </header>
  );
}
