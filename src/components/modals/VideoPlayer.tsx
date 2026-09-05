import { useCallback, useEffect, useMemo, useRef } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../store/useUIStore';

export default function VideoPlayer() {
  const { videoPlayerState, setUI } = useUIStore(
    useShallow((state) => ({ videoPlayerState: state.videoPlayerState, setUI: state.setUI })),
  );
  const changedWindowFullscreenRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const source = useMemo(
    () => (videoPlayerState.path ? convertFileSrc(videoPlayerState.path.replace(/\\/g, '/')) : ''),
    [videoPlayerState.path],
  );

  const close = useCallback(() => {
    videoRef.current?.pause();
    setUI({ videoPlayerState: { isOpen: false, path: null } });
    if (changedWindowFullscreenRef.current) {
      changedWindowFullscreenRef.current = false;
      void getCurrentWindow().setFullscreen(false);
    }
  }, [setUI]);

  useEffect(() => {
    if (!videoPlayerState.isOpen) return;
    let cancelled = false;
    void (async () => {
      const appWindow = getCurrentWindow();
      if (!(await appWindow.isFullscreen()) && !cancelled) {
        changedWindowFullscreenRef.current = true;
        await appWindow.setFullscreen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoPlayerState.isOpen]);

  useEffect(() => {
    if (!videoPlayerState.isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, videoPlayerState.isOpen]);

  if (!videoPlayerState.isOpen || !videoPlayerState.path) return null;
  const filename = videoPlayerState.path.split(/[\\/]/).pop() || videoPlayerState.path;

  return (
    <div className="fixed inset-0 z-[10000] flex bg-black text-white" role="dialog" aria-label="Videoplayer">
      <video ref={videoRef} className="h-full w-full object-contain" src={source} controls autoPlay playsInline>
        Dieses Videoformat wird von macOS WebKit nicht unterstützt.
      </video>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-5">
        <span className="truncate text-sm text-white/80">{filename}</span>
        <button
          className="pointer-events-auto rounded p-2 hover:bg-white/10"
          onClick={close}
          aria-label="Videoplayer schließen"
        >
          <X size={22} />
        </button>
      </div>
    </div>
  );
}
