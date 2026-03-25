import React from "react";
import { Video } from "../types";
import { Modal, Badge } from "./FormControls";

export const VideoDetailModal = ({ video, isOpen, onClose }: { video: Video | null, isOpen: boolean, onClose: () => void }) => {
  if (!video) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={video.title}>
      <div className="space-y-4">
        {video.youtubeVideoId ? (
          <iframe 
            src={`https://www.youtube.com/embed/${video.youtubeVideoId}`} 
            className="w-full rounded-xl bg-black aspect-video" 
            allowFullScreen 
            title={video.title}
          />
        ) : (
          <div className="w-full rounded-xl bg-black aspect-video flex items-center justify-center text-white">
            Video not available
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-800">By {video.author}</p>
          <Badge variant={video.status}>{video.status}</Badge>
        </div>
        <p className="text-slate-600 text-sm">{video.description}</p>
        <div className="flex flex-wrap gap-2">
          {video.tags?.map(tag => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{tag}</span>
          ))}
        </div>
        {video.reviewNote && video.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4">
            <p className="text-xs font-bold text-red-800">Rejection Reason:</p>
            <p className="text-sm text-red-700">{video.reviewNote}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
