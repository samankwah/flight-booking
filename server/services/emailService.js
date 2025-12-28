// server/services/emailService.js
import '../config/env.js'; // Ensure environment variables are loaded

// SendGrid email service
// Note: SendGrid will be installed when needed (npm install @sendgrid/mail)

let sgMail = null;
let emailServiceAvailable = false;

try {
  // Dynamically import SendGrid if available
  const sendgridModule = await import('@sendgrid/mail');
  sgMail = sendgridModule.default;

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    emailServiceAvailable = true;
    console.log('✅ SendGrid email service initialized');
  } else {
    console.warn('⚠️  SENDGRID_API_KEY not configured - Email features disabled');
  }
} catch (error) {
  console.warn('⚠️  SendGrid module not installed - Email features disabled');
  console.warn('   Run: npm install @sendgrid/mail');
}

/**
 * Send booking confirmation/status email
 * @param {Object} booking - Booking data
 * @param {string} status - Booking status (confirmed, cancelled, refunded)
 * @returns {Promise<Object>} Send result
 */
export const sendBookingEmail = async (booking, status) => {
  if (!emailServiceAvailable || !sgMail) {
    console.log(`[MOCK] Would send ${status} email for booking ${booking.id}`);
    return { success: false, message: 'Email service not available' };
  }

  try {
    let subject, text, html;

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@flightbooking.com';
    const toEmail = booking.passengerInfo?.email || booking.email;

    if (!toEmail) {
      throw new Error('No recipient email address found');
    }

    switch (status) {
      case 'confirmed':
        subject = `Booking Confirmed - ${booking.id}`;
        text = `Your flight booking has been confirmed.\n\nBooking ID: ${booking.id}\nFlight: ${booking.flightDetails?.departureAirport} to ${booking.flightDetails?.arrivalAirport}\nDeparture: ${booking.flightDetails?.departureTime}\nTotal: ${booking.currency} ${booking.totalPrice}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #06b6d4;">Booking Confirmed</h2>
            <p>Your flight booking has been confirmed successfully!</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking ID:</strong> ${booking.id}</p>
              <p><strong>Route:</strong> ${booking.flightDetails?.departureAirport} → ${booking.flightDetails?.arrivalAirport}</p>
              <p><strong>Departure:</strong> ${booking.flightDetails?.departureTime}</p>
              <p><strong>Arrival:</strong> ${booking.flightDetails?.arrivalTime}</p>
              <p><strong>Total Amount:</strong> ${booking.currency} ${booking.totalPrice}</p>
            </div>
            <p>Thank you for booking with us!</p>
          </div>
        `;
        break;

      case 'cancelled':
        subject = `Booking Cancelled - ${booking.id}`;
        text = `Your flight booking has been cancelled.\n\nBooking ID: ${booking.id}\nIf you have any questions, please contact our support team.`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Booking Cancelled</h2>
            <p>Your flight booking has been cancelled.</p>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking ID:</strong> ${booking.id}</p>
            </div>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        `;
        break;

      case 'refunded':
        subject = `Booking Refunded - ${booking.id}`;
        text = `Your flight booking has been refunded.\n\nBooking ID: ${booking.id}\nAmount: ${booking.currency} ${booking.totalPrice}\n\nThe refund will be processed to your original payment method within 5-10 business days.`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Booking Refunded</h2>
            <p>Your flight booking has been refunded successfully.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking ID:</strong> ${booking.id}</p>
              <p><strong>Refund Amount:</strong> ${booking.currency} ${booking.totalPrice}</p>
            </div>
            <p>The refund will be processed to your original payment method within 5-10 business days.</p>
          </div>
        `;
        break;

      default:
        return { success: false, message: 'Invalid status' };
    }

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject,
      text,
      html
    };

    await sgMail.send(msg);
    console.log(`✅ ${status} email sent for booking ${booking.id} to ${toEmail}`);

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send study abroad application status email
 * @param {Object} application - Application data
 * @param {string} status - Application status (under_review, accepted, rejected, waitlisted)
 * @returns {Promise<Object>} Send result
 */
export const sendApplicationEmail = async (application, status) => {
  if (!emailServiceAvailable || !sgMail) {
    console.log(`[MOCK] Would send ${status} email for application ${application.id}`);
    return { success: false, message: 'Email service not available' };
  }

  try {
    let subject, text, html;

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@flightbooking.com';
    const toEmail = application.studentInfo?.email || application.email;

    if (!toEmail) {
      throw new Error('No recipient email address found');
    }

    switch (status) {
      case 'under_review':
        subject = `Application Under Review - ${application.universityName}`;
        text = `Your application to ${application.universityName} is now under review.\n\nApplication ID: ${application.id}\nProgram: ${application.program}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #06b6d4;">Application Under Review</h2>
            <p>Your application to ${application.universityName} is now being reviewed.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Application ID:</strong> ${application.id}</p>
              <p><strong>University:</strong> ${application.universityName}</p>
              <p><strong>Program:</strong> ${application.program}</p>
            </div>
            <p>We will notify you once a decision has been made.</p>
          </div>
        `;
        break;

      case 'accepted':
        subject = `Congratulations! Application Accepted - ${application.universityName}`;
        text = `Congratulations! Your application to ${application.universityName} has been accepted!\n\nApplication ID: ${application.id}\nProgram: ${application.program}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Congratulations! 🎉</h2>
            <p>We are delighted to inform you that your application to ${application.universityName} has been <strong>accepted</strong>!</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Application ID:</strong> ${application.id}</p>
              <p><strong>University:</strong> ${application.universityName}</p>
              <p><strong>Program:</strong> ${application.program}</p>
            </div>
            <p>Please check your email for next steps and enrollment information.</p>
          </div>
        `;
        break;

      case 'rejected':
        subject = `Application Status Update - ${application.universityName}`;
        text = `Thank you for your interest in ${application.universityName}.\n\nAfter careful consideration, we are unable to offer you admission at this time.\n\nApplication ID: ${application.id}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6b7280;">Application Status Update</h2>
            <p>Thank you for your interest in ${application.universityName}.</p>
            <p>After careful consideration of your application, we regret to inform you that we are unable to offer you admission at this time.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Application ID:</strong> ${application.id}</p>
              <p><strong>University:</strong> ${application.universityName}</p>
              <p><strong>Program:</strong> ${application.program}</p>
            </div>
            <p>We encourage you to apply again in the future and wish you the best in your academic pursuits.</p>
          </div>
        `;
        break;

      case 'waitlisted':
        subject = `Application Waitlisted - ${application.universityName}`;
        text = `Your application to ${application.universityName} has been placed on the waitlist.\n\nApplication ID: ${application.id}\nProgram: ${application.program}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Application Waitlisted</h2>
            <p>Your application to ${application.universityName} has been placed on the waitlist.</p>
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Application ID:</strong> ${application.id}</p>
              <p><strong>University:</strong> ${application.universityName}</p>
              <p><strong>Program:</strong> ${application.program}</p>
            </div>
            <p>We will notify you if a spot becomes available.</p>
          </div>
        `;
        break;

      default:
        return { success: false, message: 'Invalid status' };
    }

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject,
      text,
      html
    };

    await sgMail.send(msg);
    console.log(`✅ ${status} email sent for application ${application.id} to ${toEmail}`);

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send custom admin email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content
 * @returns {Promise<Object>} Send result
 */
export const sendCustomEmail = async (to, subject, text, html) => {
  if (!emailServiceAvailable || !sgMail) {
    console.log(`[MOCK] Would send custom email to ${to}`);
    return { success: false, message: 'Email service not available' };
  }

  try {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@flightbooking.com';

    const msg = {
      to,
      from: fromEmail,
      subject,
      text,
      html: html || text
    };

    await sgMail.send(msg);
    console.log(`✅ Custom email sent to ${to}`);

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, message: error.message };
  }
};

export { emailServiceAvailable };
