'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/lib/types';
import { FALLBACK_PROJECTS } from '@/lib/fallbackProjects';
import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import ArrowButton from '@/components/ArrowButton';
import Footer from '@/components/Footer';

const FALLBACK_FEATURED = FALLBACK_PROJECTS;

const STATS = [
  { value: '20+', label: 'Años de trayectoria' },
  { value: '22+', label: 'Proyectos desarrollados' },
  { value: '456+', label: 'Unidades entregadas' },
];

export default function Home() {
  const [featured, setFeatured] = useState(FALLBACK_FEATURED);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'projects'), where('featured', '==', true)));
        if (!snap.empty) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Project[];
          data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
          setFeatured(data);
        }
      } catch {
        // keep fallback
      }
    };
    fetchFeatured();
  }, []);

  const [main, ...rest] = featured;
  const grid = rest.slice(0, 4);

  return (
    <main style={{ background: '#fff' }}>
      {/* Hero */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 560, width: '100%' }}>
        <Image src="/images/home/hero.png" alt="Grupo Hughes & Rienzi" fill priority style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.25) 100%)' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <FadeIn>
            <h1 className="hr-hero-title" style={{ fontFamily: 'var(--font)', fontWeight: 600, fontSize: 70, lineHeight: '64px', color: '#fff', textAlign: 'center', maxWidth: 900 }}>
              Imaginando nuevas formas de vivir.
            </h1>
          </FadeIn>
        </div>
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.6)', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↓</div>
      </section>

      {/* Intro */}
      <section className="hr-section" style={{ padding: '120px 64px', maxWidth: 1300, margin: '0 auto' }}>
        <div className="hr-intro-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <FadeIn direction="right">
            <h2 className="hr-intro-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 50, lineHeight: '57px', marginBottom: 24 }}>
              Desarrollamos proyectos que combinan arquitectura, ubicación y calidad de vida.
            </h2>
            <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 24, lineHeight: '28px', color: 'var(--text-muted)', marginBottom: 32 }}>
              Más de 20 años desarrollando proyectos que interpretan nuevas formas de vivir y generan valor en ubicaciones estratégicas.
            </p>
            <ArrowButton href="/nosotros" variant="dark" split>Nosotros</ArrowButton>
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            <div style={{ position: 'relative', width: '100%', height: 420, borderRadius: 24, overflow: 'hidden' }}>
              <Image src="/images/home/casa.png" alt="Grupo Hughes & Rienzi" fill style={{ objectFit: 'cover' }} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Proyectos Destacados */}
      <section className="hr-section" style={{ padding: '0 33px 120px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ maxWidth: 1364, margin: '0 auto', borderTop: '1px solid rgba(20,20,20,0.15)', marginBottom: 64 }} />
        <FadeIn>
          <h2 className="hr-featured-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 65, lineHeight: '67px', textAlign: 'center', marginBottom: 48 }}>
            Proyectos Destacados
          </h2>
        </FadeIn>

        {main && (
          <FadeIn>
            <Link href={`/proyectos/${main.id}`} style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '1379 / 784', borderRadius: 33, overflow: 'hidden', marginBottom: 24 }}>
              <Image src={main.coverImage} alt={main.title} fill style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)' }} />
              <div style={{ position: 'absolute', top: 32, left: 32, display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
                {main.logoImage ? (
                  <Image src={main.logoImage} alt={main.title} width={490} height={212} style={{ width: 'auto', height: 72, objectFit: 'contain' }} />
                ) : (
                  <>
                    <p style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 22, letterSpacing: '0.04em' }}>{main.title}</p>
                    <p style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 13, letterSpacing: '0.04em' }}>{main.subtitle}</p>
                  </>
                )}
              </div>
              {main.location && (
                <div style={{ position: 'absolute', top: 32, right: 32, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', color: '#fff', borderRadius: 999, padding: '8px 16px', fontFamily: 'var(--font)', fontSize: 13 }}>
                  <span style={{ width: 12, height: 15, position: 'relative', flexShrink: 0 }}>
                    <Image src="/images/proyectos/pin.png" alt="" fill style={{ objectFit: 'contain', filter: 'invert(1)' }} />
                  </span>
                  {main.location}
                </div>
              )}
              <div className="hr-main-card-footer" style={{ position: 'absolute', bottom: 32, left: 32, right: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
                <p className="hr-main-card-copy" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 26, color: '#fff', maxWidth: 480, lineHeight: '32px' }}>
                  El arte de vivir en armonía con la naturaleza.
                </p>
                <span style={{ pointerEvents: 'none', flexShrink: 0 }}><ArrowButton variant="white" split>Ver Proyecto</ArrowButton></span>
              </div>
            </Link>
          </FadeIn>
        )}

        {grid.length > 0 && (
          <div className="hr-featured-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
            {grid.map(p => (
              <FadeIn key={p.id}>
                <Link href={`/proyectos/${p.id}`} style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '677.0864868164062 / 380.8612365722656', borderRadius: 25, overflow: 'hidden' }}>
                  <Image src={p.coverImage} alt={p.title} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 100%)' }} />
                  <div style={{ position: 'absolute', top: 20, left: 20, color: '#fff' }}>
                    {p.logoImage ? (
                      <Image src={p.logoImage} alt={p.title} width={135} height={37} style={{ width: 'auto', height: 20, objectFit: 'contain' }} />
                    ) : (
                      <p style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 18, letterSpacing: '0.04em' }}>{p.title.toUpperCase()}</p>
                    )}
                  </div>
                  {p.location && (
                    <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', color: '#fff', borderRadius: 999, padding: '6px 14px', fontFamily: 'var(--font)', fontSize: 12 }}>
                      <span style={{ width: 10, height: 13, position: 'relative', flexShrink: 0 }}>
                        <Image src="/images/proyectos/pin.png" alt="" fill style={{ objectFit: 'contain', filter: 'invert(1)' }} />
                      </span>
                      {p.location}
                    </div>
                  )}
                  <p style={{ position: 'absolute', bottom: 20, left: 20, color: '#fff', fontFamily: 'var(--font)', fontWeight: 500, fontSize: 16 }}>
                    {p.title} {p.subtitle}
                  </p>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <ArrowButton href="/proyectos" variant="dark" split>Ver Proyectos</ArrowButton>
        </div>
      </section>

      {/* Trayectoria banner */}
      <section className="hr-lake-banner" style={{ position: 'relative', width: '100%', aspectRatio: '1440 / 598' }}>
        <Image src="/images/home/lake-banner.png" alt="Grupo Hughes & Rienzi" fill style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px' }}>
          <FadeIn>
            <h2 className="hr-banner-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 65, lineHeight: '67px', color: '#fff', maxWidth: 900, marginBottom: 32 }}>
              Más de 20 años creando proyectos para vivir mejor.
            </h2>
            <p style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 16, color: 'rgba(255,255,255,0.85)' }}>
              Una trayectoria construida en diseño, calidad y visión de futuro.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Stats */}
      <section className="hr-section" style={{ padding: '120px 64px', maxWidth: 1300, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <h2 className="hr-stats-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 60, lineHeight: '60px', maxWidth: 900, margin: '0 auto 20px' }}>
            Una forma de desarrollar donde el diseño, la calidad y el detalle marcan la diferencia.
          </h2>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 24, lineHeight: '28px', color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto 56px' }}>
            Más de 20 años creando proyectos con identidad propia, aportando valor al entorno y generando nuevas oportunidades para vivir e invertir.
          </p>
        </FadeIn>
        <div className="hr-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {STATS.map(s => (
            <FadeIn key={s.label}>
              <div style={{ background: 'var(--gray)', borderRadius: 20, padding: '40px 24px' }}>
                <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 40, marginBottom: 8 }}>{s.value}</p>
                <p style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 14, color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* La Candelaria */}
      <section className="hr-candelaria-section" style={{ position: 'relative', width: '100%', aspectRatio: '1440 / 848' }}>
        <Image src="/images/home/barriocandelaria.png" alt="La Candelaria · Pueblo Jardín" fill style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)' }} />
        <div className="hr-candelaria-inner" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <FadeIn style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Image src="/images/home/logocandelaria.png" alt="La Candelaria · Pueblo Jardín" width={280} height={53} style={{ marginBottom: 20 }} />
            <h2 className="hr-candelaria-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 50, lineHeight: '57px', color: '#fff', maxWidth: 700, marginBottom: 28 }}>
              Un barrio con aire de campo.
            </h2>
            <ArrowButton href="/proyectos/la-candelaria" variant="white" split>Ver Proyecto</ArrowButton>
          </FadeIn>
        </div>
      </section>

      {/* Alianza Itaú */}
      <section className="hr-section hr-alliance" style={{ padding: '120px 64px', maxWidth: 1300, margin: '0 auto' }}>
        <div className="hr-alliance-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <FadeIn direction="right">
            <h2 className="hr-alliance-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 65, lineHeight: '65px', marginBottom: 24 }}>Nuevas oportunidades</h2>
            <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 24, lineHeight: '28px', color: 'var(--text-muted)', marginBottom: 32 }}>
              Una alianza con beneficios exclusivos y condiciones preferenciales para proyectos seleccionados.
            </p>
            <ArrowButton href="/proyectos" variant="dark" split>Conocer Proyectos</ArrowButton>
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <Image src="/images/home/Logo_GRUPO_BLANCOseccionitau.png" alt="Grupo Hughes & Rienzi" width={140} height={140} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: 28, color: 'var(--text-muted)' }}>+</span>
              <Image src="/images/home/itau.png" alt="Itaú Personal Bank" width={140} height={100} style={{ objectFit: 'contain' }} />
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .hr-hero-title { font-size: 38px !important; line-height: 44px !important; }
          .hr-section { padding: 64px 20px !important; }
          .hr-intro-grid, .hr-alliance-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hr-intro-title { font-size: 30px !important; line-height: 36px !important; }
          .hr-featured-title, .hr-banner-title, .hr-stats-title, .hr-alliance-title { font-size: 32px !important; line-height: 38px !important; }
          .hr-featured-grid, .hr-stats-grid { grid-template-columns: 1fr !important; }
          .hr-main-card-footer { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; bottom: 24px !important; left: 24px !important; right: 24px !important; }
          .hr-main-card-copy { font-size: 20px !important; line-height: 26px !important; max-width: 100% !important; }
          .hr-candelaria-inner { padding: 0 20px !important; }
          .hr-candelaria-title { font-size: 30px !important; line-height: 36px !important; }
          .hr-lake-banner, .hr-candelaria-section { aspect-ratio: auto !important; min-height: 420px !important; }
        }
      `}</style>
    </main>
  );
}
