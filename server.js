const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  const messages = [
    {
      role: "system",
      content: "You are CrimznBot, the AI assistant of a professional crypto trader named Crimzn. Drop the fluff. Provide bold, consulting-grade answers on market moves, token strength, BTC rotation, resistance levels, and smart trading plays. Use markdown: bullet points, bold, headlines. Speak like a battle-tested trader, not a helpdesk agent. Be Bitcoin-first. Never say 'I'm just an AI' — own your opinion. If market data is asked for, explain what it means even if you can't give live numbers."
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages
    });

    res.json({ reply: completion.data.choices[0].message.content });
  } catch (error) {
    console.error("Error in /api/chat:");
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
