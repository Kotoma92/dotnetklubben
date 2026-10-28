interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const MAX_MESSAGE_LENGTH = 180;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ success: false, message: 'Ugyldig skjemadata.' }, 400);
  }

  // Honeypot checks (silently accept to fool bots)
  const botcheck = formData.get('botcheck');
  const honeypotText = String(formData.get('input_5') ?? '').trim();
  if (botcheck || honeypotText !== '') {
    return jsonResponse({ success: true, message: 'Melding mottatt.' });
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const subject = String(formData.get('subject') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || !email || !subject || !message) {
    return jsonResponse(
      { success: false, message: 'Vennligst fyll ut alle påkrevde felt.' },
      400
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return jsonResponse(
      { success: false, message: 'Vennligst oppgi en gyldig e-postadresse.' },
      400
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse(
      {
        success: false,
        message: `Meldingen kan være maks ${MAX_MESSAGE_LENGTH} tegn.`,
      },
      400
    );
  }

  // Optional Cloudflare Turnstile verification if TURNSTILE_SECRET_KEY is configured
  if (env.TURNSTILE_SECRET_KEY) {
    const turnstileToken = String(formData.get('cf-turnstile-response') ?? '').trim();
    if (!turnstileToken) {
      return jsonResponse(
        { success: false, message: 'Vennligst bekreft at du ikke er en robot.' },
        400
      );
    }

    const verifyBody = new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
      remoteip: request.headers.get('CF-Connecting-IP') ?? '',
    });

    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: verifyBody,
      }
    );
    const verifyData = (await verifyRes.json()) as { success?: boolean };
    if (!verifyData.success) {
      return jsonResponse(
        { success: false, message: 'Robot-sjekk feilet. Prøv igjen.' },
        400
      );
    }
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse(
      {
        success: false,
        message: 'Serveren mangler e-postkonfigurasjon (RESEND_API_KEY).',
      },
      500
    );
  }

  const toEmail = env.CONTACT_TO_EMAIL || 'kristian@rolandtech.org';
  const fromEmail =
    env.CONTACT_FROM_EMAIL || 'Dotnetklubben <noreply@dotnetklubben.org>';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #1F2833; max-width: 600px;">
      <h2 style="margin-bottom: 16px;">Ny henvendelse fra dotnetklubben.org</h2>
      <p><strong>Navn:</strong> ${escapeHtml(name)}</p>
      <p><strong>E-post:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><strong>Emne:</strong> ${escapeHtml(subject)}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  const textContent = `Ny henvendelse fra dotnetklubben.org\n\nNavn: ${name}\nE-post: ${email}\nEmne: ${subject}\n\nMelding:\n${message}`;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: `[Dotnetklubben] ${subject}`,
      html: htmlContent,
      text: textContent,
    }),
  });

  if (!resendRes.ok) {
    const errText = await resendRes.text().catch(() => '');
    console.error('Resend API error:', resendRes.status, errText);
    return jsonResponse(
      {
        success: false,
        message: 'Kunne ikke sende e-post akkurat nå. Vennligst prøv igjen senere.',
      },
      502
    );
  }

  return jsonResponse({
    success: true,
    message:
      'Takk for din henvendelse! Vi har mottatt meldingen din og tar kontakt så snart vi kan.',
  });
}
