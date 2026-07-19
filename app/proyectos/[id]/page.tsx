'use client';
import { use, useEffect, useState } from 'react';
import { getDoc, doc, getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, ProjectBlock } from '@/lib/types';
import { FALLBACK_PROJECTS } from '@/lib/fallbackProjects';
import Image from 'next/image';
import FadeIn from '@/components/FadeIn';
import ArrowButton from '@/components/ArrowButton';
import Footer from '@/components/Footer';

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)$/i.test(url);
}

function Media({ src, alt }: { src: string; alt: string }) {
  return isVideoUrl(src)
    ? <video src={src} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} />;
}

function ContentBlock({ block, title }: { block: ProjectBlock; title: string }) {
  if (block.type === 'text') {
    return (
      <FadeIn>
        <div className="hr-project-text-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, padding: '56px 0' }}>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 45, lineHeight: '47px', color: 'var(--black)' }}>
            {block.headline}
          </p>
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

  const images = block.images ?? [];
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <FadeIn>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1288 / 945', borderRadius: 32, overflow: 'hidden', margin: '24px 0' }}>
          <Media src={images[0]} alt={title} />
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="hr-project-image-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, margin: '24px 0' }}>
        {images.slice(0, 2).map((src, i) => (
          <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: 24, overflow: 'hidden' }}>
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
  const [nextId, setNextId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const snap = await getDoc(doc(db, 'projects', id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Project;
          setProject(data);

          const listSnap = await getDocs(query(collection(db, 'projects'), orderBy('order', 'asc')));
          const list = listSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Project[];
          const idx = list.findIndex(p => p.id === id);
          if (idx !== -1) setNextId(list[(idx + 1) % list.length].id);
        } else {
          throw new Error('not found');
        }
      } catch {
        const fallback = FALLBACK_PROJECTS.find(p => p.id === id);
        if (fallback) {
          setProject(fallback);
          const idx = FALLBACK_PROJECTS.findIndex(p => p.id === id);
          setNextId(FALLBACK_PROJECTS[(idx + 1) % FALLBACK_PROJECTS.length].id);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font)', color: 'var(--text-muted)' }}>Cargando...</p>
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
      <section style={{ position: 'relative', width: '100%', aspectRatio: '1456 / 655' }}>
        <Image src={project.heroImage || project.coverImage} alt={project.title} fill priority style={{ objectFit: 'cover' }} />
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

      {/* Title + facts */}
      <section className="hr-section" style={{ padding: '64px 79px 0', maxWidth: 1440, margin: '0 auto' }}>
        <FadeIn>
          <h1 style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 65, lineHeight: '63px', marginBottom: 24 }}>
            {project.title} {project.subtitle}
          </h1>
          {project.facts.length > 0 && (
            <div className="hr-project-facts" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', gap: '12px 24px' }}>
              {project.facts.map(f => (
                <p key={f.id} style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 20, lineHeight: '28px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{f.label}</span>{'  '}
                  <span style={{ color: 'var(--black)' }}>{f.value}</span>
                </p>
              ))}
            </div>
          )}
        </FadeIn>
      </section>

      {/* Dynamic content blocks */}
      <section className="hr-section" style={{ padding: '32px 79px 80px', maxWidth: 1440, margin: '0 auto' }}>
        {project.content.map(block => (
          <ContentBlock key={block.id} block={block} title={project.title} />
        ))}

        {nextId && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <ArrowButton href={`/proyectos/${nextId}`} variant="dark" split>Ver siguiente proyecto</ArrowButton>
          </div>
        )}
      </section>

      <Footer minimal />

      <style>{`
        @media (max-width: 900px) {
          .hr-section { padding-left: 20px !important; padding-right: 20px !important; }
          .hr-project-text-block, .hr-project-image-pair { grid-template-columns: 1fr !important; gap: 24px !important; }
          .hr-project-facts { gap: 8px 24px !important; }
        }
      `}</style>
    </main>
  );
}
