import React, { useState } from "react";
import { Search, PlayCircle, User } from "lucide-react";
import { VideoType, UserType } from "../types";

export const GalleryView = ({ videos, onVideoClick, navigate, user }: { videos: VideoType[], onVideoClick: (id: number) => void, navigate: any, user: UserType }) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const categories = ["All", "Study Tips", "Mental Health", "Productivity", "Motivation", "Exam Prep"];

  // Filter logic
  const filteredVideos = videos.filter(v => {
    if (v.status !== 'approved') return false;
    if (filter !== "All" && v.category !== filter) return false;
    if (search) {
        const lower = search.toLowerCase();
        return v.title.toLowerCase().includes(lower) || (v as any).description?.toLowerCase().includes(lower) || v.author.toLowerCase().includes(lower);
    }
    return true;
  });

  const handleAvatarClick = (e: React.MouseEvent, uploaderId: string) => {
      e.stopPropagation();
      if (user && uploaderId === user.id) {
          navigate("profile");
      }
      // If we had public profiles, we would navigate to them here for other users
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Community Gallery</h2>
            <div className="w-full md:w-96 relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input
                    type="text"
                    placeholder="Search videos by title or author..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-eggplant dark:text-white text-sm shadow-sm"
                 />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 no-scrollbar">
             {categories.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setFilter(cat)}
                 className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === cat ? "bg-eggplant text-white shadow-md" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700"}`}
               >
                 {cat}
               </button>
             ))}
          </div>
       </div>

       {filteredVideos.length === 0 ? (
         <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 border-dashed">
            <Search className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No videos found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or filter.</p>
         </div>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
                <div key={video.id} onClick={() => onVideoClick(video.id)} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-slate-100 dark:border-slate-700 flex flex-col">
                    <div className={`aspect-video ${video.color} relative flex items-center justify-center`}>
                    <PlayCircle size={48} className="text-slate-900/50 group-hover:scale-110 transition-transform" />
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {video.views} views
                    </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-eggplant dark:text-teal-400 uppercase tracking-wide">{video.category}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">{video.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{video.description}</p>
                    <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                             <div 
                                onClick={(e) => handleAvatarClick(e, video.uploaderId)}
                                className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold hover:ring-2 ring-eggplant transition-all"
                                title={video.author}
                             >
                                 {video.author.charAt(0)}
                             </div>
                             <span className="font-bold">{video.author}</span>
                        </div>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">{video.grade}</span>
                    </div>
                    </div>
                </div>
            ))}
        </div>
       )}
    </div>
  );
};