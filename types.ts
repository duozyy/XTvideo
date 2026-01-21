
export enum VideoStatus {
  IDLE = 'IDLE',
  FETCHING = 'FETCHING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface VideoMetadata {
  id: string;
  sourceUrl: string;
  title: string;
  thumbnail: string;
  duration: string;
  platform: 'youtube' | 'x' | 'instagram' | 'sora' | 'unknown';
  fileSize: string;
  downloadUrl: string;
  expiryDate: number;
}

export interface ExtractionResponse {
  isCached: boolean;
  video: VideoMetadata;
}
