export default async (req) => {
  try {
    const { payload } = await req.json();
    const formName = payload.form_name || 'Unknown Form';
    const data = payload.data || {};

    // Filter out internal fields
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([key]) => !key.startsWith('_') && key !== 'form-name' && key !== 'bot-field')
    );

    // Build a readable summary for email
    const subject = `New ${formName} submission — Smartious Homeschool`;

    // Send email notification via formsubmit.co
    try {
      await fetch('https://formsubmit.co/ajax/oukoalfred11@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: subject,
          _template: 'table',
          _captcha: 'false',
          'Form Type': formName,
          ...cleanData,
        }),
      });
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr);
    }

    // Build WhatsApp message text
    let waMsg = `*New ${formName} Submission — Smartious Homeschool*\n\n`;
    for (const [key, val] of Object.entries(cleanData)) {
      if (val) waMsg += `*${key}:* ${val}\n`;
    }
    waMsg += `\n_Submitted: ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}_`;

    // Send WhatsApp notification via WhatsApp Business Cloud API (if configured)
    const waToken = process.env.WHATSAPP_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_ID;
    if (waToken && waPhoneId) {
      try {
        await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${waToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '254745021212',
            type: 'text',
            text: { body: waMsg },
          }),
        });
      } catch (waErr) {
        console.error('WhatsApp API notification failed:', waErr);
      }
    }

    return new Response('OK');
  } catch (err) {
    console.error('submission-created error:', err);
    return new Response('Error', { status: 500 });
  }
};
