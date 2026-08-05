'use client';
import { useState } from 'react';
import Image from 'next/image';

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/grupo_hughesyrienzi/' },
  { label: 'Linkedin', href: 'https://www.linkedin.com/company/grupo-hughes-rienzi/' },
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
          <Image src="/images/home/nuestrosproyectos.png" alt="Nuestros Proyectos" width={2000} height={351}
            style={{ width: '100%', height: 'auto' }} />
        </div>
      )}

      <div className="footer-inner" style={{
        background: '#fff', color: 'var(--black)',
        padding: '64px 64px 32px',
      }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', paddingTop: 48, borderTop: '1px solid rgba(20,20,20,0.12)' }}>

          {/* Row 1: GHR logo <-> Comercializa en exclusividad */}
          <div className="footer-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 32 }}>
            <Image src="/images/home/GHRlogo.svg" alt="GHR" width={170} height={73} style={{ objectFit: 'contain' }} />
            <div className="footer-comercializa" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 13, letterSpacing: '0.04em', color: 'var(--black)', whiteSpace: 'nowrap' }}>
                Comercializa en exclusividad:
              </p>
              <Image src="/images/home/logohughesfooter.svg" alt="Hughes & Rienzi Bienes Raíces" width={200} height={57} style={{ objectFit: 'contain' }} />
            </div>
          </div>

          {/* Row 2: contacto <-> newsletter <-> redes */}
          <div className="footer-bottom-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
            <div>
              <p style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--black)', lineHeight: '24px' }}>
                +598 2601 7836<br />
                +598 099 919 535<br />
                info@hr.com.uy
              </p>
              <p style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--black)', marginTop: 12, lineHeight: '24px' }}>
                Carlos F. Saez 6422, Oficina 101,<br />Montevideo, Uruguay
              </p>
            </div>

            <form onSubmit={handleSubscribe} style={{ textAlign: 'center', width: '100%', maxWidth: 280 }}>
              <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 14, color: 'var(--black)', marginBottom: 8 }}>
                Suscribite a nuestra newsletter
              </p>
              {subscribed ? (
                <p style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'var(--black)' }}>¡Gracias por suscribirte!</p>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--black)', borderRadius: 999, padding: '8px 8px 8px 20px' }}>
                  <input type="email" required placeholder="nombre@mail.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--black)', fontFamily: 'var(--font)', fontSize: 14, minWidth: 0 }} />
                  <button type="submit" aria-label="Suscribirse" style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--black)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0,
                  }}>
                    <Image src="/images/home/arrowwhite.png" alt="" width={12} height={12} />
                  </button>
                </div>
              )}
            </form>

            <div className="footer-socials" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font)', fontSize: 14, color: 'var(--black)' }}>
                  {s.label} <MiniArrow />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--black)', padding: '16px 24px' }}>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
          © Copyright Grupo Hughes &amp; Rienzi 2026
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hr-proyectos-section { padding: 48px 20px 0 !important; }
          .footer-inner { padding: 48px 20px 24px !important; }
          .footer-top-row { flex-direction: column !important; gap: 32px !important; align-items: flex-start !important; }
          .footer-comercializa { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .footer-bottom-row { flex-direction: column !important; gap: 32px !important; }
          .footer-bottom-row form { text-align: left !important; max-width: 100% !important; }
          .footer-socials { align-items: flex-start !important; }
        }
      `}</style>
    </footer>
  );
}
