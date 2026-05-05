import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured. Please add it in OnSpace Cloud → Secrets.');
    }

    const { to, subject, body, cc, bcc, replyTo, fromName, escalated, escalationContacts } = await req.json();

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'to, subject, and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert plain text body to HTML (preserve line breaks)
    const htmlBody = body
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .split('\n')
      .map((line: string) => `<p style="margin:0 0 6px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;">${line || '&nbsp;'}</p>`)
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#f4f4f4;padding:24px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1a2744;padding:20px 24px;">
      <p style="margin:0;color:#f5a623;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Uganda Martyrs University</p>
      <p style="margin:4px 0 0;color:#ffffff;font-size:18px;font-weight:700;">Official Correspondence</p>
    </div>
    <div style="padding:24px;">
      ${htmlBody}
    </div>
    <div style="background:#f8f8f8;padding:16px 24px;border-top:1px solid #e8e8e8;">
      <p style="margin:0;font-size:11px;color:#888888;">This email was sent by the UMU AI Agent Swarm system. For queries, contact <a href="mailto:registrar@umu.ac.ug" style="color:#1a2744;">registrar@umu.ac.ug</a></p>
      <p style="margin:4px 0 0;font-size:11px;color:#888888;">Uganda Martyrs University | P.O. Box 5498 Kampala | <a href="https://www.umu.ac.ug" style="color:#1a2744;">www.umu.ac.ug</a></p>
    </div>
  </div>
</body>
</html>`;

    const emailPayload: Record<string, unknown> = {
      from: `${fromName || 'UMU Agent Swarm'} <agents@umu.ac.ug>`,
      to: [to],
      subject,
      html: htmlContent,
      text: body,
    };

    // Build CC list: campus coordinator + escalation contacts if flagged
    const ccList: string[] = [];
    if (cc) { if (Array.isArray(cc)) ccList.push(...cc); else ccList.push(cc); }
    if (escalated && escalationContacts) {
      const extras = Array.isArray(escalationContacts) ? escalationContacts : [escalationContacts];
      extras.forEach((e: string) => { if (!ccList.includes(e)) ccList.push(e); });
      console.log(`[send-email] Escalated email — adding ${extras.length} escalation CC(s)`);
    }
    if (ccList.length > 0) emailPayload.cc = ccList;
    if (replyTo) emailPayload.reply_to = replyTo;

    console.log(`[send-email] Sending to: ${to}, CC: ${cc || 'none'}, Subject: ${subject}`);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[send-email] Resend error:', resendData);
      throw new Error(`Resend: ${resendData?.message || JSON.stringify(resendData)}`);
    }

    console.log('[send-email] Successfully sent. ID:', resendData.id);

    return new Response(
      JSON.stringify({ success: true, messageId: resendData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[send-email] Error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
