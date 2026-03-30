import React, { useState } from "react";
import { Sparkles, Menu, X, Sun, Moon, LogOut, AlertCircle, Heart, Bell } from "lucide-react";
import { UserType, TabType } from "../types";
import { SpotlightButton } from "./SpotlightButton";
import { Logo } from "./Logo";

export const Navbar = ({ activeTab, setActiveTab, user, onLogout, darkMode, setDarkMode, markNotificationsAsRead }: { activeTab: TabType, setActiveTab: (t: TabType) => void, user: UserType, onLogout: () => void, darkMode: boolean, setDarkMode: (m: boolean) => void, markNotificationsAsRead?: () => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = user?.notificationsList?.filter(n => !n.read).length || 0;

  const NavItem = ({ id, label }: { id: TabType, label: string }) => (
    <button 
      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
      className={`text-sm font-bold transition-all duration-200 relative py-1 group ${
        activeTab === id 
          ? "text-eggplant dark:text-teal-300" 
          : "text-slate-500 hover:text-eggplant dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      {label}
      <span className={`absolute bottom-0 left-0 h-0.5 bg-current transition-all duration-300 ${activeTab === id ? "w-full" : "w-0 group-hover:w-full opacity-50"}`}></span>
    </button>
  );

  const handleAvatarClick = () => {
    setActiveTab('profile');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
      setShowLogoutConfirm(false);
      onLogout();
  };

  return (
    <>
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${darkMode ? "bg-slate-900/90 border-slate-700" : "bg-cream/90 border-slate-200"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Logo onClick={() => setActiveTab("home")} darkMode={darkMode} />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavItem id="home" label="Who We Are" />
            
            {/* Gallery: Visible to all */}
            <NavItem id="gallery" label="Gallery" />
            
            {/* Share Story: Visible to all logged-in roles or public */}
            {(!user || user.role === 'user' || user.role === 'admin' || user.role === 'superadmin') && <NavItem id="upload" label="Share Story" />}
            
            <NavItem id="contact" label="Contact Us" />
            
            {/* Profile: Both Student and Admin */}
            {user && <NavItem id="profile" label="My Profile" />}
            
            {/* Admin Dashboard: Admin only */}
            {user && (user.role === 'admin' || user.role === 'superadmin') && <NavItem id="admin" label="Admin Dashboard" />}
          </nav>

          {/* User & Theme Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a href="https://donate.stripe.com/test" target="_blank" rel="noopener noreferrer" className="text-accent-orange font-bold text-sm hover:text-orange-600 transition-colors flex items-center gap-1 bg-accent-orange/10 px-3 py-1.5 rounded-full">
              <Heart size={16} /> Donate
            </a>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {darkMode ? <Sun size={18} /> : <Moon size={18} className="text-eggplant" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-300 dark:border-slate-700 relative">
                
                {/* Notifications Bell */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications && markNotificationsAsRead) {
                        markNotificationsAsRead();
                      }
                    }} 
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
                  >
                    <Bell size={18} className={darkMode ? "text-white" : "text-eggplant"} />
                    {unreadCount > 0 && !showNotifications && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && <span className="text-xs bg-eggplant text-white px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {!user.notificationsList || user.notificationsList.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-sm">
                            No notifications yet.
                          </div>
                        ) : (
                          user.notificationsList.map(notif => (
                            <div key={notif.id} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!notif.read ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                              <p className="text-sm text-slate-800 dark:text-slate-200">{notif.message}</p>
                              <p className="text-xs text-slate-400 mt-1">{new Date(notif.date).toLocaleDateString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right hidden lg:block">
                  <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-eggplant"}`}>{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">{user.role}</p>
                </div>
                <div 
                  className="w-8 h-8 rounded-full bg-accent-green flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={handleAvatarClick}
                  title="Go to Profile"
                >
                   {user.name.charAt(0)}
                </div>
                <button onClick={handleLogoutClick} title="Log Out" className="text-slate-400 hover:text-red-500">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <SpotlightButton 
                onClick={() => setActiveTab("login")}
                className="bg-eggplant text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-eggplant-dark transition-transform hover:-translate-y-0.5 shadow-md"
              >
                Log In
              </SpotlightButton>
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
            
            {(!user || user.role === 'user' || user.role === 'admin' || user.role === 'superadmin') && <NavItem id="upload" label="Share Story" />}
            
            <NavItem id="contact" label="Contact Us" />
            
            {user && <NavItem id="profile" label="My Profile" />}
            {user && (user.role === 'admin' || user.role === 'superadmin') && <NavItem id="admin" label="Admin Dashboard" />}
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-center">
               <a href="https://donate.stripe.com/test" target="_blank" rel="noopener noreferrer" className="text-accent-orange font-bold text-sm flex items-center gap-1">
                 <Heart size={16} /> Donate
               </a>
               <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-2 text-sm font-bold">
                  {darkMode ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
               </button>
               {!user && <button onClick={() => setActiveTab("login")} className="text-eggplant font-bold text-sm">Log In</button>}
               {user && <button onClick={handleLogoutClick} className="text-red-500 font-bold text-sm">Log Out</button>}
            </div>
          </div>
        </div>
      )}
    </header>

    {/* Logout Confirmation Modal */}
    {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <AlertCircle size={24} />
                    <h3 className="text-xl font-bold font-serif">Log Out?</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Are you sure you want to log out? You will need to sign in again to access your account.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowLogoutConfirm(false)}
                        className="flex-1 px-4 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmLogout}
                        className="flex-1 px-4 py-2 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};