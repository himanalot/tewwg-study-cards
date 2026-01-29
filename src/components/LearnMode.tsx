'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Flashcard } from '@/lib/flashcards';

interface LearnModeProps {
  cards: Flashcard[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function LearnMode({ cards }: LearnModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [shuffledCards] = useState(() => shuffleArray(cards));

  const currentCard = shuffledCards[currentIndex];

  const options = useMemo(() => {
    const otherCards = cards.filter((c) => c.id !== currentCard.id);
    const wrongAnswers = shuffleArray(otherCards).slice(0, 3).map((c) => c.answer);
    return shuffleArray([currentCard.answer, ...wrongAnswers]);
  }, [cards, currentCard]);

  const handleSelect = useCallback(
    (answer: string) => {
      if (showResult) return;
      setSelectedAnswer(answer);
      setShowResult(true);

      if (answer === currentCard.answer) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
    },
    [currentCard.answer, showResult]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [currentIndex, shuffledCards.length]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore({ correct: 0, incorrect: 0 });
  }, []);

  const isComplete = currentIndex === shuffledCards.length - 1 && showResult;
  const percentage = Math.round((score.correct / (score.correct + score.incorrect || 1)) * 100);

  if (isComplete) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-xl p-8 w-full text-center">
          <h2 className="text-3xl font-bold mb-4">Round Complete!</h2>
          <div className="text-6xl font-bold mb-4 text-indigo-400">{percentage}%</div>
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <div className="text-3xl font-bold text-green-400">{score.correct}</div>
              <div className="text-slate-400">Correct</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400">{score.incorrect}</div>
              <div className="text-slate-400">Incorrect</div>
            </div>
          </div>
          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
          >
            Study Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Question {currentIndex + 1} of {shuffledCards.length}</span>
          <span className="flex gap-4">
            <span className="text-green-400">{score.correct} correct</span>
            <span className="text-red-400">{score.incorrect} incorrect</span>
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-slate-800 rounded-xl p-6 w-full">
        <h3 className="text-lg font-semibold text-slate-400 mb-2">Question</h3>
        <p className="text-xl">{currentCard.question}</p>
      </div>

      {/* Options */}
      <div className="w-full space-y-3">
        {options.map((option, index) => {
          let bgClass = 'bg-slate-800 hover:bg-slate-700';
          if (showResult) {
            if (option === currentCard.answer) {
              bgClass = 'bg-green-600';
            } else if (option === selectedAnswer) {
              bgClass = 'bg-red-600';
            } else {
              bgClass = 'bg-slate-800 opacity-50';
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={showResult}
              className={`w-full p-4 rounded-xl text-left transition-colors ${bgClass} ${
                !showResult ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <span className="font-semibold text-slate-400 mr-3">{index + 1}</span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Continue button */}
      {showResult && (
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
        >
          Continue
        </button>
      )}
    </div>
  );
}
