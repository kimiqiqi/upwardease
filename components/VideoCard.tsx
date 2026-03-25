import React from "react";
import { Video } from "../types";
import { Badge } from "./FormControls";
import { PlayCircle } from "lucide-react";

export const VideoCard = ({ video, onClick, showStatus = false }: { video: Video, onClick: () => void, showStatus?: boolean }) => {
  return (
    <div onClick={onClick} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col">
      <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative flex items-center justify-center group">
        <img src={`https://img.youtube.com/vi/${video.youtubeVideoId}/maxresdefault.jpg`} alt={video.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <PlayCircle className="text-white w-12 h-12 opacity-80 group-hover:scale-110 transition-transform" />
        </div>
        {showStatus && (
          <div className="absolute top-2 right-2">
            <Badge variant={video.status}>{video.status}</Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2">{video.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{video.author}</p>
        <div className="flex flex-wrap gap-1 mt-auto pt-2">
          {video.tags?.map(tag => (
            <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
