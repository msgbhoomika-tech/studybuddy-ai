"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Zap,
  Clock,
  Landmark,
  HelpCircle,
  Timer,
  GraduationCap,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Volume2,
  Loader2,
  Send,
  Upload,
  Plus,
  Minus,
  Video,
  Shuffle,
  CheckCircle,
  XCircle,
  HelpCircle as QuestionIcon,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Code2,
  Binary,
  Maximize2,
  Layers,
  ArrowLeft,
  Trophy,
} from "lucide-react";

interface QuizQuestion {
  id: number;
  type: "mcq" | "out_of_box";
  question: string;
  options?: string[];
  correct?: string;
  explanation?: string;
  hint?: string;
  solution?: string;
}

interface GuideData {
  summary: string;
  youtube_queries: string[];
  quiz: QuizQuestion[];
}

export default function StudyBuddyDashboard() {
  const [appStage, setAppStage] = useState<"book" | "warp" | "carousel" | "module">("book");
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  const [xp, setXp] = useState(2400);
  const [streak] = useState(7);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Commute Audio State
  const [audioSubject, setAudioSubject] = useState("Operating Systems");
  const [audioTopic, setAudioTopic] = useState("Deadlock Prevention vs Avoidance");
  const [audioLessonScript, setAudioLessonScript] = useState("");
  const [audioSpeed, setAudioSpeed] = useState("1.0x");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Pomodoro Focus Timer State
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState("Operating Systems Revision");

  // Universal Source Input
  const [sourceType, setSourceType] = useState("none");
  const [pastedNotes, setPastedNotes] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");

  // Study Guide State
  const [guideSubject, setGuideSubject] = useState("Data Structures & Algorithms");
  const [guideTopic, setGuideTopic] = useState("Binary Search");
  const [guideMode, setGuideMode] = useState("Simplified Concept (Easy English for Beginners)");
  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [ytIndex, setYtIndex] = useState(0);

  // Interactive Quiz Tracking
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [revealedSolutions, setRevealedSolutions] = useState<{ [key: number]: boolean }>({});

  // Visuals & Cheats State
  const [visualMode, setVisualMode] = useState("Exam Flowchart & Architecture Diagram");
  const [visualSubject, setVisualSubject] = useState("Data Structures & Algorithms");
  const [visualTopic, setVisualTopic] = useState("Binary Search Tree Insertion");
  const [visualResult, setVisualResult] = useState("");

  // 2-Hr Cram State
  const [cramSubject, setCramSubject] = useState("Operating Systems");
  const [cramHours, setCramHours] = useState(2);
  const [cramTopicNotes, setCramTopicNotes] = useState("Process Synchronization, Deadlocks, Banker's Algorithm");
  const [cramPlan, setCramPlan] = useState("");

  // PYQ State
  const [pyqScheme, setPyqScheme] = useState("VTU Scheme (2022/2026)");
  const [pyqSemester, setPyqSemester] = useState("Semester 3");
  const [pyqSubject, setPyqSubject] = useState("Operating Systems");
  const [pyqModule, setPyqModule] = useState("Module 1");
  const [pyqKeywords, setPyqKeywords] = useState("Process Scheduling, Semaphores, Banker's Algorithm");
  const [pyqResult, setPyqResult] = useState("");

  // Feynman State
  const [feynmanTopic, setFeynmanTopic] = useState("Binary Search");
  const [feynmanExp, setFeynmanExp] = useState("");
  const [feynmanFeedback, setFeynmanFeedback] = useState("");

  // Doubt Hub State
  const [doubtText, setDoubtText] = useState("");
  const [doubtResponse, setDoubtResponse] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollLockRef = useRef(false);

  const MODULES = [
    {
      id: "guide",
      title: "Intelligent Study Guide",
      tag: "AI Syllabus Prep",
      desc: "Structured notes, YouTube links & interactive 7-MCQ drill tests.",
      icon: BookOpen,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      accent: "text-emerald-400",
      btnBg: "bg-emerald-600 hover:bg-emerald-500",
    },
    {
      id: "visuals",
      title: "Visuals & Trace Tables",
      tag: "Deep Architecture",
      desc: "Instant algorithm flowcharts, trace tables & 15-min cheat sheets.",
      icon: Zap,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      accent: "text-amber-400",
      btnBg: "bg-amber-600 hover:bg-amber-500",
    },
    {
      id: "timer",
      title: "Pomodoro Focus Hub",
      tag: "Productivity",
      desc: "Custom timer sessions, milestone GIFs & XP level claims.",
      icon: Clock,
      gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
      accent: "text-purple-400",
      btnBg: "bg-purple-600 hover:bg-purple-500",
    },
    {
      id: "pyq",
      title: "University PYQ Bank",
      tag: "VTU Blueprint",
      desc: "10-mark & 5-mark blueprint questions with verified schemes.",
      icon: Landmark,
      gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
      accent: "text-cyan-400",
      btnBg: "bg-cyan-600 hover:bg-cyan-500",
    },
    {
      id: "cram",
      title: "2-Hour Exam Cram",
      tag: "Emergency Triage",
      desc: "Minute-by-minute triage: high-probability questions & skip list.",
      icon: Timer,
      gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
      accent: "text-rose-400",
      btnBg: "bg-rose-600 hover:bg-rose-500",
    },
    {
      id: "feynman",
      title: "Feynman Lab",
      tag: "Intuition Testing",
      desc: "Teach concepts simply. AI pinpoints jargon & scores /10.",
      icon: GraduationCap,
      gradient: "from-yellow-500/20 via-amber-500/10 to-transparent",
      accent: "text-yellow-400",
      btnBg: "bg-yellow-600 hover:bg-yellow-500",
    },
    {
      id: "doubt",
      title: "Prof. Lara Doubt Hub",
      tag: "24/7 AI Mentor",
      desc: "Clarify complex engineering concepts with real-world analogies.",
      icon: HelpCircle,
      gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
      accent: "text-indigo-400",
      btnBg: "bg-indigo-600 hover:bg-indigo-500",
    },
    {
      id: "commute",
      title: "Commute Audio Mode",
      tag: "Hands-free Spoken",
      desc: "High-yield spoken lectures with variable playback speeds.",
      icon: Headphones,
      gradient: "from-fuchsia-500/20 via-purple-500/10 to-transparent",
      accent: "text-fuchsia-400",
      btnBg: "bg-fuchsia-600 hover:bg-fuchsia-500",
    },
  ];

  const handleCarouselWheel = (e: React.WheelEvent) => {
    if (scrollLockRef.current) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 20) return;

    scrollLockRef.current = true;
    if (delta > 0) {
      setActiveModuleIndex((prev) => (prev < MODULES.length - 1 ? prev + 1 : 0));
    } else {
      setActiveModuleIndex((prev) => (prev > 0 ? prev - 1 : MODULES.length - 1));
    }

    setTimeout(() => {
      scrollLockRef.current = false;
    }, 280);
  };

  useEffect(() => {
    if (appStage !== "warp") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const lineCount = 110;
    const lines = Array.from({ length: lineCount }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * 1000 + 100,
      speed: Math.random() * 22 + 18,
      length: Math.random() * 80 + 40,
      color: Math.random() > 0.4 ? "#3b82f6" : "#a855f7",
    }));

    const render = () => {
      ctx.fillStyle = "rgba(5, 7, 24, 0.28)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        l.z -= l.speed;
        if (l.z <= 10) {
          l.z = 1000;
          l.x = (Math.random() - 0.5) * width * 1.5;
          l.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = 300 / l.z;
        const px = l.x * k + cx;
        const py = l.y * k + cy;

        const k2 = 300 / (l.z + l.length);
        const px2 = l.x * k2 + cx;
        const py2 = l.y * k2 + cy;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px2, py2);
        ctx.strokeStyle = l.color;
        ctx.lineWidth = Math.min(3.5, (1000 - l.z) / 250);
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const t = setTimeout(() => {
      setAppStage("carousel");
    }, 2200);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
      clearTimeout(t);
    };
  }, [appStage]);

  // Pomodoro Interval Timer
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isTimerRunning && secondsLeft > 0) {
      t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      triggerXpGain(50);
    }
    return () => clearInterval(t);
  }, [isTimerRunning, secondsLeft]);

  const triggerXpGain = (amount: number) => {
    setXp((prev) => prev + amount);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 },
      colors: ["#5B47FB", "#10B981", "#F59E0B", "#EC4899"],
    });
  };

  const handleAdjustTimer = (delta: number) => {
    if (isTimerRunning) return;
    const newMins = Math.max(5, Math.min(120, pomodoroMinutes + delta));
    setPomodoroMinutes(newMins);
    setSecondsLeft(newMins * 60);
  };

  const callBackend = async (action: string, payload: any) => {
    setLoadingAction(action);
    try {
      const res = await fetch("/api/studybuddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.result;
    } catch (err: any) {
      alert(`Request Failed: ${err.message}`);
      return null;
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerateStudyGuide = async () => {
    setUserAnswers({});
    setRevealedSolutions({});
    setYtIndex(0);
    const res = await callBackend("study_guide", {
      subject: guideSubject,
      topic: guideTopic,
      mode: guideMode,
      sourceStyle: sourceType,
      customNotes: pastedNotes || attachedFileName,
    });
    if (res) {
      setGuideData(res);
      triggerXpGain(35);
    }
  };

  const handleSelectAnswer = (qId: number, selectedLetter: string, correctLetter: string) => {
    if (userAnswers[qId]) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: selectedLetter }));
    if (selectedLetter === correctLetter) {
      triggerXpGain(15);
    }
  };

  const toggleSolution = (qId: number) => {
    setRevealedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleNextYoutubeVideo = () => {
    if (!guideData?.youtube_queries?.length) return;
    setYtIndex((prev) => (prev + 1) % guideData.youtube_queries.length);
  };

  const currentYoutubeQuery =
    guideData?.youtube_queries?.[ytIndex] || `${guideTopic} ${guideSubject} tutorial animation`;

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    currentYoutubeQuery
  )}`;

  const renderMarkdown = (rawContent: string) => {
    if (!rawContent) return null;

    const cleanContent = rawContent
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/\$([^\$]+)\$/g, "$1")
      .replace(/\\le\b/g, "<=")
      .replace(/\\ge\b/g, ">=")
      .replace(/\\langle/g, "<")
      .replace(/\\rangle/g, ">");

    return (
      <div className="text-xs text-slate-800 space-y-3 leading-relaxed 
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:border [&_table]:border-slate-300 [&_table]:shadow-xs [&_table]:rounded-xl [&_table]:overflow-hidden
        [&_thead]:bg-[#EEF2F6]
        [&_th]:bg-[#EEF2F6] [&_th]:text-slate-800 [&_th]:font-bold [&_th]:p-2.5 [&_th]:border [&_th]:border-slate-300 [&_th]:text-center
        [&_td]:p-2.5 [&_td]:border [&_td]:border-slate-300 [&_td]:text-slate-700 [&_td]:text-center
        [&_tr:nth-child(even)]:bg-[#F8FAFD]
        [&_tr:hover]:bg-indigo-50/40
        [&_h1]:text-base [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mt-4
        [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-3
        [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-2
        [&_p]:text-xs [&_p]:text-slate-700 [&_p]:my-1.5
        [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
        [&_li]:my-1
        [&_strong]:font-bold [&_strong]:text-slate-900
        [&_code]:bg-[#F1F3F9] [&_code]:text-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono
        [&_pre]:bg-[#F4F6FB] [&_pre]:border [&_pre]:border-slate-200/90 [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:overflow-x-auto
        [&_pre_code]:bg-transparent [&_pre_code]:text-slate-900 [&_pre_code]:font-mono [&_pre_code]:text-xs [&_pre_code]:p-0">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanContent}</ReactMarkdown>
      </div>
    );
  };

  const renderSourceUploader = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#F8FAFD] border border-slate-200/80 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
        <span>📥</span>
        <span>Input Source (Upload notes or let AI generate from scratch)</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {[
          { id: "none", label: "No File (AI Generate)" },
          { id: "paste", label: "Paste Text / Notes" },
          { id: "pdf", label: "Upload PDF" },
          { id: "image", label: "Upload Blackboard Photo" },
        ].map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setSourceType(item.id)}
            className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
              sourceType === item.id
                ? "bg-[#5B47FB] text-white border-[#5B47FB] shadow-sm font-bold"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {sourceType === "paste" && (
          <motion.div
            key="paste-area"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <textarea
              rows={3}
              value={pastedNotes}
              onChange={(e) => setPastedNotes(e.target.value)}
              placeholder="Paste syllabus, textbook definitions, or lecture points here..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </motion.div>
        )}

        {(sourceType === "pdf" || sourceType === "image") && (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-dashed border-indigo-200 bg-white rounded-xl p-4 flex flex-col items-center justify-center text-xs text-slate-500"
          >
            <Upload className="h-5 w-5 text-indigo-600 mb-1" />
            <label className="cursor-pointer font-bold text-indigo-600 hover:underline">
              Click to upload {sourceType === "pdf" ? "Syllabus PDF" : "Blackboard Photo"}
              <input
                type="file"
                accept={sourceType === "pdf" ? ".pdf" : "image/*"}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setAttachedFileName(e.target.files[0].name);
                }}
              />
            </label>
            <span className="text-[11px] text-slate-400 mt-0.5">
              {attachedFileName ? `Attached: ${attachedFileName}` : "Supported up to 200MB"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const totalSeconds = pomodoroMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100)));

  // Dynamic Focus Milestone GIF helper
  const getMilestoneInfo = () => {
    if (progressPercent >= 100) {
      return {
        label: "🏆 100% COMPLETE: SESSION CONQUERED!",
        desc: "Immense focus unlocked! +50 XP granted. Take a 5-min breather.",
        gif: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif",
        badgeColor: "bg-emerald-500 text-white border-emerald-400",
      };
    }
    if (progressPercent >= 75) {
      return {
        label: "⚡ 75% MILESTONE: FINAL HOMESTRETCH",
        desc: "Almost at the finish line! Power through the remaining minutes.",
        gif: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
        badgeColor: "bg-purple-600 text-white border-purple-400",
      };
    }
    if (progressPercent >= 50) {
      return {
        label: "🔥 50% HALFWAY: DEEP FLOW UNLOCKED",
        desc: "Peak productivity zone reached. Maintain this state!",
        gif: "https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif",
        badgeColor: "bg-indigo-600 text-white border-indigo-400",
      };
    }
    if (progressPercent >= 25) {
      return {
        label: "🌱 25% MILESTONE: MOMENTUM BUILDING",
        desc: "Great start! Your cognitive momentum is dialed in.",
        gif: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
        badgeColor: "bg-amber-600 text-white border-amber-400",
      };
    }
    return {
      label: "🎯 0% COMMENCED: ENTER THE ZONE",
      desc: "Distraction shield active. Put your phone away and lock in.",
      gif: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
      badgeColor: "bg-slate-700 text-slate-100 border-slate-600",
    };
  };

  const milestone = getMilestoneInfo();

  return (
    <div className="relative min-h-screen bg-[#07091A] text-slate-100 flex items-center justify-center antialiased overflow-hidden select-none">

      {/* 1. ANIMATED BOOK INTRO SCREEN */}
      <AnimatePresence>
        {appStage === "book" && (
          <motion.div
            key="book-stage"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0c0f2b] via-[#101438] to-[#070919] p-6 text-center"
          >
            <div 
              className="absolute inset-0 opacity-25 pointer-events-none" 
              style={{ 
                backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)", 
                backgroundSize: "32px 32px" 
              }} 
            />

            <div className="relative z-10 max-w-lg flex flex-col items-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Next-Gen Adaptive Study Suite</span>
              </motion.div>

              <div className="relative w-64 h-52 flex items-center justify-center mb-8 perspective-[1000px]">
                <motion.div
                  animate={{ y: [-8, 8, -8], rotate: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -top-4 -left-6 bg-slate-900/90 border border-indigo-500/40 p-2.5 rounded-2xl shadow-xl flex items-center gap-1.5 text-indigo-300 text-xs font-bold z-20"
                >
                  <Code2 className="h-4 w-4" />
                  <span>DSA & Trace</span>
                </motion.div>

                <motion.div
                  animate={{ y: [8, -8, 8], rotate: [4, -4, 4] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                  className="absolute -bottom-2 -right-6 bg-slate-900/90 border border-purple-500/40 p-2.5 rounded-2xl shadow-xl flex items-center gap-1.5 text-purple-300 text-xs font-bold z-20"
                >
                  <Binary className="h-4 w-4" />
                  <span>VTU Exam Triage</span>
                </motion.div>

                <motion.div
                  initial={{ rotateX: 25, rotateY: -20, rotateZ: 5 }}
                  animate={{ 
                    rotateX: [20, 26, 20], 
                    rotateY: [-22, -16, -22],
                    rotateZ: [4, 6, 4] 
                  }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="relative w-48 h-36 bg-[#5B47FB] rounded-r-2xl rounded-l-md shadow-2xl border-l-8 border-[#3b2dbf] flex items-center justify-center transform-gpu"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div
                    animate={{ rotateY: [-25, -5, -25] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="absolute inset-y-1.5 left-3 right-1.5 bg-slate-100 rounded-r-xl shadow-inner flex flex-col justify-center p-3"
                    style={{ originX: 0, transformStyle: "preserve-3d" }}
                  >
                    <div className="w-full h-1.5 bg-indigo-200 rounded mb-1.5" />
                    <div className="w-3/4 h-1.5 bg-indigo-200 rounded mb-1.5" />
                    <div className="w-5/6 h-1.5 bg-slate-300 rounded mb-1.5" />
                    <div className="w-2/3 h-1.5 bg-slate-300 rounded" />
                  </motion.div>

                  <motion.div
                    animate={{ rotateY: [-15, 0, -15] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: 0.2, ease: "easeInOut" }}
                    className="absolute inset-y-2 left-4 right-1 bg-white rounded-r-xl shadow-md flex flex-col justify-center p-3"
                    style={{ originX: 0 }}
                  >
                    <div className="flex items-center gap-1 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="w-10 h-1 bg-slate-200 rounded" />
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded mb-1" />
                    <div className="w-4/5 h-1 bg-slate-200 rounded" />
                  </motion.div>
                </motion.div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Welcome to <span className="text-[#6C56FF]">StudyBuddy</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md leading-relaxed">
                Adaptive AI exam suite. Click below to warp into your interactive 3D study stage.
              </p>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(99, 102, 241, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAppStage("warp")}
                className="mt-8 px-8 py-3.5 bg-gradient-to-r from-[#5B47FB] to-[#8B5CF6] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-xl cursor-pointer"
              >
                <span>Start Learning</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FIBER-OPTIC SPEED LINES WARP TUNNEL */}
      {appStage === "warp" && (
        <div className="fixed inset-0 z-50 bg-[#050718] flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [0.95, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="relative z-10 text-center pointer-events-none"
          >
            <span className="text-sm font-black tracking-[0.35em] text-cyan-300 uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
              INITIALIZING STUDY CORE
            </span>
          </motion.div>
        </div>
      )}

      {/* 3. 3D SCROLLABLE CAROUSEL STAGE */}
      <AnimatePresence>
        {appStage === "carousel" && (
          <motion.div
            key="carousel-stage"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.45 }}
            onWheel={handleCarouselWheel}
            className="fixed inset-0 z-40 flex flex-col justify-between p-6 sm:p-10 bg-radial from-[#12163a] via-[#080a1d] to-[#040510]"
          >
            <div className="flex items-center justify-between z-10 max-w-6xl mx-auto w-full">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white shadow-lg">
                  ✦
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">StudyBuddy 3D Suite</h2>
                  <p className="text-[11px] text-slate-400">Scroll anywhere or swipe to cycle through tools</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-300 font-mono">
                  {activeModuleIndex + 1} / {MODULES.length}
                </span>
              </div>
            </div>

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -40) {
                  setActiveModuleIndex((prev) => (prev < MODULES.length - 1 ? prev + 1 : 0));
                } else if (info.offset.x > 40) {
                  setActiveModuleIndex((prev) => (prev > 0 ? prev - 1 : MODULES.length - 1));
                }
              }}
              className="relative w-full max-w-5xl mx-auto h-[430px] flex items-center justify-center perspective-[1200px] cursor-grab active:cursor-grabbing"
            >
              {MODULES.map((mod, index) => {
                const diff = index - activeModuleIndex;
                const isActive = diff === 0;

                const translateX = diff * 290;
                const translateZ = isActive ? 110 : -Math.abs(diff) * 160;
                const rotateY = diff * -18;
                const opacity = Math.abs(diff) > 2 ? 0 : 1 - Math.abs(diff) * 0.35;

                const Icon = mod.icon;

                return (
                  <motion.div
                    key={mod.id}
                    animate={{
                      x: translateX,
                      z: translateZ,
                      rotateY: rotateY,
                      opacity: opacity,
                      scale: isActive ? 1 : 0.88,
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                    onClick={() => {
                      if (!isActive) setActiveModuleIndex(index);
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                    className={`absolute w-[320px] sm:w-[360px] h-[400px] rounded-[2rem] p-7 flex flex-col justify-between backdrop-blur-2xl border transition-all duration-300 shadow-2xl ${
                      isActive
                        ? "bg-slate-900/90 border-indigo-400/60 shadow-[0_0_50px_rgba(91,71,251,0.35)] cursor-default"
                        : "bg-slate-950/60 border-white/10 shadow-lg cursor-pointer hover:border-white/30"
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${mod.gradient} pointer-events-none`} />

                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className={`h-14 w-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center ${mod.accent} shadow-inner`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/15">
                          {mod.tag}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-white tracking-tight leading-snug">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>

                    {isActive && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAppStage("module");
                        }}
                        className={`w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer ${mod.btnBg}`}
                      >
                        <span>Launch Module</span>
                        <Maximize2 className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="flex flex-col items-center gap-2 z-10">
              <div className="flex items-center gap-1.5">
                {MODULES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveModuleIndex(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeModuleIndex === i ? "w-8 bg-indigo-500 shadow-[0_0_8px_#6366f1]" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 tracking-wider">
                Scroll mouse wheel or swipe left / right to browse
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. FULL MODULE WORKBENCH */}
      {appStage === "module" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[1400px] bg-[#5B47FB] p-2 sm:p-3.5 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-3 min-h-[880px] my-6"
        >
          {/* Sidebar */}
          <aside className="w-full md:w-20 bg-transparent flex md:flex-col items-center justify-between py-3 px-3 md:px-0">
            <div className="flex md:flex-col items-center gap-5">
              <motion.button
                whileHover={{ scale: 1.1, rotate: -10 }}
                onClick={() => setAppStage("carousel")}
                title="Return to 3D Stage"
                className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white font-black text-xl cursor-pointer shadow-xs hover:bg-white/25"
              >
                ✦
              </motion.button>

              <nav className="flex md:flex-col items-center gap-2 overflow-x-auto md:overflow-visible max-w-full">
                {MODULES.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activeModuleIndex === idx;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.92 }}
                      key={item.id}
                      onClick={() => setActiveModuleIndex(idx)}
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center relative transition-all cursor-pointer ${
                        isActive
                          ? "bg-white text-[#5B47FB] shadow-lg font-bold"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                      title={item.title}
                    >
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <motion.span
                          layoutId="active-indicator"
                          className="absolute -right-1 w-1.5 h-4 bg-amber-400 rounded-full hidden md:block"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => setAppStage("carousel")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back</span>
            </button>
          </aside>

          {/* Workbench Body */}
          <div className="flex-1 bg-white text-slate-800 rounded-[2rem] p-5 sm:p-7 flex flex-col gap-5 overflow-y-auto max-h-[850px]">
            
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAppStage("carousel")}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  title="Return to 3D carousel to choose another tool"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Switch Feature</span>
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    Hello, Bhoomika <span>👋</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Currently active: <span className="font-semibold text-indigo-600">{MODULES[activeModuleIndex].title}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-semibold shadow-xs">
                  <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
                  <span>{streak}d Streak</span>
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold font-mono shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{xp} XP</span>
                </div>
              </div>
            </header>

            {/* TAB 1: STUDY GUIDE */}
            {activeModuleIndex === 0 && (
              <div className="space-y-4">
                <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-5 rounded-3xl">
                  <h3 className="font-bold text-base text-emerald-900">📚 Intelligent Study Guide & Instant Quiz</h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Generate structured summaries, direct YouTube video links, interactive 7 MCQs, and 3 out-of-the-box edge questions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subject Name:</label>
                    <input
                      value={guideSubject}
                      onChange={(e) => setGuideSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Topic Name:</label>
                    <input
                      value={guideTopic}
                      onChange={(e) => setGuideTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                {renderSourceUploader()}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Learning Mode:</label>
                  <select
                    value={guideMode}
                    onChange={(e) => setGuideMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option>Simplified Concept (Easy English for Beginners)</option>
                    <option>Deep Technical & Mathematical Formulation</option>
                    <option>VTU Exam Marking Scheme Oriented</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateStudyGuide}
                  disabled={loadingAction === "study_guide"}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {loadingAction === "study_guide" ? <Loader2 className="h-4 w-4 animate-spin" /> : "✨ Cook My Study Guide (+35 XP)"}
                </button>

                {guideData && (
                  <div className="space-y-6 pt-2">
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
                            Recommended Video ({ytIndex + 1}/{guideData.youtube_queries?.length || 1})
                          </span>
                          <p className="text-xs font-bold text-slate-800 mt-1">"{currentYoutubeQuery}"</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={youtubeSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          Watch on YouTube <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={handleNextYoutubeVideo}
                          className="px-3 py-2 rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Shuffle className="h-3.5 w-3.5" /> Change
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFD] border border-slate-200 p-6 rounded-2xl shadow-xs">
                      <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2 flex items-center gap-2">
                        <span>📖</span> Core Concept Breakdown & Tables
                      </h4>
                      {renderMarkdown(guideData.summary)}
                    </div>

                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 space-y-6">
                      <div className="border-b border-indigo-100 pb-3">
                        <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                          <span>🎯</span> Interactive Concept Verification (7 MCQs + 3 Out-of-the-Box)
                        </h4>
                      </div>

                      <div className="space-y-4">
                        {guideData.quiz?.filter((q) => q.type === "mcq").map((q, idx) => {
                          const isAnswered = Boolean(userAnswers[q.id]);
                          const userAnswer = userAnswers[q.id];
                          const isCorrect = userAnswer === q.correct;

                          return (
                            <div key={q.id} className="bg-white border border-indigo-100/80 rounded-2xl p-4 shadow-xs space-y-3">
                              <p className="text-xs font-bold text-slate-800">
                                <span className="text-indigo-600 font-mono mr-1.5">Q{idx + 1}.</span>
                                {q.question}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {q.options?.map((opt) => {
                                  const letter = opt.trim().charAt(0).toUpperCase();
                                  const isSelected = userAnswer === letter;
                                  const isThisCorrect = q.correct === letter;

                                  let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                                  if (isAnswered) {
                                    if (isThisCorrect) {
                                      btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-xs";
                                    } else if (isSelected && !isCorrect) {
                                      btnStyle = "bg-rose-50 border-rose-300 text-rose-700";
                                    } else {
                                      btnStyle = "opacity-40 bg-slate-50 border-slate-200 text-slate-400";
                                    }
                                  }

                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      disabled={isAnswered}
                                      onClick={() => handleSelectAnswer(q.id, letter, q.correct || "")}
                                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                                    >
                                      <span>{opt}</span>
                                      {isAnswered && isThisCorrect && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />}
                                      {isAnswered && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {isAnswered && (
                                <div className={`p-3 rounded-xl text-xs ${isCorrect ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                                  <p className="font-bold">{isCorrect ? "✅ Correct! +15 XP" : `❌ Incorrect! Correct Answer is ${q.correct}`}</p>
                                  <p className="mt-1 text-[11px]">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-4 pt-2">
                        <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                          ⚡ 3 Out-of-the-Box Systems & Edge-Case Questions
                        </h5>

                        {guideData.quiz?.filter((q) => q.type === "out_of_box").map((q, idx) => {
                          const isOpen = revealedSolutions[q.id];
                          return (
                            <div key={q.id} className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 shadow-xs space-y-3">
                              <p className="text-xs font-bold text-amber-950">
                                <span className="text-amber-700 font-mono mr-1.5">Challenge {idx + 1}:</span>
                                {q.question}
                              </p>

                              {q.hint && (
                                <div className="bg-white/80 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                                  <QuestionIcon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
                                  <span><strong>Hint:</strong> {q.hint}</span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => toggleSolution(q.id)}
                                className="text-[11px] font-bold text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                {isOpen ? "Hide In-Depth Solution" : "Reveal In-Depth Solution"}
                              </button>

                              {isOpen && (
                                <div className="bg-white border border-amber-200 p-3 rounded-xl text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                                  <span className="font-bold text-amber-800 block mb-1">Elite Solution Breakdown:</span>
                                  {q.solution}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: VISUALS & CHEATS */}
            {activeModuleIndex === 1 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl">
                  <h3 className="font-bold text-base text-amber-900">⚡ Visual Diagrams, Trace Tables & Cheat Sheets</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Generate clean flowchart architectures, algorithm dry-run trace tables, and 15-minute formula cheat sheets.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Choose Generation Mode:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        "Exam Flowchart & Architecture Diagram",
                        "15-Minute Last-Minute Cheat Sheet",
                        "Algorithm / Code Step-by-Step Dry-Run Table",
                      ].map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setVisualMode(m)}
                          className={`p-2.5 rounded-xl border text-[11px] font-semibold text-center transition-all cursor-pointer ${
                            visualMode === m
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs font-bold"
                              : "bg-white border-slate-200 text-slate-600"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Subject:</label>
                      <input
                        value={visualSubject}
                        onChange={(e) => setVisualSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Topic / Algorithm:</label>
                      <input
                        value={visualTopic}
                        onChange={(e) => setVisualTopic(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  {renderSourceUploader()}

                  <button
                    onClick={async () => {
                      const res = await callBackend("visual_asset", {
                        mode: visualMode,
                        subject: visualSubject,
                        topic: visualTopic,
                        customNotes: pastedNotes || attachedFileName,
                      });
                      if (res) {
                        setVisualResult(res);
                        triggerXpGain(30);
                      }
                    }}
                    disabled={loadingAction === "visual_asset"}
                    className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {loadingAction === "visual_asset" ? <Loader2 className="h-4 w-4 animate-spin" /> : "✨ Generate Visual / Tabular Asset (+30 XP)"}
                  </button>

                  {visualResult && (
                    <div className="bg-[#F8FAFD] border border-slate-200 p-5 rounded-2xl shadow-xs">
                      {renderMarkdown(visualResult)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: FOCUS TIMER WITH DYNAMIC MILESTONE GIFS */}
            {activeModuleIndex === 2 && (
              <div className="space-y-5">
                <div className="bg-purple-50 border border-purple-100 p-5 rounded-3xl">
                  <h3 className="font-bold text-base text-purple-900">⏱️ Pomodoro Focus Hub & Milestone Companion</h3>
                  <p className="text-xs text-purple-700 mt-0.5">
                    Live session tracking: earn milestone badges and +50 XP on completion.
                  </p>
                </div>

                <div className="p-8 rounded-3xl bg-[#F8FAFD] border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                  
                  {/* DYNAMIC MILESTONE GIF BANNER */}
                  <motion.div
                    key={milestone.label}
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-3.5 mb-5 shadow-xs flex items-center gap-3.5"
                  >
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                      <img
                        src={milestone.gif}
                        alt="Focus milestone GIF"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${milestone.badgeColor}`}>
                          {progressPercent}% Done
                        </span>
                        <span className="text-[11px] font-bold text-slate-800 truncate">
                          {milestone.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {milestone.desc}
                      </p>
                    </div>
                  </motion.div>

                  {/* Circular Dial Timer */}
                  <div className="relative w-64 h-64 flex items-center justify-center my-1">
                    <motion.div
                      animate={isTimerRunning ? { scale: [1, 1.14, 1], opacity: [0.35, 0.7, 0.35] } : { scale: 1, opacity: 0.2 }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/30 via-purple-500/25 to-pink-500/30 blur-xl"
                    />

                    <svg className="w-56 h-56 transform -rotate-90">
                      <circle
                        cx="112"
                        cy="112"
                        r="96"
                        stroke="#E2E8F0"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="112"
                        cy="112"
                        r="96"
                        stroke="#5B47FB"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 96}
                        strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        transition={{ duration: 0.5, ease: "linear" }}
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <motion.div
                        key={secondsLeft}
                        initial={{ scale: 0.96 }}
                        animate={{ scale: 1 }}
                        className="text-4xl sm:text-5xl font-black font-mono text-slate-800 tracking-wider"
                      >
                        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                      </motion.div>
                      
                      <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80">
                        <span className={`w-2 h-2 rounded-full ${isTimerRunning ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          {isTimerRunning ? "Deep Focus Active" : "Paused / Ready"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-indigo-600 font-bold mb-4 mt-2">Focus Target: {pomodoroTask}</p>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold text-slate-500">Duration (Minutes):</span>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                      <button
                        onClick={() => handleAdjustTimer(-5)}
                        disabled={isTimerRunning}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono font-bold text-sm text-slate-800 w-8 text-center">{pomodoroMinutes}</span>
                      <button
                        onClick={() => handleAdjustTimer(5)}
                        disabled={isTimerRunning}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="px-6 py-3 rounded-2xl bg-[#5B47FB] hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                    >
                      {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isTimerRunning ? "Pause Sprint" : "Start Deep Flow"}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setSecondsLeft(pomodoroMinutes * 60);
                      }}
                      className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <label className="font-bold text-slate-700 block">Task Description:</label>
                  <input
                    value={pomodoroTask}
                    onChange={(e) => setPomodoroTask(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: PYQ HUB */}
            {activeModuleIndex === 3 && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-100 p-5 rounded-3xl">
                  <h3 className="font-bold text-base text-purple-900">🏛️ University Exam Bank & Module-wise PYQ Hub</h3>
                  <p className="text-xs text-purple-700 mt-0.5">
                    Extracts high-probability 10-mark and 5-mark blueprint questions with point-wise model schemes and clean tables.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">University Pattern:</label>
                    <select
                      value={pyqScheme}
                      onChange={(e) => setPyqScheme(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option>VTU Scheme (2022/2026)</option>
                      <option>Autonomous / Engineering Pattern</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Semester:</label>
                    <select
                      value={pyqSemester}
                      onChange={(e) => setPyqSemester(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      {["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Module:</label>
                    <select
                      value={pyqModule}
                      onChange={(e) => setPyqModule(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      {["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"].map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subject:</label>
                    <input
                      value={pyqSubject}
                      onChange={(e) => setPyqSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Keywords / Topics in Module:</label>
                    <input
                      value={pyqKeywords}
                      onChange={(e) => setPyqKeywords(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                {renderSourceUploader()}

                <button
                  onClick={async () => {
                    const res = await callBackend("pyq_bank", {
                      scheme: pyqScheme,
                      semester: pyqSemester,
                      subject: pyqSubject,
                      module: pyqModule,
                      keywords: pyqKeywords,
                      customNotes: pastedNotes || attachedFileName,
                    });
                    if (res) {
                      setPyqResult(res);
                      triggerXpGain(25);
                    }
                  }}
                  disabled={loadingAction === "pyq_bank"}
                  className="w-full py-3.5 bg-[#5B47FB] hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {loadingAction === "pyq_bank" ? <Loader2 className="h-4 w-4 animate-spin" /> : "📄 Extract High-Probability PYQ Model Papers (+25 XP)"}
                </button>

                {pyqResult && (
                  <div className="bg-[#F8FAFD] border border-slate-200 p-5 rounded-2xl shadow-xs overflow-x-auto">
                    {renderMarkdown(pyqResult)}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: 2-HR CRAM */}
            {activeModuleIndex === 4 && (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl">
                  <h3 className="font-bold text-base text-rose-900">⏳ 2-Hour Emergency Exam Cram Strategy</h3>
                  <p className="text-xs text-rose-700 mt-0.5">
                    High-yield triage: Minute-by-minute breakdown of what to study and what to skip to pass.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subject Name:</label>
                    <input
                      value={cramSubject}
                      onChange={(e) => setCramSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Time Left: {cramHours} Hours</label>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={cramHours}
                      onChange={(e) => setCramHours(Number(e.target.value))}
                      className="w-full accent-[#5B47FB] mt-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Topics to Prioritize:</label>
                  <input
                    value={cramTopicNotes}
                    onChange={(e) => setCramTopicNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                {renderSourceUploader()}

                <button
                  onClick={async () => {
                    const res = await callBackend("cram_strategy", {
                      subject: cramSubject,
                      hours: cramHours,
                      customNotes: cramTopicNotes || pastedNotes,
                    });
                    if (res) {
                      setCramPlan(res);
                      triggerXpGain(25);
                    }
                  }}
                  disabled={loadingAction === "cram_strategy"}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {loadingAction === "cram_strategy" ? <Loader2 className="h-4 w-4 animate-spin" /> : "⚡ Generate Cram Survival Schedule (+25 XP)"}
                </button>

                {cramPlan && (
                  <div className="bg-[#F8FAFD] border border-slate-200 p-5 rounded-2xl shadow-xs">
                    {renderMarkdown(cramPlan)}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: FEYNMAN MODE */}
            {activeModuleIndex === 5 && (
              <div className="space-y-4">
                <div className="bg-[#FFF6ED] border border-[#FFEDD5] p-5 rounded-3xl">
                  <h3 className="font-bold text-base text-amber-900">👩‍🏫 Teach Prof. Lara (Feynman Technique)</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Explain your topic simply. The engine detects knowledge gaps and returns an intuition score out of 10.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Topic Name:</label>
                    <input
                      value={feynmanTopic}
                      onChange={(e) => setFeynmanTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>

                  <textarea
                    rows={6}
                    value={feynmanExp}
                    onChange={(e) => setFeynmanExp(e.target.value)}
                    placeholder="Explain this concept simply without technical jargon..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    onClick={async () => {
                      if (!feynmanExp.trim()) return;
                      const res = await callBackend("feynman_grade", {
                        topic: feynmanTopic,
                        explanation: feynmanExp,
                      });
                      if (res) {
                        setFeynmanFeedback(res);
                        triggerXpGain(30);
                      }
                    }}
                    disabled={loadingAction === "feynman_grade"}
                    className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {loadingAction === "feynman_grade" ? <Loader2 className="h-4 w-4 animate-spin" /> : "👩‍🏫 Grade My Explanation (+30 XP)"}
                  </button>

                  {feynmanFeedback && (
                    <div className="bg-[#F8FAFD] border border-slate-200 p-5 rounded-2xl shadow-xs">
                      {renderMarkdown(feynmanFeedback)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: DOUBT HUB */}
            {activeModuleIndex === 6 && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl">
                  <h3 className="font-bold text-base text-indigo-900">👩‍🏫 Meet Prof. Lara — 24/7 Doubt Hub</h3>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    Ask any question or upload an error screenshot for instant breakdown with analogies.
                  </p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!doubtText.trim()) return;
                    const res = await callBackend("prof_lara_doubt", {
                      query: doubtText,
                      customNotes: attachedFileName || pastedNotes,
                    });
                    if (res) {
                      setDoubtResponse(res);
                      triggerXpGain(15);
                    }
                  }}
                  className="space-y-3 text-xs"
                >
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Type your question:</label>
                    <input
                      value={doubtText}
                      onChange={(e) => setDoubtText(e.target.value)}
                      placeholder="e.g., Explain dynamic programming vs greedy approach with a simple analogy."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>

                  {renderSourceUploader()}

                  <button
                    type="submit"
                    disabled={loadingAction === "prof_lara_doubt"}
                    className="w-full py-3.5 bg-[#5B47FB] hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {loadingAction === "prof_lara_doubt" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Ask Lara (+15 XP)
                  </button>
                </form>

                {doubtResponse && (
                  <div className="bg-[#F8FAFD] border border-slate-200 p-5 rounded-2xl shadow-xs">
                    <span className="font-bold text-indigo-600 block mb-2">Prof. Lara:</span>
                    {renderMarkdown(doubtResponse)}
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: AUDIO MODE */}
            {activeModuleIndex === 7 && (
              <div className="space-y-4">
                <div className="bg-[#FAF5FF] border border-[#F3E8FF] p-5 rounded-3xl">
                  <h3 className="font-bold text-base text-purple-900">🎧 Commute Audio Mode (Lara's Spoken Lessons)</h3>
                  <p className="text-xs text-purple-700 mt-0.5">
                    Tell Prof. Lara what topic, syllabus notes, or uploaded PDF to teach as a podcast-style spoken lecture.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subject Name:</label>
                    <input
                      value={audioSubject}
                      onChange={(e) => setAudioSubject(e.target.value)}
                      placeholder="e.g. Operating Systems"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lesson Topic to Teach:</label>
                    <input
                      value={audioTopic}
                      onChange={(e) => setAudioTopic(e.target.value)}
                      placeholder="e.g. Banker's Algorithm & Semaphore Invariants"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                {renderSourceUploader()}

                <div className="space-y-4 text-xs pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Audio Playback Speed: {audioSpeed}</label>
                    <div className="flex gap-2">
                      {["0.75x", "1.0x", "1.25x", "1.5x", "2.0x"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setAudioSpeed(s);
                            if (window.speechSynthesis.speaking) {
                              window.speechSynthesis.cancel();
                              setIsPlayingAudio(false);
                            }
                          }}
                          className={`flex-1 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                            audioSpeed === s
                              ? "bg-[#5B47FB] border-[#5B47FB] text-white shadow-xs"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loadingAction === "commute_audio"}
                    onClick={async () => {
                      if (!("speechSynthesis" in window)) {
                        alert("Speech synthesis is not supported in this browser.");
                        return;
                      }

                      if (isPlayingAudio) {
                        window.speechSynthesis.cancel();
                        setIsPlayingAudio(false);
                        return;
                      }

                      let script = audioLessonScript;
                      if (!script) {
                        const res = await callBackend("commute_audio", {
                          subject: audioSubject,
                          topic: audioTopic,
                          customNotes: pastedNotes || attachedFileName,
                        });
                        if (res) {
                          script = res;
                          setAudioLessonScript(res);
                        } else {
                          script = `Hello! Welcome to your commute revision on ${audioTopic} in ${audioSubject}. Let us break down the key exam principles simply.`;
                          setAudioLessonScript(script);
                        }
                      }

                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance(script);
                      u.rate = parseFloat(audioSpeed);
                      u.onend = () => setIsPlayingAudio(false);
                      u.onerror = () => setIsPlayingAudio(false);
                      window.speechSynthesis.speak(u);
                      setIsPlayingAudio(true);
                      triggerXpGain(25);
                    }}
                    className="w-full py-4 bg-[#5B47FB] hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                  >
                    {loadingAction === "commute_audio" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    {isPlayingAudio ? "⏹ Stop Spoken Lesson" : "🎙️ Generate & Play Spoken Lesson (+25 XP)"}
                  </button>

                  {audioLessonScript && (
                    <div className="bg-[#F8FAFD] border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-indigo-700 text-xs">📖 Lara's Spoken Lecture Transcript</span>
                        <button
                          type="button"
                          onClick={() => setAudioLessonScript("")}
                          className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                        >
                          Clear & Regenerate
                        </button>
                      </div>
                      <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                        {audioLessonScript}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}

    </div>
  );
}