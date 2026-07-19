import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { nombre, email, telefono, mensaje } = await req.json();

  if (!nombre || !email || !mensaje) {
    return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://formspree.io/f/${process.env.FORMSPREE_CONTACT_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        nombre,
        telefono: telefono || '—',
        email,
        mensaje,
        _replyto: email,
        _subject: `Nueva consulta de ${nombre}`,
      }),
    });
    if (res.ok) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: 'Error al enviar' }, { status: 500 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al enviar' }, { status: 500 });
  }
}
