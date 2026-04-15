"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame, BarChart3, CheckCircle2, Circle, Trophy, Target, Clock, TrendingUp, Calendar } from "lucide-react";
import { API_URL, SCHEDULE_EVENT, AUTH_EVENT, isLoggedIn } from "@/lib/api";

type DailyTask = {
  subject: string;
  type: string;
  hours: number;
  completed: boolean;
};

type DayPlan = {
  date: string;
  tasks: DailyTask[];
};

export default function ProgressTracker() {
  const [days, setDays] = useState<DayPlan[]>([]);
  const [streak, setStreak] = useState(0);
  const [examDate, setExamDate] = useState("");
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [loading, setLoading] = useState(false);
  const [savingTask, setSavingTask] = useState<string | null>(null);

  // Load schedule from API
  const loadSchedule = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setDays([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data.schedule)) {
        setDays(data.schedule);
        setStreak(data.streak || 0);
        if (data.examDate) setExamDate(data.examDate);
        if (data.subjects) {
          setSubjectsList(data.subjects.split(",").map((s: string) => s.trim()).filter(Boolean));
        }
        // Extract unique subjects from schedule
        const subs = new Set<string>();
        data.schedule.forEach((d: DayPlan) => d.tasks.forEach((t) => subs.add(t.subject)));
        if (subs.size > 0) setSubjectsList(Array.from(subs));
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuth = (e: any) => {
      const user = e.detail;
      setLoggedIn(!!user);
      if (!user) {
        setDays([]);
        setStreak(0);
      }
    };
    window.addEventListener(AUTH_EVENT, handleAuth);
    return () => window.removeEventListener(AUTH_EVENT, handleAuth);
  }, []);

  // Listen for schedule updates from AI Scheduler
  useEffect(() => {
    const handleScheduleUpdate = (e: any) => {
      const schedule = e.detail;
      if (Array.isArray(schedule)) {
        setDays(schedule);
        setStreak(0);
        // Extract subjects
        const subs = new Set<string>();
        schedule.forEach((d: DayPlan) => d.tasks.forEach((t: DailyTask) => subs.add(t.subject)));
        setSubjectsList(Array.from(subs));
      }
    };
    window.addEventListener(SCHEDULE_EVENT, handleScheduleUpdate);
    return () => window.removeEventListener(SCHEDULE_EVENT, handleScheduleUpdate);
  }, []);

  // Load existing schedule on mount
  useEffect(() => {
    if (loggedIn) loadSchedule();
  }, [loggedIn, loadSchedule]);

  // Toggle task completion - saves to DB
  const toggleTask = async (dayIndex: number, taskIndex: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const taskKey = `${dayIndex}-${taskIndex}`;
    setSavingTask(taskKey);

    const currentCompleted = days[dayIndex]?.tasks[taskIndex]?.completed || false;
    const newCompleted = !currentCompleted;

    // Optimistic update
    const updated = [...days];
    updated[dayIndex] = {
      ...updated[dayIndex],
      tasks: updated[dayIndex].tasks.map((t, i) =>
        i === taskIndex ? { ...t, completed: newCompleted } : t
      ),
    };
    setDays(updated);

    try {
      const res = await fetch(`${API_URL}/api/ai/schedule/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dayIndex, taskIndex, completed: newCompleted }),
      });

      const data = await res.json();
      if (data.streak !== undefined) setStreak(data.streak);
    } catch {
      // Revert on error
      const reverted = [...days];
      reverted[dayIndex].tasks[taskIndex].completed = currentCompleted;
      setDays(reverted);
    } finally {
      setSavingTask(null);
    }
  };

  // Calculations
  const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = days.reduce(
    (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
    0
  );
  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Subject-wise progress
  const subjectProgress = subjectsList.map((sub) => {
    const total = days.reduce(
      (acc, d) => acc + d.tasks.filter((t) => t.subject === sub).length,
      0
    );
    const done = days.reduce(
      (acc, d) => acc + d.tasks.filter((t) => t.subject === sub && t.completed).length,
      0
    );
    return {
      subject: sub,
      total,
      done,
      progress: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  });

  // Days until exam
  const daysUntilExam = examDate
    ? Math.max(Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 0)
    : null;

  // Today's tasks
  const todayStr = new Date().toISOString().split("T")[0];
  const todayPlanIndex = days.findIndex((d) => d.date === todayStr);
  const todayPlan = todayPlanIndex >= 0 ? days[todayPlanIndex] : null;

  // Get progress bar color
  const getProgressColor = (pct: number) => {
    if (pct >= 80) return "from-green-400 to-emerald-500";
    if (pct >= 50) return "from-cyan-400 to-blue-500";
    if (pct >= 25) return "from-amber-400 to-orange-500";
    return "from-red-400 to-pink-500";
  };

  const hasData = days.length > 0;

  return (
    <section id="progress" className="bg-[#0b0f19] text-gray-200 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-cyan-400 text-sm mb-6">
            <BarChart3 size={14} />
            Real-time Progress Tracking
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Study Progress <span className="text-cyan-400">Dashboard</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Track your daily study tasks, maintain streaks, and monitor subject-wise progress.
          </p>
        </div>

        {!loggedIn && (
          <div className="text-center py-16 bg-[#020617] border border-cyan-500/20 rounded-2xl">
            <Target className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg">Please login to view your study progress</p>
          </div>
        )}

        {loggedIn && loading && (
          <div className="text-center py-16">
            <div className="h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your progress...</p>
          </div>
        )}

        {loggedIn && !loading && !hasData && (
          <div className="text-center py-16 bg-[#020617] border border-cyan-500/20 rounded-2xl">
            <Calendar className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg mb-2">No schedule generated yet</p>
            <p className="text-gray-500 text-sm">
              Use the <span className="text-cyan-400">AI Smart Scheduler</span> above to generate your personalized study plan
            </p>
          </div>
        )}

        {loggedIn && !loading && hasData && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Streak */}
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="text-orange-400" size={20} />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Streak</span>
                </div>
                <p className="text-3xl font-bold text-orange-400">{streak}</p>
                <p className="text-xs text-gray-500 mt-1">consecutive days</p>
              </div>

              {/* Overall Progress */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-cyan-400" size={20} />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Progress</span>
                </div>
                <p className="text-3xl font-bold text-cyan-400">{overallProgress}%</p>
                <p className="text-xs text-gray-500 mt-1">{completedTasks}/{totalTasks} tasks</p>
              </div>

              {/* Days Left */}
              {daysUntilExam !== null && (
                <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-violet-400" size={20} />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Exam In</span>
                  </div>
                  <p className="text-3xl font-bold text-violet-400">{daysUntilExam}</p>
                  <p className="text-xs text-gray-500 mt-1">days remaining</p>
                </div>
              )}

              {/* Total Days */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="text-green-400" size={20} />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Plan</span>
                </div>
                <p className="text-3xl font-bold text-green-400">{days.length}</p>
                <p className="text-xs text-gray-500 mt-1">days scheduled</p>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-200">Overall Progress</h3>
                <span className="text-sm font-mono text-cyan-400">{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor(overallProgress)} rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-xs mt-2 text-gray-500">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>

            {/* Today's Tasks */}
            {todayPlan && (
              <div className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border-2 border-cyan-500/30 p-6 rounded-xl mb-8 shadow-lg shadow-cyan-500/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                    🎯 Today's Study Plan
                  </h3>
                  <span className="text-xs bg-cyan-400/20 text-cyan-400 px-3 py-1 rounded-full">
                    {todayPlan.tasks.filter((t) => t.completed).length}/{todayPlan.tasks.length} done
                  </span>
                </div>
                <div className="space-y-2">
                  {todayPlan.tasks.map((task, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        task.completed
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-[#111827] border border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTask(todayPlanIndex, i)}
                          disabled={savingTask === `${todayPlanIndex}-${i}`}
                          className="transition-all hover:scale-110"
                        >
                          {savingTask === `${todayPlanIndex}-${i}` ? (
                            <div className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                          ) : task.completed ? (
                            <CheckCircle2 className="text-green-400" size={20} />
                          ) : (
                            <Circle className="text-gray-600 hover:text-cyan-400" size={20} />
                          )}
                        </button>
                        <div>
                          <span className={`font-medium text-sm ${task.completed ? "text-gray-500 line-through" : "text-gray-200"}`}>
                            {task.subject}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">{task.type}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">{task.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject-wise Progress */}
            <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-8">
              <h3 className="text-lg font-bold mb-5 text-gray-200 flex items-center gap-2">
                <BarChart3 size={18} className="text-cyan-400" /> Subject Progress
              </h3>
              {subjectProgress.length === 0 ? (
                <p className="text-gray-500 text-center text-sm">No subjects tracked yet</p>
              ) : (
                <div className="space-y-4">
                  {subjectProgress.map((s) => (
                    <div key={s.subject}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-300 font-medium">{s.subject}</span>
                        <span className="text-gray-500 font-mono">
                          {s.done}/{s.total} · {s.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getProgressColor(s.progress)} rounded-full transition-all duration-500`}
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Days */}
            <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-5 text-gray-200 flex items-center gap-2">
                <Calendar size={18} className="text-cyan-400" /> Full Schedule
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {days.map((day, dayIndex) => {
                  const dayCompleted = day.tasks.filter((t) => t.completed).length;
                  const dayTotal = day.tasks.length;
                  const dayPct = dayTotal === 0 ? 0 : Math.round((dayCompleted / dayTotal) * 100);
                  const isDayToday = day.date === todayStr;
                  const isPast = day.date < todayStr;

                  return (
                    <div
                      key={day.date}
                      className={`p-4 rounded-xl transition-all ${
                        isDayToday
                          ? "bg-cyan-500/10 border-2 border-cyan-500/30"
                          : dayPct === 100
                          ? "bg-green-500/5 border border-green-500/20"
                          : "bg-[#111827] border border-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500">Day {dayIndex + 1}</span>
                          <span className={`text-sm font-semibold ${isDayToday ? "text-cyan-400" : "text-gray-300"}`}>
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {isDayToday && (
                            <span className="text-[10px] bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded-full">
                              TODAY
                            </span>
                          )}
                          {dayPct === 100 && (
                            <span className="text-[10px] bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full">
                              ✓ DONE
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{dayCompleted}/{dayTotal}</span>
                      </div>

                      <div className="space-y-1.5">
                        {day.tasks.map((task, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleTask(dayIndex, i)}
                                disabled={savingTask === `${dayIndex}-${i}` || (!isDayToday && !isPast)}
                                className={`transition-all ${!isDayToday && !isPast ? "opacity-30 cursor-not-allowed" : "hover:scale-110 cursor-pointer"}`}
                              >
                                {savingTask === `${dayIndex}-${i}` ? (
                                  <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                                ) : task.completed ? (
                                  <CheckCircle2 className="text-green-400" size={16} />
                                ) : (
                                  <Circle className="text-gray-600 group-hover:text-cyan-400" size={16} />
                                )}
                              </button>
                              <span
                                className={`text-sm ${
                                  task.completed
                                    ? "text-gray-500 line-through"
                                    : "text-gray-300"
                                }`}
                              >
                                {task.subject}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600">{task.hours}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}