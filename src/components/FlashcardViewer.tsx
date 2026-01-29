'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Download, Search, X } from 'lucide-react';
import type { Flashcard } from '@/lib/flashcards';

interface FlashcardViewerProps {
  cards: Flashcard[];
}

export default function FlashcardViewer({ cards }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
    setSearchQuery('');
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, []);

  const goToCard = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsFlipped(false);
    closeSearch();
  }, [closeSearch]);

  const searchResults = searchQuery.trim()
    ? cards
        .map((card, index) => ({ card, index }))
        .filter(
          ({ card }) =>
            card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10)
    : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Cmd+F or Ctrl+F for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        openSearch();
        return;
      }

      // Handle Escape to close search
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
        return;
      }

      // Don't handle other keys when search is open
      if (isSearchOpen) return;

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
  }, [handleFlip, handleNext, handlePrevious, isSearchOpen, openSearch, closeSearch]);

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
      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-[--bg-primary] rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-[--border]">
              <Search size={18} className="text-[--text-secondary]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards..."
                className="flex-1 bg-transparent outline-none text-[--text-primary] placeholder:text-[--text-secondary]"
              />
              <button
                onClick={closeSearch}
                className="p-1 hover:bg-[--bg-secondary] rounded-lg transition-colors"
                aria-label="Close search"
              >
                <X size={18} className="text-[--text-secondary]" />
              </button>
            </div>
            {searchQuery.trim() && (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(({ card, index }) => (
                    <button
                      key={index}
                      onClick={() => goToCard(index)}
                      className="w-full text-left p-4 hover:bg-[--bg-secondary] border-b border-[--border] last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[--text-secondary] bg-[--bg-secondary] px-2 py-0.5 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-[--text-primary] line-clamp-2">
                        {card.question}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-[--text-secondary]">
                    No cards found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header with progress */}
      <div className="w-full flex items-center justify-between">
        <span className="text-sm text-[--text-secondary]">
          {currentIndex + 1} / {cards.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={openSearch}
            className="btn btn-secondary"
            aria-label="Search cards"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            onClick={exportToCSV}
            className="btn btn-secondary"
            aria-label="Export to spreadsheet"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
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
