export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const lead = req.body;
    if (!lead.name || !lead.email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    const data = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: lead.name, email: lead.email, phone: lead.phone || '',
      company: lead.company || '',
      originState: lead.originState || '', targetArea: lead.targetArea || lead.targetState || '',
      situation: lead.situation || '',
      source: lead.source || 'website', type: lead.type || 'strategy_call',
      createdAt: new Date().toISOString(),
    };
    console.log('=== NEW LEAD ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('================');
    const NOTIFY = process.env.NOTIFY_EMAIL || 'christalspata@gmail.com';
    if (process.env.RESEND_API_KEY) {
      try {
        const subj = data.type === 'guide_download'
          ? 'New Guide Download: ' + data.name
          : 'New Strategy Call Request: ' + data.name;
        const html = '<div style="font-family:Arial,sans-serif;max-width:600px;padding:20px">'
          + '<h2 style="color:#c1a776;border-bottom:2px solid #c1a776;padding-bottom:10px">' + subj + '</h2>'
          + '<table style="font-size:14px;border-collapse:collapse;width:100%">'
          + '<tr><td style="padding:8px;font-weight:bold;color:#666">Name</td><td style="padding:8px">' + data.name + '</td></tr>'
          + '<tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;color:#666">Email</td><td style="padding:8px">' + data.email + '</td></tr>'
          + '<tr><td style="padding:8px;font-weight:bold;color:#666">Phone</td><td style="padding:8px">' + (data.phone || 'N/A') + '</td></tr>'
          + '<tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;color:#666">Company</td><td style="padding:8px">' + (data.company || 'N/A') + '</td></tr>'
          + '<tr><td style="padding:8px;font-weight:bold;color:#666">From</td><td style="padding:8px">' + (data.originState || 'N/A') + '</td></tr>'
          + '<tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;color:#666">To</td><td style="padding:8px">' + (data.targetArea || 'N/A') + '</td></tr>'
          + '<tr><td style="padding:8px;font-weight:bold;color:#666">Situation</td><td style="padding:8px">' + (data.situation || 'N/A') + '</td></tr>'
          + '<tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;color:#666">Source</td><td style="padding:8px">' + data.source + '</td></tr>'
          + '<tr><td style="padding:8px;font-weight:bold;color:#666">Type</td><td style="padding:8px">' + data.type + '</td></tr>'
          + '</table></div>';
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'Reverse Agent <onboarding@resend.dev>',
            to: [NOTIFY], subject: subj, html: html
          })
        });
      } catch (e) { console.error('Email failed:', e); }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Lead error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
