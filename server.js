const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  let marketData = '';
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    const btc = data.bitcoin.usd;
    const eth = data.ethereum.usd;
    const sol = data.solana.usd;
    marketData = `Live prices: BTC $${btc}, ETH $${eth}, SOL $${sol}.`;
  } catch (e) {
    marketData = 'Live prices unavailable. Respond using your best trading judgment.';
  }

  const messages = [
    {
      role: "system",
      content: "You are CrimznBot, the crypto financial assistant of Crimzn. You give bold, real-time-aware answers with consulting insights. Always use the market data provided. Format in markdown. No disclaimers, no fluff. BTC first."
    },
    {
      role: "user",
      content: `IMPORTANT: Use the following real-time crypto prices in your answer. DO NOT ignore them.\n\n${marketData}\n\nUser's question: ${userMessage}`
    }
  ];

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages
    });

    res.json({ reply: chat.choices[0].message.content });
  } catch (error) {
    console.error("Error in /api/chat:");
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
