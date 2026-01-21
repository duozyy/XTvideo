
import { VideoMetadata, ExtractionResponse } from '../types';

const DB_KEY = 'xiaoti_assistant_cache';

const getCache = (): VideoMetadata[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveCache = (db: VideoMetadata[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const validateUrl = (url: string) => {
  const patterns = {
    youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    x: /^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/.+$/,
    instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reels|reel)\/.+$/,
    /**
     * 修复 Sora 正则：
     * 1. 支持 sora.chatgpt.com/p/ 后面紧跟以 s_ 开头的 ID (包含字母、数字、下划线)
     * 2. 允许可选的末尾斜杠
     * 3. 允许可选的查询参数 (?psh=...)
     */
    sora: /^(https?:\/\/)?(www\.)?(sora\.chatgpt\.com\/p\/[a-zA-Z0-9_]+)\/?(\?.*)?$/
  };
  
  if (patterns.youtube.test(url)) return 'youtube';
  if (patterns.x.test(url)) return 'x';
  if (patterns.instagram.test(url)) return 'instagram';
  if (patterns.sora.test(url)) return 'sora';
  
  // 备用匹配旧版 openai.com 路径
  const legacySora = /^(https?:\/\/)?(www\.)?openai\.com\/(sora|index\/sora|blog\/sora)(\/.*)?$/;
  if (legacySora.test(url)) return 'sora';

  return null;
};

export const runExtraction = async (url: string): Promise<ExtractionResponse> => {
  const platform = validateUrl(url);
  if (!platform) throw new Error('不支持的平台链接');

  const cache = getCache();
  const existing = cache.find(v => v.sourceUrl === url);
  
  if (existing && existing.expiryDate > Date.now()) {
    return { isCached: true, video: existing };
  }

  // 针对 Sora 地址模拟更真实的握手延迟，AI 视频解析通常较慢
  const waitTime = platform === 'sora' ? 2500 : 1200;
  await new Promise(resolve => setTimeout(resolve, waitTime + Math.random() * 500));

  let title = `${platform.toUpperCase()} 高清解析视频_${Math.floor(Math.random() * 10000)}`;
  
  if (platform === 'sora') {
    // 鲁棒性 ID 提取逻辑
    let hash = 'AI_GENERATED';
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      // 通常是 /p/ID，所以取 pathParts 的最后一个
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart) {
        hash = lastPart;
      }
    } catch (e) {
      // 降级处理
      const cleanUrl = url.split('?')[0].replace(/\/$/, "");
      hash = cleanUrl.split('/').pop() || 'AI';
    }
    
    const shortHash = hash.substring(0, 10);
    
    const aiPrompts = [
      "电影级镜头：繁华的赛博朋克都市夜景，霓虹灯倒映在雨后的路面",
      "一只戴着贝雷帽的可爱金毛犬在塞纳河畔写生",
      "古老森林中发光的奇异植物与半透明的小鹿",
      "复古录像带风格的90年代加州海滩派对",
      "空中俯瞰巨大的云层，云朵呈现出史前怪兽的形状",
      "水下摄影：一群发光的水母在深海中编织复杂的图案",
      "未来主义实验室中，机械臂正在精准地雕刻一块冰晶",
      "维多利亚风格的客厅里，一只猫正在与全息投影出的蝴蝶嬉戏"
    ];
    
    // 使用哈希值字符的 ASCII 码总和取余，确保同一链接生成同一模拟内容
    const charSum = hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const promptIndex = charSum % aiPrompts.length;
    title = `Sora AI 作品 [${shortHash}]: ${aiPrompts[promptIndex]}`;
  }

  const newVideo: VideoMetadata = {
    id: Math.random().toString(36).substring(7),
    sourceUrl: url,
    title,
    thumbnail: `https://picsum.photos/seed/${encodeURIComponent(url)}/1280/720`,
    duration: platform === 'sora' ? "0:15" : `${Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    platform: platform as any,
    fileSize: platform === 'sora' ? `${(Math.random() * 30 + 10).toFixed(1)} MB` : `${(Math.random() * 15 + 5).toFixed(1)} MB`,
    downloadUrl: `data:video/mp4;base64,AAAAFmZ0eXBtcDQyAAAAAG1wNDJpc29tAAAALm1vb3YAAABsbXZoZAAAAADNo86XzaPOlwAAA+gAAAnQAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAABidHJha3MAAAAkdGtoZAAAAALNo86XzaPOlwAAAAEAAAAAAAnQAAAAAAAAAAAAAAABAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAZW1kaWEAAAAgbWRoZAAAAADNo86XzaPOlwAAH0AAACWpUAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABbW1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAAAAAABYm1idWYAAAAA`,
    expiryDate: Date.now() + (7 * 24 * 60 * 60 * 1000)
  };

  saveCache([newVideo, ...cache].slice(0, 20));
  return { isCached: false, video: newVideo };
};
