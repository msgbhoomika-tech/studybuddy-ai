"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, MessageSquare, Send, Loader2 } from "lucide-react";

export default function FeynmanTutor() {
  const [topic, setTopic] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "system" | "user"; text: string }>>([
    {
      role: "system",
      text: "State a technical concept or algorithm you are revising (e.g. Dijkstra, Binary Trees, Virtual Memory). I'll drill your intuition without jargon.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const currentTopic = topic;
    setActiveTopic(currentTopic);
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: currentTopic }),
      });
      const data = await res.json();

      setMessages([
        {
          role: "system",
          text: data.response,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "system", text: `Let's tackle ${currentTopic}! In your own words, what problem is it trying to solve?` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userText = inputVal;
    setInputVal("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: activeTopic, explanation: userText }),
      });
      const data = await res.json();

      setMessages((prev) => [...prev, { role: "system", text: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "system", text: "Nice point! Can you think of any edge cases where this might break?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:col-span-8 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all">
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
          <Sparkles className="h-3.5 w-3.5" /> Feynman Method Engine
        </span>
        <span className="text-xs text-slate-400 font-mono">
          {activeTopic ? `Topic: ${activeTopic}` : "Idle"}
        </span>
      </div>

      <div className="flex-1 bg-slate-50/80 border border-slate-100 rounded-2xl p-4 overflow-y-auto max-h-[200px] space-y-3 mb-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 text-xs ${
              m.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-600 border border-slate-200"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white font-medium"
                  : "bg-white border border-slate-200/70 text-slate-700 shadow-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
            Thinking...
          </div>
        )}
      </div>

      {!activeTopic ? (
        <form onSubmit={handleStart} className="flex items-center gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Type: Dijkstra, Prim's, Binary Search..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            Start <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleReply} className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Explain it in simple words..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            Send <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}