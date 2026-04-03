// "use client";

// import { useState } from "react";
// import { Flame, BarChart3 } from "lucide-react";

// type DailyTask = {
//   subject: string;
//   hours: number;
//   completed: boolean;
// };

// type DayPlan = {
//   date: string;
//   tasks: DailyTask[];
// };

// export default function ProgressTracker() {
//   const subjects = ["Math", "Physics", "Chemistry"];
//   const totalDays = 14; // example
//   const dailyHours = 2;

//   // Initialize mock plan
//   const [days, setDays] = useState<DayPlan[]>(
//     Array.from({ length: totalDays }, (_, i) => ({
//       date: `2026-04-${(i + 1).toString().padStart(2, "0")}`,
//       tasks: subjects.map((sub) => ({
//         subject: sub,
//         hours: dailyHours,
//         completed: false,
//       })),
//     }))
//   );

//   const toggleTask = (dayIndex: number, taskIndex: number) => {
//     const updated = [...days];
//     updated[dayIndex].tasks[taskIndex].completed =
//       !updated[dayIndex].tasks[taskIndex].completed;
//     setDays(updated);
//   };

//   // Calculate streak (consecutive fully completed days from last day)
//   const streak = (() => {
//     let count = 0;
//     for (let i = days.length - 1; i >= 0; i--) {
//       if (days[i].tasks.every((t) => t.completed)) count++;
//       else break;
//     }
//     return count;
//   })();

//   // Overall progress
//   const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);
//   const completedTasks = days.reduce(
//     (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
//     0
//   );
//   const overallProgress =
//     totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

//   // Subject-wise progress
//   const subjectProgress = subjects.map((sub) => {
//     const done = days.reduce(
//       (acc, d) => acc + (d.tasks.find((t) => t.subject === sub)?.completed ? 1 : 0),
//       0
//     );
//     return { subject: sub, progress: Math.round((done / totalDays) * 100) };
//   });

//   return (
//     <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-12 px-6">
//       <div className="max-w-4xl mx-auto">
//         <h2 className="text-4xl font-bold mb-6 text-center">
//           Study Progress <span className="text-cyan-400">Dashboard</span>
//         </h2>

//         {/* Streak */}
//         <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-6 flex justify-between">
//           <div>
//             <h3 className="text-xl font-bold text-cyan-400">🔥 Current Streak</h3>
//             <p className="text-gray-400 text-sm">Consistency matters</p>
//           </div>
//           <div className="text-3xl font-bold flex items-center gap-2">
//             <Flame className="text-orange-500" /> {streak}
//           </div>
//         </div>

//         {/* Overall progress */}
//         <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
//           <h3 className="text-xl font-bold mb-4 text-cyan-400">Overall Progress</h3>
//           <div className="w-full bg-gray-800 h-4 rounded-full">
//             <div
//               className="h-full bg-cyan-500 transition-all"
//               style={{ width: `${overallProgress}%` }}
//             />
//           </div>
//           <p className="text-sm mt-2 text-gray-400">
//             {completedTasks} / {totalTasks} tasks completed ({overallProgress}%)
//           </p>
//         </div>

//         {/* Daily tasks */}
//         <Section title="Daily Study Tasks">
//           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
//             {days.map((day, dayIndex) => (
//               <div key={day.date} className="bg-[#111827] p-4 rounded-xl">
//                 <div className="text-sm mb-2">{day.date}</div>
//                 {day.tasks.map((task, i) => (
//                   <div key={i} className="flex justify-between mb-1">
//                     <span>
//                       {task.subject} — {task.hours}h
//                     </span>
//                     <button
//                       onClick={() => toggleTask(dayIndex, i)}
//                       className={`px-3 py-1 rounded ${
//                         task.completed ? "bg-cyan-500 text-black" : "bg-[#020617]"
//                       }`}
//                     >
//                       {task.completed ? "Done" : "Mark"}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         </Section>

//         {/* Subject-wise progress */}
//         <Section title="Subject-wise Progress">
//           {subjectProgress.map((s) => (
//             <div key={s.subject} className="mb-4">
//               <div className="flex justify-between text-sm mb-1">
//                 <span>{s.subject}</span>
//                 <span>{s.progress}%</span>
//               </div>
//               <div className="w-full bg-gray-800 h-3 rounded-full">
//                 <div
//                   className="h-full bg-cyan-500"
//                   style={{ width: `${s.progress}%` }}
//                 />
//               </div>
//             </div>
//           ))}
//         </Section>
//       </div>
//     </div>
//   );
// }

// function Section({ title, children }: any) {
//   return (
//     <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
//       <h3 className="text-xl font-bold mb-4 text-cyan-400 flex gap-2">
//         <BarChart3 size={18} /> {title}
//       </h3>
//       {children}
//     </div>
//   );
// }




// import { useState, useEffect } from "react";
// import { Flame, BarChart3 } from "lucide-react";

// type DailyTask = {
//   subject: string;
//   hours: number;
//   completed: boolean;
// };

// type DayPlan = {
//   date: string;
//   tasks: DailyTask[];
// };

// export default function ProgressTracker() {
//   const subjects = ["Math", "Physics", "Chemistry"];
//   const totalDays = 14;
//   const dailyHours = 2;

//   const [days, setDays] = useState<DayPlan[]>(
//     Array.from({ length: totalDays }, (_, i) => ({
//       date: `2026-04-${(i + 1).toString().padStart(2, "0")}`,
//       tasks: subjects.map((sub) => ({
//         subject: sub,
//         hours: dailyHours,
//         completed: false,
//       })),
//     }))
//   );

//   const toggleTask = (dayIndex: number, taskIndex: number) => {
//     const updated = [...days];
//     updated[dayIndex].tasks[taskIndex].completed =
//       !updated[dayIndex].tasks[taskIndex].completed;
//     setDays(updated);
//   };

//   // Load AI schedule from localStorage
//   useEffect(() => {
//     const handleUpdate = (e: any) => {
//       const scheduleStr = e.detail;
  
//       if (!scheduleStr) return;
  
//       // Parse AI schedule: try JSON first, fallback to string
//       let newDays: DayPlan[] = [];
  
//       try {
//         // If AI returns array of { date, tasks: [{subject, hours}] }
//         const parsed = JSON.parse(scheduleStr);
//         if (Array.isArray(parsed)) {
//           newDays = parsed.map((d: any) => ({
//             date: d.date,
//             tasks: d.tasks.map((t: any) => ({
//               subject: t.subject,
//               hours: t.hours,
//               completed: false,
//             })),
//           }));
//         }
//       } catch {
//         // Fallback: parse string format "YYYY-MM-DD: Math-2h, Physics-2h"
//         newDays = scheduleStr.split("\n").map((line: string) => {
//           const [datePart, tasksPart] = line.split(":");
//           const taskList = tasksPart.split(",").map((t: string) => {
//             const [subject, hours] = t.trim().split("-");
//             return { subject, hours: parseInt(hours), completed: false };
//           });
//           return { date: datePart.trim(), tasks: taskList };
//         });
//       }
  
//       if (newDays.length > 0) setDays(newDays);
//     };
  
//     window.addEventListener("scheduleUpdated", handleUpdate);
//     return () => window.removeEventListener("scheduleUpdated", handleUpdate);
//   }, []);

//   const streak = (() => {
//     let count = 0;
//     for (let i = days.length - 1; i >= 0; i--) {
//       if (days[i].tasks.every((t) => t.completed)) count++;
//       else break;
//     }
//     return count;
//   })();

//   const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);
//   const completedTasks = days.reduce(
//     (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
//     0
//   );
//   const overallProgress =
//     totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

//   const subjectProgress = subjects.map((sub) => {
//     const done = days.reduce(
//       (acc, d) => acc + (d.tasks.find((t) => t.subject === sub)?.completed ? 1 : 0),
//       0
//     );
//     return { subject: sub, progress: Math.round((done / totalDays) * 100) };
//   });

//   return (
//     <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-12 px-6">
//       <div className="max-w-4xl mx-auto">
//         <h2 className="text-4xl font-bold mb-6 text-center">
//           Study Progress <span className="text-cyan-400">Dashboard</span>
//         </h2>

//         <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-6 flex justify-between">
//           <div>
//             <h3 className="text-xl font-bold text-cyan-400">🔥 Current Streak</h3>
//             <p className="text-gray-400 text-sm">Consistency matters</p>
//           </div>
//           <div className="text-3xl font-bold flex items-center gap-2">
//             <Flame className="text-orange-500" /> {streak}
//           </div>
//         </div>

//         <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
//           <h3 className="text-xl font-bold mb-4 text-cyan-400">Overall Progress</h3>
//           <div className="w-full bg-gray-800 h-4 rounded-full">
//             <div
//               className="h-full bg-cyan-500 transition-all"
//               style={{ width: `${overallProgress}%` }}
//             />
//           </div>
//           <p className="text-sm mt-2 text-gray-400">
//             {completedTasks} / {totalTasks} tasks completed ({overallProgress}%)
//           </p>
//         </div>

//         <Section title="Daily Study Tasks">
//           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
//             {days.map((day, dayIndex) => (
//               <div key={day.date} className="bg-[#111827] p-4 rounded-xl">
//                 <div className="text-sm mb-2">{day.date}</div>
//                 {day.tasks.map((task, i) => (
//                   <div key={i} className="flex justify-between mb-1">
//                     <span>
//                       {task.subject} — {task.hours}h
//                     </span>
//                     <button
//                       onClick={() => toggleTask(dayIndex, i)}
//                       className={`px-3 py-1 rounded ${
//                         task.completed ? "bg-cyan-500 text-black" : "bg-[#020617]"
//                       }`}
//                     >
//                       {task.completed ? "Done" : "Mark"}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         </Section>

//         <Section title="Subject-wise Progress">
//           {subjectProgress.map((s) => (
//             <div key={s.subject} className="mb-4">
//               <div className="flex justify-between text-sm mb-1">
//                 <span>{s.subject}</span>
//                 <span>{s.progress}%</span>
//               </div>
//               <div className="w-full bg-gray-800 h-3 rounded-full">
//                 <div
//                   className="h-full bg-cyan-500"
//                   style={{ width: `${s.progress}%` }}
//                 />
//               </div>
//             </div>
//           ))}
//         </Section>
//       </div>
//     </div>
//   );
// }

// function Section({ title, children }: any) {
//   return (
//     <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
//       <h3 className="text-xl font-bold mb-4 text-cyan-400 flex gap-2">
//         <BarChart3 size={18} /> {title}
//       </h3>
//       {children}
//     </div>
//   );
// }   

//2
// import { useState, useEffect } from "react";
// import { Flame, BarChart3 } from "lucide-react";

// type DailyTask = {
//   subject: string;
//   hours: number;
//   completed: boolean;
// };

// type DayPlan = {
//   date: string;
//   tasks: DailyTask[];
// };

// export default function ProgressTracker() {
//   const subjects = ["Math", "Physics", "Chemistry"];
//   const totalDays = 14;
//   const dailyHours = 2;

//   const [days, setDays] = useState<DayPlan[]>(
//     Array.from({ length: totalDays }, (_, i) => ({
//       date: `2026-04-${(i + 1).toString().padStart(2, "0")}`,
//       tasks: subjects.map((sub) => ({
//         subject: sub,
//         hours: dailyHours,
//         completed: false,
//       })),
//     }))
//   );

//   const toggleTask = (dayIndex: number, taskIndex: number) => {
//     const updated = [...days];
//     updated[dayIndex].tasks[taskIndex].completed =
//       !updated[dayIndex].tasks[taskIndex].completed;
//     setDays(updated);
//   };

//   // Listen for schedule updates from AISmartScheduler
//   useEffect(() => {
//     const handleUpdate = (e: any) => {
//       const scheduleStr = e.detail;
//       if (!scheduleStr) return;

//       let newDays: DayPlan[] = [];

//       try {
//         // Try JSON parsing first (preferred)
//         const parsed = JSON.parse(scheduleStr);
//         if (Array.isArray(parsed)) {
//           newDays = parsed.map((d: any) => ({
//             date: d.date,
//             tasks: d.tasks.map((t: any) => ({
//               subject: t.subject,
//               hours: t.hours,
//               completed: false,
//             })),
//           }));
//         }
//       } catch {
//         // Fallback: parse string "YYYY-MM-DD: Math-2h, Physics-2h"
//         newDays = scheduleStr.split("\n").map((line: string) => {
//           const [datePart, tasksPart] = line.split(":");
//           const taskList = tasksPart.split(",").map((t: string) => {
//             const [subject, hours] = t.trim().split("-");
//             return { subject, hours: parseInt(hours), completed: false };
//           });
//           return { date: datePart.trim(), tasks: taskList };
//         });
//       }

//       if (newDays.length > 0) setDays(newDays);
//     };

//     window.addEventListener("scheduleUpdated", handleUpdate);
//     return () => window.removeEventListener("scheduleUpdated", handleUpdate);
//   }, []);

//   // Calculate streak
//   const streak = (() => {
//     let count = 0;
//     for (let i = days.length - 1; i >= 0; i--) {
//       if (days[i].tasks.every((t) => t.completed)) count++;
//       else break;
//     }
//     return count;
//   })();

//   // Overall progress
//   const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);
//   const completedTasks = days.reduce(
//     (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
//     0
//   );
//   const overallProgress =
//     totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

//   // Subject-wise progress (calculated dynamically from updated days)
//   const subjectProgress = subjects.map((sub) => {
//     const done = days.reduce(
//       (acc, d) => acc + (d.tasks.find((t) => t.subject === sub)?.completed ? 1 : 0),
//       0
//     );
//     return { subject: sub, progress: Math.round((done / totalDays) * 100) };
//   });

//   return (
//     <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-12 px-6">
//       <div className="max-w-4xl mx-auto">
//         <h2 className="text-4xl font-bold mb-6 text-center">
//           Study Progress <span className="text-cyan-400">Dashboard</span>
//         </h2>

//         {/* Streak */}
//         <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-6 flex justify-between">
//           <div>
//             <h3 className="text-xl font-bold text-cyan-400">🔥 Current Streak</h3>
//             <p className="text-gray-400 text-sm">Consistency matters</p>
//           </div>
//           <div className="text-3xl font-bold flex items-center gap-2">
//             <Flame className="text-orange-500" /> {streak}
//           </div>
//         </div>

//         {/* Overall progress */}
//         <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
//           <h3 className="text-xl font-bold mb-4 text-cyan-400">Overall Progress</h3>
//           <div className="w-full bg-gray-800 h-4 rounded-full">
//             <div
//               className="h-full bg-cyan-500 transition-all"
//               style={{ width: `${overallProgress}%` }}
//             />
//           </div>
//           <p className="text-sm mt-2 text-gray-400">
//             {completedTasks} / {totalTasks} tasks completed ({overallProgress}%)
//           </p>
//         </div>

//         {/* Daily tasks */}
//         <Section title="Daily Study Tasks">
//           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
//             {days.map((day, dayIndex) => (
//               <div key={day.date} className="bg-[#111827] p-4 rounded-xl">
//                 <div className="text-sm mb-2">{day.date}</div>
//                 {day.tasks.map((task, i) => (
//                   <div key={i} className="flex justify-between mb-1">
//                     <span>
//                       {task.subject} — {task.hours}h
//                     </span>
//                     <button
//                       onClick={() => toggleTask(dayIndex, i)}
//                       className={`px-3 py-1 rounded ${
//                         task.completed ? "bg-cyan-500 text-black" : "bg-[#020617]"
//                       }`}
//                     >
//                       {task.completed ? "Done" : "Mark"}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         </Section>

//         {/* Subject-wise progress */}
//         <Section title="Subject-wise Progress">
//           {subjectProgress.map((s) => (
//             <div key={s.subject} className="mb-4">
//               <div className="flex justify-between text-sm mb-1">
//                 <span>{s.subject}</span>
//                 <span>{s.progress}%</span>
//               </div>
//               <div className="w-full bg-gray-800 h-3 rounded-full">
//                 <div
//                   className="h-full bg-cyan-500"
//                   style={{ width: `${s.progress}%` }}
//                 />
//               </div>
//             </div>
//           ))}
//         </Section>
//       </div>
//     </div>
//   );
// }

// function Section({ title, children }: any) {
//   return (
//     <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
//       <h3 className="text-xl font-bold mb-4 text-cyan-400 flex gap-2">
//         <BarChart3 size={18} /> {title}
//       </h3>
//       {children}
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { Flame, BarChart3 } from "lucide-react";

// type DailyTask = {
//   subject: string;
//   hours: number;
//   completed: boolean;
// };

// type DayPlan = {
//   date: string;
//   tasks: DailyTask[];
// };

// export default function ProgressTracker() {
//   // Start with empty days array
//   const [days, setDays] = useState<DayPlan[]>([]);

//   const toggleTask = (dayIndex: number, taskIndex: number) => {
//     const updated = [...days];
//     updated[dayIndex].tasks[taskIndex].completed =
//       !updated[dayIndex].tasks[taskIndex].completed;
//     setDays(updated);
//   };

//   // Listen for schedule updates from AISmartScheduler
//   useEffect(() => {
//     const handleUpdate = (e: any) => {
//       const scheduleStr = e.detail;
//       if (!scheduleStr) return;

//       let newDays: DayPlan[] = [];

//       try {
//         // Try JSON parsing first
//         const parsed = JSON.parse(scheduleStr);
//         if (Array.isArray(parsed)) {
//           newDays = parsed.map((d: any) => ({
//             date: d.date,
//             tasks: d.tasks.map((t: any) => ({
//               subject: t.subject,
//               hours: t.hours,
//               completed: false,
//             })),
//           }));
//         }
//       } catch {
//         // Fallback parse string "YYYY-MM-DD: Math-2h, Physics-2h"
//         newDays = scheduleStr.split("\n").map((line: string) => {
//           const [datePart, tasksPart] = line.split(":");
//           const taskList = tasksPart.split(",").map((t: string) => {
//             const [subject, hours] = t.trim().split("-");
//             return { subject, hours: parseInt(hours), completed: false };
//           });
//           return { date: datePart.trim(), tasks: taskList };
//         });
//       }

//       if (newDays.length > 0) setDays(newDays);
//     };

//     window.addEventListener("scheduleUpdated", handleUpdate);
//     return () => window.removeEventListener("scheduleUpdated", handleUpdate);
//   }, []);

//   // If no data, show placeholder
//   const hasData = days.length > 0;

//   // Calculate streak, overall and subject-wise progress only if data exists
//   const streak = hasData
//     ? (() => {
//         let count = 0;
//         for (let i = days.length - 1; i >= 0; i--) {
//           if (days[i].tasks.every((t) => t.completed)) count++;
//           else break;
//         }
//         return count;
//       })()
//     : 0;

//   const totalTasks = hasData ? days.reduce((acc, d) => acc + d.tasks.length, 0) : 0;
//   const completedTasks = hasData
//     ? days.reduce((acc, d) => acc + d.tasks.filter((t) => t.completed).length, 0)
//     : 0;
//   const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

//   const subjects = hasData
//     ? Array.from(new Set(days.flatMap((d) => d.tasks.map((t) => t.subject))))
//     : [];

//   const subjectProgress = subjects.map((sub) => {
//     const done = days.reduce(
//       (acc, d) => acc + (d.tasks.find((t) => t.subject === sub)?.completed ? 1 : 0),
//       0
//     );
//     return { subject: sub, progress: Math.round((done / days.length) * 100) };
//   });

//   return (
//     <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-12 px-6">
//       <div className="max-w-4xl mx-auto">
//         <h2 className="text-4xl font-bold mb-6 text-center">
//           Study Progress <span className="text-cyan-400">Dashboard</span>
//         </h2>

//         {hasData && (
//           <>
//             {/* Streak */}
//             <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-6 flex justify-between">
//               <div>
//                 <h3 className="text-xl font-bold text-cyan-400">🔥 Current Streak</h3>
//                 <p className="text-gray-400 text-sm">Consistency matters</p>
//               </div>
//               <div className="text-3xl font-bold flex items-center gap-2">
//                 <Flame className="text-orange-500" /> {streak}
//               </div>
//             </div>

//             {/* Overall progress */}
//             <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
//               <h3 className="text-xl font-bold mb-4 text-cyan-400">Overall Progress</h3>
//               <div className="w-full bg-gray-800 h-4 rounded-full">
//                 <div
//                   className="h-full bg-cyan-500 transition-all"
//                   style={{ width: `${overallProgress}%` }}
//                 />
//               </div>
//               <p className="text-sm mt-2 text-gray-400">
//                 {completedTasks} / {totalTasks} tasks completed ({overallProgress}%)
//               </p>
//             </div>

//             {/* Daily tasks */}
//             <Section title="Daily Study Tasks">
//               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
//                 {days.map((day, dayIndex) => (
//                   <div key={day.date} className="bg-[#111827] p-4 rounded-xl">
//                     <div className="text-sm mb-2">{day.date}</div>
//                     {day.tasks.map((task, i) => (
//                       <div key={i} className="flex justify-between mb-1">
//                         <span>
//                           {task.subject} — {task.hours}h
//                         </span>
//                         <button
//                           onClick={() => toggleTask(dayIndex, i)}
//                           className={`px-3 py-1 rounded ${
//                             task.completed ? "bg-cyan-500 text-black" : "bg-[#020617]"
//                           }`}
//                         >
//                           {task.completed ? "Done" : "Mark"}
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 ))}
//               </div>
//             </Section>

//             {/* Subject-wise progress */}
//             <Section title="Subject-wise Progress">
//               {subjectProgress.map((s) => (
//                 <div key={s.subject} className="mb-4">
//                   <div className="flex justify-between text-sm mb-1">
//                     <span>{s.subject}</span>
//                     <span>{s.progress}%</span>
//                   </div>
//                   <div className="w-full bg-gray-800 h-3 rounded-full">
//                     <div
//                       className="h-full bg-cyan-500"
//                       style={{ width: `${s.progress}%` }}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </Section>
//           </>
//         )}

//         {!hasData && (
//           <p className="text-gray-400 text-center mt-20">
//             No schedule generated yet. Click "Generate AI Schedule" to see your study plan.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

// function Section({ title, children }: any) {
//   return (
//     <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
//       <h3 className="text-xl font-bold mb-4 text-cyan-400 flex gap-2">
//         <BarChart3 size={18} /> {title}
//       </h3>
//       {children}
//     </div>
//   );
// }    

// 3

// import { useState, useEffect } from "react";
// import { Flame, BarChart3 } from "lucide-react";

// type DailyTask = {
//   subject: string;
//   hours: number;
//   completed: boolean;
// };

// type DayPlan = {
//   date: string;
//   tasks: DailyTask[];
// };

// export default function ProgressTracker() {
//   const [days, setDays] = useState<DayPlan[]>([]); // start blank

//   // ---------------- SUBJECTS ----------------
//   const subjects = ["Math", "Physics", "Chemistry"];

//   // ---------------- FETCH AI SCHEDULE ----------------
//   const fetchAISchedule = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("http://localhost:5000/api/ai/schedule", {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();

//       if (data.schedule) {
//         // Transform server schedule into DayPlan format
//         const lines = data.schedule.split("\n");
//         const newDays: DayPlan[] = lines
//           .filter((line) => line.includes("Day "))
//           .map((line) => {
//             const tasks: DailyTask[] = [];
//             const parts = line.split("•").slice(1); // skip "Day X:"
//             parts.forEach((p) => {
//               const match = p.trim().match(/(.+?) → (\d+(?:\.\d+)?)h/);
//               if (match) {
//                 tasks.push({ subject: match[1].trim(), hours: parseFloat(match[2]), completed: false });
//               }
//             });
//             return { date: "Scheduled", tasks };
//           });

//         setDays(newDays);
//       }
//     } catch (err) {
//       console.error("Failed to fetch AI schedule:", err);
//     }
//   };

//   // ---------------- LISTEN FOR GENERATE BUTTON ----------------
//   useEffect(() => {
//     const handleUpdate = () => {
//       fetchAISchedule();
//     };
//     window.addEventListener("scheduleUpdated", handleUpdate);
//     return () => window.removeEventListener("scheduleUpdated", handleUpdate);
//   }, []);

//   // ---------------- TOGGLE TASK ----------------
//   const toggleTask = (dayIndex: number, taskIndex: number) => {
//     const updated = [...days];
//     updated[dayIndex].tasks[taskIndex].completed = !updated[dayIndex].tasks[taskIndex].completed;
//     setDays(updated);
//   };

//   // ---------------- STREAK & PROGRESS ----------------
//   const streak = (() => {
//     let count = 0;
//     for (let i = days.length - 1; i >= 0; i--) {
//       if (days[i].tasks.every((t) => t.completed)) count++;
//       else break;
//     }
//     return count;
//   })();

//   const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);
//   const completedTasks = days.reduce(
//     (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
//     0
//   );
//   const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

//   const subjectProgress = subjects.map((sub) => {
//     const done = days.reduce(
//       (acc, d) => acc + (d.tasks.find((t) => t.subject === sub)?.completed ? 1 : 0),
//       0
//     );
//     return { subject: sub, progress: days.length === 0 ? 0 : Math.round((done / days.length) * 100) };
//   });

//   return (
//     <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-12 px-6">
//       <div className="max-w-4xl mx-auto">
//         <h2 className="text-4xl font-bold mb-6 text-center">
//           Study Progress <span className="text-cyan-400">Dashboard</span>
//         </h2>

//         <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-6 flex justify-between">
//           <div>
//             <h3 className="text-xl font-bold text-cyan-400">🔥 Current Streak</h3>
//             <p className="text-gray-400 text-sm">Consistency matters</p>
//           </div>
//           <div className="text-3xl font-bold flex items-center gap-2">
//             <Flame className="text-orange-500" /> {streak}
//           </div>
//         </div>

//         <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
//           <h3 className="text-xl font-bold mb-4 text-cyan-400">Overall Progress</h3>
//           <div className="w-full bg-gray-800 h-4 rounded-full">
//             <div className="h-full bg-cyan-500 transition-all" style={{ width: `${overallProgress}%` }} />
//           </div>
//           <p className="text-sm mt-2 text-gray-400">
//             {completedTasks} / {totalTasks} tasks completed ({overallProgress}%)
//           </p>
//         </div>

//         <Section title="Daily Study Tasks">
//           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
//             {days.length === 0 && <p className="text-gray-500">Click "Generate AI Schedule" to see your tasks</p>}
//             {days.map((day, dayIndex) => (
//               <div key={dayIndex} className="bg-[#111827] p-4 rounded-xl">
//                 <div className="text-sm mb-2">{day.date}</div>
//                 {day.tasks.map((task, i) => (
//                   <div key={i} className="flex justify-between mb-1">
//                     <span>
//                       {task.subject} — {task.hours}h
//                     </span>
//                     <button
//                       onClick={() => toggleTask(dayIndex, i)}
//                       className={`px-3 py-1 rounded ${task.completed ? "bg-cyan-500 text-black" : "bg-[#020617]"}`}
//                     >
//                       {task.completed ? "Done" : "Mark"}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         </Section>

//         <Section title="Subject-wise Progress">
//           {subjectProgress.map((s) => (
//             <div key={s.subject} className="mb-4">
//               <div className="flex justify-between text-sm mb-1">
//                 <span>{s.subject}</span>
//                 <span>{s.progress}%</span>
//               </div>
//               <div className="w-full bg-gray-800 h-3 rounded-full">
//                 <div className="h-full bg-cyan-500" style={{ width: `${s.progress}%` }} />
//               </div>
//             </div>
//           ))}
//         </Section>
//       </div>
//     </div>
//   );
// }

// function Section({ title, children }: any) {
//   return (
//     <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
//       <h3 className="text-xl font-bold mb-4 text-cyan-400 flex gap-2">
//         <BarChart3 size={18} /> {title}
//       </h3>
//       {children}
//     </div>
//   );
// }

//4

import { useState, useEffect } from "react";
import { Flame, BarChart3 } from "lucide-react";

type DailyTask = {
  subject: string;
  hours: number;
  completed: boolean;
};

type DayPlan = {
  date: string;
  tasks: DailyTask[];
};

export default function ProgressTracker() {
  const [days, setDays] = useState<DayPlan[]>([]); // starts empty
  const [subjects, setSubjects] = useState<string[]>([]); // starts empty

  const toggleTask = (dayIndex: number, taskIndex: number) => {
    const updated = [...days];
    updated[dayIndex].tasks[taskIndex].completed =
      !updated[dayIndex].tasks[taskIndex].completed;
    setDays(updated);
  };

  // Listen for schedule update
  useEffect(() => {
    const handleUpdate = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/ai/schedule", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;
        const data = await res.json();

        // Parse the schedule string into DayPlan[]
        const scheduleText: string = data.schedule;
        const lines = scheduleText.split("\n").filter((l) => l.startsWith("Day"));
        const newDays: DayPlan[] = lines.map((line) => {
          const taskMatches = line.match(/• (.+) → (\d+\.?\d*)h (\w+)/g) || [];
          const tasks = taskMatches.map((t) => {
            const parts = t.split("→");
            const subject = parts[0].replace("•", "").trim();
            const hours = parseFloat(parts[1]);
            return { subject, hours, completed: false };
          });
          return { date: line.split(":")[0], tasks };
        });

        // Extract subjects
        const subjectSet = new Set<string>();
        newDays.forEach((d) => d.tasks.forEach((t) => subjectSet.add(t.subject)));

        setDays(newDays);
        setSubjects(Array.from(subjectSet));
      } catch (err) {
        console.error("Failed to load schedule", err);
      }
    };

    window.addEventListener("scheduleUpdated", handleUpdate);
    return () => window.removeEventListener("scheduleUpdated", handleUpdate);
  }, []);

  // Streak
  const streak = (() => {
    let count = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].tasks.every((t) => t.completed)) count++;
      else break;
    }
    return count;
  })();

  const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = days.reduce(
    (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
    0
  );
  const overallProgress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const subjectProgress = subjects.map((sub) => {
    const done = days.reduce(
      (acc, d) => acc + (d.tasks.find((t) => t.subject === sub)?.completed ? 1 : 0),
      0
    );
    return { subject: sub, progress: Math.round((done / days.length) * 100) };
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-6 text-center">
          Study Progress <span className="text-cyan-400">Dashboard</span>
        </h2>

        <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-6 flex justify-between">
          <div>
            <h3 className="text-xl font-bold text-cyan-400">🔥 Current Streak</h3>
            <p className="text-gray-400 text-sm">Consistency matters</p>
          </div>
          <div className="text-3xl font-bold flex items-center gap-2">
            <Flame className="text-orange-500" /> {streak}
          </div>
        </div>

        <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
          <h3 className="text-xl font-bold mb-4 text-cyan-400">Overall Progress</h3>
          <div className="w-full bg-gray-800 h-4 rounded-full">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm mt-2 text-gray-400">
            {completedTasks} / {totalTasks} tasks completed ({overallProgress}%)
          </p>
        </div>

        <Section title="Daily Study Tasks">
          {days.length === 0 ? (
            <p className="text-gray-500 text-center">No schedule yet. Click Generate AI Schedule.</p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {days.map((day, dayIndex) => (
                <div key={day.date} className="bg-[#111827] p-4 rounded-xl">
                  <div className="text-sm mb-2">{day.date}</div>
                  {day.tasks.map((task, i) => (
                    <div key={i} className="flex justify-between mb-1">
                      <span>
                        {task.subject} — {task.hours}h
                      </span>
                      <button
                        onClick={() => toggleTask(dayIndex, i)}
                        className={`px-3 py-1 rounded ${
                          task.completed ? "bg-cyan-500 text-black" : "bg-[#020617]"
                        }`}
                      >
                        {task.completed ? "Done" : "Mark"}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Subject-wise Progress">
          {subjects.length === 0 ? (
            <p className="text-gray-500 text-center">No subjects yet. Click Generate AI Schedule.</p>
          ) : (
            subjectProgress.map((s) => (
              <div key={s.subject} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.subject}</span>
                  <span>{s.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 h-3 rounded-full">
                  <div
                    className="h-full bg-cyan-500"
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="bg-[#020617] border border-cyan-500/20 p-6 rounded-xl mb-10">
      <h3 className="text-xl font-bold mb-4 text-cyan-400 flex gap-2">
        <BarChart3 size={18} /> {title}
      </h3>
      {children}
    </div>
  );
}