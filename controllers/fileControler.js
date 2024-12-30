const File = require('../models/fileModel');  

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
        const { id } = req.params; 

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


module.exports = {
  uploadFile,getFileById
};
