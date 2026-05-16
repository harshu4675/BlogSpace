import nodemailer from "nodemailer";

// ES Module fix for nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Skip if email not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`📧 Email skipped (not configured): ${subject} → ${to}`);
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"BlogSpace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, ""),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return false;
  }
};

export const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; }
        .logo { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .logo-icon { width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: white; }
        .logo-text { font-size: 24px; font-weight: 700; color: white; }
        .header h1 { color: white; font-size: 28px; font-weight: 700; }
        .body { padding: 40px; }
        .body h2 { font-size: 22px; color: #1e293b; margin-bottom: 12px; }
        .body p { color: #64748b; line-height: 1.7; margin-bottom: 16px; }
        .features { background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .feature { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; color: #475569; font-size: 15px; }
        .feature:last-child { margin-bottom: 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 8px 0; }
        .footer { background: #f8fafc; padding: 24px 40px; text-align: center; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <div class="logo-icon">B</div>
            <div class="logo-text">BlogSpace</div>
          </div>
          <h1>Welcome aboard! 🚀</h1>
        </div>
        <div class="body">
          <h2>Hey ${user.name}! 👋</h2>
          <p>You're officially part of BlogSpace — your go-to platform for discovering amazing content, connecting with creators, and sharing your own stories with the world.</p>
          
          <div class="features">
            <div class="feature">📖 Read trending articles from top creators</div>
            <div class="feature">💬 Join conversations and share your thoughts</div>
            <div class="feature">❤️ Like and bookmark your favorite posts</div>
            <div class="feature">✍️ Apply to become an author and share your voice</div>
            <div class="feature">🔔 Get personalized content recommendations</div>
          </div>

          <p>Ready to dive in?</p>
          <a href="${process.env.CLIENT_URL || "http://localhost:3000"}" class="btn">
            Explore BlogSpace →
          </a>
          
          <p style="margin-top: 24px; font-size: 14px; color: #94a3b8;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} BlogSpace. Made with ❤️ for curious minds.<br>
          <a href="${process.env.CLIENT_URL || "http://localhost:3000"}" style="color: #6366f1;">Visit BlogSpace</a>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: "Welcome to BlogSpace! 🚀",
    html,
  });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; }
        .header h1 { color: white; font-size: 28px; font-weight: 700; }
        .body { padding: 40px; }
        .body p { color: #64748b; line-height: 1.7; margin-bottom: 16px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; }
        .warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; font-size: 14px; color: #92400e; margin-top: 24px; }
        .footer { background: #f8fafc; padding: 24px 40px; text-align: center; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password 🔐</h1>
        </div>
        <div class="body">
          <p>Hey <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password for your BlogSpace account. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" class="btn">Reset My Password →</a>
          </div>

          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px; color: #6366f1;">${resetUrl}</p>

          <div class="warning">
            ⚠️ This link expires in <strong>10 minutes</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't be changed.
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} BlogSpace. This is an automated email, please do not reply.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: "Password Reset Request — BlogSpace",
    html,
  });
};

export const sendNewPostNotificationEmail = async ({
  subscriberEmail,
  post,
  author,
}) => {
  const postUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/blog/${post.slug}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 40px; }
        .header h1 { color: white; font-size: 22px; font-weight: 700; }
        .img-container { width: 100%; height: 200px; overflow: hidden; }
        .img-container img { width: 100%; height: 100%; object-fit: cover; }
        .body { padding: 32px 40px; }
        .body h2 { font-size: 20px; color: #1e293b; margin-bottom: 12px; line-height: 1.3; }
        .body p { color: #64748b; line-height: 1.7; margin-bottom: 16px; }
        .meta { display: flex; gap: 16px; font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; }
        .footer { background: #f8fafc; padding: 20px 40px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📰 New Post on BlogSpace</h1>
        </div>
        ${post.coverImage?.url ? `<div class="img-container"><img src="${post.coverImage.url}" alt="${post.title}"></div>` : ""}
        <div class="body">
          <div class="meta">
            <span>✍️ ${author.name}</span>
            <span>📖 ${post.readTime || 5} min read</span>
          </div>
          <h2>${post.title}</h2>
          <p>${post.excerpt || "Click to read the full article..."}</p>
          <a href="${postUrl}" class="btn">Read Article →</a>
        </div>
        <div class="footer">
          You're receiving this because you subscribed to BlogSpace newsletters.<br>
          <a href="${process.env.CLIENT_URL}/unsubscribe" style="color: #6366f1;">Unsubscribe</a>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: subscriberEmail,
    subject: `New Post: ${post.title}`,
    html,
  });
};
