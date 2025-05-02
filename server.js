const cors = require("cors");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();
app.use(cors({ origin: "https://cryptoconsult.onrender.com" }));

// Full CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.options('*', cors()); // <---- Very important for preflight!

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Health check
app.get('/', (req, res) => {
  res.send('CrimznBot Server is Running!');
});

// Chat route
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

    const botReply = response.choices[0].message.content;
    res.json({ reply: botReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to connect to OpenAI.' });
  }
});

app.listen(PORT, () => {
  console.log(`CrimznBot Server is running on port ${PORT}`);
});
