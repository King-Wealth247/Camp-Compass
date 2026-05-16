import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_USER = process.env.SMTP_USER || 'wealthk91@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || ''; 

// We define a transporter configured for Gmail by default
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * Sends an email containing the auto-generated credentials to the newly registered user.
 * 
 * @param to The personal email address (regEmail) to send the credentials to.
 * @param institutionalEmail The generated .edu institutional email.
 * @param tempPassword The generated temporary password.
 * @param userName The name of the registered user.
 */
export async function sendRegistrationEmail(
  to: string,
  institutionalEmail: string,
  tempPassword: string,
  userName: string
): Promise<void> {
  const mailOptions = {
    from: `"Camp-Compass Registration" <${SMTP_USER}>`,
    to,
    subject: 'Welcome to Camp-Compass! Your Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2563EB;">Welcome to Camp-Compass, ${userName}!</h2>
        <p>Your institutional account has been successfully created by the Registrar.</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Login Credentials</h3>
          <p><strong>Institutional Email:</strong> ${institutionalEmail}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        
        <p style="color: #D97706; font-size: 14px;">
          <strong>Important:</strong> Please log in and change your password immediately upon your first login.
        </p>
        <p>Best regards,<br>The Camp-Compass Team</p>
      </div>
    `,
  };

  try {
    if (!SMTP_PASS) {
      console.warn('[MAILER] SMTP_PASS not set. Skipping real email dispatch.');
      console.log('[MAILER] Would have sent:', mailOptions);
      return;
    }
    
    await transporter.sendMail(mailOptions);
    console.log(`[MAILER] Registration email sent successfully to ${to}`);
  } catch (error) {
    console.error(`[MAILER] Failed to send registration email to ${to}:`, error);
  }
}
