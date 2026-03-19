const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- DB ---------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"));

/* ---------- MODEL ---------- */
const MockSchema = new mongoose.Schema({
  userId: String,
  subject: String,
  score: Number,
  total: Number,
  readiness: Number,
  createdAt: { type: Date, default: Date.now }
});

const MockTest = mongoose.model("MockTest", MockSchema);

/* ---------- AI QUESTION GEN ---------- */
async function generateQuestions(subject) {
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an exam question generator."
        },
        {
          role: "user",
          content: `Generate 15 MCQ questions for ${subject}. 
          Format JSON:
          [{question, options[4], answerIndex}]`
        }
      ],
      temperature: 0.3
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return JSON.parse(res.data.choices[0].message.content);
}

/* ---------- API ---------- */
app.post("/api/mock/start", async (req, res) => {
  const { subjects } = req.body;

  const all = {};
  for (const s of subjects) {
    all[s] = await generateQuestions(s);
  }

  res.json(all);
});

app.post("/api/mock/submit", async (req, res) => {
  const { userId, results } = req.body;

  let totalScore = 0;
  let totalQuestions = 0;

  for (const r of results) {
    totalScore += r.score;
    totalQuestions += r.total;

    await MockTest.create({
      userId,
      subject: r.subject,
      score: r.score,
      total: r.total,
      readiness: Math.round((r.score / r.total) * 100)
    });
  }

  const readiness = Math.round((totalScore / totalQuestions) * 100);

  res.json({ readiness });
});

app.listen(5001, () =>
  console.log("🚀 Mock Test Server running on 5001")
);
