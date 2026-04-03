// ---------------- DEPENDENCIES ----------------
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());
  
//-----------------------------------------------MODELS--------------------------------------------

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


// ---------------- YOUTUBE FAVORITE MODEL ----------
const FavoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    video: Object,
  },
  { timestamps: true }
);

const Favorite = mongoose.model("Favorite", FavoriteSchema);


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
  const weakList = weakTopics ? weakTopics.split(",").map(w => w.trim()) : [];

  const today = new Date();
  const exam = new Date(examDate);
  const daysLeft = Math.max(Math.ceil((exam - today) / (1000 * 60 * 60 * 24)), 1);

  const dailyHours = Math.min(Number(dailyTime), 8);
  const learningHours = Math.round(dailyHours * 0.5);
  const practiceHours = Math.round(dailyHours * 0.3);
  const revisionHours = Math.round(dailyHours * 0.2);

  const dayPlans = [];

  for (let day = 1; day <= daysLeft; day++) {
    const subject1 = subjectList[(day - 1) % subjectList.length];
    const subject2 = subjectList[(day) % subjectList.length] || subject1;
    const weakTopic = weakList.length > 0 ? weakList[(day - 1) % weakList.length] : "general";

    const date = new Date(today);
    date.setDate(today.getDate() + day - 1);
    const dateStr = date.toISOString().split("T")[0];

    dayPlans.push({
      date: dateStr,
      tasks: [
        { subject: subject1, hours: learningHours, completed: false },
        { subject: subject2, hours: practiceHours, completed: false },
        { subject: "Revision", hours: revisionHours, completed: false },
      ],
    });
  }

  return dayPlans; // return structured JSON
}

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
  localStorage.setItem("token", data.token);
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



// ---------------- SMART SCHEDULER API -----
app.post("/api/ai/schedule", authMiddleware, async (req, res) => {
  try {
    const { examDate, dailyTime, subjects, weakTopics } = req.body;
    if (!examDate || !dailyTime || !subjects)
      return res.status(400).json({ error: "Missing required fields" });

    const schedule = await generateStudySchedule(examDate, dailyTime, subjects, weakTopics);

    // Save as string if needed
    await Schedule.create({
      userId: req.user.id,
      examDate,
      dailyTime,
      subjects,
      weakTopics,
      schedule: JSON.stringify(schedule),
    });

    res.json({ schedule }); // send structured JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Schedule generation failed" });
  }
});


// ---------------- GET USER SCHEDULE ----------------
app.get("/api/ai/schedule", authMiddleware, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ userId: req.user.id }).sort({ createdAt: -1 });

    if (!schedule) {
      return res.status(404).json({ error: "No schedule found" });
    }

    res.json(schedule);
  } catch (err) {
    console.error("❌ FETCH SCHEDULE ERROR:", err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});


//-----------------MOCK START-------------

app.post("/api/mock/start", async (req, res) => {
  try {
    console.log("🔥 START API HIT");

    const { subject } = req.body;

    // ✅ sirf ek call (already 10 questions aa rahe)
    const mcqs = await generateAIQuestions(subject || "general");

    res.json({
      questions: mcqs.map(q => ({
        ...q,
        type: "mcq"
      }))
    });

  } catch (err) {
    console.error("❌ START ERROR:", err);

    res.json({
      questions: [
        {
          question: "Fallback Question",
          options: ["A", "B", "C", "D"],
          answerIndex: 0,
          type: "mcq",
        },
      ],
    });
  }
});

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



// ---------------- MOCK QUESTION BANK ----------
async function generateAIQuestions(subject, level = "beginner") {
  try {
    const prompt = `
Generate 10 multiple choice questions for ${subject}.

Return ONLY JSON in this format:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answerIndex": 0
  }
]
`;

    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You generate MCQ questions." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1200,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let text = response.data.choices[0].message.content;
    console.log("🤖 RAW AI:", text);

    // 🔥 JSON SAFE EXTRACTION
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start !== -1 && end !== -1) {
      const jsonString = text.slice(start, end + 1);
      return JSON.parse(jsonString);
    }

    throw new Error("Invalid JSON from AI");

  } catch (err) {
    console.error("❌ AI ERROR:", err.message);

    // fallback (minimum safe)
    return [
      {
        question: "Fallback: What is JavaScript?",
        options: ["Language", "Database", "OS", "Browser"],
        answerIndex: 0,
      }
    ];
  }
}

// ---------------- SERVER --------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
