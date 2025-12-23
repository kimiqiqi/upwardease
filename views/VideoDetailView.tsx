import React, { useState } from "react";
import { ArrowLeft, PlayCircle, Star, Heart, Send } from "lucide-react";
import { VideoType, UserType } from "../types";

export const VideoDetailView = ({ 
  video, 
  user, 
  navigate, 
  setVideos, 
  starredVideoIds, 
  setStarredVideoIds,
  videos // Added full list for related videos
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
                {video.description && (
                    <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        {video.description}
                    </p>
                )}
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
                   {videos.filter(v => v.id !== video.id && v.status === 'approved').slice(0, 3).map(v => (
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