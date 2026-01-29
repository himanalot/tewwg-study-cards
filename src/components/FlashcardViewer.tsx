'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Download } from 'lucide-react';
import type { Flashcard } from '@/lib/flashcards';

interface FlashcardViewerProps {
  cards: Flashcard[];
}

export default function FlashcardViewer({ cards }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const handlePrevious = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const shuffle = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * cards.length);
    setCurrentIndex(randomIndex);
    setIsFlipped(false);
  }, [cards.length]);

  const exportToCSV = useCallback(() => {
    const csvContent = [
      ['Question', 'Answer'],
      ...cards.map((card) => [
        `"${card.question.replace(/"/g, '""')}"`,
        `"${card.answer.replace(/"/g, '""')}"`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'flashcards.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }, [cards]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrevious]);

  // Touch handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    setTouchStart(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4">
      {/* Header with progress */}
      <div className="w-full flex items-center justify-between">
        <span className="text-sm text-[--text-secondary]">
          {currentIndex + 1} / {cards.length}
        </span>
        <button
          onClick={exportToCSV}
          className="btn btn-secondary"
          aria-label="Export to spreadsheet"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full progress-track">
        <div
          className="progress-fill"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        className={`card-container w-full h-72 sm:h-80 cursor-pointer select-none ${
          isFlipped ? 'flipped' : ''
        }`}
        onClick={handleFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="card-flipper">
          <div className="card-face front">
            <span className="card-label">Question</span>
            <p className="text-base sm:text-lg text-center leading-relaxed px-2">
              {currentCard.question}
            </p>
          </div>
          <div className="card-face back">
            <span className="card-label">Answer</span>
            <p className="text-sm sm:text-base text-center leading-relaxed text-[--text-secondary] px-2">
              {currentCard.answer}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 items-center">
        <button
          onClick={handlePrevious}
          className="btn-icon"
          aria-label="Previous card"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={shuffle}
          className="btn btn-secondary"
          aria-label="Shuffle cards"
        >
          <Shuffle size={16} />
          <span>Shuffle</span>
        </button>
        <button
          onClick={handleNext}
          className="btn-icon"
          aria-label="Next card"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
