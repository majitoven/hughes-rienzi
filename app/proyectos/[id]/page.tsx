'use client';
import { use, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

// Fills its (relatively positioned) parent and shows a shimmer skeleton until the image/video has loaded.
function Media({ src, alt, sizes, priority, fit = 'cover', controls, dark }: {
  src: string; alt: string; sizes?: string; priority?: boolean; fit?: 'cover' | 'contain'; controls?: boolean; dark?: boolean;
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = loadedSrc === src;
  const onLoad = () => setLoadedSrc(src);
  const mediaStyle: React.CSSProperties = { objectFit: fit, opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease' };
  return (
    <>
      {!loaded && <div className="hr-skeleton" style={{ position: 'absolute', inset: 0, opacity: dark ? 0.15 : 1 }} />}
      {isVideoUrl(src)
        ? <video src={src} autoPlay muted loop playsInline controls={controls} onLoadedData={onLoad}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...mediaStyle }} />
        : <Image src={src} alt={alt} fill sizes={sizes} priority={priority} onLoad={onLoad} style={mediaStyle} />}
    </>
  );
}

function ArrowCircle({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <span style={{ display: 'inline-flex', transform: `rotate(${dir === 'prev' ? 225 : 45}deg)` }}>
      <Image src="/images/home/arrowwhite.png" alt="" width={10} height={10} />
    </span>
  );
}

function Lightbox({ images, index, title, onClose, onNav }: { images: string[]; index: number; title: string; onClose: () => void; onNav: (dir: 1 | -1) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNav(-1);
      if (e.key === 'ArrowRight') onNav(1);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [onClose, onNav]);

  const src = images[index];
  return createPortal(
    <div role="dialog" aria-modal="true" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 80px' }} className="hr-lightbox">
      <div key={index} className="hr-gallery-fade" onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Media src={src} alt={title} sizes="100vw" fit="contain" controls dark />
      </div>
      <button type="button" aria-label="Cerrar" onClick={onClose} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 28, lineHeight: 1, cursor: 'pointer' }}>✕</button>
      {images.length > 1 && (
        <>
          <button type="button" aria-label="Foto anterior" onClick={e => { e.stopPropagation(); onNav(-1); }} className="hr-gallery-arrow" style={{ left: 24 }}><ArrowCircle dir="prev" /></button>
          <button type="button" aria-label="Foto siguiente" onClick={e => { e.stopPropagation(); onNav(1); }} className="hr-gallery-arrow" style={{ right: 24 }}><ArrowCircle dir="next" /></button>
        </>
      )}
    </div>,
    document.body,
  );
}

function MapEmbed({ title, query }: { title: string; query: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className="hr-skeleton" style={{ position: 'absolute', inset: 0 }} />}
      <iframe
        title={`Mapa de ${title}`}
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`}
        loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen onLoad={() => setLoaded(true)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, filter: 'grayscale(1)', opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease' }} />
    </>
  );
}

const GALLERY_GAP = 16;

function GalleryBlock({ images, title }: { images: string[]; title: string }) {
  const [start, setStart] = useState(0);
  const [perView, setPerView] = useState(3);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => setPerView(mq.matches ? 1 : 3);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const maxStart = Math.max(0, images.length - perView);
  const pos = Math.min(start, maxStart);

  const navLightbox = useCallback((dir: 1 | -1) => setOpen(o => o === null ? o : (o + dir + images.length) % images.length), [images.length]);
  const closeLightbox = useCallback(() => setOpen(null), []);

  if (images.length === 0) return null;

  return (
    <FadeIn>
      <div style={{ position: 'relative', margin: '56px 0' }}>
        <div style={{ overflow: 'hidden', borderRadius: 18 }}>
          <div style={{ display: 'flex', gap: GALLERY_GAP, transform: `translateX(calc(${-pos} * (100% + ${GALLERY_GAP}px) / ${perView}))`, transition: 'transform 0.5s ease' }}>
            {images.map((src, i) => (
              <button key={i} type="button" onClick={() => setOpen(i)} aria-label={`Ver foto ${i + 1}`} className="hr-gallery-thumb" style={{
                position: 'relative', flex: `0 0 calc((100% - ${(perView - 1) * GALLERY_GAP}px) / ${perView})`, aspectRatio: '297 / 172',
                borderRadius: 18, overflow: 'hidden', border: 'none', padding: 0, cursor: 'zoom-in', background: '#f0f0f0',
              }}>
                <div style={{ position: 'absolute', inset: 0, transition: 'transform 0.4s ease' }}>
                  <Media src={src} alt={title} sizes="(max-width: 900px) 100vw, 33vw" />
                </div>
              </button>
            ))}
          </div>
        </div>
        {maxStart > 0 && (
          <>
            <button type="button" aria-label="Fotos anteriores" disabled={pos === 0} onClick={() => setStart(Math.max(0, pos - 1))} className="hr-gallery-arrow" style={{ left: -18 }}><ArrowCircle dir="prev" /></button>
            <button type="button" aria-label="Fotos siguientes" disabled={pos === maxStart} onClick={() => setStart(Math.min(maxStart, pos + 1))} className="hr-gallery-arrow" style={{ right: -18 }}><ArrowCircle dir="next" /></button>
          </>
        )}
      </div>
      {open !== null && <Lightbox images={images} index={open} title={title} onClose={closeLightbox} onNav={navLightbox} />}
    </FadeIn>
  );
}

const bodyStyle: React.CSSProperties = { fontFamily: 'var(--font)', fontWeight: 300, fontSize: 21, lineHeight: '28px', color: 'var(--black)', textAlign: 'justify' };

function Paragraphs({ text }: { text?: string }) {
  return (
    <>
      {(text ?? '').split('\n\n').filter(Boolean).map((para, i) => (
        <p key={i} style={{ ...bodyStyle, marginBottom: 20 }}>{para}</p>
      ))}
    </>
  );
}

function ContentBlock({ block, title, cta }: { block: ProjectBlock; title: string; cta?: React.ReactNode }) {
  if (block.type === 'text') {
    return (
      <FadeIn>
        <div className="hr-project-text-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, padding: '40px 0' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 45, lineHeight: '47px', color: 'var(--black)' }}>
              {block.headline}
            </h2>
            {block.subtitle && (
              <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 18, lineHeight: '24px', color: 'var(--black)', marginTop: 20, maxWidth: 520 }}>
                {block.subtitle}
              </p>
            )}
            {cta && <div style={{ marginTop: 40 }}>{cta}</div>}
          </div>
          <div>
            <Paragraphs text={block.body} />
          </div>
        </div>
      </FadeIn>
    );
  }

  if (block.type === 'phrase') {
    return (
      <FadeIn>
        <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 32, lineHeight: '38px', color: 'var(--black)', padding: '40px 0' }}>
          {block.headline}
        </p>
      </FadeIn>
    );
  }

  if (block.type === 'amenities') {
    const items = block.amenities ?? [];
    if (items.length === 0) return null;
    return (
      <FadeIn>
        <div className="hr-project-text-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, padding: '40px 0' }}>
          <div>
            {block.headline && (
              <h2 style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 45, lineHeight: '47px', color: 'var(--black)', marginBottom: 32 }}>
                {block.headline}
              </h2>
            )}
            <Paragraphs text={block.body} />
            {cta && <div style={{ marginTop: 20 }}>{cta}</div>}
          </div>
          <div style={{ paddingTop: block.headline ? 12 : 0 }}>
            <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 29, color: 'var(--black)', textTransform: 'uppercase', marginBottom: 12 }}>
              AMENITIES
            </p>
            {items.map((item, i) => (
              <p key={i} style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 18, letterSpacing: '0.02em', color: 'var(--black)', padding: '16px 0', textTransform: 'uppercase', borderBottom: '1px solid rgba(20,20,20,0.7)' }}>
                {item}
              </p>
            ))}
          </div>
        </div>
      </FadeIn>
    );
  }

  if (block.type === 'gallery') {
    return <GalleryBlock images={block.images ?? []} title={title} />;
  }

  // 'images': thin strip of photos that works as a visual separator between sections
  const images = (block.images ?? []).slice(0, 2);
  if (images.length === 0) return null;

  return (
    <FadeIn>
      <div className="hr-project-image-pair" style={{ display: 'grid', gridTemplateColumns: `repeat(${images.length}, 1fr)`, gap: 32, margin: '40px 0' }}>
        {images.map((src, i) => (
          <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: images.length === 2 ? '442 / 198' : '1288 / 300', borderRadius: 18, overflow: 'hidden' }}>
            <Media src={src} alt={title} sizes="(max-width: 900px) 100vw, 50vw" />
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

  const heroSrc = project.heroImage || project.coverImage;
  // Embedded map: reuse the search query of the Google Maps link; short links (maps.app.goo.gl) can't be embedded,
  // so those fall back to the project name + location.
  const mapQuery = (() => {
    if (!project.mapsUrl && !project.location) return null;
    try {
      const q = project.mapsUrl && new URL(project.mapsUrl).searchParams.get('query');
      if (q) return q;
    } catch {}
    return [project.title, project.subtitle, project.location, 'Uruguay'].filter(Boolean).join(', ');
  })();
  // Brochure button goes under the first text block; website button next to the amenities
  // (falls back to the last text block, or to the end of the page if neither exists).
  const brochureIndex = project.brochureUrl ? project.content.findIndex(b => b.type === 'text') : -1;
  const amenitiesIndex = project.content.findIndex(b => b.type === 'amenities' && (b.amenities?.length ?? 0) > 0);
  const lastTextIndex = project.content.map(b => b.type).lastIndexOf('text');
  const websiteIndex = !project.externalUrl ? -1
    : amenitiesIndex !== -1 ? amenitiesIndex
    : lastTextIndex !== brochureIndex ? lastTextIndex : -1;
  const brochureButton = project.brochureUrl
    ? <ArrowButton href={project.brochureUrl} variant="dark" external>Descargar brochure</ArrowButton> : null;
  const websiteButton = project.externalUrl
    ? <ArrowButton href={project.externalUrl} variant="dark" external>Visitar Sitio Web</ArrowButton> : null;

  return (
    <main style={{ background: '#fff' }}>
      {/* Hero */}
      <section style={{ position: 'relative', width: '100%', height: '100vh', minHeight: 560 }}>
        <Media src={heroSrc} alt={project.title} sizes="100vw" priority />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%)' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center' }}>
          <FadeIn>
            {project.logoImage ? (
              <Image src={project.logoImage} alt={project.title} width={490} height={212} style={{ width: 'auto', height: 96, objectFit: 'contain' }} />
            ) : (
              <>
                <h1 style={{ fontFamily: 'var(--font)', fontWeight: 600, fontSize: 56, letterSpacing: '0.02em' }}>{project.title}</h1>
                <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 18, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{project.subtitle}</p>
              </>
            )}
          </FadeIn>
        </div>
        {project.facts.length > 0 && (
          <div className="hr-project-facts" style={{ position: 'absolute', left: 0, right: 0, bottom: 56, paddingLeft: 79, display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', gap: 24, color: '#fff', width: 'calc(70% + 79px)', maxWidth: '100%', boxSizing: 'border-box' }}>
            {project.facts.map(f => (
              <p key={f.id} style={{ fontFamily: 'var(--font)', fontSize: 15, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 600 }}>{f.label}</span>
                <span style={{ fontWeight: 300, marginLeft: 8, opacity: 0.9 }}>{f.value}</span>
              </p>
            ))}
          </div>
        )}
      </section>

      <section className="hr-section" style={{ padding: '32px 79px 80px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ textAlign: 'right' }}>
          <Link href="/proyectos" className="hr-back-link" style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--black)', textDecoration: 'none' }}>
            ← Volver a Proyectos
          </Link>
        </div>

        {project.content.map((block, i) => (
          <ContentBlock key={block.id} block={block} title={project.title}
            cta={i === brochureIndex ? brochureButton : i === websiteIndex ? websiteButton : undefined} />
        ))}

        {(brochureIndex === -1 && brochureButton) || (websiteIndex === -1 && websiteButton) ? (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 24 }}>
            {brochureIndex === -1 && brochureButton}
            {websiteIndex === -1 && websiteButton}
          </div>
        ) : null}

        {(project.mapImage || mapQuery) && (
          <FadeIn>
            <div style={{ paddingTop: 24, textAlign: 'center' }}>
              <div className="hr-project-map" style={{ position: 'relative', width: '100%', aspectRatio: '920 / 335', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--black)', marginBottom: 32, background: '#f0f0f0' }}>
                {project.mapImage ? (
                  <Media src={project.mapImage} alt={`Ubicación de ${project.title}`} sizes="(max-width: 900px) 100vw, 1288px" />
                ) : (
                  <MapEmbed title={project.title} query={mapQuery!} />
                )}
              </div>
              {project.mapsUrl && (
                <ArrowButton href={project.mapsUrl} variant="dark" external>Ver en Google Maps</ArrowButton>
              )}
            </div>
          </FadeIn>
        )}
      </section>

      <Footer minimal />

      <style>{`
        .hr-gallery-fade { animation: hr-gallery-fadein 0.6s ease; }
        @keyframes hr-gallery-fadein { from { opacity: 0; } to { opacity: 1; } }
        .hr-gallery-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 2;
          width: 36px; height: 36px; border-radius: 50%; background: var(--black); border: none;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }
        .hr-gallery-arrow:hover:not(:disabled) { transform: translateY(-50%) scale(1.12); }
        .hr-gallery-arrow:disabled { opacity: 0.25; cursor: default; }
        .hr-lightbox .hr-gallery-arrow { background: #fff; width: 44px; height: 44px; }
        .hr-lightbox .hr-gallery-arrow img { filter: invert(1); }
        .hr-gallery-thumb:hover > div { transform: scale(1.06); }
        .hr-back-link:hover { opacity: 0.6; }
        @media (max-width: 900px) {
          .hr-section { padding-left: 20px !important; padding-right: 20px !important; }
          .hr-project-text-block, .hr-project-image-pair { grid-template-columns: 1fr !important; gap: 24px !important; }
          .hr-project-facts { padding: 0 20px !important; flex-wrap: wrap !important; gap: 8px 20px !important; bottom: 32px !important; width: 100% !important; min-width: 0 !important; justify-content: flex-start !important; }
          .hr-gallery-arrow[aria-label^="Fotos"] { width: 32px; height: 32px; }
          .hr-lightbox { padding: 56px 12px !important; }
          .hr-project-map { aspect-ratio: 4 / 3 !important; }
        }
      `}</style>
    </main>
  );
}
