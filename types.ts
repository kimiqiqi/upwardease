export type UserType = {
  id: string;
  name: string;
  role: "student" | "admin";
} | null;

export type CommentType = {
  id: number;
  author: string;
  text: string;
  date: string;
  authorId: string;
};

export type VideoType = {
  id: number;
  title: string;
  author: string;
  uploaderId: string;
  grade: string;
  views: number;
  category: string;
  color: string;
  likes: number;
  likedBy: string[];
  comments: CommentType[];
  status: string;
  feedback: string;
  description?: string;
  admin_notes?: string;
  uploadedAt: string;
  approvedAt?: string;
  appealReason?: string;
  videoUrl?: string;
};