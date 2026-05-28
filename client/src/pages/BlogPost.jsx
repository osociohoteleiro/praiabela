import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarIcon, ArrowLeftIcon, ArrowRightIcon, TagIcon, NewspaperIcon } from '@heroicons/react/24/outline'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppFloat from '../components/WhatsAppFloat'
import { postsAPI } from '../services/api'

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const renderContent = (content) => {
  if (!content) return null
  return content
    .split(/\n\s*\n/)
    .map((paragraph, idx) => (
      <p key={idx} className="mb-5 text-gray-700 leading-relaxed text-lg whitespace-pre-line">
        {paragraph.trim()}
      </p>
    ))
}

const BlogPost = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setPost(null)

    postsAPI
      .getBySlug(slug)
      .then((res) => {
        if (cancelled) return
        setPost(res.data)
        return postsAPI.getAll({ limit: 4 })
      })
      .then((res) => {
        if (cancelled || !res) return
        setRelated(res.data.filter((p) => p.slug !== slug).slice(0, 3))
      })
      .catch((err) => {
        if (cancelled) return
        if (err?.response?.status === 404) setNotFound(true)
        else console.error('Error loading post:', err)
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          window.scrollTo({ top: 0, behavior: 'auto' })
        }
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="spinner"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-32 px-4 text-center">
          <NewspaperIcon className="w-20 h-20 text-gray-300 mb-4" />
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            Postagem não encontrada
          </h1>
          <p className="text-gray-600 mb-6">A postagem que você procura não existe ou foi removida.</p>
          <Link to="/blog" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" /> Voltar para o blog
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 text-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Todas as postagens
          </Link>
          {post.category && (
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <TagIcon className="w-3 h-3" /> {post.category}
            </span>
          )}
          <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(post.published_at)}</span>
          </div>
        </div>
      </section>

      {/* Cover image */}
      <div className="container mx-auto px-4 -mt-8 max-w-4xl">
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-64 md:h-[28rem] object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <article className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {post.excerpt && (
            <p className="text-xl text-gray-700 leading-relaxed mb-8 italic border-l-4 border-primary-500 pl-5">
              {post.excerpt}
            </p>
          )}
          <div>{renderContent(post.content)}</div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 bg-gray-50 border-t">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-8 text-center">
              Continue lendo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="h-44 overflow-hidden">
                    <img
                      src={p.cover_image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-gray-500 mb-2">{formatDate(p.published_at)}</div>
                    <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/blog" className="btn-primary inline-flex items-center gap-2">
                Ver todas as postagens <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
      <WhatsAppFloat />
    </div>
  )
}

export default BlogPost
