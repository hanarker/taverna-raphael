'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import CookieBanner from './CookieBanner'
import IntroFade from './IntroFade'

export default function PublicLayout({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  return (
    <>
      {!isAdmin && <IntroFade />}
      {!isAdmin && <Navbar />}
      <main id="main-content">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <CookieBanner />}
    </>
  )
}
