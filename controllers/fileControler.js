
const axios = require("axios");


const File = require("../models/fileModel"); 
const User = require("../models/userModel"); 
const upload = require('../config/multerConfig')


;
const FormData = require("form-data");

const pdfParse = require("pdf-parse");

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






















const {  StandardFonts } = require('pdf-lib');


const pDFDebugger = require('../pdfDebugger');
const PDFDebugger = new pDFDebugger();  // Create a single instance








const PDFParser = require("pdf2json");




const TRANSLATION_API = 'https://api.mymemory.translated.net/get'; // Using MyMemory API






const PDFDocument = require('pdfkit'); // Ensure this is from pdfkit





const { PDFDocument: PDFLibDocument } = require('pdf-lib');


const PDF_ANALYSIS_API = 'http://10.4.16.36:8005/api/analyze-document';
const PIXELS_TO_POINTS_SCALE = 72 / 300; // 300 DPI to PDF points
const FONT_SIZE_MULTIPLIER = 2;          // Scale OCR font sizes
const FONT_PROB_THRESHOLD = 0.9;         // Threshold for style detection

// Helpers
const safeNum = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

const toPoints = (pixels) => safeNum(pixels) * PIXELS_TO_POINTS_SCALE;

// Get original PDF page dimensions using pdf-lib.
async function getOriginalPageSize(pdfPath) {
  try {
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFLibDocument.load(existingPdfBytes);
    const [firstPage] = pdfDoc.getPages();
    return firstPage.getSize();
  } catch (error) {
    console.error("Error getting original page size:", error);
    return { width: 595, height: 842 }; // Default A4 size
  }
}

// Controller: processFile
async function processFile(req, res) {
  try {
    const { sourceLanguage, targetLanguage, max_pages } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' });
    if (!sourceLanguage || !targetLanguage)
      return res.status(400).json({ error: 'Missing sourceLanguage or targetLanguage' });

    // --- API: PDF Analysis ---
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path));
    form.append('lang', sourceLanguage);
    if (max_pages) form.append('max_pages', max_pages);

    const analysisResponse = await axios.post(PDF_ANALYSIS_API, form, {
      headers: form.getHeaders(),
    });
    const analysisData = analysisResponse.data;
    if (analysisData.status !== 'success')
      return res.status(500).json({ error: 'PDF analysis API failed' });

    // --- Process and Translate each text element ---
    const pagesFinal = analysisData.result.pages.map(page =>
      page.text_info.map(async textInfo => {
        const translationResponse = await axios.get(TRANSLATION_API, {
          params: {
            q: textInfo.text,
            langpair: `${sourceLanguage}|${targetLanguage}`,
          },
        });
        const translatedText =
          translationResponse.data.responseData?.translatedText || textInfo.text;

        const bbox = textInfo.bounding_box
          ? {
              x: toPoints(textInfo.bounding_box.x),
              y: toPoints(textInfo.bounding_box.y),
              width: toPoints(textInfo.bounding_box.width),
              height: toPoints(textInfo.bounding_box.height),
            }
          : { x: 0, y: 0, width: 0, height: 0 };

        const baseSize = toPoints(textInfo.font_size || 12);
        const fontSizePoints = Math.max(baseSize * FONT_SIZE_MULTIPLIER, 12);

        return {
          text: textInfo.text,
          translated_text: translatedText,
          bounding_box: bbox,
          font_size: fontSizePoints,
          color: textInfo.text_color || '#000000',
          font_attribute_info: textInfo.styles || {},
        };
      })
    );

    // Wait for all translations to resolve.
    const pagesFinalResolved = await Promise.all(
      pagesFinal.map(page => Promise.all(page))
    );

    // --- PDF Reconstruction ---
    const { width: origWidth, height: origHeight } = await getOriginalPageSize(req.file.path);
    const doc = new PDFDocument({
      autoFirstPage: false,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    const outputFilePath = path.join(__dirname, `translated_${Date.now()}.pdf`);
    const stream = fs.createWriteStream(outputFilePath);
    doc.pipe(stream);

    doc.addPage({ size: [origWidth, origHeight], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
    const firstPageElements = pagesFinalResolved[0] || [];
    firstPageElements.forEach(el => {
      const { x, y, width, height } = el.bounding_box;
      let computedBold = el.font_attribute_info.is_bold;
      let computedItalic = el.font_attribute_info.is_italic;
      let computedUnderline = el.font_attribute_info.is_underlined;

      if (el.font_attribute_info.probabilities) {
        computedBold = el.font_attribute_info.probabilities.bold > FONT_PROB_THRESHOLD;
        computedItalic = el.font_attribute_info.probabilities.italic > FONT_PROB_THRESHOLD;
        computedUnderline = el.font_attribute_info.probabilities.underline > FONT_PROB_THRESHOLD;
      }

      let font = 'Helvetica';
      if (computedBold && computedItalic) font = 'Helvetica-BoldOblique';
      else if (computedBold) font = 'Helvetica-Bold';
      else if (computedItalic) font = 'Helvetica-Oblique';

      doc.font(font)
         .fontSize(el.font_size)
         .fillColor(el.color)
         .text(el.translated_text, safeNum(x), safeNum(y), {
           width: safeNum(width),
           align: 'left',
           height: safeNum(height),
           baseline: 'top',
           lineBreak: false,
           ellipsis: false,
         });

      if (computedUnderline) {
        const underlineY = safeNum(y) + el.font_size + 2;
        doc.moveTo(safeNum(x), underlineY)
           .lineTo(safeNum(x) + safeNum(width), underlineY)
           .stroke(el.color);
      }
    });

    doc.end();

    stream.on('finish', () => {
      fs.unlink(req.file.path, () => {}); // Clean up the uploaded file
      res.json({ translatedPdfPath: outputFilePath });
    });

    stream.on('error', err => {
      res.status(500).json({ error: 'Error writing translated PDF file.', details: err.message });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { processFile };
module.exports = { processFile };













const getForm = (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload File</title>
   
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
        <form action="http://10.4.16.36:8005/api/analyze-document" method="POST" enctype="multipart/form-data">
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
