import { useEffect, useState } from "react";
import { getContent, verifySession, getToken, clearToken } from "../lib/api";
import type { SiteContent } from "../lib/types";
import Login from "./Login";
import TableEditor, { type FieldDef } from "./TableEditor";
import {
  GeneralEditor,
  HeroEditor,
  AboutEditor,
  LocationEditor,
  PromoEditor,
  ContactEditor,
  SectionTitleEditor,
  ThemeEditor,
  TourEditor,
} from "./SettingsEditors";
import { resolveTheme } from "../site/ThemeStyle";

const NAV = [
  { id: "geral", label: "Geral" },
  { id: "aparencia", label: "Aparência (cores)" },
  { id: "hero", label: "Hero" },
  { id: "sobre", label: "Sobre" },
  { id: "acomodacoes", label: "Acomodações" },
  { id: "tour", label: "Tour Virtual 360°" },
  { id: "experiencias", label: "Experiências" },
  { id: "pacotes", label: "Pacotes" },
  { id: "promocoes", label: "Promoções" },
  { id: "blog", label: "Blog" },
  { id: "destaques", label: "Destaques & Comodidades" },
  { id: "localizacao", label: "Localização" },
  { id: "galeria", label: "Galeria" },
  { id: "promocao", label: "Faixa Promo" },
  { id: "depoimentos", label: "Depoimentos" },
  { id: "contato", label: "Contato" },
] as const;

type Tab = (typeof NAV)[number]["id"];

const ROOM_FIELDS: FieldDef[] = [
  { key: "title", label: "Título", type: "text" },
  { key: "subtitle", label: "Subtítulo", type: "text" },
  { key: "image_url", label: "Imagem", type: "image" },
  { key: "description", label: "Descrição", type: "textarea" },
  { key: "amenities", label: "Comodidades", type: "stringlist" },
];
const HIGHLIGHT_FIELDS: FieldDef[] = [
  { key: "title", label: "Título", type: "text" },
  { key: "image_url", label: "Imagem", type: "image" },
];
const AMENITY_FIELDS: FieldDef[] = [
  { key: "label", label: "Texto", type: "text" },
  { key: "icon", label: "Ícone", type: "icon" },
  { key: "description", label: "Descrição (popup)", type: "textarea" },
];
const TESTIMONIAL_FIELDS: FieldDef[] = [
  { key: "title", label: "Título", type: "text" },
  { key: "author", label: "Autor", type: "text" },
  { key: "rating", label: "Nota (1-5)", type: "number" },
  { key: "quote", label: "Depoimento", type: "textarea" },
];
const GALLERY_FIELDS: FieldDef[] = [
  { key: "image_url", label: "Imagem", type: "image" },
  { key: "caption", label: "Legenda", type: "text" },
];
const EXPERIENCE_FIELDS: FieldDef[] = [
  { key: "title", label: "Título", type: "text" },
  { key: "image_url", label: "Imagem", type: "image" },
  { key: "description", label: "Descrição", type: "textarea" },
];
const PACKAGE_FIELDS: FieldDef[] = [
  { key: "title", label: "Título", type: "text" },
  { key: "price", label: "Preço (R$) — 0 = sob consulta", type: "number" },
  { key: "image_url", label: "Imagem", type: "image" },
  { key: "featured", label: "Destaque", type: "boolean" },
  { key: "description", label: "Descrição", type: "textarea" },
  { key: "inclusions", label: "Inclusões", type: "stringlist" },
];
const PROMOTION_FIELDS: FieldDef[] = [
  { key: "title", label: "Título", type: "text" },
  { key: "discount", label: "Desconto (%)", type: "number" },
  { key: "valid_until", label: "Válida até (AAAA-MM-DD)", type: "text" },
  { key: "image_url", label: "Imagem", type: "image" },
  { key: "description", label: "Descrição", type: "textarea" },
];
const POST_FIELDS: FieldDef[] = [
  { key: "title", label: "Título", type: "text" },
  { key: "slug", label: "Slug (URL: /blog/… — gerado automaticamente)", type: "text", slugFrom: "title" },
  { key: "category", label: "Categoria", type: "text" },
  { key: "published_at", label: "Data (AAAA-MM-DD)", type: "text" },
  { key: "cover_image", label: "Imagem de capa", type: "image" },
  { key: "excerpt", label: "Resumo", type: "textarea" },
  { key: "content", label: "Conteúdo (parágrafos separados por linha em branco)", type: "textarea" },
];

export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("geral");

  useEffect(() => {
    if (!getToken()) {
      setAuthed(false);
      return;
    }
    verifySession()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (authed) getContent().then(setContent).catch(() => setContent(null));
  }, [authed]);

  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
      </div>
    );
  }
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;
  if (!content) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
      </div>
    );
  }

  const s = content.settings;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl tracking-wide text-ink">PRAIA BELA · Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-sm text-brand hover:underline">
            Ver site ↗
          </a>
          <button
            onClick={() => {
              clearToken();
              setAuthed(false);
            }}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 space-y-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  tab === n.id ? "bg-brand text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          {/* Nav mobile */}
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as Tab)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm md:hidden"
          >
            {NAV.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>

          {tab === "geral" && (
            <>
              <GeneralEditor initial={s.general} />
              <SectionTitleEditor settingKey="roomsSection" title="Título — Acomodações" initial={s.roomsSection} withEyebrow />
              <SectionTitleEditor settingKey="experiencesSection" title="Título — Experiências" initial={s.experiencesSection} withEyebrow />
              <SectionTitleEditor settingKey="packagesSection" title="Título — Pacotes" initial={s.packagesSection} withEyebrow />
              <SectionTitleEditor settingKey="promotionsSection" title="Título — Promoções" initial={s.promotionsSection} withEyebrow />
              <SectionTitleEditor settingKey="blogSection" title="Título — Blog" initial={s.blogSection} withEyebrow />
              <SectionTitleEditor settingKey="highlightsSection" title="Título — Destaques" initial={s.highlightsSection} />
              <SectionTitleEditor settingKey="amenitiesSection" title="Título — Comodidades" initial={s.amenitiesSection} />
              <SectionTitleEditor settingKey="testimonialsSection" title="Título — Depoimentos" initial={s.testimonialsSection} />
              <SectionTitleEditor settingKey="gallerySection" title="Título — Galeria" initial={s.gallerySection} />
            </>
          )}
          {tab === "aparencia" && <ThemeEditor initial={resolveTheme(s.theme)} />}
          {tab === "hero" && <HeroEditor initial={s.hero} />}
          {tab === "sobre" && <AboutEditor initial={s.about} />}
          {tab === "acomodacoes" && (
            <TableEditor
              table="rooms"
              title="Acomodações"
              fields={ROOM_FIELDS}
              defaults={{ title: "Nova acomodação", subtitle: "", description: "", image_url: "", amenities: [], sort_order: 99 }}
            />
          )}
          {tab === "tour" && (
            <TourEditor
              initial={
                s.tour ?? {
                  enabled: true,
                  eyebrow: "EXPLORE A POUSADA",
                  title: "Tour Virtual 360°",
                  subtitle: "Passeie pela Pousada Praia Bela como se estivesse aqui. Arraste para girar e explore cada ambiente.",
                  url: "",
                }
              }
            />
          )}
          {tab === "experiencias" && (
            <TableEditor
              table="experiences"
              title="Experiências"
              fields={EXPERIENCE_FIELDS}
              defaults={{ title: "Nova experiência", description: "", image_url: "", sort_order: 99 }}
            />
          )}
          {tab === "pacotes" && (
            <TableEditor
              table="packages"
              title="Pacotes"
              fields={PACKAGE_FIELDS}
              defaults={{ title: "Novo pacote", description: "", price: 0, inclusions: [], image_url: "", featured: 0, sort_order: 99 }}
            />
          )}
          {tab === "promocoes" && (
            <TableEditor
              table="promotions"
              title="Promoções"
              fields={PROMOTION_FIELDS}
              defaults={{ title: "Nova promoção", description: "", discount: 0, valid_until: "", image_url: "", sort_order: 99 }}
            />
          )}
          {tab === "blog" && (
            <TableEditor
              table="posts"
              title="Blog / Postagens"
              fields={POST_FIELDS}
              listMode
              sortKey="published_at"
              sortDir="desc"
              defaults={{ title: "Nova postagem", slug: "nova-postagem", excerpt: "", content: "", cover_image: "", category: "", published_at: "", sort_order: 99 }}
            />
          )}
          {tab === "destaques" && (
            <div className="space-y-8">
              <TableEditor table="highlights" title="Destaques (tiles)" fields={HIGHLIGHT_FIELDS} defaults={{ title: "Novo destaque", image_url: "", sort_order: 99 }} />
              <TableEditor table="amenities" title="Comodidades (ícones)" fields={AMENITY_FIELDS} defaults={{ label: "Nova comodidade", icon: "check", description: "", sort_order: 99 }} />
            </div>
          )}
          {tab === "localizacao" && <LocationEditor initial={s.location} />}
          {tab === "galeria" && (
            <TableEditor table="gallery" title="Galeria" fields={GALLERY_FIELDS} defaults={{ image_url: "", caption: "", sort_order: 99 }} />
          )}
          {tab === "promocao" && <PromoEditor initial={s.promo} />}
          {tab === "depoimentos" && (
            <TableEditor table="testimonials" title="Depoimentos" fields={TESTIMONIAL_FIELDS} defaults={{ title: "Novo depoimento", quote: "", author: "", rating: 5, sort_order: 99 }} />
          )}
          {tab === "contato" && <ContactEditor initial={s.contact} />}
        </main>
      </div>
    </div>
  );
}
