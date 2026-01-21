
import React, { useState, useEffect } from 'react';
import { VideoStatus, VideoMetadata } from './types';
import { runExtraction, validateUrl } from './services/extractorEngine';
import { VideoCard } from './components/VideoCard';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<VideoStatus>(VideoStatus.IDLE);
  const [currentVideo, setCurrentVideo] = useState<VideoMetadata | null>(null);
  const [history, setHistory] = useState<VideoMetadata[]>([]);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem('xiaoti_assistant_cache');
    if (cached) {
      setHistory(JSON.parse(cached).slice(0, 4));
    }
  }, [currentVideo]);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    const platform = validateUrl(url);
    if (!platform) {
      setError('无法识别此链接。目前支持：YouTube, X, Instagram 以及 sora.chatgpt.com');
      return;
    }

    setError('');
    setStatus(VideoStatus.FETCHING);
    setCurrentVideo(null);

    try {
      const result = await runExtraction(url);
      setIsCached(result.isCached);
      setCurrentVideo(result.video);
      setStatus(VideoStatus.COMPLETED);
      setUrl('');
    } catch (err: any) {
      setError(err.message || '解析失败，请检查链接有效性。');
      setStatus(VideoStatus.ERROR);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 lg:py-20">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-xl shadow-indigo-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-6xl font-black mb-4 tracking-tighter italic">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">小提</span>
          <span className="text-white">助手</span>
        </h1>
        <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
          全自动解析 Sora (chatgpt.com) 及主流社交平台。<br/>
          <span className="text-indigo-400/80 font-mono text-sm">v2.2.0 Sora-Turbo 版</span>
        </p>
      </header>

      {/* Main Form */}
      <section className="glass-effect rounded-[2.5rem] p-10 mb-12 shadow-2xl relative border-t border-white/20">
        <form onSubmit={handleExtract} className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <input
              type="text"
              placeholder="粘贴 sora.chatgpt.com 或其他平台视频链接"
              className="relative w-full bg-slate-900 border border-white/10 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-indigo-500/20 outline-none text-lg transition-all placeholder:text-slate-600 text-indigo-100"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={status === VideoStatus.FETCHING}
            />
          </div>

          <button
            type="submit"
            disabled={status === VideoStatus.FETCHING}
            className={`w-full py-5 rounded-2xl text-xl font-black tracking-widest transition-all ${
              status === VideoStatus.FETCHING 
              ? 'bg-indigo-900/50 text-indigo-300 cursor-wait' 
              : 'bg-white text-slate-900 hover:bg-indigo-50 hover:text-indigo-600 active:scale-[0.98]'
            }`}
          >
            {status === VideoStatus.FETCHING ? (
               <span className="flex items-center justify-center gap-3">
                 <div className="w-5 h-5 border-t-2 border-indigo-400 rounded-full animate-spin"></div>
                 正在穿透 Sora 媒体协议...
               </span>
            ) : '立即提取高清资源'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}
      </section>

      {/* Results & History */}
      <div className="space-y-12">
        {currentVideo && (
          <div className="animate-in fade-in zoom-in-95 duration-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                解析成功
              </h2>
            </div>
            <VideoCard video={currentVideo} isCached={isCached} />
          </div>
        )}

        {history.length > 0 && (
          <div className="pt-12 border-t border-white/5">
            <h3 className="text-slate-500 font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              最近解析记录
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {history.map((vid) => (
                <div key={vid.id} className="opacity-60 hover:opacity-100 transition-opacity">
                   <VideoCard video={vid} isCached={true} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-24 pt-12 border-t border-white/5 text-center">
        <div className="flex justify-center gap-6 mb-6">
          {['Youtube', 'X.com', 'Instagram', 'Sora.chatgpt.com'].map(p => (
            <span key={p} className="text-[10px] font-bold text-slate-600 border border-slate-800 px-2 py-1 rounded tracking-tighter uppercase">{p}</span>
          ))}
        </div>
        <p className="text-slate-500 text-[11px] mb-2">安全声明：本工具仅供学习交流。对于 Sora 生成内容的版权，请遵循 OpenAI 相关协议。</p>
        <p className="text-slate-700 text-[10px] font-mono tracking-widest uppercase italic">Logic Optimized for sora.chatgpt.com</p>
      </footer>
    </div>
  );
};

export default App;
