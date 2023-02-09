const multer = require("multer");
const path = require("path");

// Multer config
const uploadPhoto = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext.toLowerCase() !== ".jpg" && ext.toLowerCase() !== ".jpeg" && ext.toLowerCase() !== ".png") {
            cb(new Error("File type is not supported"), false);
            return;
        }
        cb(null, true);
    },
});


module.exports = {
    uploadPhoto
}