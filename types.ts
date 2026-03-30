export type TabType = "home" | "upload" | "gallery" | "contact" | "admin" | "login" | "video-detail" | "profile" | "terms" | "about";

export type FeaturedTopic = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  active: boolean;
  weekOf?: string;
  prompt?: string;
};

export type Video = VideoType;

export type NotificationType = {
  id: string;
  type: 'like' | 'comment' | 'save' | 'system';
  message: string;
  date: string;
  read: boolean;
  linkId?: number;
};

export type UserType = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "user" | "admin" | "superadmin";
  grade?: string;
  age?: string;
  school?: string;
  bio?: string;
  passwordHash?: string;
  createdAt?: string;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    privateProfile: boolean;
  };
  achievements?: {
    id: string;
    title: string;
    icon: string;
    dateEarned: string;
    description: string;
  }[];
  notificationsList?: NotificationType[];
} | null;

export type AdminRequestStatus = "pending" | "approved" | "rejected";

export type AdminRequestType = {
  id: string;
  userId: string;
  motivation?: string;
  status: AdminRequestStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  appealReason?: string;
};

export type CommentType = {
  id: number;
  author: string;
  text: string;
  date: string;
  authorId: string;
  likes: number;
  likedBy: string[];
};

export type VideoStatus = "pending" | "approved" | "rejected" | "removed";

export type VideoType = {
  id: number;
  title: string;
  author: string;
  submittedBy: string;
  sourceType: "youtube";
  youtubeVideoId?: string;
  originalUrl?: string;
  grade: string;
  views: number;
  category: string;
  tags?: string[];
  color: string;
  likes: number;
  likedBy: string[];
  comments: CommentType[];
  status: VideoStatus;
  reviewNote?: string;
  adminNotes?: string;
  reviewedBy?: string;
  description?: string;
  createdAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  reportCount: number;
  featured?: boolean;
  actionStep?: string;
  resourceLink?: string;
  appealReason?: string;
  reportReason?: string;
  isEscalated?: boolean;
};

export type ReportStatus = "open" | "resolved" | "dismissed";

export type ReportType = {
  id: string;
  submissionId: number;
  reportedBy: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  handledBy?: string;
  handledAt?: string;
  actionTaken?: string;
};

export type ContactMessageType = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: string;
  userId?: string;
};

export type ModerationLogType = {
  id: string;
  actorId: string;
  action: string;
  targetType: "video" | "report" | "user" | "admin_request";
  targetId: string | number;
  timestamp: string;
  metadata?: Record<string, unknown>;
};