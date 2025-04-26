// Load environment variables
require('dotenv').config();

// Import required libraries
const express = require('express');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Check if API key is missing
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is missing in environment variables!');
  process.exit(1); // Exit the app
}

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
      model: 'gpt-3.5-turbo', // or 'gpt-4' if available
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

// Start the server
app.listen(port, () => {
  console.log(`CrimznBot Server is running on port ${port}`);
});
