import React, { useState, useEffect, useRef } from "react";
import { User, AlertCircle, Loader2, Youtube, X, CheckCircle2 } from "lucide-react";
import { UserType, VideoType, TabType } from "../types";
import { SpotlightButton } from "../components/SpotlightButton";
import { FadeIn } from "../components/FadeIn";
import { extractYouTubeId, getYouTubeEmbedUrl } from "../utils/youtube";

export const UploadView = ({ user, navigate, videos, setVideos }: { user: UserType, navigate: (tab: TabType) => void, videos: VideoType[], setVideos: React.Dispatch<React.SetStateAction<VideoType[]>> }) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [actionStep, setActionStep] = useState("");
  const [resourceLink, setResourceLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [formError, setFormError] = useState("");
  const isMounted = useRef(true);

  useEffect(() => {
      return () => {
          isMounted.current = false;
      };
  }, []);

  const suggestions = [
      "time management", "stress", "college prep", 
      "international student", "study tips", "mental health", 
      "ap", "ib", "sat/act", "productivity", "motivation"
  ];

  useEffect(() => {
    if (youtubeUrl) {
      const id = extractYouTubeId(youtubeUrl);
      if (id) {
        setYoutubeVideoId(id);
        const isDuplicate = videos.some(v => v.youtubeVideoId === id);
        if (isDuplicate) {
          setUrlError("This video has already been submitted to UpwardEase.");
        } else {
          setUrlError("");
        }
      } else {
        setYoutubeVideoId(null);
        setUrlError("Invalid YouTube URL. Please check the link and try again.");
      }
    } else {
      setYoutubeVideoId(null);
      setUrlError("");
    }
  }, [youtubeUrl, videos]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          const trimmed = tagInput.trim().toLowerCase();
          if (trimmed && !tags.includes(trimmed)) {
              setTags([...tags, trimmed]);
              setTagInput("");
          }
      } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
          setTags(tags.slice(0, -1));
      }
  };

  const addTag = (tag: string) => {
      const normalizedTag = tag.toLowerCase();
      if (!tags.includes(normalizedTag)) {
          setTags([...tags, normalizedTag]);
      }
  };

  const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!user) return;
    
    if (!youtubeVideoId) {
        setFormError("Please provide a valid YouTube link first.");
        return;
    }

    if (!title.trim() || !description.trim()) {
        setFormError("Please provide a title and description.");
        return;
    }

    if (tags.length === 0) {
        setFormError("Please add at least one tag.");
        return;
    }
    if (!agreedToTerms) {
        setFormError("Please agree to the community guidelines.");
        return;
    }

    // Check for duplicate submission
    const isDuplicate = videos.some(v => v.youtubeVideoId === youtubeVideoId);
    if (isDuplicate) {
        setFormError("This video has already been submitted to UpwardEase.");
        return;
    }

    setUploading(true);
    
    // Simulate submission delay for youtube
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!isMounted.current) return;

    const colors = ["bg-accent-orange", "bg-accent-green", "bg-eggplant", "bg-blue-500", "bg-purple-500", "bg-pink-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Add new pending video with user profile data
    const newVideo: VideoType = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      author: user.name,
      submittedBy: user.id,
      sourceType: 'youtube',
      youtubeVideoId: youtubeVideoId,
      originalUrl: youtubeUrl,
      grade: user.grade || "Community Member",
      views: 0,
      category: tags[0], // Primary category is the first tag
      tags: tags,
      color: randomColor,
      likes: 0,
      likedBy: [],
      comments: [],
      status: "pending",
      reviewNote: "",
      createdAt: new Date().toISOString(),
      reportCount: 0,
      actionStep: actionStep.trim() || undefined,
      resourceLink: resourceLink.trim() || undefined,
    };
    
    // TODO: Replace with API call to POST /api/videos
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
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">You need to be a member of our community to submit videos. This helps us keep the space safe for everyone.</p>
         </FadeIn>
         <FadeIn delay={200}>
            <button onClick={() => navigate("login")} className="bg-eggplant text-white px-6 py-3 rounded-full font-bold">Log In Now</button>
         </FadeIn>
      </div>
    );
  }

  const isDuplicate = youtubeVideoId ? videos.some(v => v.youtubeVideoId === youtubeVideoId) : false;
  const isSubmitDisabled = uploading || !youtubeVideoId || !agreedToTerms || tags.length === 0 || isDuplicate || !title.trim() || !description.trim();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <FadeIn direction="up">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
        <h2 className="text-3xl font-serif font-bold text-eggplant dark:text-white mb-6">Submit a Video</h2>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-6 text-sm text-blue-800 dark:text-blue-200 flex gap-2">
            <AlertCircle size={20} className="shrink-0" />
            <p>All submissions are reviewed by our volunteer admins before appearing publicly.</p>
        </div>

        {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-6 text-sm text-red-800 dark:text-red-200 flex gap-2">
                <AlertCircle size={20} className="shrink-0" />
                <p>{formError}</p>
            </div>
        )}
        
        <form onSubmit={handleUpload} className="space-y-6">
          
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">YouTube Link *</label>
                     <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Youtube className="h-5 w-5 text-slate-400" />
                         </div>
                         <input 
                            type="url" 
                            value={youtubeUrl} 
                            onChange={(e) => setYoutubeUrl(e.target.value)} 
                            required 
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${urlError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-eggplant'} bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2`} 
                            placeholder="https://www.youtube.com/watch?v=..." 
                         />
                     </div>
                     {urlError && <p className="mt-2 text-sm text-red-500">{urlError}</p>}
                  </div>

                  {youtubeVideoId && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 aspect-video relative">
                          <iframe
                              src={getYouTubeEmbedUrl(youtubeVideoId)}
                              title="YouTube video player"
                              className="absolute top-0 left-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                          ></iframe>
                      </div>
                  )}

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

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
             <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Optional Details</h3>
             
             <div className="mb-4">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Action Step / Reflection Prompt</label>
                 <input type="text" value={actionStep} onChange={(e) => setActionStep(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-eggplant" placeholder="e.g. Try writing down three things you're grateful for today." />
                 <p className="text-xs text-slate-500 mt-1">Give viewers a small, positive action to take after watching.</p>
             </div>

             <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Resource Link</label>
                 <input type="url" value={resourceLink} onChange={(e) => setResourceLink(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-eggplant" placeholder="https://..." />
                 <p className="text-xs text-slate-500 mt-1">Link to a helpful article, tool, or support resource related to your video.</p>
             </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                      <input 
                          type="checkbox" 
                          checked={agreedToTerms} 
                          onChange={(e) => setAgreedToTerms(e.target.checked)} 
                          className="peer sr-only" 
                      />
                      <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-eggplant peer-checked:border-eggplant transition-colors"></div>
                      <CheckCircle2 className="absolute text-white opacity-0 peer-checked:opacity-100 w-4 h-4 transition-opacity" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                      I confirm that this video follows the UpwardEase Community Guidelines and does not contain harmful, hateful, or explicit content. I understand that my submission will be reviewed before being published.
                  </span>
              </label>
          </div>

          <SpotlightButton disabled={isSubmitDisabled} className="w-full bg-eggplant text-white py-4 rounded-xl font-bold hover:bg-eggplant-dark transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? <><Loader2 className="animate-spin"/> Submitting...</> : "Submit for Review"}
          </SpotlightButton>
        </form>
      </div>
      </FadeIn>
    </div>
  );
};