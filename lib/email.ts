/**
 * Email Utilities
 * 
 * Helper functions for sending emails
 * - Configure email service (SendGrid, Resend, etc.)
 * - Email templates
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using configured email service
 * 
 * TODO: Configure your preferred email service:
 * - SendGrid
 * - Resend
 * - AWS SES
 * - Nodemailer
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // 
  // await sgMail.send({
  //   to,
  //   from: process.env.EMAIL_FROM,
  //   subject,
  //   html,
  //   text
  // });

  // Example with Resend:
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // 
  // await resend.emails.send({
  //   from: process.env.EMAIL_FROM,
  //   to,
  //   subject,
  //   html
  // });

  // For development, just log the email
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    return;
  }

  // In production, throw error if not configured
  throw new Error('Email service not configured');
}

/**
 * Email Templates
 */

export function getWelcomeEmailTemplate(name: string) {
  return {
    subject: 'Welcome to Restaurant Management',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Restaurant Management!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for registering with us! We're excited to have you on board.</p>
              <p>You can now:</p>
              <ul>
                <li>Browse our delicious menu with AR/3D views</li>
                <li>Place orders directly from your table</li>
                <li>Track your order in real-time</li>
                <li>Make table reservations</li>
              </ul>
              <a href="${process.env.NEXTAUTH_URL}/customer/menu" class="button">Start Ordering</a>
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Enjoy your meal!</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name}, Welcome to Restaurant Management! Thank you for registering with us.`
  };
}

export function getPasswordResetEmailTemplate(name: string, resetUrl: string) {
  return {
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>You requested to reset your password. Click the button below to set a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour.
              </div>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name}, You requested to reset your password. Visit this link: ${resetUrl}. This link will expire in 1 hour.`
  };
}

export function getOrderConfirmationEmailTemplate(
  name: string,
  orderNumber: string,
  items: any[],
  total: number
) {
  const itemsList = items
    .map(item => `<li>${item.quantity}x ${item.name} - $${item.price}</li>`)
    .join('');

  return {
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .total { font-size: 1.5em; font-weight: bold; color: #f97316; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for your order! Your food is being prepared.</p>
              <div class="order-details">
                <h3>Order #${orderNumber}</h3>
                <ul>${itemsList}</ul>
                <p class="total">Total: $${total.toFixed(2)}</p>
              </div>
              <p>We'll notify you when your order is ready!</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name}, Your order #${orderNumber} has been confirmed. Total: $${total.toFixed(2)}`
  };
}
