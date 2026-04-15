"use client";

import { useState, useEffect } from "react";
import { Brain, Trophy, Timer, Target, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { API_URL, isLoggedIn, AUTH_EVENT } from "@/lib/api";

type Question = {
  question: string;
  options?: string[];
  answerIndex?: number;
  type: "mcq";
  explanation?: string;
};

export default function AIMockTest() {
  const [subject, setSubject] = useState("");
  const [weakTopic, setWeakTopic] = useState("");
  const [lastScore, setLastScore] = useState("");
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  // Listen for auth changes
  useEffect(() => {
    const handleAuth = () => setLoggedIn(isLoggedIn());
    window.addEventListener(AUTH_EVENT, handleAuth);
    return () => window.removeEventListener(AUTH_EVENT, handleAuth);
  }, []);

  // TIMER
  useEffect(() => {
    if (step === 1 && !submitted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, submitted]);

  // START TEST
  const startTest = async () => {
    if (!subject.trim()) {
      alert("Please enter a subject");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/mock/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });

      const data = await res.json();

      if (!data.questions || data.questions.length === 0) {
        alert("No questions received. Please try again.");
        return;
      }

      setQuestions(data.questions);
      setTimeLeft(600);
      setAnswers({});
      setStep(1);
    } catch {
      alert("Failed to start test. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (submitted) return;

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answerIndex) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/mock/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          weakTopic,
          lastScore,
          score: correct,
          totalQuestions: questions.length,
        }),
      });

      const data = await res.json();
      setFeedback(data.feedback || "");
    } catch {
      setFeedback("Could not get AI feedback. Your score has been saved.");
    }
  };

  // Reset test
  const resetTest = () => {
    setStep(0);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setFeedback("");
    setTimeLeft(600);
  };

  // Timer color
  const timerColor = timeLeft <= 60 ? "text-red-400" : timeLeft <= 180 ? "text-amber-400" : "text-cyan-400";

  return (
    <section id="mock-test" className="bg-gradient-to-br from-[#0b0f19] to-[#111827] text-gray-200 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-cyan-400 text-sm mb-6">
            <Brain size={14} />
            AI-Powered Testing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            AI Adaptive <span className="text-cyan-400">Mock Test</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Test your knowledge with AI-generated questions and get personalized feedback.
          </p>
        </div>

        {/* STEP 0: Setup */}
        {step === 0 && (
          <div className="max-w-xl mx-auto bg-[#111827]/80 backdrop-blur border border-cyan-500/20 p-8 rounded-2xl shadow-2xl space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Subject *</label>
              <input
                placeholder="e.g., Mathematics, Physics"
                className="w-full p-3 rounded-xl bg-[#020617] border border-cyan-500/20 focus:ring-2 focus:ring-cyan-400 outline-none text-gray-200 placeholder-gray-600 transition-all"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Weak Topic (optional)</label>
              <input
                placeholder="e.g., Calculus, Optics"
                className="w-full p-3 rounded-xl bg-[#020617] border border-cyan-500/20 focus:ring-2 focus:ring-cyan-400 outline-none text-gray-200 placeholder-gray-600 transition-all"
                value={weakTopic}
                onChange={(e) => setWeakTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Last Score % (optional)</label>
              <input
                placeholder="e.g., 70"
                type="number"
                className="w-full p-3 rounded-xl bg-[#020617] border border-cyan-500/20 focus:ring-2 focus:ring-cyan-400 outline-none text-gray-200 placeholder-gray-600 transition-all"
                value={lastScore}
                onChange={(e) => setLastScore(e.target.value)}
              />
            </div>

            <button
              onClick={startTest}
              disabled={loading || !subject.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Start AI Test
                </>
              )}
            </button>

            {!loggedIn && (
              <p className="text-gray-500 text-xs text-center">
                Login to save your scores and get AI feedback
              </p>
            )}
          </div>
        )}

        {/* TIMER */}
        {step > 0 && !submitted && (
          <div className="flex justify-center mb-6">
            <div className={`flex items-center gap-2 px-6 py-3 bg-[#111827] border border-gray-800 rounded-full ${timerColor}`}>
              <Timer size={18} />
              <span className="font-mono text-lg font-bold">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {Object.keys(answers).length}/{questions.length} answered
              </span>
            </div>
          </div>
        )}

        {/* QUESTIONS */}
        {step > 0 && !submitted && (
          <div className="max-w-3xl mx-auto space-y-5">
            {questions.map((q, i) => (
              <div key={i} className="bg-[#111827]/80 backdrop-blur p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all">
                <div className="flex gap-3 mb-4">
                  <span className="flex-shrink-0 h-7 w-7 bg-cyan-400/10 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="font-semibold text-gray-200">{q.question}</p>
                </div>

                <div className="space-y-2 ml-10">
                  {q.options?.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers({ ...answers, [i]: oi })}
                      className={`block w-full text-left p-3 rounded-lg border transition-all text-sm ${
                        answers[i] === oi
                          ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                          : "border-gray-700 hover:border-gray-600 text-gray-300"
                      }`}
                    >
                      <span className="font-mono text-xs mr-2 text-gray-500">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-black py-4 rounded-xl font-bold text-lg hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/20"
            >
              Submit Test
            </button>
          </div>
        )}

        {/* RESULT */}
        {submitted && (
          <div className="max-w-3xl mx-auto">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] border border-cyan-500/20 p-8 rounded-2xl shadow-2xl text-center mb-8">
              <Trophy className="mx-auto text-yellow-400 mb-4" size={48} />
              <h2 className="text-3xl font-bold mb-2">
                <span className={score >= questions.length / 2 ? "text-green-400" : "text-red-400"}>
                  {score}
                </span>
                <span className="text-gray-500">/{questions.length}</span>
              </h2>
              <p className="text-gray-400 mb-4">
                {score >= questions.length * 0.8
                  ? "🎯 Excellent performance!"
                  : score >= questions.length * 0.5
                  ? "👍 Good effort, keep improving!"
                  : "💪 Don't give up, practice more!"}
              </p>

              {/* Progress ring */}
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#1f2937" strokeWidth="2" />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke={score >= questions.length / 2 ? "#22d3ee" : "#f87171"}
                    strokeWidth="2"
                    strokeDasharray={`${(score / questions.length) * 100} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                  {Math.round((score / questions.length) * 100)}%
                </span>
              </div>
            </div>

            {/* AI Feedback */}
            {feedback && (
              <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-8">
                <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                  <Brain size={18} /> AI Analysis
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{feedback}</p>
              </div>
            )}

            {/* Wrong Answers */}
            <div className="space-y-3 mb-8">
              {questions.map((q, i) => {
                const isCorrect = answers[i] === q.answerIndex;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      isCorrect
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                      ) : (
                        <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-200">{q.question}</p>
                        {!isCorrect && (
                          <>
                            <p className="text-xs text-red-400 mt-1">
                              Your answer: {q.options?.[answers[i]] || "Not answered"}
                            </p>
                            <p className="text-xs text-green-400 mt-0.5">
                              Correct: {q.options?.[q.answerIndex!]}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Retry */}
            <button
              onClick={resetTest}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black py-4 rounded-xl font-bold text-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20"
            >
              Take Another Test
            </button>
          </div>
        )}
      </div>
    </section>
  );
}