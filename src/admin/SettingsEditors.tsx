import { useState } from "react";
import { saveSetting } from "../lib/api";
import { Button, Card, Field, Input, Textarea, Select, StringListEditor } from "./ui";
import { ImageInput, ImageListEditor } from "./ImageInput";
import type {
  GeneralSettings,
  HeroSettings,
  AboutSettings,
  LocationSettings,
  PromoSettings,
  ContactSettings,
  SectionTitle,
  ThemeSettings,
  TourSettings,
} from "../lib/types";
import { DEFAULT_THEME } from "../site/ThemeStyle";

function useSetting<T extends object>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<T>) => {
    setValue((v) => ({ ...v, ...patch }));
    setSaved(false);
  };
  const save = async () => {
    setSaving(true);
    await saveSetting(key, value);
    setSaving(false);
    setSaved(true);
  };
  return { value, set, save, saving, saved };
}

function SaveBar({ saving, saved, onSave }: { saving: boolean; saved: boolean; onSave: () => void }) {
  return (
    <div className="mt-5 flex items-center gap-3">
      <Button onClick={onSave} disabled={saving}>
        {saving ? "Salvando…" : "Salvar"}
      </Button>
      {saved && <span className="text-sm text-brand">✓ Salvo</span>}
    </div>
  );
}

export function GeneralEditor({ initial }: { initial: GeneralSettings }) {
  const s = useSetting("general", initial);
  return (
    <Card title="Identidade do site">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome do site"><Input value={s.value.siteName} onChange={(e) => s.set({ siteName: e.target.value })} /></Field>
        <Field label="Localização (topo)"><Input value={s.value.location} onChange={(e) => s.set({ location: e.target.value })} /></Field>
        <Field label="Logo (texto)"><Input value={s.value.logoText} onChange={(e) => s.set({ logoText: e.target.value })} /></Field>
        <Field label="Logo (subtítulo)"><Input value={s.value.logoSubtext} onChange={(e) => s.set({ logoSubtext: e.target.value })} /></Field>
        <Field label="Instagram (@)"><Input value={s.value.instagramHandle} onChange={(e) => s.set({ instagramHandle: e.target.value })} /></Field>
      </div>
      <SaveBar {...s} onSave={s.save} />
    </Card>
  );
}

export function HeroEditor({ initial }: { initial: HeroSettings }) {
  const s = useSetting("hero", initial);
  return (
    <Card title="Hero (banner principal)">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Modo de fundo" hint="Imagem ou vídeo de fundo do banner">
          <Select value={s.value.mode} onChange={(e) => s.set({ mode: e.target.value as "image" | "video" })}>
            <option value="image">Imagem</option>
            <option value="video">Vídeo</option>
          </Select>
        </Field>
        <Field label="Exibir barra de reserva">
          <Select value={String(s.value.showBooking)} onChange={(e) => s.set({ showBooking: e.target.value === "true" })}>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </Select>
        </Field>
        <Field label="Imagem de fundo (também usada como poster do vídeo)">
          <ImageInput value={s.value.imageUrl} onChange={(imageUrl) => s.set({ imageUrl })} />
        </Field>
        <Field label="URL do vídeo (.mp4)" hint="Usado quando o modo é 'Vídeo'">
          <Input value={s.value.videoUrl} onChange={(e) => s.set({ videoUrl: e.target.value })} />
        </Field>
        <Field label="Selo (badge)"><Input value={s.value.badge} onChange={(e) => s.set({ badge: e.target.value })} /></Field>
        <Field label="Título"><Input value={s.value.title} onChange={(e) => s.set({ title: e.target.value })} /></Field>
        <div className="md:col-span-2">
          <Field label="Subtítulo"><Textarea value={s.value.subtitle} onChange={(e) => s.set({ subtitle: e.target.value })} rows={2} /></Field>
        </div>
      </div>
      <SaveBar {...s} onSave={s.save} />
    </Card>
  );
}

export function AboutEditor({ initial }: { initial: AboutSettings }) {
  const s = useSetting("about", initial);
  return (
    <Card title="Seção Sobre">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Eyebrow (texto pequeno acima)"><Input value={s.value.eyebrow} onChange={(e) => s.set({ eyebrow: e.target.value })} /></Field>
        <Field label="Texto do botão"><Input value={s.value.ctaLabel} onChange={(e) => s.set({ ctaLabel: e.target.value })} /></Field>
        <Field label="Link do botão"><Input value={s.value.ctaUrl} onChange={(e) => s.set({ ctaUrl: e.target.value })} /></Field>
        <Field label="Nota abaixo do botão"><Input value={s.value.ctaNote} onChange={(e) => s.set({ ctaNote: e.target.value })} /></Field>
      </div>
      <div className="mt-4">
        <Field label="Título"><Textarea value={s.value.title} onChange={(e) => s.set({ title: e.target.value })} rows={2} /></Field>
      </div>
      <div className="mt-4">
        <Field label="Parágrafos"><StringListEditor values={s.value.paragraphs} onChange={(v) => s.set({ paragraphs: v })} /></Field>
      </div>
      <div className="mt-4">
        <Field label="Imagens" hint="A primeira é a imagem grande"><ImageListEditor values={s.value.images} onChange={(v) => s.set({ images: v })} /></Field>
      </div>
      <SaveBar {...s} onSave={s.save} />
    </Card>
  );
}

export function LocationEditor({ initial }: { initial: LocationSettings }) {
  const s = useSetting("location", initial);
  return (
    <Card title="Seção Localização">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Eyebrow"><Input value={s.value.eyebrow} onChange={(e) => s.set({ eyebrow: e.target.value })} /></Field>
        <Field label="Título"><Input value={s.value.title} onChange={(e) => s.set({ title: e.target.value })} /></Field>
        <Field label="Texto do botão"><Input value={s.value.ctaLabel} onChange={(e) => s.set({ ctaLabel: e.target.value })} /></Field>
        <Field label="Link do botão"><Input value={s.value.ctaUrl} onChange={(e) => s.set({ ctaUrl: e.target.value })} /></Field>
        <div className="md:col-span-2">
          <Field label="Imagem"><ImageInput value={s.value.image} onChange={(image) => s.set({ image })} /></Field>
        </div>
      </div>
      <div className="mt-4">
        <Field label="Parágrafos"><StringListEditor values={s.value.paragraphs} onChange={(v) => s.set({ paragraphs: v })} /></Field>
      </div>
      <SaveBar {...s} onSave={s.save} />
    </Card>
  );
}

export function PromoEditor({ initial }: { initial: PromoSettings }) {
  const s = useSetting("promo", initial);
  return (
    <Card title="Faixa de Promoções">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título"><Input value={s.value.title} onChange={(e) => s.set({ title: e.target.value })} /></Field>
        <Field label="Texto do botão"><Input value={s.value.ctaLabel} onChange={(e) => s.set({ ctaLabel: e.target.value })} /></Field>
        <Field label="Link do botão"><Input value={s.value.ctaUrl} onChange={(e) => s.set({ ctaUrl: e.target.value })} /></Field>
        <div className="md:col-span-2">
          <Field label="Imagem de fundo"><ImageInput value={s.value.image} onChange={(image) => s.set({ image })} /></Field>
        </div>
      </div>
      <SaveBar {...s} onSave={s.save} />
    </Card>
  );
}

export function ContactEditor({ initial }: { initial: ContactSettings }) {
  const s = useSetting("contact", initial);
  return (
    <Card title="Contato e rodapé">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="CNPJ"><Input value={s.value.cnpj} onChange={(e) => s.set({ cnpj: e.target.value })} /></Field>
        <Field label="Endereço"><Input value={s.value.address} onChange={(e) => s.set({ address: e.target.value })} /></Field>
        <Field label="E-mail"><Input value={s.value.email} onChange={(e) => s.set({ email: e.target.value })} /></Field>
        <Field label="Telefone"><Input value={s.value.phone} onChange={(e) => s.set({ phone: e.target.value })} /></Field>
        <Field label="WhatsApp (só números, com DDI)" hint="ex.: 5573999998888"><Input value={s.value.whatsapp} onChange={(e) => s.set({ whatsapp: e.target.value })} /></Field>
        <Field label="Instagram (URL)"><Input value={s.value.instagram} onChange={(e) => s.set({ instagram: e.target.value })} /></Field>
        <Field label="Facebook (URL)"><Input value={s.value.facebook} onChange={(e) => s.set({ facebook: e.target.value })} /></Field>
      </div>
      <div className="mt-4">
        <Field label="Texto institucional"><Textarea value={s.value.groupText} onChange={(e) => s.set({ groupText: e.target.value })} /></Field>
      </div>
      <SaveBar {...s} onSave={s.save} />
    </Card>
  );
}

/** Campo de cor: seletor nativo + entrada hexadecimal sincronizados. */
function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
          aria-label={`${label} (seletor)`}
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono uppercase" />
      </div>
    </Field>
  );
}

export function ThemeEditor({ initial }: { initial: ThemeSettings }) {
  const s = useSetting<ThemeSettings>("theme", initial);
  const v = s.value;
  return (
    <Card title="Cores do site">
      <p className="mb-4 text-sm text-gray-500">
        Personalize a paleta do site. As alterações aparecem no site público depois de salvar.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <ColorField label="Cor principal" hint="Botões, links e destaques" value={v.brand} onChange={(brand) => s.set({ brand })} />
        <ColorField label="Cor principal — hover (mais escura)" value={v.brandDark} onChange={(brandDark) => s.set({ brandDark })} />
        <ColorField label="Fundo claro" hint="Seções com fundo suave" value={v.brandLight} onChange={(brandLight) => s.set({ brandLight })} />
        <ColorField label="Cor dos títulos" value={v.ink} onChange={(ink) => s.set({ ink })} />
        <ColorField label="Cor dos eyebrows" hint="Texto pequeno acima dos títulos" value={v.eyebrow} onChange={(eyebrow) => s.set({ eyebrow })} />
      </div>

      <div className="mt-5 rounded-lg border border-gray-200 p-5" style={{ background: v.brandLight }}>
        <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: v.eyebrow }}>
          Pré-visualização
        </p>
        <h4 className="font-display text-2xl" style={{ color: v.ink }}>
          Pousada Praia Bela
        </h4>
        <button
          type="button"
          className="mt-3 rounded-md px-4 py-2 text-sm font-medium uppercase tracking-wider text-white"
          style={{ background: v.brand }}
        >
          Faça uma reserva
        </button>
      </div>

      <button
        type="button"
        onClick={() => s.set({ ...DEFAULT_THEME })}
        className="mt-3 text-sm text-gray-500 underline-offset-2 hover:underline"
      >
        Restaurar cores padrão
      </button>

      <SaveBar {...s} onSave={s.save} />
    </Card>
  );
}

export function TourEditor({ initial }: { initial: TourSettings }) {
  const s = useSetting<TourSettings>("tour", initial);
  return (
    <Card title="Tour Virtual 360°">
      <p className="mb-4 text-sm text-gray-500">
        Tour 360° embutido (TourMaker, Matterport, Kuula, etc.). Cole a URL de incorporação (embed) do tour.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Exibir no site">
          <Select value={String(s.value.enabled)} onChange={(e) => s.set({ enabled: e.target.value === "true" })}>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </Select>
        </Field>
        <Field label="Eyebrow (texto pequeno acima)"><Input value={s.value.eyebrow} onChange={(e) => s.set({ eyebrow: e.target.value })} /></Field>
        <Field label="Título"><Input value={s.value.title} onChange={(e) => s.set({ title: e.target.value })} /></Field>
        <div className="md:col-span-2">
          <Field label="Subtítulo"><Textarea value={s.value.subtitle} onChange={(e) => s.set({ subtitle: e.target.value })} rows={2} /></Field>
        </div>
        <div className="md:col-span-2">
          <Field label="URL do tour (embed)" hint="Ex.: https://tourmkr.com/F1biwwjN1X/46253449p&346.86h&78.42t&autorotate=true">
            <Input value={s.value.url} onChange={(e) => s.set({ url: e.target.value })} />
          </Field>
        </div>
      </div>

      {s.value.enabled && s.value.url && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-gray-700">Pré-visualização</p>
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-black">
            <iframe
              src={s.value.url}
              title="Pré-visualização do tour"
              className="h-full w-full border-0"
              allow="accelerometer; gyroscope; magnetometer; vr; xr; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <SaveBar {...s} onSave={s.save} />
    </Card>
  );
}

export function SectionTitleEditor({
  settingKey,
  title,
  initial,
  withEyebrow,
}: {
  settingKey: string;
  title: string;
  initial: SectionTitle;
  withEyebrow?: boolean;
}) {
  const s = useSetting(settingKey, initial);
  return (
    <Card title={title}>
      <div className="grid gap-4 md:grid-cols-2">
        {withEyebrow && (
          <Field label="Eyebrow"><Input value={s.value.eyebrow ?? ""} onChange={(e) => s.set({ eyebrow: e.target.value })} /></Field>
        )}
        <Field label="Título"><Input value={s.value.title ?? ""} onChange={(e) => s.set({ title: e.target.value })} /></Field>
      </div>
      <SaveBar {...s} onSave={s.save} />
    </Card>
  );
}
