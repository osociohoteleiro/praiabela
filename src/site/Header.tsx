import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { GeneralSettings, ContactSettings } from "../lib/types";
import { PinIcon, FacebookIcon, InstagramIcon, WhatsappIcon } from "./icons";

// `to` => rota (react-router); `href` => âncora na home.
const NAV: { label: string; href?: string; to?: string }[] = [
  { label: "HOTEL", href: "#sobre" },
  { label: "ACOMODAÇÕES", href: "#acomodacoes" },
  { label: "EXPERIÊNCIAS", href: "#experiencias" },
  { label: "PACOTES", href: "#pacotes" },
  { label: "BLOG", to: "/blog" },
  { label: "CONTATO", href: "#contato" },
];

export default function Header({
  general,
  contact,
}: {
  general: GeneralSettings;
  contact: ContactSettings;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          scrolled ? "bg-ink/95 shadow-lg backdrop-blur" : "bg-gradient-to-b from-black/50 to-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex flex-col leading-none text-white">
            <span className="font-display text-2xl tracking-wide">{general.logoText}</span>
            <span className="text-[0.6rem] tracking-[0.3em] text-white/80">
              {general.logoSubtext}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium tracking-wide text-white lg:flex">
            {NAV.map((n) =>
              n.to ? (
                <Link key={n.label} to={n.to} className="transition hover:text-brand">
                  {n.label}
                </Link>
              ) : (
                <a key={n.label} href={n.href} className="transition hover:text-brand">
                  {n.label}
                </a>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="flex items-center gap-1 text-xs text-white">
              <PinIcon className="h-4 w-4" /> {general.location}
            </span>
            <a
              href="#reservar"
              className="btn-brand rounded px-5 py-3 text-sm font-medium tracking-wider"
            >
              FAÇA UMA RESERVA
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col gap-1.5 p-2 lg:hidden"
            aria-label="Menu"
          >
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
          </button>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 bg-ink px-5 pb-4 lg:hidden">
            {NAV.map((n) =>
              n.to ? (
                <Link
                  key={n.label}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-white/10 py-2 text-sm tracking-wide text-white"
                >
                  {n.label}
                </Link>
              ) : (
                <a
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-white/10 py-2 text-sm tracking-wide text-white"
                >
                  {n.label}
                </a>
              ),
            )}
            <a href="#reservar" className="btn-brand mt-3 rounded px-5 py-3 text-center text-sm">
              FAÇA UMA RESERVA
            </a>
          </nav>
        )}
      </header>

      {/* Barra social fixa lateral */}
      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        <SocialIcon href={contact.facebook} label="Facebook">
          <FacebookIcon className="h-5 w-5" />
        </SocialIcon>
        <SocialIcon href={contact.instagram} label="Instagram">
          <InstagramIcon className="h-5 w-5" />
        </SocialIcon>
        <SocialIcon href={`https://wa.me/${contact.whatsapp}`} label="WhatsApp">
          <WhatsappIcon className="h-5 w-5" />
        </SocialIcon>
      </div>
    </>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-full bg-brand/70 text-white shadow-md ring-1 ring-white/30 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-brand"
    >
      {children}
    </a>
  );
}
