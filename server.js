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

async function fetchCryptoPrices() {
  try {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd"
    );
    return {
      BTC: `$${res.data.bitcoin.usd.toLocaleString()}`,
      ETH: `$${res.data.ethereum.usd.toLocaleString()}`,
      SOL: `$${res.data.solana.usd.toLocaleString()}`
    };
  } catch (err) {
    return {
      BTC: "unavailable",
      ETH: "unavailable",
      SOL: "unavailable"
    };
  }
}

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  const prices = await fetchCryptoPrices();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are CrimznBot — an elite crypto and finance AI assistant.

Live prices:
- BTC: ${prices.BTC}
- ETH: ${prices.ETH}
- SOL: ${prices.SOL}

Respond like ChatGPT-4 with advanced insights. Prioritize clarity, accuracy, and usefulness. Keep answers concise, but confident. You may quote live prices above if asked. If data isn't available, explain that clearly.`
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
// trigger redeploy
