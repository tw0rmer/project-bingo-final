import React, { useEffect, useState, useRef } from 'react';
import { useTutorial } from '../../contexts/TutorialContext';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function TutorialOverlay() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTutorial, completeTutorial } = useTutorial();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const step = steps[currentStep];
    
    // Find and highlight target element
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Calculate tooltip position
        const rect = element.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        
        let top = rect.top;
        let left = rect.left;
        
        switch (step.position) {
          case 'top':
            top = rect.top - tooltipHeight - 20;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.left - tooltipWidth - 20;
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.right + 20;
            break;
          default:
            top = window.innerHeight / 2 - tooltipHeight / 2;
            left = window.innerWidth / 2 - tooltipWidth / 2;
        }
        
        // Keep tooltip within viewport
        top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
        left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));
        
        setTooltipPosition({ top, left });
      } else {
        setTargetElement(null);
        // Center position if no target
        setTooltipPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 160
        });
      }
    } else {
      setTargetElement(null);
      // Center position for steps without targets
      setTooltipPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 160
      });
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove('tutorial-highlight');
      }
    };
  }, [isActive, currentStep, steps]);

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Dark overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998] animate-fade-in"
        onClick={() => step.skipable && skipTutorial()}
      />
      
      {/* Highlight box around target element */}
      {targetElement && (
        <div
          className="fixed z-[9999] pointer-events-none animate-pulse-border"
          style={{
            top: targetElement.getBoundingClientRect().top - 5,
            left: targetElement.getBoundingClientRect().left - 5,
            width: targetElement.getBoundingClientRect().width + 10,
            height: targetElement.getBoundingClientRect().height + 10,
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.4)'
          }}
        />
      )}
      
      {/* Tutorial tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-80 animate-slide-in"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white relative">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
                {step.title}
              </h3>
              {step.skipable && (
                <button
                  onClick={skipTutorial}
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="button-tutorial-skip"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Step counter */}
            <div className="absolute top-4 right-12 text-xs text-white/80">
              {currentStep + 1} / {steps.length}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              {step.content}
            </p>
          </div>
          
          {/* Actions */}
          <div className="px-4 pb-4 flex justify-between items-center">
            <Button
              onClick={prevStep}
              variant="outline"
              size="sm"
              disabled={currentStep === 0}
              className="flex items-center gap-1"
              data-testid="button-tutorial-prev"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentStep 
                      ? "bg-blue-500 w-6" 
                      : index < currentStep 
                      ? "bg-blue-300" 
                      : "bg-gray-300"
                  )}
                />
              ))}
            </div>
            
            <Button
              onClick={isLastStep ? completeTutorial : nextStep}
              size="sm"
              className={cn(
                "flex items-center gap-1",
                isLastStep && "bg-green-600 hover:bg-green-700"
              )}
              data-testid="button-tutorial-next"
            >
              {isLastStep ? (
                <>
                  Finish
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Animated pointer arrow */}
        {targetElement && step.position && (
          <div
            className={cn(
              "absolute w-0 h-0 animate-bounce",
              step.position === 'top' && "bottom-[-8px] left-1/2 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white",
              step.position === 'bottom' && "top-[-8px] left-1/2 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white",
              step.position === 'left' && "right-[-8px] top-1/2 -translate-y-1/2 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[10px] border-l-white",
              step.position === 'right' && "left-[-8px] top-1/2 -translate-y-1/2 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[10px] border-r-white"
            )}
          />
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1), 0 0 40px rgba(59, 130, 246, 0.6);
          }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </>
  );
}