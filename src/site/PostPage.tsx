import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { getContent } from "../lib/api";
import type { SiteContent } from "../lib/types";
import Header from "./Header";
import Footer from "./Footer";
import { formatPostDate } from "./PostCard";
import ThemeStyle from "./ThemeStyle";
import PostCTA from "./PostCTA";

// Renderiza um subconjunto de Markdown (sem dependências): títulos #/##/###,
// listas * e -, negrito **...** e linha horizontal ---.
function renderInline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(p);
    return m ? <strong key={i}>{m[1]}</strong> : <span key={i}>{p}</span>;
  });
}

const isHeading = (l: string) => /^#{1,3}\s+/.test(l);
const isList = (l: string) => /^[*-]\s+/.test(l);
const isHr = (l: string) => /^---+$/.test(l);

function renderMarkdown(content: string): ReactNode[] {
  const lines = content.replace(/\r/g, "").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    if (isHr(line)) { out.push(<hr key={key++} className="my-8 border-gray-200" />); i++; continue; }
    if (isHeading(line)) {
      const level = line.match(/^#{1,3}/)![0].length;
      const text = line.replace(/^#{1,3}\s+/, "");
      out.push(
        level >= 3 ? (
          <h3 key={key++} className="mt-6 mb-2 font-display text-lg tracking-wide text-ink">
            {renderInline(text)}
          </h3>
        ) : (
          <h2 key={key++} className="mt-8 mb-3 font-display text-2xl tracking-wide text-ink">
            {renderInline(text)}
          </h2>
        ),
      );
      i++;
      continue;
    }
    if (isList(line)) {
      const items: string[] = [];
      while (i < lines.length && isList(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[*-]\s+/, ""));
        i++;
      }
      out.push(
        <ul key={key++} className="my-4 list-disc space-y-1 pl-6">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l || isHeading(l) || isList(l) || isHr(l)) break;
      para.push(l);
      i++;
    }
    out.push(
      <p key={key++} className="my-4 leading-relaxed">
        {renderInline(para.join(" "))}
      </p>,
    );
  }
  return out;
}

export default function PostPage() {
  const { slug } = useParams();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getContent()
      .then(setContent)
      .catch((e) => setError(e.message));
    window.scrollTo(0, 0);
  }, [slug]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-light px-6 text-center">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }
  if (!content) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-light">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
      </div>
    );
  }

  const { settings, posts } = content;
  const post = posts.find((p) => p.slug === slug);

  return (
    <div>
      <ThemeStyle theme={settings.theme} />
      <Header general={settings.general} contact={settings.contact} />

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-32">
        {!post ? (
          <div className="py-20 text-center">
            <h1 className="section-title mb-3 text-2xl">Postagem não encontrada</h1>
            <Link to="/blog" className="text-sm font-medium text-brand hover:underline">
              ← Ver todas as postagens
            </Link>
          </div>
        ) : (
          <article>
            <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
              {post.category && (
                <span className="rounded-full bg-brand-light px-2 py-0.5 font-medium text-brand">
                  {post.category}
                </span>
              )}
              {post.published_at && <span>{formatPostDate(post.published_at)}</span>}
            </div>

            <h1 className="section-title mb-6 text-3xl md:text-4xl">{post.title}</h1>

            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="mb-8 h-72 w-full rounded-lg object-cover md:h-96"
              />
            )}

            <div className="text-base text-gray-700">{renderMarkdown(post.content)}</div>

            <PostCTA contact={settings.contact} />

            <div className="mt-8 border-t border-gray-100 pt-6">
              <Link to="/blog" className="text-sm font-medium text-brand hover:underline">
                ← Ver todas as postagens
              </Link>
            </div>
          </article>
        )}
      </main>

      <Footer general={settings.general} contact={settings.contact} />
    </div>
  );
}
