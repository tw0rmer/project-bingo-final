import { Button } from "@/components/ui/button";
import { Crown, Menu, X, Sparkles, Star, Home, Gamepad2, BookOpen, Trophy, Info, Phone, Target } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function Header({ hideAuthButtons = false }: { hideAuthButtons?: boolean }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="relative bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-200/50 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-50/20 via-orange-50/10 to-red-50/20"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-3 right-16 opacity-10">
        <Sparkles className="text-amber-400 animate-pulse" size={14} />
      </div>
      <div className="absolute top-6 left-1/3 opacity-8">
        <Star className="text-orange-400 animate-bounce-soft" size={10} />
      </div>
      <div className="absolute bottom-2 right-1/4 opacity-6">
        <Crown className="text-red-400 animate-pulse" size={12} />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center py-4 sm:py-6">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-300">
              <Crown className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600">
                WildCard
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">Premium Bingo</p>
            </div>
          </div>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link href="/" className="group relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-amber-600 transition-all duration-300 rounded-lg hover:bg-amber-50/80">
              <div className="flex items-center space-x-2">
                <Home size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>Home</span>
              </div>
            </Link>
            
            <Link href="/games" className="group relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-lg hover:bg-orange-50/80">
              <div className="flex items-center space-x-2">
                <Gamepad2 size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>Games</span>
              </div>
            </Link>
            
            <button 
              onClick={() => {
                if (window.location.pathname === '/') {
                  document.getElementById('how-to-play')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#how-to-play';
                }
              }}
              className="group relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-yellow-600 transition-all duration-300 rounded-lg hover:bg-yellow-50/80"
            >
              <div className="flex items-center space-x-2">
                <BookOpen size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>How to Play</span>
              </div>
            </button>
            
            <button 
              onClick={() => {
                if (window.location.pathname === '/') {
                  document.getElementById('winners')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#winners';
                }
              }}
              className="group relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-all duration-300 rounded-lg hover:bg-green-50/80"
            >
              <div className="flex items-center space-x-2">
                <Trophy size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>Winners</span>
              </div>
            </button>
            
            <button 
              onClick={() => {
                if (window.location.pathname === '/') {
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#about';
                }
              }}
              className="group relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-lg hover:bg-blue-50/80"
            >
              <div className="flex items-center space-x-2">
                <Info size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>About</span>
              </div>
            </button>
            
            <button 
              onClick={() => {
                if (window.location.pathname === '/') {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#contact';
                }
              }}
              className="group relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 transition-all duration-300 rounded-lg hover:bg-purple-50/80"
            >
              <div className="flex items-center space-x-2">
                <Phone size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>Contact</span>
              </div>
            </button>
            
            {user && (
              <Link href="/achievements" className="group relative px-4 py-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-all duration-300 rounded-lg bg-amber-50/80 hover:bg-amber-100/80 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Trophy size={16} />
                  <span>Achievements</span>
                </div>
              </Link>
            )}
          </nav>

          {/* Enhanced Desktop Auth Buttons */}
          {!hideAuthButtons && !user && (
            <div className="hidden lg:flex items-center space-x-3">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-6 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50/50 transition-all duration-300 rounded-lg"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md transition-all duration-300 rounded-lg"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Enhanced Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <Button 
              variant="ghost" 
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="text-xl text-gray-600" />
              ) : (
                <Menu className="text-xl text-gray-600" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg relative z-50">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-orange-50/20"></div>
          <nav className="flex flex-col space-y-2 p-6 relative z-10">
            
            <Link 
              href="/" 
              className="flex items-center space-x-3 text-base font-semibold text-gray-700 hover:text-amber-600 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-amber-50/80"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="link-mobile-home"
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            
            <Link 
              href="/games" 
              className="flex items-center space-x-3 text-base font-semibold text-gray-700 hover:text-orange-600 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-orange-50/80"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="link-mobile-games"
            >
              <Gamepad2 size={18} />
              <span>Games</span>
            </Link>
            
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                if (window.location.pathname === '/') {
                  document.getElementById('how-to-play')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#how-to-play';
                }
              }}
              className="flex items-center space-x-3 text-base font-semibold text-gray-700 hover:text-yellow-600 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-yellow-50/80 text-left"
              data-testid="link-mobile-how-to-play"
            >
              <BookOpen size={18} />
              <span>How to Play</span>
            </button>
            
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                if (window.location.pathname === '/') {
                  document.getElementById('winners')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#winners';
                }
              }}
              className="flex items-center space-x-3 text-base font-semibold text-gray-700 hover:text-green-600 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-green-50/80 text-left"
              data-testid="link-mobile-winners"
            >
              <Trophy size={18} />
              <span>Winners</span>
            </button>
            
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                if (window.location.pathname === '/') {
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#about';
                }
              }}
              className="flex items-center space-x-3 text-base font-semibold text-gray-700 hover:text-blue-600 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-blue-50/80 text-left"
              data-testid="link-mobile-about"
            >
              <Info size={18} />
              <span>About</span>
            </button>
            
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                if (window.location.pathname === '/') {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#contact';
                }
              }}
              className="flex items-center space-x-3 text-base font-semibold text-gray-700 hover:text-purple-600 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-purple-50/80 text-left"
              data-testid="link-mobile-contact"
            >
              <Phone size={18} />
              <span>Contact</span>
            </button>
            
            {/* Achievements link for logged in users */}
            {user && (
              <Link 
                href="/achievements" 
                className="flex items-center space-x-3 text-base font-semibold text-amber-600 hover:text-amber-700 transition-all duration-300 py-3 px-4 rounded-lg bg-amber-50/80 hover:bg-amber-100/80"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-achievements"
              >
                <Trophy size={18} />
                <span>Achievements</span>
              </Link>
            )}
            
            {/* Enhanced Login/Signup buttons if not logged in */}
            {!hideAuthButtons && !user && (
              <div className="border-t border-gray-200/50 pt-6 mt-6 space-y-3">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full px-6 py-3 text-base font-semibold text-gray-700 border border-gray-300 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50/50 transition-all duration-300 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="button-mobile-login"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="w-full px-6 py-3 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md transition-all duration-300 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="button-mobile-signup"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
