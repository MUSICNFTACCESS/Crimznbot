const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.send("CrimznBot backend is live.");
});

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: "No message provided" });
  }

  let marketData = "Live crypto prices unavailable.";
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd");
    const data = await response.json();
    const btc = data.bitcoin.usd.toLocaleString();
    const eth = data.ethereum.usd.toLocaleString();
    const sol = data.solana.usd.toLocaleString();
    marketData = `Bitcoin: $${btc} | Ethereum: $${eth} | Solana: $${sol}`;
  } catch (e) {
    marketData = "Live price fetch failed. Proceed with knowledge.";
  }

  const messages = [
    {
      role: "system",
      content: `${marketData}\nYou are CrimznBot – a top-tier crypto strategist and consultant trained on market cycles, tokenomics, DeFi, and blockchain narratives. Avoid phrases like "as an AI" and answer with direct, confident insight.`,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    res.json({ reply: chat.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to get response from CrimznBot" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
