const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images/'));
    },
    filename: (req, file, cb) => {
            cb(null, `${file.originalname}`);
        // return (new Error('El formato no es una imagen'));
    },
});

module.exports = storage;