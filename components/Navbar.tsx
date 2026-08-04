'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ArrowButton from './ArrowButton';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  const links = [
    { href: '/', label: 'Home' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/proyectos', label: 'Proyectos' },
    { href: '/blog', label: 'Entre Charlas' },
  ];

  const hasHero = pathname === '/' || pathname === '/nosotros' || (pathname.startsWith('/proyectos/') && pathname !== '/proyectos');
  const dark = !hasHero; // permanently light bg + dark text/logo on hero-less pages
  const textColor = dark ? 'var(--black)' : '#fff';

  return (
    <>
      <nav className="hr-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 48px',
        background: dark ? '#fff' : (scrolled ? 'rgba(20,20,20,0.92)' : 'transparent'),
        borderBottom: dark ? '1px solid rgba(20,20,20,0.1)' : 'none',
        backdropFilter: !dark && scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.4s',
      }}>
        <Link href="/" style={{ display: 'flex' }}>
          <Image
            src={dark ? '/images/home/Logo_GRUPO_BLANCOseccionitau.png' : '/images/home/logoheader.png'}
            alt="Grupo Hughes & Rienzi" width={135} height={137} className="hr-nav-logo" priority />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div className="hr-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {links.map(l => (
              <Link key={l.href} href={l.href} className="hr-nav-link" style={{
                fontFamily: 'var(--font)', fontSize: 14, fontWeight: 400,
                color: textColor, opacity: pathname === l.href ? 0.6 : 0.95,
              }}>{l.label}</Link>
            ))}
          </div>

          <span className="hr-nav-cta">
            <ArrowButton href="/contacto" variant={dark ? 'dark' : 'white'} split compact>Contacto</ArrowButton>
          </span>

          <button onClick={() => setMenuOpen(!menuOpen)}
            className="hr-hamburger"
            style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}
            aria-label="Menu">
            <span style={{ display: 'block', width: 22, height: 1.5, background: textColor, transform: menuOpen ? 'rotate(45deg) translate(4px,4px)' : 'none', transition: 'all 0.3s' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: textColor, opacity: menuOpen ? 0 : 1, transition: 'all 0.3s' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: textColor, transform: menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none', transition: 'all 0.3s' }} />
          </button>
        </div>
      </nav>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 40, background: 'var(--black)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
        opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none', transition: 'opacity 0.4s',
      }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
            style={{ color: '#fff', fontSize: 22, fontWeight: 300, fontFamily: 'var(--font)' }}>
            {l.label}
          </Link>
        ))}
        <Link href="/contacto" onClick={() => setMenuOpen(false)} style={{ color: '#fff', fontSize: 22, fontWeight: 300, fontFamily: 'var(--font)' }}>
          Contacto
        </Link>
      </div>

      <style>{`
        .hr-nav-link { transition: text-shadow 0.25s ease, opacity 0.25s ease; }
        .hr-nav-link:hover {
          text-shadow: -0.4px 0 currentColor, 0.4px 0 currentColor, 0 -0.4px currentColor, 0 0.4px currentColor;
          opacity: 1 !important;
        }
        @media (max-width: 900px) {
          .hr-nav { padding: 12px 20px !important; }
          .hr-nav-links { display: none !important; }
          .hr-nav-cta { display: none !important; }
          .hr-hamburger { display: flex !important; }
          .hr-nav-logo { width: 64px !important; height: auto !important; }
        }
      `}</style>
    </>
  );
}
