export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }
  
  return null;
}

export function getYouTubeEmbedUrl(videoId: string, useNoCookie = true): string {
  const baseUrl = useNoCookie ? 'https://www.youtube-nocookie.com/embed/' : 'https://www.youtube.com/embed/';
  return `${baseUrl}${videoId}`;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
