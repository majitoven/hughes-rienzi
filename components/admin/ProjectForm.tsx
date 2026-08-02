'use client';
import { useState, useRef } from 'react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Project, ProjectFact, ProjectBlock } from '@/lib/types';

interface Props {
  initialData?: Partial<Project>;
  projectId?: string;
  onSave: (data: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  saving?: boolean;
}

const TEMPLATE_FACTS: ProjectFact[] = [
  { id: '1', label: 'Ubicación', value: '' },
  { id: '2', label: 'Estado', value: '' },
  { id: '3', label: 'Año', value: '' },
  { id: '4', label: 'Cantidad de unidades', value: '' },
  { id: '5', label: 'Tipología', value: '' },
  { id: '6', label: 'Terreno', value: '' },
];

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

let uid = 0;
const nextId = () => `b${Date.now()}_${uid++}`;

export default function ProjectForm({ initialData, projectId, onSave, saving }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? '');
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [status, setStatus] = useState(initialData?.status ?? '');
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [featuredSize, setFeaturedSize] = useState<'large' | 'small'>(initialData?.featuredSize ?? 'small');

  const [coverUrl, setCoverUrl] = useState(initialData?.coverImage ?? '');
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);

  const [heroUrl, setHeroUrl] = useState(initialData?.heroImage ?? '');
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);

  const [logoUrl, setLogoUrl] = useState(initialData?.logoImage ?? '');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);

  const [fileError, setFileError] = useState('');

  const folder = () => projectId ?? `temp_${Date.now().toString().slice(-6)}`;

  const handleCoverUpload = async (file: File) => {
    setFileError('');
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setCoverUploading(true);
    setCoverProgress(0);
    const url = await uploadFile(file, `projects/${folder()}/cover_${file.name}`, setCoverProgress);
    setCoverUrl(url);
    setCoverUploading(false);
  };

  const handleHeroUpload = async (file: File) => {
    setFileError('');
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setHeroUploading(true);
    setHeroProgress(0);
    const url = await uploadFile(file, `projects/${folder()}/hero_${file.name}`, setHeroProgress);
    setHeroUrl(url);
    setHeroUploading(false);
  };

  const handleLogoUpload = async (file: File) => {
    setFileError('');
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setLogoUploading(true);
    setLogoProgress(0);
    const url = await uploadFile(file, `projects/${folder()}/logo_${file.name}`, setLogoProgress);
    setLogoUrl(url);
    setLogoUploading(false);
  };

  // Facts (ficha técnica)
  const [factsMode, setFactsMode] = useState<'template' | 'custom'>(
    initialData?.facts?.length ? 'custom' : 'template'
  );
  const [facts, setFacts] = useState<ProjectFact[]>(
    initialData?.facts?.length ? initialData.facts : TEMPLATE_FACTS.map(x => ({ ...x }))
  );

  const switchFactsMode = (mode: 'template' | 'custom') => {
    setFacts(mode === 'template' ? TEMPLATE_FACTS.map(x => ({ ...x })) : []);
    setFactsMode(mode);
  };
  const addFact = () => setFacts(fs => [...fs, { id: nextId(), label: '', value: '' }]);
  const removeFact = (i: number) => setFacts(fs => fs.filter((_, idx) => idx !== i));
  const updateFact = (i: number, key: keyof ProjectFact, val: string) =>
    setFacts(fs => fs.map((x, idx) => idx === i ? { ...x, [key]: val } : x));

  const dragFactIndex = useRef<number | null>(null);
  const onFactDragStart = (i: number) => { dragFactIndex.current = i; };
  const onFactDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragFactIndex.current === null || dragFactIndex.current === i) return;
    const next = [...facts];
    const [moved] = next.splice(dragFactIndex.current, 1);
    next.splice(i, 0, moved);
    dragFactIndex.current = i;
    setFacts(next);
  };
  const onFactDrop = () => { dragFactIndex.current = null; };

  // Content blocks
  const [blocks, setBlocks] = useState<ProjectBlock[]>(initialData?.content ?? []);
  const [blockUploading, setBlockUploading] = useState<string | null>(null);

  const addTextBlock = () => setBlocks(b => [...b, { id: nextId(), type: 'text', headline: '', body: '' }]);
  const addImagesBlock = () => setBlocks(b => [...b, { id: nextId(), type: 'images', images: [] }]);
  const removeBlock = (i: number) => setBlocks(b => b.filter((_, idx) => idx !== i));
  const updateBlock = (i: number, patch: Partial<ProjectBlock>) =>
    setBlocks(b => b.map((x, idx) => idx === i ? { ...x, ...patch } : x));

  const handleBlockImageUpload = async (i: number, files: FileList) => {
    setFileError('');
    const block = blocks[i];
    const existing = block.images ?? [];
    const room = Math.max(0, 2 - existing.length);
    const fileArray = Array.from(files).slice(0, room);
    for (const file of fileArray) {
      const err = validateFile(file);
      if (err) { setFileError(err); return; }
    }
    setBlockUploading(block.id);
    const urls: string[] = [];
    for (const file of fileArray) {
      const url = await uploadFile(file, `projects/${folder()}/block_${block.id}_${Date.now()}_${file.name}`);
      urls.push(url);
    }
    updateBlock(i, { images: [...existing, ...urls] });
    setBlockUploading(null);
  };

  const removeBlockImage = (i: number, imgIdx: number) => {
    const block = blocks[i];
    updateBlock(i, { images: (block.images ?? []).filter((_, j) => j !== imgIdx) });
  };

  const dragBlockIndex = useRef<number | null>(null);
  const onBlockDragStart = (i: number) => { dragBlockIndex.current = i; };
  const onBlockDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragBlockIndex.current === null || dragBlockIndex.current === i) return;
    const next = [...blocks];
    const [moved] = next.splice(dragBlockIndex.current, 1);
    next.splice(i, 0, moved);
    dragBlockIndex.current = i;
    setBlocks(next);
  };
  const onBlockDrop = () => { dragBlockIndex.current = null; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFacts = facts.filter(fct => fct.label.trim() && fct.value.trim());
    const cleanBlocks = blocks.filter(b => b.type === 'text' ? (b.headline?.trim() || b.body?.trim()) : (b.images?.length ?? 0) > 0);

    await onSave({
      title, subtitle, location, status, featured,
      ...(featured ? { featuredSize } : {}),
      coverImage: coverUrl,
      heroImage: heroUrl,
      logoImage: logoUrl,
      facts: cleanFacts,
      content: cleanBlocks,
      order: initialData?.order ?? 999,
      updatedAt: null,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Basic info */}
      <div style={sectionStyle}>
        <SectionTitle>Información general</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Título *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="ONA" />
          </div>
          <div>
            <label style={labelStyle}>Subtítulo</label>
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} style={inputStyle} placeholder="Lake Village" />
          </div>
          <div>
            <label style={labelStyle}>Ubicación (para cards y tarjeta destacada)</label>
            <input value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} placeholder="Lago La Caleta" />
          </div>
          <div>
            <label style={labelStyle}>Estado (define el tab del listado de Proyectos)</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Sin definir</option>
              <option value="Lanzamiento">Lanzamiento</option>
              <option value="Construcción">Construcción</option>
              <option value="Estrenar">Estrenar</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
            <input type="checkbox" id="featured" checked={featured} onChange={e => setFeatured(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--black)', cursor: 'pointer' }} />
            <label htmlFor="featured" style={{ ...f, fontSize: 13, color: 'var(--black)', cursor: 'pointer' }}>
              Mostrar en Proyectos Destacados (home)
            </label>
          </div>
          {featured && (
            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                Tamaño en destacados
                <span title="Los proyectos 'Grande' se muestran a ancho completo (como ONA en el home). Los 'Chico' se agrupan de a 2 en una grilla entre los grandes, según el orden."
                  style={{
                    width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(20,20,20,0.35)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: 'rgba(20,20,20,0.5)', cursor: 'help', textTransform: 'none',
                  }}>i</span>
              </label>
              <select value={featuredSize} onChange={e => setFeaturedSize(e.target.value as 'large' | 'small')} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="small">Chico (grilla 2x2)</option>
                <option value="large">Grande (ancho completo)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Cover image */}
      <div style={sectionStyle}>
        <SectionTitle>Imagen de portada</SectionTitle>
        <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginBottom: 16 }}>
          Se usa en las tarjetas de Home y del listado de Proyectos.
        </p>
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
      </div>

      {/* Hero image */}
      <div style={sectionStyle}>
        <SectionTitle>Imagen de hero (ficha del proyecto)</SectionTitle>
        <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginBottom: 16 }}>
          Foto grande de fondo en la parte superior de la página del proyecto. Si no se sube, se usa la imagen de portada.
        </p>
        {heroUrl && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', height: 160, background: '#f0f0f0' }}>
            <img src={heroUrl} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <label style={labelStyle}>Subir imagen</label>
        <input type="file" accept="image/*"
          onChange={e => { const file = e.target.files?.[0]; if (file) handleHeroUpload(file); }}
          style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }} />
        {heroUploading && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${heroProgress}%`, background: 'var(--black)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginTop: 4 }}>{heroProgress}%</p>
          </div>
        )}
      </div>

      {/* Logo image */}
      <div style={sectionStyle}>
        <SectionTitle>Logo del proyecto (blanco)</SectionTitle>
        <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginBottom: 16 }}>
          Isotipo en blanco sobre transparente. Se superpone sobre las fotos en Home, el listado de Proyectos y el hero de la ficha del proyecto. Si no se sube, se muestra el título como texto.
        </p>
        {logoUrl && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', height: 120, background: '#181717', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
        )}
        <label style={labelStyle}>Subir imagen</label>
        <input type="file" accept="image/*"
          onChange={e => { const file = e.target.files?.[0]; if (file) handleLogoUpload(file); }}
          style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }} />
        {logoUploading && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${logoProgress}%`, background: 'var(--black)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginTop: 4 }}>{logoProgress}%</p>
          </div>
        )}
        {fileError && <p style={{ ...f, fontSize: 12, color: '#C8102E', marginTop: 8, background: '#fff0f0', padding: '8px 12px', borderRadius: 6 }}>⚠ {fileError}</p>}
      </div>

      {/* Facts (ficha técnica) */}
      <div style={sectionStyle}>
        <SectionTitle>Ficha técnica</SectionTitle>
        <p style={{ ...f, fontSize: 11, color: 'rgba(20,20,20,0.3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>⠿</span> Arrastrá para cambiar el orden. Se muestran como fila de datos (Ubicación, Estado, Año, etc.) debajo del título.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['template', 'custom'] as const).map(m => (
            <button key={m} type="button" onClick={() => switchFactsMode(m)} style={{
              ...f, fontSize: 12, fontWeight: 400, padding: '7px 18px', borderRadius: 999, cursor: 'pointer', transition: 'all 0.2s',
              background: factsMode === m ? 'var(--black)' : 'transparent',
              color: factsMode === m ? '#fff' : 'rgba(20,20,20,0.5)',
              border: `1px solid ${factsMode === m ? 'var(--black)' : '#ddd'}`,
            }}>
              {m === 'template' ? 'Usar plantilla' : 'Personalizada'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {facts.map((fct, i) => (
            <div key={fct.id}
              draggable
              onDragStart={() => onFactDragStart(i)}
              onDragOver={e => onFactDragOver(e, i)}
              onDrop={onFactDrop}
              style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'grab' }}>
              <span style={{ color: 'rgba(20,20,20,0.2)', fontSize: 16, userSelect: 'none' }}>⠿</span>
              <input
                placeholder="Etiqueta (ej. Ubicación)"
                value={fct.label}
                onChange={e => updateFact(i, 'label', e.target.value)}
                style={{ ...inputStyle, flex: 1, fontWeight: 500 }}
                readOnly={factsMode === 'template'}
              />
              <input
                placeholder="Valor (ej. Lago La Caleta)"
                value={fct.value}
                onChange={e => updateFact(i, 'value', e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              {factsMode === 'custom' && (
                <button type="button" onClick={() => removeFact(i)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 15, flexShrink: 0 }}>✕</button>
              )}
            </div>
          ))}
        </div>

        {factsMode === 'custom' && (
          <button type="button" onClick={addFact} style={{
            marginTop: 12, background: 'none', border: '1px dashed #ddd', borderRadius: 8, padding: '10px 20px',
            ...f, fontSize: 13, color: 'rgba(20,20,20,0.45)', cursor: 'pointer', width: '100%',
          }}>+ Agregar dato</button>
        )}
      </div>

      {/* Content blocks */}
      <div style={sectionStyle}>
        <SectionTitle>Contenido de la página</SectionTitle>
        <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginBottom: 8 }}>
          Armá la página en el orden que quieras: bloques de texto (título + párrafos) y bloques de imágenes (1 = foto completa, 2 = lado a lado). Acepta imágenes y videos (.mp4, .mov).
        </p>
        <p style={{ ...f, fontSize: 11, color: 'rgba(20,20,20,0.3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>⠿</span> Arrastrá los bloques para cambiar el orden
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {blocks.map((block, i) => (
            <div key={block.id}
              draggable
              onDragStart={() => onBlockDragStart(i)}
              onDragOver={e => onBlockDragOver(e, i)}
              onDrop={onBlockDrop}
              style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 16, background: '#fafafa', cursor: 'grab' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'rgba(20,20,20,0.2)', fontSize: 16, userSelect: 'none' }}>⠿</span>
                  <span style={{ ...f, fontSize: 11, fontWeight: 500, color: 'rgba(20,20,20,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {block.type === 'text' ? 'Texto' : 'Imágenes'}
                  </span>
                </div>
                <button type="button" onClick={() => removeBlock(i)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 15 }}>✕</button>
              </div>

              {block.type === 'text' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    placeholder="Título (ej. El arte de vivir en armonía con la naturaleza.)"
                    value={block.headline ?? ''}
                    onChange={e => updateBlock(i, { headline: e.target.value })}
                    style={{ ...inputStyle, fontWeight: 500 }}
                  />
                  <textarea
                    placeholder="Párrafos (dejá una línea en blanco entre párrafos)"
                    value={block.body ?? ''}
                    onChange={e => updateBlock(i, { body: e.target.value })}
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical', fontSize: 13, lineHeight: '20px' }}
                  />
                </div>
              ) : (
                <div>
                  {(block.images?.length ?? 0) > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${block.images!.length}, 1fr)`, gap: 10, marginBottom: 10 }}>
                      {block.images!.map((url, imgIdx) => (
                        <div key={imgIdx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3', background: '#f0f0f0' }}>
                          {isVideoUrl(url)
                            ? <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                            : <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          }
                          <button type="button" onClick={() => removeBlockImage(i, imgIdx)} style={{
                            position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none',
                            color: '#fff', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 12,
                          }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(block.images?.length ?? 0) < 2 && (
                    <input type="file" accept="image/*,video/*" multiple
                      onChange={e => { if (e.target.files?.length) handleBlockImageUpload(i, e.target.files); }}
                      style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer', fontSize: 12 }} />
                  )}
                  {blockUploading === block.id && (
                    <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginTop: 6 }}>Subiendo...</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {fileError && <p style={{ ...f, fontSize: 12, color: '#C8102E', marginTop: 12, background: '#fff0f0', padding: '8px 12px', borderRadius: 6 }}>⚠ {fileError}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="button" onClick={addTextBlock} style={{
            flex: 1, background: 'none', border: '1px dashed #ddd', borderRadius: 8, padding: '10px 20px',
            ...f, fontSize: 13, color: 'rgba(20,20,20,0.45)', cursor: 'pointer',
          }}>+ Agregar texto</button>
          <button type="button" onClick={addImagesBlock} style={{
            flex: 1, background: 'none', border: '1px dashed #ddd', borderRadius: 8, padding: '10px 20px',
            ...f, fontSize: 13, color: 'rgba(20,20,20,0.45)', cursor: 'pointer',
          }}>+ Agregar imágenes</button>
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="submit" disabled={saving || coverUploading || heroUploading || !coverUrl} style={{
          background: coverUrl ? 'var(--black)' : '#ccc',
          color: '#fff', border: 'none', borderRadius: 999, padding: '12px 32px',
          ...f, fontSize: 14, fontWeight: 500, letterSpacing: '0.05em',
          cursor: coverUrl ? 'pointer' : 'not-allowed',
          opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
        }}>
          {saving ? 'Guardando...' : 'Guardar proyecto'}
        </button>
      </div>
    </form>
  );
}
