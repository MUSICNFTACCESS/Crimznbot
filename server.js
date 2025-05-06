const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const OpenAI = require("openai");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to get live crypto prices
async function getCryptoPrice(coin) {
  const idMap = {
    btc: "bitcoin",
    eth: "ethereum",
    sol: "solana"
  };

  const coinId = idMap[coin.toLowerCase()] || coin.toLowerCase();
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;

  try {
    const response = await axios.get(url);
    const price = response.data[coinId]?.usd;
    if (price) {
      return `The current price of ${coin.toUpperCase()} is $${price.toLocaleString()}.`;
    }
  } catch (err) {
    console.error("CoinGecko API error:", err.message);
  }
  return null;
}

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  // Check for known crypto price queries
  const coinMatch = userMessage.toLowerCase().match(/\b(btc|bitcoin|eth|ethereum|sol|solana)\b/);
  if (coinMatch) {
    const coin = coinMatch[1];
    const price = await getCryptoPrice(coin);
    if (price) return res.json({ reply: price });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are CrimznBot — an AI crypto and finance consultant created by Crimzn.

Your top priorities:
- Help users with crypto investing, technical/fundamental analysis, wallet setup, and risk management.
- Use a confident but clear tone: give direct, actionable answers — no fluff.
- If asked about live market data (e.g. BTC price), answer only if a real-time source is available, otherwise say you don’t have that data right now.
- If the user says “act like Crimzn,” be bold, no-nonsense, and deliver your insights like a pro trader.
- If unsure of something, say “I don’t have that data right now,” rather than guessing.
- For all other questions (history, AI, tech, philosophy, etc.), answer concisely and accurately.

Your goal is to be the ultimate crypto sidekick, offering elite insights and clarity on demand.

Always end responses with a follow-up question *only if it adds value*.`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
