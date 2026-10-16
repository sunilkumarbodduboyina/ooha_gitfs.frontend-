import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFab from '../components/WhatsAppFab';

export default function UserLayout() {
  const location = useLocation();

  /* Smooth scroll manager:
     - "/#section"  → gently scroll to that homepage section. Polls until the
       target exists and its position stops shifting (sections stream in after
       navigation), then scrolls and keeps correcting while late content still
       pushes the section around. Every run is self-sufficient so a StrictMode
       re-run can never leave the job half-done. The sticky header (row + nav)
       is measured live so sections always land just beneath it.
     - any other navigation → scroll back to the top of the page. */
  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return undefined;
    }
    const headerOffset = () => (document.querySelector('.header')?.offsetHeight || 74) + 12;
    let tries = 0;
    let lastTop = -1;
    let stable = 0;
    let scrolledAt = 0;
    const timers = [];
    const tick = () => {
      const el = document.getElementById(hash);
      if (el) {
        const top = el.offsetTop;
        if (top === lastTop) stable += 1;
        else stable = 0;
        lastTop = top;
        const now = Date.now();
        const off = headerOffset();
        if (!scrolledAt && stable >= 2) {
          scrolledAt = now;
          el.style.scrollMarginTop = `${off}px`;
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (scrolledAt && now - scrolledAt > 1300) {
          const cur = document.getElementById(hash);
          if (cur && Math.abs(cur.getBoundingClientRect().top - off) > 60) {
            cur.style.scrollMarginTop = `${off}px`;
            cur.scrollIntoView({ behavior: 'auto', block: 'start' });
            scrolledAt = now; // layout still shifting — watch it again
          }
        }
      }
      if (++tries < 45) timers.push(setTimeout(tick, 200));
    };
    timers.push(setTimeout(tick, 200));
    return () => timers.forEach(clearTimeout);
  }, [location.pathname, location.hash]);

  return (
    <>
      <Header />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer />
      <WhatsAppFab />
    </>
  );
}
