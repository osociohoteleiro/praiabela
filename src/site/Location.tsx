import type { LocationSettings } from "../lib/types";

export default function Location({ location }: { location: LocationSettings }) {
  return (
    <section id="localizacao" className="relative overflow-hidden bg-brand-light/40 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-0 px-5 lg:grid-cols-2">
        <div className="z-10 rounded-md bg-white p-8 shadow-xl lg:mr-[-3rem] lg:p-12">
          <p className="eyebrow mb-3 text-center">{location.eyebrow}</p>
          <h2 className="section-title mb-6 text-center text-2xl md:text-3xl">{location.title}</h2>
          {location.paragraphs?.map((p, i) => (
            <p key={i} className="mb-4 text-[15px] leading-relaxed text-gray-600">
              {p}
            </p>
          ))}
          <div className="mt-6 text-center">
            <a
              href={location.ctaUrl || "#reservar"}
              className="btn-brand inline-block rounded px-8 py-4 text-sm font-medium tracking-wider"
            >
              {location.ctaLabel}
            </a>
          </div>
        </div>
        <img
          src={location.image}
          alt={location.title}
          className="h-80 w-full rounded-md object-cover lg:h-[520px]"
        />
      </div>
    </section>
  );
}
