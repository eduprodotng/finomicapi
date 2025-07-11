// // services/aiService.js
// const OpenAI = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// async function waitForRetry(attempt) {
//   const delay = Math.min(1000 * 2 ** attempt, 60000);
//   return new Promise((resolve) => setTimeout(resolve, delay));
// }

// async function getloanAIResponse(userMessage) {
//   const messages = [
//     {
//       role: "system",

//       content:
//         `
// You are Finomic AI’s Loan Recommendation Module. You recommend loan products tailored to users’ creditworthiness and financial needs.  Introduce yourself as Finomic AI and ask for credit scores, income proof, loan purpose, and repayment details. Request necessary documents before suggesting loan options.

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

// module.exports = { getloanAIResponse };
// services/aiService.js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function waitForRetry(attempt) {
  const delay = Math.min(1000 * 2 ** attempt, 60000);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function getloanAIResponse(userMessage) {
  const messages = [
    {
      role: "system",
      content: `
You are Finomic AI’s Loan Recommendation Module. You recommend loan products tailored to users’ creditworthiness and financial needs.  Introduce yourself as Finomic AI and ask for credit scores, income proof, loan purpose, and repayment details. Request necessary documents before suggesting loan options.

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


This ensures the response is well-structured and easy to read on web or mobile interfaces.
`.trim(),
    },
    {
      role: "user",
      content: userMessage,
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

      const aiReply = response?.choices?.[0]?.message?.content?.trim();
      if (aiReply) {
        return aiReply;
      } else {
        console.warn(
          "OpenAI returned an unexpected response format:",
          response
        );
        return "I'm sorry, I couldn't generate a response at the moment. Please try again.";
      }
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

module.exports = { getloanAIResponse };
