// const File = require('../models/fileModel');  
const axios = require("axios");


const File = require("../models/fileModel"); 
const User = require("../models/userModel"); 
const upload = require('../config/multerConfig')


;
const FormData = require("form-data");

const pdfParse = require("pdf-parse");
const { PDFDocument, rgb } = require('pdf-lib');
const path = require('path');

const pdf2img = require('pdf2img');







const uploadFile = async (req, res) => {
    try {
        const { userId } = req.body; 
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const newFile = new File({
            filename: req.file.filename,
            path: req.file.path,
            fileType: req.file.mimetype,
            fileUrl: fileUrl,
        });

        const savedFile = await newFile.save();

        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.files.push(savedFile._id);
        await user.save();

        res.status(200).json({
            message: 'File uploaded and associated with user',
            file: savedFile,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
};

const getFileById = async (req, res) => {
    try {
        const { id } = req.user._id; 

        const file = await File.findById(id); // Find the file by ID
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.status(200).json({
            message: 'File retrieved successfully',
            file,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving file', error: error.message });
    }
};



const pdfPoppler = require('pdf-poppler');

const API_BASE_URL = 'http://localhost:3000';

// const processFile = async (req, res) => {
//     try {
//         const { sourceLanguage, targetLanguage, whichMT = 'google' } = req.body;

//         if (!req.file) {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         const file = req.file;
//         const fileExtension = path.extname(file.originalname).toLowerCase();

//         if (fileExtension !== '.pdf' && fileExtension !== '.png') {
//             return res.status(400).json({ message: 'Invalid file type. Only PDF and PNG are supported.' });
//         }

//         const uploadPath = file.path;
//         let images = [];

//         // Convert PDF to images if input is a PDF
//         if (fileExtension === '.pdf') {
//             images = await convertPdfToImages(uploadPath);
//         } else {
//             images.push(uploadPath);
//         }

//         let finalResults = [];

//         await Promise.all(
//             images.map(async (imgPath) => {
//                 try {
//                     // Apply Preprocessing Steps
//                     const binarizedImage = await callPreprocessAPI(imgPath, '/layout/preprocess/binarize');
//                     const grayscaleImage = await callPreprocessAPI(imgPath, '/layout/preprocess/grayscale');
//                     const fontProperties = await callPreprocessAPI(imgPath, '/layout/preprocess/font');

//                     // Use the binarized image (or grayscale if needed) for text extraction
//                     const processedImagePath = binarizedImage?.imagePath || grayscaleImage?.imagePath || imgPath;

//                     // Extracting Text and BBOX from CEGIS API
//                     const cegisData = await callCegisAPI(processedImagePath);
//                     const { text = '', bbox = [] } = cegisData;

//                     // Translate the extracted text
//                     const translatedText = await translateText(text, sourceLanguage, targetLanguage, whichMT);

//                     finalResults.push({
//                         text,
//                         translated_text: translatedText,
//                         bbox,
//                         font_size: fontProperties?.fontSize || 'N/A',
//                         font_family: fontProperties?.fontFamily || 'N/A',
//                         font_attributes: fontProperties?.fontDecoration || 'N/A',
//                         processed_image: processedImagePath, // Storing the final processed image used for OCR
//                     });
//                 } catch (err) {
//                     console.error(`Error processing image ${imgPath}:`, err.message);
//                 }
//             })
//         );

//         res.status(200).json({ pages: finalResults });
//     } catch (error) {
//         console.error('Error processing file:', error);
//         res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };

// // Convert PDF to Images using pdf-poppler
// const convertPdfToImages = async (pdfPath) => {
//     const outputDir = path.resolve(__dirname, '../uploads');
//     if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

//     const opts = { format: 'png', out_dir: outputDir, out_prefix: path.basename(pdfPath, '.pdf'), page: null };
//     await pdfPoppler.convert(pdfPath, opts);

//     return fs.readdirSync(outputDir)
//         .filter(file => file.startsWith(path.basename(pdfPath, '.pdf')) && file.endsWith('.png'))
//         .map(img => path.join(outputDir, img));  // Returning absolute paths
// };

// // Call Preprocessing APIs (Binarize, Grayscale, Font)
// const callPreprocessAPI = async (imagePath, apiEndpoint) => {
//     try {
//         const formData = new FormData();
//         formData.append('images', fs.createReadStream(imagePath));

//         const response = await axios.post(`${API_BASE_URL}${apiEndpoint}`, formData, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });

//         return response.data.images?.[0] || {};
//     } catch (error) {
//         console.error(`Error calling ${apiEndpoint}:`, error.message);
//         return {};
//     }
// };

// // Call CEGIS Layout Parser API (Extract Text & BBOX)
// const callCegisAPI = async (imagePath) => {
//     try {
//         const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });

//         const response = await axios.post(`${API_BASE_URL}/layout/cegis/`, {
//             image: imageBase64
//         }, {
//             headers: { 'Content-Type': 'application/json' }
//         });

//         return response.data || {};
//     } catch (error) {
//         console.error('Error calling CEGIS API:', error.message);
//         return {};
//     }
// };

// // Translate Text (Google/Bhashini)
// const translateText = async (text, sourceLang, targetLang, whichMT) => {
//     const GOOGLE_API_KEY = 'YOUR_GOOGLE_TRANSLATE_API_KEY'; // Replace with your key

//     try {
//         if (whichMT === 'bhashini') {
//             const response = await axios.post('https://bhashini.gov.in/api/translate', {
//                 text, sourceLang, targetLang
//             });
//             return response.data.translated_text;
//         } else {
//             const result = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`, {
//                 q: text, source: sourceLang, target: targetLang, format: 'text'
//             });
//             return result.data.data.translations[0].translatedText;
//         }
//     } catch (error) {
//         console.error('Translation Error:', error.message);
//         return text;
//     }
// };

// module.exports = { processFile };



const fs = require("fs-extra");




















// const FONT_DETECTION_API = 'http://10.4.16.36:8002/detect-font';
// const COLOR_DETECTION_API = 'http://10.4.16.36:8002/detect-color';




// const TRANSLATION_API = 'https://api.mymemory.translated.net/get';


 




// const processFile = async (req, res) => {
//     try {
//         const { sourceLanguage, targetLanguage } = req.body;

//         if (!req.file) {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         const file = req.file;
//         if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
//             return res.status(400).json({ message: 'Only PDFs are supported.' });
//         }

//         // Call APIs in parallel
//         const [fontData, colorData] = await Promise.all([
//             detectFont(file.path, sourceLanguage),
//             detectColor(file.path)
//         ]);

//         // Extract texts 
//         const textsToTranslate = fontData.map(item => item.text);
//         const translatedTexts = await translateText(textsToTranslate, sourceLanguage, targetLanguage);

//         // Create final data structure
//         const importantData = fontData.map((item, index) => ({
//             text: item.text,
//             translated_text: translatedTexts[index] || '',
//             bbox: item.bbox,
//             font_size: item.font_size,
//             font_attributes: item.text_type,
//             color: findMatchingColor(item.bbox, colorData) || { r: 0, g: 0, b: 0 },
//             page: item.page || 0
//         }));

//         // Clean up file
//         fs.unlinkSync(file.path);

//         res.status(200).json({
//             extracted_data: importantData,
//             translation_metadata: {
//                 source_language: sourceLanguage,
//                 target_language: targetLanguage,
//                 character_count: textsToTranslate.join('').length
//             }
//         });

//     } catch (error) {
//         console.error('Error processing file:', error);
//         res.status(500).json({ 
//             message: 'Internal server error',
//             error: error.message,
//             stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         });
//     }
// };

// const detectFont = async (pdfPath, sourceLanguage) => {
//     try {
//         const formData = new FormData();
//         formData.append('file', fs.createReadStream(pdfPath));
//         formData.append('lang_code', sourceLanguage);

//         const response = await axios.post(FONT_DETECTION_API, formData, {
//             headers: formData.getHeaders()
//         });

//         return response.data;
//     } catch (error) {
//         console.error('Error calling font detection API:', error.response?.data || error.message);
//         return [];
//     }
// };


// const detectColor = async (pdfPath) => {
//     try {
//         const formData = new FormData();
//         formData.append('file', fs.createReadStream(pdfPath));

//         const response = await axios.post(COLOR_DETECTION_API, formData, {
//             headers: formData.getHeaders()
//         });

//         return response.data;
//     } catch (error) {
//         console.error('Error calling color detection API:', error.response?.data || error.message);
//         return [];
//     }
// };

// // Translation function
// const translateText = async (texts, sourceLang, targetLang) => {
//     if (!texts?.length) return [];
    
//     try {
//         return await Promise.all(texts.map(async (text) => {
//             const response = await axios.get(
//                 `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
//             );
//             return response.data?.responseData?.translatedText || text; // go back to original text
//         }));
//     } catch (error) {
//         console.error('Translation error:', error.response?.data || error.message);
//         return texts; // original texts if translation fails
//     }
// };

// // Improved color matching with tolerance
// const findMatchingColor = (targetBBox, colorData) => {
//     const TOLERANCE = 2; // 2px tolerance
    
//     for (const page of colorData) {
//         for (const textObj of page.text_info || []) {
//             const box = textObj.bounding_box || [];
//             const sourceBBox = Array.isArray(box) 
//                 ? box 
//                 : [box.x, box.y, box.x + box.width, box.y + box.height];

//             if (sourceBBox.length !== 4) continue;

//             const isMatch = targetBBox.every((val, i) => 
//                 Math.abs(val - sourceBBox[i]) < TOLERANCE
//             );

//             if (isMatch) return textObj.text_color;
//         }
//     }
//     return { r: 0, g: 0, b: 0 }; // Default to black
// };

// Keep your existing detectFont and detectColor functions unchanged


const {  StandardFonts } = require('pdf-lib');


const pDFDebugger = require('../pdfDebugger');
const PDFDebugger = new pDFDebugger();  // Create a single instance

// API Endpoints





// Define the detection image dimensions (adjust these based on your detection API output)


// These constants represent the resolution (width x height) of your detection API output.
// Adjust them as necessary to minimize layout variation.

const PDFParser = require("pdf2json");



// Detection API coordinate space – adjust these values as needed.
const DETECTION_IMAGE_WIDTH = 2500;  
const DETECTION_IMAGE_HEIGHT = 2600;

// API Endpoints
const FONT_DETECTION_API = 'http://10.4.16.36:8003/detect-font';
const COLOR_DETECTION_API = 'http://10.4.16.36:8003/detect-color';
const FONT_STYLE_DETECTION_API = 'http://10.4.16.36:8003/detect-style';
const TRANSLATION_API = 'https://api.mymemory.translated.net/get'; // Using MyMemory API

/**
 * Use pdf2json to extract detailed layout information from the original PDF.
 */
function extractLayoutDetails(pdfPath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => resolve(pdfData));
    pdfParser.loadPDF(pdfPath);
  });
}

/**
 * Compute dynamic transformation values (like margins) from PDF layout.
 * Assumes that the smallest x and y values among text elements represent margins.
 */
async function computeTransformation(pdfPath) {
  const layoutDetails = await extractLayoutDetails(pdfPath);
  const firstPageData = layoutDetails?.Pages[0];
  let marginX = 0, marginY = 0;
  if (firstPageData && firstPageData.Texts && firstPageData.Texts.length > 0) {
    marginX = Math.min(...firstPageData.Texts.map(t => t.x));
    marginY = Math.min(...firstPageData.Texts.map(t => t.y));
    // Note: If pdf2json returns percentages, adjust accordingly.
  }
  return { marginX, marginY };
}

/**
 * Group detected text items by line based on their y-coordinate.
 * yTolerance is in detection space units.
 */
function groupWordsByLine(items, yTolerance = 5) {
  // Sort items by their y-coordinate
  const sortedItems = [...items].sort((a, b) => a.bbox[1] - b.bbox[1]);
  const lines = [];
  let currentLine = [];
  sortedItems.forEach(item => {
    if (currentLine.length === 0) {
      currentLine.push(item);
    } else {
      // Use the first item's y as the reference for the current line.
      const referenceY = currentLine[0].bbox[1];
      if (Math.abs(item.bbox[1] - referenceY) < yTolerance) {
        currentLine.push(item);
      } else {
        lines.push(currentLine);
        currentLine = [item];
      }
    }
  });
  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}

/**
 * Use MyMemory API for translation.
 * This function expects an array of full sentence strings.
 */
async function translateText(texts, sourceLang, targetLang, PDFDebugger) {
  try {
    return await Promise.all(texts.map(async (text) => {
      const response = await axios.get(
        `${TRANSLATION_API}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      const result = response.data.responseData?.translatedText || text;
      PDFDebugger.log(`Translated: ${text} → ${result}`);
      return result;
    }));
  } catch (error) {
    PDFDebugger.log(`Translation failed: ${error.message}`);
    return texts;
  }
}

/**
 * Main function to process the PDF file.
 */
const processFile = async (req, res) => {
  let file = null;
  try {
    file = req.file;
    PDFDebugger.log(`\n=== Processing Started ===`);
    PDFDebugger.log(`File: ${file.originalname}`);
    PDFDebugger.log(`Temp Path: ${file.path}`);

    // Call detection APIs in parallel.
    PDFDebugger.log('\n=== Detection API Calls ===');
    const [fontData, colorData, styleData] = await Promise.all([
      detectFont(file.path, req.body.sourceLanguage, PDFDebugger),
      detectColor(file.path, PDFDebugger),
      detectStyle(file.path, req.body.sourceLanguage, PDFDebugger)
    ]);

    // Instead of translating each word separately,
    // group detected words into lines.
    const groupedLines = groupWordsByLine(fontData, 5);
    // Build a new structure where each line has:
    // - lineText: the joined original texts (space separated)
    // - bbox: aggregated bounding box (minX, minY, maxX, maxY)
    // - font_size and color from the first word in the line
    // - page number from the first word
    const linesData = groupedLines.map(lineItems => {
      // Sort the items by x-coordinate.
      lineItems.sort((a, b) => a.bbox[0] - b.bbox[0]);
      const lineText = lineItems.map(item => item.text).join(' ');
      const minX = Math.min(...lineItems.map(item => Number(item.bbox[0])));
      const maxX = Math.max(...lineItems.map(item => Number(item.bbox[2])));
      const minY = Math.min(...lineItems.map(item => Number(item.bbox[1])));
      const maxY = Math.max(...lineItems.map(item => Number(item.bbox[3])));
      return {
        lineText,
        bbox: [minX, minY, maxX, maxY],
        font_size: lineItems[0].font_size,
        color: lineItems[0].color,
        page: lineItems[0].page
      };
    });

    // Translate entire lines at once.
    PDFDebugger.log('\n=== Translation ===');
    const linesToTranslate = linesData.map(line => line.lineText);
    const translatedLines = await translateText(linesToTranslate, req.body.sourceLanguage, req.body.targetLanguage, PDFDebugger);
    // Update linesData with translated text.
    linesData.forEach((line, idx) => {
      line.translated_text = translatedLines[idx];
    });

    // PDF Reconstruction – use the original file path for dimensions and layout details.
    PDFDebugger.log('\n=== PDF Reconstruction ===');
    const outputPath = path.join('uploads', `reconstructed-${Date.now()}.pdf`);
    await reconstructPDF(linesData, outputPath, PDFDebugger, file.path);

    res.status(200).json({
      success: true,
      data: linesData,
      files: {
        original: `/uploads/${path.basename(file.path)}`,
        reconstructed: `/uploads/${path.basename(outputPath)}`
      },
      debug: `/debug/logs/${path.basename(outputPath, '.pdf')}.log`
    });
  } catch (error) {
    PDFDebugger.log(`\n!!! Processing Failed !!!\n${error.stack}`);
    res.status(500).json({
      success: false,
      error: error.message,
      debug: error.debug || 'No debug available'
    });
  } finally {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    if (file && typeof PDFDebugger.saveLogs === 'function') {
      PDFDebugger.saveLogs(path.basename(file.originalname, '.pdf'));
    }
  }
};

async function detectFont(pdfPath, lang, PDFDebugger) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));
    formData.append('lang_code', lang);
    const response = await axios.post(FONT_DETECTION_API, formData, {
      headers: formData.getHeaders()
    });
    PDFDebugger.log(`Font detection success: ${response.data.length} items`);
    return response.data;
  } catch (error) {
    PDFDebugger.log(`Font detection failed: ${error.message}`);
    throw new Error('Font detection failed');
  }
}

async function detectColor(pdfPath, PDFDebugger) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));
    const response = await axios.post(COLOR_DETECTION_API, formData, {
      headers: formData.getHeaders()
    });
    PDFDebugger.log(`Color detection success: ${response.data.length} pages`);
    return response.data;
  } catch (error) {
    PDFDebugger.log(`Color detection failed: ${error.message}`);
    throw new Error('Color detection failed');
  }
}

async function detectStyle(pdfPath, lang, PDFDebugger) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));
    formData.append('lang_code', lang);
    const response = await axios.post(FONT_STYLE_DETECTION_API, formData, {
      headers: formData.getHeaders()
    });
    PDFDebugger.log(`Style detection success: ${response.data.words?.length || 0} words`);
    return response.data;
  } catch (error) {
    PDFDebugger.log(`Style detection failed: ${error.message}`);
    return { words: [] };
  }
}

function findMatchingColor(targetBBox, colorData, PDFDebugger) {
  const TOLERANCE = 2;
  try {
    for (const page of colorData) {
      for (const textInfo of page.text_info || []) {
        const box = textInfo.bounding_box || {};
        const sourceBBox = [
          Number(box.x) || 0,
          Number(box.y) || 0,
          (Number(box.x) || 0) + (Number(box.width) || 0),
          (Number(box.y) || 0) + (Number(box.height) || 0)
        ];
        const match = targetBBox.every((val, i) => Math.abs(val - sourceBBox[i]) < TOLERANCE);
        if (match) {
          PDFDebugger.log(`Color match found: ${textInfo.text_color} for ${targetBBox}`);
          return textInfo.text_color;
        }
      }
    }
  } catch (error) {
    PDFDebugger.log(`Color matching error: ${error.message}`);
  }
  return '#000000';
}

function findMatchingStyle(targetBBox, styleWords, PDFDebugger) {
  const TOLERANCE = 5;
  try {
    for (const word of styleWords) {
      const sourceBBox = word.bbox || [];
      const match = targetBBox.every((val, i) => Math.abs(val - (sourceBBox[i] || 0)) < TOLERANCE);
      if (match) {
        PDFDebugger.log(`Style match found: ${JSON.stringify(word.styles)}`);
        return word.styles;
      }
    }
  } catch (error) {
    PDFDebugger.log(`Style matching error: ${error.message}`);
  }
  return 'N/A';
}

/**
 * Reconstruct the PDF using extracted data while preserving the original layout.
 * This version uses pdf-lib to get original page dimensions and pdf2json for layout details,
 * then draws each translated line as a single text block.
 *
 * @param {Array} linesData - Array of objects representing a line with its bounding box and translated text.
 * @param {string} outputPath - Path to save the new PDF.
 * @param {object} PDFDebugger - Debug logger.
 * @param {string} originalFilePath - Path to the original PDF file.
 */
async function reconstructPDF(linesData, outputPath, PDFDebugger, originalFilePath) {
  try {
    // Load original PDF dimensions.
    const originalPdfBytes = fs.readFileSync(originalFilePath);
    const originalPdfDoc = await PDFDocument.load(originalPdfBytes);
    const originalPages = originalPdfDoc.getPages();
    const originalPageSizes = originalPages.map(page => page.getSize());

    // Extract layout details and compute dynamic offsets.
    const { marginX, marginY } = await computeTransformation(originalFilePath);
    PDFDebugger.log(`Dynamic offsets from layout analysis: marginX=${marginX.toFixed(2)}, marginY=${marginY.toFixed(2)}`);

    // Compute scale factors from detection space to PDF space using first page dimensions.
    const scaleX = (originalPageSizes[0].width) / DETECTION_IMAGE_WIDTH;
    const scaleY = (originalPageSizes[0].height) / DETECTION_IMAGE_HEIGHT;
    PDFDebugger.log(`Scale factors: scaleX=${scaleX.toFixed(3)}, scaleY=${scaleY.toFixed(3)}`);

    // Create new PDF document for reconstruction.
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Group linesData by page number.
    const pagesData = linesData.reduce((acc, line) => {
      const page = line.page || 1;
      if (!acc[page]) acc[page] = [];
      acc[page].push(line);
      return acc;
    }, {});

    for (const [pageNum, lines] of Object.entries(pagesData)) {
      const pageIndex = parseInt(pageNum, 10) - 1;
      const { width: pdfPageWidth, height: pdfPageHeight } = originalPageSizes[pageIndex] || { width: 612, height: 792 };

      PDFDebugger.log(`\nProcessing page ${pageNum}:`);
      PDFDebugger.log(`Original PDF dimensions: width=${pdfPageWidth}, height=${pdfPageHeight}`);

      // Create a new page with the original dimensions.
      const page = pdfDoc.addPage([pdfPageWidth, pdfPageHeight]);

      lines.forEach((line, idx) => {
        // Extract the aggregated bounding box.
        const [minX, minY, maxX, maxY] = line.bbox;
        // Map detection coordinates to PDF space.
        const mappedX = minX * scaleX + marginX;
        const mappedY1 = minY * scaleY + marginY;
        const mappedY2 = maxY * scaleY + marginY;
        // Flip Y coordinate (pdf-lib uses bottom-left origin).
        const pdfY = pdfPageHeight - mappedY2;

        PDFDebugger.log(`Line ${idx}: "${line.translated_text}"`);
        PDFDebugger.log(`Mapped position: (${mappedX.toFixed(2)}, ${pdfY.toFixed(2)})`);

        // Draw the full line of text.
        page.drawText(line.translated_text, {
          x: mappedX,
          y: pdfY,
          size: line.font_size > 0 ? line.font_size : 12,
          font,
          maxWidth: (maxX * scaleX + marginX) - mappedX,
          color: parseColor(line.color, PDFDebugger)
        });
      });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    PDFDebugger.log(`\nPDF successfully reconstructed: ${outputPath}`);
  } catch (error) {
    PDFDebugger.log(`Reconstruction failed: ${error.stack}`);
    throw error;
  }
}

function parseColor(hex, PDFDebugger) {
  try {
    const cleanHex = hex.replace(/[^0-9a-f]/gi, '').padEnd(6, '0');
    return rgb(
      parseInt(cleanHex.substring(0, 2), 16) / 255,
      parseInt(cleanHex.substring(2, 4), 16) / 255,
      parseInt(cleanHex.substring(4, 6), 16) / 255
    );
  } catch (error) {
    PDFDebugger.log(`Color parse error (${hex}): ${error.message}`);
    return rgb(0, 0, 0);
  }
}

module.exports = { processFile };




const DETECT_COMPLETE_API = 'http://10.4.16.36:8003/detect-complete';
















const STYLE_DETECTION_API = 'http://10.4.16.36:8003/detect-style';




module.exports = { processFile };



const getForm = (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload File</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f4f4f4;
            margin: 0;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 350px;
        }
        input, select, button {
            margin: 10px 0;
            padding: 10px;
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 14px;
        }
        button {
            background-color: #28a745;
            color: white;
            cursor: pointer;
            border: none;
            transition: 0.3s;
        }
        button:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Upload Your File</h2>
        <form action="http://localhost:3000/files/process" method="POST" enctype="multipart/form-data">
            <label for="file">Choose PDF or PNG:</label>
            <input type="file" name="file" accept=".pdf,.png" required>
            
            <label for="sourceLanguage">Source Language:</label>
            <input type="text" name="sourceLanguage" placeholder="e.g., en" required>
            <label for="targetLanguage">Target Language:</label>
<input type="text" name="targetLanguage" placeholder="e.g., hi" required>

           

            <button type="submit">Upload & Process</button>
        </form>
    </div>
</body>
</html>`;

    res.send(html);
};



const TestForm = (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload File</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f4f4f4;
            margin: 0;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 350px;
        }
        input, select, button {
            margin: 10px 0;
            padding: 10px;
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 14px;
        }
        button {
            background-color: #28a745;
            color: white;
            cursor: pointer;
            border: none;
            transition: 0.3s;
        }
        button:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Upload Your File</h2>
        <form action="http://10.4.16.36:8003/detect-font" method="POST" enctype="multipart/form-data">
            <label for="file">Choose PDF or PNG:</label>
            <input type="file" name="file" accept=".pdf,.png" required>
            
            <label for="sourceLanguage">Source Language:</label>
            <input type="text" name="lang_code" placeholder="e.g., en" required>
           
           

            <button type="submit">Upload & Process</button>
        </form>
    </div>
</body>
</html>`;

    res.send(html);
};











module.exports = {
  uploadFile,getFileById,processFile,getForm,TestForm
};
