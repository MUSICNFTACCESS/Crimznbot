const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getPrice(symbol) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
    const data = await res.json();
    return data[symbol]?.usd ? `$${data[symbol].usd}` : null;
  } catch {
    return null;
  }
}

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const lower = message.toLowerCase();

  if (lower.includes("price of btc") || lower.includes("price of bitcoin")) {
    const price = await getPrice("bitcoin");
    return res.json({
      reply: price
        ? `Bitcoin is currently trading at ${price}.`
        : "Sorry, I couldn’t fetch the live price of BTC right now.",
    });
  }

  if (lower.includes("price of eth") || lower.includes("price of ethereum")) {
    const price = await getPrice("ethereum");
    return res.json({
      reply: price
        ? `Ethereum is currently trading at ${price}.`
        : "Sorry, I couldn’t fetch the live price of ETH right now.",
    });
  }

  if (lower.includes("price of sol") || lower.includes("price of solana")) {
    const price = await getPrice("solana");
    return res.json({
      reply: price
        ? `Solana is currently trading at ${price}.`
        : "Sorry, I couldn’t fetch the live price of SOL right now.",
    });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are CrimznBot, a professional crypto strategist and consultant. Never say you're an AI or chatbot. Speak confidently like a seasoned human expert.`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ error: "Failed to get response from CrimznBot" });
  }
});

app.get("/", (req, res) => {
  res.send("CrimznBot backend is live.");
});

app.listen(port, () => {
  console.log(`CrimznBot backend running on port ${port}`);
});
