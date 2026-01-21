
import { VideoMetadata, ExtractionResponse } from '../types';

// Mock DB in localStorage to persist between refreshes (Simulating Server-Side)
const DB_KEY = 'omnistream_mock_db';

const getDB = (): VideoMetadata[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveDB = (db: VideoMetadata[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// Cleanup logic (7-day TTL)
const cleanupExpired = () => {
  const db = getDB();
  const now = Date.now();
  const filtered = db.filter(v => v.expiryDate > now);
  saveDB(filtered);
};

export const extractVideo = async (url: string): Promise<ExtractionResponse> => {
  cleanupExpired();
  const db = getDB();
  
  // Check if already exists (Deduplication)
  const existing = db.find(v => v.sourceUrl === url);
  if (existing) {
    return { isCached: true, video: existing };
  }

  // Simulate heavy processing (Merging streams, removing watermarks)
  await new Promise(resolve => setTimeout(resolve, 3500));

  const platformMatch = url.match(/(youtube|x|instagram|sora)/i);
  const platform = (platformMatch ? platformMatch[0].toLowerCase() : '未知') as any;

  const newVideo: VideoMetadata = {
    id: Math.random().toString(36).substring(7),
    sourceUrl: url,
    title: `来自 ${platform.toUpperCase()} 的解析视频`,
    thumbnail: `https://picsum.photos/seed/${Math.random()}/640/360`,
    duration: "02:45",
    platform,
    fileSize: "24.5 MB",
    downloadUrl: "#", 
    expiryDate: Date.now() + (7 * 24 * 60 * 60 * 1000)
  };

  saveDB([...db, newVideo]);
  return { isCached: false, video: newVideo };
};
