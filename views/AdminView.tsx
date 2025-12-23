import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { ShieldAlert, Clock, CheckCircle2, Video, X, HelpCircle, History, Sparkles } from "lucide-react";
import { UserType, VideoType } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const AdminView = ({ ai, user, navigate, videos, setVideos }: { ai: GoogleGenAI, user: UserType, navigate: any, videos: VideoType[], setVideos: any }) => {
  const [contentToCheck, setContentToCheck] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [adminTab, setAdminTab] = useState<'queue' | 'history'>('queue');

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
  const historyVideos = videos.filter(v => v.status === 'approved' || v.status === 'rejected');

  return (
    <div className="max-w-6xl mx-auto py-8">
       <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <ShieldAlert className="text-eggplant dark:text-teal-300" /> Admin Dashboard
            </h2>
            <div className="flex gap-4 items-center">
                 <button 
                    onClick={() => setAdminTab('queue')}
                    className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${adminTab === 'queue' ? 'bg-eggplant text-white' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}
                 >
                    Queue ({pendingVideos.length})
                 </button>
                 <button 
                    onClick={() => setAdminTab('history')}
                    className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${adminTab === 'history' ? 'bg-eggplant text-white' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}
                 >
                    History
                 </button>
            </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: PENDING REVIEWS / HISTORY */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
                {adminTab === 'queue' ? <Clock className="text-yellow-500"/> : <History className="text-blue-500"/>}
                {adminTab === 'queue' ? 'Review Queue' : 'Review History'}
            </h3>
            
            {adminTab === 'queue' ? (
                pendingVideos.length === 0 ? (
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
                                    {/* Anonymized user info */}
                                    <p className="text-sm text-slate-500">by Anonymous Student</p>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{video.description}</p>
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
                                            Reject
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
                                    <button 
                                        onClick={() => { setSelectedReviewId(null); /* Simple logic for now: just deselect/skip */ }}
                                        className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 text-sm flex items-center justify-center gap-2"
                                    >
                                        <HelpCircle size={16} /> Not Sure
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )
            ) : (
                <div className="space-y-4">
                     {historyVideos.length === 0 ? (
                        <p className="text-slate-500">No review history.</p>
                     ) : (
                        historyVideos.map(video => (
                            <div key={video.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center opacity-75">
                                 <div>
                                    <p className="font-bold text-slate-800 dark:text-white line-clamp-1">{video.title}</p>
                                    <p className="text-xs text-slate-500">{video.author}</p>
                                 </div>
                                 <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${video.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {video.status}
                                 </div>
                            </div>
                        ))
                     )}
                </div>
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