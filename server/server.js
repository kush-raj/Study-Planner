// ---------------- DEPENDENCIES ----------------
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

// ---------------- MONGODB CONNECTION ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// -----------------------------------------------MODELS--------------------------------------------

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
    schedule: String, // JSON stringified array of day plans
  },
  { timestamps: true }
);
const Schedule = mongoose.model("Schedule", ScheduleSchema);

// ---------------- PROGRESS MODEL ----------
const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
    completedTasks: [
      {
        dayIndex: Number,
        taskIndex: Number,
        completedAt: { type: Date, default: Date.now },
      },
    ],
    streak: { type: Number, default: 0 },
    lastStudyDate: String,
  },
  { timestamps: true }
);
const Progress = mongoose.model("Progress", ProgressSchema);

// ---------------- MOCK RESULT MODEL ----------
const MockResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subject: String,
    score: Number,
    totalQuestions: Number,
    results: Array,
    readiness: Number,
    feedback: String,
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
        timeout: 15000,
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ GROQ ERROR:", error.message);
    return "Sorry, AI is busy right now. Please try again.";
  }
}

// ---------------- STUDY SCHEDULE GENERATOR ----------------
function generateStudySchedule(examDate, dailyTime, subjects, weakTopics) {
  const subjectList = subjects.split(",").map((s) => s.trim()).filter(Boolean);
  if (subjectList.length === 0) throw new Error("Provide at least one valid subject");

  const weakList = weakTopics ? weakTopics.split(",").map((w) => w.trim()).filter(Boolean) : [];

  const today = new Date();
  const exam = new Date(examDate);
  const daysLeft = Math.max(Math.ceil((exam - today) / (1000 * 60 * 60 * 24)), 1);

  const dailyHours = Math.min(Number(dailyTime), 12);
  if (isNaN(dailyHours) || dailyHours <= 0) throw new Error("Daily hours must be greater than 0");

  const learningHours = Math.max(Math.round(dailyHours * 0.5), 1);
  const practiceHours = Math.max(Math.round(dailyHours * 0.3), 1);
  const revisionHours = Math.max(dailyHours - learningHours - practiceHours, 1);

  const dayPlans = [];
  for (let day = 1; day <= daysLeft; day++) {
    const subject1 = subjectList[(day - 1) % subjectList.length];
    const subject2 = subjectList[day % subjectList.length] || subject1;
    const weakTopic = weakList.length > 0 ? weakList[(day - 1) % weakList.length] : "general";

    const date = new Date(today);
    date.setDate(today.getDate() + day - 1);
    const dateStr = date.toISOString().split("T")[0];

    dayPlans.push({
      date: dateStr,
      tasks: [
        { subject: subject1, type: "Learning", hours: learningHours, completed: false },
        { subject: subject2, type: "Practice", hours: practiceHours, completed: false },
        { subject: weakTopic === "general" ? "Revision" : `${weakTopic} (Weak)`, type: "Revision", hours: revisionHours, completed: false },
      ],
    });
  }

  return dayPlans;
}

// ---------------- AUTH MIDDLEWARE ----
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized - Please login" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Session expired - Please login again" });
  }
};

// ============================================================
//                      AUTH ROUTES
// ============================================================

// ---------------- SIGNUP --------------
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Account already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    // Auto-login after signup: return token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("❌ SIGNUP ERROR:", err.message);
    res.status(500).json({ error: "Signup failed. Try again." });
  }
});

// ---------------- LOGIN ---------------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Account does not exist" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    res.status(500).json({ error: "Login failed. Try again." });
  }
});

// ---------------- VERIFY TOKEN ---------------
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: { id: user._id, email: user.email, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: "Failed to verify user" });
  }
});

// ============================================================
//                      CHAT ROUTES
// ============================================================

app.post("/api/chat", authMiddleware, async (req, res) => {
  try {
    const { message, topic, level } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const reply = await askGroq(message, topic || "general", level || "beginner");

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

// ============================================================
//                    SMART SCHEDULER ROUTES
// ============================================================

// ---------------- GENERATE SCHEDULE ----------------
app.post("/api/ai/schedule", authMiddleware, async (req, res) => {
  try {
    const { examDate, dailyTime, subjects, weakTopics } = req.body;
    if (!examDate || !dailyTime || !subjects)
      return res.status(400).json({ error: "Please fill all required fields" });

    const schedule = generateStudySchedule(examDate, dailyTime, subjects, weakTopics);
    if (!Array.isArray(schedule) || schedule.length === 0)
      throw new Error("Schedule generation returned empty");

    // Delete old schedules for this user, keep only latest
    await Schedule.deleteMany({ userId: req.user.id });

    const saved = await Schedule.create({
      userId: req.user.id,
      examDate,
      dailyTime,
      subjects,
      weakTopics,
      schedule: JSON.stringify(schedule),
    });

    // Also create/reset progress tracking
    await Progress.deleteMany({ userId: req.user.id });
    await Progress.create({
      userId: req.user.id,
      scheduleId: saved._id,
      completedTasks: [],
      streak: 0,
      lastStudyDate: "",
    });

    console.log("✅ Schedule saved:", saved._id, "Days:", schedule.length);
    res.status(200).json({ schedule, scheduleId: saved._id });
  } catch (err) {
    console.error("❌ SCHEDULER ERROR:", err.message);
    res.status(500).json({ error: err.message || "Schedule generation failed" });
  }
});

// ---------------- GET USER SCHEDULE ----------------
app.get("/api/ai/schedule", authMiddleware, async (req, res) => {
  try {
    const scheduleDoc = await Schedule.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!scheduleDoc) return res.status(404).json({ error: "No schedule found" });

    // Parse the JSON string back to array
    let schedule;
    try {
      schedule = JSON.parse(scheduleDoc.schedule);
    } catch {
      return res.status(500).json({ error: "Invalid schedule data" });
    }

    // Get progress data
    const progress = await Progress.findOne({ userId: req.user.id, scheduleId: scheduleDoc._id });

    // Apply completed status from progress
    if (progress && progress.completedTasks.length > 0) {
      progress.completedTasks.forEach(({ dayIndex, taskIndex }) => {
        if (schedule[dayIndex] && schedule[dayIndex].tasks[taskIndex]) {
          schedule[dayIndex].tasks[taskIndex].completed = true;
        }
      });
    }

    res.json({
      schedule,
      scheduleId: scheduleDoc._id,
      examDate: scheduleDoc.examDate,
      subjects: scheduleDoc.subjects,
      streak: progress?.streak || 0,
      lastStudyDate: progress?.lastStudyDate || "",
    });
  } catch (err) {
    console.error("❌ FETCH SCHEDULE ERROR:", err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

// ---------------- TOGGLE TASK COMPLETION ----------------
app.put("/api/ai/schedule/toggle", authMiddleware, async (req, res) => {
  try {
    const { dayIndex, taskIndex, completed } = req.body;

    const scheduleDoc = await Schedule.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!scheduleDoc) return res.status(404).json({ error: "No schedule found" });

    let progress = await Progress.findOne({ userId: req.user.id, scheduleId: scheduleDoc._id });
    if (!progress) {
      progress = await Progress.create({
        userId: req.user.id,
        scheduleId: scheduleDoc._id,
        completedTasks: [],
        streak: 0,
        lastStudyDate: "",
      });
    }

    if (completed) {
      // Add if not already there
      const exists = progress.completedTasks.some(
        (t) => t.dayIndex === dayIndex && t.taskIndex === taskIndex
      );
      if (!exists) {
        progress.completedTasks.push({ dayIndex, taskIndex, completedAt: new Date() });
      }
    } else {
      // Remove
      progress.completedTasks = progress.completedTasks.filter(
        (t) => !(t.dayIndex === dayIndex && t.taskIndex === taskIndex)
      );
    }

    // Calculate streak
    const schedule = JSON.parse(scheduleDoc.schedule);
    const today = new Date().toISOString().split("T")[0];
    let streak = 0;

    for (let i = schedule.length - 1; i >= 0; i--) {
      const dayDate = schedule[i].date;
      if (dayDate > today) continue; // skip future days

      const totalTasksInDay = schedule[i].tasks.length;
      const completedInDay = progress.completedTasks.filter((t) => t.dayIndex === i).length;

      if (completedInDay >= totalTasksInDay) {
        streak++;
      } else {
        break;
      }
    }

    progress.streak = streak;
    progress.lastStudyDate = today;
    await progress.save();

    res.json({
      success: true,
      streak: progress.streak,
      completedCount: progress.completedTasks.length,
    });
  } catch (err) {
    console.error("❌ TOGGLE ERROR:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// ---------------- GET PROGRESS STATS ----------------
app.get("/api/progress/stats", authMiddleware, async (req, res) => {
  try {
    const scheduleDoc = await Schedule.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!scheduleDoc) return res.json({ hasSchedule: false });

    const schedule = JSON.parse(scheduleDoc.schedule);
    const progress = await Progress.findOne({ userId: req.user.id, scheduleId: scheduleDoc._id });

    const totalTasks = schedule.reduce((acc, d) => acc + d.tasks.length, 0);
    const completedTasks = progress ? progress.completedTasks.length : 0;

    // Mock test stats
    const mockResults = await MockResult.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(5);

    res.json({
      hasSchedule: true,
      totalDays: schedule.length,
      totalTasks,
      completedTasks,
      overallProgress: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
      streak: progress?.streak || 0,
      examDate: scheduleDoc.examDate,
      subjects: scheduleDoc.subjects,
      mockResults: mockResults.map((r) => ({
        subject: r.subject,
        score: r.score,
        total: r.totalQuestions,
        date: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("❌ STATS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ============================================================
//                      MOCK TEST ROUTES
// ============================================================

app.post("/api/mock/start", async (req, res) => {
  try {
    const { subject } = req.body;
    const mcqs = await generateAIQuestions(subject || "general");
    res.json({
      questions: mcqs.map((q) => ({ ...q, type: "mcq" })),
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

app.post("/api/mock/submit", authMiddleware, async (req, res) => {
  try {
    const { subject, weakTopic, lastScore, score, totalQuestions } = req.body;
    const readiness = score;

    const feedback = await generateAIFeedback(subject, weakTopic, score, lastScore);

    await MockResult.create({
      userId: req.user.id,
      subject,
      score,
      totalQuestions: totalQuestions || 10,
      results: [],
      readiness,
      feedback,
    });

    res.json({ readiness, feedback });
  } catch (err) {
    console.error("❌ SUBMIT ERROR:", err.message);
    res.status(500).json({ error: "Submit failed" });
  }
});

// ============================================================
//                    YOUTUBE ROUTES
// ============================================================

app.post("/api/youtube/suggestions", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query required" });

    const ytRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        maxResults: 10,
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    const videos = ytRes.data.items.map((item) => {
      const title = item.snippet.title;
      const rating = (Math.random() * 2 + 3).toFixed(1);
      const level = title.toLowerCase().includes("advanced") ? "Advanced" : "Beginner";

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

// ============================================================
//                    FAVORITES & PLAYLISTS
// ============================================================

app.get("/api/favorites", authMiddleware, async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: req.user.id });
    res.json(favs.map((f) => f.video));
  } catch (err) {
    res.status(500).json({ error: "Failed to load favorites" });
  }
});

app.post("/api/favorites/toggle", authMiddleware, async (req, res) => {
  try {
    const { video } = req.body;
    const existing = await Favorite.findOne({ userId: req.user.id, "video.id": video.id });
    if (existing) {
      await existing.deleteOne();
      return res.json({ removed: true });
    }
    await Favorite.create({ userId: req.user.id, video });
    res.json({ added: true });
  } catch (err) {
    res.status(500).json({ error: "Favorite toggle failed" });
  }
});

app.post("/api/playlists/create", authMiddleware, async (req, res) => {
  try {
    const { name, videos } = req.body;
    if (!name || !videos || videos.length === 0) return res.status(400).json({ error: "Invalid data" });

    const formattedVideos = videos.map((v) => ({ videoId: v.id, title: v.title }));
    const playlist = await Playlist.create({ userId: req.user.id, name, videos: formattedVideos });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: "Playlist creation failed" });
  }
});

app.get("/api/playlists/my", authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: "Failed to load playlists" });
  }
});

app.get("/api/playlists/:id", authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user.id });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to load playlist" });
  }
});

app.post("/api/playlists/:id/add-video", authMiddleware, async (req, res) => {
  try {
    const { video } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user.id });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const exists = playlist.videos.some((v) => v.videoId === video.id);
    if (exists) return res.json({ message: "Already exists" });

    playlist.videos.push({ videoId: video.id, title: video.title });
    await playlist.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Add video failed" });
  }
});

app.delete("/api/playlists/:id/remove-video/:videoId", authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user.id });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    playlist.videos = playlist.videos.filter((v) => v.videoId !== req.params.videoId);
    await playlist.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Remove failed" });
  }
});

// ============================================================
//                   AI QUESTION GENERATOR
// ============================================================

async function generateAIQuestions(subject) {
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
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start !== -1 && end !== -1) {
      const jsonString = text.slice(start, end + 1);
      return JSON.parse(jsonString);
    }

    throw new Error("Invalid JSON from AI");
  } catch (err) {
    console.error("❌ AI ERROR:", err.message);
    return [
      {
        question: "Fallback: What is JavaScript?",
        options: ["Language", "Database", "OS", "Browser"],
        answerIndex: 0,
      },
    ];
  }
}

// ============================================================
//                      SERVER START
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
