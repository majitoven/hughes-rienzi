'use client';
import { useEffect, useRef, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/lib/types';
import { FALLBACK_PROJECTS } from '@/lib/fallbackProjects';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import ArrowButton from '@/components/ArrowButton';
import Footer from '@/components/Footer';
import Skeleton from '@/components/Skeleton';
import { whatsappUrl } from '@/lib/contact';

const FALLBACK_FEATURED = FALLBACK_PROJECTS;

const STATS = [
  { value: '20+', label: 'Años de trayectoria.' },
  { value: '22+', label: 'Proyectos desarrollados.' },
  { value: '456+', label: 'Unidades Entregadas.' },
  { value: '76.000+', label: 'M2 Construidos' },
];

function CountUp({ value, style }: { value: string; style?: React.CSSProperties }) {
  const match = value.match(/^(\d[\d.]*)(.*)$/);
  const grouped = match ? match[1].includes('.') : false;
  const target = match ? parseInt(match[1].replace(/\./g, ''), 10) : 0;
  const digits = match && !grouped ? match[1].length : 0;
  const suffix = match ? match[2] : value;
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setDisplay(Math.round(progress * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, match]);

  const formatted = grouped ? display.toLocaleString('de-DE') : String(display).padStart(digits, '0');
  return <p ref={ref} style={style}>{match ? `${formatted}${suffix}` : suffix}</p>;
}

// Logos have very different aspect ratios; sizing them to a constant area
// makes them read as the same size instead of a fixed height (where wide logos dominate).
const LOGO_AREA = 3600;

function FeaturedLogo({ src, alt }: { src: string; alt: string }) {
  const [ratio, setRatio] = useState<number | null>(null);
  const height = ratio ? Math.sqrt(LOGO_AREA / ratio) : 28;
  return (
    <Image src={src} alt={alt} width={490} height={212}
      onLoad={e => { const img = e.currentTarget; if (img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight); }}
      className="hr-featured-logo"
      style={{ '--logo-h': `${height}px`, width: 'auto', height: 'var(--logo-h)', objectFit: 'contain', objectPosition: 'left', visibility: ratio ? 'visible' : 'hidden' } as React.CSSProperties} />
  );
}

function FeaturedSmallCard({ project }: { project: Project }) {
  return (
    <FadeIn>
      <Link href={`/proyectos/${project.id}`} className="hr-featured-card" style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '677.0864868164062 / 380.8612365722656', borderRadius: 25, overflow: 'hidden' }}>
        <Image src={project.coverImage} alt={project.title} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 100%)' }} />
        <div style={{ position: 'absolute', top: 20, left: 20, color: '#fff' }}>
          {project.logoImage ? (
            <FeaturedLogo src={project.logoImage} alt={project.title} />
          ) : (
            <p style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 18, letterSpacing: '0.04em' }}>{project.title.toUpperCase()}</p>
          )}
        </div>
        {project.location && (
          <div className="hr-card-location" style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', color: '#fff', borderRadius: 999, padding: '6px 14px', fontFamily: 'var(--font)', fontSize: 12 }}>
            <span style={{ width: 10, height: 13, position: 'relative', flexShrink: 0 }}>
              <Image src="/images/proyectos/pinwhite.png" alt="" fill sizes="10px" style={{ objectFit: 'contain' }} />
            </span>
            {project.location}
          </div>
        )}
        <span className="hr-card-arrow" style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontFamily: 'var(--font)', fontSize: 13, transition: 'transform 0.3s ease' }}>
          <span className="hr-card-more" style={{ display: 'none' }}>Ver más</span>
          <span style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
            <Image src="/images/home/arrowwhiterounded.png" alt="" fill sizes="36px" style={{ objectFit: 'contain' }} />
          </span>
        </span>
      </Link>
    </FadeIn>
  );
}

// Art direction: the wide lake shot reads as "only water" on portrait screens, so phones get a building photo (ONA).
function HeroImage() {
  const common = { alt: 'Grupo Hughes & Rienzi', sizes: '100vw', fill: true, priority: true };
  const { props: { srcSet: desktop } } = getImageProps({ ...common, src: '/images/home/heronuevo.png' });
  const { props: { srcSet: mobile, ...rest } } = getImageProps({ ...common, src: '/images/home/hero-mobile.jpg' });
  return (
    <picture>
      <source media="(min-width: 901px)" srcSet={desktop} />
      <source media="(max-width: 900px)" srcSet={mobile} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...rest} className="hr-hero-img" style={{ ...rest.style, objectFit: 'cover' }} />
    </picture>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState<Project[] | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'projects'), where('featured', '==', true)));
        if (!snap.empty) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Project[];
          data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
          setFeatured(data);
        } else {
          setFeatured(FALLBACK_FEATURED);
        }
      } catch {
        setFeatured(FALLBACK_FEATURED);
      }
    };
    fetchFeatured();
  }, []);

  const loading = featured === null;

  return (
    <main style={{ background: '#fff' }}>
      {/* Hero */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 560, width: '100%' }}>
        <HeroImage />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.25) 100%)' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <FadeIn>
            <h1 className="hr-hero-title" style={{ fontFamily: 'var(--font)', fontWeight: 600, fontSize: 70, lineHeight: '64px', color: '#fff', textAlign: 'center', maxWidth: 900 }}>
              <span className="hr-hero-line">Imaginando nuevas</span><br /><span className="hr-hero-line">formas de vivir.</span>
            </h1>
          </FadeIn>
        </div>
        <div className="hr-scroll-indicator" onClick={() => document.getElementById('hr-intro')?.scrollIntoView({ behavior: 'smooth' })} style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.6)', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.3s ease, background 0.3s ease' }}>↓</div>
      </section>

      {/* Intro */}
      <section id="hr-intro" className="hr-section" style={{ padding: '120px 64px', maxWidth: 1300, margin: '0 auto' }}>
        <div className="hr-intro-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 820px) 1fr', gap: 40, alignItems: 'center' }}>
          <FadeIn direction="right">
            <h2 className="hr-intro-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 50, lineHeight: '57px', marginBottom: 24 }}>
              CREAMOS PROYECTOS QUE <br />COMBINAN ARQUITECTURA, <br />UBICACIÓN Y CALIDAD DE VIDA.
            </h2>
            <p className="hr-intro-text" style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 24, lineHeight: '28px', color: 'var(--text-muted)', marginBottom: 56 }}>
              Más de 20 años desarrollando proyectos que <br />interpretan nuevas formas de vivir y generan valor <br />en ubicaciones estratégicas.
            </p>
            <ArrowButton href="/nosotros" variant="dark" split>Nosotros</ArrowButton>
          </FadeIn>
          <div className="hr-intro-spacer" />
        </div>
      </section>

      {/* Proyectos Destacados */}
      <section className="hr-section" style={{ padding: '0 33px 64px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ maxWidth: 1364, margin: '0 auto', borderTop: '1px solid rgba(20,20,20,0.9)', marginBottom: 64 }} />
        <FadeIn>
          <h2 className="hr-featured-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 40, lineHeight: '46px', textAlign: 'center', marginBottom: 48 }}>
            PROYECTOS DESTACADOS
          </h2>
        </FadeIn>

        <div className="hr-featured-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          {loading
            ? [0, 1, 2, 3].map(i => <Skeleton key={i} aspectRatio="677 / 381" borderRadius={25} />)
            : featured.map(p => <FeaturedSmallCard key={p.id} project={p} />)}
        </div>

        <div style={{ textAlign: 'center' }}>
          <ArrowButton href="/proyectos" variant="dark" split>Ver Todos</ArrowButton>
        </div>
      </section>

      {/* Stats */}
      <section className="hr-section hr-stats" style={{ padding: '24px 64px 120px 64px', maxWidth: 1300, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <h2 className="hr-stats-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 50, lineHeight: '54px', maxWidth: 900, margin: '0 auto 20px' }}>
            MÁS DE 20 AÑOS CREANDO PROYECTOS PARA VIVIR MEJOR
          </h2>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 18, lineHeight: '24px', color: 'var(--black)', maxWidth: 900, margin: '0 auto 56px' }}>
            En Grupo Hughes &amp; Rienzi buscamos generar emprendimientos con una personalidad única, que aporten características novedosas al mercado, contribuyan al desarrollo urbano, promuevan una mayor calidad de vida para sus residentes y ofrezcan oportunidades que resulten confiables a la hora de invertir.
          </p>
        </FadeIn>
        <div className="hr-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {STATS.map(s => (
            <FadeIn key={s.label}>
              <div className="hr-stat-card" style={{ background: '#F5F5F5', borderRadius: 20, padding: '32px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 340 }}>
                <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 18, lineHeight: '24px', color: 'var(--black)', marginBottom: 20 }}>{s.label}</p>
                <CountUp value={s.value} style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 68 }} />
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Alianza Itaú */}
      <section className="hr-section hr-alliance" style={{ padding: '60px 64px 120px 64px', maxWidth: 1300, margin: '0 auto' }}>
        <div className="hr-alliance-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 80, alignItems: 'center' }}>
          <FadeIn direction="right">
            <h2 className="hr-alliance-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 50, lineHeight: '57px', marginBottom: 24 }}>UNA ALIANZA QUE ABRE <br />NUEVAS POSIBILIDADES.</h2>
            <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 24, lineHeight: '28px', color: 'var(--black)', marginBottom: 32 }}>
              Junto a Itaú Personal Bank, ofrecemos beneficios exclusivos y condiciones preferenciales en proyectos seleccionados.
            </p>
            <ArrowButton href={whatsappUrl('Hola, quiero consultar por los beneficios de la alianza con Itaú Personal Bank.')} external variant="dark" split>Consultar</ArrowButton>
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            <div className="hr-alliance-logos" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <Image src="/images/home/Logo_GRUPO_BLANCOseccionitau.png" alt="Grupo Hughes & Rienzi" width={140} height={140} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: 28, color: 'var(--text-muted)' }}>+</span>
              <Image src="/images/home/itau.png" alt="Itaú Personal Bank" width={140} height={100} style={{ objectFit: 'contain' }} />
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />

      <style>{`
        .hr-scroll-indicator:hover { transform: translateX(-50%) scale(1.15); background: rgba(255,255,255,0.15); }
        .hr-featured-card:hover .hr-card-cta, .hr-featured-card:hover .hr-card-arrow { transform: scale(1.1); }
        @media (max-width: 900px) {
          .hr-hero-title { font-size: 34px !important; line-height: 40px !important; }
          .hr-hero-line { white-space: nowrap; }
          .hr-hero-img { object-position: 50% 50% !important; }
          .hr-section { padding: 64px 20px !important; }
          .hr-stats { padding-top: 0 !important; }
          .hr-alliance-grid, .hr-intro-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hr-intro-spacer { display: none !important; }
          /* Desktop line breaks leave single words on a line at phone width */
          .hr-intro-title br, .hr-intro-text br, .hr-alliance-title br { display: none; }
          .hr-intro-text { font-size: 19px !important; line-height: 25px !important; }
          .hr-intro-title { font-size: 30px !important; line-height: 36px !important; }
          .hr-featured-title, .hr-stats-title, .hr-alliance-title { font-size: 32px !important; line-height: 38px !important; }
          .hr-featured-grid { grid-template-columns: 1fr !important; }
          .hr-stats-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .hr-stat-card { height: auto !important; min-height: 150px; padding: 24px !important; }
          .hr-stat-card p:last-child { font-size: 52px !important; }
          .hr-featured-logo { height: calc(var(--logo-h) * 0.7) !important; }
          .hr-card-location { top: 16px !important; right: 12px !important; padding: 4px 8px !important; font-size: 11px !important; max-width: 45%; }
          .hr-card-arrow { bottom: 14px !important; right: 14px !important; }
          .hr-card-arrow > span:last-child { width: 28px !important; height: 28px !important; }
          .hr-card-more { display: inline !important; }
          .hr-alliance-logos { justify-content: center !important; width: 100%; }
          .hr-main-card-footer { bottom: 24px !important; right: 24px !important; }
        }
      `}</style>
    </main>
  );
}
