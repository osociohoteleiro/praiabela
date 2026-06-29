import { useEffect, useState, type ReactNode } from "react";
import {
  listItems,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  type TableName,
} from "../lib/api";
import { Button, Field, Input, Textarea, Select, StringListEditor } from "./ui";
import { ImageInput } from "./ImageInput";
import { ICONS } from "../site/icons";

export type FieldType = "text" | "textarea" | "image" | "number" | "icon" | "stringlist" | "boolean";
export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  /** Quando definido, este campo é gerado automaticamente (slug) a partir do campo indicado e fica desabilitado para edição. */
  slugFrom?: string;
}

/** Gera um slug coerente: minúsculas, sem acentos, espaços/símbolos viram hífen. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Row = Record<string, unknown> & { id: number };

export default function TableEditor({
  table,
  title,
  fields,
  defaults,
  listMode = false,
  sortKey,
  sortDir = "desc",
}: {
  table: TableName;
  title: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  /** Exibe os itens como lista compacta com botão "Editar" e formulário inline (em vez de todos os cards abertos). */
  listMode?: boolean;
  /** Chave usada para ordenar a lista exibida (ex.: "published_at"). */
  sortKey?: string;
  /** Direção da ordenação da lista. Padrão: "desc" (mais recente primeiro). */
  sortDir?: "asc" | "desc";
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [loading, setLoading] = useState(true);
  // No modo lista: id do item aberto no formulário ("new" = rascunho não salvo; null = mostrando a lista)
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  // Rascunho de uma nova postagem, ainda não persistido no banco
  const [draft, setDraft] = useState<Row | null>(null);
  // Item aguardando confirmação de remoção (null = nenhum)
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Converte campos JSON (stringlist) para array
  const normalize = (r: Row): Row => {
    const copy = { ...r };
    for (const f of fields) {
      if (f.type === "stringlist" && typeof copy[f.key] === "string") {
        try {
          copy[f.key] = JSON.parse(copy[f.key] as string);
        } catch {
          copy[f.key] = [];
        }
      }
    }
    return copy;
  };

  const load = async () => {
    setLoading(true);
    const data = await listItems<Row>(table);
    setRows(data.map(normalize));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  // Aplica derivação de campos (slug) ao alterar o campo de origem
  const applyDerived = (row: Row, key: string, value: unknown): Row => {
    const next = { ...row, [key]: value };
    for (const f of fields) {
      if (f.slugFrom === key) next[f.key] = slugify(String(value ?? ""));
    }
    return next;
  };

  const updateRow = (id: number, key: string, value: unknown) => {
    setRows((rs) => rs.map((r) => (r.id === id ? applyDerived(r, key, value) : r)));
  };

  const updateDraft = (key: string, value: unknown) => {
    setDraft((d) => (d ? applyDerived(d, key, value) : d));
  };

  const save = async (row: Row) => {
    setSavingId(row.id);
    const payload: Record<string, unknown> = {};
    for (const f of fields) payload[f.key] = row[f.key];
    await updateItem(table, row.id, payload);
    setSavingId(null);
  };

  // Modo padrão: cria já no banco e mostra o card aberto
  const add = async () => {
    setSavingId("new");
    await createItem(table, defaults);
    await load();
    setSavingId(null);
  };

  // Modo lista: abre um rascunho (ainda não vai para o banco)
  const startDraft = () => {
    setDraft(normalize({ ...defaults, id: -1 } as Row));
    setEditingId("new");
  };

  const discardDraft = () => {
    setDraft(null);
    setEditingId(null);
  };

  // Salva o rascunho: aí sim cria a postagem no banco
  const saveDraft = async () => {
    if (!draft) return;
    setSavingId("new");
    const payload: Record<string, unknown> = {};
    for (const f of fields) payload[f.key] = draft[f.key];
    await createItem(table, payload);
    setSavingId(null);
    setDraft(null);
    setEditingId(null);
    await load();
  };

  const confirmRemove = async () => {
    if (confirmId === null) return;
    const id = confirmId;
    setConfirmId(null);
    await deleteItem(table, id);
    if (editingId === id) setEditingId(null);
    await load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    await reorderItems(table, next.map((r) => r.id));
  };

  const sortedRows = (): Row[] => {
    if (!sortKey) return rows;
    const factor = sortDir === "asc" ? 1 : -1;
    return [...rows].sort(
      (a, b) => String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? "")) * factor,
    );
  };

  if (loading) return <p className="text-sm text-gray-500">Carregando…</p>;

  // Campos do formulário + botão salvar (reutilizado por edição, rascunho e cards)
  const renderFields = (
    row: Row,
    onChange: (key: string, value: unknown) => void,
    onSave: () => void,
    saving: boolean,
    saveLabel = "Salvar item",
  ) => (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.type === "textarea" || f.type === "stringlist" ? "md:col-span-2" : ""}>
            <Field label={f.label}>
              <FieldInput field={f} value={row[f.key]} onChange={(v) => onChange(f.key, v)} />
            </Field>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Salvando…" : saveLabel}
        </Button>
      </div>
    </>
  );

  const itemName = (id: number) =>
    String(rows.find((r) => r.id === id)?.[fields[0]?.key] ?? "") || "este item";

  // Modal de confirmação de remoção (compartilhado por todos os modos)
  const confirmModal = confirmId !== null && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">Remover postagem?</h3>
        <p className="mt-2 text-sm text-gray-600">
          Tem certeza que deseja remover <strong>“{itemName(confirmId)}”</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmRemove}>
            Remover
          </Button>
        </div>
      </div>
    </div>
  );

  let body: ReactNode;

  if (listMode) {
    if (editingId === "new" && draft) {
      // Rascunho de nova postagem (ainda não publicado)
      body = (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Rascunho de nova postagem</span>
            <Button variant="danger" onClick={discardDraft}>
              Recusar rascunho
            </Button>
          </div>
          <div className="rounded-lg border border-dashed border-brand/40 bg-white p-5 shadow-sm">
            {renderFields(draft, updateDraft, saveDraft, savingId === "new", "Salvar e publicar")}
          </div>
        </div>
      );
    } else if (typeof editingId === "number") {
      // Edição de uma postagem existente
      const row = rows.find((r) => r.id === editingId);
      if (!row) {
        setEditingId(null);
        body = null;
      } else {
        body = (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setEditingId(null)}>
                ← Voltar à lista
              </Button>
              <Button variant="danger" onClick={() => setConfirmId(row.id)}>
                Remover
              </Button>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              {renderFields(row, (k, v) => updateRow(row.id, k, v), () => save(row), savingId === row.id)}
            </div>
          </div>
        );
      }
    } else {
      // Lista compacta ordenada
      const list = sortedRows();
      body = (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            <Button onClick={startDraft}>+ Novo item</Button>
          </div>

          <ul className="space-y-2">
            {list.map((row) => {
              const heading = String(row[fields[0]?.key] ?? "") || "(sem título)";
              const subtitle = [row[sortKey ?? ""], row["category"]]
                .map((v) => String(v ?? "").trim())
                .filter(Boolean)
                .join(" · ");
              return (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{heading}</p>
                    {subtitle && <p className="truncate text-xs text-gray-500">{subtitle}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" onClick={() => setEditingId(row.id)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => setConfirmId(row.id)}>
                      Remover
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          {list.length === 0 && <p className="text-sm text-gray-500">Nenhum item ainda.</p>}
        </div>
      );
    }
  } else {
    // Modo padrão: todos os cards abertos
    body = (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          <Button onClick={add} disabled={savingId === "new"}>
            {savingId === "new" ? "Adicionando…" : "+ Novo item"}
          </Button>
        </div>

        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  #{index + 1}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => move(index, -1)} disabled={index === 0}>
                    ↑
                  </Button>
                  <Button variant="ghost" onClick={() => move(index, 1)} disabled={index === rows.length - 1}>
                    ↓
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmId(row.id)}>
                    Remover
                  </Button>
                </div>
              </div>

              {renderFields(row, (k, v) => updateRow(row.id, k, v), () => save(row), savingId === row.id)}
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-gray-500">Nenhum item ainda.</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      {body}
      {confirmModal}
    </>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.type) {
    case "textarea":
      return <Textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return (
        <Input
          type="number"
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );
    case "image":
      return <ImageInput value={String(value ?? "")} onChange={onChange} />;
    case "boolean":
      return (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={Number(value ?? 0) === 1}
            onChange={(e) => onChange(e.target.checked ? 1 : 0)}
            className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand/30"
          />
          Sim
        </label>
      );
    case "icon":
      return (
        <Select value={String(value ?? "check")} onChange={(e) => onChange(e.target.value)}>
          {Object.keys(ICONS).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </Select>
      );
    case "stringlist":
      return (
        <StringListEditor
          values={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      );
    default:
      if (field.slugFrom)
        return (
          <Input
            value={String(value ?? "")}
            disabled
            readOnly
            title="Gerado automaticamente a partir do título"
            className="cursor-not-allowed bg-gray-100 text-gray-500"
          />
        );
      return <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
}
