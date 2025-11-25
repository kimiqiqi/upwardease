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
  Navigation
} from "lucide-react";

// --- Constants & System Prompts ---

const SYSTEM_INSTRUCTION = `You are the official AI assistant for UpwardEase, a nonprofit platform designed to help students share their stress-coping experiences through video submissions. Your primary mission is to empower students with emotional support, help them express their stories clearly, and assist the UpwardEase team in managing content safely and compassionately.

1. Your Role
- Act as a supportive, non-clinical guide that helps students reflect on their experiences.
- Provide emotionally safe, encouraging, and age-appropriate communication.
- Generate clear, structured, positive written outputs related to video submissions, coping methods, and featured topics.
- Assist admins with content analysis, safety checks, tagging, and approval suggestions.

2. Platform Description
- Video Submission Area: Students upload stress-coping videos.
- Video Gallery: Admin-approved videos.
- Weekly Featured Topic: Highlights one mental-health-related theme.

3. Your Tasks
A. For Students (creators): Help draft descriptions, summarize coping experiences, give gentle suggestions, generate tags. Avoid clinical diagnosis.
B. For Admins: Provide summary, sentiment analysis, safety notes, tag recommendations, publication recommendation.
C. Featured Topic Assistant: Provide definitions, prompts, video ideas.

4. Output Format
Structure output clearly: Summary, Emotional Tone Analysis, Key Themes, Suggested Tags, Recommended Actions, Optional Improvements.

5. Safety & Ethics
Ensure supportive tone, no harmful advice, no moral judgment, no diagnosis. If content is unsafe, output: "This content includes potentially sensitive emotional expressions. Recommend admin review before publishing."`;

const TOPIC_SYSTEM_PROMPT = `You are the UpwardEase Featured Topic Assistant. Your job is to generate a weekly mental health topic, a brief definition, and 3 discussion prompts for students. Keep it inspiring and relevant to students.`;

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

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <HomeView ai={ai} />;
      case "student": return <StudentView ai={ai} />;
      case "admin": return <AdminView ai={ai} />;
      case "studio": return <StudioView ai={ai} />;
      case "live": return <LiveView ai={ai} />;
      case "resources": return <ResourcesView ai={ai} />;
      default: return <HomeView ai={ai} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-teal-900 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            UpwardEase
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <NavButton active={activeTab === "home"} onClick={() => { setActiveTab("home"); setSidebarOpen(false); }} icon={<BookOpen size={20} />} label="Dashboard" />
          <NavButton active={activeTab === "student"} onClick={() => { setActiveTab("student"); setSidebarOpen(false); }} icon={<BrainCircuit size={20} />} label="Student Assistant" />
          <NavButton active={activeTab === "admin"} onClick={() => { setActiveTab("admin"); setSidebarOpen(false); }} icon={<ShieldAlert size={20} />} label="Admin Console" />
          <NavButton active={activeTab === "studio"} onClick={() => { setActiveTab("studio"); setSidebarOpen(false); }} icon={<ImageIcon size={20} />} label="Creative Studio" />
          <NavButton active={activeTab === "live"} onClick={() => { setActiveTab("live"); setSidebarOpen(false); }} icon={<Mic size={20} />} label="Live Support" />
          <NavButton active={activeTab === "resources"} onClick={() => { setActiveTab("resources"); setSidebarOpen(false); }} icon={<Globe size={20} />} label="Find Help" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-teal-900">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-lg text-teal-900">UpwardEase</span>
          <div className="w-6" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? "bg-teal-700 text-white" : "text-teal-100 hover:bg-teal-800"}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

// --- Views ---

const HomeView = ({ ai }: { ai: GoogleGenAI }) => {
  const [topic, setTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: "Generate this week's featured mental health topic.",
          config: { systemInstruction: TOPIC_SYSTEM_PROMPT }
        });
        setTopic(response.text);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-teal-900 mb-6">Welcome to UpwardEase</h2>
      <div className="bg-white rounded-2xl shadow-lg p-8 border-l-8 border-yellow-400 mb-8">
        <h3 className="text-xl font-semibold text-gray-500 uppercase tracking-wide mb-2">Weekly Featured Topic</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-teal-600"><Loader2 className="animate-spin" /> Generating topic...</div>
        ) : (
          <div className="prose prose-teal max-w-none">
             <div dangerouslySetInnerHTML={{ __html: (topic || "").replace(/\n/g, "<br/>") }} />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl shadow-sm border border-teal-100">
          <h4 className="font-bold text-lg text-teal-800 mb-2 flex items-center gap-2"><BrainCircuit size={20}/> For Students</h4>
          <p className="text-gray-600 mb-4">Share your story. Use our AI assistant to help draft your video description and find the right words.</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-sm border border-blue-100">
           <h4 className="font-bold text-lg text-blue-800 mb-2 flex items-center gap-2"><Mic size={20}/> Live Support</h4>
           <p className="text-gray-600 mb-4">Talk to our real-time AI companion for immediate emotional support and coping strategies.</p>
        </div>
      </div>
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
      // The session configuration (including thinking mode) is set when the chat is created/recreated in the useEffect below.
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

  // Re-init chat if thinking mode changes (clears context, but ensures config application)
  useEffect(() => {
     chatRef.current = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: thinkingMode ? { thinkingBudget: 32768 } : undefined
      }
    });
    setMessages([]); // Clear history on mode switch for clarity
  }, [thinkingMode]);

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-teal-50 border-b border-teal-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-teal-900">Student Assistant</h3>
          <p className="text-xs text-teal-600">Confidential support & drafting help</p>
        </div>
        <div className="flex items-center gap-2">
           <label className="flex items-center gap-2 text-sm text-teal-800 cursor-pointer">
             <input type="checkbox" checked={thinkingMode} onChange={(e) => setThinkingMode(e.target.checked)} className="rounded text-teal-600 focus:ring-teal-500" />
             <BrainCircuit size={16} />
             <span>Deep Thinking Mode</span>
           </label>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Hello! I'm here to help you share your story.</p>
            <p className="text-sm">Ask me for help with your video script, or just chat about how you're feeling.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
               <span className="text-sm text-gray-500">{thinkingMode ? "Thinking deeply..." : "Typing..."}</span>
             </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={thinkingMode ? "Ask a complex question..." : "Type your message..."}
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button onClick={sendMessage} disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition-colors">
            <Send size={20} />
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
      <h2 className="text-2xl font-bold text-teal-900 mb-6 flex items-center gap-2">
        <ShieldAlert className="text-teal-600"/> Admin Console
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold mb-4">Content Analysis</h3>
            <p className="text-sm text-gray-600 mb-2">Paste student video transcript or description below:</p>
            <textarea
              className="w-full h-48 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
              placeholder="Student's story about exam stress..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
            />
            <button
              onClick={analyzeContent}
              disabled={loading}
              className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              Analyze Submission
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-full overflow-y-auto max-h-[600px]">
          <h3 className="font-semibold mb-4 text-slate-700">AI Assessment</h3>
          {analysis ? (
             <div className="prose prose-sm max-w-none prose-headings:text-teal-800">
                <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
             </div>
          ) : (
            <div className="text-gray-400 italic text-center mt-20">
              Analysis results will appear here.
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
  
  // Generation specific
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  
  // Edit specific
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
          imageConfig: {
            imageSize: size,
            aspectRatio: "1:1"
          }
        }
      });
      
      const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imgPart?.inlineData?.data) {
        setResultImage(`data:image/png;base64,${imgPart.inlineData.data}`);
      }
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
        contents: {
          parts: [
            imagePart,
            { text: prompt }
          ]
        }
      });
      
      const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imgPart?.inlineData?.data) {
        setResultImage(`data:image/png;base64,${imgPart.inlineData.data}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to edit image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
       <div className="flex items-center justify-between mb-6">
         <h2 className="text-2xl font-bold text-teal-900 flex items-center gap-2"><ImageIcon className="text-teal-600"/> Creative Studio</h2>
         <div className="bg-slate-200 p-1 rounded-lg flex gap-1">
           <button onClick={() => setMode("generate")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === "generate" ? "bg-white text-teal-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>Generate</button>
           <button onClick={() => setMode("edit")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === "edit" ? "bg-white text-teal-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>Edit</button>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               {mode === "generate" ? (
                 <>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
                   <textarea 
                     className="w-full h-32 border border-slate-300 rounded-lg p-3 mb-4 focus:ring-teal-500 focus:outline-none"
                     placeholder="A calm blue ocean at sunset, digital art style..."
                     value={prompt}
                     onChange={e => setPrompt(e.target.value)}
                   />
                   <label className="block text-sm font-medium text-gray-700 mb-2">Image Size</label>
                   <div className="flex gap-2 mb-6">
                     {(["1K", "2K", "4K"] as const).map(s => (
                       <button 
                        key={s} 
                        onClick={() => setSize(s)}
                        className={`flex-1 py-2 rounded-lg text-sm border ${size === s ? "border-teal-600 bg-teal-50 text-teal-700 font-bold" : "border-slate-300 text-gray-600"}`}
                       >
                         {s}
                       </button>
                     ))}
                   </div>
                   <button onClick={handleGenerate} disabled={loading} className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 flex justify-center items-center gap-2">
                     {loading ? <Loader2 className="animate-spin"/> : <Wand2 size={18}/>} Generate
                   </button>
                 </>
               ) : (
                 <>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                   <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 mb-4 text-center hover:bg-slate-50 transition-colors relative">
                     <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     {sourcePreview ? (
                       <img src={sourcePreview} alt="Preview" className="h-32 mx-auto object-contain rounded-md" />
                     ) : (
                       <div className="py-8 text-gray-400">
                         <Camera className="mx-auto mb-2 w-8 h-8"/>
                         <span className="text-sm">Click to upload</span>
                       </div>
                     )}
                   </div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                   <textarea 
                     className="w-full h-24 border border-slate-300 rounded-lg p-3 mb-6 focus:ring-teal-500 focus:outline-none"
                     placeholder="Add a retro filter, remove the background..."
                     value={prompt}
                     onChange={e => setPrompt(e.target.value)}
                   />
                   <button onClick={handleEdit} disabled={loading || !sourceImage} className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 flex justify-center items-center gap-2">
                     {loading ? <Loader2 className="animate-spin"/> : <Edit size={18}/>} Edit Image
                   </button>
                 </>
               )}
            </div>
         </div>

         <div className="lg:col-span-2 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center min-h-[400px] p-4">
            {loading ? (
              <div className="text-center text-teal-600">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2"/>
                <p>Creating masterpiece...</p>
              </div>
            ) : resultImage ? (
              <div className="relative group max-w-full">
                <img src={resultImage} alt="Generated" className="max-w-full max-h-[600px] rounded-lg shadow-md" />
                <a href={resultImage} download="upwardease_creation.png" className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-teal-900 hover:text-teal-700">
                   <span className="sr-only">Download</span>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30"/>
                <p>Your creation will appear here</p>
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
  
  // Refs for audio handling
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null); // Simplified session type
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
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: async () => {
            setConnected(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!active) return; // Guard
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
          onclose: () => {
            setConnected(false);
            setActive(false);
          },
          onerror: (e) => {
            console.error(e);
            setError("Connection error.");
            setConnected(false);
          }
        }
      });
      
      // Keep session reference to close later
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
    
    if (sessionRef.current) {
      const session = await sessionRef.current;
      session.close();
    }

    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    
    // Stop all playing sources
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="max-w-2xl mx-auto h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl border border-teal-100 p-8">
       <div className={`w-40 h-40 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${connected ? "bg-teal-100 ring-8 ring-teal-50 animate-pulse" : "bg-slate-100"}`}>
         {connected ? <Mic className="w-16 h-16 text-teal-600" /> : <MicOff className="w-16 h-16 text-slate-400" />}
       </div>

       <h2 className="text-2xl font-bold text-slate-800 mb-2">
         {connected ? "Listening..." : "Live Support"}
       </h2>
       <p className="text-center text-slate-500 mb-8 max-w-md">
         {connected 
           ? "Speak naturally. I'm here to listen and support you." 
           : "Start a real-time voice conversation with our AI support companion. Completely private and judgment-free."}
       </p>
       
       {error && <div className="text-red-500 mb-4">{error}</div>}

       <button
         onClick={connected ? stopSession : startLiveSession}
         className={`px-8 py-3 rounded-full font-bold text-lg transition-colors flex items-center gap-2 ${connected ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg"}`}
       >
         {connected ? "End Conversation" : "Start Conversation"}
       </button>
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
         // Get location for maps
         let loc = { latitude: 37.7749, longitude: -122.4194 }; // Default SF
         try {
           const pos: GeolocationPosition = await new Promise((res, rej) => 
             navigator.geolocation.getCurrentPosition(res, rej)
           );
           loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
         } catch (e) {
           console.warn("Using default location");
         }

         config.tools = [{ googleMaps: {} }];
         config.toolConfig = { retrievalConfig: { latLng: loc } };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: config
      });

      setAnswer(response.text);

      // Extract chunks
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
      <h2 className="text-2xl font-bold text-teal-900 mb-6 flex items-center gap-2"><Navigation className="text-teal-600"/> Find Help & Resources</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex gap-2 border border-slate-300 rounded-lg p-1">
             <button 
               onClick={() => setTool("search")}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${tool === "search" ? "bg-teal-100 text-teal-800 font-medium" : "text-gray-500"}`}
             >
               <Search size={18}/> Search Web
             </button>
             <button 
               onClick={() => setTool("maps")}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${tool === "maps" ? "bg-teal-100 text-teal-800 font-medium" : "text-gray-500"}`}
             >
               <MapPin size={18}/> Find Nearby
             </button>
          </div>
          <div className="flex-[3] flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tool === "search" ? "Latest research on anxiety..." : "Mental health clinics near me..."}
              className="flex-1 border border-slate-300 rounded-lg px-4 focus:ring-2 focus:ring-teal-500 outline-none"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading} className="bg-teal-600 text-white px-6 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50">
               {loading ? <Loader2 className="animate-spin"/> : "Find"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
           {answer && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
               <h3 className="font-bold text-teal-800 mb-3">AI Summary</h3>
               <div className="prose prose-sm text-slate-700">
                 <div dangerouslySetInnerHTML={{__html: answer.replace(/\n/g, "<br/>")}} />
               </div>
             </div>
           )}
        </div>
        
        <div className="md:col-span-1 space-y-3">
           <h3 className="font-semibold text-slate-500 uppercase text-xs tracking-wider">Sources</h3>
           {results.length > 0 ? results.map((r: any, i) => (
             <a key={i} href={r.uri} target="_blank" rel="noreferrer" className="block bg-white p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all">
               <div className="font-medium text-teal-700 truncate">{r.title || "Source"}</div>
               <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                 {tool === "search" ? <Globe size={12}/> : <MapPin size={12}/>}
                 {r.content}
               </div>
             </a>
           )) : (
             <div className="text-sm text-gray-400 italic">No specific sources cited.</div>
           )}
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);