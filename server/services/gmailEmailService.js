// Gmail Email Service with PDF attachments
import nodemailer from 'nodemailer';
import { generateFlightTicketPDF } from './pdfTicketService.js';

/**
 * Gmail SMTP Configuration
 * Requires:
 * 1. Gmail account
 * 2. App Password (not regular password)
 * 3. Enable 2FA in Google Account
 * 4. Generate App Password at: https://myaccount.google.com/apppasswords
 */

// Create transporter for Gmail SMTP
const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.warn('⚠️  Gmail SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
};

/**
 * Send booking confirmation email with PDF boarding pass
 */
export async function sendBookingEmail(booking, emailType = 'confirmed') {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.error('Gmail transporter not configured');
      return {
        success: false,
        message: 'Email service not configured',
      };
    }

    // Generate PDF ticket
    let pdfAttachment = null;
    try {
      console.log(`Generating PDF ticket for booking ${booking.id}...`);
      const pdfBuffer = await generateFlightTicketPDF(booking);
      const filename = `flight-ticket-${booking.id}.pdf`;

      pdfAttachment = {
        filename: filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      };

      console.log(`✅ PDF ticket generated successfully: ${filename}`);
    } catch (pdfError) {
      console.error('Failed to generate PDF ticket:', pdfError);
      // Continue without PDF - email will still be sent
    }

    // Email subject and content based on type
    let subject, htmlContent;

    if (emailType === 'confirmed') {
      subject = `✈️ Flight Booking Confirmed - ${booking.id}`;
      htmlContent = getConfirmedEmailHTML(booking);
    } else if (emailType === 'cancelled') {
      subject = `❌ Flight Booking Cancelled - ${booking.id}`;
      htmlContent = getCancelledEmailHTML(booking);
    } else {
      subject = `📧 Flight Booking Update - ${booking.id}`;
      htmlContent = getGenericEmailHTML(booking);
    }

    // Prepare email options
    const mailOptions = {
      from: `Flight Booking System <${process.env.GMAIL_USER}>`,
      to: booking.passengerInfo.email,
      subject: subject,
      html: htmlContent,
      attachments: pdfAttachment ? [pdfAttachment] : [],
    };

    // Send email
    console.log(`Sending ${emailType} email to ${booking.passengerInfo.email}...`);
    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ ${emailType} email sent for booking ${booking.id} to ${booking.passengerInfo.email}`);
    console.log('Message ID:', info.messageId);

    return {
      success: true,
      message: 'Email sent successfully',
      data: {
        messageId: info.messageId,
        response: info.response,
      },
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email',
      error: error,
    };
  }
}

/**
 * HTML template for confirmed booking email
 */
function getConfirmedEmailHTML(booking) {
  const flight = booking.flightDetails;
  const passenger = booking.passengerInfo;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flight Booking Confirmed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .booking-id {
      background-color: #f0f9ff;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      text-align: center;
    }
    .booking-id strong {
      color: #2563eb;
      font-size: 18px;
    }
    .section {
      margin: 25px 0;
    }
    .section h2 {
      color: #1e40af;
      font-size: 18px;
      margin-bottom: 15px;
      border-left: 4px solid #2563eb;
      padding-left: 10px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      color: #6b7280;
      font-weight: 500;
    }
    .value {
      color: #111827;
      font-weight: 600;
    }
    .flight-route {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .route-airports {
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
    }
    .attachment-notice {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✈️</div>
      <h1>Booking Confirmed!</h1>
      <p>Your flight has been successfully booked</p>
    </div>

    <div class="booking-id">
      <div style="color: #6b7280; margin-bottom: 5px;">Booking Reference</div>
      <strong>${booking.id}</strong>
    </div>

    <div class="section">
      <h2>✈️ Flight Details</h2>
      <div class="flight-route">
        <div>Your Flight</div>
        <div class="route-airports">${flight.departureAirport} → ${flight.arrivalAirport}</div>
        <div>${flight.airline} (${flight.airlineCode})</div>
      </div>
      <div class="info-row">
        <span class="label">Departure</span>
        <span class="value">${new Date(flight.departureTime).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}</span>
      </div>
      <div class="info-row">
        <span class="label">Arrival</span>
        <span class="value">${new Date(flight.arrivalTime).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}</span>
      </div>
      <div class="info-row">
        <span class="label">Duration</span>
        <span class="value">${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m</span>
      </div>
      <div class="info-row">
        <span class="label">Cabin Class</span>
        <span class="value">${flight.cabinClass?.toUpperCase() || 'ECONOMY'}</span>
      </div>
      ${booking.selectedSeats && booking.selectedSeats.length > 0 ? `
      <div class="info-row">
        <span class="label">Seats</span>
        <span class="value">${booking.selectedSeats.join(', ')}</span>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <h2>👤 Passenger Information</h2>
      <div class="info-row">
        <span class="label">Name</span>
        <span class="value">${passenger.firstName} ${passenger.lastName}</span>
      </div>
      <div class="info-row">
        <span class="label">Email</span>
        <span class="value">${passenger.email}</span>
      </div>
      <div class="info-row">
        <span class="label">Phone</span>
        <span class="value">${passenger.phone}</span>
      </div>
    </div>

    <div class="section">
      <h2>💳 Payment Details</h2>
      <div class="info-row">
        <span class="label">Total Amount</span>
        <span class="value">${booking.currency} ${booking.totalPrice.toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="label">Payment Status</span>
        <span class="value" style="color: #10b981;">PAID ✓</span>
      </div>
      <div class="info-row">
        <span class="label">Payment ID</span>
        <span class="value">${booking.paymentId}</span>
      </div>
    </div>

    <div class="attachment-notice">
      <strong>📎 Boarding Pass Attached</strong>
      <p style="margin: 5px 0 0 0;">Your boarding pass is attached as a PDF file. Please print it or save it on your mobile device to present at the airport.</p>
    </div>

    <div class="footer">
      <p>Thank you for booking with us!</p>
      <p style="font-size: 12px; color: #9ca3af;">
        This is an automated email. Please do not reply to this message.<br>
        If you have any questions, please contact our support team.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * HTML template for cancelled booking email
 */
function getCancelledEmailHTML(booking) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Flight Booking Cancelled</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; color: #ef4444; margin-bottom: 30px; }
    h1 { margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Booking Cancelled</h1>
      <p>Booking Reference: <strong>${booking.id}</strong></p>
    </div>
    <p>Your flight booking has been cancelled.</p>
    <p>If you did not request this cancellation, please contact our support team immediately.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generic email template
 */
function getGenericEmailHTML(booking) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Flight Booking Update</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 Booking Update</h1>
    <p>Booking Reference: <strong>${booking.id}</strong></p>
    <p>There has been an update to your booking.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Test email configuration
 */
export async function testEmailService() {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      success: false,
      message: 'Gmail SMTP not configured',
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      message: 'Gmail SMTP connection verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: `Gmail SMTP verification failed: ${error.message}`,
      error: error,
    };
  }
}

export default {
  sendBookingEmail,
  testEmailService,
};
