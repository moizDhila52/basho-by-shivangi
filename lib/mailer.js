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
                    src="${
                      process.env.NEXT_PUBLIC_URL
                    }/images/others/Basho - logotm-03.jpg" 
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

// ==========================================
// 4️⃣ WORKSHOP CONFIRMATION (The Missing Function)
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
  const subject = 'Welcome to the Inner Circle | Bashō Ceramics';
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

  return await sendEmail({
    to: email,
    subject,
    html: getHtmlTemplate(heading, content),
  });
}

// ==========================================
// 5️⃣ PRODUCT RESTOCK NOTIFICATION
// ==========================================
export async function sendRestockEmail(email, product) {
  const subject = `Back in Stock: ${product.name}`;
  const heading = "It's Back!";

  // Use the first image or a placeholder
  const imageUrl =
    product.images && product.images[0]
      ? product.images[0]
      : `${process.env.NEXT_PUBLIC_URL}/images/placeholder-pottery.jpg`;

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="status-badge" style="background-color: #d1fae5; color: #065f46;">Back in Stock</span>
    </div>
    <h2 style="font-family: 'Playfair Display', serif; margin-top: 0; text-align: center;">The wait is over</h2>
    <p style="text-align: center; margin-bottom: 30px;">The piece you've been waiting for is available again. We wanted you to be the first to know.</p>

    <div style="background-color: #ffffff; border: 1px solid #EDD8B4; border-radius: 12px; overflow: hidden; max-width: 300px; margin: 0 auto 30px; text-align: center;">
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

  return await sendEmail({
    to: email,
    subject,
    html: getHtmlTemplate(heading, content),
  });
}

export async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to Bashō Ceramics';
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

// A. Request Received (Sent when user submits form)
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

// B. Status Update (QUOTED, IN_PROGRESS, etc.)
export async function sendCustomOrderStatusEmail(customOrder, status) {
  let subject = '';
  let heading = '';
  let message = '';
  let actionButton = 'View Request';

  // Customize message based on status
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
      return; // Don't send email for unknown statuses
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
    to: customOrder.user.email, // Ensure you include User relation when fetching order
    subject,
    html: getHtmlTemplate(heading, content),
  });
}

// ==========================================
// 8️⃣ WORKSHOP UPDATES (Reminders/Cancel)
// ==========================================
export async function sendWorkshopUpdateEmail(
  registration,
  type,
  customMessage,
) {
  // type can be 'REMINDER' or 'CANCELLED' or 'UPDATE'

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
    badgeColor = '#fecaca'; // Light red
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
