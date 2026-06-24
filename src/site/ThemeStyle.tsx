import type { ThemeSettings } from "../lib/types";

// Paleta padrão — espelha as variáveis definidas em src/index.css (@theme).
export const DEFAULT_THEME: ThemeSettings = {
  brand: "#2f8f63",
  brandDark: "#246b4a",
  brandLight: "#e6f1ea",
  ink: "#1f3b30",
  eyebrow: "#2f8f63",
};

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

// Garante que só cores hexadecimais válidas cheguem ao CSS (evita quebrar o
// layout caso o valor salvo esteja inválido).
function safe(value: string | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  return HEX.test(v) ? v : fallback;
}

/** Mescla o tema salvo com os padrões, validando cada cor. */
export function resolveTheme(theme?: Partial<ThemeSettings> | null): ThemeSettings {
  return {
    brand: safe(theme?.brand, DEFAULT_THEME.brand),
    brandDark: safe(theme?.brandDark, DEFAULT_THEME.brandDark),
    brandLight: safe(theme?.brandLight, DEFAULT_THEME.brandLight),
    ink: safe(theme?.ink, DEFAULT_THEME.ink),
    eyebrow: safe(theme?.eyebrow, DEFAULT_THEME.eyebrow),
  };
}

/**
 * Sobrescreve as variáveis de cor do Tailwind v4 em runtime. Como as utilitárias
 * (bg-brand, text-ink, etc.) referenciam var(--color-*), redefinir essas
 * variáveis no :root re-tematiza o site inteiro sem rebuild.
 */
export default function ThemeStyle({ theme }: { theme?: Partial<ThemeSettings> | null }) {
  const t = resolveTheme(theme);
  const css =
    `:root{` +
    `--color-brand:${t.brand};` +
    `--color-brand-dark:${t.brandDark};` +
    `--color-brand-light:${t.brandLight};` +
    `--color-ink:${t.ink};` +
    `--color-eyebrow:${t.eyebrow};` +
    `}`;
  return <style>{css}</style>;
}
