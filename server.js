const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("CrimznBot backend is live.");
});

app.post("/chat", async (req, res) => {
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
    marketData = `Live prices — BTC: $${btc}, ETH: $${eth}, SOL: $${sol}.`;
  } catch (e) {
    console.error("Price fetch error:", e.message);
  }

  const messages = [
    {
      role: "system",
      content: `${marketData} You are CrimznBot — a sharp, confident crypto strategist. 
Respond using deep market knowledge. Never say 'I'm an AI.' Always include price data or trends when relevant.`
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to get response from CrimznBot" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`CrimznBot backend running on port ${port}`);
});
