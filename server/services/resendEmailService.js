// server/services/resendEmailService.js
import '../config/env.js';
import { generateFlightTicketPDF, getTicketFilename } from './pdfTicketService.js';

// Resend email service
let resend = null;
let emailServiceAvailable = false;

try {
  // Dynamically import Resend
  const { Resend } = await import('resend');

  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    emailServiceAvailable = true;
    console.log('✅ Resend email service initialized');
  } else {
    console.warn('⚠️  RESEND_API_KEY not configured - Email features disabled');
  }
} catch (error) {
  console.warn('⚠️  Resend module not installed - Email features disabled');
  console.warn('   Run: npm install resend');
}

/**
 * Send booking confirmation/status email
 * @param {Object} booking - Booking data
 * @param {string} status - Booking status (confirmed, cancelled, refunded)
 * @returns {Promise<Object>} Send result
 */
export const sendBookingEmail = async (booking, status) => {
  if (!emailServiceAvailable || !resend) {
    console.log(`[MOCK] Would send ${status} email for booking ${booking.id}`);
    return { success: false, message: 'Email service not available' };
  }

  try {
    let subject, html;
    let pdfAttachment = null;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const toEmail = booking.passengerInfo?.email || booking.email;

    if (!toEmail) {
      throw new Error('No recipient email address found');
    }

    switch (status) {
      case 'confirmed':
        subject = `Flight Booking Confirmed - ${booking.id}`;

        // Format departure and arrival times
        const departureTime = booking.flightDetails?.departureTime ?
          new Date(booking.flightDetails.departureTime).toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }) : 'N/A';

        const arrivalTime = booking.flightDetails?.arrivalTime ?
          new Date(booking.flightDetails.arrivalTime).toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }) : 'N/A';

        // Format seat information
        let seatsHtml = '';
        if (booking.selectedSeats && booking.selectedSeats.length > 0) {
          seatsHtml = `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 5px 0;"><strong>Selected Seats:</strong> ${booking.selectedSeats.join(', ')}</p>
            </div>
          `;
        }

        // Calculate duration display
        let durationHtml = '';
        if (booking.flightDetails?.duration) {
          const hours = Math.floor(booking.flightDetails.duration / 60);
          const minutes = booking.flightDetails.duration % 60;
          durationHtml = `<p style="margin: 5px 0;"><strong>Flight Duration:</strong> ${hours}h ${minutes}m</p>`;
        }

        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✈️ Flight Booking Confirmed!</h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0;">Your journey begins here</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px 20px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Dear ${booking.passengerInfo?.firstName || 'Traveler'},
              </p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">
                Great news! Your flight booking has been confirmed. Below are your booking details:
              </p>

              <!-- Booking Reference -->
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #06b6d4; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #06b6d4; font-family: 'Courier New', monospace;">${booking.id}</p>
              </div>

              <!-- Flight Details -->
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <h3 style="margin: 0 0 15px 0; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Flight Information</h3>
                <p style="margin: 5px 0;"><strong>Airline:</strong> ${booking.flightDetails?.airline || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Route:</strong> ${booking.flightDetails?.departureAirport || 'N/A'} → ${booking.flightDetails?.arrivalAirport || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Departure:</strong> ${departureTime}</p>
                <p style="margin: 5px 0;"><strong>Arrival:</strong> ${arrivalTime}</p>
                ${durationHtml}
                <p style="margin: 5px 0;"><strong>Stops:</strong> ${booking.flightDetails?.stops !== undefined ? (booking.flightDetails.stops === 0 ? 'Non-stop' : `${booking.flightDetails.stops} stop(s)`) : 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Cabin Class:</strong> ${booking.flightDetails?.cabinClass || 'Economy'}</p>
                ${seatsHtml}
              </div>

              <!-- Passenger Details -->
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <h3 style="margin: 0 0 15px 0; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Passenger Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${booking.passengerInfo?.firstName || ''} ${booking.passengerInfo?.lastName || ''}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${booking.passengerInfo?.email || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${booking.passengerInfo?.phone || 'N/A'}</p>
              </div>

              <!-- Payment Details -->
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <h3 style="margin: 0 0 15px 0; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Payment Information</h3>
                <p style="margin: 5px 0;"><strong>Total Amount:</strong> <span style="font-size: 20px; color: #059669;">${booking.currency || 'USD'} ${booking.totalPrice?.toLocaleString() || '0.00'}</span></p>
                <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">✓ PAID</span></p>
                ${booking.paymentId ? `<p style="margin: 5px 0;"><strong>Payment Reference:</strong> ${booking.paymentId}</p>` : ''}
                <p style="margin: 5px 0;"><strong>Booking Date:</strong> ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
              </div>

              <!-- PDF Boarding Pass Notice -->
              <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #065f46;">
                  <strong>📎 Your Boarding Pass:</strong> Your flight boarding pass is attached to this email as a PDF. Please download and print it, or save it to your mobile device to present at the airport check-in.
                </p>
              </div>

              <!-- Important Information -->
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>⚠️ Important:</strong> Please arrive at the airport at least 2-3 hours before your departure time. Bring a valid ID and this booking confirmation.
                </p>
              </div>

              <!-- Call to Action -->
              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">Have a wonderful trip!</p>
                <p style="font-size: 14px; color: #6b7280;">If you have any questions, please contact our support team.</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 20px; text-align: center; background-color: #f3f4f6; border-radius: 0 0 8px 8px;">
              <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
                This is an automated email. Please do not reply to this message.
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 5px 0;">
                © ${new Date().getFullYear()} Flight Booking. All rights reserved.
              </p>
            </div>
          </div>
        `;

        // Generate PDF ticket
        try {
          console.log(`Generating PDF ticket for booking ${booking.id}...`);
          const pdfBuffer = await generateFlightTicketPDF(booking);
          const filename = getTicketFilename(booking.id);

          pdfAttachment = {
            filename: filename,
            content: pdfBuffer,
            type: 'application/pdf'
          };

          console.log(`✅ PDF ticket generated successfully: ${filename}`);
        } catch (pdfError) {
          console.error('Failed to generate PDF ticket:', pdfError);
          // Continue without PDF - email will still be sent
        }
        break;

      case 'cancelled':
        subject = `Booking Cancelled - ${booking.id}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #ef4444;">Booking Cancelled</h2>
            <p>Your flight booking has been cancelled.</p>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking ID:</strong> ${booking.id}</p>
            </div>
            <p>If you have any questions, please contact our support team.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
        break;

      case 'refunded':
        subject = `Booking Refunded - ${booking.id}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">💰 Booking Refunded</h2>
            <p>Your flight booking has been refunded successfully.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking ID:</strong> ${booking.id}</p>
              <p><strong>Refund Amount:</strong> ${booking.currency} ${booking.totalPrice}</p>
            </div>
            <p>The refund will be processed to your original payment method within 5-10 business days.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
        break;

      default:
        return { success: false, message: 'Invalid status' };
    }

    const emailPayload = {
      from: fromEmail,
      to: toEmail,
      subject,
      html,
      ...(pdfAttachment && { attachments: [pdfAttachment] })
    };

    const result = await resend.emails.send(emailPayload);

    console.log(`✅ ${status} email sent for booking ${booking.id} to ${toEmail}`, result);
    return { success: true, message: 'Email sent successfully', data: result };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send study abroad application status email
 * @param {Object} application - Application data
 * @param {string} status - Application status
 * @returns {Promise<Object>} Send result
 */
export const sendApplicationEmail = async (application, status) => {
  if (!emailServiceAvailable || !resend) {
    console.log(`[MOCK] Would send ${status} email for application ${application.id}`);
    return { success: false, message: 'Email service not available' };
  }

  try {
    let subject, html;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const toEmail = application.studentInfo?.email || application.email;

    if (!toEmail) {
      throw new Error('No recipient email address found');
    }

    switch (status) {
      case 'under_review':
        subject = `Application Under Review - ${application.universityName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #06b6d4;">📋 Application Under Review</h2>
            <p>Your application to ${application.universityName} is now being reviewed.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Application ID:</strong> ${application.id}</p>
              <p><strong>University:</strong> ${application.universityName}</p>
              <p><strong>Program:</strong> ${application.program}</p>
            </div>
            <p>We will notify you once a decision has been made.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
        break;

      case 'accepted':
        subject = `🎉 Congratulations! Application Accepted - ${application.universityName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">🎉 Congratulations!</h2>
            <p>We are delighted to inform you that your application to ${application.universityName} has been <strong>accepted</strong>!</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Application ID:</strong> ${application.id}</p>
              <p><strong>University:</strong> ${application.universityName}</p>
              <p><strong>Program:</strong> ${application.program}</p>
              <p><strong>Intake Period:</strong> ${application.intakePeriod}</p>
            </div>
            <p>Please check your email for next steps and enrollment information.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
        break;

      case 'rejected':
        subject = `Application Status Update - ${application.universityName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #6b7280;">Application Status Update</h2>
            <p>Thank you for your interest in ${application.universityName}.</p>
            <p>After careful consideration of your application, we regret to inform you that we are unable to offer you admission at this time.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Application ID:</strong> ${application.id}</p>
              <p><strong>University:</strong> ${application.universityName}</p>
              <p><strong>Program:</strong> ${application.program}</p>
            </div>
            <p>We encourage you to apply again in the future and wish you the best in your academic pursuits.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
        break;

      case 'waitlisted':
        subject = `Application Waitlisted - ${application.universityName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f59e0b;">Application Waitlisted</h2>
            <p>Your application to ${application.universityName} has been placed on the waitlist.</p>
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Application ID:</strong> ${application.id}</p>
              <p><strong>University:</strong> ${application.universityName}</p>
              <p><strong>Program:</strong> ${application.program}</p>
            </div>
            <p>We will notify you if a spot becomes available.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `;
        break;

      default:
        return { success: false, message: 'Invalid status' };
    }

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html
    });

    console.log(`✅ ${status} email sent for application ${application.id} to ${toEmail}`, result);
    return { success: true, message: 'Email sent successfully', data: result };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send custom admin email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<Object>} Send result
 */
export const sendCustomEmail = async (to, subject, html) => {
  if (!emailServiceAvailable || !resend) {
    console.log(`[MOCK] Would send custom email to ${to}`);
    return { success: false, message: 'Email service not available' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html
    });

    console.log(`✅ Custom email sent to ${to}`, result);
    return { success: true, message: 'Email sent successfully', data: result };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, message: error.message };
  }
};

export { emailServiceAvailable };
