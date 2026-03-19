import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const PomodoroTimer = () => {
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [completedSessions, setCompletedSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getDuration = useCallback((timerMode: TimerMode) => {
    switch (timerMode) {
      case "focus":
        return focusDuration * 60;
      case "shortBreak":
        return shortBreakDuration * 60;
      case "longBreak":
        return longBreakDuration * 60;
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration]);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
      
      // Play second beep
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.setValueAtTime(1000, ctx.currentTime);
        osc2.type = "sine";
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.5);
      }, 200);
    } catch (e) {
      console.log("Audio not supported");
    }
  }, [soundEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      playNotificationSound();
      setIsRunning(false);
      
      if (mode === "focus") {
        const newSessions = completedSessions + 1;
        setCompletedSessions(newSessions);
        
        if (newSessions % 4 === 0) {
          setMode("longBreak");
          setTimeLeft(longBreakDuration * 60);
        } else {
          setMode("shortBreak");
          setTimeLeft(shortBreakDuration * 60);
        }
      } else {
        setMode("focus");
        setTimeLeft(focusDuration * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, completedSessions, focusDuration, shortBreakDuration, longBreakDuration, playNotificationSound]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(getDuration(newMode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  const getModeColor = () => {
    switch (mode) {
      case "focus":
        return "primary";
      case "shortBreak":
        return "secondary";
      case "longBreak":
        return "accent";
    }
  };

  return (
    <section id="pomodoro" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-hero-gradient opacity-30" />
      
      <div className="container mx-auto max-w-2xl relative z-10">
        <div className="text-center mb-12">
          {/* <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Study Tool
          </span> */}
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Pomodoro</span> Timer
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Stay focused with the proven Pomodoro technique. Customize your sessions and take breaks when needed.
          </p>
        </div>

        <div className="glass-card p-8 md:p-12 relative overflow-hidden">
          {/* Animated background gradient */}
          <div 
            className="absolute inset-0 opacity-20 transition-all duration-1000"
            style={{
              background: `conic-gradient(from 0deg, hsl(var(--${getModeColor()})) ${progress}%, transparent ${progress}%)`,
            }}
          />
          
          {/* Mode selector */}
          <div className="flex justify-center gap-2 mb-8 relative z-10">
            {[
              { key: "focus", label: "Focus" },
              { key: "shortBreak", label: "Short Break" },
              { key: "longBreak", label: "Long Break" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => switchMode(key as TimerMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  mode === key
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Timer display */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              {/* Circular progress */}
              <svg className="w-64 h-64 transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/30"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={`text-${getModeColor()} transition-all duration-500`}
                  style={{
                    strokeDasharray: `${2 * Math.PI * 120}`,
                    strokeDashoffset: `${2 * Math.PI * 120 * (1 - progress / 100)}`,
                    filter: `drop-shadow(0 0 10px hsl(var(--${getModeColor()}) / 0.5))`,
                  }}
                />
              </svg>
              
              {/* Time text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl md:text-7xl font-display font-bold tracking-tight glow-text">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-muted-foreground text-sm mt-2 capitalize">
                  {mode === "focus" ? "Focus Time" : mode === "shortBreak" ? "Short Break" : "Long Break"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
                className="w-12 h-12 rounded-full border-border/50 hover:bg-muted/50"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={toggleTimer}
                size="lg"
                className={`w-20 h-20 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 ${
                  isRunning 
                    ? "bg-destructive hover:bg-destructive/90 shadow-destructive/30" 
                    : "bg-primary hover:bg-primary/90 shadow-primary/30"
                }`}
              >
                {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12 rounded-full border-border/50 hover:bg-muted/50"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Timer Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Focus Duration</Label>
                        <span className="text-muted-foreground">{focusDuration} min</span>
                      </div>
                      <Slider
                        value={[focusDuration]}
                        onValueChange={([value]) => {
                          setFocusDuration(value);
                          if (mode === "focus" && !isRunning) {
                            setTimeLeft(value * 60);
                          }
                        }}
                        min={1}
                        max={60}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Short Break</Label>
                        <span className="text-muted-foreground">{shortBreakDuration} min</span>
                      </div>
                      <Slider
                        value={[shortBreakDuration]}
                        onValueChange={([value]) => {
                          setShortBreakDuration(value);
                          if (mode === "shortBreak" && !isRunning) {
                            setTimeLeft(value * 60);
                          }
                        }}
                        min={1}
                        max={30}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Long Break</Label>
                        <span className="text-muted-foreground">{longBreakDuration} min</span>
                      </div>
                      <Slider
                        value={[longBreakDuration]}
                        onValueChange={([value]) => {
                          setLongBreakDuration(value);
                          if (mode === "longBreak" && !isRunning) {
                            setTimeLeft(value * 60);
                          }
                        }}
                        min={5}
                        max={45}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Sound toggle & session counter */}
            <div className="flex items-center justify-between w-full mt-8 pt-6 border-t border-border/50">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Sound {soundEnabled ? "On" : "Off"}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sessions:</span>
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i < (completedSessions % 4)
                          ? "bg-primary shadow-lg shadow-primary/50"
                          : "bg-muted/50"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-primary ml-1">{completedSessions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PomodoroTimer;







// "use client";

// import { useState, useEffect } from "react";
// import {
//   Brain,
//   Calendar,
//   Clock,
//   BookOpen,
//   Sparkles,
// } from "lucide-react";

// export default function AISmartSchedulerDark() {
//   const [examDate, setExamDate] = useState("");
//   const [dailyTime, setDailyTime] = useState("");
//   const [subjects, setSubjects] = useState("");
//   const [weakTopics, setWeakTopics] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [schedule, setSchedule] = useState("");

//   const generateSchedule = async () => {
//     if (!examDate || !dailyTime || !subjects) {
//       alert("Please fill all required fields");
//       return;
//     }

//     setLoading(true);
//     setSchedule("");

//     try {
//       const res = await fetch("http://localhost:5000/api/ai/schedule", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           examDate,
//           dailyTime,
//           subjects,
//           weakTopics,
//         }),
//       });

//       const data = await res.json();
//       setSchedule(data.schedule);
//     } catch {
//       alert("AI failed to generate schedule");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-24 px-6">
//       <div className="max-w-4xl mx-auto">
//         {/* HEADER */}
//         <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
//           <Brain className="text-cyan-400" />
//           AI Smart Study Scheduler
//         </h1>

//         {/* INPUT CARD */}
//         <div className="bg-[#111827] border border-cyan-500/20 rounded-2xl p-6 space-y-6 shadow-xl">
//           {/* EXAM + TIME */}
//           <div className="grid md:grid-cols-2 gap-6">
//             <InputBlock
//               icon={<Calendar size={16} />}
//               label="Exam Date"
//               type="date"
//               value={examDate}
//               onChange={setExamDate}
//             />

//             <InputBlock
//               icon={<Clock size={16} />}
//               label="Daily Study Time (hours)"
//               type="number"
//               placeholder="Eg: 4"
//               value={dailyTime}
//               onChange={setDailyTime}
//             />
//           </div>

//           <InputBlock
//             icon={<BookOpen size={16} />}
//             label="Subjects"
//             placeholder="Maths, Physics, Chemistry"
//             value={subjects}
//             onChange={setSubjects}
//           />

//           <div>
//             <label className="text-sm text-gray-400">
//               Weak Topics (optional)
//             </label>
//             <textarea
//               rows={3}
//               className="w-full mt-2 p-3 rounded-lg bg-[#020617] border border-cyan-500/20 focus:ring-2 focus:ring-cyan-400 outline-none"
//               placeholder="Calculus, Optics, Organic Chemistry"
//               value={weakTopics}
//               onChange={(e) => setWeakTopics(e.target.value)}
//             />
//           </div>

//           {/* BUTTON */}
//           <button
//             onClick={generateSchedule}
//             disabled={loading}
//             className="w-full bg-cyan-500 text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-cyan-400 transition"
//           >
//             <Sparkles size={18} />
//             {loading ? "AI Generating..." : "Generate AI Schedule"}
//           </button>
//         </div>

//         {/* RESULT */}
//         {schedule && (
//           <div className="mt-10 bg-[#020617] border border-cyan-500/20 p-6 rounded-2xl">
//             <h2 className="text-2xl font-bold mb-4 text-cyan-400">
//               📅 AI Generated Study Plan
//             </h2>
//             <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
//               {schedule}
//             </pre>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ---------- REUSABLE INPUT ---------- */
// function InputBlock({
//   icon,
//   label,
//   type = "text",
//   placeholder,
//   value,
//   onChange,
// }: any) {
//   return (
//     <div>
//       <label className="flex items-center gap-2 text-sm text-gray-400">
//         {icon}
//         {label}
//       </label>
//       <input
//         type={type}
//         placeholder={placeholder}
//         className="w-full mt-2 p-3 rounded-lg bg-[#020617] border border-cyan-500/20 focus:ring-2 focus:ring-cyan-400 outline-none"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//       />
//     </div>
//   );
// }
