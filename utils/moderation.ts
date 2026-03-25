import { VideoType, ModerationLogType, UserType } from "../types";

export const dismissReportForVideo = (
    video: VideoType,
    user: UserType
): { updatedVideo: VideoType, logEntry: ModerationLogType } => {
    const now = new Date().toISOString();
    
    const updatedVideo: VideoType = {
        ...video,
        reportReason: undefined,
        reportCount: 0,
        isEscalated: false
    };

    const logEntry: ModerationLogType = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        actorId: user.id,
        action: 'dismiss_report',
        targetType: 'video',
        targetId: video.id,
        timestamp: now
    };

    return { updatedVideo, logEntry };
};

export const applyModerationVerdict = (
    video: VideoType,
    status: 'approved' | 'rejected' | 'removed',
    user: UserType,
    reviewNote?: string,
    adminNotes?: string
): { updatedVideo: VideoType, logEntry: ModerationLogType } => {
    const now = new Date().toISOString();
    
    const updatedVideo: VideoType = {
        ...video,
        status,
        reviewNote: (status === 'rejected' || status === 'removed') && reviewNote ? reviewNote : video.reviewNote,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
        reviewedAt: now,
        reviewedBy: user.id,
        publishedAt: status === 'approved' ? (video.publishedAt || now) : video.publishedAt,
        appealReason: undefined,
        reportReason: undefined,
        reportCount: 0,
        isEscalated: false
    };

    const logEntry: ModerationLogType = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        actorId: user.id,
        action: status,
        targetType: 'video',
        targetId: video.id,
        timestamp: now,
        metadata: {
            reason: (status === 'rejected' || status === 'removed') ? reviewNote : undefined,
            adminNotes: adminNotes
        }
    };

    return { updatedVideo, logEntry };
};
