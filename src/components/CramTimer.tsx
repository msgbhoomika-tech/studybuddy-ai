"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

export default function CramTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="md:col-span-4 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Cram Sprint
        </span>
        <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-mono font-medium">
          {isRunning ? "Active" : "Paused"}
        </span>
      </div>

      <div className="my-3">
        <div className="text-4xl font-extrabold tracking-tight font-mono">
          {formattedTime}
        </div>
        <p className="text-xs text-indigo-200 mt-1">25-minute focused study interval</p>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <button
          onClick={toggleTimer}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition-colors shadow-sm"
        >
          {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isRunning ? "Pause" : "Start Sprint"}
        </button>
        <button
          onClick={resetTimer}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
          title="Reset"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}