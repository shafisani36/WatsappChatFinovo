import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(
process.cwd(),
"uploads",
"recordings"
);

if (!fs.existsSync(uploadDirectory)) {
fs.mkdirSync(uploadDirectory, {
recursive: true,
});
}

const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, uploadDirectory);
},

filename: (req, file, cb) => {
const extension = path.extname(file.originalname);

const fileName = `recording-${Date.now()}${extension}`;

cb(null, fileName);

},
});

const fileFilter = (req, file, cb) => {
if (file.mimetype.startsWith("video/")) {
cb(null, true);
} else {
cb(new Error("Only video files are allowed"));
}
};

const upload = multer({
storage,
fileFilter,
limits: {
fileSize: 100 * 1024 * 1024,
},
});

export default upload;