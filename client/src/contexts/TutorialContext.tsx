import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting element
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  skipable?: boolean;
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: (tutorialSteps?: TutorialStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

const DEFAULT_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '🎉 Welcome to WildCard Premium Bingo!',
    content: "Let's take a quick tour to show you how to play and win big! This tutorial will teach you everything you need to know.",
    position: 'center',
    skipable: true
  },
  {
    id: 'lobbies',
    title: '🎮 Choose Your Lobby',
    content: 'Start by selecting a lobby based on your budget. Each lobby has different entry fees and prize pools. Higher stakes mean bigger prizes!',
    target: '[data-tutorial="lobby-card"]',
    position: 'bottom'
  },
  {
    id: 'join-game',
    title: '🪑 Pick Your Seats',
    content: 'Click on any available seat to join the game. You can choose multiple seats to increase your chances of winning!',
    target: '[data-tutorial="seat-select"]',
    position: 'top'
  },
  {
    id: 'game-starts',
    title: '📢 Numbers Are Called',
    content: 'Once the game starts, numbers will be called automatically. Watch as your card fills up - matching numbers turn green!',
    target: '[data-tutorial="bingo-card"]',
    position: 'right'
  },
  {
    id: 'pattern',
    title: '🎯 Complete Your Row',
    content: 'Match all 5 numbers in any row to win! The pattern indicator shows how close you are to winning.',
    target: '[data-tutorial="pattern-indicator"]',
    position: 'left'
  },
  {
    id: 'win',
    title: '🏆 Claim Your Prize!',
    content: 'When you complete a row, click the BINGO button or wait for automatic detection. Winners get 70% of the prize pool!',
    target: '[data-tutorial="bingo-button"]',
    position: 'top'
  },
  {
    id: 'social',
    title: '💬 Chat & React',
    content: 'Use emoji reactions and quick chat to interact with other players. Make the game more fun and social!',
    target: '[data-tutorial="emoji-button"]',
    position: 'right'
  },
  {
    id: 'complete',
    title: '🌟 You\'re Ready to Play!',
    content: 'That\'s all you need to know! Join a game, pick your seats, and start winning. Good luck and have fun!',
    position: 'center',
    skipable: false
  }
];

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>(DEFAULT_TUTORIAL_STEPS);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial
    const seen = localStorage.getItem('tutorial_completed');
    if (!seen) {
      // Auto-start tutorial for new users after a delay
      setTimeout(() => {
        const isFirstVisit = !localStorage.getItem('has_visited');
        if (isFirstVisit) {
          localStorage.setItem('has_visited', 'true');
          setIsActive(true);
        }
      }, 2000);
    } else {
      setHasSeenTutorial(true);
    }
  }, []);

  const startTutorial = (tutorialSteps?: TutorialStep[]) => {
    if (tutorialSteps) {
      setSteps(tutorialSteps);
    } else {
      setSteps(DEFAULT_TUTORIAL_STEPS);
    }
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      // Execute action if defined
      if (steps[currentStep + 1].action) {
        steps[currentStep + 1].action();
      }
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
  };

  const completeTutorial = () => {
    localStorage.setItem('tutorial_completed', 'true');
    setHasSeenTutorial(true);
    setIsActive(false);
    setCurrentStep(0);
  };

  const resetTutorial = () => {
    localStorage.removeItem('tutorial_completed');
    localStorage.removeItem('has_visited');
    setHasSeenTutorial(false);
    setCurrentStep(0);
    setIsActive(false);
  };

  return (
    <TutorialContext.Provider value={{
      isActive,
      currentStep,
      steps,
      startTutorial,
      nextStep,
      prevStep,
      skipTutorial,
      completeTutorial,
      resetTutorial
    }}>
      {children}
    </TutorialContext.Provider>
  );
}

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};