import type { Highlight, Amenity, SectionTitle } from "../lib/types";
import { ICONS } from "./icons";

export default function Highlights({
  highlights,
  amenities,
  highlightsSection,
  amenitiesSection,
}: {
  highlights: Highlight[];
  amenities: Amenity[];
  highlightsSection: SectionTitle;
  amenitiesSection: SectionTitle;
}) {
  return (
    <section id="destaques" className="pb-16">
      <h2 className="section-title mb-10 text-center text-3xl md:text-4xl">
        {highlightsSection.title}
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <div key={h.id} className="group relative h-72 overflow-hidden md:h-80">
            <img
              src={h.image_url}
              alt={h.title}
              className="h-full w-full object-cover brightness-75 transition duration-500 group-hover:scale-105 group-hover:brightness-90"
            />
            <div className="absolute inset-0 flex items-end p-6">
              <h3 className="text-lg font-medium text-white drop-shadow md:text-xl">{h.title}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-6xl px-5">
        <h3 className="section-title mb-8 text-center text-xl text-ink md:text-2xl">
          {amenitiesSection.title}
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
          {amenities.map((a) => {
            const Icon = ICONS[a.icon] ?? ICONS.check;
            const hasInfo = Boolean(a.description?.trim());
            return (
              <div key={a.id} className="group relative flex justify-center">
                <button
                  type="button"
                  aria-label={hasInfo ? `${a.label}. ${a.description}` : a.label}
                  className={`flex w-full flex-col items-center gap-2 px-1 text-center outline-none ${
                    hasInfo ? "cursor-help" : "cursor-default"
                  }`}
                >
                  <Icon className="h-8 w-8 text-brand" />
                  <span
                    className={`text-sm text-gray-600 ${
                      hasInfo
                        ? "underline decoration-dotted decoration-gray-300 underline-offset-4 transition-colors group-hover:text-ink group-focus-within:text-ink"
                        : ""
                    }`}
                  >
                    {a.label}
                  </span>
                </button>

                {hasInfo && (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 w-64 max-w-[80vw] -translate-x-1/2 translate-y-1 rounded-lg bg-white p-4 text-left text-sm leading-relaxed text-gray-700 opacity-0 shadow-xl ring-1 ring-black/5 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
                  >
                    <p className="mb-1 font-medium text-ink">{a.label}</p>
                    {a.description}
                    <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
