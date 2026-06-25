import type { Experience, SectionTitle } from "../lib/types";

export default function Experiences({
  experiences,
  section,
}: {
  experiences: Experience[];
  section: SectionTitle;
}) {
  if (experiences.length === 0) return null;

  return (
    <section id="experiencias" className="bg-brand-light py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-2">{section?.eyebrow}</p>
          <h2 className="section-title text-3xl md:text-4xl">{section?.title}</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map((exp) => (
            <article
              key={exp.id}
              className="group overflow-hidden rounded-md bg-white shadow-sm transition hover:shadow-lg"
            >
              <div className="h-52 overflow-hidden">
                <img
                  src={exp.image_url}
                  alt={exp.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl tracking-wide text-ink">{exp.title}</h3>
                {exp.description && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{exp.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
