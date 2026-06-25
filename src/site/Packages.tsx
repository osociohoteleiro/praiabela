import { useRef } from "react";
import type { Package, SectionTitle } from "../lib/types";
import { CheckIcon, ChevronLeft, ChevronRight } from "./icons";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function Packages({
  packages,
  section,
}: {
  packages: Package[];
  section: SectionTitle;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (packages.length === 0) return null;

  return (
    <section id="pacotes" className="py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-2">{section?.eyebrow}</p>
          <h2 className="section-title text-3xl md:text-4xl">{section?.title}</h2>
        </div>

        <div className="relative">
          <div
            ref={scroller}
            className="no-scrollbar flex snap-x gap-7 overflow-x-auto scroll-smooth pb-2"
          >
            {packages.map((pkg) => (
            <article
              key={pkg.id}
              className={`flex w-[85%] flex-none snap-start flex-col overflow-hidden rounded-lg border bg-white/85 shadow-sm transition hover:shadow-lg sm:w-[46%] lg:w-[23%] ${
                pkg.featured ? "border-brand ring-1 ring-brand/30" : "border-gray-200"
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={pkg.image_url} alt={pkg.title} className="h-full w-full object-cover" />
                {pkg.featured ? (
                  <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-medium tracking-wide text-white">
                    Destaque
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl tracking-wide text-ink">{pkg.title}</h3>
                {pkg.description && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{pkg.description}</p>
                )}

                {pkg.inclusions?.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {pkg.inclusions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6 flex items-end justify-between border-t border-gray-100 pt-4">
                  <div>
                    {pkg.price > 0 ? (
                      <>
                        <span className="block text-xs text-gray-400">a partir de</span>
                        <span className="font-display text-2xl text-ink">{brl.format(pkg.price)}</span>
                      </>
                    ) : (
                      <span className="font-display text-xl text-ink">Sob consulta</span>
                    )}
                  </div>
                  <a
                    href="#reservar"
                    className="btn-brand rounded px-5 py-2.5 text-sm font-medium tracking-wide"
                  >
                    Reservar
                  </a>
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
