// examRoutes.js
const express = require("express");
const passport = require("passport");
const verify = require("../middlewares/verifyToken");
const {
  createFinancialInquiry,
  getUserInquiries,
  getUserRecentInquiries,
  getChatsFromYesterday,
  getChatsFromToday,
  getInquiriesByChatId,
  ArchiveAll,
  DeleteAll,
} = require("../controller/aiController");
const router = express.Router();
const { getClientIp } = require("../middlewares/ipgetter");

const path = require("path");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

// Create a route for submitting an exam
// router.post("/fin-inquiry", verify, createFinancialInquiry);

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// const upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: "eduprosolution",
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: (req, file, cb) => {
//       const fileKey = `inquiries/${Date.now()}-${file.originalname}`;
//       cb(null, fileKey);
//     },
//     expires: 60 * 60 * 24 * 7,
//   }),
// });

// router.post(
//   "/fin-inquiry",
//   verify,
//   upload.fields([{ name: "supportingFile", maxCount: 1 }]),
//   createFinancialInquiry
// );

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// router.post(
//   "/fin-inquiry",
//   verify,
//   upload.single("supportingFile"),
//   createFinancialInquiry
// );
// AWS S3 Setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer + S3 Storage Configuration
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileKey = `inquiries/${Date.now()}-${file.originalname}`;
      cb(null, fileKey);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Route to handle financial inquiry upload
router.post(
  "/fin-inquiry",
  verify,
  upload.single("supportingFile"),
  createFinancialInquiry
);

router.get("/fin-inquiry", verify, getUserInquiries);
router.put("/fin-inquiry/archive-all", verify, ArchiveAll);

router.get("/fin-inquiry/yesterday", verify, getChatsFromYesterday);
router.get("/fin-inquiry/today", verify, getChatsFromToday);
router.get("/fin-inquiry/last-7-days", verify, getUserRecentInquiries);
router.get("/fin-inquiry/chat/:chatId", verify, getInquiriesByChatId);
router.delete("/fin-inquiry/delete-all", verify, DeleteAll);
module.exports = router;
