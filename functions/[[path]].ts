// Pages Function catch-all: delega TODAS as requisições para a app Hono
// (worker/index.ts). As rotas /api/* e /files/* são tratadas pela app; o
// restante cai no fallback que serve os assets estáticos via env.ASSETS.
import { handle } from "hono/cloudflare-pages";
import app from "../worker/index";

export const onRequest = handle(app);
