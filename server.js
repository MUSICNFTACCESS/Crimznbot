const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are CrimznBot, a professional crypto strategist. Never say you're an AI or chatbot. Speak like a confident human expert.`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ error: "Failed to get response from CrimznBot" });
  }
});

app.get("/", (req, res) => {
  res.send("CrimznBot backend is live.");
});

app.listen(port, () => {
  console.log(`CrimznBot backend running on port ${port}`);
});
 
 
// force redeploy
// force deploy again
