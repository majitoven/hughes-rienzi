import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const listId = process.env.MAILCHIMP_LIST_ID;

  try {
    const res = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
      }),
    });

    const data = await res.json();

    if (res.ok) return NextResponse.json({ ok: true });

    if (data.title === 'Member Exists') {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    console.error('Mailchimp error:', data);
    return NextResponse.json({ error: 'Error al suscribirse' }, { status: 500 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al suscribirse' }, { status: 500 });
  }
}
