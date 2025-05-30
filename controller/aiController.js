const {
  saveFinancialInquiry,
  getInquiriesByUser,
  getInquiriesFromLast7Days,
  getChatSessionsByUser,
  getInquiriesFromDateRange,
  archiveAllForUser,
  getInquiriesByChatIdModel,
  deleteAllInquiriesForUser,
  getMessagesByChatId,
} = require("../models/FinIn");
const jwt = require("jsonwebtoken");
// Save a new financial inquiry
// const Tesseract = require("tesseract.js");
const { getAIResponse } = require("../services/aiService");
const path = require("path");
const fs = require("fs");
const { extractTextFromPDF } = require("../utils/pdfUtils");
const { createWorker } = require("tesseract.js");
const Tesseract = require("tesseract.js");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
// const createFinancialInquiry = async (req, res) => {
//   try {
//     const { chatTitle, chatId, userMessage } = req.body;
//     const userId = req.user.id;

//     if (!userMessage && !req.file) {
//       return res
//         .status(400)
//         .json({ error: "Please provide a message or a file." });
//     }

//     let finalMessage = userMessage || "";
//     let fileUrl = null;

//     if (req.file) {
//       fileUrl = req.file.location; // ✅ This is the S3 file URL

//       const mime = req.file.mimetype;

//       if (mime === "application/pdf") {
//         // --- PDF processing ---
//         const tempFilePath = `/tmp/${Date.now()}-${req.file.originalname}`;
//         const fs = require("fs");
//         const { default: fetch } = await import("node-fetch");

//         const response = await fetch(fileUrl);
//         const buffer = await response.buffer();
//         fs.writeFileSync(tempFilePath, buffer);

//         const textContent = await extractTextFromPDF(tempFilePath);
//         finalMessage += `\n\nSummarize this PDF:\n${textContent}`;

//         fs.unlinkSync(tempFilePath); // cleanup
//       }

//       // 🆕 Add OCR logic for image files
//       else if (mime.startsWith("image/")) {
//         const tempImagePath = `/tmp/${Date.now()}-${req.file.originalname}`;
//         const fs = require("fs");
//         const { default: fetch } = await import("node-fetch");

//         const response = await fetch(fileUrl);
//         const buffer = await response.buffer();
//         fs.writeFileSync(tempImagePath, buffer);

//         const {
//           data: { text },
//         } = await Tesseract.recognize(tempImagePath, "eng");
//         finalMessage += `\n\nExtracted Text from Image:\n${text}`;

//         fs.unlinkSync(tempImagePath); // cleanup
//       }
//     }

//     const aiResponse = await getAIResponse(finalMessage);

//     const inquiry = await saveFinancialInquiry({
//       userId,
//       chatTitle,
//       chatId,
//       userMessage: finalMessage,
//       aiResponse,
//       fileUrl,
//     });

//     res.status(201).json({
//       status: "success",
//       message: "Inquiry processed and saved",
//       data: inquiry,
//     });
//   } catch (err) {
//     console.error("Error creating inquiry:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error.",
//     });
//   }
// };

// Optional: Fetch user inquiries

// const createFinancialInquiry = async (req, res) => {
//   try {
//     const { chatTitle, chatId, userMessage } = req.body;
//     const userId = req.user.id;

//     if (!userMessage && !req.file) {
//       return res
//         .status(400)
//         .json({ error: "Please provide a message or a file." });
//     }

//     let finalMessage = userMessage || "";
//     let fileUrl = null;

//     if (req.file) {
//       fileUrl = req.file.location;
//       const mime = req.file.mimetype;

//       const tempFilePath = `/tmp/${Date.now()}-${req.file.originalname}`;
//       const response = await fetch(fileUrl);
//       const buffer = await response.buffer();
//       fs.writeFileSync(tempFilePath, buffer);

//       if (mime === "application/pdf") {
//         const textContent = await extractTextFromPDF(tempFilePath);
//         finalMessage += `\n\nSummarize this PDF:\n${textContent}`;
//       } else if (mime.startsWith("image/")) {
//         // Don't set corePath manually unless absolutely needed
//         const worker = await createWorker();

//         await worker.load();
//         await worker.loadLanguage("eng");
//         await worker.initialize("eng");

//         const {
//           data: { text },
//         } = await worker.recognize(tempFilePath);
//         finalMessage += `\n\nExtracted Text from Image:\n${text}`;

//         await worker.terminate();
//       }

//       fs.unlinkSync(tempFilePath);
//     }

//     const aiResponse = await getAIResponse(finalMessage);

//     const inquiry = await saveFinancialInquiry({
//       userId,
//       chatTitle,
//       chatId,
//       userMessage: finalMessage,
//       aiResponse,
//       fileUrl,
//     });

//     res.status(201).json({
//       status: "success",
//       message: "Inquiry processed and saved",
//       data: inquiry,
//     });
//   } catch (err) {
//     console.error("Error creating inquiry:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error.",
//     });
//   }
// };

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
      fileUrl = req.file.location;
      const mime = req.file.mimetype;

      // Download the file to /tmp
      const tempFilePath = path.join(
        "/tmp",
        `${Date.now()}-${req.file.originalname}`
      );
      const response = await fetch(fileUrl);
      const buffer = await response.buffer();
      fs.writeFileSync(tempFilePath, buffer);

      if (mime === "application/pdf") {
        const textContent = await extractTextFromPDF(tempFilePath);
        finalMessage += `\n\nSummarize this PDF:\n${textContent}`;
      } else if (mime.startsWith("image/")) {
        const {
          data: { text },
        } = await Tesseract.recognize(tempFilePath, "eng", {
          corePath:
            "//https://finomicapi-seven.vercel.app/tesseract/tesseract-core-simd.js",
        });

        finalMessage += `\n\nExtracted Text from Image:\n${text}`;
      }

      // Cleanup
      fs.unlinkSync(tempFilePath);
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
    const userId = req.user.id;
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

// const ArchiveAll = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     await FinancialInquiry.updateMany({ userId }, { isArchived: true });
//     res.status(200).json({ message: "All chats archived." });
//   } catch (err) {
//     console.error("Error archiving all chats:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
const ArchiveAll = async (req, res) => {
  try {
    const userId = req.user.id;
    await archiveAllForUser(userId);

    res.status(200).json({ message: "All chats archived." });
  } catch (err) {
    console.error("Error archiving all chats:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const DeleteAll = async (req, res) => {
  try {
    const userId = req.user.id;
    await deleteAllInquiriesForUser(userId); // ⬅️ Uses the helper

    res.status(200).json({ message: "All chats deleted." });
  } catch (err) {
    console.error("Error deleting all chats:", err);
    res.status(500).json({ message: "Internal server error" });
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
  ArchiveAll,
  getInquiriesByChatId,
  DeleteAll,
  getUserChatSessions,
  getChatMessages,
  getChatsFromYesterday,
  getChatsFromToday,
};
