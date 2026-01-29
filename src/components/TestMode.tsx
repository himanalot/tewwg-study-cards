'use client';

import { useState, useCallback } from 'react';
import type { Flashcard } from '@/lib/flashcards';

interface TestModeProps {
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

export default function TestMode({ cards }: TestModeProps) {
  const [testCards] = useState(() => shuffleArray(cards).slice(0, 10));
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});

  const handleAnswerChange = useCallback((cardId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [cardId]: answer }));
  }, []);

  const handleSubmit = useCallback(() => {
    const newResults: Record<number, boolean> = {};
    testCards.forEach((card) => {
      const userAnswer = (answers[card.id] || '').toLowerCase().trim();
      const correctAnswer = card.answer.toLowerCase().trim();
      // Simple matching - check if key words are present
      const correctWords = correctAnswer.split(/\s+/).filter((w) => w.length > 3);
      const matchedWords = correctWords.filter((word) => userAnswer.includes(word));
      newResults[card.id] = matchedWords.length >= Math.ceil(correctWords.length * 0.5);
    });
    setResults(newResults);
    setSubmitted(true);
  }, [answers, testCards]);

  const handleRetake = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setResults({});
  }, []);

  const score = Object.values(results).filter(Boolean).length;
  const percentage = Math.round((score / testCards.length) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      {submitted && (
        <div className="bg-slate-800 rounded-xl p-6 mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Test Results</h2>
          <div className="text-5xl font-bold text-indigo-400 mb-2">{percentage}%</div>
          <p className="text-slate-400 mb-4">
            You got {score} out of {testCards.length} correct
          </p>
          <button
            onClick={handleRetake}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
          >
            Retake Test
          </button>
        </div>
      )}

      <div className="space-y-6">
        {testCards.map((card, index) => (
          <div
            key={card.id}
            className={`bg-slate-800 rounded-xl p-6 ${
              submitted
                ? results[card.id]
                  ? 'border-2 border-green-500'
                  : 'border-2 border-red-500'
                : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-slate-400 font-bold text-lg">{index + 1}.</span>
              <div className="flex-1">
                <p className="text-lg mb-4">{card.question}</p>
                <textarea
                  value={answers[card.id] || ''}
                  onChange={(e) => handleAnswerChange(card.id, e.target.value)}
                  disabled={submitted}
                  placeholder="Type your answer..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg resize-none h-24 focus:outline-none focus:border-indigo-500"
                />
                {submitted && (
                  <div className="mt-3">
                    <div className={`text-sm font-semibold ${results[card.id] ? 'text-green-400' : 'text-red-400'}`}>
                      {results[card.id] ? 'Correct!' : 'Incorrect'}
                    </div>
                    <div className="text-slate-400 mt-1">
                      <span className="font-semibold">Correct answer:</span> {card.answer}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!submitted && (
        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
          >
            Submit Test
          </button>
        </div>
      )}
    </div>
  );
}
