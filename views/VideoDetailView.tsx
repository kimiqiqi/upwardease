import React, { useState } from "react";
import { ArrowLeft, PlayCircle, Star, Heart, Send, User, Share2, ThumbsUp, Flag, AlertTriangle, X, CheckCircle2, HelpCircle, ShieldAlert, Lightbulb, Link as LinkIcon, Facebook, Twitter, Lock, FileText } from "lucide-react";
import { VideoType, UserType, CommentType, ReportType, ModerationLogType, TabType } from "../types";
import { FadeIn } from "../components/FadeIn";
import { getYouTubeEmbedUrl } from "../utils/youtube";
import { applyModerationVerdict } from "../utils/moderation";

export const VideoDetailView = ({ 
  video, 
  user, 
  navigate, 
  setVideos, 
  starredVideoIds, 
  setStarredVideoIds,
  videos,
  previousTab,
  addNotification,
  reports,
  setReports,
  moderationLogs,
  setModerationLogs
}: { 
  video: VideoType, 
  user: UserType, 
  navigate: (tab: TabType) => void, 
  setVideos: React.Dispatch<React.SetStateAction<VideoType[]>>,
  starredVideoIds: number[],
  setStarredVideoIds: React.Dispatch<React.SetStateAction<number[]>> | ((updater: number[] | ((prev: number[]) => number[])) => void),
  videos: VideoType[],
  previousTab?: TabType | "gallery",
  addNotification?: (targetUserId: string, message: string, type: 'like' | 'comment' | 'save' | 'system', linkId?: number) => void,
  reports?: ReportType[],
  setReports?: React.Dispatch<React.SetStateAction<ReportType[]>>,
  moderationLogs?: ModerationLogType[],
  setModerationLogs?: React.Dispatch<React.SetStateAction<ModerationLogType[]>>
}) => {
  const [comment, setComment] = useState("");
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  
  // Admin Review State
  const [adminAction, setAdminAction] = useState<'approve' | 'reject' | 'escalate' | null>(null);
  const [internalNote, setInternalNote] = useState(video.adminNotes || "");
  const [rejectionFeedback, setRejectionFeedback] = useState("");

  const MAX_COMMENT_LENGTH = 500;
  
  const isLiked = user && video.likedBy?.includes(user.id);
  const isStarred = starredVideoIds.includes(video.id);
  
  // Check if current user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  // Check if video is in a reviewable state
  const isReviewable = video.status === 'pending';
  const showAdminReviewPanel = isAdmin && isReviewable;

  // Enforce video visibility based on user roles
  if (video.status !== 'approved' && !isAdmin && video.submittedBy !== user?.id) {
    return (
      <div className="max-w-5xl mx-auto relative pb-12 text-center py-20">
        <FadeIn>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 border-dashed p-10 inline-block">
            <ShieldAlert className="mx-auto text-red-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">This video is currently under review or has not been approved for public viewing.</p>
            <button onClick={() => navigate("gallery")} className="px-6 py-2 bg-eggplant text-white rounded-full font-bold hover:bg-eggplant/90 transition-colors">
              Return to Gallery
            </button>
          </div>
        </FadeIn>
      </div>
    );
  }

  const handleToggleLike = () => {
    if (!user) {
        navigate("login");
        return;
    }
    
    setVideos((prev: VideoType[]) => prev.map(v => {
        if (v.id !== video.id) return v;
        
        const likedBy = v.likedBy || [];
        const currentlyLiked = likedBy.includes(user.id);
        
        if (currentlyLiked) {
            return { 
                ...v, 
                likes: Math.max(0, v.likes - 1), 
                likedBy: likedBy.filter(id => id !== user.id) 
            };
        } else {
            // Simulate notifying the author ONLY if it's not their own video
            if (addNotification && v.submittedBy !== user.id) {
                addNotification(v.submittedBy, `${user.name} liked your video "${v.title}"`, 'like', v.id);
            }
            return { 
                ...v, 
                likes: v.likes + 1, 
                likedBy: [...likedBy, user.id] 
            };
        }
    }));
  };

  const handleToggleCommentLike = (commentId: number) => {
      if (!user) {
          navigate("login");
          return;
      }
      
      setVideos((prev: VideoType[]) => prev.map(v => {
          if (v.id !== video.id) return v;
          
          const updatedComments = v.comments.map(c => {
              if (c.id !== commentId) return c;
              
              const likedBy = c.likedBy || [];
              const currentlyLiked = likedBy.includes(user.id);
              
              if (currentlyLiked) {
                  return {
                      ...c,
                      likes: Math.max(0, (c.likes || 0) - 1),
                      likedBy: likedBy.filter(id => id !== user.id)
                  };
              } else {
                  if (addNotification && c.authorId !== user.id) {
                      addNotification(c.authorId, `${user.name} liked your comment on "${video.title}"`, 'like', video.id);
                  }
                  return {
                      ...c,
                      likes: (c.likes || 0) + 1,
                      likedBy: [...likedBy, user.id]
                  };
              }
          });
          
          return { ...v, comments: updatedComments };
      }));
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
          if (addNotification && video.submittedBy !== user.id) {
              addNotification(video.submittedBy, `${user.name} saved your video "${video.title}"`, 'save', video.id);
          }
      }
  };

  const handleShare = async () => {
    const siteUrl = window.location.origin;
    const shareData = {
        title: video.title,
        text: `Check out "${video.title}" by ${video.author} on UpwardEase!`,
        url: siteUrl
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return;
        } catch (err) {
            console.log('Error sharing:', err);
        }
    }
    
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    try {
        const siteUrl = window.location.origin;
        const shareText = `Check out "${video.title}" by ${video.author} on UpwardEase! ${siteUrl}`;
        await navigator.clipboard.writeText(shareText);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
  };

  const handleReport = () => {
      if (!user) {
          navigate("login");
          return;
      }
      setIsReporting(true);
  };

  const submitReport = (e: React.FormEvent) => {
      e.preventDefault();
      if (!reportReason.trim()) return;

      if (setReports) {
          const newReport: ReportType = {
              id: `report-${Date.now()}`,
              submissionId: video.id,
              reportedBy: user?.id || 'anonymous',
              reason: reportReason,
              status: 'open'
          };
          setReports((prev: ReportType[]) => [...prev, newReport]);
      }

      setVideos((prev: VideoType[]) => prev.map(v => {
          if (v.id === video.id) {
              return {
                  ...v,
                  reportReason: reportReason,
                  reportCount: (v.reportCount || 0) + 1
              };
          }
          return v;
      }));

      setIsReporting(false);
      setReportReason("");
      alert("Video has been reported for review. Thank you for helping keep our community safe.");
  };
  
  const handleAdminVerdict = (status: 'approved' | 'rejected' | 'removed') => {
      if (!user) return;
      
      const { updatedVideo, logEntry } = applyModerationVerdict(
          video,
          status,
          user,
          status === 'rejected' ? rejectionFeedback : undefined,
          internalNote || undefined
      );

      setVideos((prev: VideoType[]) => prev.map(v => v.id === video.id ? updatedVideo : v));
      
      if (setModerationLogs) {
          setModerationLogs((prev: ModerationLogType[]) => [logEntry, ...prev]);
      }
      
      // Navigate back to admin dashboard after decision
      navigate('admin');
  };

  const handleUpdateNotes = () => {
      setVideos((prev: VideoType[]) => prev.map(v => {
          if (v.id === video.id) {
              return { 
                  ...v, 
                  adminNotes: internalNote
              };
          }
          return v;
      }));
      
      if (setModerationLogs && user) {
          const newLog: ModerationLogType = {
              id: `log-${Date.now()}`,
              actorId: user.id,
              action: 'update_note',
              targetType: 'video',
              targetId: video.id,
              timestamp: new Date().toISOString()
          };
          setModerationLogs((prev: ModerationLogType[]) => [newLog, ...prev]);
      }
      
      // Navigate back to admin dashboard after decision
      navigate('admin');
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !comment.trim()) return;
    
    if (!user) {
        navigate("login");
        return;
    }

    const newComment: CommentType = {
        id: Date.now(),
        author: user.name,
        text: comment.trim(),
        date: new Date().toISOString(),
        authorId: user.id,
        likes: 0,
        likedBy: []
    };

    setVideos((prev: VideoType[]) => prev.map(v => {
        if (v.id === video.id) {
            return { ...v, comments: [newComment, ...(v.comments || [])] };
        }
        return v;
    }));

    if (addNotification && video.submittedBy !== user.id) {
        addNotification(video.submittedBy, `${user.name} commented on your video "${video.title}"`, 'comment', video.id);
    }

    setComment("");
  };

  const handleAvatarClick = () => {
      if (user && video.submittedBy === user.id) {
          navigate("profile");
      }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
  };

  return (
    <div className="max-w-5xl mx-auto relative pb-12">
       {/* Share Modal */}
       {showShareModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowShareModal(false)}>
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Share Video</h3>
                       <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                           <X size={24} />
                       </button>
                   </div>
                   <div className="space-y-3">
                       <button 
                           onClick={handleCopyLink}
                           className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors font-bold text-slate-700 dark:text-slate-200"
                       >
                           <LinkIcon size={20} /> 
                           <span className="flex-1 text-left">Copy Link</span>
                           {showShareTooltip && <span className="text-xs text-green-500 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Copied!</span>}
                       </button>
                       <a 
                           href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${video.title}" by ${video.author} on UpwardEase!`)}&url=${encodeURIComponent(window.location.origin)}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full flex items-center gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors font-bold text-sky-600 dark:text-sky-400"
                       >
                           <Twitter size={20} /> Share on X
                       </a>
                       <a 
                           href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-bold text-blue-600 dark:text-blue-400"
                       >
                           <Facebook size={20} /> Share on Facebook
                       </a>
                   </div>
               </div>
           </div>
       )}

       {/* Report Modal */}
       {isReporting && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
                   <div className="flex justify-between items-center mb-4 text-red-600 dark:text-red-400">
                       <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                           <AlertTriangle size={24} /> Report Video
                       </h3>
                       <button onClick={() => setIsReporting(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                           <X size={24} />
                       </button>
                   </div>
                   <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
                       Please describe why you are reporting this video. Our admin team will review it shortly.
                   </p>
                   <form onSubmit={submitReport}>
                       <textarea
                           value={reportReason}
                           onChange={(e) => setReportReason(e.target.value)}
                           className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-red-500 dark:text-white mb-4"
                           placeholder="e.g. Inappropriate language, bullying, misinformation..."
                           rows={4}
                           autoFocus
                           required
                       />
                       <div className="flex gap-3">
                           <button 
                               type="button"
                               onClick={() => setIsReporting(false)}
                               className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                           >
                               Cancel
                           </button>
                           <button 
                               type="submit"
                               className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                           >
                               Submit Report
                           </button>
                       </div>
                   </form>
               </div>
           </div>
       )}

       <button onClick={() => navigate(previousTab || "gallery")} className="flex items-center gap-2 text-slate-500 hover:text-eggplant dark:text-slate-400 dark:hover:text-white mb-6 font-bold">
         <ArrowLeft size={20} /> 
         {previousTab === "profile" ? "Back to My Page" : previousTab === "admin" ? "Back to Dashboard" : "Back to Gallery"}
       </button>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <FadeIn>
             <div className="rounded-3xl overflow-hidden shadow-lg bg-black relative group aspect-video flex items-center justify-center">
                {video.sourceType === 'youtube' && video.youtubeVideoId ? (
                    <>
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse z-0">
                            <PlayCircle size={48} className="text-slate-600" />
                        </div>
                        <iframe
                            src={getYouTubeEmbedUrl(video.youtubeVideoId)}
                            title={video.title}
                            className="w-full h-full border-0 relative z-10"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            onLoad={(e) => {
                                const target = e.target as HTMLIFrameElement;
                                target.style.opacity = '1';
                            }}
                            style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                        ></iframe>
                    </>
                ) : video.youtubeVideoId ? (
                    <iframe 
                        src={`https://www.youtube.com/embed/${video.youtubeVideoId}`} 
                        title={`Video ${video.id}`}
                        className="w-full h-full border-0 relative z-10"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={(e) => {
                            const target = e.target as HTMLIFrameElement;
                            target.style.opacity = '1';
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                    ></iframe>
                ) : (
                    <div className={`w-full h-full ${video.color} flex flex-col items-center justify-center`}>
                        <PlayCircle size={80} className="text-slate-900/50 mb-4" />
                        <p className="text-slate-500 dark:text-slate-300 font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full">Video preview unavailable</p>
                    </div>
                )}
                
                {/* Fallback for video tag error */}
                {video.youtubeVideoId && (
                    <div className="hidden absolute inset-0 flex-col items-center justify-center bg-slate-900 text-white z-20">
                        <AlertTriangle size={48} className="text-red-500 mb-4" />
                        <p className="font-bold">Failed to load video</p>
                        <p className="text-sm text-slate-400 mt-2">The video file might be corrupted or unavailable.</p>
                    </div>
                )}
                
                {user && !showAdminReviewPanel && (
                    <button 
                        onClick={handleToggleStar}
                        className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-colors z-10 ${isStarred ? "bg-yellow-400 text-white" : "bg-black/30 text-white hover:bg-black/50"}`}
                        title={isStarred ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Star size={24} fill={isStarred ? "currentColor" : "none"} />
                    </button>
                )}
             </div>
             </FadeIn>
             
             {/* Admin Review Controls */}
             {showAdminReviewPanel && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold font-serif mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                        <ShieldAlert className="text-eggplant dark:text-teal-400" /> Admin Review
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
                        Review this content against community guidelines.
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <Lock size={14} className="text-slate-400"/> Internal Admin Notes <span className="text-slate-400 font-normal text-xs">(Visible only to admins)</span>
                        </label>
                        <textarea 
                            value={internalNote}
                            onChange={(e) => setInternalNote(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-eggplant outline-none text-sm"
                            rows={3}
                            placeholder="Add internal context, concerns, or notes for other admins..."
                        />
                    </div>

                    {!adminAction ? (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => setAdminAction('approve')}
                                className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 /> Approve Video
                            </button>
                            <button 
                                onClick={() => setAdminAction('reject')}
                                className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-200 border border-red-200 dark:border-red-800 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                            >
                                <X /> Reject
                            </button>
                            <button 
                                onClick={() => setAdminAction('escalate')}
                                className="flex-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-200 border border-orange-200 dark:border-orange-800 py-3 rounded-xl font-bold hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors flex items-center justify-center gap-2"
                            >
                                <HelpCircle /> Not Sure
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-top-2 border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
                            {adminAction === 'approve' ? (
                                <div className="mb-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30 text-center">
                                    <p className="font-bold text-green-800 dark:text-green-300 mb-1 text-lg">Confirm Approval?</p>
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        This video will become visible to the community immediately.
                                    </p>
                                </div>
                            ) : adminAction === 'reject' ? (
                                <>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Reason for Rejection <span className="text-red-500 text-xs font-normal">(Visible to User)</span>
                                    </label>
                                    <textarea 
                                        value={rejectionFeedback}
                                        onChange={(e) => setRejectionFeedback(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-eggplant outline-none mb-4"
                                        rows={3}
                                        placeholder="e.g. Content contains inappropriate language. Please review guidelines..."
                                        autoFocus
                                    />
                                </>
                            ) : (
                                <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 text-center">
                                    <p className="font-bold text-orange-800 dark:text-orange-300 mb-1 text-lg">Confirm Escalation?</p>
                                    <p className="text-sm text-orange-700 dark:text-orange-400">
                                        This will mark the video as "Needs Review" for senior admins. Ensure you've added an internal note above.
                                    </p>
                                </div>
                            )}
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { setAdminAction(null); setRejectionFeedback(""); }}
                                    className="px-6 py-2.5 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => adminAction === 'escalate' ? handleUpdateNotes() : handleAdminVerdict(adminAction === 'approve' ? 'approved' : 'rejected')}
                                    disabled={(adminAction === 'reject' && !rejectionFeedback.trim())}
                                    className={`flex-1 py-2.5 rounded-lg font-bold transition-colors text-white ${
                                        adminAction === 'approve' ? 'bg-green-500 hover:bg-green-600' :
                                        adminAction === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Confirm {adminAction === 'approve' ? 'Approval' : adminAction === 'reject' ? 'Rejection' : 'Escalation'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
             )}

             {/* Read-only Admin Info for non-reviewable videos */}
             {isAdmin && !isReviewable && (
                 <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-4">
                     <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                         <ShieldAlert size={14} /> Admin Details
                     </h3>
                     <div className="space-y-3">
                         <div className="flex flex-col sm:flex-row gap-4 text-sm">
                             <div>
                                 <span className="text-slate-500 dark:text-slate-400">Status:</span>
                                 <span className={`ml-2 font-bold uppercase ${
                                     video.status === 'approved' ? 'text-green-600' : 'text-red-600'
                                 }`}>{video.status}</span>
                             </div>
                             {video.publishedAt && (
                                 <div>
                                     <span className="text-slate-500 dark:text-slate-400">Decision Date:</span>
                                     <span className="ml-2 dark:text-slate-300">{formatDate(video.publishedAt)}</span>
                                 </div>
                             )}
                         </div>
                         
                         {video.adminNotes && (
                             <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                     <Lock size={12} /> Internal Note
                                 </p>
                                 <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{video.adminNotes}</p>
                             </div>
                         )}
                         
                         {video.reviewNote && (
                             <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                 <p className="text-xs font-bold text-red-500 mb-1 flex items-center gap-1">
                                     <FileText size={12} /> User Feedback (Rejection Reason)
                                 </p>
                                 <p className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap">{video.reviewNote}</p>
                             </div>
                         )}
                     </div>
                 </div>
             )}

             <FadeIn delay={100}>
                <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">{video.title}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                      <div 
                        onClick={handleAvatarClick}
                        className={`w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-white ${user && video.submittedBy === user.id ? 'cursor-pointer hover:ring-2 ring-eggplant' : ''}`}
                        title={user && video.submittedBy === user.id ? "Go to my profile" : video.author}
                      >
                         {video.author.charAt(0)}
                      </div>
                      <div>
                         <p className="font-bold text-slate-900 dark:text-white">{video.author}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{video.grade} • {formatDate(video.createdAt)}</p>
                      </div>
                   </div>
                   
                   {!showAdminReviewPanel && (
                   <div className="flex items-center gap-3">
                       {isAdmin && (
                           <>
                               <button 
                                   onClick={() => {
                                       if (window.confirm("Are you sure you want to delete this video?")) {
                                           setVideos((prev: VideoType[]) => prev.filter(v => v.id !== video.id));
                                           navigate("gallery");
                                       }
                                   }}
                                   className="p-2.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                   title="Delete Video"
                               >
                                   <X size={20} />
                               </button>
                               <button 
                                   onClick={() => {
                                       setVideos((prev: VideoType[]) => prev.map(v => v.id === video.id ? { ...v, adminNotes: 'Escalated from Video Detail', isEscalated: true } : v));
                                       alert("Video escalated for review.");
                                       navigate("admin");
                                   }}
                                   className="p-2.5 rounded-full text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                                   title="Escalate (Needs Review)"
                               >
                                   <AlertTriangle size={20} />
                               </button>
                           </>
                       )}
                       <button 
                            onClick={handleReport}
                            className="p-2.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Report Video"
                       >
                            <Flag size={20} />
                       </button>
                       
                       <button 
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 relative group"
                        >
                            <Share2 size={18} /> 
                            <span className="hidden sm:inline">Share</span>
                        </button>

                       <button 
                        onClick={handleToggleLike} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${
                            isLiked 
                            ? "bg-red-500 text-white shadow-md" 
                            : "bg-slate-100 dark:bg-slate-700 text-eggplant dark:text-white hover:bg-eggplant hover:text-white"
                        }`}>
                          <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> {video.likes} <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Likes'}</span>
                       </button>
                   </div>
                   )}
                </div>
                {video.description && (
                    <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        {video.description}
                    </p>
                )}
             </FadeIn>

             {!showAdminReviewPanel && (
             <FadeIn delay={200} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Comments ({video.comments?.length || 0})</h3>
                {user ? (
                   <form onSubmit={handlePostComment} className="flex gap-4 mb-8">
                      <div className="w-10 h-10 rounded-full bg-accent-green flex-shrink-0 flex items-center justify-center text-white font-bold">{user.name.charAt(0)}</div>
                      <div className="flex-1">
                          <div className="relative">
                            <input 
                                type="text" 
                                value={comment}
                                maxLength={MAX_COMMENT_LENGTH}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-eggplant dark:text-white"
                                placeholder="Add a supportive comment..."
                            />
                            <button 
                                type="submit" 
                                disabled={!comment.trim()}
                                className="absolute right-2 top-2 p-1 text-eggplant dark:text-teal-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                          </div>
                          <div className={`text-xs text-right mt-1 font-bold ${comment.length >= MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-slate-400'}`}>
                              {comment.length}/{MAX_COMMENT_LENGTH}
                          </div>
                      </div>
                   </form>
                ) : (
                   <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center text-sm text-slate-500 mb-6">
                      Please <button onClick={() => navigate("login")} className="text-eggplant font-bold underline">log in</button> to join the conversation.
                   </div>
                )}
                
                <div className="space-y-6">
                    {video.comments && video.comments.length > 0 ? (
                        video.comments.map((c) => {
                            const isCommentLiked = user && c.likedBy?.includes(user.id);
                            return (
                                <div key={c.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold">
                                        {c.author.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">{c.author}</span>
                                            <span className="text-xs text-slate-400">{formatDate(c.date)}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{c.text}</p>
                                        
                                        <div className="mt-2 flex items-center gap-4">
                                            <button 
                                                onClick={() => handleToggleCommentLike(c.id)}
                                                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                                                    isCommentLiked 
                                                    ? 'text-red-500' 
                                                    : 'text-slate-400 hover:text-eggplant dark:hover:text-white'
                                                }`}
                                            >
                                                <Heart size={14} fill={isCommentLiked ? "currentColor" : "none"} />
                                                {c.likes || 0}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-slate-400 py-4">
                           No comments yet.
                        </div>
                    )}
                </div>
             </FadeIn>
             )}
          </div>

          <div className="space-y-6">
             {showAdminReviewPanel ? (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 sticky top-24">
                   <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2 font-serif">
                       <Lightbulb size={20} className="text-yellow-500" /> Review Guidelines
                   </h3>
                   <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex gap-3">
                         <div className="mt-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-full h-fit"><CheckCircle2 size={14}/></div>
                         <div>
                             <strong className="block text-slate-800 dark:text-white mb-0.5">Safety Check</strong>
                             Ensure no bullying, hate speech, or inappropriate content is present.
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <div className="mt-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-full h-fit"><CheckCircle2 size={14}/></div>
                         <div>
                             <strong className="block text-slate-800 dark:text-white mb-0.5">PII Screening</strong>
                             Verify no Personal Identifiable Information (phone, address, etc.) is shared.
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <div className="mt-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-full h-fit"><CheckCircle2 size={14}/></div>
                         <div>
                             <strong className="block text-slate-800 dark:text-white mb-0.5">Category Match</strong>
                             Confirm the content matches the selected category tag.
                         </div>
                      </div>
                      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                         <strong>Tip:</strong> Use internal notes to document your decision process for other admins.
                      </div>
                   </div>
                </div>
             ) : (
                <FadeIn delay={300} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 dark:text-white">Related Videos</h3>
                    <div className="space-y-4">
                    {videos.filter(v => v.id !== video.id && v.status === 'approved').slice(0, 3).map(v => (
                        <div key={v.id} className="flex gap-3 cursor-pointer group" onClick={() => { navigate("gallery"); }}> 
                            <div className={`w-24 h-16 ${v.color} rounded-lg flex-shrink-0 bg-cover bg-center`} style={v.youtubeVideoId ? { backgroundImage: `url(https://img.youtube.com/vi/${v.youtubeVideoId}/maxresdefault.jpg)` } : {}}>
                                {!v.youtubeVideoId && <div className="w-full h-full rounded-lg bg-opacity-50 flex items-center justify-center"><PlayCircle size={20} className="text-white/50"/></div>}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-2 group-hover:text-eggplant transition-colors">{v.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{v.author}</p>
                            </div>
                        </div>
                    ))}
                    </div>
                </FadeIn>
             )}
          </div>
       </div>
    </div>
  );
};