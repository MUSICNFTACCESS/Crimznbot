const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  const messages = [
    {
      role: "system",
      content: "You are CrimznBot, the crypto financial assistant built by Crimzn. Respond with confidence, give clear insights, and format replies in markdown when needed. Be bold, no disclaimers, just direct analysis and breakdowns. Bitcoin first, no fluff."
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages
    });

    res.json({ reply: chat.choices[0].message.content });
  } catch (error) {
    console.error("Error in /api/chat:");
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
