'use client';
import { use, useEffect, useState } from 'react';
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/lib/types';
import Link from 'next/link';
import ProjectForm from '@/components/admin/ProjectForm';

export default function EditarProyecto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const snap = await getDoc(doc(db, 'projects', id));
      if (snap.exists()) {
        setProject({ id: snap.id, ...snap.data() } as Project);
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const handleSave = async (data: Omit<Project, 'id' | 'createdAt'>) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'projects', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar. Revisá la consola.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 80, textAlign: 'center', fontFamily: 'var(--font)', fontSize: 14, color: 'rgba(20,20,20,0.3)' }}>
      Cargando...
    </div>
  );

  if (!project) return (
    <div style={{ padding: 80, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font)', fontSize: 16, color: 'rgba(20,20,20,0.5)', marginBottom: 16 }}>
        Proyecto no encontrado.
      </p>
      <Link href="/admin/proyectos" style={{ color: 'var(--black)', fontFamily: 'var(--font)', fontSize: 14 }}>
        ← Volver a proyectos
      </Link>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href="/admin/proyectos" style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'rgba(20,20,20,0.4)', textDecoration: 'none' }}>
            ← Proyectos
          </Link>
          <h1 style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 28, color: 'var(--black)', marginTop: 8 }}>
            Editar Proyecto
          </h1>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 13, color: 'rgba(20,20,20,0.4)', marginTop: 4 }}>
            {project.title}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {saved && (
            <span style={{ fontFamily: 'var(--font)', fontSize: 13, color: '#2d7a2d' }}>
              ✓ Guardado
            </span>
          )}
          <Link href={`/proyectos/${id}`} target="_blank" style={{
            fontFamily: 'var(--font)', fontSize: 12, color: 'rgba(20,20,20,0.5)',
            border: '1px solid #e0e0e0', borderRadius: 6, padding: '7px 14px', textDecoration: 'none',
          }}>
            Ver en sitio ↗
          </Link>
        </div>
      </div>

      <ProjectForm
        initialData={project}
        projectId={id}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
