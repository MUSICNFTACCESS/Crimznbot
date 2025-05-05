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

// Root route
app.get('/', (req, res) => {
  res.send('CrimznBot with live crypto data is running.');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Live with GPT + CoinGecko API' });
});

// Main chat route
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message?.toLowerCase();
  if (!userMessage) {
    return res.status(400).json({ reply: 'Please enter a message.' });
  }

  // Check for price or marketcap questions
  const cleanedMessage = userMessage.replace(/\b(today|now|currently)\b/g, "").trim();
  const match = cleanedMessage.match(/(?:price|market.?cap) of ([a-z0-9\s]+)/i);
  if (match) {
    const coinName = match[1].trim().toLowerCase().replace(/\s+/g, '-');
    try {
      const cgResp = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinName}`);
      const price = cgResp.data.market_data.current_price.usd;
      const marketCap = cgResp.data.market_data.market_cap.usd;
      return res.json({
        reply: `Live data for **${cgResp.data.name}**:\n- Price: $${price.toLocaleString()}\n- Market Cap: $${marketCap.toLocaleString()}`
      });
    } catch (err) {
      return res.json({ reply: `I couldn't fetch data for "${coinName}". Try a different name or symbol.` });
    }
  }

  // GPT fallback for general questions
  try {
    const gptResp = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are CrimznBot, a crypto AI assistant.' },
        { role: 'user', content: req.body.message }
      ],
      max_tokens: 200,
    });

    const botReply = gptResp.choices[0].message.content.trim();
    res.json({ reply: botReply });
  } catch (error) {
    console.error('GPT error:', error.response?.data || error.message);
    res.status(500).json({ reply: 'CrimznBot failed to respond.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`CrimznBot live at http://0.0.0.0:${port}`);
});
