import React from "react";
import { ArrowDown } from "lucide-react";

export const Footer = ({ navigate, darkMode }: { navigate: (tab: any) => void, darkMode: boolean }) => (
  <footer className={`border-t py-12 mt-auto text-center ${darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-cream border-slate-200 text-slate-500"}`}>
    <div className="flex flex-col items-center justify-center gap-4 mb-8">
       <p className="font-serif text-lg text-eggplant dark:text-white">Good Morning!</p>
       <ArrowDown className="text-accent-orange animate-bounce" />
    </div>
    <div className="flex justify-center gap-6 text-sm font-bold mb-4">
        <button onClick={() => navigate("home")} className="hover:text-eggplant dark:hover:text-white">Who We Are</button>
        <button className="hover:text-eggplant dark:hover:text-white">Anatomy of Kind Design</button>
        <button onClick={() => navigate("gallery")} className="hover:text-eggplant dark:hover:text-white">Our Work</button>
        <button onClick={() => navigate("contact")} className="hover:text-eggplant dark:hover:text-white">Email Us</button>
    </div>
    <p className="text-xs opacity-60">© UpwardEase {new Date().getFullYear()}. All rights reserved.</p>
  </footer>
);