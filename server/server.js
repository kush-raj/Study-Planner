const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ---------------- DB -----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));
  

// ---------------- USER MODEL ----------
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

// ---------------- CHAT MODEL ----------
const ChatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
    reply: String,
    topic: String,
    level: String,
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);





// new addd

// ---------------- SCHEDULE MODEL ----------
const ScheduleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    examDate: String,
    dailyTime: String,
    subjects: String,
    weakTopics: String,
    schedule: String,
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", ScheduleSchema);


//  bss yhh  tkk


//naya edit 31/01/26

// ---------------- MOCK RESULT MODEL ----------
const MockResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    results: Array,
    readiness: Number,
  },
  { timestamps: true }
);

const MockResult = mongoose.model("MockResult", MockResultSchema);


//till here 

// youtube ka start hai

// ---------------- YOUTUBE FAVORITE MODEL ----------
const FavoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    video: Object,
  },
  { timestamps: true }
);

const Favorite = mongoose.model("Favorite", FavoriteSchema);

// playlist ka hai

// ---------------- PLAYLIST MODEL ----------------
const PlaylistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    videos: [
      {
        videoId: String,
        title: String,
      },
    ],
  },
  { timestamps: true }
);

const Playlist = mongoose.model("Playlist", PlaylistSchema);


// playlist yha tk

// youtube ka yha tk hai 




// ---------------- GROQ CONFIG --------
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

async function askGroq(message, topic, level) {
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: `You are an AI tutor. Explain simply for a ${level} student. Topic: ${topic}.`,
          },
          { role: "user", content: message },
        ],
        temperature: 0.4,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000, // ⏱️ 15 sec max
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ GROQ ERROR:", error.message);
    return "Sorry, AI is busy right now. Please try again.";
  }
}

 

// new added 

async function generateStudySchedule(
  examDate,
  dailyTime,
  subjects,
  weakTopics
) {
  const subjectList = subjects.split(",").map(s => s.trim());
  const weakList = weakTopics
    ? weakTopics.split(",").map(w => w.trim())
    : [];

  const today = new Date();
  const exam = new Date(examDate);
  const daysLeft = Math.max(
    Math.ceil((exam - today) / (1000 * 60 * 60 * 24)),
    1
  );

  const dailyHours = Math.min(Number(dailyTime), 8); // industry safe cap
  const learningHours = (dailyHours * 0.5).toFixed(1);
  const practiceHours = (dailyHours * 0.3).toFixed(1);
  const revisionHours = (dailyHours * 0.2).toFixed(1);

  let plan = `📆 Exam Date: ${examDate}\n`;
  plan += `⏳ Days Remaining: ${daysLeft}\n`;
  plan += `⏰ Daily Study Time: ${dailyHours} hours\n`;
  plan += `📘 Subjects: ${subjectList.join(", ")}\n\n`;

  for (let day = 1; day <= daysLeft; day++) {
    const subject1 = subjectList[(day - 1) % subjectList.length];
    const subject2 =
      subjectList[(day) % subjectList.length] || subject1;

    const weakTopic =
      weakList.length > 0
        ? weakList[(day - 1) % weakList.length]
        : "general concepts";

    plan += `Day ${day}:\n`;
    plan += `• ${subject1} → ${learningHours}h learning\n`;
    plan += `• ${subject2} → ${practiceHours}h problem solving\n`;
    plan += `• Weak focus → ${weakTopic}\n`;
    plan += `• Revision → ${revisionHours}h (previous topics)\n`;

    if (day % 7 === 0) {
      plan += `• Weekly Review → Full-length revision + mock test\n`;
    }

    plan += `\n`;
  }

  plan += `🧠 Tips:\n`;
  plan += `• Use focused 50–60 min sessions\n`;
  plan += `• Take 5–10 min breaks\n`;
  plan += `• Review mistakes daily\n`;
  plan += `• Adjust intensity weekly\n`;

  return plan;
}



// yhii tkkk

// new edit 31/01/2026

// ---------------- MOCK QUESTION BANK ----------
async function generateAIQuestions(subject, level = "beginner") {
  // 27 feb

// ---------------- GENERATE CODING QUESTIONS ----------------
// ✅ OUTSIDE FUNCTION (GLOBAL)

// ---------------- GENERATE CODING QUESTIONS ----------------
async function generateCodingQuestions(subject) {
  const prompt = `
Generate 5 coding questions for ${subject}.
Each question must include:
- problem statement
- difficulty
Return STRICT JSON:
[
  { "question": "" }
]
`;

  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are a programming exam generator." },
        { role: "user", content: prompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
}

// ---------------- CASE STUDY ----------------
async function generateCaseStudyQuestions(subject) {
  const prompt = `
Generate 5 case study questions for ${subject}.
Return JSON:
[
  { "question": "" }
]
`;

  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an exam creator." },
        { role: "user", content: prompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
}
// ---------------- GENERATE CASE STUDY QUESTIONS ----------------
async function generateCaseStudyQuestions(subject) {
  const prompt = `
Generate 5 case-study based analytical questions for ${subject}.
Each question must be scenario-based.
Return STRICT JSON:

[
  {
    "question": ""
  }
]
`;

  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are a professional exam creator." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 800,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
}

  // yha tk 27 Feb
  const prompt = `
Generate 5 multiple choice questions for ${subject}.
Difficulty: ${level}.
Format STRICT JSON only.

[
  {
    "question": "",
    "options": ["", "", "", ""],
    "answerIndex": 0
  }
]
`;

  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an exam question generator." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 700,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
}



// till here

// ---------------- AUTH MIDDLEWARE ----
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ---------------- SIGNUP --------------
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ error: "Account already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    message: "Account created successfully",
    user: { id: user._id, email: user.email, username: user.username },
  });
});

// ---------------- LOGIN ---------------
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // ❌ LOGIN BLOCKED IF ACCOUNT NOT CREATED
  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ error: "Account does not exist" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(400).json({ error: "Incorrect password" });

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { id: user._id, email: user.email, username: user.username },
  });
});

// ---------------- CHAT API ------------
app.post("/api/chat", authMiddleware, async (req, res) => {
  try {
    const { message, topic, level } = req.body;
    if (!message)
      return res.status(400).json({ error: "Message required" });

    const reply = await askGroq(
      message,
      topic || "general",
      level || "beginner"
    );

    const chat = await Chat.create({
      userId: req.user.id,
      message,
      reply,
      topic,
      level,
    });

    res.json(chat);
  } catch (err) {
    console.error("❌ CHAT ERROR:", err);
    res.status(500).json({ error: "Chat failed" });
  }
});

// newww 


// ---------------- SMART SCHEDULER API -----
app.post("/api/ai/schedule", authMiddleware, async (req, res) => {
  try {
    const { examDate, dailyTime, subjects, weakTopics } = req.body;

    if (!examDate || !dailyTime || !subjects) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const schedule = await generateStudySchedule(
      examDate,
      dailyTime,
      subjects,
      weakTopics
    );

    // ✅ Save to DB (optional)
    const savedSchedule = await Schedule.create({
      userId: req.user.id,
      examDate,
      dailyTime,
      subjects,
      weakTopics,
      schedule,
    });

    res.json({
      schedule,
      id: savedSchedule._id,
    });
  } catch (err) {
    console.error("❌ SCHEDULER ERROR:", err);
    res.status(500).json({ error: "Schedule generation failed" });
  }
});
 

// yha tk

//new eddit 31/01/2026

// ---------------- START MOCK TEST ----------------
// app.post("/api/mock/start", async (req, res) => {
//   try {
//     const { subject, weakTopic, lastScore } = req.body;

//     console.log("📩 Incoming:", req.body);

//     const mcqs = await generateAIQuestions(subject || "general");

//     const formatted = mcqs.map((q) => ({
//       ...q,
//       type: "mcq",
//     }));

//     res.json({
//       questions: formatted,
//     });

//   } catch (err) {
//     console.error("❌ START ERROR:", err.message);

//     res.json({
//       questions: [
//         {
//           question: "Fallback Question: What is JavaScript?",
//           options: ["Language", "Database", "OS", "Browser"],
//           answerIndex: 0,
//           type: "mcq",
//           explanation: "JavaScript is a programming language.",
//         },
//       ],
//     });
//   }
// });




app.post("/api/mock/start", async (req, res) => {
  try {
    const { subject } = req.body;

    const mcqs1 = await generateAIQuestions(subject || "general");
    const mcqs2 = await generateAIQuestions(subject || "general");

    const mcqs = [...mcqs1, ...mcqs2];

    const formatted = mcqs.map((q) => ({
      ...q,
      type: "mcq",
    }));

    res.json({
      questions: formatted,
    });

  } catch (err) {
    console.error("❌ START ERROR:", err.message);
  }
});

// till here 
//27 feb
// ---------------- NEXT SECTION (CODING / CASE) ----------------
app.post("/api/mock/next", async (req, res) => {
  try {
    const { subject, type } = req.body;

    console.log("🔥 NEXT API HIT:", subject, type);

    let questions = [];

    if (type === "coding") {
      questions = await generateCodingQuestions(subject);
      questions = questions.map(q => ({ ...q, type: "coding" }));
    } else {
      questions = await generateCaseStudyQuestions(subject);
      questions = questions.map(q => ({ ...q, type: "case" }));
    }

    console.log("✅ GENERATED:", questions);

    res.json({ questions });
  } catch (err) {
    console.error("❌ NEXT ERROR FULL:", err);
    res.json({
      questions: [
        { question: "Fallback Coding Question", type: "coding" }
      ],
    });
  }
});
// till 27 feb

// 27 feb

async function generateAIFeedback(subject, weakTopic, score, lastScore) {
  const prompt = `
Student gave mock test for ${subject}.
Weak Topic: ${weakTopic}
Previous Score: ${lastScore}%
Current Score: ${score}

Generate:
1. Motivational feedback
2. Focus recommendation
3. Improvement strategy

Keep it professional and encouraging.
`;

  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an AI performance analyst." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
}

//yha tk 27 feb
//new edit 31/01/2026

// ---------------- SUBMIT MOCK TEST ----------------
app.post("/api/mock/submit", authMiddleware, async (req, res) => {
  try {
    const { subject, weakTopic, lastScore, score } = req.body;

    const readiness = score;

    const feedback = await generateAIFeedback(
      subject,
      weakTopic,
      score,
      lastScore
    );

    await MockResult.create({
      userId: req.user.id,
      results: [],
      readiness,
    });

    res.json({
      readiness,
      feedback,
    });
  } catch (err) {
    console.error("❌ SUBMIT ERROR:", err.message);
    res.status(500).json({ error: "Submit failed" });
  }
});
// youtube start

// ---------------- YOUTUBE AI SUGGESTIONS -------------
app.post("/api/youtube/suggestions", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query required" });

    const ytRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 10,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    const videos = ytRes.data.items.map((item) => {
      const title = item.snippet.title;

      const rating = (Math.random() * 2 + 3).toFixed(1);
      const level =
        title.toLowerCase().includes("advanced") ? "Advanced" : "Beginner";

      return {
        id: item.id.videoId,
        title,
        channel: item.snippet.channelTitle,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        views: "Trending",
        rating: Number(rating),
        level,
        reason: "Recommended based on topic relevance & engagement",
      };
    });

    res.json({ videos });
  } catch (err) {
    console.error("❌ YOUTUBE ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

//yha bhe hai youtube

// ---------------- GET FAVORITES ----------------
app.get("/api/favorites", authMiddleware, async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: req.user.id });
    res.json(favs.map((f) => f.video));
  } catch (err) {
    res.status(500).json({ error: "Failed to load favorites" });
  }
});

// ---------------- TOGGLE FAVORITE --------------
app.post("/api/favorites/toggle", authMiddleware, async (req, res) => {
  try {
    const { video } = req.body;

    const existing = await Favorite.findOne({
      userId: req.user.id,
      "video.id": video.id,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ removed: true });
    }

    await Favorite.create({
      userId: req.user.id,
      video,
    });

    res.json({ added: true });
  } catch (err) {
    res.status(500).json({ error: "Favorite toggle failed" });
  }
});


// yha tk youtube
// youtube end


//till here
// app.use("/api/mock", require("./routes/mockTest.routes"));
// ---------------- CREATE PLAYLIST ----------------
app.post("/api/playlists/create", authMiddleware, async (req, res) => {
  try {
    const { name, videos } = req.body;

    if (!name || !videos || videos.length === 0)
      return res.status(400).json({ error: "Invalid data" });

    const formattedVideos = videos.map((v) => ({
      videoId: v.id,
      title: v.title,
    }));

    const playlist = await Playlist.create({
      userId: req.user.id,
      name,
      videos: formattedVideos,
    });

    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: "Playlist creation failed" });
  }
});

// ---------------- GET MY PLAYLISTS ----------------
app.get("/api/playlists/my", authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: "Failed to load playlists" });
  }
});

// ---------------- GET SINGLE PLAYLIST ----------------
app.get("/api/playlists/:id", authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!playlist)
      return res.status(404).json({ error: "Playlist not found" });

    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to load playlist" });
  }
});

// ---------------- ADD VIDEO TO PLAYLIST ----------------
app.post("/api/playlists/:id/add-video", authMiddleware, async (req, res) => {
  try {
    const { video } = req.body;

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!playlist)
      return res.status(404).json({ error: "Playlist not found" });

    const exists = playlist.videos.some(
      (v) => v.videoId === video.id
    );

    if (exists)
      return res.json({ message: "Already exists" });

    playlist.videos.push({
      videoId: video.id,
      title: video.title,
    });

    await playlist.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Add video failed" });
  }
});

// ---------------- REMOVE VIDEO ----------------
app.delete(
  "/api/playlists/:id/remove-video/:videoId",
  authMiddleware,
  async (req, res) => {
    try {
      const playlist = await Playlist.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!playlist)
        return res.status(404).json({ error: "Playlist not found" });

      playlist.videos = playlist.videos.filter(
        (v) => v.videoId !== req.params.videoId
      );

      await playlist.save();

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Remove failed" });
    }
  }
);


// ---------------- SERVER --------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
