'use client';
import { useState } from 'react';
import FadeIn from '@/components/FadeIn';
import ArrowButton from '@/components/ArrowButton';
import Toast from '@/components/Toast';
import Footer from '@/components/Footer';

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ nombre: '', email: '', telefono: '', mensaje: '' });
        showToast('¡Consulta enviada! Te contactamos a la brevedad.', true);
      } else {
        showToast('Hubo un error. Intentá de nuevo.', false);
      }
    } catch {
      showToast('Hubo un error. Intentá de nuevo.', false);
    } finally {
      setSending(false);
    }
  };

  const label: React.CSSProperties = {
    fontFamily: 'var(--font)', fontSize: 15, color: 'var(--black)', marginBottom: 12,
  };
  const inp: React.CSSProperties = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: '1px solid var(--black)', paddingBottom: 12,
    fontFamily: 'var(--font)', fontSize: 16, color: 'var(--black)', outline: 'none',
  };

  return (
    <main style={{ background: '#fff' }}>
      <div className="hr-section" style={{ maxWidth: 1440, margin: '0 auto', paddingTop: 200, paddingBottom: 96, paddingLeft: 79, paddingRight: 79 }}>
        <FadeIn>
          <h1 className="hr-contact-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 65, marginBottom: 64 }}>Contactanos!</h1>
        </FadeIn>

        <div className="hr-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
          <FadeIn direction="right">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
              <div>
                <p style={label}>Nombre y Apellido*</p>
                <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={inp} />
              </div>
              <div>
                <p style={label}>Email*</p>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} />
              </div>
              <div>
                <p style={label}>Teléfono*</p>
                <input required value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} style={inp} />
              </div>
              <div>
                <p style={label}>Mensaje*</p>
                <textarea required rows={1} value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} style={{ ...inp, resize: 'none' }} />
              </div>
              <div style={{ paddingTop: 16 }}>
                <ArrowButton type="submit" variant="dark" split>{sending ? 'Enviando...' : 'Enviar'}</ArrowButton>
              </div>
            </form>
          </FadeIn>
        </div>
      </div>

      {toast && <Toast message={toast.msg} ok={toast.ok} />}
      <style>{`
        @media (max-width: 900px) {
          .hr-section { padding: 120px 20px 64px !important; }
          .hr-contact-title { font-size: 42px !important; margin-bottom: 40px !important; }
          .hr-contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
      <Footer minimal />
    </main>
  );
}
