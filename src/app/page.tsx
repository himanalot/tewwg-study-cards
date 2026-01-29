import { parseFlashcards } from '@/lib/flashcards';
import StudyApp from '@/components/StudyApp';

export default function Home() {
  const flashcardSet = parseFlashcards();

  return (
    <main className="min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 sm:mb-12 px-4">
          <h1
            className="text-2xl sm:text-3xl font-normal text-center mb-1"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            {flashcardSet.title}
          </h1>
          <p className="text-center text-sm text-[--text-muted]">
            {flashcardSet.cards.length} terms
          </p>
        </header>

        <StudyApp cards={flashcardSet.cards} />
      </div>
    </main>
  );
}
