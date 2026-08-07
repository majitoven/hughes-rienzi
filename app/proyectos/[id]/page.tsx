'use client';
import { use, useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, ProjectBlock } from '@/lib/types';
import { FALLBACK_PROJECTS } from '@/lib/fallbackProjects';
import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import ArrowButton from '@/components/ArrowButton';
import Footer from '@/components/Footer';
import Skeleton from '@/components/Skeleton';

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)$/i.test(url);
}

function Media({ src, alt }: { src: string; alt: string }) {
  return isVideoUrl(src)
    ? <video src={src} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} />;
}

function GalleryBlock({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;
  const go = (dir: 1 | -1) => setActive(a => (a + dir + images.length) % images.length);
  const thumbCount = Math.min(3, images.length - 1);
  const thumbIndexes = Array.from({ length: thumbCount }, (_, i) => (active + 1 + i) % images.length);

  return (
    <FadeIn>
      <div style={{ margin: '24px 0' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1288 / 945', overflow: 'hidden', marginBottom: 16 }}>
          <div key={active} className="hr-gallery-fade" style={{ position: 'absolute', inset: 0 }}>
            <Media src={images[active]} alt={title} />
          </div>
          {images.length > 1 && (
        <>
  <button
    type="button"
    aria-label="Foto anterior"
    onClick={() => go(-1)}
    className="hr-gallery-arrow"
    style={{
      position: 'absolute',
      left: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 30,
      height: 30,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.35)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background 0.25s ease, transform 0.25s ease',
    }}
  >
    <span
      style={{
        display: 'inline-flex',
        transform: 'rotate(225deg)',
      }}
    >
      <Image
        src="/images/home/arrowblack.png"
        alt=""
        width={8}
        height={8}
      />
    </span>
  </button>

  <button
    type="button"
    aria-label="Foto siguiente"
    onClick={() => go(1)}
    className="hr-gallery-arrow"
    style={{
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 30,
      height: 30,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.35)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background 0.25s ease, transform 0.25s ease',
    }}
  >
    <span
      style={{
        display: 'inline-flex',
        transform: 'rotate(45deg)',
      }}
    >
      <Image
        src="/images/home/arrowblack.png"
        alt=""
        width={8}
        height={8}
      />
    </span>
  </button>
      </>
          )}
        </div>
        {thumbIndexes.length > 0 && (
          <div className="hr-gallery-thumbs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {thumbIndexes.map(idx => (
              <button key={idx} type="button" onClick={() => setActive(idx)} className="hr-gallery-thumb" style={{
                position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden',
                border: 'none', padding: 0, cursor: 'pointer', background: 'none',
              }}>
                <div style={{ position: 'absolute', inset: 0, transition: 'transform 0.3s ease' }}>
                  <Media src={images[idx]} alt={title} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}

function ContentBlock({ block, title, externalUrl }: { block: ProjectBlock; title: string; externalUrl?: string }) {
  if (block.type === 'text') {
    return (
      <FadeIn>
        <div className="hr-project-text-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, padding: '56px 0' }}>
          <div>
            <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 45, lineHeight: '47px', color: 'var(--black)' }}>
              {block.headline}
            </p>
            {block.subtitle && (
              <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 18, lineHeight: '24px', color: 'var(--black)', marginTop: 20 }}>
                {block.subtitle}
              </p>
            )}
          </div>
          <div>
            {(block.body ?? '').split('\n\n').map((para, i) => (
              <p key={i} style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 21, lineHeight: '28px', color: 'var(--black)', marginBottom: 16 }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </FadeIn>
    );
  }

  if (block.type === 'phrase') {
    return (
      <FadeIn>
        <div className="hr-project-phrase" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, padding: '40px 0', flexWrap: 'wrap' }}>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 32, lineHeight: '38px', color: 'var(--black)' }}>
            {block.headline}
          </p>
          {externalUrl && (
            <ArrowButton href={externalUrl} variant="dark" split external>Ir al sitio web</ArrowButton>
          )}
        </div>
      </FadeIn>
    );
  }

  if (block.type === 'amenities') {
    const items = block.amenities ?? [];
    if (items.length === 0) return null;
    const cols = block.amenitiesColumns ?? 2;
    const mid = Math.ceil(items.length / 2);
    const columns = cols === 2 ? [items.slice(0, mid), items.slice(mid)] : [items];
    return (
      <FadeIn>
        <div style={{ padding: '40px 0' }}>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 29, letterSpacing: '0.1em', color: 'var(--black)', textTransform: 'uppercase', marginBottom: 20 }}>
            AMENITIES
          </p>
          <div className="hr-amenities-grid" style={{ display: 'grid', gridTemplateColumns: cols === 2 ? '1fr 1fr' : '1fr', gap: '0 64px' }}>
            {columns.map((col, ci) => (
              <div key={ci}>
                {col.map((item, ii) => (
                  <p key={ii} style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 16, color: 'var(--black)', padding: '14px 0', textTransform: 'uppercase', borderBottom: '1px solid rgba(20,20,20,0.12)', borderTop:    ii === 0 ? '1px solid rgba(20,20,20,0.12)' : 'none' }}>
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    );
  }

  if (block.type === 'gallery') {
    return <GalleryBlock images={block.images ?? []} title={title} />;
  }

  const images = block.images ?? [];
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <FadeIn>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1288 / 945', overflow: 'hidden', margin: '24px 0' }}>
          <Media src={images[0]} alt={title} />
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="hr-project-image-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, margin: '24px 0' }}>
        {images.slice(0, 2).map((src, i) => (
          <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden' }}>
            <Media src={src} alt={title} />
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

export default function ProyectoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const snap = await getDoc(doc(db, 'projects', id));
        if (snap.exists()) {
          setProject({ id: snap.id, ...snap.data() } as Project);
        } else {
          throw new Error('not found');
        }
      } catch {
        const fallback = FALLBACK_PROJECTS.find(p => p.id === id);
        if (fallback) setProject(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return (
    <main style={{ background: '#fff' }}>
      <Skeleton height={"100vh"} borderRadius={0} />
      <section className="hr-section" style={{ padding: '64px 79px 0', maxWidth: 1440, margin: '0 auto' }}>
        <Skeleton height={65} width="40%" style={{ marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 24 }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={28} width={120} />)}
        </div>
      </section>
      <section className="hr-section" style={{ padding: '56px 79px 80px', maxWidth: 1440, margin: '0 auto' }}>
        <Skeleton aspectRatio="1288 / 945" borderRadius={0} />
      </section>
    </main>
  );

  if (!project) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font)', color: 'var(--text-muted)' }}>Proyecto no encontrado.</p>
    </main>
  );

  return (
    <main style={{ background: '#fff' }}>
      {/* Hero */}
      <section style={{ position: 'relative', width: '100%', height: "100vh" }}>
        {isVideoUrl(project.heroImage || project.coverImage) ? (
          <video src={project.heroImage || project.coverImage} autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Image src={project.heroImage || project.coverImage} alt={project.title} fill priority style={{ objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.35) 100%)' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center' }}>
          <FadeIn>
            {project.logoImage ? (
              <Image src={project.logoImage} alt={project.title} width={490} height={212} style={{ width: 'auto', height: 96, objectFit: 'contain' }} />
            ) : (
              <>
                <p style={{ fontFamily: 'var(--font)', fontWeight: 600, fontSize: 56, letterSpacing: '0.02em' }}>{project.title}</p>
                <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 18, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{project.subtitle}</p>
              </>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Back link */}
      <section className="hr-section" style={{ padding: '24px 79px 0', maxWidth: 1440, margin: '0 auto', textAlign: 'right' }}>
        <Link href="/proyectos" style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Volver a Proyectos
        </Link>
      </section>

      {/* Title + facts */}
      <section className="hr-section" style={{ padding: '20px 79px 0', maxWidth: 1440, margin: '0 auto' }}>
        <FadeIn>
          <h1 style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 52, lineHeight: '52px', marginBottom: 40 }}>
            {project.title} {project.subtitle}
          </h1>
          {project.facts.length > 0 && (
            <div className="hr-project-facts" style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'flex-start', width: '100%', gap: '8px 24px' }}>
              {project.facts.map(f => (
                <p key={f.id} style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 15, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--black)' }}>{f.label}</span>{'  '}
                  <span style={{ color:  'var(--text-muted)', fontWeight: 400}}>{f.value}</span>
                </p>
              ))}
            </div>
          )}
        </FadeIn>
      </section>

      {/* Dynamic content blocks */}
      <section className="hr-section" style={{ padding: '32px 79px 80px', paddingTop:0, maxWidth: 1440, margin: '0 auto' }}>
        {project.content.map(block => (
          <ContentBlock key={block.id} block={block} title={project.title} externalUrl={project.externalUrl} />
        ))}

        <div style={{ textAlign: 'center', paddingTop: 40, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {project.externalUrl && !project.content.some(b => b.type === 'phrase') && (
            <ArrowButton href={project.externalUrl} variant="dark" split external>Ir al sitio web</ArrowButton>
          )}
          <ArrowButton href="/proyectos" variant="dark" split>Volver a proyectos</ArrowButton>
        </div>
      </section>

      <Footer minimal />

      <style>{`
        .hr-gallery-fade { animation: hr-gallery-fadein 1.2s ease; }
        @keyframes hr-gallery-fadein { from { opacity: 0; } to { opacity: 1; } }
        .hr-gallery-arrow:hover { background: rgba(255,255,255,0.6); transform: translateY(-50%) scale(1.15); }
        .hr-gallery-thumb:hover > div { transform: scale(1.06); }
        @media (max-width: 900px) {
          .hr-section { padding-left: 20px !important; padding-right: 20px !important; }
          .hr-project-text-block, .hr-project-image-pair { grid-template-columns: 1fr !important; gap: 24px !important; }
          .hr-project-facts { flex-wrap: wrap !important; gap: 10px 20px !important; justify-content: flex-start !important; }
          .hr-project-phrase { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .hr-amenities-grid { grid-template-columns: 1fr !important; }
          .hr-gallery-thumbs { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </main>
  );
}
