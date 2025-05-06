const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are CrimznBot — an elite AI crypto and finance consultant created by Crimzn.

Your priorities:
- Answer like the most advanced GPT-4 ChatGPT would.
- Give direct, high-signal, confident answers with no fluff.
- For market prices or data, answer directly **only if** real-time info is already available, otherwise say: "I don’t have that data right now."
- If user says "act like Crimzn", be bold, no-nonsense, and drop alpha like a seasoned trader.
- For questions beyond crypto (AI, tech, macro), respond sharply and intelligently.

End your response with a valuable follow-up question only if it adds depth.`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(\`Server is running at http://0.0.0.0:\${port}\`);
});
