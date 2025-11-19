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
    id: 'welcome',
    title: 'Welcome to Violify! 🎉',
    description: 'Let\'s take a quick tour to help you get started with your Carnatic violin journey.',
    targetId: 'home-header',
    position: 'bottom',
    arrow: 'down'
  },
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
    description: 'Browse through structured lessons tailored to your skill level. We\'ve created a sample lesson for you to try!',
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
  const [showTutorial, setShowTutorial] = useState(true);

  const step = tutorialSteps[currentStep];

  useEffect(() => {
    if (!showTutorial) return;

    const updatePosition = () => {
      const targetElement = document.getElementById(step.targetId);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2;
          break;
        case 'top':
          top = rect.top - 20;
          left = rect.left + rect.width / 2;
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

      setTooltipPosition({ top, left });

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
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[9998] pointer-events-none" />

      {/* Tooltip */}
      <div
        className="fixed z-[9999] transform -translate-x-1/2"
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-[#FF901F]">
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

      {/* Global styles for tutorial highlight */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 9999;
          box-shadow: 0 0 0 4px rgba(255, 144, 31, 0.5), 0 0 0 8px rgba(255, 144, 31, 0.3);
          border-radius: 12px;
          transition: box-shadow 0.3s ease;
        }
      `}</style>
    </>
  );
}
