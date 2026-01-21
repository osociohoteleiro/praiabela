import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import BookingForm from '../components/BookingForm'
import About from '../components/About'
import Experiences from '../components/Experiences'
import Rooms from '../components/Rooms'
import Packages from '../components/Packages'
import Gallery from '../components/Gallery'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div id="home">
      <Navbar />
      <Hero />
      <div className="relative z-10">
        <BookingForm />
      </div>
      <About />
      <Experiences />
      <Rooms />
      <Packages />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  )
}

export default Home
