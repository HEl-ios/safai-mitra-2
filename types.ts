// Fix: Import React to make React types available.
import React from 'react';

export enum View {
  DASHBOARD = 'DASHBOARD',
  CLASSIFIER = 'CLASSIFIER',
  LOCATOR = 'LOCATOR',
  QUIZ = 'QUIZ',
  REPORT = 'REPORT',
  CHATBOT = 'CHATBOT',
  PROFILE = 'PROFILE',
}

export interface WasteClassificationResult {
  wasteType: 'Wet Waste' | 'Dry Waste' | 'Hazardous' | 'Recyclable' | 'Unknown';
  itemName: string;
  description: string;
  disposalInstructions: string;
  recyclable: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizAnalysis {
  performanceSummary: string;
  improvementAreas: string[];
  nextSteps: string;
}

export type BadgeSlug = 'first-scan' | 'quiz-master' | 'eco-reporter' | 'chat-champ' | 'novice-recycler' | 'community-helper';

export interface Badge {
  slug: BadgeSlug;
  name: string;
  description: string;
  // Fix: Changed icon type to be more specific, allowing it to be cloned with a className prop.
  icon: React.ReactElement<{ className?: string }>;
  points: number;
}

export interface ClassificationHistoryItem {
  id: string;
  type: 'classification';
  timestamp: Date;
  data: WasteClassificationResult;
}

export interface ReportHistoryItem {
  id: string;
  type: 'report';
  timestamp: Date;
  data: { 
    image: string; 
    description:string; 
    location?: { latitude: number; longitude: number; };
  };
}

export type HistoryItem = ClassificationHistoryItem | ReportHistoryItem;

export interface Facility {
  name: string;
  address: string;
}