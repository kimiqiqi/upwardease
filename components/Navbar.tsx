import React, { useState } from "react";
import { Sparkles, Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { UserType } from "../types";

export const Navbar = ({ activeTab, setActiveTab, user, onLogout, darkMode, setDarkMode }: { activeTab: string, setActiveTab: (t: any) => void, user: UserType, onLogout: () => void, darkMode: boolean, setDarkMode: (m: boolean) => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ id, label }: { id: string, label: string }) => (
    <button 
      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
      className={`text-sm font-bold transition-colors ${activeTab === id ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500 hover:text-eggplant dark:text-slate-400 dark:hover:text-white"}`}
    >
      {label}
    </button>
  );

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${darkMode ? "bg-slate-900/90 border-slate-700" : "bg-cream/90 border-slate-200"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className={`p-2 rounded-lg ${darkMode ? "bg-teal-900" : "bg-eggplant"}`}>
               <Sparkles className="w-5 h-5 text-accent-orange" />
            </div>
            <span className={`font-serif font-bold text-xl ${darkMode ? "text-white" : "text-eggplant"}`}>UpwardEase</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavItem id="home" label="Who We Are" />
            <NavItem id="gallery" label="Gallery" />
            <NavItem id="upload" label="Share Story" />
            <NavItem id="contact" label="Contact Us" />
            {user && <NavItem id="profile" label="My Page" />}
            {user && user.role === 'admin' && <NavItem id="admin" label="Admin Dashboard" />}
          </nav>

          {/* User & Theme Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {darkMode ? <Sun size={18} /> : <Moon size={18} className="text-eggplant" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-300 dark:border-slate-700">
                <div className="text-right hidden lg:block">
                  <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-eggplant"}`}>{user.name}</p>
                  <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent-green flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('profile')}>
                   {user.name.charAt(0)}
                </div>
                <button onClick={onLogout} title="Log Out" className="text-slate-400 hover:text-red-500">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab("login")}
                className="bg-eggplant text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-eggplant-dark transition-transform hover:-translate-y-0.5 shadow-md"
              >
                Log In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-eggplant dark:text-white">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden p-4 border-t ${darkMode ? "bg-slate-900 border-slate-700" : "bg-cream border-slate-200"}`}>
          <div className="flex flex-col space-y-4">
            <NavItem id="home" label="Who We Are" />
            <NavItem id="gallery" label="Gallery" />
            <NavItem id="upload" label="Share Story" />
            <NavItem id="contact" label="Contact Us" />
            {user && <NavItem id="profile" label="My Page" />}
            {user && user.role === 'admin' && <NavItem id="admin" label="Admin Dashboard" />}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-center">
               <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-2 text-sm font-bold">
                  {darkMode ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
               </button>
               {!user && <button onClick={() => setActiveTab("login")} className="text-eggplant font-bold text-sm">Log In</button>}
               {user && <button onClick={onLogout} className="text-red-500 font-bold text-sm">Log Out</button>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};