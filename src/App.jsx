import { LangProvider } from './i18n/LangContext.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Work from './components/Work.jsx'
import Services from './components/Services.jsx'
import ContactCTA from './components/ContactCTA.jsx'
import Footer from './components/Footer.jsx'
import ThankYou from './components/ThankYou.jsx'
import TabBar from './components/TabBar.jsx'

/**
 * Struktur halaman sesuai design.md:
 * main.reveal-main (latar solid, sudut bawah membulat) menutupi
 * panel "Thank you" fixed — bagian bawah tersingkap saat scroll akhir.
 */
export default function App() {
  return (
    <LangProvider>
      <main className="reveal-main">
        <Navbar />
        <Hero />
        <About />
        <Work />
        <Services />
        <ContactCTA />
        <Footer />
      </main>
      <TabBar />
      <ThankYou />
    </LangProvider>
  )
}
