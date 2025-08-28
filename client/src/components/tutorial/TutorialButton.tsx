import React from 'react';
import { HelpCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTutorial } from '../../contexts/TutorialContext';

interface TutorialButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
}

export function TutorialButton({ 
  className = '', 
  variant = 'outline',
  size = 'default',
  showText = true 
}: TutorialButtonProps) {
  const { startTutorial } = useTutorial();

  return (
    <Button
      onClick={() => startTutorial()}
      variant={variant}
      size={size}
      className={`group ${className}`}
      data-testid="button-start-tutorial"
    >
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4 group-hover:animate-spin-slow" />
        {showText && <span>How to Play</span>}
        <PlayCircle className="w-4 h-4 opacity-50" />
      </div>
    </Button>
  );
}

// Floating help button for easy access
export function FloatingTutorialButton() {
  const { startTutorial, resetTutorial } = useTutorial();
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="relative">
        {showMenu && (
          <div className="absolute bottom-14 right-0 bg-white rounded-lg shadow-lg border p-2 min-w-[160px] animate-slide-up">
            <button
              onClick={() => {
                startTutorial();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm flex items-center gap-2"
              data-testid="button-replay-tutorial"
            >
              <PlayCircle className="w-4 h-4 text-blue-600" />
              Play Tutorial
            </button>
            <button
              onClick={() => {
                resetTutorial();
                startTutorial();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm flex items-center gap-2"
              data-testid="button-reset-tutorial"
            >
              <HelpCircle className="w-4 h-4 text-green-600" />
              Reset & Replay
            </button>
          </div>
        )}
        
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 transform hover:scale-110 animate-float"
          data-testid="button-floating-help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
        
        .group-hover\\:animate-spin-slow:hover {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
}