import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getContent } from "../lib/api";
import type { SiteContent } from "../lib/types";
import Header from "./Header";
import Footer from "./Footer";
import PostCard from "./PostCard";
import ThemeStyle from "./ThemeStyle";

export default function BlogPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getContent()
      .then(setContent)
      .catch((e) => setError(e.message));
    window.scrollTo(0, 0);
  }, []);

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

  return (
    <div>
      <ThemeStyle theme={settings.theme} />
      <Header general={settings.general} contact={settings.contact} />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-32">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-2">{settings.blogSection?.eyebrow}</p>
          <h1 className="section-title text-4xl">{settings.blogSection?.title ?? "Blog"}</h1>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma postagem publicada ainda.</p>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/" className="text-sm font-medium text-brand hover:underline">
            ← Voltar para o site
          </Link>
        </div>
      </main>

      <Footer general={settings.general} contact={settings.contact} />
    </div>
  );
}
