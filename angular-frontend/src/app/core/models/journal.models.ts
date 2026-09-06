export type Sentiment = 'HAPPY' | 'SAD' | 'ANGRY' | 'ANXIOUS';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  sentiment?: Sentiment | string | null;
}

export interface JournalEntryRequest {
  title: string;
  content: string;
}
