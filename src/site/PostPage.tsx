import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getContent } from "../lib/api";
import type { SiteContent } from "../lib/types";
import Header from "./Header";
import Footer from "./Footer";
import { formatPostDate } from "./PostCard";

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
    <div className="bg-white">
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

            <div className="space-y-4 text-base leading-relaxed text-gray-700">
              {post.content
                .split(/\n{2,}/)
                .map((para) => para.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>

            <div className="mt-12 border-t border-gray-100 pt-6">
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
