// lib/gamification/types.ts
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'discipline' | 'consistency' | 'speed';
  target: number;
  current: number;
}