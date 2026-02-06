import React, { useState, useRef } from "react";
import { User, AlertCircle, Upload, Loader2, FileVideo } from "lucide-react";
import { UserType, VideoType } from "../types";
import { SpotlightButton } from "../components/SpotlightButton";

export const UploadView = ({ user, navigate, setVideos }: { user: UserType, navigate: any, setVideos: any }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Study Tips");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["Study Tips", "Mental Health", "Productivity", "Motivation", "Exam Prep"];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedFile) {
        alert("Please select a video file first.");
        return;
    }

    setUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a local URL for the video file so it can be played in the session
    const videoUrl = URL.createObjectURL(selectedFile);

    // Add new pending video with user profile data
    const newVideo: VideoType = {
      id: Date.now(),
      title,
      description,
      author: user.name,
      uploaderId: user.id,
      grade: user.grade || "Community Member", // Connect grade info here
      views: 0,
      category: category,
      color: "bg-gray-100",
      likes: 0,
      likedBy: [],
      comments: [],
      status: "pending",
      feedback: "",
      uploadedAt: new Date().toISOString(),
      videoUrl: videoUrl
    };
    
    setVideos((prev: VideoType[]) => [...prev, newVideo]);
    setUploading(false);
    navigate("profile"); // Redirect to profile to see pending status
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6">
         <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
            <User size={48} className="text-slate-400" />
         </div>
         <h2 className="text-2xl font-serif font-bold dark:text-white">Please Login to Share</h2>
         <p className="text-slate-500 dark:text-slate-400 max-w-md">You need to be a member of our community to upload videos. This helps us keep the space safe for everyone.</p>
         <button onClick={() => navigate("login")} className="bg-eggplant text-white px-6 py-3 rounded-full font-bold">Log In Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
        <h2 className="text-3xl font-serif font-bold text-eggplant dark:text-white mb-6">Share Your Story</h2>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 text-sm text-blue-800 flex gap-2">
            <AlertCircle size={20} className="shrink-0" />
            <p>All uploads are reviewed by our volunteer admins to ensure a safe environment. Your video will appear as "Pending" until approved.</p>
        </div>
        <form onSubmit={handleUpload} className="space-y-6">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="video/*" 
            className="hidden" 
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${selectedFile ? 'border-eggplant bg-purple-50 dark:bg-slate-700 dark:border-teal-500' : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
             {selectedFile ? (
                 <>
                    <FileVideo size={48} className="text-eggplant dark:text-teal-400 mb-4" />
                    <p className="font-bold text-eggplant dark:text-teal-400">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500 mt-2">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <button type="button" className="mt-6 text-red-500 text-sm font-bold hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>Remove File</button>
                 </>
             ) : (
                 <>
                    <Upload size={48} className="text-slate-300 dark:text-slate-500 mb-4" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">Drag and drop your video here</p>
                    <p className="text-sm text-slate-400 mt-2">MP4, WebM up to 50MB</p>
                    <button type="button" className="mt-6 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-200">Select File</button>
                 </>
             )}
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-eggplant" placeholder="e.g. My study routine" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Category (Tags)</label>
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${category === cat ? 'bg-eggplant text-white border-eggplant' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                >
                    {cat}
                </button>
                ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
             <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-eggplant" placeholder="Tell us about your video..." />
          </div>

          <SpotlightButton disabled={uploading} className="w-full bg-eggplant text-white py-4 rounded-xl font-bold hover:bg-eggplant-dark transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? <><Loader2 className="animate-spin"/> Uploading...</> : "Submit for Review"}
          </SpotlightButton>
        </form>
      </div>
    </div>
  );
};