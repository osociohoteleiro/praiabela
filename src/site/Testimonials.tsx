import { useState } from "react";
import type { Testimonial, SectionTitle } from "../lib/types";
import { StarIcon, ChevronLeft, ChevronRight } from "./icons";

export default function Testimonials({
  testimonials,
  section,
}: {
  testimonials: Testimonial[];
  section: SectionTitle;
}) {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const pages = Math.max(1, Math.ceil(testimonials.length / perPage));
  const slice = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="section-title mb-12 text-center text-2xl md:text-3xl">{section.title}</h2>

        <div className="relative">
          <div className="grid gap-10 md:grid-cols-3">
            {slice.map((t) => (
              <div key={t.id} className="border-l border-gray-100 px-4 text-center first:border-l-0">
                <div className="mb-4 flex justify-center text-brand">
                  <OwlIcon />
                </div>
                <h3 className="section-title mb-4 text-lg leading-snug text-ink">{t.title}</h3>
                <p className="mb-5 text-sm leading-relaxed text-gray-600">“{t.quote}”</p>
                <div className="mb-2 flex justify-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4" />
                  ))}
                </div>
                <p className="text-sm font-medium text-brand">{t.author}</p>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <>
              <button
                onClick={() => setPage((p) => (p - 1 + pages) % pages)}
                className="absolute -left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-brand transition hover:bg-brand hover:text-white"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPage((p) => (p + 1) % pages)}
                className="absolute -right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-brand transition hover:bg-brand hover:text-white"
                aria-label="Próximo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  i === page ? "bg-brand" : "bg-gray-300"
                }`}
                aria-label={`Página ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function OwlIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="7.5" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16.5" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="7.5" cy="10" r="1.4" />
      <circle cx="16.5" cy="10" r="1.4" />
      <path d="M12 13.5l-1.5 2.5h3z" />
    </svg>
  );
}
