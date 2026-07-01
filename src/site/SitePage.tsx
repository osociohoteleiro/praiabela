import { useEffect, useState } from "react";
import { getContent } from "../lib/api";
import type { SiteContent } from "../lib/types";
import Header from "./Header";
import Hero from "./Hero";
import About from "./About";
import Highlights from "./Highlights";
import Rooms from "./Rooms";
import Experiences from "./Experiences";
import Packages from "./Packages";
import Promotions from "./Promotions";
import Location from "./Location";
import Promo from "./Promo";
import BlogTeaser from "./BlogTeaser";
import Testimonials from "./Testimonials";
import Footer from "./Footer";
import ThemeStyle from "./ThemeStyle";
import VirtualTour from "./VirtualTour";

export default function SitePage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getContent()
      .then(setContent)
      .catch((e) => setError(e.message));
  }, []);

  // Após o conteúdo carregar, rola até a âncora do hash (ex.: /#acomodacoes)
  useEffect(() => {
    if (!content) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    // Pequeno delay para garantir que o DOM das seções já foi pintado
    const t = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(t);
  }, [content]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-light px-6 text-center">
        <div>
          <h1 className="section-title mb-2 text-2xl">Não foi possível carregar o site</h1>
          <p className="text-gray-600">{error}</p>
          <p className="mt-4 text-sm text-gray-500">
            Verifique se o banco D1 foi migrado e populado (veja o README).
          </p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-light">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
      </div>
    );
  }

  const { settings, rooms, highlights, amenities, testimonials, experiences, packages, promotions, posts } =
    content;

  return (
    <div>
      <ThemeStyle theme={settings.theme} />
      <Header general={settings.general} contact={settings.contact} />
      <Hero hero={settings.hero} />
      <About about={settings.about} />
      <Highlights
        highlights={highlights}
        amenities={amenities}
        highlightsSection={settings.highlightsSection}
        amenitiesSection={settings.amenitiesSection}
      />
      <Rooms rooms={rooms} section={settings.roomsSection} />
      <VirtualTour tour={settings.tour} />
      <Experiences experiences={experiences} section={settings.experiencesSection} />
      <Packages packages={packages} section={settings.packagesSection} />
      <Promotions promotions={promotions} section={settings.promotionsSection} />
      <Location location={settings.location} />
      <Promo promo={settings.promo} />
      <BlogTeaser posts={posts} section={settings.blogSection} />
      <Testimonials testimonials={testimonials} section={settings.testimonialsSection} />
      <Footer general={settings.general} contact={settings.contact} />
    </div>
  );
}
