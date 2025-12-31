import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Generates a QR code containing application information
 * @param {Object} data - Application data to encode
 * @returns {Promise<string>} - Base64 data URL of QR code
 */
async function generateApplicationQRCode(data) {
  try {
    const qrData = JSON.stringify({
      applicationId: data.id,
      applicant: `${data.firstName} ${data.lastName}`,
      university: data.universityName,
      email: data.email,
      status: data.status
    });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 150,
      margin: 1,
      errorCorrectionLevel: 'M'
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating application QR code:', error);
    return null;
  }
}

/**
 * Generates an application form PDF (detailed application information)
 * @param {Object} applicationData - Application data
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateApplicationFormPDF(applicationData) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Application Confirmation - ${applicationData.universityName}`,
          Author: 'Study Abroad Platform',
          Subject: 'University Application Confirmation'
        }
      });

      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.on('error', reject);

      // Generate QR Code
      const qrCodeDataURL = await generateApplicationQRCode(applicationData);

      // Header with logo/branding
      doc.fillColor('#1e40af')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('STUDY ABROAD APPLICATION', { align: 'center' });

      doc.moveDown(0.5);
      doc.fillColor('#374151')
         .fontSize(16)
         .font('Helvetica')
         .text('CONFIRMATION RECEIPT', { align: 'center' });

      // Application ID and Date
      doc.moveDown(1);
      doc.fillColor('#6b7280')
         .fontSize(10)
         .text(`Application ID: ${applicationData.id}`, { align: 'right' });

      doc.fillColor('#6b7280')
         .fontSize(10)
         .text(`Submission Date: ${new Date(applicationData.submittedAt).toLocaleDateString()}`, { align: 'right' });

      // University Information
      doc.moveDown(1);
      doc.fillColor('#1f2937')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('INSTITUTION DETAILS');

      doc.moveDown(0.5);
      doc.fillColor('#374151')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('University:');
      doc.font('Helvetica')
         .text(applicationData.universityName);

      doc.moveDown(0.5);
      doc.font('Helvetica-Bold')
         .text('Intake Period:');
      doc.font('Helvetica')
         .text(applicationData.intakePeriod || 'Not specified');

      doc.font('Helvetica-Bold')
         .text('Expected Start Date:');
      doc.font('Helvetica')
         .text(applicationData.startDate ? new Date(applicationData.startDate).toLocaleDateString() : 'Not specified');

      // Applicant Information
      doc.moveDown(1);
      doc.fillColor('#1f2937')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('APPLICANT INFORMATION');

      doc.moveDown(0.5);
      doc.fillColor('#374151')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Full Name:');
      doc.font('Helvetica')
         .text(`${applicationData.firstName} ${applicationData.lastName}`);

      doc.font('Helvetica-Bold')
         .text('Email:');
      doc.font('Helvetica')
         .text(applicationData.email);

      doc.font('Helvetica-Bold')
         .text('Phone:');
      doc.font('Helvetica')
         .text(applicationData.phone);

      doc.font('Helvetica-Bold')
         .text('Nationality:');
      doc.font('Helvetica')
         .text(applicationData.nationality);

      doc.font('Helvetica-Bold')
         .text('Passport Number:');
      doc.font('Helvetica')
         .text(applicationData.passportNumber);

      doc.font('Helvetica-Bold')
         .text('Date of Birth:');
      doc.font('Helvetica')
         .text(new Date(applicationData.dateOfBirth).toLocaleDateString());

      // Academic Information
      doc.moveDown(1);
      doc.fillColor('#1f2937')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('ACADEMIC INFORMATION');

      doc.moveDown(0.5);
      doc.fillColor('#374151')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Current Education:');
      doc.font('Helvetica')
         .text(applicationData.currentEducation || 'Not specified');

      doc.font('Helvetica-Bold')
         .text('GPA/Grade:');
      doc.font('Helvetica')
         .text(applicationData.gpa || 'Not specified');

      doc.font('Helvetica-Bold')
         .text('Graduation Year:');
      doc.font('Helvetica')
         .text(applicationData.graduationYear || 'Not specified');

      doc.font('Helvetica-Bold')
         .text('Previous Institution:');
      doc.font('Helvetica')
         .text(applicationData.previousInstitution || 'Not specified');

      // Programs of Interest
      doc.moveDown(1);
      doc.fillColor('#1f2937')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('PROGRAMS OF INTEREST');

      doc.moveDown(0.5);
      doc.fillColor('#374151')
         .fontSize(12);
      if (applicationData.programs && applicationData.programs.length > 0) {
        applicationData.programs.forEach((program, index) => {
          doc.text(`${index + 1}. ${program}`);
        });
      } else {
        doc.text('No programs specified');
      }

      // Essay Preview
      if (applicationData.essay) {
        doc.moveDown(1);
        doc.fillColor('#1f2937')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('MOTIVATION STATEMENT');

        doc.moveDown(0.5);
        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text(applicationData.essay.length > 300
             ? applicationData.essay.substring(0, 300) + '...'
             : applicationData.essay);
      }

      // Payment Information
      doc.moveDown(1);
      doc.fillColor('#1f2937')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('PAYMENT INFORMATION');

      doc.moveDown(0.5);
      doc.fillColor('#059669')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Application Fee:');
      doc.text(`GHS ${applicationData.applicationFee || 150} (Paid)`);

      doc.fillColor('#6b7280')
         .fontSize(10)
         .text('Payment Status: Completed');

      // Application Status
      doc.moveDown(1);
      doc.fillColor('#1f2937')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('APPLICATION STATUS');

      doc.moveDown(0.5);
      doc.fillColor('#d97706')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Current Status:');
      doc.text(applicationData.status || 'Submitted');

      doc.fillColor('#6b7280')
         .fontSize(10)
         .text('Your application is being reviewed. You will be notified of updates via email.');

      // QR Code (if generated)
      if (qrCodeDataURL) {
        // Add QR code to the right side of the page
        const qrImageBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
        doc.image(qrImageBuffer, 400, 200, { width: 100 });

        doc.fillColor('#6b7280')
           .fontSize(8)
           .text('Scan for details', 400, 310);
      }

      // Footer
      doc.moveDown(2);
      doc.fillColor('#9ca3af')
         .fontSize(8)
         .text('This is an official application confirmation receipt from Study Abroad Platform.', 50, doc.page.height - 80, {
           width: doc.page.width - 100,
           align: 'center'
         });

      doc.text('For inquiries, contact: support@studyabroad.com | +233 XX XXX XXXX', {
        align: 'center'
      });

      doc.text(`Generated on ${new Date().toLocaleString()}`, {
        align: 'center'
      });

      doc.end();

    } catch (error) {
      console.error('Error generating application PDF:', error);
      reject(error);
    }
  });
}

/**
 * Generates a payment receipt PDF for application fee
 * @param {Object} applicationData - Application data
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateApplicationPaymentReceiptPDF(applicationData) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Payment Receipt - ${applicationData.universityName}`,
          Author: 'Study Abroad Platform',
          Subject: 'Application Fee Payment Receipt'
        }
      });

      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.on('error', reject);

      // Header
      doc.fillColor('#059669')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('PAYMENT RECEIPT', { align: 'center' });

      doc.moveDown(0.5);
      doc.fillColor('#374151')
         .fontSize(16)
         .font('Helvetica')
         .text('University Application Fee', { align: 'center' });

      // Receipt Details
      doc.moveDown(1);
      doc.fillColor('#6b7280')
         .fontSize(10)
         .text(`Receipt Number: ${applicationData.id}`, { align: 'right' });

      doc.fillColor('#6b7280')
         .fontSize(10)
         .text(`Date: ${new Date(applicationData.submittedAt).toLocaleDateString()}`, { align: 'right' });

      // University Information
      doc.moveDown(1);
      doc.fillColor('#1f2937')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('INSTITUTION DETAILS');

      doc.moveDown(0.5);
      doc.fillColor('#374151')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('University:');
      doc.font('Helvetica')
         .text(applicationData.universityName);

      doc.font('Helvetica-Bold')
         .text('Application ID:');
      doc.font('Helvetica')
         .text(applicationData.id);

      // Applicant Information
      doc.moveDown(1);
      doc.fillColor('#1f2937')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('APPLICANT INFORMATION');

      doc.moveDown(0.5);
      doc.fillColor('#374151')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Full Name:');
      doc.font('Helvetica')
         .text(`${applicationData.firstName} ${applicationData.lastName}`);

      doc.font('Helvetica-Bold')
         .text('Email:');
      doc.font('Helvetica')
         .text(applicationData.email);

      doc.font('Helvetica-Bold')
         .text('Phone:');
      doc.font('Helvetica')
         .text(applicationData.phone);

      // Payment Information
      doc.moveDown(1);
      doc.fillColor('#1f2937')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('PAYMENT DETAILS');

      doc.moveDown(0.5);
      doc.fillColor('#374151')
         .fontSize(12);

      // Payment Table
      const tableTop = doc.y;
      const itemX = 50;
      const quantityX = 350;
      const amountX = 450;

      // Table headers
      doc.font('Helvetica-Bold')
         .text('Item', itemX, tableTop)
         .text('Qty', quantityX, tableTop)
         .text('Amount', amountX, tableTop);

      // Table line
      doc.moveTo(50, tableTop + 15)
         .lineTo(550, tableTop + 15)
         .stroke();

      // Table content
      doc.font('Helvetica')
         .text('University Application Fee', itemX, tableTop + 25)
         .text('1', quantityX, tableTop + 25)
         .text(`GHS ${applicationData.applicationFee || 150}`, amountX, tableTop + 25);

      // Total
      doc.moveTo(50, tableTop + 45)
         .lineTo(550, tableTop + 45)
         .stroke();

      doc.font('Helvetica-Bold')
         .text('TOTAL:', 400, tableTop + 55)
         .text(`GHS ${applicationData.applicationFee || 150}`, amountX, tableTop + 55);

      // Payment Method
      doc.moveDown(2);
      doc.font('Helvetica-Bold')
         .text('Payment Method:');
      doc.font('Helvetica')
         .text('Paystack (Online Payment)');

      doc.font('Helvetica-Bold')
         .text('Payment Status:');
      doc.fillColor('#059669')
         .text('COMPLETED');

      doc.fillColor('#6b7280')
         .fontSize(10)
         .text(`Payment processed on ${new Date(applicationData.submittedAt).toLocaleString()}`);

      // Footer
      doc.moveDown(2);
      doc.fillColor('#9ca3af')
         .fontSize(8)
         .text('This is an official payment receipt from Study Abroad Platform.', 50, doc.page.height - 80, {
           width: doc.page.width - 100,
           align: 'center'
         });

      doc.text('Keep this receipt for your records. For payment inquiries, contact support.', {
        align: 'center'
      });

      doc.text(`Generated on ${new Date().toLocaleString()}`, {
        align: 'center'
      });

      doc.end();

    } catch (error) {
      console.error('Error generating payment receipt PDF:', error);
      reject(error);
    }
  });
}

/**
 * Generates an application confirmation PDF (legacy - now uses application form)
 * @param {Object} applicationData - Application data
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateApplicationConfirmationPDF(applicationData) {
  // For backward compatibility, return the application form PDF
  return generateApplicationFormPDF(applicationData);
}
