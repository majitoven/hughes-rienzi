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
    <span className="hr-blog-arrow" style={{ width: 11, height: 11, flexShrink: 0, display: 'inline-block', position: 'relative', transition: 'transform 0.3s ease' }}>
      <Image src="/images/home/arrowblack.png" alt="" fill style={{ objectFit: 'contain' }} />
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
      <section className="hr-section" style={{ padding: '144px 79px 96px', maxWidth: 1440, margin: '0 auto' }}>
        <FadeIn direction="right">
          <div className="hr-charlas-intro" style={{ display: 'flex', alignItems: 'center', gap: 48, marginBottom: 56 }}>
            <Image src="/images/charlas/Logo-ENTRE-CHARLAS 2.png" alt="Entre Charlas" width={300} height={190} style={{ width: '100%', maxWidth: 260, height: 'auto', flexShrink: 0 }} />
            <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 20, lineHeight: '28px', color: 'var(--black)', maxWidth: 560 }}>
              Un espacio para conversar, compartir ideas y descubrir nuevas miradas sobre arquitectura, desarrollo inmobiliario y todo lo que nos inspira.
            </p>
          </div>
        </FadeIn>

        <div className="hr-charlas-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px 32px' }}>
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton aspectRatio="405.54 / 297.42" borderRadius={0} style={{ marginBottom: 16 }} />
              <Skeleton height={24} width="60%" />
            </div>
          ))}
          {!loading && posts.map(p => (
            <FadeIn key={p.id}>
              <Link href={`/blog/${p.id}`} className="hr-blog-card" style={{ display: 'block' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '405.54 / 297.42', overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ position: 'absolute', inset: 0, transition: 'transform 0.4s ease' }} className="hr-blog-card-image">
                    <Image src={p.coverImage} alt={p.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="hr-blog-card-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', opacity: 0, transition: 'opacity 0.4s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 4 }}>
           
                  <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 12, color: 'var(--text-muted)' }}>{p.date}</p>

                  <GrayArrow />
                </div>
                <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 18, lineHeight: '22px', color: 'var(--black)' }}>
                    {p.title}
                  </p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      <Footer minimal />

      <style>{`
        .hr-blog-card:hover .hr-blog-card-image { transform: scale(1.04); }
        .hr-blog-card:hover .hr-blog-card-overlay { opacity: 1 !important; }
        .hr-blog-card:hover .hr-blog-arrow { transform: translateX(3px); }
        @media (max-width: 900px) {
          .hr-section { padding: 120px 20px 64px !important; }
          .hr-charlas-intro { flex-direction: column !important; align-items: flex-start !important; gap: 24px !important; }
          .hr-charlas-intro p { font-size: 17px !important; line-height: 24px !important; }
          .hr-charlas-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
        }
        @media (max-width: 600px) {
          .hr-charlas-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
