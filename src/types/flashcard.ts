export type CardConfidence = 'hard' | 'good' | 'mastered' | 'unrated';

export interface Flashcard {
  id: string;
  questionId: string;
  frontQuestion: string;
  codeSnippet?: string;
  topic: string;
  backAnswer: string;
  explanation: string;
  confidence: CardConfidence;
  lastReviewed?: string;
  reviewCount: number;
}

export interface FlashcardDeck {
  id: string;
  quizId: string;
  title: string;
  category: string;
  cards: Flashcard[];
  createdAt: string;
}
