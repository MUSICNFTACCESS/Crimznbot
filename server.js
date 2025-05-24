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

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  let marketData = '';
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    const btc = data.bitcoin.usd;
    const eth = data.ethereum.usd;
    const sol = data.solana.usd;
    marketData = `Live prices as of now: BTC: $${btc}, ETH: $${eth}, SOL: $${sol}`;
  } catch (e) {
    marketData = 'Live prices are currently unavailable. Use your best estimation based on market conditions.';
  }

  const messages = [
    {
      role: "system",
      content: "You are CrimznBot, a crypto financial strategist and assistant for CryptoConsult. You must always be concise, smart, and helpful. When provided, always reference real-time data."
    },
    {
      role: "user",
      content: `IMPORTANT: Use this price data in your response if relevant: ${marketData}`
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages
    });

    res.json({ reply: chat.choices[0].message.content });
  } catch (error) {
    console.error("Error in /chat:");
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
