import React, { useState, useRef } from "react";
import { User, AlertCircle, Upload, Loader2, FileVideo, X } from "lucide-react";
import { UserType, VideoType } from "../types";
import { SpotlightButton } from "../components/SpotlightButton";
import { FadeIn } from "../components/FadeIn";

export const UploadView = ({ user, navigate, setVideos }: { user: UserType, navigate: any, setVideos: any }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
      "time management", "stress", "college prep", 
      "international student", "study tips", "mental health", 
      "ap", "ib", "sat/act", "productivity", "motivation"
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          const trimmed = tagInput.trim();
          if (trimmed && !tags.includes(trimmed)) {
              setTags([...tags, trimmed]);
              setTagInput("");
          }
      } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
          setTags(tags.slice(0, -1));
      }
  };

  const addTag = (tag: string) => {
      if (!tags.includes(tag)) {
          setTags([...tags, tag]);
      }
  };

  const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedFile) {
        alert("Please select a video file first.");
        return;
    }
    if (tags.length === 0) {
        alert("Please add at least one tag.");
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
      grade: user.grade || "Community Member",
      views: 0,
      category: tags[0], // Primary category is the first tag
      tags: tags,
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
         <FadeIn>
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full inline-block">
                <User size={48} className="text-slate-400" />
            </div>
         </FadeIn>
         <FadeIn delay={100}>
            <h2 className="text-2xl font-serif font-bold dark:text-white">Please Login to Share</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">You need to be a member of our community to upload videos. This helps us keep the space safe for everyone.</p>
         </FadeIn>
         <FadeIn delay={200}>
            <button onClick={() => navigate("login")} className="bg-eggplant text-white px-6 py-3 rounded-full font-bold">Log In Now</button>
         </FadeIn>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <FadeIn direction="up">
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
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title *</label>
             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-eggplant" placeholder="e.g. How I Survived My First AP Exam Week" />
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description *</label>
             <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-eggplant" placeholder="In 1–3 sentences, what's your video about?" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Tags *</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                    <span key={tag} className="bg-eggplant/10 dark:bg-teal-900/30 text-eggplant dark:text-teal-300 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 border border-eggplant/20 dark:border-teal-800 animate-in fade-in zoom-in-95">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-eggplant-dark dark:hover:text-white transition-colors"><X size={14}/></button>
                    </span>
                ))}
            </div>
            <input 
                type="text" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-eggplant"
                placeholder="Type a tag and press Enter..." 
            />
            <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 py-1 font-bold">Suggestions:</span>
                {suggestions.filter(s => !tags.includes(s)).map(s => (
                    <button 
                        key={s} 
                        type="button" 
                        onClick={() => addTag(s)} 
                        className="text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-600"
                    >
                        + {s}
                    </button>
                ))}
            </div>
          </div>

          <SpotlightButton disabled={uploading} className="w-full bg-eggplant text-white py-4 rounded-xl font-bold hover:bg-eggplant-dark transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? <><Loader2 className="animate-spin"/> Uploading...</> : "Submit for Review"}
          </SpotlightButton>
        </form>
      </div>
      </FadeIn>
    </div>
  );
};