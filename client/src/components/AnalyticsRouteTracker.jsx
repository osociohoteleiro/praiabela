import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Dispara PageView (Meta Pixel) e page_view (Google Analytics) a cada
// mudança de rota — exceto /admin/*. O primeiro disparo já é feito pelos
// scripts inline em index.html, então pulamos a primeira renderização.
const AnalyticsRouteTracker = () => {
  const location = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (location.pathname.startsWith('/admin')) return

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
  }, [location.pathname, location.search])

  return null
}

export default AnalyticsRouteTracker
