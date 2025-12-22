import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import {
  Sparkles,
  ShieldAlert,
  Video,
  Menu,
  X,
  Loader2,
  BookOpen,
  Upload,
  CheckCircle2,
  Heart,
  Lightbulb,
  Mail,
  Phone,
  Instagram,
  Share2,
  User,
  PlayCircle,
  Filter,
  Search,
  LogOut,
  Moon,
  Sun,
  ThumbsUp,
  Bookmark,
  MessageCircle,
  ArrowLeft,
  Send,
  Eye,
  EyeOff,
  ArrowDown,
  Quote,
  Star,
  Target,
  Check,
  Clock,
  AlertCircle,
  FileText
} from "lucide-react";

// --- Constants & System Prompts ---

const SYSTEM_INSTRUCTION = `You are the official AI assistant for UpwardEase, a nonprofit platform. Your role is strictly backend support: assisting the team in managing content safety.
If content is unsafe, output: "This content includes potentially sensitive emotional expressions. Recommend admin review before publishing."
If the content is safe and supportive, output: "Content appears safe and aligns with community guidelines."`;

const TOPIC_SYSTEM_PROMPT = `You are the UpwardEase Featured Topic Assistant. Your job is to generate a weekly study or mental health topic for students (e.g., Exam Stress, Time Management, Motivation) and a fun, lighthearted multiple-choice poll related to it.
Return the result in JSON format:
{
  "topicTitle": "Short, catchy title",
  "topicDescription": "2-3 sentences explaining why this matters.",
  "pollQuestion": "A fun question related to the topic",
  "pollOptions": ["Option A", "Option B", "Option C"]
}
Keep it non-political, safe, and encouraging.`;

// --- Mock Data ---

// Added status, feedback, uploaderId, and likedBy for new functionality
const INITIAL_VIDEOS = [
  { id: 1, title: "How I organize my notes for Finals", author: "Sarah J.", uploaderId: "user-sarah", grade: "11th Grade", views: 120, category: "Study Tips", color: "bg-pink-100", likes: 45, likedBy: ["user-2"], comments: [], status: "approved", feedback: "" },
  { id: 2, title: "Dealing with pre-exam anxiety", author: "Marcus T.", uploaderId: "user-marcus", grade: "College Freshman", views: 85, category: "Mental Health", color: "bg-blue-100", likes: 32, likedBy: ["user-1"], comments: [], status: "approved", feedback: "" },
  { id: 3, title: "Pomodoro technique explained", author: "Emily R.", uploaderId: "user-emily", grade: "10th Grade", views: 230, category: "Productivity", color: "bg-amber-100", likes: 112, likedBy: [], comments: [], status: "approved", feedback: "" },
  { id: 4, title: "My morning routine before school", author: "Alex K.", uploaderId: "user-123", grade: "12th Grade", views: 95, category: "Motivation", color: "bg-green-100", likes: 28, likedBy: [], comments: [], status: "approved", feedback: "" },
  { id: 5, title: "Chemistry hacks that saved me", author: "Jordan P.", uploaderId: "user-jordan", grade: "College Sophomore", views: 310, category: "Exam Prep", color: "bg-purple-100", likes: 150, likedBy: [], comments: [], status: "approved", feedback: "" },
  { id: 6, title: "It's okay to take a break", author: "Lisa M.", uploaderId: "user-lisa", grade: "8th Grade", views: 150, category: "Mental Health", color: "bg-teal-100", likes: 67, likedBy: [], comments: [], status: "approved", feedback: "" },
  // A pending video for demo purposes
  { id: 7, title: "Why I almost quit", author: "New User", uploaderId: "user-new", grade: "9th Grade", views: 0, category: "Mental Health", color: "bg-red-100", likes: 0, likedBy: [], comments: [], status: "pending", feedback: "" },
  // A rejected video for demo purposes (owned by current user user-123)
  { id: 8, title: "Rant about my teacher", author: "Alex K.", uploaderId: "user-123", grade: "12th Grade", views: 0, category: "Mental Health", color: "bg-gray-100", likes: 0, likedBy: [], comments: [], status: "rejected", feedback: "Content violates community guidelines: Specifically targeting individuals is not allowed." },
];

const REVIEWS = [
  {
    id: 1,
    text: "Before I found UpwardEase, I struggled with exam anxiety and felt like no one understood the pressure. Seeing other students share their struggles and strategies made me realize I wasn't alone. It's the only place I feel safe venting about school.",
    author: "Hannah",
    role: "High School Junior",
    color: "bg-yellow-100"
  },
  {
    id: 2,
    text: "I want to create and nurture an environment where people are lifting each other up. UpwardEase enables candid and genuine conversations in a safe place where we can feel comfortable sharing, especially when talking about burnout.",
    author: "Olivia",
    role: "College Freshman",
    color: "bg-red-100"
  },
  {
    id: 3,
    text: "Finding study hacks here saved my GPA, but the community saved my sanity. It's thoughtful by nature and truly helpful by design. I love that we can release pressure without judgment.",
    author: "Marcus",
    role: "12th Grade Student",
    color: "bg-blue-100"
  }
];

// --- Types ---

type UserType = {
  id: string;
  name: string;
  role: "student" | "admin";
} | null;

type VideoType = typeof INITIAL_VIDEOS[0];

// --- Sub-Components ---

const Navbar = ({ activeTab, setActiveTab, user, onLogout, darkMode, setDarkMode }: any) => {
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

const Footer = ({ navigate, darkMode }: { navigate: (tab: any) => void, darkMode: boolean }) => (
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

const LoginView = ({ onLogin, navigate }: { onLogin: (role: "student" | "admin", name: string) => void, navigate: any }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<"student" | "admin">("student");
  
  // Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation Regex
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  const validate = () => {
    setError(null);
    if (!identifier) return "Email or Phone is required.";
    if (isRegistering) {
       if (!passwordRegex.test(password)) {
         return "Password must be at least 8 characters, contain 1 uppercase letter, and 1 special character.";
       }
       if (password !== confirmPassword) {
         return "Passwords do not match.";
       }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Simulate login logic
    const name = role === "student" ? (isRegistering ? "New Student" : "Alex Student") : "Admin Volunteer";
    onLogin(role, name);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-serif font-bold text-eggplant dark:text-white mb-2">
             {isRegistering ? "Join the Community" : "Welcome Back"}
           </h2>
           <p className="text-slate-500 text-sm">
             {isRegistering ? "Create an account to start sharing." : "Log in to access your dashboard."}
           </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setRole("student")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === "student" ? "bg-white dark:bg-slate-600 text-eggplant dark:text-teal-200 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            Student
          </button>
          <button 
            onClick={() => setRole("admin")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === "admin" ? "bg-white dark:bg-slate-600 text-eggplant dark:text-teal-200 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            Admin / Volunteer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              {role === "student" ? "Email or Phone Number" : "Admin Email"}
            </label>
            <input 
              type="text" 
              required 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-eggplant outline-none transition-all dark:text-white"
              placeholder={role === "student" ? "you@example.com" : "admin@upwardease.org"}
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-eggplant outline-none transition-all dark:text-white pr-10"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-eggplant">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isRegistering && (
             <div className="relative">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-eggplant outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                />
             </div>
          )}

          {error && (
            <div className="text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-100 flex items-start gap-2">
              <ShieldAlert size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-eggplant text-white py-3.5 rounded-xl font-bold hover:bg-eggplant-dark transition-all shadow-md mt-4"
          >
            {isRegistering ? "Create Account" : "Log In"}
          </button>
        </form>

        <div className="text-center mt-6">
           <p className="text-sm text-slate-400">
             {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
             <button 
               onClick={() => { setIsRegistering(!isRegistering); setError(null); }} 
               className="text-eggplant dark:text-teal-400 font-bold hover:underline"
             >
               {isRegistering ? "Log In" : "Sign Up"}
             </button>
           </p>
        </div>
      </div>
    </div>
  );
};

const MissionSection = () => {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-16 border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden relative">
      <div className="flex flex-col md:flex-row items-center gap-12">
         {/* Illustration Mockup */}
         <div className="flex-1 relative w-full flex justify-center">
            <div className="w-80 h-80 bg-cream dark:bg-slate-700 rounded-full flex items-center justify-center relative">
               <div className="absolute inset-0 border-2 border-dashed border-eggplant/20 dark:border-teal-400/20 rounded-full animate-spin-slow" />
               <div className="flex flex-col gap-4">
                  <div className="bg-accent-green p-4 rounded-xl text-white transform -translate-x-8 hover:scale-110 transition-transform shadow-lg">
                     <Target size={32} />
                  </div>
                  <div className="bg-accent-orange p-4 rounded-xl text-white transform translate-x-8 hover:scale-110 transition-transform shadow-lg">
                     <Star size={32} />
                  </div>
                  <div className="bg-eggplant p-4 rounded-xl text-white transform -translate-x-4 hover:scale-110 transition-transform shadow-lg">
                     <Heart size={32} />
                  </div>
               </div>
               <div className="absolute top-0 -right-4">
                  <Sparkles className="text-yellow-400 w-8 h-8 animate-pulse" fill="currentColor" />
               </div>
            </div>
         </div>

         <div className="flex-1 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-slate-800 dark:text-white">Our Mission</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
               We are a nonprofit on a mission to create a safe digital environment where students can vent about academic pressure and share strategies for success. 
               We bridge the gap between stress and support so that all students have an equal opportunity to achieve mental well-being and academic upward mobility.
            </p>
            <button className="text-eggplant dark:text-teal-400 font-bold border-b-2 border-eggplant dark:border-teal-400 hover:opacity-80 transition-opacity uppercase text-sm tracking-wider pb-1">
               Explore Our Mission
            </button>
         </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const review = REVIEWS[currentIndex];

  return (
    <section className="py-12">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
           Our students love us <span className="text-3xl">😍</span>
        </h2>
      </div>

      <div className="max-w-4xl mx-auto px-4">
         <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-[0px_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 relative transition-all duration-500">
             <Quote className="text-eggplant/10 dark:text-white/10 w-24 h-24 absolute top-4 left-4 -z-0" fill="currentColor" />
             
             <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="flex-1 space-y-6">
                   <p className="text-xl md:text-2xl font-serif text-slate-700 dark:text-slate-200 italic leading-relaxed">
                     "{review.text}"
                   </p>
                   <div>
                      <p className="font-bold text-eggplant dark:text-white text-lg">- {review.author}</p>
                      <p className="text-slate-500 text-sm uppercase tracking-wide">{review.role}</p>
                   </div>
                </div>
                
                <div className="flex-shrink-0">
                   <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full ${review.color} flex items-center justify-center border-4 border-white dark:border-slate-600 shadow-lg`}>
                      <User size={64} className="text-slate-700 opacity-50" />
                   </div>
                </div>
             </div>

             {/* Indicators */}
             <div className="flex justify-center gap-2 mt-8">
               {REVIEWS.map((_, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setCurrentIndex(idx)}
                   className={`w-3 h-3 rounded-full transition-colors ${idx === currentIndex ? "bg-eggplant dark:bg-teal-400" : "bg-slate-200 dark:bg-slate-600"}`}
                 />
               ))}
             </div>
         </div>
      </div>
    </section>
  );
};

const HomeView = ({ ai, navigate }: { ai: GoogleGenAI, navigate: (tab: any) => void }) => {
  const [topicData, setTopicData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pollSelection, setPollSelection] = useState<number | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: "Generate this week's featured topic and poll.",
          config: { 
            systemInstruction: TOPIC_SYSTEM_PROMPT,
            responseMimeType: "application/json"
          }
        });
        const json = JSON.parse(response.text);
        setTopicData(json);
      } catch (e) {
        console.error(e);
        // Fallback
        setTopicData({
          topicTitle: "Balancing Study & Sleep",
          topicDescription: "This week we're exploring how to get enough rest while keeping up with coursework. Share your routine!",
          pollQuestion: "What is your biggest sleep disruptor?",
          pollOptions: ["Late night scrolling", "Exam anxiety", "Caffeine", "Just not tired"]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, []);

  return (
    <div className="space-y-24 pt-8">
      
      {/* HERO SECTION (Reference Design) */}
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
         <div className="flex-1 space-y-8">
            <h1 className="font-serif text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight">
               Overwhelmed by school.<br/>
               <span className="text-eggplant dark:text-teal-300">Supported by peers.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
               We build a digital space designed to let students share ideas about school and release pressure. Find your balance today.
            </p>
            <button onClick={() => navigate("home")} className="bg-eggplant text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-eggplant-dark transition-all flex items-center gap-2 group">
               Curious how we help? <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
         </div>

         {/* Illustration Mock */}
         <div className="flex-1 relative">
            <div className="absolute top-0 right-10 text-accent-green animate-bounce">
               <svg width="50" height="50" viewBox="0 0 100 100"><path d="M10,50 Q50,10 90,50 T90,90" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </div>
            <div className="bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-600 rounded-3xl p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] relative z-10">
               <div className="flex items-center gap-4 mb-6 border-b pb-4 border-slate-100 dark:border-slate-700">
                  <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                     <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-32"></div>
               </div>
               <div className="flex gap-8 items-end">
                  <div className="space-y-4 flex-1">
                     <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
                     <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
                     <div className="h-32 bg-accent-green/20 rounded-xl flex items-center justify-center">
                        <Video className="text-accent-green w-12 h-12" />
                     </div>
                  </div>
                  <div className="w-24 h-24 bg-accent-orange/20 rounded-full flex items-center justify-center relative">
                     <Heart className="text-accent-orange w-10 h-10 animate-pulse" fill="currentColor" />
                     <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm border">
                        <ThumbsUp size={14} className="text-eggplant dark:text-white" />
                     </div>
                  </div>
               </div>
            </div>
            {/* Simple Line Illustration behind */}
            <svg className="absolute -bottom-10 -left-10 z-0 text-slate-300 dark:text-slate-700" width="200" height="200" viewBox="0 0 200 200">
               <path d="M0,100 C50,200 150,0 200,100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
         </div>
      </div>

      {/* MISSION SECTION */}
      <MissionSection />

      {/* USER REVIEWS */}
      <TestimonialsSection />

      {/* WEEKLY FEATURED TOPIC */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-16 border border-slate-100 dark:border-slate-700 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-accent-orange/20 text-accent-orange px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
              Weekly Focus
            </div>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-5/6"></div>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{topicData?.topicTitle}</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{topicData?.topicDescription}</p>
                <div className="bg-cream dark:bg-slate-900 p-6 rounded-2xl inline-flex items-start gap-4 border border-slate-100 dark:border-slate-700">
                   <div className="bg-yellow-100 p-2 rounded-full">
                      <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0"/>
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-800 dark:text-white text-lg font-serif">Have a tip?</h4>
                     <p className="text-slate-600 dark:text-slate-400">This topic affects us all. <span className="font-bold text-eggplant dark:text-teal-400 cursor-pointer hover:underline" onClick={() => navigate("upload")}>Upload a video</span> to share your experience!</p>
                   </div>
                </div>
              </>
            )}
          </div>
          
          {/* POLL CARD */}
          <div className="w-full lg:w-1/3 bg-cream dark:bg-slate-900 rounded-2xl shadow-inner p-8 border border-slate-100 dark:border-slate-700 relative">
             <div className="absolute -top-3 -right-3 bg-accent-green text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm transform rotate-6">
               Voice Your Opinion
             </div>
             {loading ? (
               <div className="flex items-center justify-center h-48 text-slate-400">
                 <Loader2 className="animate-spin mr-2"/> Loading poll...
               </div>
             ) : (
               <>
                 <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 font-serif">{topicData?.pollQuestion}</h3>
                 <div className="space-y-3">
                   {topicData?.pollOptions?.map((opt: string, idx: number) => (
                     <button 
                       key={idx}
                       onClick={() => setPollSelection(idx)}
                       className={`w-full text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden font-bold ${
                         pollSelection === idx 
                           ? "bg-white dark:bg-slate-800 border-eggplant text-eggplant dark:text-teal-300 dark:border-teal-300" 
                           : "bg-white dark:bg-slate-800 border-transparent hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-300"
                       }`}
                     >
                       <span className="relative z-10 flex items-center justify-between">
                         {opt}
                         {pollSelection === idx && <CheckCircle2 className="w-5 h-5"/>}
                       </span>
                     </button>
                   ))}
                 </div>
               </>
             )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="text-center max-w-5xl mx-auto pb-12">
        <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mb-16">How UpwardEase Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { icon: <Video className="w-8 h-8 text-eggplant dark:text-teal-300" />, title: "Record", text: "Film a short video sharing a study tip or how you cope with stress." },
             { icon: <Upload className="w-8 h-8 text-eggplant dark:text-teal-300" />, title: "Upload", text: "Submit your video. Our team reviews it to ensure a safe environment." },
             { icon: <Heart className="w-8 h-8 text-eggplant dark:text-teal-300" />, title: "Support", text: "Your video helps other students feel less alone and more prepared." }
           ].map((item, i) => (
             <div key={i} className="bg-transparent p-6 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-colors group">
               <div className="w-20 h-20 bg-cream dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-slate-100 dark:border-slate-600 group-hover:scale-110 transition-transform">
                 {item.icon}
               </div>
               <h3 className="text-xl font-bold font-serif text-slate-800 dark:text-white mb-3">{item.title}</h3>
               <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.text}</p>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};

// --- Upload View ---

const UploadView = ({ user, navigate, setVideos }: { user: UserType, navigate: any, setVideos: any }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add new pending video
    const newVideo = {
      id: Date.now(),
      title,
      author: user.name,
      uploaderId: user.id,
      grade: "Student", // Simplified for demo
      views: 0,
      category: "Mental Health", // Simplified for demo
      color: "bg-gray-100",
      likes: 0,
      likedBy: [],
      comments: [],
      status: "pending",
      feedback: ""
    };
    
    setVideos((prev: any) => [...prev, newVideo]);
    setUploading(false);
    navigate("profile"); // Redirect to profile to see pending status
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6">
         <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
            <User size={48} className="text-slate-400" />
         </div>
         <h2 className="text-2xl font-serif font-bold dark:text-white">Please Login to Share</h2>
         <p className="text-slate-500 dark:text-slate-400 max-w-md">You need to be a member of our community to upload videos. This helps us keep the space safe for everyone.</p>
         <button onClick={() => navigate("login")} className="bg-eggplant text-white px-6 py-3 rounded-full font-bold">Log In Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
        <h2 className="text-3xl font-serif font-bold text-eggplant dark:text-white mb-6">Share Your Story</h2>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 text-sm text-blue-800 flex gap-2">
            <AlertCircle size={20} className="shrink-0" />
            <p>All uploads are reviewed by our volunteer admins to ensure a safe environment. Your video will appear as "Pending" until approved.</p>
        </div>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
             <Upload size={48} className="text-slate-300 dark:text-slate-500 mb-4" />
             <p className="font-bold text-slate-700 dark:text-slate-300">Drag and drop your video here</p>
             <p className="text-sm text-slate-400 mt-2">MP4, WebM up to 50MB</p>
             <button type="button" className="mt-6 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-200">Select File</button>
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-eggplant" placeholder="e.g. My study routine" />
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
             <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-eggplant" placeholder="Tell us about your video..." />
          </div>

          <button disabled={uploading} className="w-full bg-eggplant text-white py-4 rounded-xl font-bold hover:bg-eggplant-dark transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {uploading ? <><Loader2 className="animate-spin"/> Uploading...</> : "Submit for Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Gallery View ---

const GalleryView = ({ videos, onVideoClick }: { videos: VideoType[], onVideoClick: (id: number) => void }) => {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Study Tips", "Mental Health", "Productivity", "Motivation", "Exam Prep"];

  // Only show approved videos in the gallery
  const approvedVideos = videos.filter(v => v.status === 'approved');
  const filteredVideos = filter === "All" ? approvedVideos : approvedVideos.filter(v => v.category === filter);

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Community Gallery</h2>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
             {categories.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setFilter(cat)}
                 className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === cat ? "bg-eggplant text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
               >
                 {cat}
               </button>
             ))}
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
             <div key={video.id} onClick={() => onVideoClick(video.id)} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-slate-100 dark:border-slate-700">
                <div className={`aspect-video ${video.color} relative flex items-center justify-center`}>
                   <PlayCircle size={48} className="text-slate-900/50 group-hover:scale-110 transition-transform" />
                   <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      {video.views} views
                   </div>
                </div>
                <div className="p-5">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-eggplant dark:text-teal-400 uppercase tracking-wide">{video.category}</span>
                   </div>
                   <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">{video.title}</h3>
                   <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                      <span>{video.author}</span>
                      <span>{video.grade}</span>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

// --- Video Detail View ---

const VideoDetailView = ({ 
  video, 
  user, 
  navigate, 
  setVideos, 
  starredVideoIds, 
  setStarredVideoIds 
}: { 
  video: VideoType, 
  user: UserType, 
  navigate: any, 
  setVideos: any,
  starredVideoIds: number[],
  setStarredVideoIds: any
}) => {
  const [comment, setComment] = useState("");
  
  const isLiked = user && video.likedBy?.includes(user.id);
  const isStarred = starredVideoIds.includes(video.id);

  const handleLike = () => {
    if (!user) {
        navigate("login");
        return;
    }
    if (isLiked) return; // Prevent double like

    setVideos((prev: VideoType[]) => prev.map(v => 
        v.id === video.id 
        ? { ...v, likes: v.likes + 1, likedBy: [...(v.likedBy || []), user.id] } 
        : v
    ));
  };

  const handleToggleStar = () => {
      if (!user) {
          navigate("login");
          return;
      }
      if (isStarred) {
          setStarredVideoIds((prev: number[]) => prev.filter(id => id !== video.id));
      } else {
          setStarredVideoIds((prev: number[]) => [...prev, video.id]);
      }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComment("");
  };

  return (
    <div className="max-w-5xl mx-auto">
       <button onClick={() => navigate("gallery")} className="flex items-center gap-2 text-slate-500 hover:text-eggplant dark:text-slate-400 dark:hover:text-white mb-6 font-bold">
         <ArrowLeft size={20} /> Back to Gallery
       </button>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <div className={`aspect-video ${video.color} rounded-3xl flex items-center justify-center shadow-lg relative`}>
                <PlayCircle size={80} className="text-slate-900/50" />
                {user && (
                    <button 
                        onClick={handleToggleStar}
                        className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-colors ${isStarred ? "bg-yellow-400 text-white" : "bg-black/30 text-white hover:bg-black/50"}`}
                    >
                        <Star size={24} fill={isStarred ? "currentColor" : "none"} />
                    </button>
                )}
             </div>
             
             <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">{video.title}</h1>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-white">
                         {video.author.charAt(0)}
                      </div>
                      <div>
                         <p className="font-bold text-slate-900 dark:text-white">{video.author}</p>
                         <p className="text-xs text-slate-500">{video.grade}</p>
                      </div>
                   </div>
                   <button 
                    onClick={handleLike} 
                    disabled={!!isLiked}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${
                        isLiked 
                        ? "bg-red-100 text-red-500 cursor-default" 
                        : "bg-slate-100 dark:bg-slate-700 text-eggplant dark:text-white hover:bg-eggplant hover:text-white"
                    }`}>
                      <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> {video.likes} Likes
                   </button>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Comments</h3>
                {user ? (
                   <form onSubmit={handlePostComment} className="flex gap-4 mb-8">
                      <div className="w-10 h-10 rounded-full bg-accent-green flex-shrink-0 flex items-center justify-center text-white font-bold">{user.name.charAt(0)}</div>
                      <div className="flex-1 relative">
                         <input 
                           type="text" 
                           value={comment}
                           onChange={(e) => setComment(e.target.value)}
                           className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-eggplant dark:text-white"
                           placeholder="Add a supportive comment..."
                         />
                         <button type="submit" className="absolute right-2 top-2 p-1 text-eggplant dark:text-teal-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                            <Send size={20} />
                         </button>
                      </div>
                   </form>
                ) : (
                   <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center text-sm text-slate-500 mb-6">
                      Please <button onClick={() => navigate("login")} className="text-eggplant font-bold underline">log in</button> to join the conversation.
                   </div>
                )}
                <div className="text-center text-slate-400 py-8">
                   No comments yet. Be the first to share some love!
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Related Videos</h3>
                <div className="space-y-4">
                   {INITIAL_VIDEOS.filter(v => v.id !== video.id && v.status === 'approved').slice(0, 3).map(v => (
                      <div key={v.id} className="flex gap-3 cursor-pointer group" onClick={() => navigate("gallery")}> 
                         <div className={`w-24 h-16 ${v.color} rounded-lg flex-shrink-0`}></div>
                         <div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-2 group-hover:text-eggplant transition-colors">{v.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{v.author}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- Profile View ---

const ProfileView = ({ user, videos, starredVideoIds, historyVideoIds, onVideoClick }: { user: UserType, videos: VideoType[], starredVideoIds: number[], historyVideoIds: number[], onVideoClick: (id: number) => void }) => {
    const [tab, setTab] = useState<"uploads" | "favorites" | "history">("uploads");

    if (!user) return null;

    const myUploads = videos.filter(v => v.uploaderId === user.id);
    const myFavorites = videos.filter(v => starredVideoIds.includes(v.id));
    const myHistory = videos.filter(v => historyVideoIds.includes(v.id));

    const VideoList = ({ items, showStatus }: { items: VideoType[], showStatus?: boolean }) => {
        if (items.length === 0) return <div className="text-center py-12 text-slate-500">No videos found.</div>;
        
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(video => (
                    <div key={video.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                        <div onClick={() => video.status === 'approved' && onVideoClick(video.id)} className={`aspect-video ${video.color} relative flex items-center justify-center ${video.status === 'approved' ? 'cursor-pointer' : 'opacity-75'}`}>
                            <PlayCircle size={48} className="text-slate-900/50" />
                            {showStatus && (
                                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold uppercase ${
                                    video.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    video.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {video.status}
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{video.title}</h3>
                            <p className="text-xs text-slate-500">{video.views} views</p>
                            
                            {showStatus && video.status === 'rejected' && video.feedback && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900 text-xs">
                                    <p className="font-bold text-red-800 dark:text-red-400 mb-1">Admin Feedback:</p>
                                    <p className="text-red-700 dark:text-red-300">{video.feedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-accent-green flex items-center justify-center text-white text-3xl font-serif font-bold">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">My Page</h2>
                    <p className="text-slate-500">{user.role === 'admin' ? 'Admin / Volunteer' : 'Student Member'}</p>
                </div>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700 flex gap-6">
                <button onClick={() => setTab("uploads")} className={`pb-3 font-bold text-sm ${tab === "uploads" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500"}`}>My Uploads</button>
                <button onClick={() => setTab("favorites")} className={`pb-3 font-bold text-sm ${tab === "favorites" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500"}`}>Favorites</button>
                <button onClick={() => setTab("history")} className={`pb-3 font-bold text-sm ${tab === "history" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500"}`}>Watch History</button>
            </div>

            {tab === "uploads" && (
                <div>
                     <div className="mb-6 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                           <p className="font-bold mb-1">Upload Status Guide</p>
                           <ul className="list-disc pl-4 space-y-1">
                               <li><span className="text-green-600 font-bold">Approved:</span> Visible to everyone in the gallery.</li>
                               <li><span className="text-yellow-600 font-bold">Pending:</span> Currently being reviewed by our volunteers.</li>
                               <li><span className="text-red-600 font-bold">Rejected:</span> Does not meet guidelines. See feedback for details.</li>
                           </ul>
                        </div>
                     </div>
                    <VideoList items={myUploads} showStatus={true} />
                </div>
            )}
            {tab === "favorites" && <VideoList items={myFavorites} />}
            {tab === "history" && <VideoList items={myHistory} />}
        </div>
    );
};

// --- Contact View ---

const ContactView = () => {
  return (
    <div className="max-w-2xl mx-auto py-12">
       <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">Get in Touch</h2>
          <p className="text-slate-600 dark:text-slate-300">Have questions or need support? We're here to help.</p>
       </div>

       <div className="grid gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-6">
             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Mail size={32} />
             </div>
             <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Email Us</h3>
                <p className="text-slate-500 mb-1">For general inquiries and support</p>
                <a href="mailto:hello@upwardease.org" className="text-eggplant dark:text-teal-400 font-bold hover:underline">hello@upwardease.org</a>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-6">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Phone size={32} />
             </div>
             <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Crisis Helpline</h3>
                <p className="text-slate-500 mb-1">Available 24/7 for urgent support</p>
                <a href="tel:988" className="text-eggplant dark:text-teal-400 font-bold hover:underline">Dial 988</a>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- Admin View ---

const AdminView = ({ ai, user, navigate, videos, setVideos }: { ai: GoogleGenAI, user: UserType, navigate: any, videos: VideoType[], setVideos: any }) => {
  const [contentToCheck, setContentToCheck] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("home");
    }
  }, [user, navigate]);

  const handleCheckSafety = async () => {
    if (!contentToCheck) return;
    setChecking(true);
    setFeedback(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Review this content: "${contentToCheck}"`,
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      setFeedback(response.text);
    } catch (e) {
      console.error(e);
      setFeedback("Error checking content. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleVerdict = (id: number, status: 'approved' | 'rejected') => {
      setVideos((prev: VideoType[]) => prev.map(v => 
          v.id === id 
          ? { ...v, status, feedback: status === 'rejected' ? rejectReason : "" } 
          : v
      ));
      setRejectReason("");
      setSelectedReviewId(null);
  };

  if (!user || user.role !== "admin") return null;

  const pendingVideos = videos.filter(v => v.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto py-8">
       <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <ShieldAlert className="text-eggplant dark:text-teal-300" /> Admin Dashboard
            </h2>
            <span className="bg-eggplant text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Volunteer Mode</span>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: PENDING REVIEWS */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
                <Clock className="text-yellow-500"/> Review Queue ({pendingVideos.length})
            </h3>
            
            {pendingVideos.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center text-slate-500 border border-slate-200 dark:border-slate-700">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500"/>
                    <p>All caught up! No pending videos.</p>
                </div>
            ) : (
                pendingVideos.map(video => (
                    <div key={video.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex gap-4 mb-4">
                            <div className={`w-32 h-20 ${video.color} rounded-lg flex items-center justify-center shrink-0`}>
                                <Video className="text-slate-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg dark:text-white">{video.title}</h4>
                                <p className="text-sm text-slate-500">by {video.author} • {video.grade}</p>
                                <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-bold uppercase">Pending Review</span>
                            </div>
                        </div>

                        {selectedReviewId === video.id ? (
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm font-bold mb-2 dark:text-white">Review Action:</p>
                                <textarea 
                                    className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 mb-3 text-sm dark:bg-slate-800 dark:text-white"
                                    placeholder="Reason for rejection (required if rejecting)..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleVerdict(video.id, 'rejected')}
                                        disabled={!rejectReason}
                                        className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-bold hover:bg-red-200 disabled:opacity-50 text-sm"
                                    >
                                        Reject Video
                                    </button>
                                    <button 
                                        onClick={() => setSelectedReviewId(null)}
                                        className="px-4 py-2 text-slate-500 font-bold hover:text-slate-700 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleVerdict(video.id, 'approved')}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 text-sm flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={16} /> Approve
                                </button>
                                <button 
                                    onClick={() => setSelectedReviewId(video.id)}
                                    className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg font-bold hover:bg-red-100 text-sm flex items-center justify-center gap-2"
                                >
                                    <X size={16} /> Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
          </div>

          {/* RIGHT: AI TOOLS */}
          <div className="space-y-6">
             <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
                <Sparkles className="text-eggplant dark:text-teal-300"/> AI Content Assist
             </h3>
             
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <h4 className="font-bold text-sm mb-2 dark:text-white">Pre-screen Text Content</h4>
                <p className="text-xs text-slate-500 mb-4">Paste video transcripts or descriptions here to detect potential violations before manual review.</p>
                
                <textarea 
                  value={contentToCheck}
                  onChange={(e) => setContentToCheck(e.target.value)}
                  className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white mb-4 text-sm resize-none"
                  placeholder="Paste text here..."
                />
                
                <button 
                  onClick={handleCheckSafety}
                  disabled={checking || !contentToCheck}
                  className="w-full bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 transition-colors"
                >
                  {checking ? "Analyzing..." : "Analyze Safety"}
                </button>

                {feedback && (
                  <div className={`mt-6 p-4 rounded-xl border text-sm ${feedback.includes("unsafe") || feedback.includes("sensitive") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                      <h4 className="font-bold mb-1 flex items-center gap-2">
                        {feedback.includes("unsafe") || feedback.includes("sensitive") ? <ShieldAlert size={16}/> : <CheckCircle2 size={16}/>}
                        AI Assessment:
                      </h4>
                      {feedback}
                  </div>
                )}
             </div>
          </div>

       </div>
    </div>
  );
};

// --- Main App Component ---

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
            /> : 
            <GalleryView videos={videos} onVideoClick={handleVideoClick} />;
      case "contact": return <ContactView />;
      case "admin": return <AdminView ai={ai} user={user} navigate={setActiveTab} videos={videos} setVideos={setVideos} />;
      case "profile": return <ProfileView user={user} videos={videos} starredVideoIds={starredVideoIds} historyVideoIds={historyVideoIds} onVideoClick={handleVideoClick} />;
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