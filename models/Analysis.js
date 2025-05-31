const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chatTitle: { type: String, required: false },
  chatId: { type: String, required: false },
  userMessage: { type: String, required: false },
  aiResponse: { type: String, required: false },
  fileUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
});

const Analysis = mongoose.model("Analysis", AnalysisSchema);

// Save new inquiry
async function saveAnalysis({
  userId,
  chatTitle,
  chatId,
  userMessage,
  aiResponse,
  fileUrl,
}) {
  const inquiry = new Analysis({
    userId,
    chatTitle,
    chatId,
    userMessage,
    aiResponse,
    fileUrl,
  });
  return await inquiry.save();
}

// Get all inquiries for user ordered by createdAt desc
async function getAnalysisByUser(userId) {
  return Analysis.find({ userId, isArchived: false })
    .sort({ createdAt: -1 })
    .exec();
}

// Get inquiries for last 7 days for user
// async function getInquiriesFromLast7Days(userId) {
//   const sevenDaysAgo = new Date();
//   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//   return FinancialInquiry.find({
//     userId,
//     createdAt: { $gte: sevenDaysAgo },
//   })
//     .sort({ createdAt: -1 })
//     .exec();
// }

// Get distinct chat sessions for user (unique chatId with earliest createdAt)
// async function getChatSessionsByUser(userId) {
//   // Aggregate to group by chatId and get first chatTitle and earliest createdAt
//   return FinancialInquiry.aggregate([
//     { $match: { userId: mongoose.Types.ObjectId(userId) } },
//     {
//       $group: {
//         _id: "$chatId",
//         chatTitle: { $first: "$chatTitle" },
//         startedAt: { $min: "$createdAt" },
//       },
//     },
//     { $sort: { startedAt: -1 } },
//   ]);
// }

// Get messages by chatId for user
// async function getMessagesByChatId(userId, chatId) {
//   return FinancialInquiry.find({ userId, chatId })
//     .sort({ createdAt: 1 })
//     .exec();
// }
async function archiveAllForUser(userId) {
  return Analysis.updateMany({ userId }, { isArchived: true });
}

async function deleteAllInquiriesForUser(userId) {
  return Analysis.deleteMany({ userId });
}

// Get inquiries within date range for user
// async function getInquiriesFromDateRange(userId, startDate, endDate) {
//   return FinancialInquiry.find({
//     userId,
//     createdAt: { $gte: startDate, $lte: endDate },
//   })
//     .sort({ createdAt: -1 })
//     .exec();
// }

// Get inquiries by chatId for user
// async function getInquiriesByChatIdModel(userId, chatId) {
//   return FinancialInquiry.find({ userId, chatId })
//     .sort({ createdAt: -1 })
//     .exec();
// }

module.exports = {
  saveAnalysis,
  getAnalysisByUser,
  archiveAllForUser,
  deleteAllInquiriesForUser,
};
