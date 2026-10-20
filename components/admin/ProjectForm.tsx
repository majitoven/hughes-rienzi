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
  { id: '4', label: 'Terreno', value: '' },
  { id: '5', label: 'Unidades', value: '' },
];

const BLOCK_LABELS: Record<ProjectBlock['type'], string> = {
  text: 'Texto',
  images: 'Separador (2 fotos)',
  phrase: 'Frase',
  amenities: 'Texto + Amenities',
  gallery: 'Galería de fotos',
};

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
const MAX_PDF = 30 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    return file.size > MAX_PDF ? `"${file.name}" supera el límite de 30MB para PDFs.` : null;
  }
  const isVideo = /\.(mp4|webm|mov)$/i.test(file.name) || file.type.startsWith('video/');
  const limit = isVideo ? MAX_VIDEO : MAX_IMAGE;
  const label = isVideo ? '100MB' : '10MB';
  if (file.size > limit) return `"${file.name}" supera el límite de ${label} para ${isVideo ? 'videos' : 'imágenes'}.`;
  return null;
}

// Crops the transparent margin around a logo. Logos are sized by their file's proportions on the site,
// so leftover empty space makes a logo look smaller than the rest.
async function trimTransparent(file: File): Promise<File> {
  if (!/^image\/(png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width; canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let top = height, left = width, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 20) {
        if (x < left) left = x; if (x > right) right = x;
        if (y < top) top = y; if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0 || (left === 0 && top === 0 && right === width - 1 && bottom === height - 1)) return file;
  const out = document.createElement('canvas');
  out.width = right - left + 1; out.height = bottom - top + 1;
  out.getContext('2d')!.drawImage(canvas, left, top, out.width, out.height, 0, 0, out.width, out.height);
  const blob = await new Promise<Blob | null>(res => out.toBlob(res, 'image/png'));
  return blob ? new File([blob], file.name.replace(/\.\w+$/, '.png'), { type: 'image/png' }) : file;
}

let uid = 0;
const nextId = () => `b${Date.now()}_${uid++}`;

export default function ProjectForm({ initialData, projectId, onSave, saving }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? '');
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [status, setStatus] = useState(initialData?.status ?? '');
  const [externalUrl, setExternalUrl] = useState(initialData?.externalUrl ?? '');
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

  const [brochureUrl, setBrochureUrl] = useState(initialData?.brochureUrl ?? '');
  const [brochureUploading, setBrochureUploading] = useState(false);
  const [brochureProgress, setBrochureProgress] = useState(0);

  const [mapsUrl, setMapsUrl] = useState(initialData?.mapsUrl ?? '');
  const [mapImage, setMapImage] = useState(initialData?.mapImage ?? '');
  const [mapUploading, setMapUploading] = useState(false);
  const [mapProgress, setMapProgress] = useState(0);

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
    const trimmed = await trimTransparent(file);
    const url = await uploadFile(trimmed, `projects/${folder()}/logo_${trimmed.name}`, setLogoProgress);
    setLogoUrl(url);
    setLogoUploading(false);
  };

  const handleBrochureUpload = async (file: File) => {
    setFileError('');
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setBrochureUploading(true);
    setBrochureProgress(0);
    const url = await uploadFile(file, `projects/${folder()}/brochure_${file.name}`, setBrochureProgress);
    setBrochureUrl(url);
    setBrochureUploading(false);
  };

  const handleMapUpload = async (file: File) => {
    setFileError('');
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setMapUploading(true);
    setMapProgress(0);
    const url = await uploadFile(file, `projects/${folder()}/map_${file.name}`, setMapProgress);
    setMapImage(url);
    setMapUploading(false);
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
  const addPhraseBlock = () => setBlocks(b => [...b, { id: nextId(), type: 'phrase', headline: '' }]);
  const addAmenitiesBlock = () => setBlocks(b => [...b, { id: nextId(), type: 'amenities', headline: '', body: '', amenities: [''] }]);
  const addGalleryBlock = () => setBlocks(b => [...b, { id: nextId(), type: 'gallery', images: [] }]);
  const removeBlock = (i: number) => setBlocks(b => b.filter((_, idx) => idx !== i));
  const updateBlock = (i: number, patch: Partial<ProjectBlock>) =>
    setBlocks(b => b.map((x, idx) => idx === i ? { ...x, ...patch } : x));

  const addAmenityItem = (i: number) => updateBlock(i, { amenities: [...(blocks[i].amenities ?? []), ''] });
  const removeAmenityItem = (i: number, itemIdx: number) =>
    updateBlock(i, { amenities: (blocks[i].amenities ?? []).filter((_, j) => j !== itemIdx) });
  const updateAmenityItem = (i: number, itemIdx: number, val: string) =>
    updateBlock(i, { amenities: (blocks[i].amenities ?? []).map((x, j) => j === itemIdx ? val : x) });

  const handleBlockImageUpload = async (i: number, files: FileList) => {
    setFileError('');
    const block = blocks[i];
    const existing = block.images ?? [];
    const fileArray = block.type === 'gallery'
      ? Array.from(files)
      : Array.from(files).slice(0, Math.max(0, 2 - existing.length));
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
    if (blocks.some(b => b.type === 'images' && b.images?.length === 1)) {
      setFileError('Los bloques "Separador" llevan 2 fotos. Subí la segunda o eliminá el bloque.');
      return;
    }
    const cleanFacts = facts.filter(fct => fct.label.trim() && fct.value.trim());
    const cleanBlocks = blocks
      .map(b => b.type === 'amenities' ? { ...b, amenities: (b.amenities ?? []).filter(a => a.trim()) } : b)
      .filter(b => {
        if (b.type === 'text') return !!(b.headline?.trim() || b.body?.trim());
        if (b.type === 'phrase') return !!b.headline?.trim();
        if (b.type === 'amenities') return (b.amenities?.length ?? 0) > 0;
        return (b.images?.length ?? 0) > 0;
      });

    await onSave({
      title, subtitle, location, status, externalUrl, brochureUrl, mapsUrl, mapImage, featured,
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
          <div>
            <label style={labelStyle}>Link al sitio web del proyecto (opcional)</label>
            <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} style={inputStyle} placeholder="https://..." />
          </div>
          <div>
            <label style={labelStyle}>Link de Google Maps (botón &quot;Ver en Google Maps&quot;)</label>
            <input value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} style={inputStyle} placeholder="https://maps.app.goo.gl/..." />
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
          Foto o video grande de fondo en la parte superior de la página del proyecto. Si no se sube, se usa la imagen de portada.
        </p>
        {heroUrl && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', height: 160, background: '#f0f0f0' }}>
            {isVideoUrl(heroUrl)
              ? <video src={heroUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
              : <img src={heroUrl} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            }
          </div>
        )}
        <label style={labelStyle}>Subir imagen o video</label>
        <input type="file" accept="image/*,video/*"
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
        <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginBottom: 8 }}>
          Isotipo en blanco sobre transparente (PNG). Se superpone sobre las fotos en Home, el listado de Proyectos y el hero de la ficha del proyecto. Si no se sube, se muestra el título como texto.
        </p>
        <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginBottom: 16, background: '#fafafa', border: '1px solid #eee', borderRadius: 6, padding: '8px 12px' }}>
          💡 Subí el logo en PNG con fondo transparente: el margen vacío alrededor se recorta automáticamente al subirlo, así todos los logos se ven del mismo tamaño en el sitio.
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

      {/* Brochure */}
      <div style={sectionStyle}>
        <SectionTitle>Brochure (PDF)</SectionTitle>
        <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginBottom: 16 }}>
          Si se sube, aparece el botón &quot;Descargar brochure&quot; debajo del primer bloque de texto. Máximo 30MB.
        </p>
        {brochureUrl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <a href={brochureUrl} target="_blank" rel="noopener noreferrer" style={{ ...f, fontSize: 13, color: 'var(--black)', textDecoration: 'underline' }}>Ver brochure actual</a>
            <button type="button" onClick={() => setBrochureUrl('')} style={{ background: 'none', border: 'none', color: '#C8102E', cursor: 'pointer', fontSize: 12, ...f }}>Quitar</button>
          </div>
        )}
        <label style={labelStyle}>Subir PDF</label>
        <input type="file" accept="application/pdf"
          onChange={e => { const file = e.target.files?.[0]; if (file) handleBrochureUpload(file); }}
          style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }} />
        {brochureUploading && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${brochureProgress}%`, background: 'var(--black)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginTop: 4 }}>{brochureProgress}%</p>
          </div>
        )}
      </div>

      {/* Map image */}
      <div style={sectionStyle}>
        <SectionTitle>Mapa de ubicación (opcional)</SectionTitle>
        <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginBottom: 16 }}>
          Imagen del mapa que se muestra al final de la página, arriba del botón &quot;Ver en Google Maps&quot;. Formato apaisado (aprox. 920 × 335).
        </p>
        {mapImage && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', height: 140, background: '#f0f0f0', position: 'relative' }}>
            <img src={mapImage} alt="Mapa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => setMapImage('')} style={{
              position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none',
              color: '#fff', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 12,
            }}>✕</button>
          </div>
        )}
        <label style={labelStyle}>Subir imagen</label>
        <input type="file" accept="image/*"
          onChange={e => { const file = e.target.files?.[0]; if (file) handleMapUpload(file); }}
          style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }} />
        {mapUploading && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${mapProgress}%`, background: 'var(--black)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <p style={{ ...f, fontSize: 12, color: 'rgba(20,20,20,0.4)', marginTop: 4 }}>{mapProgress}%</p>
          </div>
        )}
      </div>

      {/* Facts (ficha técnica) */}
      <div style={sectionStyle}>
        <SectionTitle>Ficha técnica</SectionTitle>
        <p style={{ ...f, fontSize: 11, color: 'rgba(20,20,20,0.3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>⠿</span> Arrastrá para cambiar el orden. Se muestran en blanco sobre la parte inferior del hero (Ubicación, Estado, Año, etc.).
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
          Armá la página en el orden que quieras: texto (título + párrafos), separador (2 fotos finas lado a lado), texto + amenities (párrafos a la izquierda, lista a la derecha y botón &quot;Visitar Sitio Web&quot;), frase corta y galería de fotos (carrusel; al hacer click se agrandan). Acepta imágenes y videos (.mp4, .mov).
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
                    {BLOCK_LABELS[block.type]}
                  </span>
                </div>
                <button type="button" onClick={() => removeBlock(i)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 15 }}>✕</button>
              </div>

              {block.type === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    placeholder="Título (ej. El arte de vivir en armonía con la naturaleza.)"
                    value={block.headline ?? ''}
                    onChange={e => updateBlock(i, { headline: e.target.value })}
                    style={{ ...inputStyle, fontWeight: 500 }}
                  />
                  <input
                    placeholder="Subtítulo corto debajo del título (opcional, va en la misma columna)"
                    value={block.subtitle ?? ''}
                    onChange={e => updateBlock(i, { subtitle: e.target.value })}
                    style={inputStyle}
                  />
                  <textarea
                    placeholder="Párrafos de la columna derecha (dejá una línea en blanco entre párrafos)"
                    value={block.body ?? ''}
                    onChange={e => updateBlock(i, { body: e.target.value })}
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical', fontSize: 13, lineHeight: '20px' }}
                  />
                </div>
              )}

              {block.type === 'phrase' && (
                <div>
                  <input
                    placeholder="Frase corta (ej. Vista al lago. Vista al bosque. Vista a la vida que estás buscando.)"
                    value={block.headline ?? ''}
                    onChange={e => updateBlock(i, { headline: e.target.value })}
                    style={{ ...inputStyle, fontWeight: 500 }}
                  />
                  <p style={{ ...f, fontSize: 11, color: 'rgba(20,20,20,0.3)', marginTop: 8 }}>
                    Frase destacada, sin párrafo debajo.
                  </p>
                </div>
              )}

              {block.type === 'amenities' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    <input
                      placeholder="Título columna izquierda (ej. Tu propio ecosistema, enfocado en el disfrute.)"
                      value={block.headline ?? ''}
                      onChange={e => updateBlock(i, { headline: e.target.value })}
                      style={{ ...inputStyle, fontWeight: 500 }}
                    />
                    <textarea
                      placeholder="Párrafos de la columna izquierda (dejá una línea en blanco entre párrafos)"
                      value={block.body ?? ''}
                      onChange={e => updateBlock(i, { body: e.target.value })}
                      rows={5}
                      style={{ ...inputStyle, resize: 'vertical', fontSize: 13, lineHeight: '20px' }}
                    />
                    <p style={{ ...f, fontSize: 11, color: 'rgba(20,20,20,0.3)' }}>
                      Debajo de los párrafos va el botón &quot;Visitar Sitio Web&quot; (si el proyecto tiene link). Las amenities van en la columna derecha.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(block.amenities ?? []).map((item, itemIdx) => (
                      <div key={itemIdx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          placeholder="Ej. Piscina abierta con solárium"
                          value={item}
                          onChange={e => updateAmenityItem(i, itemIdx, e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button type="button" onClick={() => removeAmenityItem(i, itemIdx)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 15, flexShrink: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addAmenityItem(i)} style={{
                    marginTop: 10, background: 'none', border: '1px dashed #ddd', borderRadius: 8, padding: '8px 16px',
                    ...f, fontSize: 12, color: 'rgba(20,20,20,0.45)', cursor: 'pointer', width: '100%',
                  }}>+ Agregar amenity</button>
                </div>
              )}

              {(block.type === 'images' || block.type === 'gallery') && (
                <div>
                  <p style={{ ...f, fontSize: 11, color: 'rgba(20,20,20,0.3)', marginBottom: 10 }}>
                    {block.type === 'gallery'
                      ? 'Subí todas las fotos que quieras. Se muestran de a 3 en un carrusel y al hacer click se agrandan.'
                      : 'Subí 2 fotos. Se muestran finas y lado a lado, como separador entre secciones.'}
                  </p>
                  {(block.images?.length ?? 0) > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(block.images!.length, block.type === 'gallery' ? 4 : 2)}, 1fr)`,
                      gap: 10, marginBottom: 10,
                    }}>
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
                  {(block.type === 'gallery' || (block.images?.length ?? 0) < 2) && (
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

        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button type="button" onClick={addTextBlock} style={{
            flex: '1 1 30%', background: 'none', border: '1px dashed #ddd', borderRadius: 8, padding: '10px 20px',
            ...f, fontSize: 13, color: 'rgba(20,20,20,0.45)', cursor: 'pointer',
          }}>+ Agregar texto</button>
          <button type="button" onClick={addImagesBlock} style={{
            flex: '1 1 30%', background: 'none', border: '1px dashed #ddd', borderRadius: 8, padding: '10px 20px',
            ...f, fontSize: 13, color: 'rgba(20,20,20,0.45)', cursor: 'pointer',
          }}>+ Agregar separador (2 fotos)</button>
          <button type="button" onClick={addPhraseBlock} style={{
            flex: '1 1 30%', background: 'none', border: '1px dashed #ddd', borderRadius: 8, padding: '10px 20px',
            ...f, fontSize: 13, color: 'rgba(20,20,20,0.45)', cursor: 'pointer',
          }}>+ Agregar frase</button>
          <button type="button" onClick={addAmenitiesBlock} style={{
            flex: '1 1 30%', background: 'none', border: '1px dashed #ddd', borderRadius: 8, padding: '10px 20px',
            ...f, fontSize: 13, color: 'rgba(20,20,20,0.45)', cursor: 'pointer',
          }}>+ Agregar texto + amenities</button>
          <button type="button" onClick={addGalleryBlock} style={{
            flex: '1 1 30%', background: 'none', border: '1px dashed #ddd', borderRadius: 8, padding: '10px 20px',
            ...f, fontSize: 13, color: 'rgba(20,20,20,0.45)', cursor: 'pointer',
          }}>+ Agregar galería de fotos</button>
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="submit" disabled={saving || coverUploading || heroUploading || logoUploading || brochureUploading || mapUploading || !!blockUploading || !coverUrl} style={{
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
