import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Video, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface YouTubeVideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  channel?: string;
}

interface EducationalYouTubeSectionProps {
  topic: string;
  subject?: string;
  className?: string;
  initialVideos?: YouTubeVideoItem[];
  onVideosLoaded?: (videos: YouTubeVideoItem[]) => void;
}

/**
 * Automatically provides 2-3 genuine educational YouTube video links
 * for any searched topic across Student, Teacher & Faculty, STEM Teacher, and AI Assistant.
 * Never invents fake URLs; uses verified educational channels and live YouTube indexed results.
 */
export const EducationalYouTubeSection: React.FC<EducationalYouTubeSectionProps> = ({
  topic,
  subject = '',
  className = '',
  initialVideos,
  onVideosLoaded,
}) => {
  const { t, isRTL } = useLanguage();
  const [videos, setVideos] = useState<YouTubeVideoItem[]>(initialVideos || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topic || !topic.trim()) {
      setVideos([]);
      return;
    }

    if (initialVideos && initialVideos.length > 0) {
      setVideos(initialVideos);
      return;
    }

    let isMounted = true;
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          topic: topic.trim(),
          subject: (subject || '').trim(),
        });
        const res = await fetch(`/api/resources/youtube?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Could not load videos');
        const data = await res.json();
        if (isMounted) {
          if (data && Array.isArray(data.videos) && data.videos.length > 0) {
            setVideos(data.videos);
            onVideosLoaded?.(data.videos);
          } else {
            setVideos([]);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch educational videos');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
    };
  }, [topic, subject, initialVideos]);

  if (!topic || (!loading && videos.length === 0)) {
    return null;
  }

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3.5 ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
              {t('resources.youtubeTitle', 'Educational Video Lessons')}
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {t('resources.youtubeSubtitle', 'Verified tutorials & concept explanations for')} <span className="font-semibold text-emerald-600 dark:text-emerald-400">{topic}</span>
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 border border-red-600/20">
          YouTube
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] animate-pulse flex items-center justify-center"
            >
              <Loader2 className="w-5 h-5 text-[var(--text-muted)] animate-spin" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {videos.slice(0, 3).map((video) => (
            <a
              key={video.id || video.url}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-secondary)] hover:border-red-500/50 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-black/10 overflow-hidden">
                <img
                  src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to high quality or standard default
                    const target = e.currentTarget;
                    if (!target.src.includes('mqdefault')) {
                      target.src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Channel Info */}
              <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                <h5 className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {video.title}
                </h5>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                  <span className="truncate max-w-[140px] font-medium">
                    {video.channel || 'Educational Resource'}
                  </span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover:text-red-600 transition-colors shrink-0" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
