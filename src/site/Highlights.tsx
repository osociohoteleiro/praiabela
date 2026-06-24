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
    <section id="destaques" className="bg-white pb-16">
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
        <div className="flex flex-col items-center gap-8 md:flex-row md:flex-wrap md:justify-between">
          <h3 className="section-title max-w-xs text-xl text-ink md:text-2xl">
            {amenitiesSection.title}
          </h3>
          {amenities.map((a) => {
            const Icon = ICONS[a.icon] ?? ICONS.check;
            return (
              <div key={a.id} className="flex flex-col items-center gap-2 text-center">
                <Icon className="h-8 w-8 text-brand" />
                <span className="max-w-[9rem] text-sm text-gray-600">{a.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
