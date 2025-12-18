import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  GoogleGenAI,
  Type,
  LiveServerMessage,
  Modality,
  Blob,
  Chat,
  GenerateContentResponse
} from "@google/genai";
import {
  Mic,
  MicOff,
  Send,
  Image as ImageIcon,
  MapPin,
  Search,
  Sparkles,
  ShieldAlert,
  Edit,
  Video,
  Menu,
  X,
  Loader2,
  BookOpen,
  BrainCircuit,
  Camera,
  Wand2,
  Globe,
  Navigation,
  Heart,
  Lightbulb,
  Upload,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

// --- Constants & System Prompts ---

const SYSTEM_INSTRUCTION = `You are the official AI assistant for UpwardEase, a nonprofit platform designed to help students share their stress-coping experiences through video submissions. Your primary mission is to empower students with emotional support, help them express their stories clearly, and assist the UpwardEase team in managing content safely and compassionately.

1. Your Role
- Act as a supportive, non-clinical guide that helps students reflect on their experiences.
- Provide emotionally safe, encouraging, and age-appropriate communication.
- Generate clear, structured, positive written outputs related to video submissions, coping methods, and featured topics.

2. Platform Description
- Video Submission Area: Students upload stress-coping videos.
- Video Gallery: Admin-approved videos.
- Weekly Featured Topic: Highlights one mental-health-related theme.

3. Safety & Ethics
Ensure supportive tone, no harmful advice, no moral judgment, no diagnosis. If content is unsafe, output: "This content includes potentially sensitive emotional expressions. Recommend admin review before publishing."`;

const TOPIC_SYSTEM_PROMPT = `You are the UpwardEase Featured Topic Assistant. Your job is to generate a weekly study or mental health topic for students (e.g., Exam Stress, Time Management, Motivation) and a fun, lighthearted multiple-choice poll related to it.
Return the result in JSON format:
{
  "topicTitle": "Short, catchy title",
  "topicDescription": "2-3 sentences explaining why this matters.",
  "pollQuestion": "A fun question related to the topic",
  "pollOptions": ["Option A", "Option B", "Option C"]
}
Keep it non-political, safe, and encouraging.`;

// --- Utility Functions ---

function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  });
}

// Audio helpers for Live API
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Components ---

const App = () => {
  const [activeTab, setActiveTab] = useState<"home" | "student" | "admin" | "studio" | "live" | "resources">("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Always use standard API key init
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <HomeView ai={ai} navigate={setActiveTab} />;
      case "student": return <StudentView ai={ai} />;
      case "admin": return <AdminView ai={ai} />;
      case "studio": return <StudioView ai={ai} />;
      case "live": return <LiveView ai={ai} />;
      case "resources": return <ResourcesView ai={ai} />;
      default: return <HomeView ai={ai} navigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-teal-900 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 flex flex-col shadow-2xl`}>
        <div className="p-8 flex justify-between items-center border-b border-teal-800">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-teal-900" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">UpwardEase</h1>
              <p className="text-xs text-teal-200 opacity-80">Student Community</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-teal-200 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Platform</p>
          <NavButton active={activeTab === "home"} onClick={() => { setActiveTab("home"); setSidebarOpen(false); }} icon={<BookOpen size={20} />} label="Home & Topics" />
          <NavButton active={activeTab === "resources"} onClick={() => { setActiveTab("resources"); setSidebarOpen(false); }} icon={<Globe size={20} />} label="Find Resources" />
          
          <p className="px-4 text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 mt-8">Tools</p>
          <NavButton active={activeTab === "student"} onClick={() => { setActiveTab("student"); setSidebarOpen(false); }} icon={<BrainCircuit size={20} />} label="AI Writing Helper" />
          <NavButton active={activeTab === "live"} onClick={() => { setActiveTab("live"); setSidebarOpen(false); }} icon={<Mic size={20} />} label="Live Support" />
          <NavButton active={activeTab === "studio"} onClick={() => { setActiveTab("studio"); setSidebarOpen(false); }} icon={<ImageIcon size={20} />} label="Creative Studio" />
          
          <p className="px-4 text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 mt-8">Staff</p>
          <NavButton active={activeTab === "admin"} onClick={() => { setActiveTab("admin"); setSidebarOpen(false); }} icon={<ShieldAlert size={20} />} label="Admin Console" />
        </nav>

        <div className="p-6 border-t border-teal-800">
           <div className="flex items-center gap-3 p-3 bg-teal-800 rounded-xl">
             <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
               <span className="font-bold text-sm">U</span>
             </div>
             <div>
               <p className="text-sm font-medium">Student User</p>
               <p className="text-xs text-teal-300">Basic Account</p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden z-10 relative">
          <button onClick={() => setSidebarOpen(true)} className="text-teal-900">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-teal-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500"/> UpwardEase
          </span>
          <div className="w-6" />
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="min-h-full flex flex-col">
            <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
              {renderContent()}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${active ? "bg-teal-700 text-white shadow-md font-semibold" : "text-teal-100 hover:bg-teal-800 hover:pl-5"}`}
  >
    <span className={`${active ? "text-yellow-400" : "text-teal-300 group-hover:text-white"}`}>{icon}</span>
    <span>{label}</span>
  </button>
);

const Footer = () => (
  <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="bg-teal-900 p-1.5 rounded-md">
           <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
        <span className="font-bold text-teal-900 text-lg">UpwardEase</span>
      </div>
      <p className="text-slate-500 mb-6 max-w-lg mx-auto">
        A nonprofit platform for students to share study tips, learning advice, and coping experiences. 
        Together, we make the academic journey a little lighter.
      </p>
      <div className="flex justify-center gap-6 text-sm font-medium text-teal-700 mb-8">
        <button className="hover:underline">Privacy Policy</button>
        <button className="hover:underline">Terms of Service</button>
        <button className="hover:underline">Community Guidelines</button>
        <button className="hover:underline">Contact Us</button>
      </div>
      <p className="text-xs text-slate-400">© UpwardEase {new Date().getFullYear()}. All rights reserved.</p>
    </div>
  </footer>
);

// --- Views ---

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
        // Fallback if API fails or parsing fails
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
    <div className="space-y-16">
      
      {/* HERO SECTION */}
      <div className="bg-teal-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl">
         {/* Decorative Background Elements */}
         <div className="absolute top-0 right-0 w-80 h-80 bg-teal-800 rounded-full translate-x-1/3 -translate-y-1/3 opacity-50 blur-3xl" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 rounded-full -translate-x-1/3 translate-y-1/3 opacity-20 blur-2xl" />
         
         <div className="relative z-10 max-w-3xl">
           <div className="inline-flex items-center gap-2 bg-teal-800/50 px-4 py-1.5 rounded-full text-teal-200 text-sm font-bold mb-6 border border-teal-700 backdrop-blur-sm">
             <Heart className="w-4 h-4 text-pink-400 fill-current" /> 
             For Students, By Students
           </div>
           <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
             Share your study tips. <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Find your balance.</span>
           </h1>
           <p className="text-teal-100 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
             UpwardEase is a safe, nonprofit space for middle school, high school, and college students to share advice on learning and mental well-being.
           </p>
           <div className="flex flex-wrap gap-4">
             <button className="bg-yellow-400 text-teal-950 px-8 py-4 rounded-full font-bold hover:bg-yellow-300 transition-transform hover:scale-105 shadow-lg flex items-center gap-2">
               <Video size={20} /> Upload Your Video
             </button>
             <button className="bg-teal-800 text-white px-8 py-4 rounded-full font-bold hover:bg-teal-700 transition-colors border border-teal-700 flex items-center gap-2">
               <BookOpen size={20} /> Browse Gallery
             </button>
           </div>
         </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="text-center max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-teal-900 mb-12">How UpwardEase Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { icon: <Video className="w-8 h-8 text-teal-600" />, title: "Record", text: "Film a short video sharing a study tip or how you cope with stress." },
             { icon: <Upload className="w-8 h-8 text-teal-600" />, title: "Upload", text: "Submit your video. Our team (and AI helper) reviews it for safety." },
             { icon: <Heart className="w-8 h-8 text-teal-600" />, title: "Support", text: "Your video helps other students feel less alone and more prepared." }
           ].map((item, i) => (
             <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
               <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 group-hover:rotate-6 transition-transform">
                 {item.icon}
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
               <p className="text-slate-500 leading-relaxed">{item.text}</p>
             </div>
           ))}
        </div>
      </section>

      {/* WEEKLY FEATURED TOPIC */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-blue-100">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Weekly Focus
            </div>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-blue-200 rounded w-3/4"></div>
                <div className="h-4 bg-blue-200 rounded w-full"></div>
                <div className="h-4 bg-blue-200 rounded w-5/6"></div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{topicData?.topicTitle}</h2>
                <p className="text-lg text-slate-600 leading-relaxed">{topicData?.topicDescription}</p>
                <div className="bg-white/60 p-4 rounded-xl inline-flex items-start gap-3">
                   <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1"/>
                   <div>
                     <h4 className="font-bold text-slate-800 text-sm">Need ideas?</h4>
                     <p className="text-sm text-slate-600">Try our <span className="font-bold text-teal-600 cursor-pointer" onClick={() => navigate("student")}>AI Student Assistant</span> to help you brainstorm what to say!</p>
                   </div>
                </div>
              </>
            )}
          </div>
          
          {/* POLL CARD */}
          <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-lg p-6 border border-slate-100 relative">
             <div className="absolute -top-4 -right-4 bg-yellow-400 text-teal-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm transform rotate-12">
               Weekly Poll
             </div>
             {loading ? (
               <div className="flex items-center justify-center h-48 text-slate-400">
                 <Loader2 className="animate-spin mr-2"/> Loading poll...
               </div>
             ) : (
               <>
                 <h3 className="font-bold text-lg text-slate-800 mb-4">{topicData?.pollQuestion}</h3>
                 <div className="space-y-3">
                   {topicData?.pollOptions?.map((opt: string, idx: number) => (
                     <button 
                       key={idx}
                       onClick={() => setPollSelection(idx)}
                       className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                         pollSelection === idx 
                           ? "bg-teal-50 border-teal-500 text-teal-900" 
                           : "bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                       }`}
                     >
                       <span className="relative z-10 flex items-center justify-between">
                         {opt}
                         {pollSelection === idx && <CheckCircle2 className="w-5 h-5 text-teal-600"/>}
                       </span>
                       {/* Mock percentage bar for effect */}
                       {pollSelection !== null && (
                         <div 
                           className="absolute left-0 top-0 bottom-0 bg-teal-100/50 z-0 transition-all duration-1000" 
                           style={{ width: `${Math.floor(Math.random() * 60) + 10}%` }}
                         />
                       )}
                     </button>
                   ))}
                 </div>
                 {pollSelection !== null && (
                   <p className="text-center text-xs text-slate-400 mt-4">Thanks for voting! Results update weekly.</p>
                 )}
               </>
             )}
          </div>
        </div>
      </section>

      {/* AI TOOLS TEASER */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate("student")}
          className="group cursor-pointer bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform"/>
          <BrainCircuit className="w-10 h-10 text-teal-600 mb-4 relative z-10" />
          <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Writer's Block?</h3>
          <p className="text-slate-500 mb-4 relative z-10">Use our <span className="font-semibold text-teal-600">Student Assistant</span> to draft your script or organize your thoughts before recording.</p>
          <span className="text-teal-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Try Assistant <span className="text-xl">→</span></span>
        </div>
        
        <div 
           onClick={() => navigate("live")}
           className="group cursor-pointer bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform"/>
          <Mic className="w-10 h-10 text-blue-600 mb-4 relative z-10" />
          <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Need to talk?</h3>
          <p className="text-slate-500 mb-4 relative z-10">Try <span className="font-semibold text-blue-600">Live Support</span> for real-time conversation. It's private, judgment-free, and always here.</p>
          <span className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Start Chat <span className="text-xl">→</span></span>
        </div>
      </section>
    </div>
  );
};

// --- Student View (Chatbot) ---
const StudentView = ({ ai }: { ai: GoogleGenAI }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [thinkingMode, setThinkingMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Initialize chat session
    chatRef.current = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !chatRef.current) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({
        message: userMsg,
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     chatRef.current = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: thinkingMode ? { thinkingBudget: 32768 } : undefined
      }
    });
    setMessages([]); 
  }, [thinkingMode]);

  return (
    <div className="max-w-3xl mx-auto h-[80vh] flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="p-6 bg-teal-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Student Assistant</h3>
            <p className="text-xs text-teal-100 opacity-90">Helping you tell your story</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-teal-700/50 px-3 py-1.5 rounded-full">
           <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
             <input type="checkbox" checked={thinkingMode} onChange={(e) => setThinkingMode(e.target.checked)} className="rounded text-teal-500 focus:ring-0" />
             <span>Deep Thinking</span>
           </label>
           <HelpCircle className="w-4 h-4 text-teal-200 cursor-help" title="Enables extended reasoning for complex topics" />
        </div>
      </div>

      <div className="bg-amber-50 px-4 py-2 text-xs text-amber-800 text-center border-b border-amber-100">
        AI is a helper tool. It does not replace professional medical advice.
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-4">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
               <Sparkles className="w-8 h-8 text-teal-400" />
            </div>
            <div className="max-w-xs">
              <p className="font-medium text-slate-600">Hello! I'm here to support you.</p>
              <p className="text-sm mt-2">I can help you draft a script for your video, suggest tags, or just help you organize your thoughts.</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-teal-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
            }`}>
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white rounded-2xl rounded-bl-none px-5 py-4 shadow-sm border border-slate-100 flex items-center gap-3">
               <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
               <span className="text-sm text-slate-400">{thinkingMode ? "Thinking through this..." : "Writing..."}</span>
             </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={thinkingMode ? "Ask a complex question..." : "Type your message..."}
            className="flex-1 bg-transparent border-none px-4 py-2 focus:ring-0 text-slate-800 placeholder:text-slate-400"
          />
          <button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()} 
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 text-white p-3 rounded-xl transition-colors shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Admin View ---
const AdminView = ({ ai }: { ai: GoogleGenAI }) => {
  const [submissionText, setSubmissionText] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeContent = async () => {
    if (!submissionText) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Analyze this student submission:\n\n${submissionText}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });
      setAnalysis(response.text);
    } catch (e) {
      console.error(e);
      setAnalysis("Error analyzing content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <ShieldAlert className="text-teal-600 w-8 h-8"/> Admin Console
           </h2>
           <p className="text-slate-500 mt-1">Review user submissions for safety and tagging.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-slate-400"/> Submission Content
            </h3>
            <textarea
              className="w-full h-64 border border-slate-200 bg-slate-50 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none text-sm leading-relaxed"
              placeholder="Paste student video transcript or description here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
            />
            <button
              onClick={analyzeContent}
              disabled={loading || !submissionText}
              className="mt-4 w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-bold flex justify-center items-center gap-2 shadow-sm transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              Run Safety Analysis
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full min-h-[400px]">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-4">AI Assessment Report</h3>
          {analysis ? (
             <div className="prose prose-sm max-w-none prose-headings:text-teal-800 prose-p:text-slate-600">
                <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-300">
              <ShieldAlert className="w-12 h-12 mb-2 opacity-50"/>
              <p>Waiting for submission...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Studio View (Image Gen & Edit) ---
const StudioView = ({ ai }: { ai: GoogleGenAI }) => {
  const [mode, setMode] = useState<"generate" | "edit">("generate");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceImage(file);
      setSourcePreview(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResultImage(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { imageSize: size, aspectRatio: "1:1" }
        }
      });
      const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imgPart?.inlineData?.data) setResultImage(`data:image/png;base64,${imgPart.inlineData.data}`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !sourceImage) return;
    setLoading(true);
    setResultImage(null);
    try {
      const imagePart = await fileToGenerativePart(sourceImage);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [imagePart, { text: prompt }] }
      });
      const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imgPart?.inlineData?.data) setResultImage(`data:image/png;base64,${imgPart.inlineData.data}`);
    } catch (e) {
      console.error(e);
      alert("Failed to edit image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
               <ImageIcon className="text-teal-600 w-8 h-8"/> Creative Studio
            </h2>
            <p className="text-slate-500 mt-1">Design thumbnails or edit photos for your videos.</p>
         </div>
         <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex gap-1 self-start">
           <button onClick={() => setMode("generate")} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${mode === "generate" ? "bg-teal-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>Create New</button>
           <button onClick={() => setMode("edit")} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${mode === "edit" ? "bg-teal-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>Edit Existing</button>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               {mode === "generate" ? (
                 <>
                   <label className="block text-sm font-bold text-slate-700 mb-2">What do you want to create?</label>
                   <textarea 
                     className="w-full h-32 border border-slate-200 bg-slate-50 rounded-xl p-4 mb-4 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                     placeholder="A calm study desk with plants and a laptop, lo-fi style..."
                     value={prompt}
                     onChange={e => setPrompt(e.target.value)}
                   />
                   <label className="block text-sm font-bold text-slate-700 mb-2">Quality</label>
                   <div className="flex gap-2 mb-6">
                     {(["1K", "2K", "4K"] as const).map(s => (
                       <button 
                        key={s} 
                        onClick={() => setSize(s)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${size === s ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-500 hover:border-teal-300"}`}
                       >
                         {s}
                       </button>
                     ))}
                   </div>
                   <button onClick={handleGenerate} disabled={loading} className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 flex justify-center items-center gap-2 shadow-lg shadow-teal-600/20 transition-all">
                     {loading ? <Loader2 className="animate-spin"/> : <Wand2 size={18}/>} Generate Art
                   </button>
                 </>
               ) : (
                 <>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Upload Photo</label>
                   <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 mb-4 text-center hover:bg-slate-50 transition-colors relative h-40 flex items-center justify-center">
                     <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     {sourcePreview ? (
                       <img src={sourcePreview} alt="Preview" className="h-full w-full object-contain rounded-md" />
                     ) : (
                       <div className="text-slate-400">
                         <Camera className="mx-auto mb-2 w-8 h-8 opacity-50"/>
                         <span className="text-xs font-semibold">Click to upload image</span>
                       </div>
                     )}
                   </div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Edit Instructions</label>
                   <textarea 
                     className="w-full h-24 border border-slate-200 bg-slate-50 rounded-xl p-4 mb-6 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                     placeholder="Make it look like a sketch, add a sunset..."
                     value={prompt}
                     onChange={e => setPrompt(e.target.value)}
                   />
                   <button onClick={handleEdit} disabled={loading || !sourceImage} className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 flex justify-center items-center gap-2 shadow-lg shadow-teal-600/20 transition-all">
                     {loading ? <Loader2 className="animate-spin"/> : <Edit size={18}/>} Apply Edits
                   </button>
                 </>
               )}
            </div>
         </div>

         <div className="lg:col-span-2 bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center min-h-[500px] p-6 relative overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#0f766e 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>

            {loading ? (
              <div className="text-center text-teal-600 z-10">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4"/>
                <p className="font-semibold text-lg">Creating your masterpiece...</p>
              </div>
            ) : resultImage ? (
              <div className="relative group max-w-full z-10">
                <img src={resultImage} alt="Generated" className="max-w-full max-h-[600px] rounded-xl shadow-2xl" />
                <a href={resultImage} download="upwardease_creation.png" className="absolute top-4 right-4 bg-white/90 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 text-teal-900">
                   <span className="sr-only">Download</span>
                   <Upload className="w-5 h-5 rotate-180" />
                </a>
              </div>
            ) : (
              <div className="text-slate-400 text-center z-10">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <ImageIcon className="w-10 h-10 opacity-30"/>
                </div>
                <p className="font-medium text-lg text-slate-500">Your creation will appear here</p>
                <p className="text-sm opacity-60">Use the tools on the left to get started</p>
              </div>
            )}
         </div>
       </div>
    </div>
  );
};

// --- Live View (Live API) ---
const LiveView = ({ ai }: { ai: GoogleGenAI }) => {
  const [connected, setConnected] = useState(false);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startLiveSession = async () => {
    setError(null);
    setActive(true);
    try {
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: async () => {
            setConnected(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (!active) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputCtx) {
               const startTime = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
               const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
               const source = outputCtx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputCtx.destination);
               source.start(startTime);
               nextStartTimeRef.current = startTime + audioBuffer.duration;
               source.onended = () => sourcesRef.current.delete(source);
               sourcesRef.current.add(source);
            }
          },
          onclose: () => { setConnected(false); setActive(false); },
          onerror: (e) => { console.error(e); setError("Connection error."); setConnected(false); }
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e) {
      console.error(e);
      setError("Failed to start audio session.");
      setActive(false);
    }
  };

  const stopSession = async () => {
    setActive(false);
    setConnected(false);
    if (sessionRef.current) (await sessionRef.current).close();
    inputAudioContextRef.current?.close();
    audioContextRef.current?.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"/>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-50 rounded-full translate-x-1/2 translate-y-1/2 opacity-50"/>

        <div className="relative z-10">
           <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 transition-all duration-700 ${
             connected ? "bg-red-50 ring-[12px] ring-red-50/50 animate-pulse" : "bg-slate-100"
           }`}>
             {connected ? <Mic className="w-12 h-12 text-red-500" /> : <MicOff className="w-12 h-12 text-slate-400" />}
           </div>

           <h2 className="text-3xl font-bold text-slate-800 mb-4">
             {connected ? "Listening..." : "Live Support Space"}
           </h2>
           <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">
             {connected 
               ? "Go ahead, I'm listening. You can talk about anything on your mind." 
               : "Connect for a private, judgment-free voice chat. It feels like talking to a supportive friend."}
           </p>
           
           {error && <div className="text-red-500 mb-6 bg-red-50 px-4 py-2 rounded-lg text-sm">{error}</div>}

           <button
             onClick={connected ? stopSession : startLiveSession}
             className={`px-10 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 mx-auto ${
               connected 
               ? "bg-white text-red-500 border-2 border-red-100 hover:bg-red-50" 
               : "bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:shadow-blue-500/25"
             }`}
           >
             {connected ? "End Conversation" : "Start Conversation"}
           </button>
        </div>
      </div>
    </div>
  );
};

// --- Resources View (Grounding) ---
const ResourcesView = ({ ai }: { ai: GoogleGenAI }) => {
  const [query, setQuery] = useState("");
  const [tool, setTool] = useState<"search" | "maps">("search");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{title?: string, uri?: string, content: string}[]>([]);
  const [answer, setAnswer] = useState("");

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResults([]);
    setAnswer("");
    try {
      let config: any = {};
      if (tool === "search") {
        config.tools = [{ googleSearch: {} }];
      } else {
         let loc = { latitude: 37.7749, longitude: -122.4194 };
         try {
           const pos: GeolocationPosition = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
           loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
         } catch (e) { console.warn("Using default location"); }
         config.tools = [{ googleMaps: {} }];
         config.toolConfig = { retrievalConfig: { latLng: loc } };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: config
      });
      setAnswer(response.text);
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extracted = chunks.map((c: any) => {
        if (c.web) return { title: c.web.title, uri: c.web.uri, content: "Web Source" };
        if (c.maps) return { title: c.maps.title, uri: c.maps.googleMapsUri, content: "Map Location" };
        return null;
      }).filter(Boolean);
      setResults(extracted);
    } catch (e) {
      console.error(e);
      setAnswer("Could not find information at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Navigation className="text-teal-600 w-8 h-8"/> Find Help & Resources
        </h2>
        <p className="text-slate-500 mt-2">Locate study groups, libraries, or mental health support near you.</p>
      </div>
      
      <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 mb-8 flex flex-col md:flex-row gap-2">
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => setTool("search")}
             className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${tool === "search" ? "bg-white text-teal-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
           >
             <Search size={16}/> Web
           </button>
           <button 
             onClick={() => setTool("maps")}
             className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${tool === "maps" ? "bg-white text-teal-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
           >
             <MapPin size={16}/> Maps
           </button>
        </div>
        <div className="flex-1 flex gap-2 p-1">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tool === "search" ? "Latest research on exam anxiety..." : "Quiet libraries near me..."}
            className="flex-1 border-none bg-transparent px-4 focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading} className="bg-teal-600 text-white px-8 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-md shadow-teal-600/20">
             {loading ? <Loader2 className="animate-spin"/> : "Search"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
           {answer && (
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
               <div className="flex items-center gap-2 mb-4 text-teal-800">
                 <Sparkles className="w-5 h-5" />
                 <h3 className="font-bold">AI Summary</h3>
               </div>
               <div className="prose prose-slate leading-relaxed">
                 <div dangerouslySetInnerHTML={{__html: answer.replace(/\n/g, "<br/>")}} />
               </div>
             </div>
           )}
        </div>
        
        <div className="md:col-span-1 space-y-3">
           <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-2">Verified Sources</h3>
           {results.length > 0 ? results.map((r: any, i) => (
             <a key={i} href={r.uri} target="_blank" rel="noreferrer" className="block bg-white p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:shadow-md transition-all group">
               <div className="font-bold text-teal-900 truncate group-hover:text-teal-600 transition-colors">{r.title || "Source"}</div>
               <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                 {tool === "search" ? <Globe size={12}/> : <MapPin size={12}/>}
                 {r.content}
               </div>
             </a>
           )) : (
             <div className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
               Sources will appear here after your search.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
