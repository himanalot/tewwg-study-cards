import fs from 'fs';
import path from 'path';

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

export interface FlashcardSet {
  title: string;
  cards: Flashcard[];
}

export function parseFlashcards(): FlashcardSet {
  const filePath = path.join(process.cwd(), 'data', 'flashcards.txt');
  const content = fs.readFileSync(filePath, 'utf-8');

  const lines = content.split('\n');
  const title = lines[0].trim();

  const cards: Flashcard[] = [];
  let currentQuestion = '';
  let id = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('Q:')) {
      currentQuestion = line.substring(2).trim();
    } else if (line.startsWith('A:') && currentQuestion) {
      cards.push({
        id: id++,
        question: currentQuestion,
        answer: line.substring(2).trim(),
      });
      currentQuestion = '';
    }
  }

  return { title, cards };
}
