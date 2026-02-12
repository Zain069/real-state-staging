export interface StagingStyle {
  id: string;
  name: string;
  description: string;
  image: string; // Placeholder URL
  promptModifier: string;
  isCustom?: boolean;
}

export interface Preset {
  id: string;
  name: string;
  roomType: RoomType;
  style: StagingStyle;
  timestamp: number;
}

export interface GeneratedResult {
  originalImage: string; // Base64
  generatedImage: string; // Base64 or URL
  styleId: string;
  timestamp: number;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  SELECT_STYLE = 'SELECT_STYLE',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export type RoomType = 'Living Room' | 'Bedroom' | 'Kitchen' | 'Dining Room' | 'Office' | 'Bathroom' | 'Empty Room';