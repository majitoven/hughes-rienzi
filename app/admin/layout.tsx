'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        setAuthed(true);
      } else {
        if (pathname !== '/admin/login') router.replace('/admin/login');
      }
      setChecking(false);
    });
    return unsub;
  }, [pathname, router]);

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <p style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'rgba(20,20,20,0.4)' }}>Cargando...</p>
    </div>
  );

  if (pathname === '/admin/login') return <>{children}</>;
  if (!authed) return null;

  const navLinks = [
    { href: '/admin/proyectos', label: 'Proyectos' },
    { href: '/admin/blog', label: 'Entre Charlas' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'var(--black)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '32px 24px 24px' }}>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '0.05em' }}>
            GHR ADMIN
          </p>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: '0.1em' }}>
            Grupo Hughes &amp; Rienzi
          </p>
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {navLinks.map(l => {
            const active = pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} style={{
                display: 'block', padding: '10px 24px',
                fontFamily: 'var(--font)', fontSize: 14, fontWeight: 400,
                color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderLeft: active ? '2px solid #fff' : '2px solid transparent',
                transition: 'all 0.2s', textDecoration: 'none',
              }}>{l.label}</Link>
            );
          })}
        </nav>

        <div style={{ padding: 24 }}>
          <button onClick={() => { signOut(auth); router.replace('/admin/login'); }}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '8px 16px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font)', width: '100%', transition: 'all 0.2s' }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: '#f5f5f5', padding: 32, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
