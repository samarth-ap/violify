import { useState } from 'react';
import { Check, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface RepetitionCounterScreenProps {
  onNavigate: (screen: string) => void;
}

export default function RepetitionCounterScreen({ onNavigate }: RepetitionCounterScreenProps) {
  const [repetitions, setRepetitions] = useState(15);
  const totalReps = 20;
  const progress = (repetitions / totalReps) * 100;

  const handleRepetition = () => {
    if (repetitions < totalReps) {
      setRepetitions(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setRepetitions(0);
  };

  const handleFinish = () => {
    onNavigate('report');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white flex flex-col items-center justify-center px-6 py-12 pb-24">
      <div className="max-w-md w-full">
        {/* Lesson Name */}
        <div className="text-center mb-8">
          <h1 className="text-black mb-2">Varnam in Kalyani</h1>
          <p className="text-gray-600">Track your repetitions</p>
        </div>

        {/* Circular Progress */}
        <div className="relative mb-12">
          <div className="w-72 h-72 mx-auto relative">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="120"
                stroke="rgba(0, 0, 0, 0.1)"
                strokeWidth="20"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="144"
                cy="144"
                r="120"
                stroke="#FF901F"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
                style={{ filter: 'drop-shadow(0 0 10px rgba(255, 144, 31, 0.5))' }}
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-7xl text-black mb-2">
                  {repetitions}
                </div>
                <div className="text-2xl text-gray-600 mb-1">of {totalReps}</div>
                <div className="text-lg text-gray-500">repetitions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-black mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-gray-200" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {repetitions < totalReps ? (
            <>
              <Button
                onClick={handleRepetition}
                className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white py-8 rounded-2xl shadow-lg shadow-[#FF901F]/20"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-white/20 rounded-full p-3">
                    <Check size={24} />
                  </div>
                  <span className="text-lg">Complete Repetition</span>
                </div>
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full bg-white hover:bg-gray-50 text-black border-gray-300 py-6 rounded-2xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <RotateCcw size={20} />
                  <span>Reset Count</span>
                </div>
              </Button>
            </>
          ) : (
            <>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 text-center">
                <div className="text-6xl mb-3">🎉</div>
                <h2 className="text-black mb-2">Great Work!</h2>
                <p className="text-gray-600">
                  You've completed all repetitions for this lesson
                </p>
              </div>

              <Button
                onClick={handleFinish}
                className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white py-8 rounded-2xl shadow-lg shadow-[#FF901F]/20"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg">View Performance Report</span>
                  <ArrowRight size={24} />
                </div>
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full bg-white hover:bg-gray-50 text-black border-gray-300 py-6 rounded-2xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <RotateCcw size={20} />
                  <span>Practice Again</span>
                </div>
              </Button>
            </>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-orange-50 border border-orange-100 rounded-xl p-4">
          <p className="text-gray-700 text-sm text-center">
            💡 Tip: Focus on maintaining consistent bow pressure throughout each repetition
          </p>
        </div>
      </div>
    </div>
  );
}
