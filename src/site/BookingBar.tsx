import { useEffect, useRef, useState } from "react";

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function formatBR(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const MAX_ADULTS = 10;
const MAX_CHILDREN = 6;
const MAX_CHILD_AGE = 17;
const DEFAULT_CHILD_AGE = 6;

// Motor de reservas externo (ID da propriedade já embutido na URL base).
const BOOKING_BASE_URL =
  "https://site-reservas.osociohoteleiro.com.br/reservar/e04c202d-20af-47cb-9443-3b44af55d9c0";

function buildBookingUrl(opts: {
  checkin: string;
  checkout: string;
  adults: number;
  childAges: number[];
  rooms?: number;
}) {
  const params = new URLSearchParams({
    check_in: opts.checkin,
    check_out: opts.checkout,
    rooms: String(opts.rooms ?? 1),
    adults: String(opts.adults),
    children: String(opts.childAges.length),
  });
  if (opts.childAges.length > 0) {
    // children_ages=4,8 (a URLSearchParams codifica a vírgula como %2C)
    params.set("children_ages", opts.childAges.join(","));
  }
  return `${BOOKING_BASE_URL}?${params.toString()}`;
}

export default function BookingBar() {
  const today = todayISO(0);
  const [checkin, setCheckin] = useState(today);
  const [checkout, setCheckout] = useState(todayISO(1));
  const [adults, setAdults] = useState(1);
  const [childAges, setChildAges] = useState<number[]>([]);

  function nextDay(iso: string) {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  function handleCheckin(value: string) {
    const next = value < today ? today : value;
    setCheckin(next);
    // mantém o check-out sempre depois do check-in
    if (checkout <= next) setCheckout(nextDay(next));
  }

  function handleCheckout(value: string) {
    const min = nextDay(checkin);
    setCheckout(value < min ? min : value);
  }

  return (
    <div className="w-full max-w-5xl rounded-md bg-white shadow-xl ring-1 ring-black/5">
      <div className="grid grid-cols-2 items-center gap-px md:grid-cols-[auto_1fr_1fr_1fr_auto]">
        <div className="hidden px-6 py-4 text-center text-ink md:block md:text-left">
          <p className="font-display text-sm leading-tight text-ink">
            o melhor
            <br /> preço
            <br /> garantido
          </p>
        </div>

        <Field label="check-in">
          <DateInput value={checkin} onChange={handleCheckin} min={today} />
        </Field>
        <Field label="check-out">
          <DateInput value={checkout} onChange={handleCheckout} min={nextDay(checkin)} />
        </Field>

        <GuestsField
          adults={adults}
          childAges={childAges}
          onAdultsChange={setAdults}
          onChildAgesChange={setChildAges}
        />

        <div className="col-span-2 p-2.5 md:col-span-1 md:p-3">
          <a
            href={buildBookingUrl({ checkin, checkout, adults, childAges })}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded border border-brand px-8 py-3 text-center font-medium tracking-widest text-brand transition hover:bg-brand hover:text-white md:py-4"
          >
            RESERVAR
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-l border-gray-200 px-4 py-2.5 first:border-l-0 md:px-6 md:py-3">
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      {children}
    </div>
  );
}

function plural(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function guestsSummary(adults: number, children: number) {
  const parts = [plural(adults, "Adulto", "Adultos")];
  if (children > 0) parts.push(plural(children, "Criança", "Crianças"));
  return parts.join(", ");
}

function GuestsField({
  adults,
  childAges,
  onAdultsChange,
  onChildAgesChange,
}: {
  adults: number;
  childAges: number[];
  onAdultsChange: (n: number) => void;
  onChildAgesChange: (ages: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // fecha ao clicar fora ou pressionar Esc
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const children = childAges.length;

  function setChildrenCount(next: number) {
    const count = Math.max(0, Math.min(MAX_CHILDREN, next));
    if (count > children) {
      onChildAgesChange([
        ...childAges,
        ...Array(count - children).fill(DEFAULT_CHILD_AGE),
      ]);
    } else if (count < children) {
      onChildAgesChange(childAges.slice(0, count));
    }
  }

  function setChildAge(index: number, age: number) {
    const next = childAges.slice();
    next[index] = age;
    onChildAgesChange(next);
  }

  return (
    <div
      className="relative col-span-2 border-t border-gray-200 px-4 py-2.5 md:col-span-1 md:border-l md:border-t-0 md:px-6 md:py-3"
      ref={containerRef}
    >
      <p className="mb-1 text-xs text-gray-500">hóspedes</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-lg text-ink md:text-xl">
          {guestsSummary(adults, children)}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-md border border-gray-200 bg-white p-4 shadow-xl md:left-auto md:right-0 md:w-80">
          <Stepper
            label="Adultos"
            hint="13 anos ou mais"
            value={adults}
            min={1}
            max={MAX_ADULTS}
            onChange={onAdultsChange}
          />

          <div className="my-3 border-t border-gray-100" />

          <Stepper
            label="Crianças"
            hint="0 a 12 anos"
            value={children}
            min={0}
            max={MAX_CHILDREN}
            onChange={setChildrenCount}
          />

          {children > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-gray-500">Idade das crianças (no check-out)</p>
              {childAges.map((age, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ink">Criança {i + 1}</span>
                  <select
                    value={age}
                    onChange={(e) => setChildAge(i, Number(e.target.value))}
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-ink outline-none focus:border-brand"
                  >
                    {Array.from({ length: MAX_CHILD_AGE + 1 }, (_, n) => (
                      <option key={n} value={n}>
                        {n === 0 ? "< 1 ano" : plural(n, "ano", "anos")}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full rounded border border-brand py-2 text-sm font-medium tracking-wide text-brand transition hover:bg-brand hover:text-white"
          >
            APLICAR
          </button>
        </div>
      )}
    </div>
  );
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-display text-base text-ink">{label}</p>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <StepButton
          ariaLabel={`Remover ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          −
        </StepButton>
        <span className="w-6 text-center font-display text-lg text-ink">{value}</span>
        <StepButton
          ariaLabel={`Adicionar ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          +
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-lg leading-none text-ink transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-gray-300 disabled:hover:text-ink"
    >
      {children}
    </button>
  );
}

function DateInput({
  value,
  onChange,
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const el = inputRef.current;
    if (!el) return;
    // showPicker() abre o calendário nativo em qualquer clique no campo
    // (em navegadores que não suportam, o foco abre o picker como fallback).
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        /* showPicker pode lançar fora de gesto do usuário — cai no focus abaixo */
      }
    }
    el.focus();
  }

  return (
    <button
      type="button"
      onClick={openPicker}
      className="relative block w-full cursor-pointer text-left"
    >
      <span className="font-display text-lg text-ink md:text-xl">{formatBR(value)}</span>
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="pointer-events-none absolute inset-0 opacity-0"
        tabIndex={-1}
      />
    </button>
  );
}
