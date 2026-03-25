import { VideoType } from "./types";

export const INITIAL_VIDEOS: VideoType[] = [
  { 
    id: 1, 
    title: "How I organize my notes for Finals", 
    author: "Sarah J.", 
    submittedBy: "user-sarah", 
    sourceType: "youtube",
    youtubeVideoId: "dQw4w9WgXcQ", // Placeholder ID
    originalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    grade: "11th Grade", 
    views: 120, 
    category: "Study Tips", 
    color: "bg-pink-100", 
    likes: 45, 
    likedBy: ["user-2"], 
    comments: [], 
    status: "approved", 
    reviewNote: "", 
    description: "Here is my method for organizing notes using color codes.", 
    createdAt: "2023-11-01T10:00:00Z", 
    publishedAt: "2023-11-02T09:30:00Z",
    reportCount: 0,
    featured: true,
    actionStep: "Try organizing your notes by color today!"
  },
  { 
    id: 2, 
    title: "Dealing with pre-exam anxiety", 
    author: "Marcus T.", 
    submittedBy: "user-marcus", 
    sourceType: "youtube",
    youtubeVideoId: "jNQXAC9IVRw", // Placeholder ID
    originalUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    grade: "College Freshman", 
    views: 85, 
    category: "Mental Health", 
    color: "bg-blue-100", 
    likes: 32, 
    likedBy: ["user-1"], 
    comments: [], 
    status: "approved", 
    reviewNote: "", 
    description: "Breathing exercises that help me before a big test.", 
    createdAt: "2023-11-03T14:20:00Z", 
    publishedAt: "2023-11-04T11:15:00Z",
    reportCount: 0,
    resourceLink: "https://www.nimh.nih.gov/health/topics/anxiety-disorders"
  },
  { 
    id: 3, 
    title: "Pomodoro technique explained", 
    author: "Emily R.", 
    submittedBy: "user-emily", 
    sourceType: "youtube",
    youtubeVideoId: "mNBmG24djoY", // Placeholder ID
    originalUrl: "https://www.youtube.com/watch?v=mNBmG24djoY",
    grade: "10th Grade", 
    views: 230, 
    category: "Productivity", 
    color: "bg-amber-100", 
    likes: 112, 
    likedBy: [], 
    comments: [], 
    status: "approved", 
    reviewNote: "", 
    description: "Stop procrastinating with this simple timer method.", 
    createdAt: "2023-11-05T08:45:00Z", 
    publishedAt: "2023-11-05T16:20:00Z",
    reportCount: 0
  },
  { 
    id: 4, 
    title: "My morning routine before school", 
    author: "Alex K.", 
    submittedBy: "user-123", 
    sourceType: "youtube",
    youtubeVideoId: "9bZkp7q19f0", // Placeholder ID
    originalUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    grade: "12th Grade", 
    views: 95, 
    category: "Motivation", 
    color: "bg-green-100", 
    likes: 28, 
    likedBy: [], 
    comments: [], 
    status: "approved", 
    reviewNote: "", 
    description: "Get ready with me! 6AM start.", 
    createdAt: "2023-11-10T06:00:00Z", 
    publishedAt: "2023-11-10T12:00:00Z",
    reportCount: 0
  },
  { 
    id: 5, 
    title: "Chemistry hacks that saved me", 
    author: "Jordan P.", 
    submittedBy: "user-jordan", 
    sourceType: "youtube",
    youtubeVideoId: "kJQP7kiw5Fk", // Placeholder ID
    originalUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    grade: "College Sophomore", 
    views: 310, 
    category: "Exam Prep", 
    color: "bg-purple-100", 
    likes: 150, 
    likedBy: [], 
    comments: [], 
    status: "approved", 
    reviewNote: "", 
    description: "Memorization tricks for the periodic table.", 
    createdAt: "2023-11-12T15:30:00Z", 
    publishedAt: "2023-11-13T09:00:00Z",
    reportCount: 0
  },
  { 
    id: 6, 
    title: "It's okay to take a break", 
    author: "Lisa M.", 
    submittedBy: "user-lisa", 
    sourceType: "youtube",
    youtubeVideoId: "fJ9rUzIMcZQ", // Placeholder ID
    originalUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    grade: "8th Grade", 
    views: 150, 
    category: "Mental Health", 
    color: "bg-teal-100", 
    likes: 67, 
    likedBy: [], 
    comments: [], 
    status: "approved", 
    reviewNote: "", 
    description: "Reminding everyone that rest is productive too.", 
    createdAt: "2023-11-15T11:10:00Z", 
    publishedAt: "2023-11-15T13:45:00Z",
    reportCount: 0
  },
  // A pending video for demo purposes
  { id: 7, title: "Why I almost quit", author: "New User", submittedBy: "user-new", sourceType: "youtube", youtubeVideoId: "V-_O7nl0Ii0", originalUrl: "https://www.youtube.com/watch?v=V-_O7nl0Ii0", grade: "9th Grade", views: 0, category: "Mental Health", color: "bg-red-100", likes: 0, likedBy: [], comments: [], status: "pending", reviewNote: "", description: "Sharing my story of burnout.", createdAt: "2023-11-20T09:00:00Z", reportCount: 0 },
  // A rejected video for demo purposes (owned by current user user-123)
  { id: 8, title: "Rant about my teacher", author: "Alex K.", submittedBy: "user-123", sourceType: "youtube", youtubeVideoId: "L_jWHffIx5E", originalUrl: "https://www.youtube.com/watch?v=L_jWHffIx5E", grade: "12th Grade", views: 0, category: "Mental Health", color: "bg-gray-100", likes: 0, likedBy: [], comments: [], status: "rejected", reviewNote: "Content violates community guidelines: Specifically targeting individuals is not allowed.", description: "Just need to vent about Mr. Smith.", createdAt: "2023-11-18T16:50:00Z", reportCount: 0 },
];

export const REVIEWS = [
  {
    id: 1,
    text: "Before I found UpwardEase, I struggled with exam anxiety and felt like no one understood the pressure. Seeing other students share their struggles and strategies made me realize I wasn't alone. It's the only place I feel safe venting about school.",
    author: "Hannah",
    role: "High School Junior",
    color: "bg-yellow-100",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80"
  },
  {
    id: 2,
    text: "I want to create and nurture an environment where people are lifting each other up. UpwardEase enables candid and genuine conversations in a safe place where we can feel comfortable sharing, especially when talking about burnout.",
    author: "Olivia",
    role: "College Freshman",
    color: "bg-red-100",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&q=80"
  },
  {
    id: 3,
    text: "Finding study hacks here saved my GPA, but the community saved my sanity. It's thoughtful by nature and truly helpful by design. I love that we can release pressure without judgment.",
    author: "Marcus",
    role: "12th Grade Student",
    color: "bg-blue-100",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&q=80"
  },
  {
    id: 4,
    text: "The monthly featured topics really help me focus on specific areas of my mental health. Hearing how others balance their social life and academics gave me a completely new perspective.",
    author: "David",
    role: "High School Senior",
    color: "bg-green-100",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80"
  },
  {
    id: 5,
    text: "I was hesitant to upload a video at first, but the moderation here is incredible. It's completely troll-free. I finally feel like I have a voice and that my experiences matter.",
    author: "Chloe",
    role: "College Sophomore",
    color: "bg-purple-100",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80"
  }
];