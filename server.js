const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

const symbolToId = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  link: 'chainlink',
  pepe: 'pepe',
  xrp: 'ripple',
  dot: 'polkadot',
  ada: 'cardano'
};

// Clean + normalize user input
function extractCoinQuery(message) {
  const cleaned = message.toLowerCase().replace(/\b(today|now|currently|the)\b/g, '').trim();
  const keywordMatch = /(price|market.?cap)/.test(cleaned);
  if (!keywordMatch) return null;

  const parts = cleaned.split(/\s+/);
  const possibleCoin = parts.find(word => symbolToId[word] || /^[a-z]+$/.test(word));
  return symbolToId[possibleCoin] || possibleCoin;
}

// Root route
app.get('/', (req, res) => {
  res.send('CrimznBot: GPT + CoinGecko Live');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Live' });
});

// Chat route
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const coinId = extractCoinQuery(userMessage);

  if (coinId) {
    try {
      const cgResp = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);
      const price = cgResp.data.market_data.current_price.usd;
      const marketCap = cgResp.data.market_data.market_cap.usd;
      return res.json({
        reply: `Live data for **${cgResp.data.name}**:\n- Price: $${price.toLocaleString()}\n- Market Cap: $${marketCap.toLocaleString()}`
      });
    } catch {
      return res.json({ reply: `Couldn't get live data for "${coinId}". Try a different coin.` });
    }
  }

  // Fallback to GPT
  try {
    const gptResp = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are CrimznBot, a helpful crypto advisor.' },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 200,
    });

    const botReply = gptResp.choices[0].message.content.trim();
    res.json({ reply: botReply });
  } catch (error) {
    console.error('GPT Error:', error.response?.data || error.message);
    res.status(500).json({ reply: 'CrimznBot failed to respond.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`CrimznBot running at http://0.0.0.0:${port}`);
});
