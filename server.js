require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// OpenAI setup
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

// Root route to fix "Cannot GET /"
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Chat endpoint with OpenAI
app.post('/api/chat', async (req, res) => {
  try {
    const message = req.body.message?.trim();
    if (!message) {
      return res.json({ reply: 'Please send a message' });
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are CrimznBot, a crypto consulting assistant for CryptoConsult by Crimzn. Provide accurate, concise answers about cryptocurrencies, wallet setup and security, technical and fundamental analysis, crypto tax guidance, onboarding, risk management, and related topics. If unsure or if the question requires personalized advice, suggest booking a consultation via Coinbase or PayPal links. Keep responses professional and under 150 words.' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: 150
    });

    const reply = response.data.choices[0].message.content.trim();
    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.json({ reply: 'Error reaching OpenAI. Please try again later.' });
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
