'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/lib/types';
import { FALLBACK_PROJECTS } from '@/lib/fallbackProjects';
import Link from 'next/link';
import Image from 'next/image';
import FadeIn from '@/components/FadeIn';
import Footer from '@/components/Footer';

const TABS = ['Todos', 'Lanzamiento', 'Construcción', 'Estrenar'];

export default function Proyectos() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [activeTab, setActiveTab] = useState('Todos');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'projects'), orderBy('order', 'asc')));
        if (!snap.empty) {
          setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Project[]);
        }
      } catch {
        // keep fallback
      }
    };
    fetchProjects();
  }, []);

  const visible = activeTab === 'Todos' ? projects : projects.filter(p => p.status === activeTab);

  return (
    <main style={{ background: '#fff' }}>
      <section className="hr-section" style={{ padding: '200px 79px 120px', maxWidth: 1440, margin: '0 auto' }}>
        <FadeIn>
          <h1 style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 65, lineHeight: '64px', marginBottom: 20 }}>
            Nuestros Proyectos
          </h1>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 24, lineHeight: '28px', color: 'var(--text-muted)', marginBottom: 48 }}>
            En Grupo Hughes &amp; Rienzi estamos constantemente<br />imaginando nuevas formas de vivir.
          </p>
        </FadeIn>

        <div style={{ display: 'flex', gap: 56, marginBottom: 56 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              fontFamily: 'var(--font)', fontWeight: 500, fontSize: 21, lineHeight: '28px',
              padding: 0, background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab ? 'var(--black)' : 'rgba(20,20,20,0.35)',
              transition: 'color 0.2s',
            }}>{tab}</button>
          ))}
        </div>

        <div className="hr-proyectos-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {visible.map(p => (
            <FadeIn key={p.id}>
              <Link href={`/proyectos/${p.id}`} style={{ display: 'block' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '622 / 456', borderRadius: 24, overflow: 'hidden', marginBottom: 20 }}>
                  <Image src={p.coverImage} alt={p.title} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 30%)' }} />
                  <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
                    {p.logoImage ? (
                      <Image src={p.logoImage} alt={p.title} width={268} height={116} style={{ width: 'auto', height: 24, objectFit: 'contain' }} />
                    ) : (
                      <>
                        <p style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 16, letterSpacing: '0.04em' }}>{p.title.toUpperCase()}</p>
                        <p style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 12 }}>{p.subtitle}</p>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 35, lineHeight: '28px', color: 'var(--black)' }}>
                    {p.title} {p.subtitle}
                    {p.location && <span style={{ color: 'rgba(20,20,20,0.4)', fontWeight: 400, fontSize: 18 }}> &nbsp; {p.location}</span>}
                  </p>
                  <span style={{ width: 17, height: 17, flexShrink: 0, display: 'inline-block', position: 'relative' }}>
                    <Image src="/images/proyectos/arrowgray.png" alt="" fill style={{ objectFit: 'contain' }} />
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      <Footer minimal />

      <style>{`
        @media (max-width: 900px) {
          .hr-section { padding: 120px 20px 64px !important; }
          .hr-proyectos-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </main>
  );
}
