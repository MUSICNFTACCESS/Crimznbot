const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Optional ping route for uptime monitoring
app.get('/ping', (req, res) => {
  res.send('CrimznBot is alive');
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    });

    res.json({ response: completion.data.choices[0].message.content });
  } catch (error) {
    console.error('Error in /api/chat:');
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Start the server and bind to 0.0.0.0
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
