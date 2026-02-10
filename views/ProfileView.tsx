import React, { useState, useRef } from "react";
import { Plus, AlertCircle, PlayCircle, RotateCcw, Send, GraduationCap, School, MapPin, Settings, X, Save, User, ArrowDown, Loader2, Quote } from "lucide-react";
import { UserType, VideoType } from "../types";
import { FadeIn } from "../components/FadeIn";

// Extracted VideoList component to prevent re-rendering issues
const VideoList = ({ 
    items, 
    showStatus, 
    onVideoClick, 
    appealingVideoId, 
    setAppealingVideoId, 
    appealReason, 
    setAppealReason, 
    handleAppeal 
}: { 
    items: VideoType[], 
    showStatus?: boolean, 
    onVideoClick: (id: number) => void,
    appealingVideoId: number | null,
    setAppealingVideoId: (id: number | null) => void,
    appealReason: string,
    setAppealReason: (val: string) => void,
    handleAppeal: (id: number) => void
}) => {
    if (items.length === 0) return <div className="text-center py-12 text-slate-500">No videos found.</div>;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((video, index) => (
                <FadeIn key={video.id} delay={index * 50} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                    <div onClick={() => video.status === 'approved' && onVideoClick(video.id)} className={`aspect-video ${video.color} relative flex items-center justify-center ${video.status === 'approved' ? 'cursor-pointer' : 'opacity-75'}`}>
                        <PlayCircle size={48} className="text-slate-900/50" />
                        {showStatus && (
                            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold uppercase ${
                                video.status === 'approved' ? 'bg-green-100 text-green-700' :
                                video.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {video.status.replace('_', ' ')}
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{video.title}</h3>
                        <p className="text-xs text-slate-500">{video.views} views</p>
                        
                        {showStatus && video.status === 'rejected' && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900 text-xs">
                                <p className="font-bold text-red-800 dark:text-red-400 mb-1">Admin Feedback:</p>
                                <p className="text-red-700 dark:text-red-300 mb-3">{video.feedback || "No feedback provided."}</p>
                                
                                {appealingVideoId === video.id ? (
                                    <div className="mt-2 animate-in fade-in">
                                        <textarea 
                                            className="w-full p-2 rounded border border-red-200 dark:border-red-800 mb-2 dark:bg-slate-800 dark:text-white"
                                            placeholder="Why should this be reconsidered?"
                                            rows={2}
                                            value={appealReason}
                                            onChange={(e) => setAppealReason(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleAppeal(video.id)}
                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 w-full flex items-center justify-center gap-1"
                                            >
                                                <Send size={12}/> Submit
                                            </button>
                                            <button 
                                                onClick={() => { setAppealingVideoId(null); setAppealReason(""); }}
                                                className="bg-white border border-red-200 text-red-600 px-3 py-1 rounded hover:bg-red-50 w-full"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setAppealingVideoId(video.id)}
                                        className="w-full py-2 bg-white border border-red-200 text-red-600 rounded font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw size={14}/> Appeal Decision
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </FadeIn>
            ))}
        </div>
    );
};

export const ProfileView = ({ 
    user, 
    setUser, 
    videos, 
    setVideos, 
    starredVideoIds, 
    historyVideoIds, 
    onVideoClick, 
    navigate 
}: { 
    user: UserType, 
    setUser: (u: UserType) => void,
    videos: VideoType[], 
    setVideos: any, 
    starredVideoIds: number[], 
    historyVideoIds: number[], 
    onVideoClick: (id: number) => void, 
    navigate: any 
}) => {
    const [tab, setTab] = useState<"uploads" | "favorites" | "history">("uploads");
    const [appealingVideoId, setAppealingVideoId] = useState<number | null>(null);
    const [appealReason, setAppealReason] = useState("");
    
    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", grade: "", school: "", age: "", bio: "" });

    // Pull to Refresh State
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullY, setPullY] = useState(0);
    const touchStartY = useRef(0);

    if (!user) return null;

    const myUploads = videos.filter(v => v.uploaderId === user.id);
    const myFavorites = videos.filter(v => starredVideoIds.includes(v.id));
    const myHistory = videos.filter(v => historyVideoIds.includes(v.id));

    const handleAppeal = (id: number) => {
        if (!appealReason.trim()) return;
        
        setVideos((prev: VideoType[]) => prev.map(v => 
            v.id === id ? { 
                ...v, 
                status: 'needs_review', // Send back to admin
                appealReason: appealReason,
            } : v
        ));
        
        setAppealingVideoId(null);
        setAppealReason("");
    };
    
    const handleEditClick = () => {
        setEditForm({
            name: user.name,
            grade: user.grade || "",
            school: user.school || "",
            age: user.age || "",
            bio: user.bio || ""
        });
        setIsEditing(true);
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setUser({
            ...user,
            name: editForm.name,
            grade: editForm.grade,
            school: editForm.school,
            age: editForm.age,
            bio: editForm.bio
        });
        setIsEditing(false);
    };

    // Pull to Refresh Logic
    const handleTouchStart = (e: React.TouchEvent) => {
        const mainElement = document.querySelector('main');
        // Only allow pull if we are at the top of the scroll container
        if (mainElement && mainElement.scrollTop <= 5) {
            touchStartY.current = e.touches[0].clientY;
        } else {
            touchStartY.current = 0;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartY.current) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartY.current;

        if (diff > 0) {
            // Apply resistance to the pull
            setPullY(Math.min(diff * 0.4, 120));
        }
    };

    const handleTouchEnd = async () => {
        if (pullY > 60) {
            setIsRefreshing(true);
            setPullY(60); // Snap to loading position
            
            // Simulate data refresh delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setIsRefreshing(false);
        }
        setPullY(0);
        touchStartY.current = 0;
    };

    const gradeOptions = [
      "Middle School (6-8)", "Freshman (9th)", "Sophomore (10th)", "Junior (11th)", 
      "Senior (12th)", "College Freshman", "College Sophomore", 
      "College Junior", "College Senior", "Graduate Student"
    ];

    const commonListProps = {
        onVideoClick,
        appealingVideoId,
        setAppealingVideoId,
        appealReason,
        setAppealReason,
        handleAppeal
    };

    return (
        <div className="space-y-8">
            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-serif font-bold dark:text-white">Edit Profile</h3>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        required 
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-eggplant outline-none dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                                <div className="relative">
                                    <Quote className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <textarea 
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-eggplant outline-none dark:text-white min-h-[100px]"
                                        placeholder="Tell us a little bit about yourself..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Grade</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <select 
                                        required
                                        value={editForm.grade}
                                        onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-eggplant outline-none dark:text-white appearance-none"
                                    >
                                        <option value="">Select Grade</option>
                                        {gradeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">School</label>
                                <div className="relative">
                                    <School className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={editForm.school}
                                        onChange={(e) => setEditForm({...editForm, school: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-eggplant outline-none dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input 
                                        type="number" 
                                        min="13" max="100"
                                        value={editForm.age}
                                        onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-eggplant outline-none dark:text-white"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-eggplant text-white py-3 rounded-xl font-bold hover:bg-eggplant-dark transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <FadeIn direction="down">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-full bg-accent-green flex items-center justify-center text-white text-4xl font-serif font-bold shrink-0 shadow-lg border-4 border-white dark:border-slate-800">
                            {user.name.charAt(0)}
                        </div>
                        <div className="space-y-2">
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">{user.name}</h2>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-sm">
                                    <span className="font-bold text-eggplant dark:text-teal-300">{user.role === 'admin' ? 'Admin / Volunteer' : 'Student Member'}</span>
                                    {user.grade && <span className="flex items-center gap-1"><GraduationCap size={14}/> {user.grade}</span>}
                                    {user.school && <span className="flex items-center gap-1"><School size={14}/> {user.school}</span>}
                                    {user.age && <span className="flex items-center gap-1"><MapPin size={14}/> {user.age} y/o</span>}
                                </div>
                            </div>
                            
                            {user.bio && (
                                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 max-w-xl">
                                    <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed">
                                        "{user.bio}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex gap-3 self-start">
                        <button 
                            onClick={handleEditClick}
                            className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-4 py-3 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Settings size={20} /> <span className="hidden sm:inline">Settings</span>
                        </button>
                        {tab === 'uploads' && (
                            <button 
                                onClick={() => navigate("upload")}
                                className="bg-eggplant text-white border border-eggplant px-6 py-3 rounded-full font-bold hover:bg-eggplant-dark transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <Plus size={20} /> Share a New Story
                            </button>
                        )}
                    </div>
                </div>

                <div className="border-b border-slate-200 dark:border-slate-700 flex gap-6 overflow-x-auto">
                    <button onClick={() => setTab("uploads")} className={`pb-3 font-bold text-sm whitespace-nowrap ${tab === "uploads" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500"}`}>My Uploads</button>
                    <button onClick={() => setTab("favorites")} className={`pb-3 font-bold text-sm whitespace-nowrap ${tab === "favorites" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500"}`}>Favorites</button>
                    <button onClick={() => setTab("history")} className={`pb-3 font-bold text-sm whitespace-nowrap ${tab === "history" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500"}`}>Watch History</button>
                </div>
            </FadeIn>

            {/* Pull to Refresh Container */}
            <div 
                className="relative min-h-[300px]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Visual Indicator */}
                <div 
                    className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none transition-transform duration-200"
                    style={{ 
                        transform: `translateY(${pullY > 0 ? pullY - 40 : -40}px)`, 
                        opacity: pullY > 0 ? Math.min(pullY / 40, 1) : 0 
                    }}
                >
                    <div className="bg-white dark:bg-slate-700 rounded-full p-2 shadow-md border border-slate-100 dark:border-slate-600">
                        {isRefreshing ? (
                            <Loader2 className="animate-spin text-eggplant dark:text-teal-400" size={20} />
                        ) : (
                            <ArrowDown 
                                className={`text-eggplant dark:text-teal-400 transition-transform ${pullY > 60 ? 'rotate-180' : ''}`} 
                                size={20} 
                            />
                        )}
                    </div>
                </div>

                <div 
                    className="transition-transform duration-200"
                    style={{ transform: `translateY(${pullY}px)` }}
                >
                    {tab === "uploads" && (
                        <div>
                            <FadeIn className="mb-6 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 p-4 rounded-xl flex items-start gap-3">
                                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                <p className="font-bold mb-1">Upload Status Guide</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><span className="text-green-600 font-bold">Approved:</span> Visible to everyone in the gallery.</li>
                                    <li><span className="text-yellow-600 font-bold">Pending:</span> Currently being reviewed by our volunteers.</li>
                                    <li><span className="text-red-600 font-bold">Rejected:</span> Does not meet guidelines. You may appeal if you believe this is an error.</li>
                                </ul>
                                </div>
                            </FadeIn>
                            <VideoList items={myUploads} showStatus={true} {...commonListProps} />
                        </div>
                    )}
                    {tab === "favorites" && <VideoList items={myFavorites} {...commonListProps} />}
                    {tab === "history" && <VideoList items={myHistory} {...commonListProps} />}
                </div>
            </div>
        </div>
    );
};