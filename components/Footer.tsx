'use client';
import { useState } from 'react';
import Image from 'next/image';
import { whatsappUrl } from '@/lib/contact';

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/grupo_hughesyrienzi/' },
  { label: 'Linkedin', href: 'https://www.linkedin.com/company/grupo-hughes-rienzi/' },
  { label: 'WhatsApp', href: whatsappUrl() },
];

const ADDRESS = 'Carlos F. Saez 6422, Montevideo, Uruguay';

function MiniArrow() {
  return (
    <span className="hr-footer-social-arrow" style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid rgba(20,20,20,0.4)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      transition: 'transform 0.3s ease, background 0.3s ease, border-color 0.3s ease' }}>
      <Image src="/images/home/arrowblack.png" alt="" width={7} height={7} className="hr-footer-social-arrow-img" style={{ transition: 'filter 0.3s ease' }} />
    </span>
  );
}

export default function Footer({ minimal = false }: { minimal?: boolean }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    setSubscribeError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        setSubscribeError('Hubo un error. Intentá de nuevo.');
      }
    } catch {
      setSubscribeError('Hubo un error. Intentá de nuevo.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer style={{ background: '#fff', color: 'var(--black)' }}>
      {!minimal && (
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '80px 64px 0', textAlign: 'center' }} className="hr-proyectos-section">
          <div style={{ maxWidth: 1364, margin: '0 auto', borderTop: '1px solid rgba(20,20,20,1)', marginBottom: 64 }} />
          <Image src="/images/home/nuestrosproyectos.png" alt="Nuestros Proyectos" width={2000} height={351}
            style={{ width: '100%', height: 'auto' }} />
        </div>
      )}

      <div className="footer-inner" style={{
        background: '#fff', color: 'var(--black)',
        padding: '64px 64px 32px',
      }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', paddingTop: 48, borderTop: '1px solid rgba(20,20,20,1)' }}>

          {/* Row 1: GHR logo <-> H&R Bienes Raíces */}
          <div className="footer-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 32 }}>
            <Image src="/images/home/GHRlogo.svg" alt="GHR" width={170} height={73} className="footer-ghr" style={{ objectFit: 'contain' }} />
            <a href="https://hr.com.uy/" target="_blank" rel="noopener noreferrer" className="footer-comercializa hr-footer-contact"
              aria-label="Hughes & Rienzi Bienes Raíces" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <Image src="/images/home/logohughesfooter.svg" alt="Hughes & Rienzi Bienes Raíces" width={200} height={57} style={{ objectFit: 'contain' }} />
            </a>
          </div>

          {/* Row 2: contacto <-> newsletter <-> redes */}
          <div className="footer-bottom-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: 32 }}>
            <div>
              <p style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--black)', lineHeight: '24px' }}>
                <a href="tel:+59826017836" className="hr-footer-contact">+598 2601 7836</a><br />
                <a href="tel:+59899919535" className="hr-footer-contact">+598 099 919 535</a><br />
                <a href="mailto:info@hr.com.uy" className="hr-footer-contact">info@hr.com.uy</a>
              </p>
              <p style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--black)', marginTop: 12, lineHeight: '24px' }}>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`} target="_blank" rel="noopener noreferrer" className="hr-footer-contact">
                  Carlos F. Saez 6422,<br />Montevideo, Uruguay
                </a>
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="footer-newsletter" style={{ textAlign: 'center', width: 280 }}>
              <p style={{ fontFamily: 'var(--font)', fontWeight: 500, fontSize: 14, color: 'var(--black)', marginBottom: 8 }}>
                Suscribite a nuestra newsletter
              </p>
              {subscribed ? (
                <p style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'var(--black)' }}>¡Gracias por suscribirte!</p>
              ) : (
                <>
                  <div className="footer-newsletter-field" style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--black)', borderRadius: 999, padding: '8px 8px 8px 20px' }}>
                    <input type="email" required placeholder="nombre@mail.com" value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--black)', fontFamily: 'var(--font)', fontSize: 14, minWidth: 0 }} />
                    <button type="submit" aria-label="Suscribirse" disabled={subscribing} className="footer-newsletter-btn" style={{
                      width: 32, height: 32, borderRadius: '50%', background: 'var(--black)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0,
                      opacity: subscribing ? 0.6 : 1,
                    }}>
                      <Image src="/images/home/arrowwhite.png" alt="" width={12} height={12} />
                    </button>
                  </div>
                  {subscribeError && (
                    <p style={{ fontFamily: 'var(--font)', fontSize: 12, color: '#C8102E', marginTop: 8 }}>{subscribeError}</p>
                  )}
                </>
              )}
            </form>

            <div className="footer-socials" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hr-footer-social"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font)', fontSize: 14, color: 'var(--black)' }}>
                  {s.label} <MiniArrow />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--black)', padding: '16px 24px' }}>
        <p className="footer-copyright" style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
          © Copyright Grupo Hughes &amp; Rienzi 2026
        </p>
      </div>

      <style>{`
        .hr-footer-social:hover { opacity: 0.6; }
        .hr-footer-contact { color: inherit; transition: opacity 0.25s ease; }
        .hr-footer-contact:hover { opacity: 0.6; }
        .hr-footer-social:hover .hr-footer-social-arrow { transform: scale(1.15) rotate(45deg); background: var(--black); border-color: var(--black); }
        .hr-footer-social:hover .hr-footer-social-arrow-img { filter: invert(1); }
        @media (max-width: 768px) {
          /* Mobile footer (Figma "PIE MOBILE"): only the H&R logo, everything left-aligned,
             order: logo, contact, address, socials, newsletter */
          .hr-proyectos-section { display: none !important; }
          .footer-inner { padding: 32px 24px 32px !important; }
          .footer-inner > div { padding-top: 40px !important; }
          .footer-ghr { display: none !important; }
          .footer-top-row { justify-content: flex-start !important; margin-bottom: 32px !important; }
          .footer-comercializa { align-items: flex-start !important; }
          /* the SVG has ~12% empty space on its left edge; pull it back so it lines up with the text */
          .footer-comercializa img { width: auto !important; height: 44px !important; margin-left: -19px; }
          .footer-bottom-row { display: flex !important; flex-direction: column !important; align-items: flex-start !important; gap: 32px !important; text-align: left; }
          .footer-top-row, .footer-bottom-row { padding-left: 18px; }
          .footer-bottom-row { gap: 40px !important; }
          .footer-bottom-row p, .footer-bottom-row a, .footer-bottom-row input { font-size: 11px !important; line-height: 17px !important; font-weight: 300 !important; letter-spacing: -0.01em; }
          .footer-bottom-row > div:first-child p + p { margin-top: 20px !important; }
          .footer-socials { order: 2; flex-direction: row !important; align-items: center !important; gap: 44px !important; }
          .hr-footer-social { gap: 4px !important; }
          .hr-footer-social-arrow { border-color: transparent !important; width: 12px !important; height: 12px !important; }
          .footer-newsletter { order: 3; text-align: left !important; width: 100% !important; max-width: 176px; }
          .footer-newsletter > p { font-weight: 400 !important; margin-bottom: 10px !important; }
          .footer-newsletter-field { padding: 3px 3px 3px 14px !important; }
          .footer-newsletter-btn { width: 24px !important; height: 24px !important; }
          .footer-copyright { font-size: 10px !important; }
        }
      `}</style>
    </footer>
  );
}
