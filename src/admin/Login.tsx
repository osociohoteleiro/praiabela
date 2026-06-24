import { useState } from "react";
import { login } from "../lib/api";
import { Button, Input } from "./ui";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-dark to-brand px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
        <h1 className="font-display text-2xl tracking-wide text-ink">Painel Loft</h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">Entre com a senha de administrador.</p>

        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          autoFocus
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-5 w-full">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
