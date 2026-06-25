import { Link } from "react-router-dom";
import type { Post } from "../lib/types";

export function formatPostDate(date: string): string {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg bg-white/85 shadow-sm transition hover:shadow-lg">
      <Link to={`/blog/${post.slug}`} className="block h-48 overflow-hidden">
        <img
          src={post.cover_image}
          alt={post.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
          {post.category && (
            <span className="rounded-full bg-brand-light px-2 py-0.5 font-medium text-brand">
              {post.category}
            </span>
          )}
          {post.published_at && <span>{formatPostDate(post.published_at)}</span>}
        </div>
        <h3 className="font-display text-lg tracking-wide text-ink">
          <Link to={`/blog/${post.slug}`} className="transition hover:text-brand">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{post.excerpt}</p>
        )}
        <Link
          to={`/blog/${post.slug}`}
          className="mt-4 text-sm font-medium tracking-wide text-brand hover:underline"
        >
          Ler mais →
        </Link>
      </div>
    </article>
  );
}
