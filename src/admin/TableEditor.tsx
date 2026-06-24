import { useEffect, useState } from "react";
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
}

type Row = Record<string, unknown> & { id: number };

export default function TableEditor({
  table,
  title,
  fields,
  defaults,
}: {
  table: TableName;
  title: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await listItems<Row>(table);
    // parse campos JSON (ex.: amenities)
    setRows(
      data.map((r) => {
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
      }),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const updateRow = (id: number, key: string, value: unknown) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const save = async (row: Row) => {
    setSavingId(row.id);
    const payload: Record<string, unknown> = {};
    for (const f of fields) payload[f.key] = row[f.key];
    await updateItem(table, row.id, payload);
    setSavingId(null);
  };

  const add = async () => {
    setSavingId("new");
    await createItem(table, defaults);
    await load();
    setSavingId(null);
  };

  const remove = async (id: number) => {
    if (!confirm("Remover este item?")) return;
    await deleteItem(table, id);
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

  if (loading) return <p className="text-sm text-gray-500">Carregando…</p>;

  return (
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
                <Button variant="danger" onClick={() => remove(row.id)}>
                  Remover
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.type === "textarea" || f.type === "stringlist" ? "md:col-span-2" : ""}>
                  <Field label={f.label}>
                    <FieldInput
                      field={f}
                      value={row[f.key]}
                      onChange={(v) => updateRow(row.id, f.key, v)}
                    />
                  </Field>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Button onClick={() => save(row)} disabled={savingId === row.id}>
                {savingId === row.id ? "Salvando…" : "Salvar item"}
              </Button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-gray-500">Nenhum item ainda.</p>}
      </div>
    </div>
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
      return <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
}
