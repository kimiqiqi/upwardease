import React, { useState, useEffect } from "react";
import { ShieldAlert, Clock, CheckCircle2, Video, X, HelpCircle, History, Search, AlertTriangle, ChevronDown, ChevronUp, Calendar, Edit3, MessageCircle, Flag, UserPlus, Users, Inbox, MailOpen, Mail } from "lucide-react";
import { UserType, VideoType, AdminRequestType, ReportType, ModerationLogType, ContactMessageType, VideoStatus } from "../types";
import { FadeIn } from "../components/FadeIn";
import { applyModerationVerdict, dismissReportForVideo } from "../utils/moderation";

export const AdminView = ({ 
  user, 
  navigate, 
  videos, 
  setVideos, 
  onVideoClick,
  adminRequests,
  setAdminRequests,
  users,
  setUsers,
  setUser,
  reports,
  setReports,
  moderationLogs,
  setModerationLogs,
  contactMessages,
  setContactMessages
}: { 
  user: UserType, 
  navigate: any, 
  videos: VideoType[], 
  setVideos: any, 
  onVideoClick: (id: number) => void,
  adminRequests: AdminRequestType[],
  setAdminRequests: (reqs: AdminRequestType[]) => void,
  users: NonNullable<UserType>[],
  setUsers: (users: NonNullable<UserType>[]) => void,
  setUser: (user: UserType) => void,
  reports: ReportType[],
  setReports: (reports: ReportType[]) => void,
  moderationLogs: ModerationLogType[],
  setModerationLogs: (logs: ModerationLogType[]) => void,
  contactMessages: ContactMessageType[],
  setContactMessages: React.Dispatch<React.SetStateAction<ContactMessageType[]>>
}) => {
  const [rejectReason, setRejectReason] = useState("");
  const [escalationNote, setEscalationNote] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [reviewAction, setReviewAction] = useState<'reject' | 'escalate' | 'update_note' | null>(null);
  const [adminTab, setAdminTab] = useState<'queue' | 'escalated' | 'history' | 'requests' | 'users' | 'reports' | 'inbox'>('queue');
  
  // History State
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<'all' | 'approved' | 'rejected' | 'removed'>('all');
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  // Admin Request Confirmation State
  const [confirmRequestAction, setConfirmRequestAction] = useState<{ id: string, action: 'approved' | 'rejected' } | null>(null);

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return (
      <div className="max-w-5xl mx-auto relative pb-12 text-center py-20">
        <FadeIn>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 border-dashed p-10 inline-block">
            <ShieldAlert className="mx-auto text-red-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">You do not have permission to view the admin dashboard.</p>
            <button onClick={() => navigate("home")} className="px-6 py-2 bg-eggplant text-white rounded-full font-bold hover:bg-eggplant/90 transition-colors">
              Return Home
            </button>
          </div>
        </FadeIn>
      </div>
    );
  }

  const handleVerdict = (id: number, status: 'approved' | 'rejected' | 'removed') => {
      const video = videos.find(v => v.id === id);
      if (!video) return;

      const { updatedVideo, logEntry } = applyModerationVerdict(
          video,
          status,
          user,
          status === 'rejected' ? rejectReason : undefined,
          undefined // Clear adminNotes on final verdict
      );

      setVideos((prev: VideoType[]) => prev.map(v => v.id === id ? updatedVideo : v));
      setModerationLogs([logEntry, ...moderationLogs]);

      // Reset states
      setRejectReason("");
      setEscalationNote("");
      setSelectedReviewId(null);
      setReviewAction(null);
  };

  const handleUpdateNotes = (id: number) => {
      setVideos((prev: VideoType[]) => prev.map(v => 
          v.id === id 
          ? { 
              ...v, 
              adminNotes: escalationNote
            } 
          : v
      ));
      
      const newLog: ModerationLogType = {
          id: `log-${Date.now()}`,
          actorId: user.id,
          action: 'update_note',
          targetType: 'video',
          targetId: id,
          timestamp: new Date().toISOString(),
          metadata: {
              reason: escalationNote
          }
      };
      setModerationLogs([newLog, ...moderationLogs]);

      // Reset states
      setRejectReason("");
      setEscalationNote("");
      setSelectedReviewId(null);
      setReviewAction(null);
  };


  const pendingVideos = videos.filter(v => v.status === 'pending' && !v.appealReason && v.reportCount === 0);
  const approvedVideos = videos.filter(v => v.status === 'approved');
  const rejectedVideos = videos.filter(v => v.status === 'rejected');
  const needsReviewVideos = videos.filter(v => !!v.appealReason || v.reportCount > 0);
  const pendingAdminRequests = adminRequests.filter(req => req.status === 'pending');
  const unreadMessagesCount = contactMessages.filter(m => m.status === 'unread').length;

  const handleAdminRequestVerdict = (requestId: string, status: 'approved' | 'rejected') => {
      setConfirmRequestAction({ id: requestId, action: status });
  };

  const confirmAdminRequestVerdict = () => {
      if (!confirmRequestAction) return;
      const { id: requestId, action: status } = confirmRequestAction;
      
      const request = adminRequests.find(r => r.id === requestId);
      if (!request) return;

      // Prevent self-approval/rejection and restrict to superadmin
      if (request.userId === user.id || user.role !== 'superadmin') {
          setConfirmRequestAction(null);
          return;
      }

      // Update request status
      const updatedRequests = adminRequests.map(r => 
          r.id === requestId ? { ...r, status, reviewedAt: new Date().toISOString(), reviewedBy: user.id } : r
      );
      setAdminRequests(updatedRequests);

      // If approved, update user role
      if (status === 'approved') {
          const updatedUsers = users.map(u => 
              u.id === request.userId ? { ...u, role: 'admin' as const } : u
          );
          setUsers(updatedUsers);
      }
      
      const newLog: ModerationLogType = {
          id: `log-${Date.now()}`,
          actorId: user.id,
          action: `admin_request_${status}`,
          targetType: 'admin_request',
          targetId: requestId,
          timestamp: new Date().toISOString()
      };
      setModerationLogs([newLog, ...moderationLogs]);

      setConfirmRequestAction(null);
  };
  
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
  }).sort((a, b) => {
      const dateA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
      const dateB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;
      return dateB - dateA;
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
      <FadeIn key={video.id} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${!isInteractive ? 'border-none shadow-none p-0' : 'border-slate-200 dark:border-slate-700 shadow-sm'}`}>
          <div 
            className={`flex gap-4 mb-4 ${isInteractive ? 'cursor-pointer group' : ''}`}
            onClick={() => isInteractive && onVideoClick(video.id)}
            title={isInteractive ? "Click to view details" : ""}
          >
              <div className={`w-32 h-20 ${video.color} rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative ${isInteractive ? 'group-hover:opacity-80 transition-opacity' : ''}`}>
                  {video.sourceType === 'youtube' && video.youtubeVideoId ? (
                      <img 
                          src={`https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`} 
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80"
                      />
                  ) : null}
                  <Video className="text-slate-400 absolute" />
              </div>
              <div className={`flex-1 ${isInteractive ? 'group-hover:opacity-80 transition-opacity' : ''}`}>
                  <h4 className="font-bold text-lg dark:text-white flex items-center justify-between">
                      {video.title}
                      {video.appealReason && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                              <MessageCircle size={12}/> APPEAL
                          </span>
                      )}
                      {video.reportReason && (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                              <Flag size={12}/> REPORTED
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
          
          {/* Display Report Reason Highlight */}
          {video.reportReason && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-900 dark:text-red-200">
                  <span className="font-bold block mb-1 flex items-center gap-1"><Flag size={12}/> Reported by User:</span>
                  "{video.reportReason}"
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
                        {formatDate(video.createdAt)}
                    </div>
                    {video.reviewedAt && (
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-green-500" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">Reviewed:</span>
                            {formatDate(video.reviewedAt)}
                        </div>
                    )}
                </div>

                {video.status === 'rejected' && video.reviewNote && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-sm text-red-800 dark:text-red-300">
                        <span className="font-bold block mb-1">Rejection Reason:</span>
                        {video.reviewNote}
                    </div>
                )}
                {video.adminNotes && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg text-sm text-orange-800 dark:text-orange-200">
                        <span className="font-bold block mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Admin Note:</span> 
                        {video.adminNotes}
                    </div>
                )}
             </div>
          )}

          {/* Interactive Action Area */}
          {isInteractive && (
             <>
                {/* Admin Note Display for Escalated Queue Items */}
                {isEscalatedQueue && video.adminNotes && !isActionSelected && (
                    <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg text-sm text-orange-800 dark:text-orange-200 flex justify-between items-start">
                        <div>
                            <span className="font-bold block mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Admin Note:</span> 
                            {video.adminNotes}
                        </div>
                        <button 
                            onClick={() => { setSelectedReviewId(video.id); setReviewAction('update_note'); setEscalationNote(video.adminNotes || ""); }}
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
                                onClick={() => reviewAction === 'reject' ? handleVerdict(video.id, 'rejected') : handleUpdateNotes(video.id)}
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
                                className="px-6 py-2.5 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-700 dark:hover:text-slate-200 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
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
                            className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 py-2.5 rounded-lg font-bold hover:bg-red-100 dark:hover:bg-red-900/40 text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <X size={18} /> Reject
                        </button>
                        <button 
                            onClick={() => { setSelectedReviewId(video.id); setReviewAction('escalate'); }}
                            className="flex-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 py-2.5 rounded-lg font-bold hover:bg-orange-100 dark:hover:bg-orange-900/40 text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <HelpCircle size={18} /> Not Sure
                        </button>
                    </div>
                )}
             </>
          )}
      </FadeIn>
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
       <FadeIn direction="down" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <ShieldAlert className="text-eggplant dark:text-teal-300" /> Admin Dashboard
            </h2>
            <div className="flex flex-wrap gap-2 items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                 <TabButton id="queue" label="Queue" count={pendingVideos.length} icon={Clock} />
                 <TabButton id="escalated" label="Needs Review" count={needsReviewVideos.length} icon={AlertTriangle} />
                 <TabButton id="reports" label="Reports" count={reports.filter(r => r.status === 'open').length} icon={Flag} />
                 <TabButton id="inbox" label="Inbox" count={unreadMessagesCount} icon={Inbox} />
                 {user?.role === 'superadmin' && <TabButton id="requests" label="Admin Requests" count={pendingAdminRequests.length} icon={UserPlus} />}
                 <TabButton id="history" label="History" icon={History} />
                 {user?.role === 'superadmin' && <TabButton id="users" label="Manage Users" icon={Users} />}
            </div>
       </FadeIn>

       <FadeIn direction="down" delay={100} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                 <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                    <Video size={24} />
                 </div>
                 <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingVideos.length}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                 </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                 <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <CheckCircle2 size={24} />
                 </div>
                 <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{approvedVideos.length}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
                 </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                 <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <X size={24} />
                 </div>
                 <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{rejectedVideos.length}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Rejected</p>
                 </div>
            </div>
       </FadeIn>

       <div className="w-full">
          <div className="space-y-6">
            <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
                {adminTab === 'queue' && <><Clock className="text-yellow-500"/> Review Queue</>}
                {adminTab === 'escalated' && <><AlertTriangle className="text-orange-500"/> Escalated Items</>}
                {adminTab === 'requests' && <><UserPlus className="text-purple-500"/> Admin Requests</>}
                {adminTab === 'history' && <><History className="text-blue-500"/> Review History</>}
                {adminTab === 'inbox' && <><Inbox className="text-teal-500"/> Contact Messages</>}
            </h3>
            
            {adminTab === 'queue' && (
                pendingVideos.length === 0 ? (
                    <FadeIn>
                        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl text-center text-slate-500 border border-slate-200 dark:border-slate-700">
                            <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500"/>
                            <p className="font-bold text-lg">All caught up!</p>
                            <p className="text-sm">No new videos waiting for review.</p>
                        </div>
                    </FadeIn>
                ) : (
                    <div className="space-y-4">
                        {pendingVideos.map(v => renderVideoCard(v, true, false))}
                    </div>
                )
            )}

            {adminTab === 'escalated' && (
                needsReviewVideos.length === 0 ? (
                    <FadeIn>
                        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl text-center text-slate-500 border border-slate-200 dark:border-slate-700">
                            <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-300"/>
                            <p>No escalated items.</p>
                        </div>
                    </FadeIn>
                ) : (
                    <div className="space-y-4">
                        <FadeIn className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-xl flex gap-3 text-sm text-orange-800 dark:text-orange-200 mb-4">
                            <AlertTriangle size={20} className="shrink-0"/>
                            <p>These videos were marked as "Not Sure" or flagged by users. Please review them carefully.</p>
                        </FadeIn>
                        {needsReviewVideos.map(v => renderVideoCard(v, true, true))}
                    </div>
                )
            )}

            {adminTab === 'requests' && user?.role === 'superadmin' && (
                pendingAdminRequests.length === 0 ? (
                    <FadeIn>
                        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl text-center text-slate-500 border border-slate-200 dark:border-slate-700">
                            <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-300"/>
                            <p>No pending admin requests.</p>
                        </div>
                    </FadeIn>
                ) : (
                    <div className="space-y-4">
                        {pendingAdminRequests.map(request => {
                            const applicant = users.find(u => u.id === request.userId);
                            return (
                                <FadeIn key={request.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-lg dark:text-white">{applicant?.name || 'Unknown User'}</h4>
                                            <p className="text-sm text-slate-500">{applicant?.email || applicant?.phone}</p>
                                        </div>
                                        <span className="text-xs text-slate-400">{formatDate(request.createdAt)}</span>
                                    </div>
                                    {request.appealReason ? (
                                        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/50 text-sm text-orange-800 dark:text-orange-200">
                                            <span className="font-bold block mb-1">Appeal Reason:</span>
                                            "{request.appealReason}"
                                        </div>
                                    ) : request.motivation ? (
                                        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
                                            <span className="font-bold block mb-1">Application Message:</span>
                                            "{request.motivation}"
                                        </div>
                                    ) : null}
                                    <div className="flex gap-4 pt-2">
                                        <button 
                                            onClick={() => handleAdminRequestVerdict(request.id, 'approved')}
                                            disabled={request.userId === user.id}
                                            className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-bold hover:bg-green-600 text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle2 size={18} /> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleAdminRequestVerdict(request.id, 'rejected')}
                                            disabled={request.userId === user.id}
                                            className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 py-2.5 rounded-lg font-bold hover:bg-red-100 dark:hover:bg-red-900/40 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <X size={18} /> Reject
                                        </button>
                                    </div>
                                    {request.userId === user.id && (
                                        <p className="text-xs text-red-500 mt-2 text-center font-bold">You cannot review your own request.</p>
                                    )}
                                </FadeIn>
                            );
                        })}
                    </div>
                )
            )}

            {adminTab === 'history' && (
                <div className="space-y-4">
                     {/* Search and Filter UI */}
                     <FadeIn className="flex flex-col sm:flex-row gap-4 mb-4">
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
                            {(['all', 'approved', 'rejected', 'removed'] as const).map((filter) => (
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
                     </FadeIn>

                     {historyVideos.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No matching records found.</p>
                     ) : (
                        historyVideos.map((video, index) => {
                            const isExpanded = expandedHistoryId === video.id;
                            return (
                                <FadeIn 
                                    key={video.id} 
                                    delay={index * 50}
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
                                                video.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                                                video.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
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
                                </FadeIn>
                            );
                        })
                     )}
                </div>
            )}

            {adminTab === 'users' && user?.role === 'superadmin' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h4 className="font-bold text-lg dark:text-white mb-4">Manage Users</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                                        <th className="pb-3 font-bold">Name</th>
                                        <th className="pb-3 font-bold">Email/Phone</th>
                                        <th className="pb-3 font-bold">Role</th>
                                        <th className="pb-3 font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <td className="py-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                                            <td className="py-3 text-slate-600 dark:text-slate-400">{u.email || u.phone}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    u.role === 'superadmin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                                    u.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                {u.id !== user.id && (
                                                    <select 
                                                        value={u.role}
                                                        onChange={(e) => {
                                                            const newRole = e.target.value as 'user' | 'admin' | 'superadmin';
                                                            const updatedUsers = users.map(userItem => userItem.id === u.id ? { ...userItem, role: newRole } : userItem);
                                                            setUsers(updatedUsers);
                                                        }}
                                                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-eggplant dark:text-white"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="superadmin">Superadmin</option>
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {adminTab === 'inbox' && (
                <div className="space-y-4">
                    {contactMessages.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <Inbox className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Inbox Empty</h3>
                            <p className="text-slate-500 dark:text-slate-400">No contact messages received yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {contactMessages.map((msg) => (
                                <div key={msg.id} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${msg.status === 'unread' ? 'border-teal-200 dark:border-teal-800 shadow-md' : 'border-slate-200 dark:border-slate-700 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                                {msg.status === 'unread' ? <Mail className="text-teal-500" size={18} /> : <MailOpen className="text-slate-400" size={18} />}
                                                {msg.subject}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                From: <span className="font-bold text-slate-700 dark:text-slate-300">{msg.name}</span> ({msg.email})
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs text-slate-400">{formatDate(msg.createdAt)}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                msg.status === 'unread' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                                                msg.status === 'replied' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                            }`}>
                                                {msg.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-4 whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm">
                                        {msg.message}
                                    </div>

                                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <a 
                                            href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                            onClick={() => {
                                                if (msg.status !== 'replied') {
                                                    setContactMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'replied' } : m));
                                                }
                                            }}
                                            className="flex-1 bg-eggplant text-white py-2 rounded-lg font-bold hover:bg-eggplant/90 text-sm transition-colors text-center"
                                        >
                                            Reply via Email
                                        </a>
                                        {msg.status === 'unread' ? (
                                            <button 
                                                onClick={() => setContactMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m))}
                                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-2 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm transition-colors"
                                            >
                                                Mark as Read
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => setContactMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'unread' } : m))}
                                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-2 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm transition-colors"
                                            >
                                                Mark as Unread
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {adminTab === 'reports' && (
                <div className="space-y-4">
                    {reports.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <Flag className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Reports</h3>
                            <p className="text-slate-500 dark:text-slate-400">There are currently no reports to review.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {reports.map((report) => {
                                const reportedVideo = videos.find(v => v.id === report.submissionId);
                                return (
                                    <div key={report.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                                    <Flag className="text-red-500" size={18} />
                                                    Reported Video: {reportedVideo?.title || 'Unknown Video'}
                                                </h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    Reported on {new Date().toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                report.status === 'open' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                report.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        
                                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 mb-4">
                                            <p className="font-bold text-red-900 dark:text-red-200 mb-1">Reason for Report:</p>
                                            <p className="text-red-800 dark:text-red-300 text-sm">{report.reason}</p>
                                            {report.details && (
                                                <p className="text-red-700 dark:text-red-400 text-sm mt-2 italic">"{report.details}"</p>
                                            )}
                                        </div>

                                        {report.status === 'open' && (
                                            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                                <button 
                                                    onClick={() => {
                                                        if (reportedVideo) onVideoClick(reportedVideo.id);
                                                    }}
                                                    className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 text-sm transition-colors"
                                                >
                                                    View Video
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        let currentLogs = [...moderationLogs];
                                                        if (reportedVideo) {
                                                            const { updatedVideo, logEntry } = dismissReportForVideo(reportedVideo, user);
                                                            setVideos(prev => prev.map(v => v.id === reportedVideo.id ? updatedVideo : v));
                                                            currentLogs = [logEntry, ...currentLogs];
                                                        }
                                                        const updatedReports = reports.map(r => r.submissionId === report.submissionId ? { ...r, status: 'dismissed', handledBy: user.id, handledAt: new Date().toISOString() } : r);
                                                        setReports(updatedReports as ReportType[]);
                                                        setModerationLogs(currentLogs);
                                                    }}
                                                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-2 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm transition-colors"
                                                >
                                                    Dismiss Report
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        let currentLogs = [...moderationLogs];
                                                        if (reportedVideo) {
                                                            const { updatedVideo, logEntry } = applyModerationVerdict(
                                                                reportedVideo,
                                                                'removed',
                                                                user,
                                                                undefined, // reviewNote
                                                                undefined  // adminNotes
                                                            );
                                                            setVideos(prev => prev.map(v => v.id === reportedVideo.id ? updatedVideo : v));
                                                            currentLogs = [logEntry, ...currentLogs];
                                                        }
                                                        const updatedReports = reports.map(r => r.submissionId === report.submissionId ? { ...r, status: 'resolved', actionTaken: 'Video removed', handledBy: user.id, handledAt: new Date().toISOString() } : r);
                                                        setReports(updatedReports as ReportType[]);
                                                        const reportLog: ModerationLogType = {
                                                            id: `log-${Date.now()}-report`,
                                                            actorId: user.id,
                                                            action: 'resolve_report',
                                                            targetType: 'report',
                                                            targetId: report.id,
                                                            timestamp: new Date().toISOString()
                                                        };
                                                        setModerationLogs([reportLog, ...currentLogs]);
                                                    }}
                                                    className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 text-sm transition-colors"
                                                >
                                                    Remove Video
                                                </button>
                                            </div>
                                        )}
                                        {report.status !== 'open' && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                                                Handled by Admin on {report.handledAt ? new Date(report.handledAt).toLocaleDateString() : 'Unknown'}
                                                {report.actionTaken && <span className="block mt-1 font-bold text-slate-700 dark:text-slate-300">Action: {report.actionTaken}</span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
          </div>
       </div>

       {/* Admin Request Confirmation Modal */}
       {confirmRequestAction && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Confirm Action</h3>
                       <button onClick={() => setConfirmRequestAction(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                           <X size={24} />
                       </button>
                   </div>
                   <p className="text-slate-600 dark:text-slate-300 mb-6">
                       Are you sure you want to <strong className={confirmRequestAction.action === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{confirmRequestAction.action}</strong> this admin application?
                       {confirmRequestAction.action === 'approved' && " This will grant the user admin privileges."}
                   </p>
                   <div className="flex gap-3">
                       <button 
                           onClick={() => setConfirmRequestAction(null)}
                           className="flex-1 py-2.5 rounded-xl font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                       >
                           Cancel
                       </button>
                       <button 
                           onClick={confirmAdminRequestVerdict}
                           className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors ${
                               confirmRequestAction.action === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                           }`}
                       >
                           Confirm
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};