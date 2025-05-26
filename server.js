const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI();

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
    marketData = `BTC: $${btc}, ETH: $${eth}, SOL: $${sol}`;
  } catch (e) {
    console.error("Price fetch failed:", e);
  }

  const systemPrompt = `
${marketData}
You are CrimznBot — a top-tier crypto strategist. You NEVER say things like "as an AI" or "I don't have real-time data." You DO have live prices and real market context. 
Speak directly and confidently. You are a financial advisor in tone, but not legally — always helpful, decisive, and sharp like Crimzn himself.
`;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    res.json({ reply: chat.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`CrimznBot backend is live on port ${port}`);
});
