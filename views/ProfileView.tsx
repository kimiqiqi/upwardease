import React, { useState } from "react";
import { Plus, AlertCircle, PlayCircle } from "lucide-react";
import { UserType, VideoType } from "../types";

export const ProfileView = ({ user, videos, starredVideoIds, historyVideoIds, onVideoClick, navigate }: { user: UserType, videos: VideoType[], starredVideoIds: number[], historyVideoIds: number[], onVideoClick: (id: number) => void, navigate: any }) => {
    const [tab, setTab] = useState<"uploads" | "favorites" | "history">("uploads");

    if (!user) return null;

    const myUploads = videos.filter(v => v.uploaderId === user.id);
    const myFavorites = videos.filter(v => starredVideoIds.includes(v.id));
    const myHistory = videos.filter(v => historyVideoIds.includes(v.id));

    const VideoList = ({ items, showStatus }: { items: VideoType[], showStatus?: boolean }) => {
        if (items.length === 0) return <div className="text-center py-12 text-slate-500">No videos found.</div>;
        
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(video => (
                    <div key={video.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                        <div onClick={() => video.status === 'approved' && onVideoClick(video.id)} className={`aspect-video ${video.color} relative flex items-center justify-center ${video.status === 'approved' ? 'cursor-pointer' : 'opacity-75'}`}>
                            <PlayCircle size={48} className="text-slate-900/50" />
                            {showStatus && (
                                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold uppercase ${
                                    video.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    video.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {video.status}
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{video.title}</h3>
                            <p className="text-xs text-slate-500">{video.views} views</p>
                            
                            {showStatus && video.status === 'rejected' && video.feedback && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900 text-xs">
                                    <p className="font-bold text-red-800 dark:text-red-400 mb-1">Admin Feedback:</p>
                                    <p className="text-red-700 dark:text-red-300">{video.feedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-accent-green flex items-center justify-center text-white text-3xl font-serif font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">My Page</h2>
                        <p className="text-slate-500">{user.role === 'admin' ? 'Admin / Volunteer' : 'Student Member'}</p>
                    </div>
                </div>
                
                {tab === 'uploads' && (
                    <button 
                        onClick={() => navigate("upload")}
                        className="bg-white dark:bg-slate-700 text-eggplant dark:text-teal-300 border border-slate-200 dark:border-slate-600 px-6 py-3 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={20} /> Share a New Story
                    </button>
                )}
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700 flex gap-6">
                <button onClick={() => setTab("uploads")} className={`pb-3 font-bold text-sm ${tab === "uploads" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500"}`}>My Uploads</button>
                <button onClick={() => setTab("favorites")} className={`pb-3 font-bold text-sm ${tab === "favorites" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500"}`}>Favorites</button>
                <button onClick={() => setTab("history")} className={`pb-3 font-bold text-sm ${tab === "history" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500"}`}>Watch History</button>
            </div>

            {tab === "uploads" && (
                <div>
                     <div className="mb-6 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                           <p className="font-bold mb-1">Upload Status Guide</p>
                           <ul className="list-disc pl-4 space-y-1">
                               <li><span className="text-green-600 font-bold">Approved:</span> Visible to everyone in the gallery.</li>
                               <li><span className="text-yellow-600 font-bold">Pending:</span> Currently being reviewed by our volunteers.</li>
                               <li><span className="text-red-600 font-bold">Rejected:</span> Does not meet guidelines. See feedback for details.</li>
                           </ul>
                        </div>
                     </div>
                    <VideoList items={myUploads} showStatus={true} />
                </div>
            )}
            {tab === "favorites" && <VideoList items={myFavorites} />}
            {tab === "history" && <VideoList items={myHistory} />}
        </div>
    );
};