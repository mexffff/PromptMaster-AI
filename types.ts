
export enum AppState {
  IDLE = 'IDLE',
  ANALYZING_IMAGE = 'ANALYZING_IMAGE',
  RESEARCHING = 'RESEARCHING',
  THINKING = 'THINKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum AppMode {
  TEXT_TO_PROMPT = 'TEXT_TO_PROMPT',
  IMAGE_TO_PROMPT = 'IMAGE_TO_PROMPT',
  NO_CODE_ARCHITECT = 'NO_CODE_ARCHITECT'
}

export type NoCodePlatform = 'Bubble.io' | 'FlutterFlow' | 'Webflow' | 'Framer' | 'Custom Code (React/Node)';
export type ExperienceLevel = 'Junior (MVP)' | 'Senior (Best Practice)' | 'Principal (39 Yıl - Extreme)';
export type FocusArea = 'Genel Mimari' | 'Veritabanı Odaklı' | 'Güvenlik Odaklı' | 'UX/Akış Odaklı';

export interface ResearchData {
  summary: string;
  sources: Array<{
    title: string;
    uri: string;
  }>;
}

export interface EnhancedResult {
  originalPrompt: string;
  correctedInput?: string;
  enhancedPrompt: string; // This will now hold the stringified JSON
  rationale: string;
}
