import React, { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
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
    // Update every minute to ensure accuracy if user stays on page
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className={`border-t py-12 mt-auto text-center ${darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-cream border-slate-200 text-slate-500"}`}>
      <div className="flex flex-col items-center justify-center gap-4 mb-8">
         <Logo onClick={() => navigate("home")} darkMode={darkMode} className="mb-2" />
         <p className="font-serif text-lg text-eggplant dark:text-white">{greeting}!</p>
         <ArrowDown className="text-accent-orange animate-bounce" />
      </div>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-bold mb-4 px-4">
          <button onClick={() => navigate("home")} className="hover:text-eggplant dark:hover:text-white transition-colors">Who We Are</button>
          <button onClick={() => navigate("about")} className="hover:text-eggplant dark:hover:text-white transition-colors">Our Mission</button>
          <a href="https://donate.stripe.com/test" target="_blank" rel="noopener noreferrer" className="text-accent-orange hover:text-orange-600 transition-colors">Donate</a>
          <button onClick={() => navigate("terms")} className="hover:text-eggplant dark:hover:text-white transition-colors">Terms of Service</button>
          <button onClick={() => navigate("gallery")} className="hover:text-eggplant dark:hover:text-white transition-colors">Gallery</button>
          <button onClick={() => navigate("contact")} className="hover:text-eggplant dark:hover:text-white transition-colors">Contact Us</button>
      </div>
      <p className="text-xs opacity-60">© UpwardEase {new Date().getFullYear()}. All rights reserved.</p>
    </footer>
  );
};