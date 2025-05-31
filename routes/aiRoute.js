// examRoutes.js
const express = require("express");
const passport = require("passport");
const verify = require("../middlewares/verifyToken");
const {
  createFinancialInquiry,
  getUserInquiries,
  getUserEd,
  getUserAnalysis,
  getUserBudget,
  getUserBusiness,
  getUserInvestment,
  getUserBuy,
  getUserCredit,
  getUserDefi,
  getUserExpense,
  getUserGoal,
  getUserInquiry,
  getUserLoan,
  getUserRecentInquiries,
  getChatsFromYesterday,
  getChatsFromToday,
  getInquiriesByChatId,
  ArchiveAll,
  DeleteAll,
  createGoal,
  createAnalysis,
  createInquiry,
  createEd,
  createExpense,
  createInvestment,
  createDefi,
  createCredit,
  createBudget,
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
router.post(
  "/create-goal",
  verify,
  upload.single("supportingFile"),
  createGoal
);
router.post(
  "/create-analysis",
  verify,
  upload.single("supportingFile"),
  createAnalysis
);
router.post(
  "/create-inquiry",
  verify,
  upload.single("supportingFile"),
  createInquiry
);
router.post(
  "/create-budget",
  verify,
  upload.single("supportingFile"),
  createBudget
);
router.post("/create-ed", verify, upload.single("supportingFile"), createEd);
router.post(
  "/create-expense",
  verify,
  upload.single("supportingFile"),
  createExpense
);
router.post(
  "/create-investment",
  verify,
  upload.single("supportingFile"),
  createInvestment
);
router.post(
  "/create-defi",
  verify,
  upload.single("supportingFile"),
  createDefi
);
router.post(
  "/create-credit",
  verify,
  upload.single("supportingFile"),
  createCredit
);

router.get("/fin-inquiry", verify, getUserInquiries);
router.get("/user-analysis", verify, getUserAnalysis);
router.get("/user-budget", verify, getUserBudget);
router.get("/user-business", verify, getUserBusiness);
router.get("/user-buy", verify, getUserBuy);
router.get("/user-credit", verify, getUserCredit);
router.get("/user-defi", verify, getUserDefi);
router.get("/user-ed", verify, getUserEd);
router.get("/user-expense", verify, getUserExpense);
router.get("/user-goal", verify, getUserGoal);
router.get("/user-investment", verify, getUserInvestment);
router.get("/user-inquiry", verify, getUserInquiry);
router.get("/user-loan", verify, getUserLoan);

router.put("/fin-inquiry/archive-all", verify, ArchiveAll);

router.get("/fin-inquiry/yesterday", verify, getChatsFromYesterday);
router.get("/fin-inquiry/today", verify, getChatsFromToday);
router.get("/fin-inquiry/last-7-days", verify, getUserRecentInquiries);
router.get("/fin-inquiry/chat/:chatId", verify, getInquiriesByChatId);
router.delete("/fin-inquiry/delete-all", verify, DeleteAll);
module.exports = router;
