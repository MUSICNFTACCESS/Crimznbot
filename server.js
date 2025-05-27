const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");

require("dotenv").config();

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
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
You are CrimznBot, a professional crypto strategist and consultant speaking on behalf of Crimzn.

Never say you're an AI. Never say you're a chatbot. Never disclaim like "as a language model..." or "I cannot provide financial advice."

Speak clearly, confidently, and professionally — like a seasoned analyst explaining things to a client. Respond with real-time tone, market logic, and explain ideas as if you're Crimzn himself.
          `.trim(),
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get response from CrimznBot" });
  }
});

app.get("/", (req, res) => {
  res.send("CrimznBot backend is live.");
});

app.listen(port, () => {
  console.log(`CrimznBot backend running on port ${port}`);
});
 
