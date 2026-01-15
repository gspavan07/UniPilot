const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

/**
 * Mail Service for digital notifications
 */
class MailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.EMAIL_FROM || "noreply@university.edu";
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.initialize();
  }

  async initialize() {
    if (this.isDevelopment) {
      // Create a test account for development (Ethereal Email)
      // Or just log to console
      logger.info(
        "Mail service initialized in Development mode (Logging only)"
      );
      return;
    }

    // Example for AWS SES or SMTP
    // For production, you'd add SMTP_HOST, SMTP_PORT. etc to .env
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send a generic email
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      if (this.isDevelopment || !this.transporter) {
        logger.info(`[Email Mock] To: ${to} | Subject: ${subject}`);
        return { success: true, mock: true };
      }

      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
        html,
      });

      logger.info(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error("Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Digital Payslip Notification
   */
  async sendPayslipNotification(user, payslip) {
    const monthNames = [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const subject = `Payslip Published - ${monthNames[payslip.month]} ${payslip.year}`;
    const name = `${user.first_name} ${user.last_name}`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Salary Payment Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Your salary for <b>${monthNames[payslip.month]} ${payslip.year}</b> has been processed and credited to your bank account.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><b>Net Salary:</b> ₹${payslip.net_salary}</p>
          <p style="margin: 5px 0;"><b>Payment Date:</b> ${payslip.payment_date || new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><b>Transaction Ref:</b> ${payslip.transaction_ref || "N/A"}</p>
        </div>
        
        <p>You can view and download your detailed payslip from the <b>HR Self-Service</b> portal.</p>
        
        <a href="${process.env.FRONTEND_URL}/hr/my-payroll" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">View Payslip</a>
        
        <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">This is an automated message from ${process.env.UNIVERSITY_NAME || "UniPilot"}. Please do not reply.</p>
      </div>
    `;

    return this.sendEmail({ to: user.email, subject, html });
  }
}

module.exports = new MailService();
