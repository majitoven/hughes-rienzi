'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ArrowButton from './ArrowButton';

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/grupo_hughesyrienzi/' },
  { label: 'Linkedin', href: 'https://www.linkedin.com/company/grupo-hughes-rienzi/' },
  { label: 'Facebook', href: 'https://www.facebook.com/people/Grupo-HughesRienzi/61556897146673/' },
];

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/blog', label: 'Entre Charlas' },
  { href: '/contacto', label: 'Contacto' },
];

function MiniArrow() {
  return (
    <span style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid rgba(20,20,20,0.4)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Image src="/images/home/arrowblack.png" alt="" width={7} height={7} />
    </span>
  );
}

export default function Footer({ minimal = false }: { minimal?: boolean }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer style={{ background: '#fff', color: 'var(--black)' }}>
      {!minimal && (
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '80px 64px 0', textAlign: 'center' }} className="hr-proyectos-section">
          <div style={{ maxWidth: 1364, margin: '0 auto', borderTop: '1px solid rgba(20,20,20,0.15)', marginBottom: 64 }} />
          <h2 className="hr-footer-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 65, lineHeight: '67px', marginBottom: 40 }}>Nuestros Proyectos</h2>
          <Image src="/images/home/nuestrosproyectos.png" alt="Nuestros Proyectos" width={2000} height={351}
            style={{ width: '100%', height: 'auto' }} />
        </div>
      )}

      {!minimal && (
        <div className="footer-cta" style={{
          background: '#181717', color: '#fff', textAlign: 'center',
          maxWidth: 1300, margin: '64px auto 0', borderRadius: 24, padding: '80px 48px',
        }}>
          <h2 className="hr-footer-title" style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 65, lineHeight: '67px', marginBottom: 16 }}>
            Contactate con nosotros
          </h2>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 400, fontSize: 24, lineHeight: '28px', color: 'rgba(255,255,255,0.7)', marginBottom: 32 }}>
            Envianos tu consulta o hacenos llegar tus sugerencias.
          </p>
          <ArrowButton href="/contacto" variant="light" split>Enviar consulta</ArrowButton>
        </div>
      )}

      <div className="footer-inner" style={{
        background: '#fff', color: 'var(--black)',
        padding: '64px 64px 32px',
      }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div className="footer-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 32, paddingTop: 48, borderTop: '1px solid rgba(20,20,20,0.12)' }}>
            <div>
              <Image src="/images/home/GHRlogo.svg" alt="GHR" width={90} height={38} style={{ objectFit: 'contain', marginBottom: 20 }} />
              <p style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text-muted)', lineHeight: '24px' }}>
                +598 2601 7836<br />
                +598 099 919 535<br />
                info@hr.com.uy
              </p>
              <p style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text-muted)', marginTop: 12, lineHeight: '24px' }}>
                Carlos F. Saez 6422, Oficina 101,<br />Montevideo, Uruguay
              </p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text-muted)' }}>{l.label}</Link>
              ))}
            </nav>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 20 }} className="footer-right">
              <Image src="/images/home/logohughesfooter.svg" alt="Hughes & Rienzi Bienes Raíces" width={220} height={54} style={{ objectFit: 'contain' }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text-muted)' }}>
                    {s.label} <MiniArrow />
                  </a>
                ))}
              </div>

              <form onSubmit={handleSubscribe} style={{ textAlign: 'right', width: '100%', maxWidth: 280 }}>
                <p style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Suscribite a nuestra newsletter
                </p>
                {subscribed ? (
                  <p style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'var(--black)' }}>¡Gracias por suscribirte!</p>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(20,20,20,0.25)', paddingBottom: 6 }}>
                    <input type="email" required placeholder="nombre@mail.com" value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--black)', fontFamily: 'var(--font)', fontSize: 14 }} />
                    <button type="submit" aria-label="Suscribirse" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <MiniArrow />
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 48 }}>
            © Copyright Grupo Hughes &amp; Rienzi 2026
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hr-proyectos-section { padding: 48px 20px 0 !important; }
          .footer-inner { padding: 48px 20px 24px !important; }
          .footer-cta { padding: 48px 24px !important; margin-top: 40px !important; border-radius: 16px !important; }
          .hr-footer-title { font-size: 34px !important; line-height: 40px !important; }
          .footer-cols { grid-template-columns: 1fr !important; gap: 32px !important; }
          .footer-right { align-items: flex-start !important; }
          .footer-right form { text-align: left !important; }
        }
      `}</style>
    </footer>
  );
}
