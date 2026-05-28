import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarIcon, ArrowRightIcon, ArrowLeftIcon, NewspaperIcon } from '@heroicons/react/24/outline'
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

const getExcerpt = (post) => {
  if (post.excerpt) return post.excerpt
  return (post.content || '').slice(0, 180) + ((post.content || '').length > 180 ? '…' : '')
}

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    postsAPI
      .getAll()
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

  const categories = useMemo(() => {
    const set = new Set()
    posts.forEach((p) => p.category && set.add(p.category))
    return Array.from(set).sort()
  }, [posts])

  const filtered = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts

  const featured = !activeCategory && filtered.length > 0 ? filtered[0] : null
  const rest = featured ? filtered.slice(1) : filtered

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Page header */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Voltar para o site
          </Link>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            Blog Praia Bela
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Dicas de Ilhéus, novidades da pousada e histórias para inspirar sua viagem.
          </p>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white border-b sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                !activeCategory
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="spinner mx-auto"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <NewspaperIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma postagem disponível por enquanto.</p>
            </div>
          ) : (
            <>
              {featured && (
                <Link
                  to={`/blog/${featured.slug}`}
                  className="group grid md:grid-cols-2 gap-8 mb-16 bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
                >
                  <div className="relative h-64 md:h-full overflow-hidden">
                    <img
                      src={featured.cover_image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {featured.category && (
                      <span className="absolute top-4 left-4 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                        {featured.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-8 md:p-10">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(featured.published_at)}</span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6">{getExcerpt(featured)}</p>
                    <span className="inline-flex items-center gap-2 text-primary-600 font-semibold">
                      Ler postagem completa
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              )}

              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative h-52 overflow-hidden">
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
            </>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  )
}

export default Blog
