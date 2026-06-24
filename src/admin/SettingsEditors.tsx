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
} from "../lib/types";

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
