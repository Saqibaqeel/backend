const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');

class PDFDebugger {
  constructor() {
    this.logs = [];
  }

  async reconstructPDF(data, outputPath) {
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Start debug log
      this.log('=== PDF RECONSTRUCTION STARTED ===');
      this.log(`Processing ${data.length} text elements`);

      // Page tracking
      const pages = new Map();
      
      data.forEach((item, index) => {
        // Validate item structure
        this.validateItem(item, index);
        
        // Process coordinates
        const [x1, y1, x2, y2] = item.bbox;
        const pageNum = item.page || 1;
        
        if (!pages.has(pageNum)) {
          pages.set(pageNum, pdfDoc.addPage([612, 792]));
          this.log(`Created page ${pageNum}`);
        }
        
        const page = pages.get(pageNum);
        this.processTextItem(item, page, index);
      });

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outputPath, pdfBytes);
      this.log('=== PDF RECONSTRUCTION COMPLETED ===');
      
      // Write debug log
      fs.writeFileSync('pdf_debug.log', this.logs.join('\n'));
      
    } catch (error) {
      this.log(`CRITICAL ERROR: ${error.message}`);
      throw error;
    }
  }

  processTextItem(item, page, index) {
    try {
      this.log(`\nProcessing item ${index}: ${item.text} → ${item.translated_text}`);
      
      // Coordinate debug
      const [x1, y1, x2, y2] = item.bbox.map(Number);
      this.log(`Original BBox: [${x1}, ${y1}, ${x2}, ${y2}]`);
      
      const pageHeight = page.getHeight();
      const pdfY = pageHeight - y2;
      this.log(`Converted Y: ${pdfY} (page height: ${pageHeight})`);

      // Font debug
      const fontSize = Math.max(Number(item.font_size), 4);
      this.log(`Font size: ${fontSize}pt (original: ${item.font_size})`);

      // Color debug
      const color = this.parseColor(item.color);
      this.log(`Color: ${item.color} → RGB(${color.red}, ${color.green}, ${color.blue})`);

      // Draw text
      page.drawText(item.translated_text, {
        x: x1,
        y: pdfY,
        size: fontSize,
        font: this.font,
        color,
        maxWidth: x2 - x1,
      });

      this.log(`Drawn at (${x1}, ${pdfY}) with width ${x2 - x1}px`);

    } catch (error) {
      this.log(`ERROR in item ${index}: ${error.message}`);
      throw error;
    }
  }

  parseColor(hex) {
    try {
      if (!hex) return rgb(0, 0, 0);
      
      const cleanHex = hex.replace(/[^0-9a-f]/gi, '').padEnd(6, '0');
      if (cleanHex.length !== 6) throw new Error('Invalid hex length');
      
      return rgb(
        parseInt(cleanHex.substring(0, 2), 16) / 255,
        parseInt(cleanHex.substring(2, 4), 16) / 255,
        parseInt(cleanHex.substring(4, 6), 16) / 255
      );
    } catch (error) {
      this.log(`Color parse error: ${hex} - ${error.message}`);
      return rgb(0, 0, 0);
    }
  }

  validateItem(item, index) {
    const required = ['text', 'translated_text', 'bbox'];
    required.forEach(field => {
      if (!item[field]) throw new Error(`Missing ${field} in item ${index}`);
    });

    if (!Array.isArray(item.bbox) || item.bbox.length !== 4) {
      throw new Error(`Invalid bbox format in item ${index}`);
    }
  }

  log(message) {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
    console.log(message);
  }
}

module.exports = PDFDebugger;