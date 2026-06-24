import type { PromoSettings } from "../lib/types";

export default function Promo({ promo }: { promo: PromoSettings }) {
  return (
    <section className="relative h-[420px] overflow-hidden">
      <img src={promo.image} alt={promo.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
        <h2 className="font-display text-3xl tracking-wide text-white drop-shadow-lg md:text-5xl">
          {promo.title}
        </h2>
        <a
          href={promo.ctaUrl || "#"}
          className="btn-brand mt-8 rounded px-10 py-4 text-sm font-medium tracking-widest"
        >
          {promo.ctaLabel}
        </a>
      </div>
    </section>
  );
}
