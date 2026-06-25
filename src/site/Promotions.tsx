import type { Promotion, SectionTitle } from "../lib/types";

function formatValid(date: string): string {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Promotions({
  promotions,
  section,
}: {
  promotions: Promotion[];
  section: SectionTitle;
}) {
  if (promotions.length === 0) return null;

  return (
    <section id="promocoes" className="bg-brand-light/35 backdrop-blur-sm py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-2">{section?.eyebrow}</p>
          <h2 className="section-title text-3xl md:text-4xl">{section?.title}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {promotions.map((promo) => (
            <article
              key={promo.id}
              className="group relative overflow-hidden rounded-lg bg-white/70 backdrop-blur-md shadow-sm transition hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={promo.image_url}
                  alt={promo.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                {promo.discount > 0 ? (
                  <span className="absolute right-3 top-3 rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-white shadow">
                    -{promo.discount}%
                  </span>
                ) : null}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg tracking-wide text-ink">{promo.title}</h3>
                {promo.description && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{promo.description}</p>
                )}
                {promo.valid_until && (
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-brand">
                    Válida até {formatValid(promo.valid_until)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
