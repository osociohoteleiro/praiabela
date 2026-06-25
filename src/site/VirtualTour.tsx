import { useEffect, useRef, useState } from "react";
import type { TourSettings } from "../lib/types";

// Atributos do iframe que habilitam a navegação 360° (giroscópio, VR, etc.).
const IFRAME_ALLOW = "accelerometer; gyroscope; magnetometer; vr; xr; fullscreen";

function ExpandIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function VirtualTour({ tour }: { tour?: TourSettings | null }) {
  const [visible, setVisible] = useState(false); // só monta o iframe quando entra na tela
  const [fullscreen, setFullscreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Carrega o tour sob demanda (evita baixar o player 360° no load da página).
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  // No modo tela cheia: trava o scroll do body e fecha com Esc.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  if (!tour?.enabled || !tour.url) return null;

  return (
    <section id="tour" className="bg-brand-light/35 backdrop-blur-sm py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-8 text-center">
          {tour.eyebrow && <p className="eyebrow mb-2">{tour.eyebrow}</p>}
          <h2 className="section-title text-3xl md:text-4xl">{tour.title || "Tour Virtual 360°"}</h2>
          {tour.subtitle && <p className="mx-auto mt-3 max-w-2xl text-gray-600">{tour.subtitle}</p>}
        </div>

        <div ref={ref} className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl">
          {visible ? (
            <iframe
              src={tour.url}
              title={`${tour.title || "Tour Virtual 360°"} - Pousada Praia Bela`}
              className="absolute inset-0 h-full w-full border-0"
              allow={IFRAME_ALLOW}
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white/70">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label="Expandir tour em tela cheia"
            title="Tela cheia"
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
          >
            <ExpandIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label="Tour Virtual 360° em tela cheia">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="font-display text-lg tracking-wide">{tour.title || "Tour Virtual 360°"}</span>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label="Fechar tour"
              title="Fechar (Esc)"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex-1">
            <iframe
              src={tour.url}
              title={`${tour.title || "Tour Virtual 360°"} - Pousada Praia Bela (tela cheia)`}
              className="absolute inset-0 h-full w-full border-0"
              allow={IFRAME_ALLOW}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
