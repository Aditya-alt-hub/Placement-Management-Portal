import multer from "multer";

const storage = multer.memoryStorage();

export const studentUpload = multer({
  storage,
}).fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);

// Recruiter offer letter PDF upload
export const offerLetterUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed."));
    }

    cb(null, true);
  },
}).single("offerLetter");
