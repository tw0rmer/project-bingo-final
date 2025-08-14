import { Button } from "@/components/ui/button";
import { Crown, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function Header({ hideAuthButtons = false }: { hideAuthButtons?: boolean }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          <Button 
            variant="ghost" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="text-2xl casino-red" />
            ) : (
              <Menu className="text-2xl casino-red" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="flex flex-col space-y-2 p-4">
            <Link 
              href="/" 
              className="text-lg font-medium casino-red hover:text-rose-gold transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="link-mobile-home"
            >
              Home
            </Link>
            <Link 
              href="/games" 
              className="text-lg font-medium text-gray-700 hover:casino-red transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="link-mobile-games"
            >
              Games
            </Link>
            <a 
              href="#how-to-play" 
              className="text-lg font-medium text-gray-700 hover:casino-red transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="link-mobile-how-to-play"
            >
              How to Play
            </a>
            <a 
              href="#winners" 
              className="text-lg font-medium text-gray-700 hover:casino-red transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="link-mobile-winners"
            >
              Winners
            </a>
            <a 
              href="#about" 
              className="text-lg font-medium text-gray-700 hover:casino-red transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="link-mobile-about"
            >
              About
            </a>
            <a 
              href="#contact" 
              className="text-lg font-medium text-gray-700 hover:casino-red transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="link-mobile-contact"
            >
              Contact
            </a>
            
            {/* Auth buttons in mobile menu */}
            {!hideAuthButtons && (
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                {user ? (
                  <>
                    <div className="text-sm text-gray-700 py-2">Welcome, {user.email}</div>
                    <Link href="/dashboard">
                      <Button 
                        size="lg" 
                        className="w-full px-4 py-2 bg-casino-gold text-white hover:bg-yellow-500"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="button-mobile-dashboard"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full px-4 py-2 border-2 border-casino-red text-casino-red hover:bg-casino-red hover:text-white"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      data-testid="button-mobile-logout"
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
                        className="w-full px-6 py-3 text-lg font-medium casino-red border-2 border-casino-red hover:bg-casino-red hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="button-mobile-login"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        size="lg"
                        className="w-full px-6 py-3 text-lg font-medium bg-casino-gold text-white hover:bg-yellow-500 shadow-lg"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="button-mobile-signup"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
