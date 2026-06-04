import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutePath } from '../config/routes.config';
import WavyUnderline from './WavyUnderline';

const VIDEO_SOURCES = [
  { src: '/rsp_video.mp4', type: 'video/mp4' },
  { src: '/rsp_video.webm', type: 'video/webm' },
];

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VideoShowcase = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || loadError) return;

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
        setHasStarted(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(false);
    }
  }, [loadError]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleProgressClick = useCallback((e) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar || !video.duration) return;

    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    video.currentTime = ratio * video.duration;
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* fullscreen not supported */
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isInView && isPlaying) {
      video.pause();
      setIsPlaying(false);
    }
  }, [isInView, isPlaying]);

  useEffect(() => {
    let hideTimer;
    if (isPlaying && hasStarted) {
      hideTimer = setTimeout(() => setShowControls(false), 2800);
    } else {
      setShowControls(true);
    }
    return () => clearTimeout(hideTimer);
  }, [isPlaying, hasStarted]);

  const highlights = [
    'In-house UK manufacturing',
    'Premium materials & finishing',
    'End-to-end project delivery',
  ];

  return (
    <section
      id="showcase"
      className="relative py-12 md:py-16 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100"
    >
      <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-yellow-400" aria-hidden="true" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Video — left */}
          <div
            ref={containerRef}
            className="relative group w-full"
            onMouseEnter={() => setShowControls(true)}
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
          {/* Frame */}
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-blue-200/60 via-transparent to-yellow-300/40 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative rounded-xl overflow-hidden bg-black shadow-lg border border-gray-200">
            <div className="relative aspect-video">
              {!loadError ? (
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted={isMuted}
                  playsInline
                  preload="metadata"
                  onClick={togglePlay}
                  onTimeUpdate={() => {
                    const video = videoRef.current;
                    if (!video?.duration) return;
                    setCurrentTime(video.currentTime);
                    setProgress((video.currentTime / video.duration) * 100);
                  }}
                  onLoadedMetadata={() => {
                    const video = videoRef.current;
                    if (video) setDuration(video.duration);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false);
                    setShowControls(true);
                  }}
                  onError={() => setLoadError(true)}
                >
                  {VIDEO_SOURCES.map(({ src, type }) => (
                    <source key={src} src={src} type={type} />
                  ))}
                </video>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-center px-6">
                  <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Place your video at <span className="text-gray-700 font-medium">public/rsp_video.mp4</span>
                  </p>
                </div>
              )}

              {/* Play overlay */}
              {!loadError && (!hasStarted || !isPlaying) && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300 hover:bg-black/30"
                  aria-label="Play video"
                >
                  <span className="relative flex items-center justify-center w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-transform duration-300 hover:scale-105 group-hover:shadow-blue-500/20">
                    <span className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping opacity-40" />
                    <svg className="w-7 h-7 md:w-8 md:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </button>
              )}

              {/* Controls bar */}
              {!loadError && (
                <div
                  className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ${
                    showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pt-8 pb-3">
                    {/* Progress */}
                    <div
                      ref={progressRef}
                      role="slider"
                      aria-label="Video progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progress)}
                      tabIndex={0}
                      onClick={handleProgressClick}
                      onKeyDown={(e) => {
                        const video = videoRef.current;
                        if (!video?.duration) return;
                        if (e.key === 'ArrowRight') video.currentTime = Math.min(video.currentTime + 5, video.duration);
                        if (e.key === 'ArrowLeft') video.currentTime = Math.max(video.currentTime - 5, 0);
                      }}
                      className="relative h-1.5 mb-2.5 rounded-full bg-white/20 cursor-pointer group/progress"
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `calc(${progress}% - 6px)` }}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={toggleMute}
                          className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-4.707-4.707C8.109 11.891 8 10.945 8 10s.109-1.891.707-2.707M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          )}
                        </button>

                        <span className="text-[11px] text-white/70 tabular-nums" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Fullscreen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Content — right */}
          <div className="space-y-5 lg:pl-2">
            <span
              className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-blue-50 text-blue-800 border border-blue-100"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              See Us In Action
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              Craftsmanship That{' '}
              <span className="text-blue-600 relative inline-block">
                Speaks
                <span className="absolute -inset-1 bg-blue-600/10 blur-lg" aria-hidden="true" />
              </span>{' '}
              for Itself
            </h2>
            <p
              className="text-sm md:text-base text-gray-600 leading-relaxed"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              From concept to installation — watch how we bring custom signage and branding
              to life at our{' '}
              <WavyUnderline>Middlesbrough</WavyUnderline>{' '}
              facility.
            </p>

            <ul className="space-y-2.5 pt-1">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-gray-600"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => navigate(getRoutePath('getQuote'))}
              className="group bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Start Your Project
              <svg className="inline-block w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
