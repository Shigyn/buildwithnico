exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);

  if (!email || !email.includes('@')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email invalide' }) };
  }

  const API_KEY = process.env.BREVO_API_KEY;

  try {
    // Ajouter le contact dans la liste Brevo
    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify({
        email: email,
        listIds: [3],
        updateEnabled: true
      })
    });

    if (contactRes.status !== 201 && contactRes.status !== 204) {
      const err = await contactRes.json();
      return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
    }

    // Envoyer le freebie par mail
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'Nico', email: 'masia.nicolas.07@gmail.com' },
        to: [{ email: email }],
        subject: 'Ton guide gratuit — Trouve ton produit digital',
        htmlContent: `
          <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
            <h2 style="font-size:22px;color:#CC0000;margin-bottom:8px;letter-spacing:2px;">NICOFAITLESCHOSES</h2>
            <p style="color:#333;font-size:15px;line-height:1.7;margin-bottom:8px;">Voilà ton guide gratuit.</p>
            <p style="color:#555;font-size:14px;line-height:1.7;margin-bottom:28px;">5 questions. 10 minutes. Une direction claire sur ce que tu peux créer et vendre.</p>
            <a href="https://nicofaitleschoses.gumroad.com/l/freebie"
               style="display:inline-block;background:#CC0000;color:#fff;text-decoration:none;padding:14px 28px;font-weight:700;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
              Télécharger le guide →
            </a>
            <p style="color:#aaa;font-size:11px;margin-top:32px;line-height:1.6;">
              Tu reçois cet email parce que tu as demandé le guide sur nicofaitleschoses.com<br>
              Désinscription en 1 clic sur demande.
            </p>
          </div>
        `
      })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erreur serveur' }) };
  }
};
