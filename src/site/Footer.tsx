import type { GeneralSettings, ContactSettings } from "../lib/types";
import {
  PinIcon,
  MailIcon,
  PhoneIcon,
  FacebookIcon,
  InstagramIcon,
  WhatsappIcon,
} from "./icons";

export default function Footer({
  general,
  contact,
}: {
  general: GeneralSettings;
  contact: ContactSettings;
}) {
  return (
    <footer id="contato" className="bg-brand-dark text-white">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-2">
          <div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-3xl tracking-wide">{general.logoText}</span>
              <span className="text-xs tracking-[0.3em] text-white/70">{general.logoSubtext}</span>
            </div>
            <p className="mt-4 text-sm text-white/70">CNPJ {contact.cnpj}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">{contact.groupText}</p>
          </div>

          <div className="lg:pl-12">
            <h3 className="mb-5 tracking-widest text-white/90">CONTATO</h3>
            <ul className="space-y-3 text-sm text-white/85">
              <li className="flex items-center gap-3">
                <PinIcon className="h-5 w-5 shrink-0 text-white/70" /> {contact.address}
              </li>
              <li className="flex items-center gap-3">
                <MailIcon className="h-5 w-5 shrink-0 text-white/70" />
                <a href={`mailto:${contact.email}`} className="hover:underline">
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 shrink-0 text-white/70" /> {contact.phone}
              </li>
            </ul>
            <div className="mt-6 flex gap-4">
              <a href={contact.facebook} target="_blank" rel="noreferrer" className="hover:text-brand-light">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href={contact.instagram} target="_blank" rel="noreferrer" className="hover:text-brand-light">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-brand-light">
                <WhatsappIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-sm text-white/70 md:flex-row">
          <p>
            © {new Date().getFullYear()} {general.siteName}. Todos os direitos reservados.
          </p>
          <a href="/admin" className="text-white/60 transition hover:text-white">
            Painel administrativo
          </a>
        </div>
      </div>
    </footer>
  );
}
