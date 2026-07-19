'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inp: React.CSSProperties = {
    width: '100%', background: '#f9f9f9', border: '1px solid #e5e5e5',
    borderRadius: 8, padding: '12px 16px', fontSize: 14,
    fontFamily: 'var(--font)', color: 'var(--black)', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/admin/proyectos');
    } catch {
      setError('Email o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', width: 380, boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 22, color: 'var(--black)', marginBottom: 12 }}>GHR</p>
          <p style={{ fontFamily: 'var(--font)', fontWeight: 300, fontSize: 15, color: 'rgba(20,20,20,0.5)' }}>
            Panel de Administración
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="email" placeholder="Email" required value={email}
            onChange={e => setEmail(e.target.value)} style={inp} />
          <input type="password" placeholder="Contraseña" required value={password}
            onChange={e => setPassword(e.target.value)} style={inp} />

          {error && (
            <p style={{ fontFamily: 'var(--font)', fontSize: 13, color: '#C8102E', textAlign: 'center' }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            background: 'var(--black)', color: '#fff', border: 'none', borderRadius: 999,
            padding: '13px', fontSize: 13, letterSpacing: '0.1em', fontWeight: 500,
            fontFamily: 'var(--font)', cursor: 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'background 0.2s', marginTop: 8,
          }}>
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
