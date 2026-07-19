'use client';
import { useState } from 'react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlogPost } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BlogForm from '@/components/admin/BlogForm';

export default function NuevaNota() {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (data: Omit<BlogPost, 'id' | 'createdAt'>) => {
    setSaving(true);
    try {
      const snap = await getDocs(collection(db, 'blogPosts'));
      const order = snap.size;
      await addDoc(collection(db, 'blogPosts'), {
        ...data,
        order,
        createdAt: serverTimestamp(),
      });
      router.push('/admin/blog');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la nota. Revisá la consola.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Link href="/admin/blog" style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'rgba(20,20,20,0.4)', textDecoration: 'none' }}>
          ← Entre Charlas
        </Link>
        <h1 style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 28, color: 'var(--black)', marginTop: 8 }}>
          Nueva Nota
        </h1>
      </div>
      <BlogForm onSave={handleSave} saving={saving} />
    </div>
  );
}
