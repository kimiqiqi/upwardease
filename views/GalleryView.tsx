import React, { useState, useMemo } from "react";
import { Search, PlayCircle, User, ArrowUpDown, Star } from "lucide-react";
import { VideoType, UserType, TabType } from "../types";
import { FadeIn } from "../components/FadeIn";

type SortOption = "newest" | "oldest" | "most_viewed" | "most_liked";

export const GalleryView = ({ videos, onVideoClick, navigate, user }: { videos: VideoType[], onVideoClick: (id: number) => void, navigate: (tab: TabType) => void, user: UserType }) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const categories = ["All", "Study Tips", "Mental Health", "Productivity", "Motivation", "Exam Prep"];

  // Filter and Sort logic
  const filteredAndSortedVideos = useMemo(() => {
    let result = videos.filter(v => {
      if (v.status !== 'approved') return false;
      
      // Filter by Category or Tags
      if (filter !== "All") {
          const matchesCategory = v.category === filter;
          const matchesTags = v.tags ? v.tags.includes(filter) : false;
          
          if (!matchesCategory && !matchesTags) return false;
      }

      // Filter by Search Text
      if (search) {
          const lower = search.toLowerCase();
          return v.title.toLowerCase().includes(lower) || 
                 v.description?.toLowerCase().includes(lower) || 
                 v.author.toLowerCase().includes(lower);
      }
      return true;
    });

    // Sort logic
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most_viewed":
          return b.views - a.views;
        case "most_liked":
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    return result;
  }, [videos, filter, search, sortBy]);

  const featuredVideos = useMemo(() => {
      return videos.filter(v => v.status === 'approved' && v.featured);
  }, [videos]);

  const handleAvatarClick = (e: React.MouseEvent, uploaderId: string) => {
      e.stopPropagation();
      if (user && uploaderId === user.id) {
          navigate("profile");
      }
      // If we had public profiles, we would navigate to them here for other users
  };

  return (
    <div className="space-y-8">
       <FadeIn direction="down" className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Community Gallery</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="w-full md:w-80 relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input
                      type="text"
                      placeholder="Search videos by title or author..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-eggplant dark:text-white text-sm shadow-sm"
                   />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full sm:w-auto appearance-none pl-10 pr-8 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-eggplant dark:text-white text-sm shadow-sm cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_viewed">Most Viewed</option>
                  <option value="most_liked">Most Liked</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
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
       </FadeIn>

       {featuredVideos.length > 0 && filter === "All" && !search && (
           <FadeIn direction="up" className="mb-12">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                   <Star className="text-yellow-500" size={20} /> Featured Stories
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {featuredVideos.slice(0, 3).map((video, index) => (
                       <FadeIn key={`featured-${video.id}`} delay={index * 50}>
                           <div onClick={() => onVideoClick(video.id)} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group border-2 border-yellow-400 dark:border-yellow-500 flex flex-col h-full relative">
                               <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-10 shadow-sm flex items-center gap-1">
                                   <Star size={12} fill="currentColor" /> Featured
                               </div>
                               <div className={`aspect-video ${video.color} relative flex items-center justify-center overflow-hidden`}>
                                   {video.sourceType === 'youtube' && video.youtubeVideoId ? (
                                       <img 
                                           src={`https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`} 
                                           alt={video.title}
                                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                       />
                                   ) : video.videoUrl ? (
                                       <video 
                                           src={video.videoUrl} 
                                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                       />
                                   ) : (
                                       <PlayCircle className="text-white/50 group-hover:scale-110 transition-transform" size={48} />
                                   )}
                                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                               </div>
                               <div className="p-5 flex flex-col flex-grow">
                                   <div className="flex justify-between items-start mb-2">
                                       <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight group-hover:text-eggplant dark:group-hover:text-teal-400 transition-colors">{video.title}</h4>
                                   </div>
                                   <div className="flex items-center gap-2 mb-3">
                                       <div 
                                           className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600 hover:ring-2 hover:ring-eggplant/50 transition-all cursor-pointer"
                                           onClick={(e) => handleAvatarClick(e, video.submittedBy)}
                                       >
                                           <User size={12} className="text-slate-500 dark:text-slate-400" />
                                       </div>
                                       <p className="text-sm text-slate-600 dark:text-slate-400 font-medium hover:text-eggplant dark:hover:text-teal-400 transition-colors cursor-pointer" onClick={(e) => handleAvatarClick(e, video.submittedBy)}>
                                           {video.author}
                                       </p>
                                   </div>
                                   {video.description && (
                                       <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow">{video.description}</p>
                                   )}
                                   <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                                       <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">{video.category}</span>
                                       <span>{video.views} views</span>
                                   </div>
                               </div>
                           </div>
                       </FadeIn>
                   ))}
               </div>
           </FadeIn>
       )}

       {filteredAndSortedVideos.length === 0 ? (
         <FadeIn>
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 border-dashed">
                <Search className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No videos found</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm">Try adjusting your search or filter.</p>
            </div>
         </FadeIn>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedVideos.map((video, index) => (
                <FadeIn key={video.id} delay={index * 50}>
                    <div onClick={() => onVideoClick(video.id)} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-slate-100 dark:border-slate-700 flex flex-col h-full">
                        <div className={`aspect-video ${video.color} relative flex items-center justify-center overflow-hidden`}>
                            {video.sourceType === 'youtube' && video.youtubeVideoId ? (
                                <img 
                                    src={`https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`} 
                                    alt={video.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            ) : video.videoUrl ? (
                                <video 
                                    src={video.videoUrl} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            ) : null}
                            <PlayCircle size={48} className="text-slate-900/50 group-hover:scale-110 transition-transform absolute" />
                            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                            <div className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                {video.views} views
                            </div>
                            {(user?.role === 'admin' || user?.role === 'superadmin') && video.status !== 'approved' && (
                                <div className={`text-xs px-2 py-1 rounded font-bold backdrop-blur-sm ${
                                    video.status === 'pending' ? 'bg-yellow-500/80 text-white' :
                                    video.status === 'rejected' ? 'bg-red-500/80 text-white' :
                                    'bg-orange-500/80 text-white'
                                }`}>
                                    {video.status.replace('_', ' ')}
                                </div>
                            )}
                        </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-eggplant dark:text-teal-400 uppercase tracking-wide">{video.category}</span>
                            {video.tags && video.tags.length > 1 && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">+{video.tags.length - 1}</span>
                            )}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">{video.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{video.description}</p>
                        <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <div 
                                    onClick={(e) => handleAvatarClick(e, video.submittedBy)}
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
                </FadeIn>
            ))}
        </div>
       )}
    </div>
  );
};