import { Link } from "react-router-dom";
import type { Post, SectionTitle } from "../lib/types";
import PostCard from "./PostCard";

export default function BlogTeaser({
  posts,
  section,
}: {
  posts: Post[];
  section: SectionTitle;
}) {
  if (posts.length === 0) return null;

  const latest = posts.slice(0, 3);

  return (
    <section id="blog" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-2">{section?.eyebrow}</p>
          <h2 className="section-title text-3xl md:text-4xl">{section?.title}</h2>
        </div>

        <div className="grid gap-7 md:grid-cols-3">
          {latest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {posts.length > 3 && (
          <div className="mt-10 text-center">
            <Link
              to="/blog"
              className="btn-brand inline-block rounded px-8 py-3 text-sm font-medium tracking-widest"
            >
              VER TODAS AS POSTAGENS
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
