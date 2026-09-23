import Hero from './components/Hero';
import AulivellaSection from './components/home/AulivellaSection';
import PescatoSection from './components/home/PescatoSection';
import LocaleSection from './components/home/LocaleSection';
import PrenotaSection from './components/home/PrenotaSection';
import DoveSection from './components/home/DoveSection';

export default function Home() {
  return (
    <>
      <Hero />
      <PescatoSection />
      <LocaleSection />
      <PrenotaSection />
      <DoveSection />
      <AulivellaSection />
    </>
  );
}
