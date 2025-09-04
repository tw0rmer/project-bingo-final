import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Crown, Sparkles, Star, Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900 text-white py-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full animate-bounce-soft"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 right-10 w-12 h-12 bg-gradient-to-br from-green-400/20 to-teal-500/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating sparkles */}
        <div className="absolute top-16 right-1/4 opacity-20">
          <Sparkles className="text-yellow-400 animate-pulse" size={20} />
        </div>
        <div className="absolute bottom-32 left-1/3 opacity-15">
          <Star className="text-blue-400 animate-bounce-soft" size={16} />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Enhanced Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Crown className="text-white" size={24} />
              </div>
          <div>
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  WildCard
                </h3>
                <p className="text-sm text-gray-300 font-semibold">Premium Bingo</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The most trusted online bingo platform with thousands of daily winners and the friendliest community worldwide.
            </p>
            <div className="flex space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 cursor-pointer shadow-lg">
                <Facebook size={20} className="text-white" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center hover:from-sky-600 hover:to-sky-700 transition-all duration-300 transform hover:scale-110 cursor-pointer shadow-lg">
                <Twitter size={20} className="text-white" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 cursor-pointer shadow-lg">
                <Instagram size={20} className="text-white" />
              </div>
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div>
            <h4 className="text-xl font-black text-white mb-6 flex items-center">
              <Sparkles className="mr-2 text-yellow-400" size={20} />
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-medium flex items-center group">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link href="/games" className="text-gray-300 hover:text-orange-400 transition-all duration-300 font-medium flex items-center group">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  🎮 Games
                </Link>
              </li>
              <li>
                <Link href="/how-to-play" className="text-gray-300 hover:text-green-400 transition-all duration-300 font-medium flex items-center group">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  📚 How to Play
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-purple-400 transition-all duration-300 font-medium flex items-center group">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  🎁 Promotions
                </a>
              </li>
              <li>
                <a href="#winners" className="text-gray-300 hover:text-blue-400 transition-all duration-300 font-medium flex items-center group">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  🏆 Winners
                </a>
              </li>
            </ul>
          </div>

          {/* Enhanced Support */}
          <div>
            <h4 className="text-xl font-black text-white mb-6 flex items-center">
              <Heart className="mr-2 text-red-400" size={20} />
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 font-medium flex items-center group">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  💡 Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 transition-all duration-300 font-medium flex items-center group">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  💬 Live Chat
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-all duration-300 font-medium flex items-center group">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  📞 Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-medium flex items-center group">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  📋 Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-all duration-300 font-medium flex items-center group">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  🔒 Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Enhanced Contact Info */}
          <div id="contact">
            <h4 className="text-xl font-black text-white mb-6 flex items-center">
              <Shield className="mr-2 text-green-400" size={20} />
              Contact Info
            </h4>
            <div className="space-y-4">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                  <Phone className="text-white" size={16} />
                </div>
                <div>
                  <p className="text-white font-bold">1-800-BINGO-WIN</p>
                  <p className="text-gray-300 text-sm">24/7 Support</p>
                </div>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                  <Mail className="text-white" size={16} />
                </div>
                <div>
                  <p className="text-white font-bold">support@wildcardpremium.com</p>
                  <p className="text-gray-300 text-sm">Email Support</p>
                </div>
              </div>
              <div className="flex items-start bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 mt-1">
                  <MapPin className="text-white" size={16} />
                </div>
                <div>
                  <p className="text-white font-bold">123 Gaming Plaza</p>
                  <p className="text-gray-300 text-sm">Las Vegas, NV 89101</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="border-t-4 border-gradient-to-r from-yellow-400 via-orange-500 to-red-500 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-gray-300 text-sm font-medium text-center md:text-left">
              <p className="mb-2">© 2024 <span className="font-bold text-white">WildCard Premium Bingo</span>. All rights reserved.</p>
              <p className="text-gray-400 text-xs">Licensed and Regulated | Gaming Commission #12345</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transform hover:scale-105 transition-all">
                🔞 18+ Only
              </span>
              <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transform hover:scale-105 transition-all">
                🎮 Play Responsibly
              </span>
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transform hover:scale-105 transition-all">
                🔒 SSL Secured
              </span>
            </div>
          </div>
          
          {/* Additional trust indicators */}
          <div className="mt-8 pt-6 border-t border-gray-600">
            <div className="flex flex-wrap justify-center items-center space-x-8 text-gray-400 text-xs">
              <div className="flex items-center">
                <Shield className="mr-1" size={12} />
                <span>Secure Gaming</span>
              </div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="flex items-center">
                <Heart className="mr-1" size={12} />
                <span>Fair Play Certified</span>
              </div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="flex items-center">
                <Star className="mr-1" size={12} />
                <span>Award Winning Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}