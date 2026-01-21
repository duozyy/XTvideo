
import React from 'react';
import { VideoMetadata } from '../types';

interface VideoCardProps {
  video: VideoMetadata;
  isCached?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isCached }) => {
  const handleDownload = () => {
    const fileName = `${video.title.replace(/\s+/g, '_')}.mp4`;
    // 增强版模拟 MP4 文件头
    const dummyContent = new Uint8Array([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 
      0x6D, 0x70, 0x34, 0x32, 0x00, 0x00, 0x00, 0x00, 
      0x6D, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6F, 0x6D
    ]);
    const blob = new Blob([dummyContent], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`【小提助手】提示："${video.title}" 正在通过高速通道保存...`);
  };

  const platformColors = {
    youtube: 'bg-red-600',
    x: 'bg-slate-900',
    instagram: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600',
    sora: 'bg-indigo-700',
    unknown: 'bg-gray-600'
  };

  return (
    <div className="glass-effect rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.2)] border border-white/10 group">
      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
        />
        
        {/* 顶部标签 */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isCached && (
            <div className="px-3 py-1 bg-emerald-500/90 text-[10px] font-black rounded-lg shadow-xl backdrop-blur-sm">
              秒开
            </div>
          )}
          {video.platform === 'sora' && (
            <div className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black rounded-lg text-white animate-pulse">
              AI GENERATED
            </div>
          )}
        </div>

        <div className={`absolute top-4 right-4 px-3 py-1 ${platformColors[video.platform] || platformColors.unknown} rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg`}>
          {video.platform}
        </div>

        {/* 居中播放图标 */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
             <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-2"></div>
           </div>
        </div>

        {/* 底部时长 */}
        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-mono font-bold">
          {video.duration}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold mb-1 text-white/90 truncate group-hover:text-indigo-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-slate-500 text-[10px] mb-6 font-mono truncate">{video.sourceUrl}</p>
        
        <div className="flex items-center justify-between text-slate-400 text-xs mb-6 bg-white/5 p-3 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-600 font-bold mb-1">文件大小</span>
            <span className="text-white/80 font-mono">{video.fileSize}</span>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase text-slate-600 font-bold mb-1">画质等级</span>
            <span className="text-indigo-400 font-mono font-bold">4K ULTRA HD</span>
          </div>
        </div>
        
        <button
          onClick={handleDownload}
          className="w-full py-4 bg-white text-slate-900 hover:bg-indigo-50 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.96] shadow-xl shadow-white/5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          一键导出视频
        </button>
      </div>
    </div>
  );
};
