import React, { useState, useRef, useEffect } from "react";
import { Plus, AlertCircle, PlayCircle, RotateCcw, Send, GraduationCap, School, MapPin, Settings, X, Save, User, ArrowDown, Loader2, Quote, Bell, Mail, Lock, Trophy, ShieldAlert, CheckCircle2, Phone, Calendar } from "lucide-react";
import { UserType, VideoType, AdminRequestType, TabType } from "../types";
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
    if (items.length === 0) return <div className="text-center py-12 text-slate-500 dark:text-slate-400">No videos found.</div>;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((video, index) => (
                <FadeIn key={video.id} delay={index * 50} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                    <div onClick={() => video.status === 'approved' && onVideoClick(video.id)} className={`aspect-video ${video.color} relative flex items-center justify-center overflow-hidden ${video.status === 'approved' ? 'cursor-pointer' : 'opacity-75'}`}>
                        {video.sourceType === 'youtube' && video.youtubeVideoId ? (
                            <img 
                                src={`https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`} 
                                alt={video.title}
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                            />
                        ) : null}
                        <PlayCircle size={48} className="text-slate-900/50 absolute" />
                        {showStatus && (
                            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold uppercase ${
                                video.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                video.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                video.status === 'removed' ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}>
                                {video.status.replace('_', ' ')}
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{video.title}</h3>
                        <p className="text-xs text-slate-500">{video.views} views</p>
                        
                        {showStatus && (video.status === 'rejected' || video.status === 'removed') && (
                            <div className={`mt-4 p-3 rounded-lg border text-xs ${video.status === 'removed' ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900'}`}>
                                <p className={`font-bold mb-1 ${video.status === 'removed' ? 'text-slate-800 dark:text-slate-300' : 'text-red-800 dark:text-red-400'}`}>Admin Feedback:</p>
                                <p className={`mb-3 ${video.status === 'removed' ? 'text-slate-700 dark:text-slate-400' : 'text-red-700 dark:text-red-300'}`}>{video.reviewNote || "No feedback provided."}</p>
                                
                                {video.appealReason ? (
                                    <div className={`w-full py-2 bg-slate-100 dark:bg-slate-800 border rounded font-bold text-center flex items-center justify-center gap-2 ${video.status === 'removed' ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400' : 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'}`}>
                                        <CheckCircle2 size={14}/> Appeal Submitted
                                    </div>
                                ) : appealingVideoId === video.id ? (
                                    <div className="mt-2 animate-in fade-in">
                                        <textarea 
                                            className={`w-full p-2 rounded border mb-2 dark:bg-slate-800 dark:text-white ${video.status === 'removed' ? 'border-slate-200 dark:border-slate-700' : 'border-red-200 dark:border-red-800'}`}
                                            placeholder="Why should this be reconsidered?"
                                            rows={2}
                                            value={appealReason}
                                            onChange={(e) => setAppealReason(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleAppeal(video.id)}
                                                className={`text-white px-3 py-1 rounded w-full flex items-center justify-center gap-1 ${video.status === 'removed' ? 'bg-slate-600 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-700'}`}
                                            >
                                                <Send size={12}/> Submit
                                            </button>
                                            <button 
                                                onClick={() => { setAppealingVideoId(null); setAppealReason(""); }}
                                                className={`px-3 py-1 rounded w-full border bg-white dark:bg-slate-800 ${video.status === 'removed' ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700' : 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setAppealingVideoId(video.id)}
                                        className={`w-full py-2 bg-white dark:bg-slate-800 border rounded font-bold transition-colors flex items-center justify-center gap-2 ${video.status === 'removed' ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700' : 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
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
    navigate,
    adminRequests,
    setAdminRequests
}: { 
    user: UserType, 
    setUser: (u: UserType) => void,
    videos: VideoType[], 
    setVideos: React.Dispatch<React.SetStateAction<VideoType[]>>, 
    starredVideoIds: number[], 
    historyVideoIds: number[], 
    onVideoClick: (id: number) => void, 
    navigate: (tab: TabType) => void,
    adminRequests: AdminRequestType[],
    setAdminRequests: (reqs: AdminRequestType[]) => void
}) => {
    const [tab, setTab] = useState<"uploads" | "favorites" | "history" | "achievements">("uploads");
    const [appealingVideoId, setAppealingVideoId] = useState<number | null>(null);
    const [appealReason, setAppealReason] = useState("");
    
    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ 
        name: "", emailOrPhone: "", grade: "", school: "", age: "", bio: "",
        notifications: true, emailUpdates: false, privateProfile: false
    });

    // Pull to Refresh State
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullY, setPullY] = useState(0);
    const touchStartY = useRef(0);

    // Admin Application State
    const [adminMessage, setAdminMessage] = useState("");
    const [isApplyingForAdmin, setIsApplyingForAdmin] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    if (!user) return null;

    const myUploads = videos.filter(v => v.submittedBy === user.id);
    const myFavorites = videos.filter(v => starredVideoIds.includes(v.id));
    const myHistory = videos.filter(v => historyVideoIds.includes(v.id));

    const myAdminRequest = adminRequests.find(req => req.userId === user.id);

    const handleApplyForAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (myAdminRequest?.status === 'rejected') {
            // It's an appeal
            const updatedRequests = adminRequests.map(req => 
                req.userId === user.id ? {
                    ...req,
                    status: 'pending' as const,
                    appealReason: adminMessage,
                    reviewedBy: undefined,
                    reviewedAt: undefined
                } : req
            );
            setAdminRequests(updatedRequests);
        } else {
            // New request
            const newRequest: AdminRequestType = {
                id: `req-${Date.now()}`,
                userId: user.id,
                motivation: adminMessage,
                status: 'pending',
                createdAt: new Date().toISOString(),
            };
            setAdminRequests([...adminRequests, newRequest]);
        }
        
        setIsApplyingForAdmin(false);
        setAdminMessage("");
    };

    const handleAppeal = (id: number) => {
        if (!appealReason.trim()) return;
        
        setVideos((prev: VideoType[]) => prev.map(v => 
            v.id === id ? { 
                ...v, 
                appealReason: appealReason,
            } : v
        ));
        
        setAppealingVideoId(null);
        setAppealReason("");
    };
    
    const handleEditClick = () => {
        setEditForm({
            name: user.name,
            emailOrPhone: user.email || user.phone || "",
            grade: user.grade || "",
            school: user.school || "",
            age: user.age || "",
            bio: user.bio || "",
            notifications: user.preferences?.notifications ?? true,
            emailUpdates: user.preferences?.emailUpdates ?? false,
            privateProfile: user.preferences?.privateProfile ?? false
        });
        setIsEditing(true);
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setUser({
            ...user,
            name: editForm.name,
            email: editForm.emailOrPhone.includes('@') ? editForm.emailOrPhone : undefined,
            phone: !editForm.emailOrPhone.includes('@') && editForm.emailOrPhone ? editForm.emailOrPhone : undefined,
            grade: editForm.grade,
            school: editForm.school,
            age: editForm.age,
            bio: editForm.bio,
            preferences: {
                notifications: editForm.notifications,
                emailUpdates: editForm.emailUpdates,
                privateProfile: editForm.privateProfile
            }
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
            
            if (isMounted.current) {
                setIsRefreshing(false);
            }
        }
        if (isMounted.current) {
            setPullY(0);
        }
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
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email or Phone</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        required 
                                        value={editForm.emailOrPhone}
                                        onChange={(e) => setEditForm({...editForm, emailOrPhone: e.target.value})}
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
                            
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Settings size={18} className="text-eggplant dark:text-teal-400" /> Preferences
                                </h4>
                                
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                            <Bell size={14} className="text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Push Notifications</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={editForm.notifications}
                                        onChange={(e) => setEditForm({...editForm, notifications: e.target.checked})}
                                        className="w-5 h-5 text-eggplant rounded focus:ring-eggplant"
                                    />
                                </label>
                                
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                            <Mail size={14} className="text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Updates</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={editForm.emailUpdates}
                                        onChange={(e) => setEditForm({...editForm, emailUpdates: e.target.checked})}
                                        className="w-5 h-5 text-eggplant rounded focus:ring-eggplant"
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                            <Lock size={14} className="text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Private Profile</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={editForm.privateProfile}
                                        onChange={(e) => setEditForm({...editForm, privateProfile: e.target.checked})}
                                        className="w-5 h-5 text-eggplant rounded focus:ring-eggplant"
                                    />
                                </label>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-eggplant text-white py-3 rounded-xl font-bold hover:bg-eggplant-dark transition-colors flex items-center justify-center gap-2 mt-4"
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
                                    <span className="font-bold text-eggplant dark:text-teal-300">{user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin / Volunteer' : 'Student Member'}</span>
                                    {user.email && <span className="flex items-center gap-1"><Mail size={14}/> {user.email}</span>}
                                    {user.phone && <span className="flex items-center gap-1"><Phone size={14}/> {user.phone}</span>}
                                    {user.grade && <span className="flex items-center gap-1"><GraduationCap size={14}/> {user.grade}</span>}
                                    {user.school && <span className="flex items-center gap-1"><School size={14}/> {user.school}</span>}
                                    {user.age && <span className="flex items-center gap-1"><Calendar size={14}/> {user.age} y/o</span>}
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

                {user.role === 'user' && (
                    <div className="mb-8 bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <ShieldAlert size={20} className="text-eggplant dark:text-teal-400" /> 
                            Become an Admin
                        </h3>
                        {myAdminRequest?.status === 'pending' ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                                <p className="font-bold">Your application is under review.</p>
                                <p className="text-sm mt-1">We'll let you know once a decision has been made.</p>
                            </div>
                        ) : myAdminRequest?.status === 'approved' ? (
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 rounded-xl border border-green-200 dark:border-green-800/50">
                                <p className="font-bold">Congratulations! You are an admin.</p>
                                <p className="text-sm mt-1">Please log out and log back in to access the admin dashboard.</p>
                            </div>
                        ) : (
                            <div>
                                {myAdminRequest?.status === 'rejected' && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-xl border border-red-200 dark:border-red-800/50 mb-4">
                                        <p className="font-bold">Your previous application was not approved.</p>
                                        <p className="text-sm mt-1">You can appeal this decision by providing more information below.</p>
                                    </div>
                                )}
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                                    Help moderate content and support the UpwardEase community.
                                </p>
                                {!isApplyingForAdmin ? (
                                    <button 
                                        onClick={() => setIsApplyingForAdmin(true)}
                                        className="bg-eggplant text-white px-4 py-2 rounded-lg font-bold hover:bg-eggplant-dark transition-colors text-sm"
                                    >
                                        {myAdminRequest?.status === 'rejected' ? 'Apply Again' : 'Apply Now'}
                                    </button>
                                ) : (
                                    <form onSubmit={handleApplyForAdmin} className="space-y-3 animate-in fade-in">
                                        <textarea
                                            value={adminMessage}
                                            onChange={(e) => setAdminMessage(e.target.value)}
                                            placeholder={myAdminRequest?.status === 'rejected' ? "Why should we reconsider your application?" : "Why do you want to be an admin? (Optional)"}
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-eggplant outline-none dark:text-white text-sm"
                                            rows={3}
                                            required={myAdminRequest?.status === 'rejected'}
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                type="submit"
                                                className="bg-eggplant text-white px-4 py-2 rounded-lg font-bold hover:bg-eggplant-dark transition-colors text-sm"
                                            >
                                                Submit Application
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => { setIsApplyingForAdmin(false); setAdminMessage(""); }}
                                                className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="border-b border-slate-200 dark:border-slate-700 flex gap-6 overflow-x-auto">
                    <button onClick={() => setTab("uploads")} className={`pb-3 font-bold text-sm whitespace-nowrap ${tab === "uploads" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500 dark:text-slate-400"}`}>My Uploads</button>
                    <button onClick={() => setTab("favorites")} className={`pb-3 font-bold text-sm whitespace-nowrap ${tab === "favorites" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500 dark:text-slate-400"}`}>Favorites</button>
                    <button onClick={() => setTab("history")} className={`pb-3 font-bold text-sm whitespace-nowrap ${tab === "history" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500 dark:text-slate-400"}`}>Watch History</button>
                    <button onClick={() => setTab("achievements")} className={`pb-3 font-bold text-sm whitespace-nowrap ${tab === "achievements" ? "text-eggplant border-b-2 border-eggplant dark:text-teal-300 dark:border-teal-300" : "text-slate-500 dark:text-slate-400"}`}>Achievements</button>
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
                                    <li><span className="text-green-600 dark:text-green-400 font-bold">Approved:</span> Visible to everyone in the gallery.</li>
                                    <li><span className="text-yellow-600 dark:text-yellow-400 font-bold">Pending:</span> Currently being reviewed by our volunteers.</li>
                                    <li><span className="text-red-600 dark:text-red-400 font-bold">Rejected:</span> Does not meet guidelines. You may appeal if you believe this is an error.</li>
                                </ul>
                                </div>
                            </FadeIn>
                            <VideoList items={myUploads} showStatus={true} {...commonListProps} />
                        </div>
                    )}
                    {tab === "favorites" && <VideoList items={myFavorites} {...commonListProps} />}
                    {tab === "history" && <VideoList items={myHistory} {...commonListProps} />}
                    {tab === "achievements" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.achievements && user.achievements.length > 0 ? (
                                user.achievements.map((ach, idx) => (
                                    <FadeIn key={ach.id} delay={idx * 100} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-full bg-eggplant/10 dark:bg-teal-900/30 flex items-center justify-center text-3xl shrink-0">
                                            {ach.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{ach.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Earned on {ach.dateEarned}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{ach.description}</p>
                                        </div>
                                    </FadeIn>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                                    <Trophy size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                    <p>No achievements yet. Keep participating to earn badges!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};