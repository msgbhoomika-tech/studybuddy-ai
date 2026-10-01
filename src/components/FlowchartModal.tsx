"use client";

import React, { useState } from "react";
import { X, Sparkles, Network, ArrowRight } from "lucide-react";

interface NodeItem {
  id: string;
  title: string;
  sub: string[];
}

const SAMPLE_TREES: Record<string, NodeItem[]> = {
  default: [
    { id: "1", title: "Problem Definition", sub: ["Input Graph G=(V,E)", "Source Node S"] },
    { id: "2", title: "Priority Queue / Min-Heap", sub: ["Track unvisited distances", "Extract min dist"] },
    { id: "3", title: "Relaxation Step", sub: ["Update neighbor d[v] = min(d[v], d[u] + w)", "Record parent pointers"] },
    { id: "4", title: "Termination", sub: ["Queue empty", "Return shortest paths array"] },
  ],
};

export default function FlowchartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [topicInput, setTopicInput] = useState("Dijkstra's Algorithm");
  const [nodes, setNodes] = useState<NodeItem[]>(SAMPLE_TREES.default);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setNodes([
      { id: "1", title: `${topicInput}: Core Concept`, sub: ["Initialization", "Base assumptions"] },
      { id: "2", title: "Traversal & State", sub: ["Loop invariant check", "State transition logic"] },
      { id: "3", title: "Optimization / Edge Cases", sub: ["Boundary constraints", "Time/Space: O(N log N)"] },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Interactive Concept Flowchart</h3>
              <p className="text-xs text-slate-500">Visual state transitions & algorithm hierarchy</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleGenerate} className="flex gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Type any algorithm or syllabus concept..."
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" /> Map
          </button>
        </form>

        {/* Visual Mindmap Tree */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 overflow-x-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 min-w-[500px]">
            {nodes.map((node, i) => (
              <React.Fragment key={node.id}>
                <div className="flex-1 bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs hover:border-teal-400 transition-all">
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block mb-1">
                    Step 0{i + 1}
                  </span>
                  <div className="text-xs font-bold text-slate-800 mb-2">{node.title}</div>
                  <ul className="space-y-1">
                    {node.sub.map((s, idx) => (
                      <li key={idx} className="text-[11px] text-slate-500 list-disc list-inside">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                {i < nodes.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-300 shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}