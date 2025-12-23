import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { ArrowLeft, Video, Heart, ThumbsUp, Lightbulb, Loader2, CheckCircle2, Upload } from "lucide-react";
import { TOPIC_SYSTEM_PROMPT } from "../constants";
import { MissionSection } from "../components/MissionSection";
import { TestimonialsSection } from "../components/TestimonialsSection";

export const HomeView = ({ ai, navigate }: { ai: GoogleGenAI, navigate: (tab: any) => void }) => {
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