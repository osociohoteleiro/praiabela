import { useRef, useState } from "react";
import { uploadImage } from "../lib/api";
import { compressImage, formatBytes } from "../lib/image";
import { Button } from "./ui";

export function ImageInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem");
      return;
    }
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const { blob, ext } = await compressImage(file);
      const { url } = await uploadImage(blob, ext);
      onChange(url);
      setInfo(`Enviado · ${formatBytes(file.size)} → ${formatBytes(blob.size)} (${ext})`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-5 text-center transition ${
          dragOver ? "border-brand bg-brand-light/40" : "border-gray-300 hover:border-brand/60"
        }`}
      >
        {busy ? (
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
            Comprimindo e enviando…
          </span>
        ) : (
          <span className="text-sm text-gray-500">
            <span className="font-medium text-brand">Clique para enviar</span> ou arraste uma imagem
            <br />
            <span className="text-xs text-gray-400">JPG, PNG, WebP — redimensionada p/ 800px e comprimida</span>
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {value && (
        <div className="mt-2 flex items-start gap-3">
          <img
            src={value}
            alt=""
            className="h-20 w-28 shrink-0 rounded-md border border-gray-200 object-cover"
          />
          <div className="min-w-0 flex-1">
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://… (ou envie acima)"
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:border-brand"
            />
            <Button variant="ghost" className="mt-1 !px-2 !py-1 text-xs" onClick={() => onChange("")}>
              Limpar
            </Button>
          </div>
        </div>
      )}

      {info && <p className="mt-1 text-xs text-brand">{info}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function ImageListEditor({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      {values.map((url, i) => (
        <div key={i} className="rounded-md border border-gray-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Imagem {i + 1}</span>
            <Button
              variant="danger"
              className="!px-2 !py-1 text-xs"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            >
              Remover
            </Button>
          </div>
          <ImageInput
            value={url}
            onChange={(v) => {
              const next = [...values];
              next[i] = v;
              onChange(next);
            }}
          />
        </div>
      ))}
      <Button variant="ghost" onClick={() => onChange([...values, ""])}>
        + Adicionar imagem
      </Button>
    </div>
  );
}
