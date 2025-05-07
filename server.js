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
      content: "You are CrimznBot, a crypto financial assistant created by Crimzn. You speak with clarity, confidence, and authority. You provide insights on market trends, trading strategies, wallet security, and consulting topics. When users ask about tokens, respond as if you're a real-time consultant. Use markdown formatting, bullet points, or headers if needed. Be direct, BTC-forward, and self-custody focused. Avoid hype. Stay sharp."
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
