import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-cream text-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">WildCard Premium</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The most trusted online bingo platform with thousands of daily winners and the friendliest community.
            </p>
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-casino-gold rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors cursor-pointer">
                <Facebook size={20} />
              </div>
              <div className="w-10 h-10 bg-casino-gold rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors cursor-pointer">
                <Twitter size={20} />
              </div>
              <div className="w-10 h-10 bg-casino-gold rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors cursor-pointer">
                <Instagram size={20} />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gray-900">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-700 hover:casino-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/games" className="text-gray-700 hover:casino-gold transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link href="/how-to-play" className="text-gray-700 hover:casino-gold transition-colors">
                  How to Play
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:casino-gold transition-colors">
                  Promotions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:casino-gold transition-colors">
                  Winners
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gray-900">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-700 hover:casino-gold transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:casino-gold transition-colors">
                  Live Chat
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:casino-gold transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:casino-gold transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:casino-gold transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div id="contact">
            <h4 className="text-lg font-bold mb-4 text-gray-900">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="casino-gold mr-3" size={16} />
                <span className="text-gray-700">1-800-BINGO-WIN</span>
              </div>
              <div className="flex items-center">
                <Mail className="casino-gold mr-3" size={16} />
                <span className="text-gray-700">support@wildcardpremium.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="casino-gold mr-3 mt-1" size={16} />
                <span className="text-gray-700">
                  123 Gaming Plaza<br />
                  Las Vegas, NV 89101
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2024 WildCard Premium Bingo. All rights reserved. | Licensed and Regulated
            </div>
            <div className="flex space-x-6 text-sm">
              <span className="bg-casino-gold text-dark-brown px-3 py-1 rounded font-semibold">18+ Only</span>
              <span className="bg-casino-red text-white px-3 py-1 rounded font-semibold">Play Responsibly</span>
              <span className="bg-green-600 text-white px-3 py-1 rounded font-semibold">SSL Secured</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}