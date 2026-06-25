import { useRef } from "react";
import type { Room, SectionTitle } from "../lib/types";
import { ChevronLeft, ChevronRight } from "./icons";

export default function Rooms({
  rooms,
  section,
}: {
  rooms: Room[];
  section: SectionTitle;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section id="acomodacoes" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-10">
          <p className="eyebrow mb-2">{section.eyebrow}</p>
          <div className="flex items-center gap-6">
            <h2 className="section-title text-3xl md:text-4xl">{section.title}</h2>
            <span className="hidden h-px flex-1 bg-brand/40 md:block" />
          </div>
        </div>

        <div className="relative">
          <div
            ref={scroller}
            className="no-scrollbar flex snap-x gap-5 overflow-x-auto scroll-smooth pb-2"
          >
            {rooms.map((room) => (
              <article
                key={room.id}
                className="group relative h-[460px] w-[88%] flex-none snap-start overflow-hidden rounded-md sm:w-[60%] lg:w-[46%]"
              >
                <img
                  src={room.image_url}
                  alt={room.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                {/* Gradiente inferior: garante leitura do título em qualquer foto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Camada que escurece a foto inteira ao passar o mouse */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/60" />

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="font-display text-2xl tracking-wide drop-shadow-lg">
                    {room.title}
                  </h3>
                  {room.subtitle && (
                    <p className="mt-1 text-sm text-white/90 drop-shadow">{room.subtitle}</p>
                  )}

                  {/* Descrição + comodidades: ocultas em repouso, reveladas no hover.
                      O grid-rows [0fr → 1fr] anima a altura suavemente. */}
                  <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100">
                    <div className="overflow-hidden">
                      {room.description && (
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90">
                          {room.description}
                        </p>
                      )}
                      {room.amenities?.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {room.amenities.map((a) => (
                            <li
                              key={a}
                              className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur"
                            >
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            onClick={() => scroll(-1)}
            className="absolute -left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-lg transition hover:bg-brand hover:text-white"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="absolute -right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-lg transition hover:bg-brand hover:text-white"
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
