'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/lib/types';
import { FALLBACK_PROJECTS } from '@/lib/fallbackProjects';
import Link from 'next/link';
import Image from 'next/image';
import FadeIn from '@/components/FadeIn';
import Skeleton from '@/components/Skeleton';

const TABS = ['Todos', 'Lanzamiento', 'Construcción', 'Estrenar'];

export default function Proyectos() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [activeTab, setActiveTab] = useState('Todos');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'projects'), orderBy('order', 'asc')));
        setProjects(snap.empty ? FALLBACK_PROJECTS : snap.docs.map(d => ({ id: d.id, ...d.data() })) as Project[]);
      } catch {
        setProjects(FALLBACK_PROJECTS);
      }
    };
    fetchProjects();
  }, []);

  const loading = projects === null;
  const visible = loading ? [] : (activeTab === 'Todos' ? projects : projects.filter(p => p.status === activeTab));

  return (
    <main style={{ background: '#fff' }}>
      <section className="hr-section" style={{ padding: '140px 79px 120px', maxWidth: 1440, margin: '0 auto' }}>
        <FadeIn>
          <h1 style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 50, lineHeight: '52px', marginBottom: 32 }}>
            Proyectos
          </h1>
        </FadeIn>

        <div className="hr-proyectos-tabs" style={{ display: 'flex', gap: 28, marginBottom: 48 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              fontFamily: 'var(--font)', fontWeight: 500, fontSize: 16, lineHeight: '22px',
              padding: 0, background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab ? 'var(--black)' : '#5E5E5E',
              transition: 'color 0.2s', flexShrink: 0,
            }}>{tab}</button>
          ))}
        </div>

        <div className="hr-proyectos-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton aspectRatio="622 / 456" borderRadius={0} style={{ marginBottom: 20 }} />
              <Skeleton height={28} width="70%" />
            </div>
          ))}
          {visible.map(p => (
            <FadeIn key={p.id}>
              <Link href={`/proyectos/${p.id}`} style={{ display: 'block' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '622 / 456', overflow: 'hidden', marginBottom: 20 }}>
                  <Image src={p.coverImage} alt={p.title} fill style={{ objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40 }}>
                    <Image src="/images/home/arrowwhiterounded.png" alt="" fill style={{ objectFit: 'contain' }} />
                  </span>
                </div>
                <div className="hr-proyecto-heading" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
                  <p className="hr-proyecto-card-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 30, lineHeight: '34px', color: 'var(--black)' }}>
                    {p.title} {p.subtitle}
                  </p>
                  {p.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <span style={{ width: 10, height: 13, position: 'relative', flexShrink: 0 }}>
                        <Image src="/images/proyectos/pingray.png" alt="" fill style={{ objectFit: 'contain' }} />
                      </span>
                      <p className="hr-proyecto-card-location" style={{ color: '#5E5E5E', fontWeight: 400, fontSize: 18, fontFamily: 'var(--font)' }}>
                        {p.location}
                      </p>
                    </span>
                  )}
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hr-section { padding: 100px 20px 64px !important; }
          .hr-proyectos-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hr-proyectos-tabs {
            gap: 18px !important; overflow-x: auto !important; flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch; padding-bottom: 4px;
          }
          .hr-proyectos-tabs button { font-size: 14px !important; }
          .hr-proyecto-card-title { font-size: 22px !important; line-height: 26px !important; }
          .hr-proyecto-card-location { font-size: 14px !important; }
        }
      `}</style>
    </main>
  );
}
