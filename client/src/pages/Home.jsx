import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import BookingForm from '../components/BookingForm'
import About from '../components/About'
import Experiences from '../components/Experiences'
import Rooms from '../components/Rooms'
import Packages from '../components/Packages'
import Gallery from '../components/Gallery'
import BlogSection from '../components/BlogSection'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import TourVirtualFloat from '../components/TourVirtualFloat'
import WhatsAppFloat from '../components/WhatsAppFloat'

const Home = () => {
  const location = useLocation()

  useEffect(() => {
    const target = location.state?.scrollTo
    if (!target) return
    const tryScroll = () => {
      const el = document.querySelector(target)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
    const t = window.setTimeout(tryScroll, 100)
    window.history.replaceState({}, document.title)
    return () => window.clearTimeout(t)
  }, [location.state])

  return (
    <div id="home">
      <Navbar />
      <Hero />
      <div className="relative z-10">
        <BookingForm />
      </div>
      <About />
      <Experiences />
      <Packages />
      <Rooms />
      <Gallery />
      <BlogSection />
      <Contact />
      <Footer />
      <TourVirtualFloat />
      <WhatsAppFloat />
    </div>
  )
}

export default Home
