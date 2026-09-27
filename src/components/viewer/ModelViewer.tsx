"use client";

import {
  Component,
  type ReactNode,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// The R3F/three bundle is only fetched when the viewer actually mounts.
const ModelScene = lazy(() => import("./ModelScene"));

// ── Error boundary so a broken model never crashes the page ────────────────
class ViewerErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ErrorState() {
  return (
    <div className="blueprint-grid absolute inset-0 grid place-items-center">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center border border-steel-600">
          <span className="font-mono text-lg text-steel-400">!</span>
        </div>
        <p className="font-display text-base font-medium text-paper">
          The 3D model could not be loaded
        </p>
        <p className="mt-2 text-sm text-steel-400">
          The file may be missing, still processing, or in an unsupported format.
          Try refreshing, or contact the site owner.
        </p>
      </div>
    </div>
  );
}

function IdleState({ onActivate }: { onActivate: () => void }) {
  return (
    <button
      onClick={onActivate}
      className="blueprint-grid group absolute inset-0 grid place-items-center"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-steel-600 transition-colors group-hover:border-accent-bright">
          <span className="ml-0.5 border-y-[8px] border-l-[12px] border-y-transparent border-l-paper" />
        </div>
        <span className="tech-label">Load interactive 3D model</span>
      </div>
    </button>
  );
}

export function ModelViewer({
  url,
  className,
  /** When false, shows a click-to-load idle state (used on heavy pages). */
  autoLoad = true,
  /** Show the split / exploded-view slider. */
  allowExplode = true,
}: {
  url: string;
  className?: string;
  autoLoad?: boolean;
  allowExplode?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(autoLoad);
  const [errored, setErrored] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [explode, setExplode] = useState(0);

  const reset = useCallback(() => {
    setResetSignal((s) => s + 1);
    setExplode(0);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.().catch(() => undefined);
    } else {
      await document.exitFullscreen?.().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden border border-steel-800 bg-ink-900",
        isFullscreen && "aspect-auto h-screen",
        className,
      )}
    >
      {errored ? (
        <ErrorState />
      ) : !active ? (
        <IdleState onActivate={() => setActive(true)} />
      ) : (
        <ViewerErrorBoundary onError={() => setErrored(true)}>
          <Suspense fallback={<ViewerSkeleton />}>
            <ModelScene url={url} resetSignal={resetSignal} explode={explode} />
          </Suspense>
        </ViewerErrorBoundary>
      )}

      {/* Control bar */}
      {active && !errored && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
          {allowExplode && (
            <div className="pointer-events-auto flex items-center gap-3 self-start border border-steel-700 bg-ink/70 px-3 py-2 backdrop-blur">
              <span className="tech-label whitespace-nowrap">Split view</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={explode}
                onChange={(e) => setExplode(Number(e.target.value))}
                aria-label="Exploded view amount"
                className="h-1 w-32 cursor-pointer appearance-none bg-steel-700 accent-accent-bright md:w-44"
              />
              <span className="w-8 text-right font-mono text-[10px] text-steel-400">
                {Math.round(explode * 100)}%
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="pointer-events-auto flex items-center gap-2">
              <span className="tech-label bg-ink/70 px-2 py-1 backdrop-blur">
                Drag · Rotate — Scroll · Zoom — Right-drag · Pan
              </span>
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              <ControlButton onClick={reset} label="Reset view" />
              <ControlButton
                onClick={toggleFullscreen}
                label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="border border-steel-700 bg-ink/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-label text-steel-200 backdrop-blur transition-colors hover:border-steel-400 hover:text-paper"
    >
      {label}
    </button>
  );
}

function ViewerSkeleton() {
  return (
    <div className="blueprint-grid absolute inset-0 grid place-items-center">
      <span className="tech-label animate-pulse">Initializing viewer…</span>
    </div>
  );
}
