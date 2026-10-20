'use client';
import { use, useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlogPost } from '@/lib/types';
import { FALLBACK_BLOG } from '@/lib/fallbackBlog';
import Image from 'next/image';
import FadeIn from '@/components/FadeIn';
import Footer from '@/components/Footer';
import Skeleton from '@/components/Skeleton';
import ArrowButton from '@/components/ArrowButton';

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)$/i.test(url);
}

export default function BlogPostDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const snap = await getDoc(doc(db, 'blogPosts', id));
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data() } as BlogPost);
        } else {
          throw new Error('not found');
        }
      } catch {
        const fallback = FALLBACK_BLOG.find(p => p.id === id);
        if (fallback) setPost(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return (
    <main style={{ background: '#fff' }}>
      <section className="hr-section" style={{ padding: '200px 79px 0', maxWidth: 1000, margin: '0 auto' }}>
        <Skeleton height={14} width={120} style={{ marginBottom: 12 }} />
        <Skeleton height={45} width="70%" style={{ marginBottom: 40 }} />
        <Skeleton aspectRatio="4 / 3"  style={{ marginBottom: 40 }} />
        <Skeleton height={18} style={{ marginBottom: 8 }} />
        <Skeleton height={18} width="90%" style={{ marginBottom: 8 }} />
        <Skeleton height={18} width="80%" />
      </section>
    </main>
  );

  if (!post) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font)', color: 'var(--text-muted)' }}>Nota no encontrada.</p>
    </main>
  );

  return (
    <main style={{ background: '#fff' }}>
      <section className="hr-section" style={{ padding: '200px 79px 0', maxWidth: 1000, margin: '0 auto' }}>
        <FadeIn>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{post.date}</p>
          <h1 style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 45, lineHeight: '52px', marginBottom: 40 }}>{post.title}</h1>
        </FadeIn>

        {post.coverImage && (
          <FadeIn>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', marginBottom: 40 }}>
              <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: 'cover' }} />
            </div>
          </FadeIn>
        )}

        <FadeIn>
          <div className="hr-blog-content" style={{ marginBottom: 48 }}>
            {post.content.split(/\n\s*\n/).filter(p => p.trim()).map((para, i) => {
              const [first, ...rest] = para.trim().split('\n');
              // Interview format: "01. ¿Pregunta?" on the first line, answer below
              const isQuestion = /^\d{1,2}\.\s/.test(first);
              return (
                <div key={i} style={{ marginBottom: 28 }}>
                  {isQuestion ? (
                    <>
                      <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 16, lineHeight: '24px', textTransform: 'uppercase', marginBottom: 8 }}>{first}</p>
                      {rest.map((line, j) => (
                        <p key={j} style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 18, lineHeight: '28px', marginBottom: 8 }}>{line}</p>
                      ))}
                    </>
                  ) : (
                    <p style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 18, lineHeight: '28px', whiteSpace: 'pre-wrap' }}>{para.trim()}</p>
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>

        {post.gallery.filter(url => url !== post.coverImage).length > 0 && (
          <div className="hr-blog-gallery" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 64 }}>
            {post.gallery.filter(url => url !== post.coverImage).map((url, i) => (
              <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3',  overflow: 'hidden' }}>
                {isVideoUrl(url)
                  ? <video src={url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Image src={url} alt="" fill style={{ objectFit: 'cover' }} />
                }
              </div>
            ))}
          </div>
        )}

        {post.externalUrl && (
          <div style={{ textAlign: 'center', paddingBottom: 64 }}>
            <ArrowButton href={post.externalUrl} variant="dark" split external>Leer nota completa</ArrowButton>
          </div>
        )}
      </section>

      <Footer minimal />

      <style>{`
        @media (max-width: 900px) {
          .hr-section { padding: 120px 20px 0 !important; }
          .hr-blog-gallery { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
