import React, { useState, useEffect } from "react";
import { ShieldAlert, Clock, CheckCircle2, Video, X, HelpCircle, History, Search, AlertTriangle, ChevronDown, ChevronUp, Calendar, Edit3, MessageCircle } from "lucide-react";
import { UserType, VideoType } from "../types";

export const AdminView = ({ user, navigate, videos, setVideos }: { user: UserType, navigate: any, videos: VideoType[], setVideos: any }) => {
  const [rejectReason, setRejectReason] = useState("");
  const [escalationNote, setEscalationNote] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [reviewAction, setReviewAction] = useState<'reject' | 'escalate' | 'update_note' | null>(null);
  const [adminTab, setAdminTab] = useState<'queue' | 'escalated' | 'history'>('queue');
  
  // History State
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<'all' | 'approved' | 'rejected' | 'needs_review'>('all');
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("home");
    }
  }, [user, navigate]);

  const handleVerdict = (id: number, status: string) => {
      setVideos((prev: VideoType[]) => prev.map(v => 
          v.id === id 
          ? { 
              ...v, 
              status, 
              feedback: status === 'rejected' ? rejectReason : v.feedback,
              admin_notes: (status === 'needs_review' || reviewAction === 'update_note') ? escalationNote : v.admin_notes,
              approvedAt: status === 'approved' ? new Date().toISOString() : v.approvedAt,
              appealReason: status !== 'needs_review' ? undefined : v.appealReason // Clear appeal reason if resolved, unless kept in needs_review
            } 
          : v
      ));
      
      // Reset states
      setRejectReason("");
      setEscalationNote("");
      setSelectedReviewId(null);
      setReviewAction(null);
  };

  if (!user || user.role !== "admin") return null;

  // Filter videos for the queue
  // If a video has an appealReason, it should appear in the queue or escalated? 
  // For this logic, let's put appeals in 'needs_review' or 'queue' based on status.
  // Assuming appeals set status to 'needs_review'.
  
  const pendingVideos = videos.filter(v => v.status === 'pending');
  const needsReviewVideos = videos.filter(v => v.status === 'needs_review');
  
  const historyVideos = videos.filter(v => {
      if (v.status === 'pending') return false;
      
      // Status Filter
      if (historyFilter !== 'all' && v.status !== historyFilter) return false;

      // Search Filter
      if (historySearch) {
          const lower = historySearch.toLowerCase();
          return v.title.toLowerCase().includes(lower) || 
                 v.author.toLowerCase().includes(lower);
      }
      return true;
  });

  const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      });
  };

  // Reusable card for both Queue (interactive) and History (read-only)
  const renderVideoCard = (video: VideoType, isInteractive: boolean, isEscalatedQueue: boolean = false) => {
    const isActionSelected = selectedReviewId === video.id;

    return (
      <div key={video.id} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${!isInteractive ? 'border-none shadow-none p-0' : 'border-slate-200 dark:border-slate-700 shadow-sm'} animate-in fade-in slide-in-from-top-4 duration-500`}>
          <div className="flex gap-4 mb-4">
              <div className={`w-32 h-20 ${video.color} rounded-lg flex items-center justify-center shrink-0`}>
                  <Video className="text-slate-400" />
              </div>
              <div className="flex-1">
                  <h4 className="font-bold text-lg dark:text-white flex items-center justify-between">
                      {video.title}
                      {video.appealReason && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                              <MessageCircle size={12}/> APPEAL
                          </span>
                      )}
                  </h4>
                  <p className="text-sm text-slate-500">by {video.author}</p>
                  
                  {/* Expanded details always visible if interactive or if expanded in history */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      {video.description}
                  </p>
                  
                  <div className="flex gap-2 mt-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{video.category}</span>
                      <span className="text-xs text-slate-400">• {video.grade}</span>
                  </div>
              </div>
          </div>
          
          {/* Display Appeal Reason Highlight */}
          {video.appealReason && (
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm text-purple-900 dark:text-purple-200">
                  <span className="font-bold block mb-1">Student Appeal Message:</span>
                  "{video.appealReason}"
              </div>
          )}

          {/* Read-Only Status / Feedback / Dates Display */}
          {!isInteractive && (
             <div className="mt-4 space-y-3">
                {/* Dates Section */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">Uploaded:</span>
                        {formatDate(video.uploadedAt)}
                    </div>
                    {video.approvedAt && (
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-green-500" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">Approved:</span>
                            {formatDate(video.approvedAt)}
                        </div>
                    )}
                </div>

                {video.status === 'rejected' && video.feedback && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-sm text-red-800 dark:text-red-300">
                        <span className="font-bold block mb-1">Rejection Reason:</span>
                        {video.feedback}
                    </div>
                )}
                {video.admin_notes && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg text-sm text-orange-800 dark:text-orange-200">
                        <span className="font-bold block mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Admin Note:</span> 
                        {video.admin_notes}
                    </div>
                )}
             </div>
          )}

          {/* Interactive Action Area */}
          {isInteractive && (
             <>
                {/* Admin Note Display for Escalated Queue Items */}
                {isEscalatedQueue && video.admin_notes && !isActionSelected && (
                    <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg text-sm text-orange-800 dark:text-orange-200 flex justify-between items-start">
                        <div>
                            <span className="font-bold block mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Admin Note:</span> 
                            {video.admin_notes}
                        </div>
                        <button 
                            onClick={() => { setSelectedReviewId(video.id); setReviewAction('update_note'); setEscalationNote(video.admin_notes || ""); }}
                            className="p-1 hover:bg-orange-200 rounded text-orange-600"
                        >
                            <Edit3 size={16} />
                        </button>
                    </div>
                )}

                {isActionSelected ? (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm font-bold mb-2 dark:text-white">
                            {reviewAction === 'reject' ? "Reason for Rejection:" : (reviewAction === 'escalate' ? "Optional Escalation Note:" : "Update Admin Note:")}
                        </p>
                        
                        <textarea 
                            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 mb-3 text-sm dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-eggplant outline-none"
                            placeholder={reviewAction === 'reject' ? "Violation of guidelines (required)..." : "Add context for other admins (optional)..."}
                            value={reviewAction === 'reject' ? rejectReason : escalationNote}
                            onChange={(e) => reviewAction === 'reject' ? setRejectReason(e.target.value) : setEscalationNote(e.target.value)}
                            autoFocus
                        />
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleVerdict(video.id, reviewAction === 'reject' ? 'rejected' : 'needs_review')}
                                disabled={reviewAction === 'reject' && !rejectReason.trim()}
                                className={`flex-1 py-2.5 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors ${
                                    reviewAction === 'reject' 
                                    ? 'bg-red-500 text-white hover:bg-red-600' 
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                            >
                                {reviewAction === 'reject' ? 'Confirm Reject' : (reviewAction === 'update_note' ? 'Save Note' : 'Submit for Review')}
                            </button>
                            <button 
                                onClick={() => { setSelectedReviewId(null); setReviewAction(null); setRejectReason(""); setEscalationNote(""); }}
                                className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-700 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4 pt-2">
                        <button 
                            onClick={() => handleVerdict(video.id, 'approved')}
                            className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-bold hover:bg-green-600 text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                            <CheckCircle2 size={18} /> Approve
                        </button>
                        <button 
                            onClick={() => { setSelectedReviewId(video.id); setReviewAction('reject'); }}
                            className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-lg font-bold hover:bg-red-100 text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <X size={18} /> Reject
                        </button>
                        <button 
                            onClick={() => { setSelectedReviewId(video.id); setReviewAction('escalate'); }}
                            className="flex-1 bg-orange-50 text-orange-600 border border-orange-200 py-2.5 rounded-lg font-bold hover:bg-orange-100 text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <HelpCircle size={18} /> Not Sure
                        </button>
                    </div>
                )}
             </>
          )}
      </div>
    );
  };

  const TabButton = ({ id, label, count, icon: Icon }: any) => (
     <button 
        onClick={() => { setAdminTab(id); setExpandedHistoryId(null); setSelectedReviewId(null); }}
        className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition-colors ${adminTab === id ? 'bg-eggplant text-white shadow-md' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
     >
        {Icon && <Icon size={14} />}
        {label}
        {count !== undefined && <span className="ml-1 opacity-80 text-xs bg-white/20 px-1.5 rounded-full">{count}</span>}
     </button>
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <ShieldAlert className="text-eggplant dark:text-teal-300" /> Admin Dashboard
            </h2>
            <div className="flex flex-wrap gap-2 items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                 <TabButton id="queue" label="Queue" count={pendingVideos.length} icon={Clock} />
                 <TabButton id="escalated" label="Needs Review" count={needsReviewVideos.length} icon={AlertTriangle} />
                 <TabButton id="history" label="History" icon={History} />
            </div>
       </div>

       <div className="w-full">
          <div className="space-y-6">
            <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
                {adminTab === 'queue' && <><Clock className="text-yellow-500"/> Review Queue</>}
                {adminTab === 'escalated' && <><AlertTriangle className="text-orange-500"/> Escalated Items</>}
                {adminTab === 'history' && <><History className="text-blue-500"/> Review History</>}
            </h3>
            
            {adminTab === 'queue' && (
                pendingVideos.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl text-center text-slate-500 border border-slate-200 dark:border-slate-700">
                        <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500"/>
                        <p className="font-bold text-lg">All caught up!</p>
                        <p className="text-sm">No new videos waiting for review.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingVideos.map(v => renderVideoCard(v, true, false))}
                    </div>
                )
            )}

            {adminTab === 'escalated' && (
                needsReviewVideos.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl text-center text-slate-500 border border-slate-200 dark:border-slate-700">
                        <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-300"/>
                        <p>No escalated items.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex gap-3 text-sm text-orange-800 mb-4">
                            <AlertTriangle size={20} className="shrink-0"/>
                            <p>These videos were marked as "Not Sure" by other admins. Please review them carefully.</p>
                        </div>
                        {needsReviewVideos.map(v => renderVideoCard(v, true, true))}
                    </div>
                )
            )}

            {adminTab === 'history' && (
                <div className="space-y-4">
                     {/* Search and Filter UI */}
                     <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search history..." 
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eggplant outline-none dark:text-white"
                            />
                        </div>
                        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                            {(['all', 'approved', 'rejected', 'needs_review'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setHistoryFilter(filter)}
                                    className={`px-3 py-2 text-xs font-bold capitalize transition-colors ${
                                        historyFilter === filter 
                                            ? 'bg-eggplant text-white' 
                                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {filter.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                     </div>

                     {historyVideos.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No matching records found.</p>
                     ) : (
                        historyVideos.map(video => {
                            const isExpanded = expandedHistoryId === video.id;
                            return (
                                <div 
                                    key={video.id} 
                                    onClick={() => setExpandedHistoryId(isExpanded ? null : video.id)}
                                    className={`bg-white dark:bg-slate-800 rounded-xl border transition-all cursor-pointer ${
                                        isExpanded 
                                            ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' 
                                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                                >
                                     <div className="p-4 flex justify-between items-center">
                                        <div className="flex-1 pr-4">
                                            <p className="font-bold text-slate-800 dark:text-white line-clamp-1">{video.title}</p>
                                            <p className="text-xs text-slate-500">{video.author}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                video.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                                video.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                                {video.status.replace('_', ' ')}
                                            </div>
                                            {isExpanded ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                                        </div>
                                     </div>
                                     
                                     {/* Expanded Details */}
                                     {isExpanded && (
                                         <div className="border-t border-slate-100 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-xl cursor-default" onClick={(e) => e.stopPropagation()}>
                                             {renderVideoCard(video, false)}
                                         </div>
                                     )}
                                </div>
                            );
                        })
                     )}
                </div>
            )}
          </div>
       </div>
    </div>
  );
};