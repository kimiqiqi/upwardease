import { VideoType } from "./types";

export const SYSTEM_INSTRUCTION = `You are the official AI assistant for UpwardEase, a nonprofit platform. Your role is strictly backend support: assisting the team in managing content safety.
If content is unsafe, output: "This content includes potentially sensitive emotional expressions. Recommend admin review before publishing."
If the content is safe and supportive, output: "Content appears safe and aligns with community guidelines."`;

export const TOPIC_SYSTEM_PROMPT = `You are the UpwardEase Featured Topic Assistant. Your job is to generate a weekly study or mental health topic for students (e.g., Exam Stress, Time Management, Motivation) and a fun, lighthearted multiple-choice poll related to it.
Return the result in JSON format:
{
  "topicTitle": "Short, catchy title",
  "topicDescription": "2-3 sentences explaining why this matters.",
  "pollQuestion": "A fun question related to the topic",
  "pollOptions": ["Option A", "Option B", "Option C"]
}
Keep it non-political, safe, and encouraging.`;

export const INITIAL_VIDEOS: VideoType[] = [
  { id: 1, title: "How I organize my notes for Finals", author: "Sarah J.", uploaderId: "user-sarah", grade: "11th Grade", views: 120, category: "Study Tips", color: "bg-pink-100", likes: 45, likedBy: ["user-2"], comments: [], status: "approved", feedback: "", description: "Here is my method for organizing notes using color codes." },
  { id: 2, title: "Dealing with pre-exam anxiety", author: "Marcus T.", uploaderId: "user-marcus", grade: "College Freshman", views: 85, category: "Mental Health", color: "bg-blue-100", likes: 32, likedBy: ["user-1"], comments: [], status: "approved", feedback: "", description: "Breathing exercises that help me before a big test." },
  { id: 3, title: "Pomodoro technique explained", author: "Emily R.", uploaderId: "user-emily", grade: "10th Grade", views: 230, category: "Productivity", color: "bg-amber-100", likes: 112, likedBy: [], comments: [], status: "approved", feedback: "", description: "Stop procrastinating with this simple timer method." },
  { id: 4, title: "My morning routine before school", author: "Alex K.", uploaderId: "user-123", grade: "12th Grade", views: 95, category: "Motivation", color: "bg-green-100", likes: 28, likedBy: [], comments: [], status: "approved", feedback: "", description: "Get ready with me! 6AM start." },
  { id: 5, title: "Chemistry hacks that saved me", author: "Jordan P.", uploaderId: "user-jordan", grade: "College Sophomore", views: 310, category: "Exam Prep", color: "bg-purple-100", likes: 150, likedBy: [], comments: [], status: "approved", feedback: "", description: "Memorization tricks for the periodic table." },
  { id: 6, title: "It's okay to take a break", author: "Lisa M.", uploaderId: "user-lisa", grade: "8th Grade", views: 150, category: "Mental Health", color: "bg-teal-100", likes: 67, likedBy: [], comments: [], status: "approved", feedback: "", description: "Reminding everyone that rest is productive too." },
  // A pending video for demo purposes
  { id: 7, title: "Why I almost quit", author: "New User", uploaderId: "user-new", grade: "9th Grade", views: 0, category: "Mental Health", color: "bg-red-100", likes: 0, likedBy: [], comments: [], status: "pending", feedback: "", description: "Sharing my story of burnout." },
  // A rejected video for demo purposes (owned by current user user-123)
  { id: 8, title: "Rant about my teacher", author: "Alex K.", uploaderId: "user-123", grade: "12th Grade", views: 0, category: "Mental Health", color: "bg-gray-100", likes: 0, likedBy: [], comments: [], status: "rejected", feedback: "Content violates community guidelines: Specifically targeting individuals is not allowed.", description: "Just need to vent about Mr. Smith." },
];

export const REVIEWS = [
  {
    id: 1,
    text: "Before I found UpwardEase, I struggled with exam anxiety and felt like no one understood the pressure. Seeing other students share their struggles and strategies made me realize I wasn't alone. It's the only place I feel safe venting about school.",
    author: "Hannah",
    role: "High School Junior",
    color: "bg-yellow-100"
  },
  {
    id: 2,
    text: "I want to create and nurture an environment where people are lifting each other up. UpwardEase enables candid and genuine conversations in a safe place where we can feel comfortable sharing, especially when talking about burnout.",
    author: "Olivia",
    role: "College Freshman",
    color: "bg-red-100"
  },
  {
    id: 3,
    text: "Finding study hacks here saved my GPA, but the community saved my sanity. It's thoughtful by nature and truly helpful by design. I love that we can release pressure without judgment.",
    author: "Marcus",
    role: "12th Grade Student",
    color: "bg-blue-100"
  }
];