'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import CookieBanner from './CookieBanner'

export default function PublicLayout({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  return (
    <>
      {!isAdmin && <Navbar />}
      <main id="main-content">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <CookieBanner />}
    </>
  )
}
