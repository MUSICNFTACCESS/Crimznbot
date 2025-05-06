require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message.toLowerCase();

    const match = message.match(/price.*?(bitcoin|btc|ethereum|eth|solana|sol|xrp|doge|pepe|link|avax|dot|ada|shib|ton|apt|near|atom)/);
    if (match) {
      const symbol = match[1].toLowerCase();
      const map = {
        btc: "bitcoin", eth: "ethereum", sol: "solana", xrp: "ripple",
        doge: "dogecoin", pepe: "pepe", link: "chainlink", avax: "avalanche-2",
        dot: "polkadot", ada: "cardano", shib: "shiba-inu", ton: "the-open-network",
        apt: "aptos", near: "near", atom: "cosmos"
      };
      const id = map[symbol] || symbol;
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
      const price = response.data[id]?.usd;
      if (price) return res.json({ reply: `The current price of ${id.replace(/-/g, ' ')} is $${price}` });
    }

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: req.body.message }]
    });

    const botReply = chatResponse.choices[0].message.content.trim();
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Error in /api/chat:", error.response?.data || error.message);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
