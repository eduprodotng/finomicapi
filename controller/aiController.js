const {
  saveFinancialInquiry,
  getInquiriesByUser,
  getInquiriesFromLast7Days,
  getChatSessionsByUser,
  getInquiriesFromDateRange,
  getInquiriesByChatIdModel,
  getMessagesByChatId,
} = require("../models/FinIn");
const jwt = require("jsonwebtoken");
// Save a new financial inquiry

const { getAIResponse } = require("../services/aiService");
const path = require("path");

const { extractTextFromPDF } = require("../utils/pdfUtils");

const createFinancialInquiry = async (req, res) => {
  try {
    const { chatTitle, chatId, userMessage } = req.body;
    const userId = req.user.id;

    if (!userMessage && !req.file) {
      return res
        .status(400)
        .json({ error: "Please provide a message or a file." });
    }

    let finalMessage = userMessage || "";
    let fileUrl = null;

    if (req.file) {
      const file = req.file;
      fileUrl = path.join("uploads", file.filename);

      // Only summarize if PDF
      if (file.mimetype === "application/pdf") {
        const textContent = await extractTextFromPDF(file.path);
        finalMessage += `\n\nSummarize this PDF:\n${textContent}`;
      }

      // If image or other file types: just store them, no processing (for now)
    }

    const aiResponse = await getAIResponse(finalMessage);

    const inquiry = await saveFinancialInquiry({
      userId,
      chatTitle,
      chatId,
      userMessage: finalMessage,
      aiResponse,
      fileUrl,
    });

    res.status(201).json({
      status: "success",
      message: "Inquiry processed and saved",
      data: inquiry,
    });
  } catch (err) {
    console.error("Error creating inquiry:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

const getUserInquiries = async (req, res) => {
  try {
    const userId = req.user.id; // 🔥 Get userId from the verified token

    const inquiries = await getInquiriesByUser(userId);

    res.status(200).json({
      status: "success",
      data: inquiries,
    });
  } catch (err) {
    console.error("Error fetching inquiries:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

const getUserRecentInquiries = async (req, res) => {
  try {
    const userId = req.user.id; // Use the user ID from the verified token
    const inquiries = await getInquiriesFromLast7Days(userId);

    res.status(200).json({
      status: "success",
      data: inquiries,
    });
  } catch (err) {
    console.error("Error fetching recent inquiries:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

// const getChatsFromToday = async (req, res) => {
//   try {
//     const userId = req.user.id; // Use the user ID from the verified token

//     // Get today's date
//     const today = new Date();
//     const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
//     const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today

//     // Fetch inquiries from today
//     const inquiries = await getInquiriesFromDateRange(
//       userId,
//       startOfDay,
//       endOfDay
//     );

//     res.status(200).json({
//       status: "success",
//       data: inquiries,
//     });
//   } catch (err) {
//     console.error("Error fetching today's inquiries:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error.",
//     });
//   }
// };
const getChatsFromToday = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Use the model function
    const inquiries = await getInquiriesFromDateRange(
      userId,
      startOfDay,
      endOfDay
    );

    // Group inquiries by chat_id
    const groupedByChatId = {};
    for (const inquiry of inquiries) {
      if (!groupedByChatId[inquiry.chat_id]) {
        groupedByChatId[inquiry.chat_id] = [];
      }
      groupedByChatId[inquiry.chat_id].push(inquiry);
    }

    // Convert object to array of grouped arrays
    const groupedChats = Object.values(groupedByChatId);

    res.status(200).json({
      status: "success",
      data: groupedChats,
    });
  } catch (err) {
    console.error("Error fetching today's chats:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

const getChatsFromYesterday = async (req, res) => {
  try {
    const userId = req.user.id; // Use the user ID from the verified token

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Set to yesterday
    const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0)); // Start of yesterday
    const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999)); // End of yesterday

    // Fetch inquiries from yesterday
    const inquiries = await getInquiriesFromDateRange(
      userId,
      startOfDay,
      endOfDay
    );

    res.status(200).json({
      status: "success",
      data: inquiries,
    });
  } catch (err) {
    console.error("Error fetching yesterday's inquiries:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

// Get distinct chat sessions for a user
const getUserChatSessions = async (req, res) => {
  try {
    const userId = req.user.id; // Use the user ID from the verified token
    const sessions = await getChatSessionsByUser(userId);

    res.status(200).json({
      status: "success",
      data: sessions,
    });
  } catch (err) {
    console.error("Error fetching chat sessions:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

// Get all messages in a chat session
const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id; // Use the user ID from the verified token
    const { chatId } = req.params; // The chat ID comes from the params
    const messages = await getMessagesByChatId(userId, chatId);

    res.status(200).json({
      status: "success",
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

// Controller to handle route logic
const getInquiriesByChatId = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const inquiries = await getInquiriesByChatIdModel(userId, chatId);

    res.status(200).json({
      status: "success",
      data: inquiries,
    });
  } catch (err) {
    console.error("Error fetching chat by chatId:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

module.exports = {
  createFinancialInquiry,
  getUserInquiries,
  getUserRecentInquiries,
  getInquiriesByChatId,
  getUserChatSessions,
  getChatMessages,
  getChatsFromYesterday,
  getChatsFromToday,
};
