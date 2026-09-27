import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../store/useUIStore';
import { Invokes } from '../ui/AppProperties';

const SLIDE_DURATION_MS = 4000;

export default function Slideshow() {
  const { slideshowState, setUI } = useUIStore(
    useShallow((state) => ({ slideshowState: state.slideshowState, setUI: state.setUI })),
  );
  const [readyUrls, setReadyUrls] = useState<Record<number, string>>({});
  const [rendering, setRendering] = useState<Set<number>>(new Set());
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const urlsRef = useRef<Record<number, string>>({});
  const changedWindowFullscreenRef = useRef(false);

  const targetResolution = useMemo(() => {
    const dpr = window.devicePixelRatio || 1;
    return Math.min(6016, Math.ceil(Math.max(window.screen.width, window.screen.height) * dpr));
  }, []);

  const close = useCallback(() => {
    setUI({ slideshowState: { isOpen: false, paths: [] } });
    if (changedWindowFullscreenRef.current) {
      changedWindowFullscreenRef.current = false;
      void getCurrentWindow().setFullscreen(false);
    }
  }, [setUI]);

  useEffect(() => {
    if (!slideshowState.isOpen || slideshowState.paths.length === 0) return;
    const appWindow = getCurrentWindow();
    void appWindow.isFullscreen().then(async (fullscreen) => {
      if (!fullscreen) {
        changedWindowFullscreenRef.current = true;
        await appWindow.setFullscreen(true);
      }
    });
  }, [slideshowState.isOpen, slideshowState.paths.length]);

  useEffect(() => {
    if (!slideshowState.isOpen || slideshowState.paths.length === 0) return;
    const count = slideshowState.paths.length;
    const wanted = [index, (index + 1) % count, (index + 2) % count, (index - 1 + count) % count];
    const wantedSet = new Set(wanted);
    let pruned = false;
    for (const [storedIndex, url] of Object.entries(urlsRef.current)) {
      if (!wantedSet.has(Number(storedIndex))) {
        URL.revokeObjectURL(url);
        delete urlsRef.current[Number(storedIndex)];
        pruned = true;
      }
    }
    if (pruned) setReadyUrls({ ...urlsRef.current });
    for (const wantedIndex of wantedSet) {
      if (urlsRef.current[wantedIndex] || rendering.has(wantedIndex)) continue;
      setRendering((current) => new Set(current).add(wantedIndex));
      void (async () => {
        try {
          const path = slideshowState.paths[wantedIndex];
          const metadata: any = await invoke(Invokes.LoadMetadata, { path });
          const adjustments = metadata?.adjustments && !metadata.adjustments.is_null ? metadata.adjustments : {};
          const bytes = await invoke<Uint8Array>(Invokes.GeneratePreviewForPath, {
            path,
            jsAdjustments: adjustments,
            targetResolution,
          });
          const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }));
          const image = new Image();
          image.src = url;
          await image.decode();
          urlsRef.current[wantedIndex] = url;
          setReadyUrls({ ...urlsRef.current });
          setPreloadError(null);
        } catch (error) {
          console.error('Failed to render slideshow image:', error);
          setPreloadError('Bild konnte nicht in Bildschirmauflösung gerendert werden.');
        } finally {
          setRendering((current) => {
            const next = new Set(current);
            next.delete(wantedIndex);
            return next;
          });
        }
      })();
    }
  }, [index, rendering, slideshowState.isOpen, slideshowState.paths, targetResolution]);

  useEffect(() => {
    if (!slideshowState.isOpen) {
      Object.values(urlsRef.current).forEach(URL.revokeObjectURL);
      urlsRef.current = {};
      setReadyUrls({});
      setPreloadError(null);
    }
  }, [slideshowState.isOpen]);

  const previous = useCallback(() => {
    setIndex((current) => (current - 1 + slideshowState.paths.length) % slideshowState.paths.length);
  }, [slideshowState.paths.length]);

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % slideshowState.paths.length);
  }, [slideshowState.paths.length]);

  useEffect(() => {
    if (!slideshowState.isOpen || slideshowState.paths.length === 0) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowLeft') previous();
      else if (event.key === 'ArrowRight') next();
      else if (event.key === ' ') {
        event.preventDefault();
        setIsPlaying((playing) => !playing);
      } else if (event.key === 'Home') setIndex(0);
      else if (event.key === 'End') setIndex(slideshowState.paths.length - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, next, previous, slideshowState.isOpen, slideshowState.paths.length]);

  useEffect(() => {
    if (!slideshowState.isOpen || !isPlaying || slideshowState.paths.length < 2) return;
    const nextIndex = (index + 1) % slideshowState.paths.length;
    if (!readyUrls[nextIndex]) return;
    const timeout = window.setTimeout(next, SLIDE_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [index, isPlaying, next, readyUrls, slideshowState.isOpen, slideshowState.paths.length]);

  if (!slideshowState.isOpen) return null;

  const currentUrl = readyUrls[index];
  const currentPath = slideshowState.paths[index] || '';
  const filename = currentPath.split(/[\\/]/).pop() || currentPath;

  return (
    <div className="fixed inset-0 z-[10000] flex bg-black text-white" role="dialog" aria-label="Diashow">
      {!currentUrl ? (
        <div className="m-auto flex flex-col items-center gap-3 text-sm text-white/70">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <span>{preloadError || `Bild wird bildschirmoptimiert gerendert · ${targetResolution}px`}</span>
          <button className="mt-2 rounded border border-white/20 px-3 py-1 hover:bg-white/10" onClick={close}>
            Abbrechen
          </button>
        </div>
      ) : (
        <>
          <img className="h-full w-full object-contain" src={currentUrl} alt={filename} />
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
              {index + 1} / {slideshowState.paths.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
