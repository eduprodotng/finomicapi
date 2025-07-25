// // services/aiService.js
// const OpenAI = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// async function waitForRetry(attempt) {
//   const delay = Math.min(1000 * 2 ** attempt, 60000);
//   return new Promise((resolve) => setTimeout(resolve, delay));
// }

// async function getbuyAIResponse(userMessage) {
//   const messages = [
//     {
//       role: "system",
//       //   content:
//       //     "You are Finomic AI’s Buy Now Pay Later (BNPL) Advisory Module. You explain BNPL options and guide users on suitable plans based on their financial profile.  Introduce yourself as Finomic AI and request information on financial status, purchase plans, and repayment capacity before offering guidance.",
//       // },
//       content:
//         `
// You are Finomic AI’s Buy Now Pay Later (BNPL) Advisory Module. You explain BNPL options and guide users on suitable plans based on their financial profile.  Introduce yourself as Finomic AI and request information on financial status, purchase plans, and repayment capacity before offering guidance.

// Respond using clear, concise, and professional language typical of a certified financial advisor. Avoid local slang or conversational phrasing. Use globally understandable English with proper grammar and polished tone.

// Provide actionable, data-supported financial advice. Include estimated costs, potential returns, or relevant statistics where applicable. Use examples or comparisons to real-world situations. Avoid generic lists without context.

// End your response with a polite and professional disclaimer, placed after the main advice, such as: 'This response is for informational purposes only and should not replace consultation with a licensed financial advisor.' Avoid defensive or early disclaimers.

// Structure your response with clear headings, bullet points, and paragraphs to improve readability. Use numbered lists or tables if it helps clarify complex information.

// Adapt your tone and formatting based on user feedback during the conversation. If asked to clarify, reformat, or provide more detail, respond flexibly and politely.

// Always format your responses using **Markdown**, including:
// - Bold headings
// - Numbered lists or bullet points
// - Paragraph breaks
// - Code blocks (only when needed)
// - Always format using **Markdown**.
// - Use number listing like 1,2,3 etc for steps or numbered items.
// - Use ` -
//         ` for bullet points.
// - Include paragraph spacing (double line breaks).
// - Format content for professional display on both mobile and desktop.

// This ensures the response is well-structured and easy to read on web or mobile interfaces.
// `.trim(),
//     },
//     {
//       role: "user",
//       content: userMessage,
//     },
//   ];

//   for (let attempt = 0; attempt < 5; attempt++) {
//     try {
//       const response = await openai.chat.completions.create({
//         model: "gpt-4",
//         messages,
//         max_tokens: 1000,
//         temperature: 0.7,
//       });

//       return response.choices[0].message.content.trim();
//     } catch (error) {
//       if (error.status === 429) {
//         console.warn("Rate limit exceeded. Retrying...");
//         await waitForRetry(attempt);
//       } else {
//         console.error("OpenAI Error:", error);
//         throw new Error("Failed to get response from OpenAI.");
//       }
//     }
//   }

//   throw new Error("Max retries exceeded for OpenAI call.");
// }

// module.exports = { getbuyAIResponse };
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function waitForRetry(attempt) {
  const delay = Math.min(1000 * 2 ** attempt, 60000);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function getbuyAIResponse(userMessage) {
  // ✅ Ensure userMessage is a valid string
  if (typeof userMessage !== "string" || userMessage.trim() === "") {
    throw new Error("Invalid userMessage. Expected a non-empty string.");
  }

  const messages = [
    {
      role: "system",
      content: `
You are Finomic AI’s Buy Now Pay Later (BNPL) Advisory Module. You explain BNPL options and guide users on suitable plans based on their financial profile. Introduce yourself as Finomic AI and request information on financial status, purchase plans, and repayment capacity before offering guidance.

Respond using clear, concise, and professional language typical of a certified financial advisor. Avoid local slang or conversational phrasing. Use globally understandable English with proper grammar and polished tone.

Provide actionable, data-supported financial advice. Include estimated costs, potential returns, or relevant statistics where applicable. Use examples or comparisons to real-world situations. Avoid generic lists without context.

End your response with a polite and professional disclaimer, placed after the main advice, such as: 'This response is for informational purposes only and should not replace consultation with a licensed financial advisor.' Avoid defensive or early disclaimers.

Structure your response with clear headings, bullet points, and paragraphs to improve readability. Use numbered lists or tables if it helps clarify complex information.

Adapt your tone and formatting based on user feedback during the conversation. If asked to clarify, reformat, or provide more detail, respond flexibly and politely.

Always format your responses using **Markdown**, including:
- Bold headings  
- Use \`-\` for bullet points
- Numbered lists or bullet points  
- Paragraph breaks  
- Include paragraph spacing (double line breaks)
- Format content for professional display on both mobile and desktop
- Put the explanation on the **next line**, never on the same line.
- Code blocks (only when needed)
- Never combine heading and paragraph in the same line

      `.trim(),
    },
    {
      role: "user",
      content: userMessage.trim(),
    },
  ];

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      if (error.status === 429) {
        console.warn("Rate limit exceeded. Retrying...");
        await waitForRetry(attempt);
      } else {
        console.error("OpenAI Error:", error);
        throw new Error("Failed to get response from OpenAI.");
      }
    }
  }

  throw new Error("Max retries exceeded for OpenAI call.");
}

module.exports = { getbuyAIResponse };
