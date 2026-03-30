import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { INITIAL_VIDEOS } from "./constants";
import { UserType, VideoType, AdminRequestType, ReportType, ModerationLogType, ContactMessageType, TabType } from "./types";
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
import { AboutView } from "./views/AboutView";
import { TermsView } from "./views/TermsView";
import { authService } from "./authService";

const App = () => {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [previousTab, setPreviousTab] = useState<TabType | "gallery">("gallery");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Data State
  const [videos, setVideos] = useState<VideoType[]>(INITIAL_VIDEOS);
  const [users, setUsers] = useState<NonNullable<UserType>[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminRequestType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // User interactions state (simulated session)
  const [starredByUser, setStarredByUser] = useState<Record<string, number[]>>({});
  const [historyByUser, setHistoryByUser] = useState<Record<string, number[]>>({});
  const [reports, setReports] = useState<ReportType[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLogType[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessageType[]>([]);

  const user = users.find(u => u.id === currentUserId) || null;
  const starredVideoIds = currentUserId ? (starredByUser[currentUserId] || []) : [];
  const historyVideoIds = currentUserId ? (historyByUser[currentUserId] || []) : [];

  const setStarredVideoIds = (updater: number[] | ((prev: number[]) => number[])) => {
    if (!currentUserId) return;
    setStarredByUser(prev => {
      const current = prev[currentUserId] || [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [currentUserId]: next };
    });
  };

  const setHistoryVideoIds = (updater: number[] | ((prev: number[]) => number[])) => {
    if (!currentUserId) return;
    setHistoryByUser(prev => {
      const current = prev[currentUserId] || [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [currentUserId]: next };
    });
  };

  // Persistence
  useEffect(() => {
    const initData = async () => {
      let saved = localStorage.getItem("upwardEase_state_v2");
      if (!saved) {
        saved = localStorage.getItem("upwardEase_state"); // fallback to v1
      }
      
      if (saved) {
        try {
          let parsed = JSON.parse(saved);
          
          // Normalization / Migration layer
          const normalizeUsers = (users: any[]) => {
            return users.map(u => ({
              ...u,
              role: u.role === 'student' ? 'user' : u.role
            }));
          };

          const normalizeVideos = (videos: any[]) => {
            return videos.map(v => {
              let status = v.status;
              if (status === 'needs_review') status = 'pending';
              
              return {
                ...v,
                status,
                sourceType: 'youtube',
                youtubeVideoId: v.youtubeVideoId || (v.videoUrl && v.videoUrl.includes('youtube') ? v.videoUrl.split('v=')[1] : undefined)
              };
            });
          };

          setUsers(normalizeUsers(parsed.users || []));
          setVideos(normalizeVideos(parsed.videos || INITIAL_VIDEOS));
          setAdminRequests(parsed.adminRequests || []);
          setCurrentUserId(parsed.currentUserId || null);
          setStarredByUser(parsed.starredByUser || {});
          setHistoryByUser(parsed.historyByUser || {});
          setReports(parsed.reports || []);
          setModerationLogs(parsed.moderationLogs || []);
          setContactMessages(parsed.contactMessages || []);
        } catch (e) {
          console.error("Failed to parse local storage", e);
        }
      } else {
        // Seed initial data
        const defaultPasswordHash = await authService.hashPassword("password123");
        const seedUsers: NonNullable<UserType>[] = [
          { id: "user-super", name: "Super Admin", email: "super@upwardease.org", role: "superadmin", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() },
          { id: "user-admin", name: "Admin Volunteer", email: "admin@upwardease.org", role: "admin", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() },
          { id: "user-student", name: "Alex Student", email: "student@example.com", role: "user", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() },
          { id: "user-sarah", name: "Sarah J.", email: "sarah@example.com", role: "user", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() },
          { id: "user-marcus", name: "Marcus T.", email: "marcus@example.com", role: "user", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() },
          { id: "user-emily", name: "Emily R.", email: "emily@example.com", role: "user", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() },
          { id: "user-123", name: "Alex K.", email: "alexk@example.com", role: "user", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() },
          { id: "user-jordan", name: "Jordan P.", email: "jordan@example.com", role: "user", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() },
          { id: "user-lisa", name: "Lisa M.", email: "lisa@example.com", role: "user", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() },
          { id: "user-new", name: "New User", email: "new@example.com", role: "user", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() },
          { id: "user-sam", name: "Sam D.", email: "sam@example.com", role: "user", passwordHash: defaultPasswordHash, createdAt: new Date().toISOString() }
        ];
        setUsers(seedUsers);
        setVideos(INITIAL_VIDEOS);
        setReports([{
          id: "report-1",
          submissionId: 9, // The ID of the reported video
          reportedBy: "user-student",
          reason: "Promotes unhealthy study habits",
          status: "open"
        }]);
      }
      setIsLoaded(true);
    };
    initData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("upwardEase_state_v2", JSON.stringify({
        users,
        videos,
        adminRequests,
        currentUserId,
        starredByUser,
        historyByUser,
        reports,
        moderationLogs,
        contactMessages
      }));
    }
  }, [users, videos, adminRequests, currentUserId, starredByUser, historyByUser, reports, moderationLogs, contactMessages, isLoaded]);

  // Handle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const setUser = (updater: UserType | ((prev: UserType) => UserType)) => {
    if (!currentUserId) return;
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === currentUserId) {
        const nextUser = typeof updater === 'function' ? updater(u) : updater;
        return nextUser as NonNullable<UserType>;
      }
      return u;
    }));
  };

  const addNotification = (targetUserId: string, message: string, type: 'like' | 'comment' | 'save' | 'system', linkId?: number) => {
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) return;
    
    // Respect user notification preferences, but system notifications bypass this
    if (type !== 'system' && targetUser.preferences?.notifications === false) return;

    const newNotification = {
      id: `notif-${Date.now()}`,
      type,
      message,
      date: new Date().toISOString(),
      read: false,
      linkId
    };

    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === targetUserId) {
        return {
          ...u,
          notificationsList: [newNotification, ...(u.notificationsList || [])]
        };
      }
      return u;
    }));

    // System notifications might also bypass email preferences depending on severity, 
    // but for now we'll respect the emailUpdates flag for all types.
    if (targetUser.preferences?.emailUpdates) {
      console.log(`[SIMULATED EMAIL SENT to ${targetUser.email || 'user'}]: ${message}`);
      // In a real app, this would trigger a backend email service
    }
  };

  const markNotificationsAsRead = () => {
    setUser(prev => {
      if (!prev || !prev.notificationsList) return prev;
      return {
        ...prev,
        notificationsList: prev.notificationsList.map(n => ({ ...n, read: true }))
      };
    });
  };

  const handleNavigate = (tab: TabType) => {
    if (tab === "terms" || tab === "video-detail") {
       setPreviousTab(activeTab);
    }
    setActiveTab(tab);
  };

  const handleAuthSubmit = async (payload: { identifier: string, password?: string, isRegistering: boolean, name?: string, age?: string, grade?: string, school?: string }) => {
    const identifier = payload.identifier.trim();
    const email = identifier.includes('@') ? identifier.toLowerCase() : undefined;
    const phone = !identifier.includes('@') && identifier ? identifier : undefined;

    let existingUser = users.find(u => 
      (email && u.email?.toLowerCase() === email) || (phone && u.phone === phone)
    );

    if (payload.isRegistering) {
      if (existingUser) {
        throw new Error("An account with this email or phone number already exists.");
      }
      const passwordHash = payload.password ? await authService.hashPassword(payload.password) : undefined;
      const newUser: NonNullable<UserType> = {
        id: `user-${Date.now()}`,
        name: payload.name || "New User",
        role: "user",
        email,
        phone,
        passwordHash,
        createdAt: new Date().toISOString(),
        age: payload.age,
        grade: payload.grade,
        school: payload.school,
        bio: "I'm new here!",
        preferences: { notifications: true, emailUpdates: false, privateProfile: false },
        achievements: [{
            id: "ach-1",
            title: "Early Adopter",
            icon: "🌟",
            dateEarned: new Date().toISOString().split('T')[0],
            description: "Joined UpwardEase during the beta phase."
        }]
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUserId(newUser.id);
      setActiveTab("profile");
    } else {
      if (!existingUser) {
        throw new Error("No account found with this email or phone number.");
      }
      if (payload.password && existingUser.passwordHash) {
        const isValid = await authService.verifyPassword(payload.password, existingUser.passwordHash);
        if (!isValid) {
          throw new Error("Invalid password.");
        }
      }
      setCurrentUserId(existingUser.id);
      if (existingUser.role === 'user') {
          setActiveTab("profile");
      } else {
          setActiveTab("home");
      }
    }
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setActiveTab("login");
  };

  const handleVideoClick = (id: number) => {
    setPreviousTab(activeTab);
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
      case "home": return <HomeView navigate={handleNavigate} />;
      case "upload": return <UploadView user={user} navigate={handleNavigate} videos={videos} setVideos={setVideos} />;
      case "gallery": return <GalleryView videos={videos} onVideoClick={handleVideoClick} navigate={handleNavigate} user={user} />;
      case "video-detail": 
        const video = videos.find(v => v.id === selectedVideoId);
        return video ? 
            <VideoDetailView 
                video={video} 
                user={user} 
                navigate={handleNavigate} 
                setVideos={setVideos} 
                starredVideoIds={starredVideoIds}
                setStarredVideoIds={setStarredVideoIds}
                videos={videos}
                previousTab={previousTab}
                addNotification={addNotification}
                reports={reports}
                setReports={setReports}
                moderationLogs={moderationLogs}
                setModerationLogs={setModerationLogs}
            /> : 
            <GalleryView videos={videos} onVideoClick={handleVideoClick} navigate={handleNavigate} user={user} />;
      case "contact": return <ContactView user={user} setContactMessages={setContactMessages} />;
      case "admin": return <AdminView user={user} navigate={handleNavigate} videos={videos} setVideos={setVideos} onVideoClick={handleVideoClick} adminRequests={adminRequests} setAdminRequests={setAdminRequests} users={users} setUsers={setUsers} setUser={setUser} reports={reports} setReports={setReports} moderationLogs={moderationLogs} setModerationLogs={setModerationLogs} contactMessages={contactMessages} setContactMessages={setContactMessages} addNotification={addNotification} />;
      case "profile": return <ProfileView user={user} setUser={setUser} videos={videos} setVideos={setVideos} starredVideoIds={starredVideoIds} historyVideoIds={historyVideoIds} onVideoClick={handleVideoClick} navigate={handleNavigate} adminRequests={adminRequests} setAdminRequests={setAdminRequests} />;
      case "login": return <LoginView onAuthSubmit={handleAuthSubmit} navigate={handleNavigate} />;
      case "about": return <AboutView />;
      case "terms": return <TermsView navigate={handleNavigate} previousTab={previousTab} />;
      default: return <HomeView navigate={handleNavigate} />;
    }
  };

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-cream text-slate-800"}`}>
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleNavigate} 
        user={user} 
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        markNotificationsAsRead={markNotificationsAsRead}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="flex flex-col min-h-full">
          <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
            {renderContent()}
          </div>
          <Footer navigate={handleNavigate} darkMode={darkMode} />
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);