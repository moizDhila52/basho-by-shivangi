import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ==========================================
// 🔗 UNSUBSCRIBE LINK HELPER
// ==========================================
const getUnsubscribeHtml = (email) => {
  const url = `${process.env.NEXT_PUBLIC_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
  return `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #EDD8B4; text-align: center;">
      <p style="font-size: 11px; color: #8E5022; margin: 0; line-height: 1.5;">
        No longer want to receive these emails? <br/>
        <a href="${url}" style="color: #442D1C; text-decoration: underline; font-weight: 600;">Unsubscribe here</a>.
      </p>
    </div>
  `;
};

// ==========================================
// 🎨 MASTER EMAIL LAYOUT (Mobile Responsive)
// ==========================================
// Modified to accept optional footerLink
const getHtmlTemplate = (title, bodyContent, footerLink = '') => {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
        
        /* Reset & Basics */
        body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #FDFBF7; width: 100% !important; height: 100% !important; }
        a { color: inherit; text-decoration: none; }
        img { border: 0; outline: none; text-decoration: none; display: block; max-width: 100%; height: auto; }
        
        /* Layout */
        .wrapper { width: 100%; table-layout: fixed; background-color: #FDFBF7; padding-bottom: 40px; }
        .content { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(68, 45, 28, 0.08); }
        
        /* Sections */
        .header { background-color: #ffffff; padding: 40px 20px 20px; text-align: center; border-bottom: 3px solid #FDFBF7; }
        .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 36px; font-weight: 700; color: #442D1C !important; text-decoration: none; letter-spacing: -0.5px; }
        .body-text { font-family: 'Inter', Helvetica, Arial, sans-serif; color: #442D1C; padding: 40px 40px 20px; line-height: 1.6; font-size: 15px; }
        .footer { background-color: #F9F5F0; padding: 30px 20px; text-align: center; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 12px; color: #8E5022; }
        
        /* Components */
        .btn { display: inline-block; background-color: #442D1C; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 20px; font-family: 'Inter', sans-serif; transition: background-color 0.3s ease; }
        .status-badge { background-color: #EDD8B4; color: #442D1C; padding: 6px 16px; border-radius: 50px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        
        /* Tables */
        .info-box-table { width: 100%; background-color: #FDFBF7; border: 1px solid #EDD8B4; border-radius: 8px; border-spacing: 0; border-collapse: separate; margin: 20px 0; }
        .info-box-td { padding: 15px 20px; vertical-align: middle; }
        .product-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .product-table td { padding: 12px 0; border-bottom: 1px solid #F3F0EB; font-size: 14px; }
        .total-row td { border-top: 2px solid #EDD8B4; border-bottom: none; font-weight: 700; padding-top: 15px; font-size: 16px; }

        /* ===================================== 
           📱 MOBILE RESPONSIVE STYLES 
           ===================================== */
        @media only screen and (max-width: 600px) {
          /* Expand content to full width */
          .wrapper { padding-bottom: 0 !important; }
          .content { width: 100% !important; border-radius: 0 !important; border: none !important; box-shadow: none !important; }
          
          /* Adjust Padding */
          .header { padding: 30px 15px 15px !important; }
          .body-text { padding: 25px 20px 30px !important; font-size: 16px !important; line-height: 1.7 !important; }
          .footer { padding: 30px 20px !important; }
          
          /* Typography */
          h1 { font-size: 24px !important; }
          h2 { font-size: 22px !important; line-height: 1.3 !important; }
          h3 { font-size: 18px !important; }
          .logo { font-size: 28px !important; }
          
          /* Full Width Buttons */
          .btn { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 16px 0 !important; font-size: 16px !important; }
          
          /* Table Adjustments */
          .info-box-td { padding: 12px 15px !important; display: block !important; width: auto !important; text-align: center !important; }
          .info-box-td[style*="text-align: right"] { text-align: center !important; padding-top: 0 !important; }
          
          /* Specific Logic for Product Table (Keep side-by-side but tighter) */
          .product-table td { padding: 10px 0 !important; font-size: 13px !important; }
          
          /* Image Resizing */
          img { max-width: 100% !important; height: auto !important; }
        }
      </style>
    </head>
    <body>
      <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <div class="content">
              <div class="header">
                <a href="${process.env.NEXT_PUBLIC_URL}" style="display: block; text-align: center; text-decoration: none;">
                  <img 
                    src="${process.env.NEXT_PUBLIC_URL}/images/Basho - logotm-03.jpg" 
                    alt="Bashō" 
                    width="120" 
                    style="display: block; margin: 0 auto; max-width: 150px; height: auto; border: 0;"
                  />
                </a>
                <div style="font-family: 'Inter', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C85428; margin-top: 5px;">Handcrafted Japanese byy Shivangi</div>
              </div>

              <div class="body-text">
                ${bodyContent}
              </div>

              <div class="footer">
                <p style="margin-bottom: 10px;"><strong>Need help?</strong> Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_URL}/contact" style="color: #442D1C; text-decoration: underline;">Support Center</a>.</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">R.S.No.811 Paikee Plot No.311, Silent Zone, Opp. Airport, Surat-Dumas Road, Village-Gavier, Surat-395007, Gujarat, India.</p>
                
                ${footerLink}

                <p style="margin-top: 20px; font-size: 11px; opacity: 0.7;">© ${new Date().getFullYear()} Bashō byy Shivangi. All rights reserved.</p>
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
      from: `"Bashō Byy Shivangi" <${process.env.MAIL_USER}>`,
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
      <span style="font-size: 32px; font-weight: 700; color: #C85428; letter-spacing: 6px; font-family: 'Inter', monospace; background: #FDFBF7; padding: 15px 30px; border: 1px dashed #C85428; border-radius: 8px; display: inline-block;">
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
      <td style="color: #442D1C; line-height: 1.4;">${item.name} 
        <div style="color: #8E5022; font-size: 12px; margin-top: 2px;">Qty: ${item.quantity}</div>
      </td>
      <td style="text-align: right; font-weight: 600; white-space: nowrap;">₹${(
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
                <p style="margin: 5px 0 0; font-size: 18px; font-weight: 700; color: #442D1C; font-family: monospace; word-break: break-all;">${order.trackingNumber}</p>
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

// ==========================================
// 4️⃣ WORKSHOP CONFIRMATION
// ==========================================
export async function sendWorkshopConfirmationEmail(registration) {
  const { WorkshopSession, id } = registration;
  const { Workshop, date, time } = WorkshopSession;

  const subject = `You're In! Ticket for ${Workshop.title}`;
  const heading = 'Workshop Confirmed';

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span class="status-badge">Ticket Confirmed</span>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">${heading}</h2>
    <p style="text-align: center; margin-bottom: 30px;">We are excited to see you at the studio! Here are your session details.</p>

    <div style="background-color: #FDFBF7; border: 1px dashed #EDD8B4; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
      <h3 style="margin: 0 0 10px; color: #442D1C; font-size: 18px;">${
        Workshop.title
      }</h3>
      <p style="margin: 0; color: #8E5022; font-size: 14px;">${new Date(
        date,
      ).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })} at ${time}</p>
      <p style="margin: 5px 0 0; color: #8E5022; font-size: 14px;">📍 ${
        Workshop.location
      }</p>
    </div>

    <div style="text-align: center;">
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8E5022; font-weight: 700;">Your Ticket ID</p>
      <p style="font-family: monospace; font-size: 24px; color: #442D1C; font-weight: 700; background: #fff; display: inline-block; padding: 10px 20px; border: 1px solid #eee; border-radius: 8px; margin-top: 5px;">
        ${id.slice(0, 8).toUpperCase()}
      </p>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <a href="${
        process.env.NEXT_PUBLIC_URL
      }/profile/workshops" class="btn">View My Ticket</a>
    </div>
  `;

  return await sendEmail({
    to: registration.customerEmail,
    subject,
    html: getHtmlTemplate(heading, content),
  });
}

export async function sendNewsletterWelcomeEmail(email) {
  const subject = 'Welcome to the Inner Circle | Bashō byy Shivangi';
  const heading = 'Welcome to Bashō';

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span class="status-badge">Subscription Confirmed</span>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">Welcome to the Fold</h2>
    <p style="text-align: center; margin-bottom: 30px;">Thank you for joining the Bashō community. You are now on the list to receive updates on our latest collections, pottery workshops, and studio stories.</p>

    <div style="background-color: #FDFBF7; border: 1px dashed #EDD8B4; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
      <p style="margin: 0; font-style: italic; color: #8E5022; font-size: 16px;">
        "In the cherry blossom's shade<br/>
        there's no such thing<br/>
        as a stranger."
      </p>
      <p style="margin-top: 10px; font-size: 12px; color: #442D1C; font-weight: 700;">— Kobayashi Issa</p>
    </div>

    <p style="text-align: center; font-size: 13px; color: #666;">
      We promise to keep our correspondence meaningful and infrequent.
    </p>

    <div style="text-align: center; margin-top: 40px;">
      <a href="${process.env.NEXT_PUBLIC_URL}/products" class="btn">Explore Collection</a>
    </div>
  `;

  // UNSUBSCRIBE LOGIC ADDED
  const unsubscribeFooter = getUnsubscribeHtml(email);

  return await sendEmail({
    to: email,
    subject,
    html: getHtmlTemplate(heading, content, unsubscribeFooter),
  });
}

// ==========================================
// 5️⃣ PRODUCT RESTOCK NOTIFICATION
// ==========================================
export async function sendRestockEmail(email, product) {
  const subject = `Back in Stock: ${product.name}`;
  const heading = "It's Back!";

  const imageUrl =
    product.images && product.images[0]
      ? product.images[0]
      : `${process.env.NEXT_PUBLIC_URL}/public/images/Basho - logotm-03.jpg`;

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="status-badge" style="background-color: #d1fae5; color: #065f46;">Back in Stock</span>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">The wait is over</h2>
    <p style="text-align: center; margin-bottom: 30px;">The piece you've been waiting for is available again. We wanted you to be the first to know.</p>

    <div style="background-color: #ffffff; border: 1px solid #EDD8B4; border-radius: 12px; overflow: hidden; max-width: 300px; width: 100%; margin: 0 auto 30px; text-align: center;">
      <div style="width: 100%; height: 200px; background-color: #FDFBF7; overflow: hidden;">
        <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 5px; color: #442D1C; font-size: 16px;">${product.name}</h3>
        <p style="margin: 0; color: #8E5022; font-weight: 600;">₹${product.price}</p>
      </div>
    </div>

    <p style="text-align: center; font-size: 13px; color: #666;">
      Stock is limited and these pieces tend to find homes quickly.
    </p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_URL}/products/${product.slug}" class="btn">Shop Now</a>
    </div>
  `;

  // UNSUBSCRIBE LOGIC ADDED
  const unsubscribeFooter = getUnsubscribeHtml(email);

  return await sendEmail({
    to: email,
    subject,
    html: getHtmlTemplate(heading, content, unsubscribeFooter),
  });
}

export async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to Bashō byy Shivangi';
  const heading = 'Welcome to the Fold';

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span class="status-badge" style="background-color: #FDFBF7; border: 1px solid #EDD8B4;">Member Verified</span>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">Hello, ${name}</h2>
    <p style="text-align: center; margin-bottom: 30px;">
      Thank you for joining our community. You now have access to custom order requests, workshop bookings, and your personal collection history.
    </p>

    <div style="background-color: #FDFBF7; border: 1px dashed #EDD8B4; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
      <p style="margin: 0; font-style: italic; color: #8E5022; font-size: 16px;">
        "In the cherry blossom's shade<br/>
        there's no such thing<br/>
        as a stranger."
      </p>
      <p style="margin-top: 10px; font-size: 12px; color: #442D1C; font-weight: 700;">— Kobayashi Issa</p>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <a href="${process.env.NEXT_PUBLIC_URL}/products" class="btn">Start Exploring</a>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html: getHtmlTemplate(heading, content),
  });
}

// ==========================================
// 7️⃣ CUSTOM ORDER EMAILS
// ==========================================

// A. Request Received
export async function sendCustomOrderReceivedEmail(email, name, productType) {
  const subject = 'We received your custom request';
  const heading = 'Request Received';

  const content = `
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">Hello, ${name}</h2>
    <p style="text-align: center; margin-bottom: 30px;">
      Thank you for trusting Bashō with your vision. We have received your request for a custom <strong>${productType}</strong>.
    </p>

    <div style="background-color: #FDFBF7; border: 1px dashed #EDD8B4; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
      <h3 style="margin: 0 0 10px; color: #442D1C; font-size: 16px;">What happens next?</h3>
      <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
        Our artisans will review your requirements. We typically respond with a price quote and timeline within <strong>2-3 business days</strong>.
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_URL}/profile/custom-orders" class="btn">View My Request</a>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html: getHtmlTemplate(heading, content),
  });
}

// B. Status Update
export async function sendCustomOrderStatusEmail(customOrder, status) {
  let subject = '';
  let heading = '';
  let message = '';
  let actionButton = 'View Request';

  switch (status) {
    case 'QUOTED':
      subject = 'Price Quote Received: Custom Request';
      heading = 'Quote Ready';
      message = `Great news! We have reviewed your request for a <strong>${customOrder.productType}</strong>. The estimated price is <strong>₹${customOrder.actualPrice}</strong>. Please review and approve it to start production.`;
      actionButton = 'Review Quote';
      break;

    case 'APPROVED':
      subject = 'Production Approved';
      heading = "Let's Begin";
      message =
        'Thank you for approving the quote. We will notify you once production begins.';
      break;

    case 'IN_PROGRESS':
      subject = 'Update: Work in Progress';
      heading = 'In the Studio';
      message = `Our hands are in the clay! Your custom <strong>${customOrder.productType}</strong> is now being crafted.`;
      break;

    case 'COMPLETED':
      subject = 'Your Custom Piece is Ready!';
      heading = "It's Ready";
      message = `The wait is over. Your custom <strong>${customOrder.productType}</strong> is finished and ready for shipment.`;
      break;

    case 'REJECTED':
      subject = 'Update on your Custom Request';
      heading = 'Request Update';
      message =
        'We have reviewed your request. Unfortunately, we cannot fulfill this specific design at this time. Please check your dashboard for details.';
      break;

    default:
      return;
  }

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="status-badge">${status.replace('_', ' ')}</span>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">${heading}</h2>
    <p style="text-align: center; margin-bottom: 30px;">${message}</p>

    <div style="text-align: center; margin-top: 40px;">
      <a href="${process.env.NEXT_PUBLIC_URL}/profile/custom-orders/${
    customOrder.id
  }" class="btn">${actionButton}</a>
    </div>
  `;

  return await sendEmail({
    to: customOrder.user.email,
    subject,
    html: getHtmlTemplate(heading, content),
  });
}

// ==========================================
// 8️⃣ WORKSHOP UPDATES
// ==========================================
export async function sendWorkshopUpdateEmail(
  registration,
  type,
  customMessage,
) {
  const { WorkshopSession } = registration;
  const { Workshop, date, time } = WorkshopSession;

  let subject = `Update: ${Workshop.title}`;
  let heading = 'Workshop Update';
  let badgeColor = '#EDD8B4';
  let badgeText = 'Update';

  if (type === 'REMINDER') {
    subject = `Reminder: Workshop Tomorrow!`;
    heading = 'See you soon';
    badgeText = 'Reminder';
  } else if (type === 'CANCELLED') {
    subject = `Important: Workshop Cancelled`;
    heading = 'Session Cancelled';
    badgeColor = '#fecaca';
    badgeText = 'Cancelled';
  }

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span class="status-badge" style="background-color: ${badgeColor};">${badgeText}</span>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">${heading}</h2>
    
    <div style="background-color: #FDFBF7; border: 1px solid #EDD8B4; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; font-weight: bold; color: #442D1C;">${
        Workshop.title
      }</p>
      <p style="margin: 5px 0 0; color: #8E5022; font-size: 14px;">${new Date(
        date,
      ).toLocaleDateString()} at ${time}</p>
    </div>

    <p style="text-align: center; margin-bottom: 30px; line-height: 1.6;">
      ${
        customMessage ||
        'We are writing to provide an update regarding your upcoming session.'
      }
    </p>

    <div style="text-align: center; margin-top: 40px;">
      <a href="${
        process.env.NEXT_PUBLIC_URL
      }/profile/workshops" class="btn">View Details</a>
    </div>
  `;

  return await sendEmail({
    to: registration.customerEmail,
    subject,
    html: getHtmlTemplate(heading, content),
  });
}

// ==========================================
// 9️⃣ NEWSLETTER CAMPAIGN
// ==========================================

export async function sendCampaignEmail(subscribers, campaignData) {
  const { type, item, customSubject, customMessage } = campaignData;

  let subject = customSubject || "News from Bashō byy Shivangi";
  let heading = "Studio Update";
  let contentHtml = "";

  if (type === 'PRODUCT') {
    const imageUrl = item.images && item.images[0] ? item.images[0] : "";
    subject = customSubject || `New Arrival: ${item.name}`;
    heading = "Featured Collection";
    
    contentHtml = `
      <div style="text-align: center;">
        <img src="${imageUrl}" style="width: 100%; max-width: 400px; height: auto; border-radius: 4px; margin-bottom: 20px; display: inline-block;" />
        <h3 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #442D1C; margin: 0 0 10px;">${item.name}</h3>
        <p style="font-size: 18px; color: #8E5022; font-weight: 600;">₹${item.price}</p>
        <p style="color: #666; margin-bottom: 30px;">${customMessage || item.description.substring(0, 150) + "..."}</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/products/${item.slug}" class="btn">Shop Now</a>
      </div>
    `;
  } 
  
  else if (type === 'WORKSHOP') {
    subject = customSubject || `Join us: ${item.title}`;
    heading = "Upcoming Workshop";
    
    contentHtml = `
      <div style="text-align: center;">
        <img src="${item.image}" style="width: 100%; max-width: 400px; height: auto; border-radius: 4px; margin-bottom: 20px; display: inline-block;" />
        <h3 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #442D1C; margin: 0 0 10px;">${item.title}</h3>
        <div style="background: #FDFBF7; padding: 15px; border: 1px dashed #EDD8B4; margin: 20px auto; display: inline-block; width: 100%; box-sizing: border-box;">
            <p style="margin: 0; color: #8E5022;"><strong>Instructor:</strong> ${item.instructorName}</p>
            <p style="margin: 5px 0 0; color: #8E5022;"><strong>Location:</strong> ${item.location}</p>
        </div>
        <p style="color: #666; margin-bottom: 30px;">${customMessage || "Master the art of pottery in our upcoming session. Spots are filling up fast."}</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/workshops/${item.slug}" class="btn">Book Your Spot</a>
      </div>
    `;
  } 

  else if (type === 'CATEGORY') {
    subject = customSubject || `Discover: ${item.name}`;
    heading = "New Collection";

    const placeholderImg = `${process.env.NEXT_PUBLIC_URL}/images/placeholder-category.jpg`;

    contentHtml = `
      <div style="text-align: center;">
        <img src="${placeholderImg}" style="width: 100%; max-width: 400px; height: auto; border-radius: 4px; margin-bottom: 20px; display: inline-block;" />
        <h3 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #442D1C; margin: 0 0 10px;">${item.name}</h3>
        <p style="color: #666; margin-bottom: 30px;">${customMessage || item.description || "Browse our newest curation of handcrafted byy Shivangi."}</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/shop?category=${item.slug}" class="btn">View Collection</a>
      </div>
    `;
  }
  
  else if (type === 'EVENT') {
    subject = customSubject || `You're Invited: ${item.title}`;
    heading = "Event Invitation";

    contentHtml = `
      <div style="text-align: center;">
        <img src="${item.image}" style="width: 100%; max-width: 400px; height: auto; border-radius: 4px; margin-bottom: 20px; display: inline-block;" />
        <h3 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #442D1C; margin: 0 0 10px;">${item.title}</h3>
        <p style="font-size: 16px; color: #C85428; text-transform: uppercase; letter-spacing: 1px;">${new Date(item.startDate).toLocaleDateString()}</p>
        <p style="color: #666; margin-bottom: 30px;">${customMessage || item.description.substring(0, 150) + "..."}</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/events/${item.slug}" class="btn">View Event Details</a>
      </div>
    `;
  }

  // UNSUBSCRIBE LOGIC ADDED:
  // We must generate unique HTML for every user inside the loop
  // so the unsubscribe link corresponds to their email.
  
  let successCount = 0;
  
  const emailPromises = subscribers.map(email => {
    // 1. Generate unique unsubscribe link
    const unsubscribeFooter = getUnsubscribeHtml(email);
    
    // 2. Generate full HTML for this specific user
    const userSpecificHtml = getHtmlTemplate(heading, contentHtml, unsubscribeFooter);

    return transporter.sendMail({
      from: `"Bashō byy Shivangi" <${process.env.MAIL_USER}>`,
      to: email, 
      subject: subject,
      html: userSpecificHtml,
    }).then(() => { successCount++; }).catch(err => console.error(`Failed to send to ${email}`, err));
  });

  await Promise.allSettled(emailPromises);
  
  return { success: true, count: successCount, subject };
}

// ==========================================
// 11️⃣ UNSUBSCRIBE CONFIRMATION
// ==========================================
export async function sendUnsubscribeConfirmationEmail(email) {
  const subject = 'You have been unsubscribed | Bashō byy Shivangi';
  const heading = 'Unsubscribe Confirmed';

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span class="status-badge" style="background-color: #f3f4f6; color: #4b5563;">Unsubscribed</span>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">We're sorry to see you go</h2>
    <p style="text-align: center; margin-bottom: 30px;">
      This email confirms that <strong>${email}</strong> has been removed from our newsletter mailing list.
    </p>

    <div style="background-color: #FDFBF7; border: 1px dashed #EDD8B4; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
      <p style="margin: 0; color: #8E5022; font-size: 14px; line-height: 1.6;">
        Did you make a mistake? You can always resubscribe via your account profile or our website footer.
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_URL}/products" class="btn">Return to Shop</a>
    </div>
  `;

  // No unsubscribe footer needed for this email since they just unsubscribed
  return await sendEmail({
    to: email,
    subject,
    html: getHtmlTemplate(heading, content),
  });
}
// ==========================================
// 10️⃣ INQUIRY & CONTACT EMAILS
// ==========================================

// A. Auto-Reply to User
export async function sendInquiryAutoReply(email, name) {
  const content = `
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; color: #442D1C;">We've received your message</h2>
    <p>Hello ${name},</p>
    <p>Thank you for reaching out to Bashō byy Shivangi. This is just a quick note to let you know that we've received your inquiry and our team is already looking into it.</p>
    
    <div style="background-color: #FDFBF7; border: 1px dashed #EDD8B4; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
      <p style="margin: 0; color: #8E5022; font-size: 15px; line-height: 1.6;">
        Our artisans and support team typically respond within <strong>24-48 hours</strong> during business days.
      </p>
    </div>

    <p>We look forward to connecting with you soon.</p>
    <p style="margin-top: 30px; font-style: italic; color: #8E5022;">Warmly,<br/>The Bashō Team</p>
  `;

  return await sendEmail({
    to: email,
    subject: "We've received your inquiry - Bashō byy Shivangi",
    html: getHtmlTemplate('Inquiry Received', content),
  });
}

// B. Admin Notification
export async function sendAdminInquiryNotification(details) {
  const content = `
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; color: #442D1C;">New Inquiry Received</h2>
    <p>A new inquiry has been submitted from the <strong>${details.type || 'Connect'}</strong> page.</p>
    
    <table class="info-box-table">
      <tr>
        <td class="info-box-td" style="font-weight: bold; border-bottom: 1px solid #EDD8B4;">From</td>
        <td class="info-box-td" style="border-bottom: 1px solid #EDD8B4;">${details.contactName} (${details.email})</td>
      </tr>
      <tr>
        <td class="info-box-td" style="font-weight: bold; border-bottom: 1px solid #EDD8B4;">Service</td>
        <td class="info-box-td" style="border-bottom: 1px solid #EDD8B4;">${details.service || 'General Contact'}</td>
      </tr>
      ${details.companyName ? `
      <tr>
        <td class="info-box-td" style="font-weight: bold; border-bottom: 1px solid #EDD8B4;">Company</td>
        <td class="info-box-td" style="border-bottom: 1px solid #EDD8B4;">${details.companyName}</td>
      </tr>` : ''}
    </table>

    <h3 style="color: #442D1C; font-size: 14px; text-transform: uppercase;">Message:</h3>
    <div style="background: #FDFBF7; padding: 15px; border: 1px solid #EDD8B4; border-radius: 8px; word-wrap: break-word;">
      ${details.message}
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_URL}/admin/inquiries" class="btn">View in Admin Panel</a>
    </div>
  `;

  return await sendEmail({
    to: process.env.MAIL_USER,
    subject: `New ${details.service || 'Contact'} Inquiry: ${details.contactName}`,
    html: getHtmlTemplate('New Inquiry', content),
  });
}

// C. Admin Response
export async function sendInquiryReplyEmail(email, name, adminMessage) {
  const content = `
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; color: #442D1C;">Following up on your inquiry</h2>
    <p>Hello ${name},</p>
    
    <div style="margin: 30px 0; color: #442D1C; line-height: 1.7; font-size: 16px; white-space: pre-wrap;">
      ${adminMessage}
    </div>

    <p style="border-top: 1px solid #EDD8B4; padding-top: 20px; margin-top: 40px; font-size: 13px; color: #8E5022;">
      You are receiving this because you contacted Bashō byy Shivangi. You can reply directly to this email to continue the conversation.
    </p>
  `;

  return await sendEmail({
    to: email,
    subject: "Response regarding your inquiry - Bashō byy Shivangi",
    html: getHtmlTemplate('Response from Bashō', content),
  });
}