const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  fileUrl: { type: String }  
});

const File = mongoose.model('File', fileSchema);

module.exports = File;

