import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useProcessStore } from '../../store/useProcessStore';
import { useUIStore } from '../../store/useUIStore';

const SLIDE_DURATION_MS = 4000;

export default function Slideshow() {
  const { slideshowState, setUI } = useUIStore(
    useShallow((state) => ({ slideshowState: state.slideshowState, setUI: state.setUI })),
  );
  const mediumThumbnails = useProcessStore((state) => state.mediumThumbnails);
  const [readyUrls, setReadyUrls] = useState<string[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const preloadedImagesRef = useRef<HTMLImageElement[]>([]);
  const changedWindowFullscreenRef = useRef(false);

  const sources = useMemo(
    () => slideshowState.paths.map((path) => mediumThumbnails[path] || null),
    [mediumThumbnails, slideshowState.paths],
  );

  const close = useCallback(() => {
    setUI({ slideshowState: { isOpen: false, paths: [] } });
    if (changedWindowFullscreenRef.current) {
      changedWindowFullscreenRef.current = false;
      void getCurrentWindow().setFullscreen(false);
    }
  }, [setUI]);

  useEffect(() => {
    if (!slideshowState.isOpen) return;

    const missingPaths = slideshowState.paths.filter((path) => !mediumThumbnails[path]);
    if (missingPaths.length > 0) {
      void invoke('update_thumbnail_queue', { paths: missingPaths }).catch((error) =>
        console.error('Failed to prepare slideshow previews:', error),
      );
    }
  }, [mediumThumbnails, slideshowState.isOpen, slideshowState.paths]);

  useEffect(() => {
    if (!slideshowState.isOpen || sources.length === 0 || sources.some((source) => !source)) return;

    let cancelled = false;
    setLoadedCount(0);
    setPreloadError(null);
    setReadyUrls([]);
    preloadedImagesRef.current = [];

    Promise.all(
      sources.map(
        (source) =>
          new Promise<string>((resolve, reject) => {
            const image = new Image();
            preloadedImagesRef.current.push(image);
            image.onload = () => {
              if (!cancelled) setLoadedCount((count) => count + 1);
              resolve(source as string);
            };
            image.onerror = () => reject(new Error(`Could not preload ${source}`));
            image.src = source as string;
          }),
      ),
    )
      .then(async (urls) => {
        if (cancelled) return;
        setReadyUrls(urls);
        setIndex(0);
        setIsPlaying(true);
        const appWindow = getCurrentWindow();
        if (!(await appWindow.isFullscreen())) {
          changedWindowFullscreenRef.current = true;
          await appWindow.setFullscreen(true);
        }
      })
      .catch((error) => {
        console.error('Failed to preload slideshow:', error);
        if (!cancelled) setPreloadError('Mindestens ein Bild konnte nicht vorbereitet werden.');
      });

    return () => {
      cancelled = true;
    };
  }, [slideshowState.isOpen, sources]);

  useEffect(() => {
    if (!slideshowState.isOpen) {
      setReadyUrls([]);
      setLoadedCount(0);
      setPreloadError(null);
      preloadedImagesRef.current = [];
    }
  }, [slideshowState.isOpen]);

  const previous = useCallback(() => {
    setIndex((current) => (current - 1 + readyUrls.length) % readyUrls.length);
  }, [readyUrls.length]);

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % readyUrls.length);
  }, [readyUrls.length]);

  useEffect(() => {
    if (!slideshowState.isOpen || readyUrls.length === 0) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowLeft') previous();
      else if (event.key === 'ArrowRight') next();
      else if (event.key === ' ') {
        event.preventDefault();
        setIsPlaying((playing) => !playing);
      } else if (event.key === 'Home') setIndex(0);
      else if (event.key === 'End') setIndex(readyUrls.length - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, next, previous, readyUrls.length, slideshowState.isOpen]);

  useEffect(() => {
    if (!slideshowState.isOpen || !isPlaying || readyUrls.length < 2) return;
    const interval = window.setInterval(next, SLIDE_DURATION_MS);
    return () => window.clearInterval(interval);
  }, [isPlaying, next, readyUrls.length, slideshowState.isOpen]);

  if (!slideshowState.isOpen) return null;

  const isReady = readyUrls.length === slideshowState.paths.length && readyUrls.length > 0;
  const currentPath = slideshowState.paths[index] || '';
  const filename = currentPath.split(/[\\/]/).pop() || currentPath;

  return (
    <div className="fixed inset-0 z-[10000] flex bg-black text-white" role="dialog" aria-label="Diashow">
      {!isReady ? (
        <div className="m-auto flex flex-col items-center gap-3 text-sm text-white/70">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <span>{preloadError || `Bilder werden vorbereitet · ${loadedCount}/${slideshowState.paths.length}`}</span>
          <button className="mt-2 rounded border border-white/20 px-3 py-1 hover:bg-white/10" onClick={close}>
            Abbrechen
          </button>
        </div>
      ) : (
        <>
          <img className="h-full w-full object-contain" src={readyUrls[index]} alt={filename} />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-5">
            <span className="truncate text-sm text-white/80">{filename}</span>
            <button className="rounded p-2 hover:bg-white/10" onClick={close} aria-label="Diashow beenden">
              <X size={22} />
            </button>
          </div>
          <button
            className="absolute inset-y-20 left-0 flex w-20 items-center justify-center text-white/60 hover:bg-white/5 hover:text-white"
            onClick={previous}
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            className="absolute inset-y-20 right-0 flex w-20 items-center justify-center text-white/60 hover:bg-white/5 hover:text-white"
            onClick={next}
            aria-label="Nächstes Bild"
          >
            <ChevronRight size={32} />
          </button>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 bg-gradient-to-t from-black/70 to-transparent p-5 text-sm">
            <button
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              onClick={() => setIsPlaying((playing) => !playing)}
              aria-label={isPlaying ? 'Diashow pausieren' : 'Diashow fortsetzen'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <span className="min-w-16 text-white/70">
              {index + 1} / {readyUrls.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
