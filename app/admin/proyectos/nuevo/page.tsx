'use client';
import { useState } from 'react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProjectForm from '@/components/admin/ProjectForm';

export default function NuevoProyecto() {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (data: Omit<Project, 'id' | 'createdAt'>) => {
    setSaving(true);
    try {
      const snap = await getDocs(collection(db, 'projects'));
      const order = snap.size;
      await addDoc(collection(db, 'projects'), {
        ...data,
        order,
        createdAt: serverTimestamp(),
      });
      router.push('/admin/proyectos');
    } catch (err) {
      console.error(err);
      alert('Error al guardar el proyecto. Revisá la consola.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Link href="/admin/proyectos" style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'rgba(20,20,20,0.4)', textDecoration: 'none' }}>
          ← Proyectos
        </Link>
        <h1 style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 28, color: 'var(--black)', marginTop: 8 }}>
          Nuevo Proyecto
        </h1>
      </div>
      <ProjectForm onSave={handleSave} saving={saving} />
    </div>
  );
}
