import type { AboutSettings } from "../lib/types";

export default function About({ about }: { about: AboutSettings }) {
  const [main, ...rest] = about.images ?? [];
  return (
    <section id="sobre" className="bg-white pt-28 pb-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">{about.eyebrow}</p>
          <h2 className="section-title mb-6 text-2xl leading-snug md:text-3xl">{about.title}</h2>
          {about.paragraphs?.map((p, i) => (
            <p key={i} className="mb-4 text-[15px] leading-relaxed text-gray-600">
              {p}
            </p>
          ))}
          {about.ctaLabel && (
            <a
              href={about.ctaUrl || "#reservar"}
              className="btn-brand mt-4 inline-block rounded px-8 py-4 text-sm font-medium tracking-wider"
            >
              {about.ctaLabel}
            </a>
          )}
          {about.ctaNote && (
            <p className="eyebrow mt-5 text-gray-500">{about.ctaNote}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {main && (
            <img
              src={main}
              alt=""
              className="col-span-2 h-72 w-full rounded-md object-cover md:h-96"
            />
          )}
          {rest.map((src, i) => (
            <img key={i} src={src} alt="" className="h-40 w-full rounded-md object-cover md:h-48" />
          ))}
        </div>
      </div>
    </section>
  );
}
