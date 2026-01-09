import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ==========================================
// 🎨 MASTER EMAIL LAYOUT (Fixed for Gmail)
// ==========================================
const getHtmlTemplate = (title, bodyContent) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
        body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #FDFBF7; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #FDFBF7; padding-bottom: 40px; }
        .content { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(68, 45, 28, 0.08); }
        .header { background-color: #ffffff; padding: 40px 0 20px; text-align: center; border-bottom: 3px solid #FDFBF7; }
        
        /* Force logo color with !important to prevent blue links */
        .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 36px; font-weight: 700; color: #442D1C !important; text-decoration: none; letter-spacing: -0.5px; }
        
        .body-text { font-family: 'Inter', Helvetica, Arial, sans-serif; color: #442D1C; padding: 40px 40px 20px; line-height: 1.6; font-size: 15px; }
        .footer { background-color: #F9F5F0; padding: 30px; text-align: center; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 12px; color: #8E5022; }
        .btn { display: inline-block; background-color: #442D1C; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 20px; font-family: 'Inter', sans-serif; }
        
        /* Utility Classes */
        .info-box-table { width: 100%; background-color: #FDFBF7; border: 1px solid #EDD8B4; border-radius: 8px; border-spacing: 0; border-collapse: separate; margin: 20px 0; }
        .info-box-td { padding: 15px 20px; vertical-align: middle; }
        
        .status-badge { background-color: #EDD8B4; color: #442D1C; padding: 6px 16px; border-radius: 50px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        
        .product-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .product-table td { padding: 12px 0; border-bottom: 1px solid #F3F0EB; font-size: 14px; }
        .total-row td { border-top: 2px solid #EDD8B4; border-bottom: none; font-weight: 700; padding-top: 15px; font-size: 16px; }
      </style>
    </head>
    <body>
      <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <div class="content">
              <div class="header">
                <a href="${
                  process.env.NEXT_PUBLIC_URL
                }" style="display: block; text-align: center;">
  <img 
    src="${process.env.NEXT_PUBLIC_URL}/images/others/Basho - logotm-03.jpg" 
    alt="Bashō" 
    width="120" 
    style="display: block; margin: 0 auto; max-width: 150px; height: auto; border: 0;"
  />
</a>
                <div style="font-family: 'Inter', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C85428; margin-top: 5px;">Handcrafted Japanese Ceramics</div>
              </div>

              <div class="body-text">
                ${bodyContent}
              </div>

              <div class="footer">
                <p style="margin-bottom: 10px;"><strong>Need help?</strong> Reply to this email or visit our <a href="${
                  process.env.NEXT_PUBLIC_URL
                }/contact" style="color: #442D1C; text-decoration: underline;">Support Center</a>.</p>
                <p style="margin-bottom: 20px;">123 Artisan Avenue, Pottery District, Jaipur 302001, India</p>
                <p style="margin-top: 20px; font-size: 11px; opacity: 0.7;">© ${new Date().getFullYear()} Bashō Ceramics. All rights reserved.</p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// --- Helper: Send Mail Wrapper ---
export async function sendEmail({ to, subject, html }) {
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"Bashō Ceramics" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email Failed:', error);
    return false;
  }
}

// ==========================================
// 1️⃣ OTP EMAIL (Login)
// ==========================================
export async function sendOTP(email, otp) {
  const content = `
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; color: #442D1C;">Login Verification</h2>
    <p>Welcome back. Use the code below to complete your secure login to Bashō.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 36px; font-weight: 700; color: #C85428; letter-spacing: 6px; font-family: 'Inter', monospace; background: #FDFBF7; padding: 15px 30px; border: 1px dashed #C85428; border-radius: 8px;">
        ${otp}
      </span>
    </div>

    <p style="font-size: 13px; color: #888; text-align: center;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
  `;
  return await sendEmail({
    to: email,
    subject: 'Your Login Code - Bashō',
    html: getHtmlTemplate('Login Verification', content),
  });
}

// ==========================================
// 2️⃣ ORDER CONFIRMATION (Payment Success)
// ==========================================
export async function sendPaymentSuccessEmail(order, items) {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="color: #442D1C;">${
        item.name
      } <span style="color: #8E5022; font-size: 12px;">× ${
        item.quantity
      }</span></td>
      <td style="text-align: right; font-weight: 600;">₹${(
        item.price * item.quantity
      ).toFixed(2)}</td>
    </tr>
  `,
    )
    .join('');

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span class="status-badge">Payment Confirmed</span>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">Thank you, ${
      order.customerName ? order.customerName.split(' ')[0] : 'Customer'
    }</h2>
    <p style="text-align: center; margin-bottom: 30px;">Your clay treasures have been secured. We are now preparing them for their journey.</p>
    
    <table class="info-box-table">
      <tr>
        <td class="info-box-td" style="border-bottom: 1px dashed #EDD8B4;">
          <span style="color: #8E5022; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Order Reference</span>
        </td>
        <td class="info-box-td" style="text-align: right; border-bottom: 1px dashed #EDD8B4;">
          <span style="color: #442D1C; font-family: monospace; font-size: 14px;">#${
            order.orderNumber || order.id.slice(0, 8).toUpperCase()
          }</span>
        </td>
      </tr>
      <tr>
        <td class="info-box-td">
          <span style="color: #8E5022; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Date</span>
        </td>
        <td class="info-box-td" style="text-align: right;">
          <span style="color: #442D1C; font-size: 14px;">${new Date().toLocaleDateString(
            'en-IN',
            { day: 'numeric', month: 'long', year: 'numeric' },
          )}</span>
        </td>
      </tr>
    </table>

    <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #442D1C; margin-top: 30px; border-bottom: 1px solid #EDD8B4; padding-bottom: 10px;">Order Summary</h3>
    <table class="product-table">
      ${itemsHtml}
      <tr class="total-row">
        <td>Total Paid</td>
        <td style="text-align: right; color: #C85428;">₹${order.total.toFixed(
          2,
        )}</td>
      </tr>
    </table>

    <div style="text-align: center; margin-top: 40px;">
      <a href="${process.env.NEXT_PUBLIC_URL}/profile/orders/${
    order.id
  }" class="btn">Track Order Details</a>
    </div>
  `;

  return await sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmed #${order.orderNumber || order.id.slice(0, 8)}`,
    html: getHtmlTemplate('Order Confirmation', content),
  });
}

// ==========================================
// 3️⃣ ORDER STATUS UPDATES (Admin Triggered)
// ==========================================
export async function sendOrderStatusEmail(order, status) {
  let subject = '';
  let heading = '';
  let message = '';
  let trackingInfo = '';

  switch (status) {
    case 'PROCESSING':
      subject = `We're working on it! Order #${
        order.orderNumber || order.id.slice(0, 8)
      }`;
      heading = 'In the Kiln';
      message =
        'Your order is now being processed. Our artisans are carefully packaging your items.';
      break;

    case 'SHIPPED':
      subject = `On its way! Order #${
        order.orderNumber || order.id.slice(0, 8)
      }`;
      heading = 'Shipped & En Route';
      message =
        'Great news! Your package has left our studio and is on its way to you.';
      if (order.trackingNumber) {
        trackingInfo = `
          <table class="info-box-table" style="margin-top: 20px;">
            <tr>
              <td class="info-box-td" style="text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #8E5022; text-transform: uppercase; font-weight: 700;">Tracking Number</p>
                <p style="margin: 5px 0 0; font-size: 18px; font-weight: 700; color: #442D1C; font-family: monospace;">${order.trackingNumber}</p>
              </td>
            </tr>
          </table>
        `;
      }
      break;

    case 'DELIVERED':
      subject = `Delivered! Order #${
        order.orderNumber || order.id.slice(0, 8)
      }`;
      heading = 'Arrived Safely';
      message =
        'Your package has been delivered. We hope you cherish your new Bashō pieces.';
      break;

    default:
      return;
  }

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="status-badge">${status}</span>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">${heading}</h2>
    <p style="text-align: center; margin-bottom: 30px;">${message}</p>
    
    ${trackingInfo}

    <div style="text-align: center; margin-top: 40px;">
      <a href="${process.env.NEXT_PUBLIC_URL}/profile/orders/${order.id}" class="btn">View Order</a>
    </div>
  `;

  return await sendEmail({
    to: order.customerEmail,
    subject,
    html: getHtmlTemplate(heading, content),
  });
}
