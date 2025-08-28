import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { cn } from '@/lib/utils';
import { MessageCircle, Heart, ThumbsUp, PartyPopper, Sparkles } from 'lucide-react';

interface Reaction {
  id: string;
  emoji: string;
  userId: number;
  userName?: string;
  timestamp: number;
  x?: number;
  y?: number;
}

interface EmojiReactionsProps {
  gameId: number;
  lobbyId: number;
  userId?: number;
  className?: string;
}

const EMOJI_OPTIONS = [
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '💖', label: 'Love' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '🍀', label: 'Lucky' },
  { emoji: '⚡', label: 'Energy' },
  { emoji: '🎯', label: 'Target' },
];

const QUICK_CHATS = [
  "Good luck! 🍀",
  "Almost there! 💪",
  "Let's go! 🚀",
  "Nice one! 👍",
  "So close! 😅",
  "BINGO TIME! 🎯",
  "Feeling lucky! 🎰",
  "This is it! ⚡",
];

export function EmojiReactions({ gameId, lobbyId, userId, className }: EmojiReactionsProps) {
  const { socket } = useSocket();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [recentMessage, setRecentMessage] = useState<string | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleReaction = (data: any) => {
      if (data.lobbyId !== lobbyId) return;
      
      const newReaction: Reaction = {
        id: `${data.userId}-${Date.now()}`,
        emoji: data.emoji,
        userId: data.userId,
        userName: data.userName,
        timestamp: Date.now(),
        x: Math.random() * 80 + 10, // Random position 10-90%
        y: 100
      };
      
      // Add floating animation
      setFloatingReactions(prev => [...prev, newReaction]);
      
      // Remove after animation completes (2.5 seconds)
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
      }, 2500);
      
      // Add to recent reactions
      setReactions(prev => [...prev.slice(-20), newReaction]);
    };

    const handleQuickChat = (data: any) => {
      if (data.lobbyId !== lobbyId) return;
      
      setRecentMessage(`${data.userName}: ${data.message}`);
      setTimeout(() => setRecentMessage(null), 5000);
    };

    socket.on('emoji_reaction', handleReaction);
    socket.on('quick_chat', handleQuickChat);

    return () => {
      socket.off('emoji_reaction', handleReaction);
      socket.off('quick_chat', handleQuickChat);
    };
  }, [socket, lobbyId]);

  const sendReaction = (emoji: string) => {
    if (!socket || !userId) return;
    
    socket.emit('send_emoji', {
      gameId,
      lobbyId,
      userId,
      emoji
    });
    
    // Local optimistic update
    const newReaction: Reaction = {
      id: `${userId}-${Date.now()}`,
      emoji,
      userId,
      timestamp: Date.now(),
      x: 50,
      y: 100
    };
    
    setFloatingReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2500);
    
    setShowMenu(false);
  };

  const sendQuickChat = (message: string) => {
    if (!socket || !userId) return;
    
    socket.emit('send_quick_chat', {
      gameId,
      lobbyId,
      userId,
      message
    });
    
    setShowMenu(false);
  };

  return (
    <>
      {/* Floating Reactions */}
      <div className="fixed inset-0 pointer-events-none z-30">
        {floatingReactions.map(reaction => (
          <div
            key={reaction.id}
            className="absolute text-4xl"
            style={{
              left: `${reaction.x}%`,
              bottom: `${reaction.y}px`,
              animation: 'floatUp 2.5s ease-out forwards'
            }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* Recent Chat Message */}
      {recentMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 animate-slide-down">
          <div className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 rounded-full px-4 py-2 shadow-lg">
            <p className="text-sm font-medium text-gray-700">{recentMessage}</p>
          </div>
        </div>
      )}

      {/* Reaction Button & Menu */}
      <div className={cn("fixed bottom-4 left-4 z-30", className)} data-testid="emoji-reactions">
        <div className="relative">
          {/* Toggle Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 transform hover:scale-110"
            data-testid="button-emoji-menu"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* Menu */}
          {showMenu && (
            <div className="absolute bottom-16 left-0 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-4 min-w-[300px] animate-slide-up">
              {/* Emoji Section */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Send Reaction</p>
                <div className="grid grid-cols-4 gap-2">
                  {EMOJI_OPTIONS.map(({ emoji, label }) => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all transform hover:scale-110"
                      title={label}
                      data-testid={`button-emoji-${emoji}`}
                    >
                      <span className="text-2xl">{emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Chat Section */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Quick Chat</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {QUICK_CHATS.map((message, index) => (
                    <button
                      key={index}
                      onClick={() => sendQuickChat(message)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors"
                      data-testid={`button-chat-${index}`}
                    >
                      {message}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Reactions Display */}
        {reactions.length > 0 && (
          <div className="absolute bottom-16 left-16 flex gap-1">
            {reactions.slice(-3).map(r => (
              <span
                key={r.id}
                className="text-2xl animate-bounce"
                style={{ animationDelay: `${Math.random() * 0.3}s` }}
              >
                {r.emoji}
              </span>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          70% {
            transform: translateY(-150px) scale(1.3);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-200px) scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes slide-down {
          0% {
            transform: translate(-50%, -20px);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-float-up {
          animation: floatUp 2.5s ease-out forwards;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}