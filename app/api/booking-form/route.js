// app/api/booking-form/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_8t1UGWE3_FxdxVv5r3B8cZ4Rxfw4WujaJ');

const formatDate = (date) => {
  if (!date) return 'Not provided';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const BOOKING_HTML_TEMPLATE = (data) => {
  const {
    bookingRef, salesPOC, tourStartDate,
    leadTitle, leadFirstName, leadMiddleName, leadLastName, leadAddress, leadTelephone, leadEmail,
    passengers,
    emergencyName, emergencyRelation, emergencyPhone, emergencyAltPhone,
    arrivalDate, returnDate, adults, kids, infants, rooms, destinations,
    insuranceCompany, policyNumber, insurancePhone,
    totalPackageCost, currency, advancePaidAmount, advancePaidDate
  } = data;

  const leadFullName = `${leadTitle} ${leadFirstName} ${leadMiddleName ? leadMiddleName + ' ' : ''}${leadLastName}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Booking Form Submission - India Escapes</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f9f9fb; color:#333; padding:20px; margin:0; }
    .container { max-width: 720px; margin:30px auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 15px 40px rgba(0,0,0,0.12); }
    .header { background: linear-gradient(135deg, #000000, #dc143c); color:white; padding:40px 30px; text-align:center; }
    .header h1 { margin:0; font-size:32px; font-weight:800; letter-spacing:1.5px; }
    .header p { margin:12px 0 0; font-size:18px; opacity:0.95; }
    .body { padding:35px; line-height:1.8; }
    .section { margin-bottom:30px; background:#fafafa; padding:22px; border-radius:14px; border-left:6px solid #dc143c; }
    .section h3 { margin:0 0 18px; color:#dc143c; font-size:20px; display:flex; align-items:center; gap:10px; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .grid-full { grid-column:1/-1; }
    .label { font-weight:600; color:#444; font-size:14px; }
    .value { color:#000; font-weight:500; margin-left:8px; }
    table { width:100%; border-collapse:collapse; margin-top:15px; }
    th, td { padding:12px 14px; text-align:left; border-bottom:1px solid #eee; font-size:14px; }
    th { background:#dc143c; color:white; font-weight:600; }
    td { background:#fff; }
    .passenger-row:nth-child(even) td { background:#fdf2f5; }
    .footer { background:#111; color:#ccc; padding:30px; text-align:center; font-size:14px; }
    .badge { display:inline-block; padding:4px 12px; background:#dc143c; color:white; border-radius:50px; font-size:11px; font-weight:bold; }
    .highlight { background:#fff8c5; padding:16px; border-radius:12px; text-align:center; font-size:18px; font-weight:bold; color:#b8860b; }
    @media (max-width:600px) { .grid { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>India Escapes</h1>
      <p>New Booking Form Submission</p>
    </div>

    <div class="body">

      <div class="highlight">
        Booking Reference: <strong>${bookingRef || 'Not provided'}</strong> | Sales POC: <strong>${salesPOC || 'Not assigned'}</strong>
      </div>

      <div class="section">
        <h3>Lead Traveler</h3>
        <div class="grid">
          <div><span class="label">Name:</span> <span class="value">${leadFullName}</span></div>
          <div><span class="label">Mobile:</span> <span class="value">+91 ${leadTelephone}</span></div>
          <div><span class="label">Email:</span> <span class="value">${leadEmail || 'Not provided'}</span></div>
          <div class="grid-full"><span class="label">Address:</span> <span class="value">${leadAddress || 'Not provided'}</span></div>
        </div>
      </div>

      <div class="section">
        <h3>All Passengers</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Full Name</th>
              <th>Date of Birth</th>
              <th>Nationality</th>
              <th>Passport/Aadhaar No.</th>
              <th>Issue / Expiry</th>
            </tr>
          </thead>
          <tbody>
            ${passengers.map((p, i) => {
              const fullName = `${p.title} ${p.firstName} ${p.middleName ? p.middleName + ' ' : ''}${p.lastName}`;
              return `
                <tr class="passenger-row">
                  <td><strong>${i + 1}${i === 0 ? ' (Lead)' : ''}</strong></td>
                  <td>${p.title}</td>
                  <td>${fullName}</td>
                  <td>${p.dob ? formatDate(p.dob) : '—'}</td>
                  <td>${p.nationality || '—'}</td>
                  <td>${p.passportNumber || '—'}</td>
                  <td>${p.issueDate ? formatDate(p.issueDate) : '—'} / ${p.expiryDate ? formatDate(p.expiryDate) : '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h3>Trip Details</h3>
        <div class="grid">
          <div><span class="label">Tour Start Date:</span> <span class="value">${formatDate(tourStartDate)}</span></div>
          <div><span class="label">Arrival Date:</span> <span class="value">${formatDate(arrivalDate)}</span></div>
          <div><span class="label">Return Date:</span> <span class="value">${formatDate(returnDate)}</span></div>
          <div><span class="label">Destinations:</span> <span class="value">${destinations || 'To be finalized'}</span></div>
          <div><span class="label">Adults:</span> <span class="value">${adults || 0}</span></div>
          <div><span class="label">Kids (2-11):</span> <span class="value">${kids || 0}</span></div>
          <div><span class="label">Infants (0-2):</span> <span class="value">${infants || 0}</span></div>
          <div><span class="label">Rooms Required:</span> <span class="value">${rooms || 'As per group'}</span></div>
        </div>
      </div>

      <div class="section">
        <h3>Emergency Contact</h3>
        <div class="grid">
          <div><span class="label">Name:</span> <span class="value">${emergencyName}</span></div>
          <div><span class="label">Relationship:</span> <span class="value">${emergencyRelation}</span></div>
          <div><span class="label">Phone:</span> <span class="value">+91 ${emergencyPhone}</span></div>
          <div><span class="label">Alternate:</span> <span class="value">${emergencyAltPhone ? '+91 ' + emergencyAltPhone : '—'}</span></div>
        </div>
      </div>

      ${insuranceCompany || policyNumber ? `
      <div class="section">
        <h3>Travel Insurance</h3>
        <div class="grid">
          <div><span class="label">Company:</span> <span class="value">${insuranceCompany || '—'}</span></div>
          <div><span class="label">Policy No.:</span> <span class="value">${policyNumber || '—'}</span></div>
          <div><span class="label">Contact:</span> <span class="value">${insurancePhone ? '+91 ' + insurancePhone : '—'}</span></div>
        </div>
      </div>` : ''}

      ${totalPackageCost || advancePaidAmount ? `
      <div class="section">
        <h3>Payment Details</h3>
        <div class="grid">
          <div><span class="label">Total Package Cost:</span> <span class="value">${totalPackageCost || '—'}</span></div>
          <div><span class="label">Currency:</span> <span class="value">${currency || 'INR'}</span></div>
          <div><span class="label">Advance Paid Amount:</span> <span class="value">${advancePaidAmount || '—'}</span></div>
          <div><span class="label">Advance Paid Date:</span> <span class="value">${formatDate(advancePaidDate)}</span></div>
        </div>
      </div>` : ''}

      <div class="section" style="text-align:center; background:#fff; border:2px dashed #dc143c;">
        <p style="margin:0 0 20px; font-size:18px;"><strong>Quick Actions</strong></p>
        <a href="tel:+91${leadTelephone}" style="display:inline-block; background:#dc143c; color:white; padding:14px 32px; border-radius:50px; text-decoration:none; font-weight:bold; margin:8px;">Call Lead Traveler</a>
        ${leadEmail ? `<a href="mailto:${leadEmail}" style="display:inline-block; background:#111; color:white; padding:14px 32px; border-radius:50px; text-decoration:none; font-weight:bold; margin:8px;">Reply via Email</a>` : ''}
      </div>

    </div>

    <div class="footer">
      <p><strong>India Escapes</strong> – Crafting Unforgettable Journeys Across India</p>
      <p>Call: +91 80910 66115 | Email: sales@indiaescapes.in | Website: indiaescapes.in</p>
      <p style="margin-top:15px; font-size:12px; color:#888;">This is an automated notification from the booking form.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.query_type !== 'booking_form') {
      return NextResponse.json(
        { success: false, message: 'Invalid request type' },
        { status: 400 }
      );
    }

    const {
      bookingRef,
      leadFirstName,
      leadLastName,
      leadTelephone,
      passengers = []
    } = body;

    if (!bookingRef || !leadFirstName || !leadTelephone || passengers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    const html = BOOKING_HTML_TEMPLATE(body);

    const { data, error } = await resend.emails.send({
      from: `India Escapes <${process.env.FROM_EMAIL}>`,
      to: ['sales@indiaescapes.in'], // Change to your sales email
      subject: `New Booking Form – ${bookingRef} | ${leadFirstName}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ success: false, status:'error', message: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, status:'success', message: 'Booking submitted successfully!' });

  } catch (error) {
    console.error('Booking form error:', error);
    return NextResponse.json(
      { success: false, status:'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}