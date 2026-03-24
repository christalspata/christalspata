export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { name, email, phone, company, originState, targetArea, situation } = req.body;
    if (!name || !email || !originState) {
      return res.status(400).json({ error: 'Name, email, and origin state are required.' });
    }
    const lead = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name, email, phone: phone || '', company: company || '',
      originState, targetArea: targetArea || '', situation: situation || '',
      source: 'Website/Landing Page', status: 'New Lead',
      createdAt: new Date().toISOString(),
    };
    const NOTIFY = process.env.NOTIFY_EMAIL || 'christalspata@gmail.com';
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'Reverse Agent <leads@resend.dev>',
            to: [NOTIFY],
            subject: 'New Lead: ' + name + ' — ' + originState + ' to Florida',
            html: '<div style="font-family:Arial,sans-serif;max-width:600px;padding:20px"><h2 style="color:#1F3864;border-bottom:2px solid #c1a776;padding-bottom:10px">New Lead from Reverse Agent Website</h2><table style="width:100%;border-collapse:collapse;margin-top:15px"><tr><td style="padding:8px;font-weight:bold;color:#1F3864;width:140px">Name</td><td style="padding:8px">' + name + '</td></tr><tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold;color:#1F3864">Email</td><td style="padding:8px">' + email + '</td></tr><tr><td style="padding:8px;font-weight:bold;color:#1F3864">Phone</td><td style="padding:8px">' + (phone || 'Not provided') + '</td></tr><tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold;color:#1F3864">Company</td><td style="padding:8px">' + (company || 'Not provided') + '</td></tr><tr><td style="padding:8px;font-weight:bold;color:#1F3864">Relocating From</td><td style="padding:8px;font-weight:bold">' + originState + '</td></tr><tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold;color:#1F3864">FL Target Area</td><td style="padding:8px">' + (targetArea || 'Not specified') + '</td></tr><tr><td style="padding:8px;font-weight:bold;color:#1F3864">Situation</td><td style="padding:8px">' + (situation || 'Not provided') + '</td></tr></table><p style="margin-top:20px;color:#666;font-size:13px">Add this lead to your spreadsheet tracker and begin the nurture sequence.</p></div>',
          }),
        });
      } catch (e) { console.error('Email failed:', e); }
    }
    if (process.env.WEBHOOK_URL) {
      try {
        await fetch(process.env.WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
      } catch (e) { console.error('Webhook failed:', e); }
    }
    return res.status(200).json({ success: true, message: 'Lead captured.' });
  } catch (err) {
    console.error('Lead capture error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
