import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Floating music player — bottom-right corner.
 * Plays audio from /music/song.mp3 with play/pause, volume, progress.
 */
export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const onTime = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onDur = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDur);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDur);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  }, [playing]);

  const handleProgressClick = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  }, [duration]);

  const formatTime = (s) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <audio ref={audioRef} src="/music/song.mp3" preload="metadata" />

      <div
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Volume popup */}
        {showVolume && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 appearance-none rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ff6b9d ${volume * 100}%, rgba(255,255,255,0.15) ${volume * 100}%)`,
              }}
            />
          </div>
        )}

        {/* Main player bar */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          {/* Equalizer animation when playing */}
          <div className="flex items-end gap-[2px] h-4 w-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-valley-pink"
                style={{
                  height: playing ? undefined : '4px',
                  animation: playing ? `eq-bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate` : 'none',
                }}
              />
            ))}
          </div>

          {/* Song info + progress */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-[10px] text-white/60 font-mono tracking-wider truncate max-w-[160px]">
              没有人能够比我们更接近对方
            </span>

            {/* Progress bar */}
            <div
              className="w-full h-[3px] rounded-full bg-white/10 cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full rounded-full bg-valley-pink transition-all duration-200"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Time */}
            <div className="flex justify-between text-[9px] text-white/30 font-mono">
              <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-valley-pink/20 border border-valley-pink/30 text-valley-pink hover:bg-valley-pink/30 transition-all duration-200 shrink-0"
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Volume toggle */}
          <button
            onClick={() => setShowVolume(!showVolume)}
            className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {volume > 0.5 ? (
                <>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M18.07 5.93a9 9 0 0 1 0 12.14" />
                </>
              ) : volume > 0 ? (
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              ) : (
                <line x1="23" y1="9" x2="17" y2="15" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Equalizer keyframe animation */}
      <style>{`
        @keyframes eq-bounce {
          0% { height: 3px; }
          100% { height: 16px; }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff6b9d;
          cursor: pointer;
          border: none;
        }
        input[type="range"]::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff6b9d;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
}
