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
import Skeleton from '@/components/Skeleton';

const FALLBACK_FEATURED = FALLBACK_PROJECTS;

const STATS = [
  { value: '20+', label: 'Años de trayectoria.' },
  { value: '22+', label: 'Proyectos desarrollados.' },
  { value: '456+', label: 'Unidades Entregadas.' },
  { value: '00+', label: 'M2 Construidos' },
];

function FeaturedLargeCard({ project }: { project: Project }) {
  return (
    <FadeIn>
      <Link href={`/proyectos/${project.id}`} style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '1379 / 784', borderRadius: 33, overflow: 'hidden', marginBottom: 24 }}>
        <Image src={project.coverImage} alt={project.title} fill sizes="(max-width: 900px) 100vw, 1374px" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)' }} />
        <div style={{ position: 'absolute', top: 32, left: 32, display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
          {project.logoImage ? (
            <Image src={project.logoImage} alt={project.title} width={490} height={212} style={{ width: 'auto', height: 72, objectFit: 'contain' }} />
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 22, letterSpacing: '0.04em' }}>{project.title}</p>
              <p style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 13, letterSpacing: '0.04em' }}>{project.subtitle}</p>
            </>
          )}
        </div>
        {project.location && (
          <div style={{ position: 'absolute', top: 32, right: 32, display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', color: '#fff', borderRadius: 999, padding: '8px 16px', fontFamily: 'var(--font)', fontSize: 13 }}>
            <span style={{ width: 12, height: 15, position: 'relative', flexShrink: 0 }}>
              <Image src="/images/proyectos/pinwhite.png" alt="" fill sizes="12px" style={{ objectFit: 'contain' }} />
            </span>
            {project.location}
          </div>
        )}
        <div className="hr-main-card-footer" style={{ position: 'absolute', bottom: 32, right: 32 }}>
          <span style={{ pointerEvents: 'none' }}><ArrowButton variant="white" split>Ver Proyecto</ArrowButton></span>
        </div>
      </Link>
    </FadeIn>
  );
}

function FeaturedSmallCard({ project }: { project: Project }) {
  return (
    <FadeIn>
      <Link href={`/proyectos/${project.id}`} style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '677.0864868164062 / 380.8612365722656', borderRadius: 25, overflow: 'hidden' }}>
        <Image src={project.coverImage} alt={project.title} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 100%)' }} />
        <div style={{ position: 'absolute', top: 20, left: 20, color: '#fff' }}>
          {project.logoImage ? (
            <Image src={project.logoImage} alt={project.title} width={135} height={37} style={{ width: 'auto', height: 20, objectFit: 'contain' }} />
          ) : (
            <p style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 18, letterSpacing: '0.04em' }}>{project.title.toUpperCase()}</p>
          )}
        </div>
        {project.location && (
          <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', color: '#fff', borderRadius: 999, padding: '6px 14px', fontFamily: 'var(--font)', fontSize: 12 }}>
            <span style={{ width: 10, height: 13, position: 'relative', flexShrink: 0 }}>
              <Image src="/images/proyectos/pinwhite.png" alt="" fill sizes="10px" style={{ objectFit: 'contain' }} />
            </span>
            {project.location}
          </div>
        )}
        <p style={{ position: 'absolute', bottom: 20, left: 20, color: '#fff', fontFamily: 'var(--font)', fontWeight: 500, fontSize: 16 }}>
          {project.title} {project.subtitle}
        </p>
      </Link>
    </FadeIn>
  );
}

type FeaturedSegment = { type: 'large'; project: Project } | { type: 'small'; projects: Project[] };

function groupFeatured(projects: Project[]): FeaturedSegment[] {
  const segments: FeaturedSegment[] = [];
  for (const p of projects) {
    const size = p.featuredSize === 'large' ? 'large' : 'small';
    if (size === 'large') {
      segments.push({ type: 'large', project: p });
    } else {
      const last = segments[segments.length - 1];
      if (last && last.type === 'small') last.projects.push(p);
      else segments.push({ type: 'small', projects: [p] });
    }
  }
  return segments;
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
  const featuredSegments = loading ? [] : groupFeatured(featured);

  return (
    <main style={{ background: '#fff' }}>
      {/* Hero */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 560, width: '100%' }}>
        <Image src="/images/home/heronuevo.png" alt="Grupo Hughes & Rienzi" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.25) 100%)' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <FadeIn>
            <h1 className="hr-hero-title" style={{ fontFamily: 'var(--font)', fontWeight: 600, fontSize: 70, lineHeight: '64px', color: '#fff', textAlign: 'center', maxWidth: 900 }}>
              Imaginando nuevas<br />formas de vivir.
            </h1>
          </FadeIn>
        </div>
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.6)', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↓</div>
      </section>

      {/* Intro */}
      <section className="hr-section" style={{ padding: '120px 64px', maxWidth: 1300, margin: '0 auto' }}>
        <div className="hr-intro-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 820px) 1fr', gap: 40, alignItems: 'center' }}>
          <FadeIn direction="right">
            <h2 className="hr-intro-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 50, lineHeight: '57px', marginBottom: 24 }}>
             DESARROLLAMOS PROYECTOS<br />QUE COMBINAN ARQUITECTURA<br />UBICACIÓN Y CALIDAD DE VIDA.
            </h2>
            <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 24, lineHeight: '28px', color: 'var(--text-muted)', marginBottom: 56 }}>
              Más de 20 años desarrollando proyectos que <br />interpretan nuevas formas de vivir y generan valor <br />en ubicaciones estratégicas.
            </p>
            <ArrowButton href="/nosotros" variant="dark" split>Nosotros</ArrowButton>
          </FadeIn>
          <div className="hr-intro-spacer" />
        </div>
      </section>

      {/* Proyectos Destacados */}
      <section className="hr-section" style={{ padding: '0 33px 120px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ maxWidth: 1364, margin: '0 auto', borderTop: '1px solid rgba(20,20,20,0.9)', marginBottom: 64 }} />
        <FadeIn>
          <h2 className="hr-featured-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 50, lineHeight: '54px', textAlign: 'center', marginBottom: 48 }}>
            PROYECTOS DESTACADOS
          </h2>
        </FadeIn>

        {loading ? (
          <>
            <Skeleton aspectRatio="1379 / 784" borderRadius={33} style={{ marginBottom: 24 }} />
            <div className="hr-featured-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
              <Skeleton aspectRatio="677 / 381" borderRadius={25} />
              <Skeleton aspectRatio="677 / 381" borderRadius={25} />
            </div>
          </>
        ) : featuredSegments.map((segment, i) => (
          segment.type === 'large' ? (
            <FeaturedLargeCard key={segment.project.id} project={segment.project} />
          ) : (
            <div key={`small-${i}`} className="hr-featured-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
              {segment.projects.map(p => <FeaturedSmallCard key={p.id} project={p} />)}
            </div>
          )
        ))}

        <div style={{ textAlign: 'center' }}>
          <ArrowButton href="/proyectos" variant="dark" split>Ver Proyectos</ArrowButton>
        </div>
      </section>

      {/* Stats */}
      <section className="hr-section" style={{ padding: '120px 64px', maxWidth: 1300, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <h2 className="hr-stats-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 50, lineHeight: '54px', maxWidth: 900, margin: '0 auto 20px' }}>
            MÁS DE 20 AÑOS CREANDO PROYECTOS PARA VIVIR MEJOR
          </h2>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 18, lineHeight: '24px', color: 'var(--black)', maxWidth: 500, margin: '0 auto 56px' }}>
            Una forma de desarrollar donde el diseño, la calidad y el detalle marcan la diferencia.
          </p>
        </FadeIn>
        <div className="hr-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {STATS.map(s => (
            <FadeIn key={s.label}>
              <div className="hr-stat-card" style={{ background: '#F5F5F5', borderRadius: 20, padding: '32px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 340 }}>
                <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 18, lineHeight: '24px', color: 'var(--black)', marginBottom: 20 }}>{s.label}</p>
                <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 68 }}>{s.value}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Alianza Itaú */}
      <section className="hr-section hr-alliance" style={{ padding: '120px 64px', maxWidth: 1300, margin: '0 auto' }}>
        <div className="hr-alliance-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <FadeIn direction="right">
            <h2 className="hr-alliance-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 65, lineHeight: '65px', marginBottom: 24 }}>Nuevas oportunidades</h2>
            <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 24, lineHeight: '28px', color: 'var(--black)', marginBottom: 32 }}>
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
          .hr-alliance-grid, .hr-intro-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hr-intro-spacer { display: none !important; }
          .hr-intro-title { font-size: 30px !important; line-height: 36px !important; }
          .hr-featured-title, .hr-stats-title, .hr-alliance-title { font-size: 32px !important; line-height: 38px !important; }
          .hr-featured-grid { grid-template-columns: 1fr !important; }
          .hr-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .hr-stat-card { height: 220px !important; }
          .hr-main-card-footer { bottom: 24px !important; right: 24px !important; }
        }
      `}</style>
    </main>
  );
}
