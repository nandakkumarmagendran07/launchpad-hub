import type { ReactNode } from 'react';

export type Message = {
  id: string;
  role: 'user' | 'bot' | 'loading';
  content: ReactNode;
};

export type BotResponse = {
  type: 'exact' | 'partial' | 'none' | 'error';
  answer: string;
  evidence?: string;
  confidence?: number;
};
