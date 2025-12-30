import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Generates a QR code containing booking information
 * @param {Object} data - Booking data to encode
 * @returns {Promise<string>} - Base64 data URL of QR code
 */
async function generateQRCode(data) {
  try {
    const qrData = JSON.stringify({
      bookingRef: data.bookingId,
      passenger: `${data.firstName} ${data.lastName}`,
      route: `${data.from} → ${data.to}`,
      departure: data.departureTime,
      seats: data.seats || []
    });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'M'
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

/**
 * Get full airport name from IATA code
 */
function getAirportName(iataCode) {
  const airports = {
    'ACC': 'Kotoka International Airport',
    'LHR': 'London Heathrow',
    'JFK': 'John F. Kennedy International',
    'LAX': 'Los Angeles International',
    'DXB': 'Dubai International',
    'CDG': 'Charles de Gaulle',
    'AMS': 'Amsterdam Schiphol',
    'FRA': 'Frankfurt Airport',
    'SIN': 'Singapore Changi',
    'HND': 'Tokyo Haneda',
    'SYD': 'Sydney Airport',
    'YYZ': 'Toronto Pearson',
    'ORD': 'O\'Hare International',
    'ATL': 'Hartsfield-Jackson Atlanta',
    'DFW': 'Dallas/Fort Worth International'
  };
  return airports[iataCode] || iataCode;
}

/**
 * Get airline name from code
 */
function getAirlineName(airlineCode) {
  const airlines = {
    'BA': 'British Airways',
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM Royal Dutch Airlines',
    'SQ': 'Singapore Airlines',
    'QF': 'Qantas',
    'AC': 'Air Canada'
  };
  return airlines[airlineCode] || airlineCode;
}

/**
 * Get airline brand colors
 */
function getAirlineColors(airlineCode) {
  const colors = {
    'BA': { primary: '#075AAA', secondary: '#E20020', text: '#FFFFFF' }, // British Airways - Blue & Red
    'AA': { primary: '#0078D2', secondary: '#CC0000', text: '#FFFFFF' }, // American Airlines - Blue & Red
    'DL': { primary: '#CE0E2D', secondary: '#003A70', text: '#FFFFFF' }, // Delta - Red & Blue
    'UA': { primary: '#0033A0', secondary: '#0033A0', text: '#FFFFFF' }, // United - Blue
    'EK': { primary: '#D71921', secondary: '#FFFFFF', text: '#FFFFFF' }, // Emirates - Red
    'QR': { primary: '#5C0A2E', secondary: '#5C0A2E', text: '#FFFFFF' }, // Qatar - Burgundy
    'LH': { primary: '#05164D', secondary: '#F9B000', text: '#FFFFFF' }, // Lufthansa - Blue & Yellow
    'AF': { primary: '#002157', secondary: '#ED1C24', text: '#FFFFFF' }, // Air France - Blue & Red
    'KL': { primary: '#00A1DE', secondary: '#00A1DE', text: '#FFFFFF' }, // KLM - Blue
    'SQ': { primary: '#001E62', secondary: '#001E62', text: '#F0B425' }, // Singapore Airlines - Navy & Gold
    'QF': { primary: '#E40000', secondary: '#E40000', text: '#FFFFFF' }, // Qantas - Red
    'AC': { primary: '#DC291E', secondary: '#DC291E', text: '#FFFFFF' }  // Air Canada - Red
  };
  return colors[airlineCode] || { primary: '#0891b2', secondary: '#06b6d4', text: '#ffffff' };
}

/**
 * Format ISO datetime to readable format
 */
function formatDateTime(isoDateTime) {
  if (!isoDateTime) return { date: 'N/A', time: 'N/A' };
  const date = new Date(isoDateTime);
  return {
    date: date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  };
}

/**
 * Format duration in minutes to "Xh Ym"
 */
function formatDuration(minutes) {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Draw a single boarding pass on the PDF
 */
function drawBoardingPass(doc, flightData, booking, qrCodeDataURL, isReturn = false) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  // Header section with airline branding
  const airlineCode = flightData.airlineCode || 'BA';
  const airlineName = flightData.airline || getAirlineName(airlineCode);
  const brandColors = getAirlineColors(airlineCode);

  // Draw airline branded header with gradient effect
  doc.rect(margin, margin, contentWidth, 90)
     .fillAndStroke(brandColors.primary, brandColors.primary);

  // Airline logo area (colored box with airline code)
  doc.rect(margin + 10, margin + 15, 60, 60)
     .fillAndStroke(brandColors.secondary, brandColors.secondary);

  doc.fontSize(28)
     .font('Helvetica-Bold')
     .fillColor(brandColors.text)
     .text(airlineCode, margin + 15, margin + 32, {
       width: 50,
       align: 'center'
     });

  // Airline name and title
  doc.fontSize(26)
     .font('Helvetica-Bold')
     .fillColor(brandColors.text)
     .text(airlineName, margin + 85, margin + 20, {
       width: contentWidth - 105,
       align: 'left'
     });

  doc.fontSize(11)
     .font('Helvetica')
     .fillColor(brandColors.text)
     .text(isReturn ? 'RETURN FLIGHT BOARDING PASS' : 'BOARDING PASS', margin + 85, margin + 52);

  // Flight number if available
  if (flightData.flightNumber) {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor(brandColors.text)
       .text(`Flight ${airlineCode}${flightData.flightNumber}`, margin + 85, margin + 68);
  }

  // Booking Reference (prominent)
  const refY = margin + 110;
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('BOOKING REFERENCE', margin, refY);

  doc.fontSize(20)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(booking.id, margin, refY + 20);

  // Passenger Information
  const passengerY = refY + 60;
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('PASSENGER NAME', margin, passengerY);

  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(
       `${booking.passengerInfo?.firstName || ''} ${booking.passengerInfo?.lastName || ''}`.toUpperCase(),
       margin,
       passengerY + 20
     );

  // Flight Route Section (Large IATA codes)
  const routeY = passengerY + 80;
  const routeSectionWidth = contentWidth * 0.6;

  // Departure
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('FROM', margin, routeY);

  doc.fontSize(36)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(flightData.departureAirport, margin, routeY + 18);

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text(getAirportName(flightData.departureAirport), margin, routeY + 60, {
       width: 150
     });

  // Arrow
  doc.fontSize(24)
     .fillColor('#0891b2')
     .text('→', margin + 180, routeY + 28);

  // Arrival
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('TO', margin + 240, routeY);

  doc.fontSize(36)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(flightData.arrivalAirport, margin + 240, routeY + 18);

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text(getAirportName(flightData.arrivalAirport), margin + 240, routeY + 60, {
       width: 150
     });

  // Flight Details Grid
  const detailsY = routeY + 120;
  const colWidth = contentWidth / 4;

  // Column 1: Date
  const departureDateTime = formatDateTime(flightData.departureTime);
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('DATE', margin, detailsY);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(departureDateTime.date, margin, detailsY + 18, {
       width: colWidth - 10
     });

  // Column 2: Departure Time
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('DEPARTURE', margin + colWidth, detailsY);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(departureDateTime.time, margin + colWidth, detailsY + 18);

  // Column 3: Arrival Time
  const arrivalDateTime = formatDateTime(flightData.arrivalTime);
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('ARRIVAL', margin + colWidth * 2, detailsY);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(arrivalDateTime.time, margin + colWidth * 2, detailsY + 18);

  // Column 4: Duration
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('DURATION', margin + colWidth * 3, detailsY);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(formatDuration(flightData.duration), margin + colWidth * 3, detailsY + 18);

  // Second Row: Seat, Class, Stops, Gate
  const detailsY2 = detailsY + 70;

  // Seat
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('SEAT', margin, detailsY2);

  const seats = booking.selectedSeats || [];
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(seats.length > 0 ? seats.join(', ') : 'N/A', margin, detailsY2 + 18);

  // Class
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('CLASS', margin + colWidth, detailsY2);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text((flightData.cabinClass || 'Economy').toUpperCase(), margin + colWidth, detailsY2 + 18);

  // Stops
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('STOPS', margin + colWidth * 2, detailsY2);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(flightData.stops === 0 ? 'Non-stop' : `${flightData.stops} stop${flightData.stops > 1 ? 's' : ''}`,
       margin + colWidth * 2, detailsY2 + 18);

  // Gate (placeholder - not in booking data)
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('GATE', margin + colWidth * 3, detailsY2);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('TBA', margin + colWidth * 3, detailsY2 + 18);

  // QR Code (if available)
  if (qrCodeDataURL) {
    const qrY = detailsY2 + 80;
    const qrSize = 120;

    // Convert base64 to buffer
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(base64Data, 'base64');

    doc.image(qrBuffer, pageWidth - margin - qrSize, qrY, {
      width: qrSize,
      height: qrSize
    });

    doc.fontSize(8)
       .fillColor('#6b7280')
       .text('Scan for details', pageWidth - margin - qrSize, qrY + qrSize + 5, {
         width: qrSize,
         align: 'center'
       });
  }

  // Payment Information
  const paymentY = detailsY2 + 80;
  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('TOTAL PAID', margin, paymentY);

  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#059669')
     .text(`${booking.currency || 'USD'} ${booking.totalPrice || flightData.price}`,
       margin, paymentY + 18);

  // Footer with important notices
  const footerY = pageHeight - 80;
  doc.fontSize(8)
     .fillColor('#6b7280')
     .font('Helvetica')
     .text(
       '⚠ Please arrive at the airport at least 2 hours before departure for international flights.',
       margin,
       footerY,
       { width: contentWidth, align: 'center' }
     );

  doc.text(
    'This is an electronic ticket. Please present this document at check-in along with valid ID.',
    margin,
    footerY + 15,
    { width: contentWidth, align: 'center' }
  );

  // Barcode simulation (decorative line pattern)
  const barcodeY = footerY + 35;
  const barcodeHeight = 20;
  doc.fillColor('#000000');
  for (let i = 0; i < 50; i++) {
    const x = margin + (i * (contentWidth / 50));
    const width = Math.random() > 0.5 ? 2 : 4;
    doc.rect(x, barcodeY, width, barcodeHeight).fill();
  }
}

/**
 * Main function to generate flight ticket PDF
 * @param {Object} booking - Complete booking object from Firestore
 * @returns {Promise<Buffer>} - PDF as Buffer
 */
export async function generateFlightTicketPDF(booking) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

      // Collect PDF data in buffer
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.on('error', reject);

      // Prepare flight data for outbound flight
      const outboundFlight = {
        airlineCode: booking.flightDetails?.airlineCode || 'N/A',
        departureAirport: booking.flightDetails?.departureAirport || 'N/A',
        arrivalAirport: booking.flightDetails?.arrivalAirport || 'N/A',
        departureTime: booking.flightDetails?.departureTime,
        arrivalTime: booking.flightDetails?.arrivalTime,
        duration: booking.flightDetails?.duration,
        stops: booking.flightDetails?.stops || 0,
        cabinClass: booking.flightDetails?.cabinClass || 'economy',
        price: booking.flightDetails?.price || booking.totalPrice
      };

      // Generate QR code for outbound flight
      const outboundQR = await generateQRCode({
        bookingId: booking.id,
        firstName: booking.passengerInfo?.firstName,
        lastName: booking.passengerInfo?.lastName,
        from: outboundFlight.departureAirport,
        to: outboundFlight.arrivalAirport,
        departureTime: outboundFlight.departureTime,
        seats: booking.selectedSeats
      });

      // Draw outbound boarding pass
      drawBoardingPass(doc, outboundFlight, booking, outboundQR, false);

      // Check if there's a return flight
      const hasReturnFlight = booking.flightDetails?.returnDepartureTime &&
                              booking.flightDetails?.returnArrivalTime;

      if (hasReturnFlight) {
        // Add new page for return flight
        doc.addPage();

        const returnFlight = {
          airlineCode: booking.flightDetails?.airlineCode || 'N/A',
          departureAirport: booking.flightDetails?.arrivalAirport || 'N/A', // Reversed
          arrivalAirport: booking.flightDetails?.departureAirport || 'N/A',  // Reversed
          departureTime: booking.flightDetails?.returnDepartureTime,
          arrivalTime: booking.flightDetails?.returnArrivalTime,
          duration: booking.flightDetails?.returnDuration,
          stops: booking.flightDetails?.returnStops || 0,
          cabinClass: booking.flightDetails?.cabinClass || 'economy',
          price: booking.flightDetails?.price || booking.totalPrice
        };

        // Generate QR code for return flight
        const returnQR = await generateQRCode({
          bookingId: booking.id,
          firstName: booking.passengerInfo?.firstName,
          lastName: booking.passengerInfo?.lastName,
          from: returnFlight.departureAirport,
          to: returnFlight.arrivalAirport,
          departureTime: returnFlight.departureTime,
          seats: booking.selectedSeats
        });

        // Draw return boarding pass
        drawBoardingPass(doc, returnFlight, booking, returnQR, true);
      }

      // Finalize PDF
      doc.end();

    } catch (error) {
      console.error('Error generating PDF ticket:', error);
      reject(error);
    }
  });
}

/**
 * Get standardized filename for ticket PDF
 */
export function getTicketFilename(bookingId) {
  return `flight-ticket-${bookingId}.pdf`;
}
