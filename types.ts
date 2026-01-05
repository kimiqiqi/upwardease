export type UserType = {
  id: string;
  name: string;
  role: "student" | "admin";
} | null;

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
  comments: any[];
  status: string;
  feedback: string;
  description?: string;
  admin_notes?: string;
};