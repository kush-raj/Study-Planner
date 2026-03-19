"use client";

import { useEffect, useState } from "react";
import { Flame, CheckCircle, BarChart3 } from "lucide-react";

type DailyTask = {
  subject: string;
  hours: number;
  completed: boolean;
};

type DayPlan = {
  date: string;
  tasks: DailyTask[];
};

export default function AIProgressDashboard() {
  const [days, setDays] = useState<DayPlan[]>([]);
  const [streak, setStreak] = useState(0);

  /* ---------- LOAD DATA ON MOUNT ---------- */
  useEffect(() => {
    const stored = localStorage.getItem("smartSchedulerData");
    const savedTasks = localStorage.getItem("dailyTasks");

    if (savedTasks) {
      // If user already has task data
      const parsedTasks: DayPlan[] = JSON.parse(savedTasks);
      setDays(parsedTasks);
      calculateStreak(parsedTasks);
      return;
    }

    if (!stored) return; // No scheduler data yet

    const data = JSON.parse(stored);
    const today = new Date();
    const exam = new Date(data.examDate);
    const subjects = data.subjects.split(",").map((s: string) => s.trim());
    const dailyTime = Number(data.dailyTime);

    const plan: DayPlan[] = [];
    let current = new Date(today);

    while (current <= exam) {
      plan.push({
        date: current.toISOString().split("T")[0],
        tasks: subjects.map((sub: string) => ({
          subject: sub,
          hours: dailyTime,
          completed: false,
        })),
      });
      current.setDate(current.getDate() + 1);
    }

    setDays(plan);
    localStorage.setItem("dailyTasks", JSON.stringify(plan));
    calculateStreak(plan);
  }, []);

  /* ---------- TOGGLE TASK ---------- */
  const toggleTask = (dayIndex: number, taskIndex: number) => {
    const updated = [...days];
    updated[dayIndex].tasks[taskIndex].completed = !updated[dayIndex].tasks[taskIndex].completed;
    setDays(updated);
    localStorage.setItem("dailyTasks", JSON.stringify(updated));
    calculateStreak(updated);
  };

  /* ---------- CALCULATE CURRENT STREAK ---------- */
  const calculateStreak = (plan: DayPlan[]) => {
    let count = 0;
    for (let i = plan.length - 1; i >= 0; i--) {
      if (plan[i].tasks.every((t) => t.completed)) count++;
      else break;
    }
    setStreak(count);
  };

  /* ---------- SUBJECT-WISE PROGRESS ---------- */
  const subjectProgress = () => {
    if (!days.length) return [];
    const subjects = days[0].tasks.map((t) => t.subject);
    return subjects.map((sub) => {
      const completedCount = days.reduce((acc, d) => acc + (d.tasks.find((t) => t.subject === sub)?.completed ? 1 : 0), 0);
      return { subject: sub, progress: Math.round((completedCount / days.length) * 100) };
    });
  };

  if (!days.length) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-300 flex items-center justify-center">
        No schedule found. Please generate a schedule first.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-6 text-center">
          Study Progress <span className="text-cyan-400">Dashboard</span>
        </h2>

        {/* 🔥 Current Streak */}
        <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-cyan-400">🔥 Current Streak</h3>
            <p className="text-gray-400 text-sm">Consecutive days completed</p>
          </div>
          <div className="flex items-center gap-2 text-3xl font-bold">
            <Flame className="text-orange-500" /> {streak}
          </div>
        </div>

        {/* 📅 Daily Tasks */}
        <Section title="Daily Study Tasks">
          <div className="space-y-4">
            {days.map((day, dayIndex) => (
              <div key={day.date} className="bg-[#111827] p-4 rounded-xl border border-cyan-500/20">
                <div className="text-sm font-semibold mb-2">{day.date}</div>
                {day.tasks.map((task, i) => (
                  <div key={i} className="flex items-center justify-between mb-1">
                    <span>{task.subject} — {task.hours}h</span>
                    <button
                      onClick={() => toggleTask(dayIndex, i)}
                      className={`px-3 py-1 rounded-lg border transition ${task.completed ? "bg-cyan-500/30 border-cyan-500" : "bg-[#020617] border-cyan-500/20"}`}
                    >
                      {task.completed ? "✅ Done" : "Mark Done"}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        {/* 📊 Subject-wise Progress */}
        <Section title="Subject-wise Progress">
          <div className="space-y-4">
            {subjectProgress().map((s: any) => (
              <div key={s.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.subject}</span>
                  <span>{s.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 h-3 rounded-full">
                  <div className="h-full bg-cyan-500" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ---------- SECTION COMPONENT ---------- */
function Section({ title, children }: any) {
  return (
    <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
      <h3 className="text-xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
        <BarChart3 size={18} /> {title}
      </h3>
      {children}
    </div>
  );
}
