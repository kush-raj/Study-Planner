"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, BookOpen, Sparkles } from "lucide-react";

export default function AISmartScheduler() {
  const [examDate, setExamDate] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [subjects, setSubjects] = useState("");
  const [weakTopics, setWeakTopics] = useState("");
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState("");

  // Save Smart Scheduler Data to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "smartSchedulerData",
        JSON.stringify({ examDate, dailyTime, subjects, weakTopics, schedule })
      );
    }
  }, [examDate, dailyTime, subjects, weakTopics, schedule]);

  const generateSchedule = async () => {
    if (!examDate || !dailyTime || !subjects) {
      alert("Please fill all required fields");
      return;
    }

    const token = localStorage.getItem("token"); // JWT token from login
    if (!token) {
      alert("Please login first");
      return;
    }

    setLoading(true);
    setSchedule("");

    try {
      const res = await fetch("https://study-planner-4-geb9.onrender.com/api/ai/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examDate, dailyTime, subjects, weakTopics }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate schedule");

      setSchedule(data.schedule);
      window.dispatchEvent(
        new CustomEvent("scheduleUpdated", { detail: data.schedule })     //  new change
      );                                                                  // new chnage
    } catch (err: any) {
      alert(err.message || "AI failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-24 px-6">
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-cyan-400">AI Smart</span> Study Scheduler
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto mb-8">
          Generate daily study plans based on your exam and available time.
        </p>

        <div className="bg-[#111827] border border-cyan-500/20 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="grid md:grid-cols-2 gap-6">
            <InputBlock icon={<Calendar size={16} />} label="Exam Date" type="date" value={examDate} onChange={setExamDate} />
            <InputBlock icon={<Clock size={16} />} label="Daily Study Time (hours)" type="number" placeholder="Eg: 4" value={dailyTime} onChange={setDailyTime} />
          </div>

          <InputBlock icon={<BookOpen size={16} />} label="Subjects" placeholder="Maths, Physics, Chemistry" value={subjects} onChange={setSubjects} />

          <div>
            <label className="text-sm text-gray-400">Weak Topics (optional)</label>
            <textarea
              rows={3}
              className="w-full mt-2 p-3 rounded-lg bg-[#020617] border border-cyan-500/20 focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="Calculus, Optics, Organic Chemistry"
              value={weakTopics}
              onChange={(e) => setWeakTopics(e.target.value)}
            />
          </div>

          <button
            onClick={generateSchedule}
            disabled={loading}
            className="w-full bg-cyan-500 text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-cyan-400 transition disabled:opacity-50"
          >
            <Sparkles size={18} />
            {loading ? "AI Generating..." : "Generate AI Schedule"}
          </button>
        </div>

        {/* {schedule && (
          <div className="mt-10 bg-[#020617] border border-cyan-500/20 p-6 rounded-2xl text-left">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">📅 AI Generated Study Plan</h2>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{schedule}</pre>
          </div>
        )} */}

{schedule && (
  <div className="mt-10 bg-[#020617] border border-cyan-500/20 p-6 rounded-2xl text-left">
    <h2 className="text-2xl font-bold mb-4 text-cyan-400">📅 AI Generated Study Plan</h2>
    <div className="space-y-4">
      {JSON.parse(schedule).map((day: any) => (
        <div key={day.date}>
          <strong>{day.date}</strong>
          <ul className="list-disc ml-6">
            {day.tasks.map((task: any, i: number) => (
              <li key={i}>{task.subject} - {task.hours} hrs</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
}

/* ---------- INPUT BLOCK ---------- */
function InputBlock({ icon, label, type = "text", placeholder, value, onChange }: any) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-gray-400">{icon} {label}</label>
      <input type={type} placeholder={placeholder} className="w-full mt-2 p-3 rounded-lg bg-[#020617] border border-cyan-500/20 focus:ring-2 focus:ring-cyan-400 outline-none" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
