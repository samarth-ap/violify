import { useState, useEffect } from 'react';
import { X, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetId: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  arrow: 'down' | 'up' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'practice',
    title: 'Start Practicing',
    description: 'Tap here to begin your practice session. Our AI will listen and provide real-time feedback on your playing.',
    targetId: 'practice-button',
    position: 'bottom',
    arrow: 'down'
  },
  {
    id: 'lessons',
    title: 'Explore Lessons',
    description: 'Browse through structured lessons tailored to your skill level.',
    targetId: 'lessons-tab',
    position: 'top',
    arrow: 'up'
  },
  {
    id: 'analytics',
    title: 'Track Your Progress',
    description: 'View detailed analytics about your practice sessions, progress over time, and areas for improvement.',
    targetId: 'analytics-tab',
    position: 'top',
    arrow: 'up'
  },
  {
    id: 'settings',
    title: 'Customize Your Profile',
    description: 'Access your account settings, manage subscription, and personalize your experience.',
    targetId: 'settings-tab',
    position: 'top',
    arrow: 'up'
  }
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [showTutorial, setShowTutorial] = useState(true);

  const step = tutorialSteps[currentStep];

  useEffect(() => {
    if (!showTutorial) return;

    const updatePosition = () => {
      const targetElement = document.getElementById(step.targetId);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = 384; // max-w-sm = 24rem = 384px
      const tooltipHeight = 300; // approximate height
      const padding = 20;

      let top = 0;
      let left = 0;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      switch (step.position) {
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2;
          break;
        case 'top':
          top = rect.top - 20;
          // For bottom nav tabs, center the tooltip in the viewport for better visibility
          // Instead of trying to align with the small button
          if (viewportWidth < 1024) {
            // Mobile: center in viewport
            left = viewportWidth / 2;
          } else {
            // Desktop: use a comfortable left-center position
            left = viewportWidth / 3;
          }
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 20;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 20;
          break;
      }

      // Keep tooltip within viewport bounds with padding
      const safeLeft = Math.max(
        tooltipWidth / 2 + padding + 10,
        Math.min(left, viewportWidth - tooltipWidth / 2 - padding - 10)
      );
      left = safeLeft;

      // Adjust vertical position
      if (step.position === 'top' && top - tooltipHeight < padding) {
        // If top position goes off screen, show below instead
        top = rect.bottom + 20;
      } else if (step.position === 'bottom' && top + tooltipHeight > viewportHeight - padding) {
        // If bottom position goes off screen, show above instead
        top = rect.top - 20;
      }

      setTooltipPosition({ top, left });

      // Store highlight position for spotlight effect with padding for rounded effect
      const spotlightPadding = 12; // Padding around the button for smooth cutout
      setHighlightPosition({
        top: rect.top - spotlightPadding,
        left: rect.left - spotlightPadding,
        width: rect.width + (spotlightPadding * 2),
        height: rect.height + (spotlightPadding * 2)
      });

      // Add highlight to target element
      targetElement.classList.add('tutorial-highlight');
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      const targetElement = document.getElementById(step.targetId);
      if (targetElement) {
        targetElement.classList.remove('tutorial-highlight');
      }
    };
  }, [currentStep, step, showTutorial]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setShowTutorial(false);
    // Remove highlight from current element
    const targetElement = document.getElementById(step.targetId);
    if (targetElement) {
      targetElement.classList.remove('tutorial-highlight');
    }
    onComplete();
  };

  if (!showTutorial) return null;

  const ArrowIcon = () => {
    switch (step.arrow) {
      case 'down':
        return <ArrowDown className="text-[#FF901F]" size={32} />;
      case 'up':
        return <ArrowDown className="text-[#FF901F] rotate-180" size={32} />;
      case 'left':
        return <ArrowLeft className="text-[#FF901F]" size={32} />;
      case 'right':
        return <ArrowRight className="text-[#FF901F]" size={32} />;
    }
  };

  return (
    <>
      {/* Overlay with blur effect - rounded spotlight cutout */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none transition-all duration-300 bg-black/70 backdrop-blur-sm"
        style={{
          maskImage: `radial-gradient(
            ellipse ${highlightPosition.width / 2 + 20}px ${highlightPosition.height / 2 + 20}px at
            ${highlightPosition.left + highlightPosition.width / 2}px
            ${highlightPosition.top + highlightPosition.height / 2}px,
            transparent 0,
            black ${Math.max(highlightPosition.width / 2 + 20, highlightPosition.height / 2 + 20)}px
          )`,
          WebkitMaskImage: `radial-gradient(
            ellipse ${highlightPosition.width / 2 + 20}px ${highlightPosition.height / 2 + 20}px at
            ${highlightPosition.left + highlightPosition.width / 2}px
            ${highlightPosition.top + highlightPosition.height / 2}px,
            transparent 0,
            black ${Math.max(highlightPosition.width / 2 + 20, highlightPosition.height / 2 + 20)}px
          )`,
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[9999] transform -translate-x-1/2 animate-fadeIn"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          ...(step.position === 'top' && { transform: 'translate(-50%, -100%)' }),
          ...(step.position === 'bottom' && { transform: 'translate(-50%, 0)' })
        }}
      >
        {/* Arrow */}
        <div className={`flex justify-center ${step.position === 'top' ? 'order-2 mt-2' : 'mb-2'}`}>
          <ArrowIcon />
        </div>

        {/* Tooltip Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-[#FF901F] shadow-[#FF901F]/20">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">{step.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-[#FF901F]'
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-gray-600"
                >
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-[#FF901F] hover:bg-[#E67F0C] text-white"
              >
                {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Get Started!'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Global styles for tutorial highlight and animations */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 9999;
          box-shadow:
            0 0 0 4px rgba(255, 144, 31, 0.8),
            0 0 0 8px rgba(255, 144, 31, 0.4),
            0 0 20px 12px rgba(255, 144, 31, 0.3);
          border-radius: 12px;
          transition: all 0.3s ease;
          animation: tutorial-pulse 2s ease-in-out infinite;
        }

        @keyframes tutorial-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 4px rgba(255, 144, 31, 0.8),
              0 0 0 8px rgba(255, 144, 31, 0.4),
              0 0 20px 12px rgba(255, 144, 31, 0.3);
          }
          50% {
            box-shadow:
              0 0 0 4px rgba(255, 144, 31, 1),
              0 0 0 8px rgba(255, 144, 31, 0.6),
              0 0 30px 16px rgba(255, 144, 31, 0.5);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
