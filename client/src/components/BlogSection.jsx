import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { postsAPI } from '../services/api'

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getExcerpt = (post) => {
  if (post.excerpt) return post.excerpt
  return (post.content || '').slice(0, 140) + ((post.content || '').length > 140 ? '…' : '')
}

const BlogSection = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    postsAPI
      .getAll({ limit: 3 })
      .then((res) => {
        if (!cancelled) setPosts(res.data)
      })
      .catch((err) => console.error('Error loading posts:', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!loading && posts.length === 0) return null

  return (
    <section id="blog" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Do nosso <span className="text-gradient-warm">blog</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dicas, novidades e histórias para inspirar a sua próxima visita a Ilhéus.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {post.category && (
                    <span className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                    {getExcerpt(post)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-primary-600 font-semibold text-sm mt-auto">
                    Ler postagem
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/blog"
            className="btn-primary inline-flex items-center gap-2"
          >
            Ver todas as postagens
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BlogSection
