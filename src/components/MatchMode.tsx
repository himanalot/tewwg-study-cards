'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Flashcard } from '@/lib/flashcards';

interface MatchModeProps {
  cards: Flashcard[];
}

interface Tile {
  id: string;
  content: string;
  cardId: number;
  type: 'question' | 'answer';
  matched: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MatchMode({ cards }: MatchModeProps) {
  const [gameCards] = useState(() => shuffleArray(cards).slice(0, 6));
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initializeGame = useCallback(() => {
    const newTiles: Tile[] = [];
    gameCards.forEach((card) => {
      newTiles.push({
        id: `q-${card.id}`,
        content: card.question.length > 80 ? card.question.substring(0, 80) + '...' : card.question,
        cardId: card.id,
        type: 'question',
        matched: false,
      });
      newTiles.push({
        id: `a-${card.id}`,
        content: card.answer.length > 80 ? card.answer.substring(0, 80) + '...' : card.answer,
        cardId: card.id,
        type: 'answer',
        matched: false,
      });
    });
    setTiles(shuffleArray(newTiles));
    setSelectedTile(null);
    setMatchedCount(0);
    setTimer(0);
    setIsRunning(false);
  }, [gameCards]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 0.1);
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (matchedCount === gameCards.length && matchedCount > 0) {
      setIsRunning(false);
      if (bestTime === null || timer < bestTime) {
        setBestTime(timer);
      }
    }
  }, [matchedCount, gameCards.length, timer, bestTime]);

  const handleTileClick = useCallback(
    (tile: Tile) => {
      if (tile.matched || tile.id === selectedTile?.id) return;

      if (!isRunning) {
        setIsRunning(true);
      }

      if (!selectedTile) {
        setSelectedTile(tile);
      } else {
        // Check for match
        if (selectedTile.cardId === tile.cardId && selectedTile.type !== tile.type) {
          // Match found
          setTiles((prev) =>
            prev.map((t) =>
              t.cardId === tile.cardId ? { ...t, matched: true } : t
            )
          );
          setMatchedCount((prev) => prev + 1);
        }
        setSelectedTile(null);
      }
    },
    [selectedTile, isRunning]
  );

  const isComplete = matchedCount === gameCards.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-6">
          <div className="bg-slate-800 px-4 py-2 rounded-lg">
            <span className="text-slate-400 mr-2">Time:</span>
            <span className="font-mono text-xl">{timer.toFixed(1)}s</span>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-lg">
            <span className="text-slate-400 mr-2">Matched:</span>
            <span className="font-mono text-xl">{matchedCount}/{gameCards.length}</span>
          </div>
        </div>
        {bestTime !== null && (
          <div className="bg-slate-800 px-4 py-2 rounded-lg">
            <span className="text-slate-400 mr-2">Best:</span>
            <span className="font-mono text-xl text-green-400">{bestTime.toFixed(1)}s</span>
          </div>
        )}
      </div>

      {isComplete ? (
        <div className="bg-slate-800 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
          <p className="text-xl mb-2">You completed the match in</p>
          <div className="text-5xl font-bold text-indigo-400 mb-4">{timer.toFixed(1)}s</div>
          {bestTime === timer && (
            <p className="text-green-400 mb-4">New best time!</p>
          )}
          <button
            onClick={initializeGame}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
          >
            Play Again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                disabled={tile.matched}
                className={`p-4 rounded-xl text-sm transition-all min-h-[100px] ${
                  tile.matched
                    ? 'bg-green-600/20 border-2 border-green-500 opacity-50'
                    : selectedTile?.id === tile.id
                    ? 'bg-indigo-600 border-2 border-indigo-400'
                    : 'bg-slate-800 hover:bg-slate-700 border-2 border-slate-700'
                }`}
              >
                {tile.content}
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={initializeGame}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Reset Game
            </button>
          </div>
        </>
      )}
    </div>
  );
}
