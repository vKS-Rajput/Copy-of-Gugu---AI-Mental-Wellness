export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
}

export interface Therapist {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  reviews: number;
  image: string;
  bio: string;
  price: string;
  available: boolean;
}

export interface VideoResource {
  id: string;
  title: string;
  category: 'Meditation' | 'Anxiety' | 'Sleep' | 'Motivation';
  duration: string;
  thumbnail: string;
  author: string;
}

export interface BookResource {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  rating: number;
  description: string;
}

export interface MoodEntry {
  date: string;
  score: number; // 1-5
  label: string;
  note?: string;
}

export enum MoodType {
  Down = 1,
  Content = 2,
  Peaceful = 3,
  Happy = 4,
  Excited = 5
}