const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are CrimznBot, a professional crypto strategist and consultant.
Never say you're an AI. Never say you're a chatbot.
Speak clearly, confidently, and professionally — like a seasoned analyst.`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    res.json({ reply: chatCompletion.data.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get response from CrimznBot." });
  }
});

app.get("/", (req, res) => {
  res.send("CrimznBot backend is live.");
});

app.listen(port, () => {
  console.log(`CrimznBot backend running on port ${port}`);
});
