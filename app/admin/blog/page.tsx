'use client';
import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlogPost } from '@/lib/types';
import Link from 'next/link';

const s: React.CSSProperties = { fontFamily: 'var(--font)' };

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'blogPosts'), orderBy('order', 'asc')));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as BlogPost[];
      data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setPosts(data);
    } catch {
      const snap = await getDocs(collection(db, 'blogPosts'));
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })) as BlogPost[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta nota? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    await deleteDoc(doc(db, 'blogPosts', id));
    setPosts(p => p.filter(x => x.id !== id));
    setDeleting(null);
  };

  const saveOrder = async (list: BlogPost[]) => {
    await Promise.all(list.map((p, i) => updateDoc(doc(db, 'blogPosts', p.id), { order: i })));
  };

  const onDragStart = (i: number) => { dragIndex.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === i) return;
    const next = [...posts];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(i, 0, moved);
    dragIndex.current = i;
    setPosts(next);
  };
  const onDrop = async () => {
    dragIndex.current = null;
    await saveOrder(posts);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ ...s, fontWeight: 500, fontSize: 28, color: 'var(--black)' }}>Entre Charlas</h1>
          <p style={{ ...s, fontWeight: 300, fontSize: 13, color: 'rgba(20,20,20,0.45)', marginTop: 4 }}>
            Arrastrá las filas para reordenar. Los cambios se guardan automáticamente.
          </p>
        </div>
        <Link href="/admin/blog/nuevo" style={{
          background: 'var(--black)', color: '#fff', borderRadius: 999, padding: '10px 22px',
          ...s, fontSize: 13, fontWeight: 500, letterSpacing: '0.05em', textDecoration: 'none',
          transition: 'background 0.2s',
        }}>+ Nueva Nota</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, ...s, fontSize: 14, color: 'rgba(20,20,20,0.3)' }}>Cargando...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: '#fff', borderRadius: 16 }}>
          <p style={{ ...s, fontSize: 16, color: 'rgba(20,20,20,0.4)', marginBottom: 16 }}>No hay notas aún.</p>
          <Link href="/admin/blog/nuevo" style={{ ...s, fontSize: 13, color: 'var(--black)', textDecoration: 'underline' }}>Creá la primera →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {posts.map((p, i) => (
            <div key={p.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDrop={onDrop}
              style={{
                background: '#fff', borderRadius: 12, padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: 'grab', border: '1px solid #f0f0f0',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <span style={{ color: 'rgba(20,20,20,0.2)', fontSize: 18, userSelect: 'none' }}>⠿</span>

              <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', background: '#f0f0f0', flexShrink: 0 }}>
                {p.coverImage && <img src={p.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ ...s, fontWeight: 500, fontSize: 15, color: 'var(--black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</p>
                <p style={{ ...s, fontWeight: 300, fontSize: 12, color: 'rgba(20,20,20,0.45)', marginTop: 2 }}>{p.date}</p>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Link href={`/admin/blog/${p.id}/editar`} style={{
                  ...s, fontSize: 12, fontWeight: 400, color: 'var(--black)',
                  border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px 14px',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}>Editar</Link>
                <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} style={{
                  ...s, fontSize: 12, fontWeight: 400, color: deleting === p.id ? '#ccc' : '#C8102E',
                  border: `1px solid ${deleting === p.id ? '#eee' : '#ffd0d0'}`, borderRadius: 6, padding: '6px 14px',
                  background: 'none', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {deleting === p.id ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
