import type { GalleryItem, SectionTitle } from "../lib/types";
import { InstagramIcon } from "./icons";

export default function Gallery({
  gallery,
  section,
  handle,
}: {
  gallery: GalleryItem[];
  section: SectionTitle;
  handle: string;
}) {
  return (
    <section id="galeria" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-10 flex items-center gap-6">
          <span className="hidden h-px flex-1 bg-gray-200 md:block" />
          <h2 className="section-title text-2xl md:text-4xl">{section.title}</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {gallery.map((g) => (
            <div key={g.id} className="group relative aspect-square overflow-hidden rounded-md">
              <img
                src={g.image_url}
                alt={g.caption}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              {g.caption && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                  <span className="text-sm text-white">{g.caption}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-brand">
          <InstagramIcon className="h-5 w-5" />
          <span className="tracking-widest text-gray-600">{handle}</span>
        </div>
      </div>
    </section>
  );
}
