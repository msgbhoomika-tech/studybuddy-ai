"use client";

import React, { useState } from "react";
import { Terminal, ChevronRight, RotateCcw } from "lucide-react";

const TRACE_STEPS = [
  { line: 1, code: "let arr = [4, 2, 7];", vars: { i: "-", target: "7", found: "false" } },
  { line: 2, code: "for (let i = 0; i < arr.length; i++)", vars: { i: "0", target: "7", found: "false" } },
  { line: 3, code: "  if (arr[i] === target) // 4 === 7 (false)", vars: { i: "0", target: "7", found: "false" } },
  { line: 2, code: "for (let i = 0; i < arr.length; i++)", vars: { i: "1", target: "7", found: "false" } },
  { line: 3, code: "  if (arr[i] === target) // 2 === 7 (false)", vars: { i: "1", target: "7", found: "false" } },
  { line: 2, code: "for (let i = 0; i < arr.length; i++)", vars: { i: "2", target: "7", found: "false" } },
  { line: 3, code: "  if (arr[i] === target) // 7 === 7 (MATCH)", vars: { i: "2", target: "7", found: "true" } },
  { line: 4, code: "return true;", vars: { i: "2", target: "7", found: "true" } },
];

export default function TraceEngine() {
  const [stepIndex, setStepIndex] = useState(0);

  const nextStep = () => {
    if (stepIndex < TRACE_STEPS.length - 1) setStepIndex(stepIndex + 1);
  };

  const reset = () => setStepIndex(0);

  const current = TRACE_STEPS[stepIndex];

  return (
    <div className="md:col-span-4 rounded-3xl bg-slate-950 text-slate-100 p-6 shadow-sm flex flex-col justify-between border border-slate-800">
      <div className="flex justify-between items-center">
        <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 font-semibold">
          <Terminal className="h-3.5 w-3.5" /> Trace Engine
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          Step {stepIndex + 1}/{TRACE_STEPS.length}
        </span>
      </div>

      <div className="my-3 space-y-2 font-mono text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 overflow-x-auto">
          <div className="text-[10px] text-slate-500 mb-1">CURRENT INSTRUCTION</div>
          <span className="text-emerald-400 font-semibold">{current.code}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] text-slate-500 block">i</span>
            <span className="text-indigo-400 font-bold">{current.vars.i}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">target</span>
            <span className="text-purple-400 font-bold">{current.vars.target}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">found</span>
            <span className={current.vars.found === "true" ? "text-emerald-400 font-bold" : "text-slate-400 font-bold"}>
              {current.vars.found}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        <button
          onClick={nextStep}
          disabled={stepIndex === TRACE_STEPS.length - 1}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-semibold transition-colors"
        >
          Step Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={reset}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          title="Reset"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}