import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const [userName, setUserName] = useState<string>('Foydalanuvchi');

  useEffect(() => {
    // Integrate Telegram WebApp SDK user info
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      setUserName(tgUser.first_name || tgUser.username || 'Foydalanuvchi');
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <header className="glass-panel sticky top-0 z-40 px-4 py-3 border-b border-slate-800/80">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight gradient-text-cyan">TGS Sticker Lab</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>Salom, <strong className="text-slate-200">{userName}</strong>!</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Fast TGS</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        </div>
      </div>
    </header>
  );
};
