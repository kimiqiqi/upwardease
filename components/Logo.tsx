import React from "react";
import { Sparkles } from "lucide-react";

export const LogoIcon = ({ className }: { className?: string }) => (
  <div className={`bg-eggplant text-white p-2 rounded-xl flex items-center justify-center ${className || ''}`}>
    <Sparkles className="w-full h-full" />
  </div>
);

export const Logo = ({ onClick, darkMode, className }: { onClick?: () => void, darkMode?: boolean, className?: string }) => {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 group focus:outline-none ${className || ''}`}>
      <div className="bg-eggplant text-white p-2 rounded-xl group-hover:bg-eggplant/90 transition-colors">
        <Sparkles size={20} />
      </div>
      <span className={`font-serif font-bold text-xl tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>UpwardEase</span>
    </button>
  );
};
