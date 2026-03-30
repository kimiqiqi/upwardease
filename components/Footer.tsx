import React, { useState, useEffect } from "react";
import { ArrowDown, Instagram, Youtube, Music, Heart } from "lucide-react";
import { Logo } from "./Logo";
import { TabType } from "../types";

export const Footer = ({ navigate, darkMode }: { navigate: (tab: TabType) => void, darkMode: boolean }) => {
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting("Good Morning");
      else if (hour >= 12 && hour < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className={`border-t py-16 mt-auto ${darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-cream border-slate-200 text-slate-500"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
          {/* Brand & Greeting */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo onClick={() => navigate("home")} darkMode={darkMode} className="mb-2" />
            <div className="flex items-center gap-2">
              <p className="font-serif text-lg text-eggplant dark:text-white">{greeting}!</p>
              <ArrowDown size={16} className="text-accent-orange animate-bounce" />
            </div>
            <p className="text-sm max-w-xs text-center md:text-left opacity-80">
              Empowering students to share their stories and find balance in a supportive community.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-sm font-bold uppercase tracking-wider">
            <button onClick={() => navigate("home")} className="hover:text-eggplant dark:hover:text-teal-300 transition-colors">Who We Are</button>
            <button onClick={() => navigate("about")} className="hover:text-eggplant dark:hover:text-teal-300 transition-colors">Our Mission</button>
            <button onClick={() => navigate("gallery")} className="hover:text-eggplant dark:hover:text-teal-300 transition-colors">Gallery</button>
            <button onClick={() => navigate("contact")} className="hover:text-eggplant dark:hover:text-teal-300 transition-colors">Contact Us</button>
            <button onClick={() => navigate("terms")} className="hover:text-eggplant dark:hover:text-teal-300 transition-colors">Terms</button>
            <a href="https://donate.stripe.com/test" target="_blank" rel="noopener noreferrer" className="text-accent-orange hover:text-orange-600 transition-colors flex items-center gap-1">
              <Heart size={14} fill="currentColor" /> Donate
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a 
              href="https://instagram.com/upwardease" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-eggplant hover:text-white dark:hover:bg-teal-400 dark:hover:text-slate-900 transition-all shadow-sm hover:shadow-md"
              title="Follow us on Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://youtube.com/@upwardease" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-eggplant hover:text-white dark:hover:bg-teal-400 dark:hover:text-slate-900 transition-all shadow-sm hover:shadow-md"
              title="Subscribe on YouTube"
            >
              <Youtube size={20} />
            </a>
            <a 
              href="https://tiktok.com/@upwardease" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-eggplant hover:text-white dark:hover:bg-teal-400 dark:hover:text-slate-900 transition-all shadow-sm hover:shadow-md"
              title="Follow us on TikTok"
            >
              <Music size={20} />
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-60">
            © UpwardEase {new Date().getFullYear()}. Built for students, by students.
          </p>
          <div className="flex gap-4 text-[10px] uppercase tracking-widest opacity-40">
            <span>Privacy Policy</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
};