'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlogPost } from '@/lib/types';
import { FALLBACK_BLOG } from '@/lib/fallbackBlog';
import Link from 'next/link';
import Image from 'next/image';
import FadeIn from '@/components/FadeIn';
import Footer from '@/components/Footer';
import Skeleton from '@/components/Skeleton';

function GrayArrow() {
  return (
    <span style={{ width: 11, height: 11, flexShrink: 0, display: 'inline-block', position: 'relative' }}>
      <Image src="/images/proyectos/arrowgray.png" alt="" fill style={{ objectFit: 'contain' }} />
    </span>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'blogPosts'), orderBy('order', 'asc')));
        setPosts(snap.empty ? FALLBACK_BLOG : snap.docs.map(d => ({ id: d.id, ...d.data() })) as BlogPost[]);
      } catch {
        setPosts(FALLBACK_BLOG);
      }
    };
    fetchPosts();
  }, []);

  const loading = posts === null;

  return (
    <main style={{ background: '#fff' }}>
      <section className="hr-section" style={{ padding: '200px 79px 96px', maxWidth: 1440, margin: '0 auto' }}>
        <div className="hr-charlas-intro" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', marginBottom: 80 }}>
          <FadeIn direction="right">
            <Image src="/images/charlas/Logo-ENTRE-CHARLAS 2.png" alt="Entre Charlas" width={300} height={190} style={{ width: '100%', maxWidth: 300, height: 'auto' }} />
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 22, lineHeight: '28px', color: 'var(--black)' }}>
              Entre Charlas es un espacio donde compartimos conversaciones que inspiran nuestros proyectos. Arquitectura, diseño, arte, paisajismo, bienestar y nuevas formas de habitar contadas por quienes las viven, las crean y las piensan todos los días.
            </p>
          </FadeIn>
        </div>

        <div className="hr-charlas-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px 32px' }}>
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton aspectRatio="405.54 / 297.42" borderRadius={16} style={{ marginBottom: 16 }} />
              <Skeleton height={24} width="60%" />
            </div>
          ))}
          {!loading && posts.map(p => (
            <FadeIn key={p.id}>
              <Link href={`/blog/${p.id}`} style={{ display: 'block' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '405.54 / 297.42', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                  <Image src={p.coverImage} alt={p.title} fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 13, color: 'var(--text-muted)' }}>{p.date}</p>
                  <GrayArrow />
                </div>
                <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 24, lineHeight: '28px', color: 'var(--black)' }}>
                  {p.title}
                </p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .hr-section { padding: 120px 20px 64px !important; }
          .hr-charlas-intro { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hr-charlas-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
        }
        @media (max-width: 600px) {
          .hr-charlas-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
