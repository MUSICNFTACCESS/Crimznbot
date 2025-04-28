const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('CrimznBot Server is Running!');
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required!' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const botMessage = response.choices[0].message.content;
    res.json({ reply: botMessage });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error.message);
    console.error(error.response?.data || error);
    res.status(500).json({ error: 'Failed to get response from OpenAI.' });
  }
});

app.listen(PORT, () => {
  console.log(`CrimznBot Server is running on port ${PORT}`);
});
