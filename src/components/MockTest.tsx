"use client";

import { useState, useEffect } from "react";

import { Brain, Clock, Trophy, Code2, FileText } from "lucide-react";

type Question = {
  question: string;
  options?: string[];
  answerIndex?: number;
  type: "mcq" | "coding" | "case";
  explanation?: string;
};


export default function AIMockTest() {
  const [subject, setSubject] = useState("");
  const [weakTopic, setWeakTopic] = useState("");
  const [lastScore, setLastScore] = useState("");
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 min = 600 sec

// ⏱️ TIMER LOGIC YAHAN DAALNA HAI
useEffect(() => {
  if (step === 1 && !submitted) {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }
}, [step, submitted]);

  const isProgramming =
    subject.toLowerCase().includes("python") ||
    subject.toLowerCase().includes("java") ||
    subject.toLowerCase().includes("c") ||
    subject.toLowerCase().includes("javascript");

  const startTest = async () => {
    const res = await fetch("https://study-planner-2-zmn4.onrender.com/api/mock/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, weakTopic, lastScore }),
    });

    const data = await res.json();
    // localStorage.setItem("token", data.token);
    setTimeLeft(600);
    setQuestions(data.questions);
    setStep(1);
  };

  const nextSection = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const res = await fetch("https://study-planner-2-zmn4.onrender.com/api/mock/next", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          weakTopic,
          type: isProgramming ? "coding" : "case",
        }),
      });
  
      const data = await res.json();
  
      if (data.questions && data.questions.length > 0) {
        setQuestions((prev) => [...prev, ...data.questions]);
        setStep((prev) => prev + 1);  // ✅ step ko increment karte jao
      } else {
        alert("No more questions available!");
      }
    } catch (err) {
      console.error("NEXT SECTION ERROR:", err);
    }
  };
  
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
  
    let total = 0;
    let correct = 0;
  
    questions.forEach((q, i) => {
      if (q.type === "mcq") {
        total++;
        if (answers[i] === q.answerIndex) correct++;
      }
    });
  
    setScore(correct);
  
    const res = await fetch("https://study-planner-2-zmn4.onrender.com/api/mock/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`   // ✅ ADD THIS
      },
      body: JSON.stringify({
        subject,
        weakTopic,
        lastScore,
        score: correct
      }),
    });
  
    const data = await res.json();
    setFeedback(data.feedback);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] to-[#111827] text-gray-200 p-6">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-cyan-400 mb-8">
        AI Adaptive Mock Test
      </h1>

      {/* STEP 0 - INPUT FORM */}
      {step === 0 && (
        <div className="max-w-xl mx-auto bg-[#1f2937] p-6 rounded-2xl shadow-lg space-y-4">
          <input
            placeholder="Enter Subject"
            className="w-full p-3 rounded bg-[#0b0f19] border border-cyan-500/20"
            onChange={(e) => setSubject(e.target.value)}
          />
          <input
            placeholder="Enter Weak Topic"
            className="w-full p-3 rounded bg-[#0b0f19] border border-cyan-500/20"
            onChange={(e) => setWeakTopic(e.target.value)}
          />
          <input
            placeholder="Last Score (%)"
            className="w-full p-3 rounded bg-[#0b0f19] border border-cyan-500/20"
            onChange={(e) => setLastScore(e.target.value)}
          />

          <button
            onClick={startTest}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-3 rounded-xl font-semibold"
          >
            Start Test
          </button>
        </div>
      )}

{/* QUestion timer Use effect */}



      {/* Question Timer */}
      {step > 0 && (
      <div className="flex justify-between items-center mb-4">
  <h2 className="text-lg font-bold text-cyan-400">
    Time Left: {Math.floor(timeLeft / 60)}:
    {(timeLeft % 60).toString().padStart(2, "0")}
  </h2>
</div>
)}




      {/* QUESTIONS SECTION */}
      {step > 0 && !submitted && (
        <div className="max-w-4xl mx-auto space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="bg-[#1f2937] p-5 rounded-xl shadow">
              <div className="flex gap-2 mb-3">
                {q.type === "mcq" && <Brain className="text-cyan-400" />}
                {q.type === "coding" && <Code2 className="text-green-400" />}
                {q.type === "case" && <FileText className="text-yellow-400" />}
                <p className="font-semibold">
                  {i + 1}. {q.question}
                </p>
              </div>

              {q.type === "mcq" && q.options?.map((opt, oi) => (
  <button
    key={oi}
    onClick={() => setAnswers({ ...answers, [i]: oi })}
    className={`block w-full text-left p-2 mt-2 rounded border transition ${
      answers[i] === oi
        ? "bg-cyan-500 text-black"
        : "border-cyan-500/30 hover:border-cyan-400"
    }`}
  >
    {opt}
  </button>
))}

{q.type !== "mcq" && (
  <textarea
    placeholder="Write your answer..."
    className="w-full p-3 mt-2 rounded bg-[#0b0f19]"
    onChange={(e) =>
      setAnswers({ ...answers, [i]: e.target.value })
    }
  />
)}
            </div>
          ))}

          {step === 1 && (
            <button
              onClick={handleSubmit}
              className="w-full bg-cyan-500 py-3 rounded-xl text-black font-bold"
            >
              Submit Test
            </button>
          )}
        </div>
      )}

      {/* RESULT SECTION */}
      {submitted && (
        <div className="max-w-4xl mx-auto mt-8 bg-[#1f2937] p-6 rounded-2xl shadow">
          <Trophy className="mx-auto text-yellow-400 mb-3" size={40} />
          <h2 className="text-2xl font-bold text-center text-cyan-400">
            Your Score: {score}
          </h2>

          <p className="mt-4 text-center text-gray-300">{feedback}</p>

          <div className="mt-6 space-y-4">
            {questions.map((q, i) => {
              if (q.type === "mcq" && answers[i] !== q.answerIndex) {
                return (
                  <div key={i} className="bg-[#0b0f19] p-4 rounded">
                    <p className="text-red-400">
                      ❌ {q.question}
                    </p>
                    <p className="text-green-400">
                      Correct Answer: {q.options?.[q.answerIndex!]}
                    </p>
                    <p className="text-gray-400">
                      Reason: {q.explanation || "Concept based correction."}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
}