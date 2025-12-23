import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_VIDEOS } from "./constants";
import { UserType, VideoType } from "./types";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomeView } from "./views/HomeView";
import { UploadView } from "./views/UploadView";
import { GalleryView } from "./views/GalleryView";
import { VideoDetailView } from "./views/VideoDetailView";
import { ProfileView } from "./views/ProfileView";
import { ContactView } from "./views/ContactView";
import { AdminView } from "./views/AdminView";
import { LoginView } from "./views/LoginView";

const App = () => {
  const [activeTab, setActiveTab] = useState<"home" | "upload" | "gallery" | "contact" | "admin" | "login" | "video-detail" | "profile">("home");
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [user, setUser] = useState<UserType>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Data State
  const [videos, setVideos] = useState<VideoType[]>(INITIAL_VIDEOS);
  // User interactions state (simulated session)
  const [starredVideoIds, setStarredVideoIds] = useState<number[]>([]);
  const [historyVideoIds, setHistoryVideoIds] = useState<number[]>([]);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Handle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (role: "student" | "admin", name: string) => {
    // Determine ID based on role for demo persistence logic
    const id = role === 'admin' ? 'user-admin' : 'user-123';
    setUser({ id, name, role });
    setActiveTab("home");
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("login");
  };

  const handleVideoClick = (id: number) => {
    setSelectedVideoId(id);
    // Add to history if not already present
    setHistoryVideoIds(prev => {
        const newHistory = prev.filter(vid => vid !== id); // Remove if exists to move to top
        return [id, ...newHistory];
    });
    setActiveTab("video-detail");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <HomeView ai={ai} navigate={setActiveTab} />;
      case "upload": return <UploadView user={user} navigate={setActiveTab} setVideos={setVideos} />;
      case "gallery": return <GalleryView videos={videos} onVideoClick={handleVideoClick} />;
      case "video-detail": 
        const video = videos.find(v => v.id === selectedVideoId);
        return video ? 
            <VideoDetailView 
                video={video} 
                user={user} 
                navigate={setActiveTab} 
                setVideos={setVideos} 
                starredVideoIds={starredVideoIds}
                setStarredVideoIds={setStarredVideoIds}
                videos={videos}
            /> : 
            <GalleryView videos={videos} onVideoClick={handleVideoClick} />;
      case "contact": return <ContactView />;
      case "admin": return <AdminView ai={ai} user={user} navigate={setActiveTab} videos={videos} setVideos={setVideos} />;
      case "profile": return <ProfileView user={user} videos={videos} starredVideoIds={starredVideoIds} historyVideoIds={historyVideoIds} onVideoClick={handleVideoClick} navigate={setActiveTab} />;
      case "login": return <LoginView onLogin={handleLogin} navigate={setActiveTab} />;
      default: return <HomeView ai={ai} navigate={setActiveTab} />;
    }
  };

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-cream text-slate-800"}`}>
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="flex flex-col min-h-full">
          <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
            {renderContent()}
          </div>
          <Footer navigate={setActiveTab} darkMode={darkMode} />
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);