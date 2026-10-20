'use client';
import { useState, useRef } from 'react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { BlogPost } from '@/lib/types';

interface Props {
  initialData?: Partial<BlogPost>;
  postId?: string;
  onSave: (data: Omit<BlogPost, 'id' | 'createdAt'>) => Promise<void>;
  saving?: boolean;
}

const f: React.CSSProperties = { fontFamily: 'var(--font)' };

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#fafafa', border: '1px solid #eee',
  borderRadius: 8, padding: '10px 14px', fontSize: 14,
  fontFamily: 'var(--font)', color: 'var(--black)', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  ...f, fontSize: 11, fontWeight: 400, color: 'rgba(20,20,20,0.45)',
  letterSpacing: '0.08em', display: 'block', marginBottom: 6, textTransform: 'uppercase',
};

const sectionStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16,
  border: '1px solid #f0f0f0',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p style={{ ...f, fontSize: 16, fontWeight: 500, color: 'var(--black)', marginBottom: 20 }}>{children}</p>;
}

async function uploadFile(file: File, path: string, onProgress?: (n: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = storageRef(storage, path);
    const task = uploadBytesResumable(r, file);
    task.on('state_changed',
      snap => onProgress?.(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });
}

function isVideoUrl(url: string) { return /\.(mp4|webm|mov)$/i.test(url); }

const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 100 * 1024 * 1024;

function validateFile(file: File): string | null {
  const isVideo = /\.(mp4|webm|mov)$/i.test(file.name) || file.type.startsWith('video/');
  const limit = isVideo ? MAX_VIDEO : MAX_IMAGE;
  const label = isVideo ? '100MB' : '10MB';
  if (file.size > limit) return `"${file.name}" supera el límite de ${label} para ${isVideo ? 'videos' : 'imágenes'}.`;
  return null;
}

export default function BlogForm({ initialData, postId, onSave, saving }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [date, setDate] = useState(initialData?.date ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [externalUrl, setExternalUrl] = useState(initialData?.externalUrl ?? '');

  const [coverUrl, setCoverUrl] = useState(initialData?.coverImage ?? '');
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);

  const [gallery, setGallery] = useState<string[]>(initialData?.gallery ?? []);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState(0);
  const galleryInput = useRef<HTMLInputElement>(null);

  const [fileError, setFileError] = useState('');

  const folder = () => postId ?? `temp_${Date.now().toString().slice(-6)}`;

  const handleCoverUpload = async (file: File) => {
    setFileError('');
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setCoverUploading(true);
    setCoverProgress(0);
    const url = await uploadFile(file, `blog/${folder()}/cover_${file.name}`, setCoverProgress);
    setCoverUrl(url);
    setCoverUploading(false);
  };

  const handleGalleryUpload = async (files: FileList) => {
    setFileError('');
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const err = validateFile(file);
      if (err) { setFileError(err); if (galleryInput.current) galleryInput.current.value = ''; return; }
    }
    setGalleryUploading(true);
    const urls: string[] = [];
    let done = 0;
    for (const file of fileArray) {
      const url = await uploadFile(file, `blog/${folder()}/gallery_${Date.now()}_${file.name}`, p => {
        setGalleryProgress(Math.round((done * 100 + p) / files.length));
      });
      urls.push(url);
      done++;
    }
    setGallery(g => [...g, ...urls]);
    setGalleryUploading(false);
    setGalleryProgress(0);
    if (galleryInput.current) galleryInput.current.value = '';
  };

  const moveGallery = (i: number, dir: -1 | 1) => {
    const next = [...gallery];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setGallery(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      title, date, content, externalUrl,
      coverImage: coverUrl,
      gallery,
      order: initialData?.order ?? 999,
      updatedAt: null,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      <div style={sectionStyle}>
        <SectionTitle>Información general</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Título *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="Nombre de la persona o tema" />
          </div>
          <div>
            <label style={labelStyle}>Fecha</label>
            <input value={date} onChange={e => setDate(e.target.value)} style={inputStyle} placeholder="05 Mayo, 2026" />
          </div>
          <div>
            <label style={labelStyle}>Link a la nota completa (opcional)</label>
            <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} style={inputStyle} placeholder="https://..." />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <SectionTitle>Imagen principal</SectionTitle>
        {coverUrl && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', height: 160, background: '#f0f0f0' }}>
            <img src={coverUrl} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <label style={labelStyle}>Subir imagen</label>
        <input type="file" accept="image/*"
          onChange={e => { const file = e.target.files?.[0]; if (file) handleCoverUpload(file); }}
          style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }} />
        {coverUploading && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${coverProgress}%`, background: 'var(--black)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginTop: 4 }}>{coverProgress}%</p>
          </div>
        )}
        {!coverUrl && !coverUploading && (
          <p style={{ ...f, fontSize: 12, color: '#C8102E', marginTop: 6 }}>* Requerida para guardar</p>
        )}
        {fileError && <p style={{ ...f, fontSize: 12, color: '#C8102E', marginTop: 8, background: '#fff0f0', padding: '8px 12px', borderRadius: 6 }}>⚠ {fileError}</p>}
      </div>

      <div style={sectionStyle}>
        <SectionTitle>Contenido</SectionTitle>
        <textarea required rows={12} value={content} onChange={e => setContent(e.target.value)}
          style={{ ...inputStyle, resize: 'vertical', fontSize: 14, lineHeight: '22px' }}
          placeholder={"Para entrevistas: cada pregunta empieza con su número y la respuesta va en la línea de abajo. Dejá una línea en blanco entre preguntas.\n\n01. ¿Pregunta?\nRespuesta...\n\n02. ¿Otra pregunta?\nRespuesta..."} />
      </div>

      <div style={sectionStyle}>
        <SectionTitle>Galería</SectionTitle>
        <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginBottom: 16 }}>
          Acepta imágenes y videos (.mp4, .mov). Usá las flechas para reordenar.
        </p>

        {gallery.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
            {gallery.map((url, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1', background: '#f0f0f0' }}>
                {isVideoUrl(url)
                  ? <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  : <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                }
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.5)', padding: '4px 6px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button type="button" onClick={() => moveGallery(i, -1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>←</button>
                    <button type="button" onClick={() => moveGallery(i, 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>→</button>
                  </div>
                  <button type="button" onClick={() => setGallery(g => g.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <label style={labelStyle}>Agregar archivos (imágenes o videos)</label>
        <input ref={galleryInput} type="file" accept="image/*,video/*" multiple
          onChange={e => { if (e.target.files?.length) handleGalleryUpload(e.target.files); }}
          style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }} />
        {galleryUploading && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${galleryProgress}%`, background: 'var(--black)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginTop: 4 }}>Subiendo... {galleryProgress}%</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="submit" disabled={saving || coverUploading || galleryUploading || !coverUrl} style={{
          background: coverUrl ? 'var(--black)' : '#ccc',
          color: '#fff', border: 'none', borderRadius: 999, padding: '12px 32px',
          ...f, fontSize: 14, fontWeight: 500, letterSpacing: '0.05em',
          cursor: coverUrl ? 'pointer' : 'not-allowed',
          opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
        }}>
          {saving ? 'Guardando...' : 'Guardar nota'}
        </button>
      </div>
    </form>
  );
}
