'use client';

import type { Flashcard } from '@/lib/flashcards';
import FlashcardViewer from './FlashcardViewer';

interface StudyAppProps {
  cards: Flashcard[];
}

export default function StudyApp({ cards }: StudyAppProps) {
  return <FlashcardViewer cards={cards} />;
}
