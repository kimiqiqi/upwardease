import React, { useState } from "react";
import { ArrowLeft, PlayCircle, Star, Heart, Send, User } from "lucide-react";
import { VideoType, UserType, CommentType } from "../types";

export const VideoDetailView = ({ 
  video, 
  user, 
  navigate, 
  setVideos, 
  starredVideoIds, 
  setStarredVideoIds,
  videos
}: { 
  video: VideoType, 
  user: UserType, 
  navigate: any, 
  setVideos: any,
  starredVideoIds: number[],
  setStarredVideoIds: any,
  videos: VideoType[]
}) => {
  const [comment, setComment] = useState("");
  
  const isLiked = user && video.likedBy?.includes(user.id);
  const isStarred = starredVideoIds.includes(video.id);

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
            return { 
                ...v, 
                likes: v.likes + 1, 
                likedBy: [...likedBy, user.id] 
            };
        }
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
      }
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
        authorId: user.id
    };

    setVideos((prev: VideoType[]) => prev.map(v => {
        if (v.id === video.id) {
            return { ...v, comments: [newComment, ...(v.comments || [])] };
        }
        return v;
    }));

    setComment("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
       <button onClick={() => navigate("gallery")} className="flex items-center gap-2 text-slate-500 hover:text-eggplant dark:text-slate-400 dark:hover:text-white mb-6 font-bold">
         <ArrowLeft size={20} /> Back to Gallery
       </button>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <div className="rounded-3xl overflow-hidden shadow-lg bg-black relative group aspect-video">
                {video.videoUrl ? (
                    <video 
                        src={video.videoUrl} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain"
                    >
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className={`w-full h-full ${video.color} flex flex-col items-center justify-center`}>
                        <PlayCircle size={80} className="text-slate-900/50 mb-4" />
                        <p className="text-slate-500 font-bold bg-white/50 px-4 py-2 rounded-full">Video preview unavailable</p>
                    </div>
                )}
                
                {user && (
                    <button 
                        onClick={handleToggleStar}
                        className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-colors z-10 ${isStarred ? "bg-yellow-400 text-white" : "bg-black/30 text-white hover:bg-black/50"}`}
                        title={isStarred ? "Remove from favorites" : "Add to favorites"}
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
                    onClick={handleToggleLike} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${
                        isLiked 
                        ? "bg-red-500 text-white shadow-md" 
                        : "bg-slate-100 dark:bg-slate-700 text-eggplant dark:text-white hover:bg-eggplant hover:text-white"
                    }`}>
                      <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> {video.likes} {isLiked ? 'Liked' : 'Likes'}
                   </button>
                </div>
                {video.description && (
                    <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        {video.description}
                    </p>
                )}
             </div>

             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Comments ({video.comments?.length || 0})</h3>
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
                
                <div className="space-y-6">
                    {video.comments && video.comments.length > 0 ? (
                        video.comments.map((c) => (
                            <div key={c.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold">
                                    {c.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">{c.author}</span>
                                        <span className="text-xs text-slate-400">{formatDate(c.date)}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{c.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-400 py-4">
                           No comments yet. Be the first to share some love!
                        </div>
                    )}
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Related Videos</h3>
                <div className="space-y-4">
                   {videos.filter(v => v.id !== video.id && v.status === 'approved').slice(0, 3).map(v => (
                      <div key={v.id} className="flex gap-3 cursor-pointer group" onClick={() => { navigate("gallery"); }}> 
                         <div className={`w-24 h-16 ${v.color} rounded-lg flex-shrink-0 bg-cover bg-center`} style={v.videoUrl ? { backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))' } : {}}>
                            {!v.videoUrl && <div className="w-full h-full rounded-lg bg-opacity-50 flex items-center justify-center"><PlayCircle size={20} className="text-white/50"/></div>}
                         </div>
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