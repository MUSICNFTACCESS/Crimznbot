const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

// Root check
app.get('/', (req, res) => {
  res.send('CrimznBot backend is running.');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ reply: 'Please provide a message' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are CrimznBot, an AI assistant for crypto consulting.' },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150,
    });

    const botReply = response.choices[0].message.content.trim();
    res.json({ reply: botReply });
  } catch (error) {
    console.error('OpenAI Error:', error.response?.data || error.message);
    res.status(500).json({ reply: 'CrimznBot failed to respond. Check API key or logs.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
