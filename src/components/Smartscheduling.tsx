"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, BookOpen, Sparkles, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { API_URL, broadcastScheduleUpdate, isLoggedIn, AUTH_EVENT } from "@/lib/api";

type ScheduleTask = {
  subject: string;
  type: string;
  hours: number;
  completed: boolean;
};

type DayPlan = {
  date: string;
  tasks: ScheduleTask[];
};

export default function AISmartScheduler() {
  const [examDate, setExamDate] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [subjects, setSubjects] = useState("");
  const [weakTopics, setWeakTopics] = useState("");
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<DayPlan[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  // Listen for auth changes
  useEffect(() => {
    const handleAuth = () => setLoggedIn(isLoggedIn());
    window.addEventListener(AUTH_EVENT, handleAuth);
    return () => window.removeEventListener(AUTH_EVENT, handleAuth);
  }, []);

  // Load saved schedule on mount if logged in
  useEffect(() => {
    if (loggedIn) {
      loadExistingSchedule();
    } else {
      setSchedule([]);
    }
  }, [loggedIn]);

  const loadExistingSchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/ai/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;
      const data = await res.json();

      if (Array.isArray(data.schedule)) {
        setSchedule(data.schedule);
        broadcastScheduleUpdate(data.schedule);

        // Populate form fields from saved data
        if (data.examDate) setExamDate(data.examDate);
        if (data.subjects) setSubjects(data.subjects);
      }
    } catch {
      // Silently fail - schedule may not exist yet
    }
  };

  const generateSchedule = async () => {
    setError("");
    setSuccess("");

    if (!examDate || !dailyTime || !subjects) {
      setError("Please fill all required fields");
      return;
    }

    if (!loggedIn) {
      setError("Please login first to generate a schedule");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first");
      return;
    }

    setLoading(true);
    setSchedule([]);

    try {
      const res = await fetch(`${API_URL}/api/ai/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examDate, dailyTime, subjects, weakTopics }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate schedule");
        return;
      }

      if (!Array.isArray(data.schedule)) {
        setError("Invalid schedule returned from server");
        return;
      }

      setSchedule(data.schedule);
      setSuccess(`✅ Schedule generated! ${data.schedule.length} days planned.`);

      // Broadcast to ProgressTracker
      broadcastScheduleUpdate(data.schedule);

      // Save form data to localStorage
      localStorage.setItem(
        "smartSchedulerData",
        JSON.stringify({ examDate, dailyTime, subjects, weakTopics })
      );
    } catch (err: any) {
      setError(err.message || "Failed to generate schedule. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Format date nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Check if a date is today
  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  // Get task type color
  const getTaskColor = (type: string) => {
    switch (type) {
      case "Learning": return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
      case "Practice": return "text-violet-400 bg-violet-400/10 border-violet-400/20";
      case "Revision": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <section id="scheduler" className="bg-[#0b0f19] text-gray-200 py-24 px-6">
      <div className="text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-cyan-400 text-sm mb-6">
          <Sparkles size={14} />
          AI-Powered Study Planning
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-cyan-400">AI Smart</span> Study Scheduler
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto mb-10">
          Generate personalized daily study plans based on your exam date, available time, and weak areas.
        </p>

        {/* Form */}
        <div className="bg-[#111827]/80 backdrop-blur border border-cyan-500/20 rounded-2xl p-8 space-y-6 shadow-2xl shadow-cyan-500/5">
          <div className="grid md:grid-cols-2 gap-6">
            <InputBlock
              icon={<Calendar size={16} />}
              label="Exam Date"
              type="date"
              value={examDate}
              onChange={setExamDate}
            />
            <InputBlock
              icon={<Clock size={16} />}
              label="Daily Study Time (hours)"
              type="number"
              placeholder="e.g., 4"
              value={dailyTime}
              onChange={setDailyTime}
            />
          </div>

          <InputBlock
            icon={<BookOpen size={16} />}
            label="Subjects (comma separated)"
            placeholder="Maths, Physics, Chemistry"
            value={subjects}
            onChange={setSubjects}
          />

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <TrendingUp size={16} /> Weak Topics (optional)
            </label>
            <textarea
              rows={2}
              className="w-full p-3 rounded-xl bg-[#020617] border border-cyan-500/20 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-gray-200 placeholder-gray-600 transition-all"
              placeholder="Calculus, Optics, Organic Chemistry"
              value={weakTopics}
              onChange={(e) => setWeakTopics(e.target.value)}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 p-3 rounded-xl text-sm">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          <button
            onClick={generateSchedule}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                AI Generating Schedule...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate AI Study Schedule
              </>
            )}
          </button>

          {!loggedIn && (
            <p className="text-gray-500 text-sm text-center">
              💡 Please login first to generate and save your study schedule
            </p>
          )}
        </div>

        {/* Generated Schedule Display */}
        {schedule.length > 0 && (
          <div className="mt-12 bg-[#020617]/80 backdrop-blur border border-cyan-500/20 p-8 rounded-2xl text-left shadow-2xl shadow-cyan-500/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                📅 AI Generated Study Plan
              </h3>
              <span className="text-sm text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                {schedule.length} days
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {schedule.map((day, i) => (
                <div
                  key={day.date}
                  className={`p-4 rounded-xl transition-all ${
                    isToday(day.date)
                      ? "bg-cyan-500/10 border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                      : "bg-[#111827] border border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md font-mono">
                        Day {i + 1}
                      </span>
                      <span className={`text-sm font-semibold ${isToday(day.date) ? "text-cyan-400" : "text-gray-300"}`}>
                        {formatDate(day.date)}
                      </span>
                    </div>
                    {isToday(day.date) && (
                      <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded-full font-semibold animate-pulse">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-2">
                    {day.tasks.map((task, j) => (
                      <div
                        key={j}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium ${getTaskColor(task.type)}`}
                      >
                        <span className="block font-semibold">{task.subject}</span>
                        <span className="opacity-70">{task.hours}h · {task.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- INPUT BLOCK ---------- */
function InputBlock({
  icon,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: any) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        {icon} {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl bg-[#020617] border border-cyan-500/20 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-gray-200 placeholder-gray-600 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}