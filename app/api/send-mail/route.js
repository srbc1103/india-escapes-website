import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_8t1UGWE3_FxdxVv5r3B8cZ4Rxfw4WujaJ');

const QUERY_HTML_TEMPLATE = ({ name, email, phone, destination, message }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Trip Inquiry - India Escapes</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f9f9fb; color:#333; padding:20px; }
    .container { max-width: 700px; margin:auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #000000, #dc143c); color:white; padding:30px; text-align:center; }
    .header h1 { margin:0; font-size:28px; font-weight:800; letter-spacing:1px; }
    .header p { margin:10px 0 0; font-size:16px; opacity:0.95; }
    .body { padding:30px; line-height:1.7; }
    .section { margin-bottom:28px; background:#fafafa; padding:20px; border-radius:12px; border-left:5px solid #dc143c; }
    .section h3 { margin:0 0 15px; color:#dc143c; font-size:18px; display:flex; align-items:center; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; }
    .label { font-weight:600; color:#555; }
    .value { color:#000; margin-left:8px; font-weight:500; }
    .footer { background:#111; color:#aaa; padding:25px; text-align:center; font-size:14px; }
    .btn { display:inline-block; background:#dc143c; color:white; padding:12px 28px; border-radius:50px; text-decoration:none; font-weight:bold; margin:10px 8px; box-shadow:0 4px 15px rgba(220,20,60,0.3); }
    @media (max-width:600px) { .grid { grid-template-columns:1fr; } .btn { display:block; width:80%; margin:10px auto; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>India Escapes</h1>
      <p>New Trip Inquiry – <strong>${name}</strong></p>
    </div>
    <div class="body">
      <div class="section">
        <h3>📋 Inquiry Details</h3>
        <div class="grid">
          <div><span class="label">Name:</span> <span class="value">${name}</span></div>
          <div><span class="label">Mobile:</span> <span class="value">+91 ${phone}</span></div>
          ${email ? `<div><span class="label">Email:</span> <span class="value">${email}</span></div>` : ''}
          ${destination ? `<div><span class="label">Destination:</span> <span class="value">${destination}</span></div>` : ''}
        </div>
      </div>

      ${message ? `
      <div class="section">
        <h3>💬 Message</h3>
        <p class="value">${message.replace(/\n/g, '<br>')}</p>
      </div>` : ''}

      <div class="section" style="text-align:center; background:#fff;">
        <p style="margin-bottom:20px;"><strong>Quick Actions</strong></p>
        <a href="tel:+91${phone}" class="btn">📞 Call Now</a>
        ${email ? `<a href="mailto:${email}" class="btn">✉️ Reply</a>` : ''}
      </div>
    </div>
    <div class="footer">
      <p><strong>India Escapes</strong> – Crafting Unforgettable Journeys Across India</p>
      <p>Call: +91 80910 66115 | Email: sales@indiaescapes.in</p>
    </div>
  </div>
</body>
</html>
`;

const CALLBACK_HTML_TEMPLATE = ({ name, phone }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Callback Request - India Escapes</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f9f9fb; color:#333; padding:20px; }
    .container { max-width: 700px; margin:auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #000000, #dc143c); color:white; padding:40px; text-align:center; }
    .header h1 { margin:0; font-size:32px; font-weight:800; letter-spacing:1px; }
    .body { padding:30px; text-align:center; }
    .section { background:#fafafa; padding:30px; border-radius:12px; border-left:5px solid #dc143c; margin:20px 0; }
    .big { font-size:48px; margin:20px 0; }
    .btn { display:inline-block; background:#dc143c; color:white; padding:16px 40px; border-radius:50px; text-decoration:none; font-weight:bold; font-size:18px; box-shadow:0 6px 20px rgba(220,20,60,0.4); }
    .footer { background:#111; color:#aaa; padding:25px; text-align:center; font-size:14px; }
    @media (max-width:600px) { .btn { display:block; width:80%; margin:20px auto; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>India Escapes</h1>
      <p style="font-size:18px;">Callback Request Received</p>
    </div>
    <div class="body">
      <div class="section">
        <div class="big">📞</div>
        <h2 style="color:#dc143c; margin:20px 0;">${name} wants to talk!</h2>
        <p style="font-size:20px; margin:20px 0;"><strong>Mobile:</strong> +91 ${phone}</p>
        <a href="tel:+91${phone}" class="btn">Call Now</a>
      </div>
    </div>
    <div class="footer">
      <p><strong>India Escapes</strong> – Crafting Unforgettable Journeys Across India</p>
      <p>Call: +91 80910 66115 | Email: sales@indiaescapes.in</p>
    </div>
  </div>
</body>
</html>
`;

const CONTACT_FORM_HTML_TEMPLATE = ({ name, email, phone, message }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Contact Form Message - India Escapes</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f9f9fb; color:#333; padding:20px; margin:0; }
    .container { max-width: 700px; margin:auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #000000, #dc143c); color:white; padding:35px 30px; text-align:center; position:relative; }
    .header::before { content:''; position:absolute; top:0; left:0; right:0; bottom:0; background:url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.1)"/></svg>'); opacity:0.3; }
    .header h1 { margin:0; font-size:32px; font-weight:800; letter-spacing:1px; position:relative; z-index:1; }
    .header p { margin:12px 0 0; font-size:16px; opacity:0.95; position:relative; z-index:1; }
    .badge { display:inline-block; background:rgba(255,255,255,0.2); padding:6px 16px; border-radius:50px; font-size:13px; margin-top:10px; font-weight:600; letter-spacing:0.5px; }
    .body { padding:35px; line-height:1.8; }
    .section { margin-bottom:25px; background:#fafafa; padding:22px; border-radius:12px; border-left:5px solid #dc143c; position:relative; }
    .section::before { content:''; position:absolute; top:22px; left:22px; width:40px; height:40px; background:linear-gradient(135deg, #dc143c, #ff6b6b); opacity:0.08; border-radius:8px; }
    .section h3 { margin:0 0 16px; color:#dc143c; font-size:18px; display:flex; align-items:center; font-weight:700; position:relative; z-index:1; }
    .section h3::before { content:''; width:6px; height:6px; background:#dc143c; border-radius:50%; margin-right:10px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:10px; }
    .info-item { background:white; padding:14px 16px; border-radius:10px; border:1px solid #eee; transition:all 0.3s ease; }
    .info-item:hover { border-color:#dc143c; box-shadow:0 4px 12px rgba(220,20,60,0.1); }
    .label { font-weight:600; color:#666; font-size:13px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; display:block; }
    .value { color:#000; font-weight:600; font-size:16px; word-break:break-word; }
    .message-box { background:white; padding:20px; border-radius:10px; border:1px solid #eee; margin-top:10px; line-height:1.8; color:#333; font-size:15px; }
    .actions { text-align:center; background:white; padding:25px; border-radius:12px; margin-top:10px; }
    .actions p { margin:0 0 18px; font-weight:600; color:#333; font-size:15px; }
    .btn { display:inline-block; background:#dc143c; color:white; padding:14px 32px; border-radius:50px; text-decoration:none; font-weight:700; margin:8px; box-shadow:0 4px 16px rgba(220,20,60,0.35); transition:all 0.3s ease; font-size:15px; }
    .btn:hover { background:#b81133; box-shadow:0 6px 20px rgba(220,20,60,0.45); transform:translateY(-2px); }
    .btn-secondary { background:#2c3e50; box-shadow:0 4px 16px rgba(44,62,80,0.3); }
    .btn-secondary:hover { background:#1a252f; }
    .footer { background:#111; color:#aaa; padding:28px; text-align:center; font-size:14px; line-height:1.8; }
    .footer strong { color:#dc143c; }
    .footer a { color:#dc143c; text-decoration:none; }
    .divider { height:1px; background:linear-gradient(to right, transparent, #ddd, transparent); margin:25px 0; }
    @media (max-width:600px) {
      .info-grid { grid-template-columns:1fr; gap:12px; }
      .btn { display:block; margin:10px 0; }
      .header h1 { font-size:26px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ India Escapes</h1>
      <p>New Contact Form Message</p>
      <span class="badge">📬 CONTACT REQUEST</span>
    </div>

    <div class="body">
      <div class="section">
        <h3>Contact Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">👤 Full Name</span>
            <div class="value">${name}</div>
          </div>
          ${phone ? `
          <div class="info-item">
            <span class="label">📱 Mobile Number</span>
            <div class="value">${phone.startsWith('+91') ? phone : '+91 ' + phone}</div>
          </div>` : ''}
          ${email ? `
          <div class="info-item" style="grid-column:1/-1;">
            <span class="label">📧 Email Address</span>
            <div class="value">${email}</div>
          </div>` : ''}
        </div>
      </div>

      ${message ? `
      <div class="section">
        <h3>Message Details</h3>
        <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
      </div>` : ''}

      <div class="divider"></div>

      <div class="actions">
        <p>⚡ Quick Actions</p>
        ${phone ? `<a href="tel:${phone.startsWith('+91') ? phone : '+91' + phone}" class="btn">📞 Call ${name}</a>` : ''}
        ${email ? `<a href="mailto:${email}" class="btn btn-secondary">✉️ Reply via Email</a>` : ''}
      </div>
    </div>

    <div class="footer">
      <p><strong>India Escapes</strong> – Crafting Unforgettable Journeys Across India</p>
      <p style="margin-top:8px;">📞 Call: <a href="tel:+918091066115">+91 80910 66115</a> | 📧 Email: <a href="mailto:sales@indiaescapes.in">sales@indiaescapes.in</a></p>
      <p style="margin-top:12px; font-size:12px; opacity:0.7;">This email was sent from your website's contact form at ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
    </div>
  </div>
</body>
</html>
`;

export async function POST(request) {
  try {
    const body = await request.json();
    let {
      name,
      email,
      mobile,
      destination,
      message,
      query_type = 'quote',

      travelDateType,
      fixedDate,
      flexibleMonths = [],
      duration,
      travellers,
      accommodation = [],
      budget,
      interests
    } = body;

    if (!name || !query_type) {
      return NextResponse.json(
        { success: false, error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const phone = mobile?.replace(/\D/g, '').slice(-10) || '';

    let params = {
      from: `India Escapes <${process.env.FROM_EMAIL}>`,
      to: [`Admin <sales@indiaescapes.in>`],
      reply_to: email || undefined,
    };

    if (query_type === 'ms_form') {
      if (!phone) {
        return NextResponse.json(
          { success: false, error: 'Phone is required for multi-step form' },
          { status: 400 }
        );
      }

      params.subject = `Inquiry from ${name}`;

      params.html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Multi-Step Inquiry - India Escapes</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background:#f9f9fb; color:#333; padding:20px; }
          .container { max-width: 700px; margin:auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #000000, #dc143c); color:white; padding:30px; text-align:center; }
          .header h1 { margin:0; font-size:28px; font-weight:800; letter-spacing:1px; }
          .header p { margin:10px 0 0; font-size:16px; opacity:0.95; }
          .body { padding:30px; line-height:1.7; }
          .section { margin-bottom:28px; background:#fafafa; padding:20px; border-radius:12px; border-left:5px solid #dc143c; }
          .section h3 { margin:0 0 15px; color:#dc143c; font-size:18px; display:flex; align-items:center; }
          .grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; }
          .label { font-weight:600; color:#555; }
          .value { color:#000; margin-left:8px; font-weight:500; }
          .list { list-style:none; padding:0; margin:10px 0 0; }
          .list li { background:#fff; padding:10px 14px; margin-bottom:8px; border-radius:8px; border:1px solid #eee; display:flex; justify-content:space-between; }
          .footer { background:#111; color:#aaa; padding:25px; text-align:center; font-size:14px; }
          .badge { display:inline-block; padding:4px 12px; background:#dc143c; color:white; border-radius:50px; font-size:12px; font-weight:bold; }
          @media (max-width:600px) { .grid { grid-template-columns:1fr; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>India Escapes</h1>
            <p>New Multi-Step Travel Inquiry – <strong>${name}</strong></p>
          </div>
          <div class="body">

            <div class="section">
              <h3>Traveller Details</h3>
              <div class="grid">
                <div><span class="label">Name:</span> <span class="value">${name}</span></div>
                <div><span class="label">Mobile:</span> <span class="value">+91 ${phone}</span></div>
                ${email ? `<div><span class="label">Email:</span> <span class="value">${email}</span></div>` : ''}
                ${destination ? `<div><span class="label">Destination:</span> <span class="value">${destination}</span></div>` : ''}
              </div>
            </div>

            <div class="section">
              <h3>Travel Dates</h3>
              ${travelDateType === 'fixed' 
                ? `<p><span class="label">Fixed Date:</span> <span class="value">${fixedDate ? new Date(fixedDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : 'Not selected'}</span></p>`
                : `<p><span class="label">Flexible Months:</span> <span class="value">${flexibleMonths.join(', ')}</span></p>`
              }
            </div>

            <div class="section">
              <h3>Trip Duration</h3>
              <p class="value">${duration || 'Not specified'}</p>
            </div>

            <div class="section">
              <h3>Travelling With</h3>
              <p class="value">${travellers || 'Not specified'}</p>
            </div>

            <div class="section">
              <h3>Accommodation Preference (Max 2)</h3>
              ${accommodation.length 
                ? `<ul class="list">${accommodation.map(item => `<li>${item} <span class="badge">Selected</span></li>`).join('')}</ul>`
                : `<p class="value">Any</p>`
              }
            </div>

            <div class="section">
              <h3>Budget per Person</h3>
              <p class="value">${budget || 'Not specified'}</p>
            </div>

            <div class="section">
              <h3>Special Interests</h3>
              <p class="value">${interests ? interests.replace(/\n/g, '<br>') : 'None mentioned'}</p>
            </div>

            ${message ? `
            <div class="section">
              <h3>Additional Message</h3>
              <p class="value">${message.replace(/\n/g, '<br>')}</p>
            </div>` : ''}

          </div>
          <div class="footer">
            <p><strong>India Escapes</strong> – Crafting Unforgettable Journeys Across India</p>
            <p>Call us: +91 80910 66115 | Email: sales@indiaescapes.in</p>
          </div>
        </div>
      </body>
      </html>
      `;
    }
    else if (query_type === 'quote') {
      if (!phone) {
        return NextResponse.json(
          { success: false, error: 'Phone required for quote' },
          { status: 400 }
        );
      }
      params.subject = `New Trip Inquiry from ${name}`;
      params.html = QUERY_HTML_TEMPLATE({ name, email, phone, destination, message });
    } 
    else if (query_type === 'callback') {
      if (!phone) {
        return NextResponse.json(
          { success: false, error: 'Phone required for callback' },
          { status: 400 }
        );
      }
      params.subject = `Callback Request from ${name}`;
      params.html = CALLBACK_HTML_TEMPLATE({ name, phone });
    }
    else if (query_type === 'contact_form') {
      if (!mobile && !email) {
        return NextResponse.json(
          { success: false, error: 'Either phone or email is required for contact form' },
          { status: 400 }
        );
      }
      params.subject = `Contact Form Message from ${name}`;
      params.html = CONTACT_FORM_HTML_TEMPLATE({ name, email, phone, message });
    }
    else {
      return NextResponse.json(
        { success: false, error: 'Invalid query_type. Use "quote", "callback", "ms_form" or "contact_form"' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send(params);

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data.id);
    return NextResponse.json({ status: 'success', message: 'Message sent successfully!' });

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}