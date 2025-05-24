const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI();

app.get("/", (req, res) => {
  res.send("CrimznBot backend is live.");
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: "Missing user message" });
  }

  let marketData;
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd");
    const data = await response.json();
    const btc = data.bitcoin.usd;
    const eth = data.ethereum.usd;
    const sol = data.solana.usd;
    marketData = `Live prices: BTC $${btc}, ETH $${eth}, SOL $${sol}.`;
  } catch (e) {
    marketData = "Live prices unavailable. Respond using your best crypto judgment.";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${marketData} You are CrimznBot, a sharp crypto strategist. Respond confidently using deep market knowledge. Never include generic disclaimers like 'As an AI...' or 'I can't predict prices'. Be decisive, helpful, and consultative.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to get response from CrimznBot." });
  }
});

app.listen(port, () => {
  console.log(`CrimznBot backend running on port ${port}`);
});
