import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Fetch airline logo from multiple CDN sources with retry logic
 * @param {string} airlineCode - IATA airline code (e.g., 'BA', 'EK')
 * @returns {Promise<Buffer|null>} - Logo image buffer or null if not found
 */
async function fetchAirlineLogo(airlineCode) {
  if (!airlineCode || airlineCode === 'N/A') return null;

  const logoSources = [
    `https://pics.avs.io/200/80/${airlineCode}.png`,
    `https://images.kiwi.com/airlines/64/${airlineCode}.png`,
    `https://content.airhex.com/content/logos/airlines_${airlineCode}_200_80_r.png`,
    `https://www.gstatic.com/flights/airline_logos/70px/${airlineCode}.png`,
  ];

  // PNG header magic bytes: 137 80 78 71 13 10 26 10
  const PNG_HEADER = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

  for (const url of logoSources) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'FlightBooking/1.0'
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        // Verify we got actual PNG image data (check header magic bytes)
        if (buffer.byteLength > 100) {
          const isPng = PNG_HEADER.every((byte, i) => bytes[i] === byte);
          if (isPng) {
            console.log(`✅ Logo fetched from: ${url}`);
            return Buffer.from(buffer);
          } else {
            console.warn(`Invalid PNG data from ${url} (wrong header)`);
          }
        }
      }
    } catch (error) {
      // Continue to next source
      console.warn(`Could not fetch logo from ${url}:`, error.message);
    }
  }

  console.warn(`No logo available for ${airlineCode} from any source`);
  return null;
}

/**
 * Format price with proper null safety
 * @param {number|null|undefined} price - Price value
 * @param {string} currency - Currency code
 * @param {number} fallback - Fallback value if price is invalid
 * @returns {string} - Formatted price string
 */
function formatPrice(price, currency = 'USD', fallback = 0) {
  const validPrice = price ?? fallback;
  const numericPrice = typeof validPrice === 'number' && !isNaN(validPrice) ? validPrice : fallback;
  return `${currency} ${numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
 * Format datetime to readable format
 * Handles both ISO datetime strings and time-only strings (e.g., "02:30 PM")
 */
function formatDateTime(dateTimeInput) {
  if (!dateTimeInput) return { date: 'N/A', time: 'N/A' };

  // Try parsing as ISO datetime first
  let date = new Date(dateTimeInput);

  // If invalid, it might be a time-only string - use today's date
  if (isNaN(date.getTime())) {
    // Handle "02:30 PM" or "14:30" format - combine with today's date
    const timeMatch = dateTimeInput.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const meridiem = timeMatch[3]?.toUpperCase();

      if (meridiem === 'PM' && hours !== 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      const today = new Date();
      date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    } else {
      return { date: 'N/A', time: 'N/A' };
    }
  }

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
 * Format date to short format for stub section (e.g., "Jan 31, 2026")
 * Excludes weekday to save space in narrow stub column
 */
function formatShortDate(dateTimeInput) {
  if (!dateTimeInput) return 'N/A';

  let date = new Date(dateTimeInput);

  // If invalid, try parsing as time-only string
  if (isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Calculate duration in minutes from departure and arrival times
 * @param {string} departureTime - Departure datetime string
 * @param {string} arrivalTime - Arrival datetime string
 * @returns {number|null} - Duration in minutes or null if cannot be calculated
 */
function calculateDuration(departureTime, arrivalTime) {
  if (!departureTime || !arrivalTime) return null;

  const depDate = new Date(departureTime);
  const arrDate = new Date(arrivalTime);

  if (isNaN(depDate.getTime()) || isNaN(arrDate.getTime())) return null;

  const diffMs = arrDate.getTime() - depDate.getTime();
  if (diffMs < 0) return null; // Arrival before departure doesn't make sense

  return Math.round(diffMs / (1000 * 60)); // Convert to minutes
}

/**
 * Format duration in minutes to "Xh Ym"
 * Handles undefined, null, NaN, and zero values
 */
function formatDuration(minutes) {
  if (minutes === undefined || minutes === null || isNaN(minutes)) return 'N/A';
  // Handle case where minutes is 0 (instant flight - unlikely but possible)
  if (minutes === 0) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Draw airline code box fallback when logo is not available
 */
function drawAirlineCodeBox(doc, airlineCode, margin, brandColors) {
  doc.rect(margin + 15, margin + 20, 70, 50)
     .fillAndStroke(brandColors.secondary, brandColors.secondary);

  doc.fontSize(26)
     .font('Helvetica-Bold')
     .fillColor(brandColors.text)
     .text(airlineCode, margin + 15, margin + 35, {
       width: 70,
       align: 'center'
     });
}

/**
 * Draw a single boarding pass on the PDF (British Airways-style design)
 * @param {PDFDocument} doc - PDF document instance
 * @param {Object} flightData - Flight details
 * @param {Object} booking - Booking information
 * @param {string|null} qrCodeDataURL - QR code data URL
 * @param {boolean} isReturn - Whether this is a return flight
 * @param {Buffer|null} logoBuffer - Airline logo image buffer
 */
function drawBoardingPass(doc, flightData, booking, qrCodeDataURL, isReturn = false, logoBuffer = null) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);
  const stubWidth = 140; // Width of tear-off stub
  const mainWidth = contentWidth - stubWidth - 15; // Main section width

  // Header section with airline branding
  const airlineCode = flightData.airlineCode || 'BA';
  const airlineName = flightData.airline || getAirlineName(airlineCode);
  const brandColors = getAirlineColors(airlineCode);

  // Draw main boarding pass background
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2)
     .lineWidth(2)
     .stroke('#e5e7eb');

  // Draw airline branded header with gradient effect
  doc.rect(margin, margin, contentWidth, 100)
     .fillAndStroke(brandColors.primary, brandColors.primary);

  // Add secondary color accent stripe
  doc.rect(margin, margin + 90, contentWidth, 10)
     .fillAndStroke(brandColors.secondary, brandColors.secondary);

  // Draw airline logo or fallback to code box
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, margin + 15, margin + 20, {
        width: 80,
        height: 50,
        fit: [80, 50]
      });
    } catch (logoError) {
      // Fallback to code box if logo fails
      drawAirlineCodeBox(doc, airlineCode, margin, brandColors);
    }
  } else {
    drawAirlineCodeBox(doc, airlineCode, margin, brandColors);
  }

  // Airline name and title
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor(brandColors.text)
     .text(airlineName.toUpperCase(), margin + 110, margin + 22, {
       width: contentWidth - 130,
       align: 'left'
     });

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor(brandColors.text)
     .text(isReturn ? 'RETURN FLIGHT BOARDING PASS' : 'BOARDING PASS', margin + 110, margin + 52);

  // Flight number prominently displayed
  const flightNum = flightData.flightNumber || '000';
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor(brandColors.text)
     .text(`Flight ${airlineCode} ${flightNum}`, margin + 110, margin + 70);

  // Draw vertical dotted line for stub section
  const stubX = margin + mainWidth + 10;
  doc.save();
  doc.strokeColor('#9ca3af')
     .lineWidth(1)
     .dash(5, { space: 3 });
  doc.moveTo(stubX, margin + 110)
     .lineTo(stubX, pageHeight - margin - 10)
     .stroke();
  doc.restore();

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

  // Arrow (using ASCII ">" instead of Unicode "→" for font compatibility)
  doc.fontSize(24)
     .fillColor('#0891b2')
     .text('>', margin + 180, routeY + 28);

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
  console.log('PDF drawBoardingPass - departure info:', {
    rawDepartureTime: flightData.departureTime,
    parsedDate: departureDateTime.date,
    parsedTime: departureDateTime.time,
    duration: flightData.duration
  });
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

  // Payment Information with "PAID" badge
  const paymentY = detailsY2 + 80;

  // Draw payment box background
  doc.rect(margin, paymentY - 5, 200, 55)
     .fillAndStroke('#f0fdf4', '#10b981');

  doc.fontSize(10)
     .fillColor('#6b7280')
     .text('TOTAL PAID', margin + 10, paymentY);

  // Use formatPrice for proper null safety
  // Get currency from flightDetails first (where API stores it), then fall back to booking level
  const currency = booking.flightDetails?.currency ?? booking.currency ?? 'USD';
  const totalPrice = booking.totalPrice ?? flightData.price ?? 0;
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#059669')
     .text(formatPrice(totalPrice, currency), margin + 10, paymentY + 18);

  // Draw "PAID" stamp
  doc.save();
  doc.rotate(-15, { origin: [margin + 160, paymentY + 25] });
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#10b981')
     .text('PAID ✓', margin + 130, paymentY + 18);
  doc.restore();

  // Draw horizontal divider line above payment section
  doc.strokeColor('#e5e7eb')
     .lineWidth(1)
     .moveTo(margin, paymentY - 15)
     .lineTo(stubX - 5, paymentY - 15)
     .stroke();

  // ========== STUB SECTION (Right side) ==========
  const stubStartX = stubX + 15;
  const stubContentWidth = stubWidth - 20;

  // Stub header
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor(brandColors.primary)
     .text('BOARDING STUB', stubStartX, margin + 120, {
       width: stubContentWidth,
       align: 'center'
     });

  // Stub - Passenger name
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text('PASSENGER', stubStartX, margin + 145);

  doc.fontSize(9)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(
       `${booking.passengerInfo?.lastName || ''}`.toUpperCase(),
       stubStartX, margin + 158, { width: stubContentWidth }
     );

  // Stub - Route
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text('ROUTE', stubStartX, margin + 180);

  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`${flightData.departureAirport} > ${flightData.arrivalAirport}`, stubStartX, margin + 193);

  // Stub - Flight
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text('FLIGHT', stubStartX, margin + 220);

  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`${airlineCode} ${flightData.flightNumber || '000'}`, stubStartX, margin + 233);

  // Stub - Date (use shorter format without weekday to fit in narrow stub)
  const stubDate = formatShortDate(flightData.departureTime);
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text('DATE', stubStartX, margin + 260);

  doc.fontSize(9)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(stubDate, stubStartX, margin + 273, { width: stubContentWidth });

  // Stub - Time (extract time directly to ensure it displays)
  const stubTime = departureDateTime.time !== 'N/A' ? departureDateTime.time :
    (flightData.departureTime ? new Date(flightData.departureTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) : 'TBD');
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text('BOARDING', stubStartX, margin + 300);

  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(stubTime, stubStartX, margin + 313);

  // Stub - Seat
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text('SEAT', stubStartX, margin + 340);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(seats.length > 0 ? seats[0] : 'N/A', stubStartX, margin + 353);

  // Stub - Gate
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text('GATE', stubStartX, margin + 380);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('TBA', stubStartX, margin + 393);

  // Stub - Class badge
  doc.rect(stubStartX, margin + 420, stubContentWidth, 25)
     .fillAndStroke(brandColors.primary, brandColors.primary);

  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor(brandColors.text)
     .text((flightData.cabinClass || 'ECONOMY').toUpperCase(), stubStartX, margin + 428, {
       width: stubContentWidth,
       align: 'center'
     });

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

      // Prepare flight data for outbound flight (using ?? for proper null coalescing)
      // Prefer ISO datetime fields for accurate date/time rendering in PDF
      const airlineCode = booking.flightDetails?.airlineCode ?? booking.flightDetails?.airline ?? 'N/A';
      // Extract departure and arrival times
      const departureTime = booking.flightDetails?.departureDateTime || booking.flightDetails?.departureTime;
      const arrivalTime = booking.flightDetails?.arrivalDateTime || booking.flightDetails?.arrivalTime;

      // Calculate duration if not provided
      const storedDuration = booking.flightDetails?.duration;
      const calculatedDuration = calculateDuration(departureTime, arrivalTime);
      const duration = storedDuration ?? calculatedDuration;

      const outboundFlight = {
        airlineCode: airlineCode,
        airline: booking.flightDetails?.airline,
        // Prefer ISO datetime, fall back to time-only string
        flightNumber: booking.flightDetails?.flightNumber || `${airlineCode}001`,
        departureAirport: booking.flightDetails?.departureAirport ?? 'N/A',
        arrivalAirport: booking.flightDetails?.arrivalAirport ?? 'N/A',
        // Use full ISO datetime if available, otherwise fall back to time-only
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        duration: duration,
        stops: booking.flightDetails?.stops ?? 0,
        cabinClass: booking.flightDetails?.cabinClass ?? 'economy',
        price: booking.flightDetails?.price ?? booking.totalPrice ?? 0
      };

      console.log('PDF Generation - Flight data:', {
        airlineCode,
        flightNumber: outboundFlight.flightNumber,
        departureTime: outboundFlight.departureTime,
        arrivalTime: outboundFlight.arrivalTime,
        storedDuration,
        calculatedDuration,
        finalDuration: duration
      });

      // Fetch airline logo (will return null if not available)
      console.log(`Fetching airline logo for ${airlineCode}...`);
      const logoBuffer = await fetchAirlineLogo(airlineCode);
      if (logoBuffer) {
        console.log(`✅ Airline logo fetched successfully for ${airlineCode}`);
      } else {
        console.log(`⚠️ No logo available for ${airlineCode}, using fallback`);
      }

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

      // Draw outbound boarding pass with logo
      drawBoardingPass(doc, outboundFlight, booking, outboundQR, false, logoBuffer);

      // Check if there's a return flight
      const hasReturnFlight = booking.flightDetails?.returnDepartureTime &&
                              booking.flightDetails?.returnArrivalTime;

      if (hasReturnFlight) {
        // Add new page for return flight
        doc.addPage();

        // Extract return departure and arrival times
        const returnDepTime = booking.flightDetails?.returnDepartureDateTime || booking.flightDetails?.returnDepartureTime;
        const returnArrTime = booking.flightDetails?.returnArrivalDateTime || booking.flightDetails?.returnArrivalTime;

        // Calculate return duration if not provided
        const storedReturnDuration = booking.flightDetails?.returnDuration;
        const calculatedReturnDuration = calculateDuration(returnDepTime, returnArrTime);
        const returnDuration = storedReturnDuration ?? calculatedReturnDuration;

        const returnFlight = {
          airlineCode: airlineCode,
          airline: booking.flightDetails?.airline,
          flightNumber: booking.flightDetails?.returnFlightNumber || booking.flightDetails?.flightNumber || `${airlineCode}001`,
          departureAirport: booking.flightDetails?.arrivalAirport ?? 'N/A', // Reversed
          arrivalAirport: booking.flightDetails?.departureAirport ?? 'N/A',  // Reversed
          // Use return datetime fields (already ISO format expected)
          departureTime: returnDepTime,
          arrivalTime: returnArrTime,
          duration: returnDuration,
          stops: booking.flightDetails?.returnStops ?? 0,
          cabinClass: booking.flightDetails?.cabinClass ?? 'economy',
          price: booking.flightDetails?.price ?? booking.totalPrice ?? 0
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

        // Draw return boarding pass with same logo
        drawBoardingPass(doc, returnFlight, booking, returnQR, true, logoBuffer);
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
