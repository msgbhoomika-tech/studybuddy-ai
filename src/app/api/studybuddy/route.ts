import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

function generateFallbackContent(action: string, payload: any) {
  const subject = payload?.subject || "Operating Systems";
  const topic = payload?.topic || payload?.customNotes || "Process Synchronization & Deadlocks";
  const hours = payload?.hours || 2;

  if (action === "commute_audio") {
    return `Hello Bhoomika! This is Professor Lara. Let's do a quick commute review of ${topic} for ${subject}. 
First, look at the big picture: examiners look for whether you grasp the system invariants rather than just textbook syntax. 
Whenever you approach this in the exam, remember to clearly state your boundary conditions and write down the algorithm steps in order before drawing your conclusion. 
Stay confident, keep this logic clear, and you will easily secure full marks on this module!`;
  }

  if (action === "cram_strategy") {
    return `## 🚨 ${hours}-Hour Emergency Exam Triage Schedule: ${subject}
**Focus Target:** ${topic}

---

### ⏱️ Minute-by-Minute Survival Timeline
| Time Block | Target Area | Survival Objective | Actionable Checklist |
| :--- | :--- | :--- | :--- |
| **00 - 35 Min** | **Banker's Algorithm & Safety State** | Guaranteed 10-Mark Question | Practice one full numerical calculating Need matrix ($Need = Max - Allocation$) and finding safe sequence. |
| **35 - 70 Min** | **Classical Sync Problems** | High-Yield 8-Mark Question | Memorize semaphore code structures for Producer-Consumer (bounded buffer) and Dining Philosophers. |
| **70 - 95 Min** | **Deadlock 4 Conditions & Graph** | Direct Theory 6-Mark Question | Draw Resource Allocation Graphs (RAG) with and without cycles. Write out Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. |
| **95 - 120 Min** | **Formula & Diagram Retention** | Final Marks Protection | Rapidly redraw semaphores syntax, wait()/signal() primitives, and safe state checks on blank paper. |

---

### ❌ What to SKIP (Zero Yield in ${hours} Hours)
- **Skip:** Lengthy historical derivations of early batch systems.
- **Skip:** Hardware-level Peterson's algorithm architectural proofs unless explicitly asked.
- **Skip:** Deep multi-level feedback queue simulation calculations.

---

### 🎯 Top 3 High-Probability Exam Questions
1. **Banker's Algorithm Numerical:**
   - Always state: System is safe if there exists at least one order $\\langle P_1, P_2, ... \\rangle$ where each process can finish with currently available resources.
2. **Critical Section Problem:**
   - Must list the 3 mandatory criteria: **Mutual Exclusion**, **Progress**, and **Bounded Waiting**.
3. **Deadlock Prevention vs Avoidance:**
   - Prevention eliminates 1 of the 4 conditions. Avoidance uses Banker's algorithm dynamically check before allocation.`;
  }

  if (action === "visual_asset") {
    return `### 📊 Visual Blueprint & Execution Trace: ${topic}
**Subject:** ${subject}

#### 1. Architecture Flowchart
\`\`\`
[ Start Request ]
       │
       ▼
[ Is Need <= Available? ] ─── NO ───► [ Process Must Wait ]
       │ YES
       ▼
[ Pretend Allocate Resources ]
[ Available = Available - Request ]
[ Allocation = Allocation + Request ]
[ Need = Need - Request ]
       │
       ▼
[ Run Safety Algorithm Check ]
      ╱ ╲
    ╱     ╲
  [ Safe? ] ──── NO ───► [ Rollback Allocation & Block Process ]
    ╲     ╱
      ╲ ╱  YES
       ▼
[ Grant Resource Request Safely ]
\`\`\`

#### 2. Last-Minute Formula Cheat Sheet
| Concept | Core Formula / Rule | Crucial Invariant |
| :--- | :--- | :--- |
| **Need Matrix** | $Need[i][j] = Max[i][j] - Allocation[i][j]$ | $Need \\ge 0$ always |
| **Available Update** | $Available = Available + Allocation[i]$ | Released once process finishes |
| **Binary Semaphore** | $wait(S): S \\le 0 \\rightarrow \\text{block}; S--;$ | Mutual exclusion lock |
| **Counting Semaphore** | $signal(S): S++; \\text{wake up blocked process};$ | Resource pool counting |`;
  }

  if (action === "pyq_bank") {
    return `### 🏛️ University Model Exam Blueprint
**Subject:** ${subject} | **Module:** ${payload?.module || "Module 1"}

#### 1. High-Probability 10-Mark Blueprint Question
**Question:** Explain the Banker's Algorithm for Deadlock Avoidance. Given a system with 5 processes ($P_0 - P_4$) and 3 resource types ($A=10, B=5, C=7$), determine whether the snapshot is safe:

| Process | Allocation (A B C) | Max (A B C) | Need (A B C) | Available (A B C) |
| :---: | :---: | :---: | :---: | :---: |
| **P0** | 0 1 0 | 7 5 3 | 7 4 3 | 3 3 2 |
| **P1** | 2 0 0 | 3 2 2 | 1 2 2 | - - - |
| **P2** | 3 0 2 | 9 0 2 | 6 0 0 | - - - |
| **P3** | 2 1 1 | 2 2 2 | 0 1 1 | - - - |
| **P4** | 0 0 2 | 4 3 3 | 4 3 1 | - - - |

**Marking Scheme Breakdown [10 Marks]:**
1. **Need Calculation [2M]:** Correctly computing $Need = Max - Allocation$.
2. **Safety Trace [5M]:** Showing order where each process can finish:
   - $P_1$ needs $[1,2,2] \\le [3,3,2]$. Completes, new Available = $[5,3,2]$.
   - $P_3$ needs $[0,1,1] \\le [5,3,2]$. Completes, new Available = $[7,4,3]$.
   - $P_4$ needs $[4,3,1] \\le [7,4,3]$. Completes, new Available = $[7,4,5]$.
   - $P_0$ needs $[7,4,3] \\le [7,4,5]$. Completes, new Available = $[7,5,5]$.
   - $P_2$ needs $[6,0,0] \\le [7,5,5]$. Completes, new Available = $[10,5,7]$.
3. **Conclusion [3M]:** System is in a **SAFE STATE**. Safe Sequence: $\\langle P_1, P_3, P_4, P_0, P_2 \\rangle$.`;
  }

  if (action === "feynman_grade") {
    return `### 👩‍🏫 Prof. Lara's Feynman Evaluation
**Topic:** ${topic}

- **Intuition Score:** **8.5 / 10**
- **What You Got Right:** You captured the core operational purpose without reciting memorized formulas.
- **Blindspots & Gaps:** Clarify what happens in edge cases when resources are released simultaneously.
- **Analogy Upgrade:** Think of semaphores like keys to a single private fitting room in a shop.`;
  }

  if (action === "prof_lara_doubt") {
    return `### 👩‍🏫 Prof. Lara's Solution
**Your Query:** "${payload?.query || "Operating Systems Concept"}"

#### The Analogy:
Think of an operating system's CPU scheduler like an emergency triage room doctor. A doctor cannot treat all 5 patients at once, so they either assign time slices (Round Robin) or attend to the quickest treatment first (Shortest Job First) to keep the waiting room clear.

#### Technical Breakdown:
1. **Preemptive Scheduling:** The OS interrupts a running process when a higher-priority task arrives (e.g., Round Robin, SRTF).
2. **Non-Preemptive Scheduling:** Once a process gets the CPU, it keeps it until it voluntarily terminates or blocks for I/O (e.g., FCFS).`;
  }

  return `### 📌 Summary: ${subject} - ${topic}\nFocus on core definitions, formulas, and step-by-step state invariants.`;
}

export async function POST(req: Request) {
  let action = "study_guide";
  let payload: any = {};

  try {
    const body = await req.json();
    action = body.action;
    payload = body.payload || {};

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ result: generateFallbackContent(action, payload) });
    }

    const ai = new GoogleGenAI({ apiKey });

    let prompt = "";
    if (action === "commute_audio") {
      prompt = `You are Prof. Lara speaking an engaging, friendly audio podcast lesson directly to a student.
Subject: "${payload?.subject}". Topic: "${payload?.topic}". Notes/Syllabus: "${payload?.customNotes || "Key concepts"}".
Write a concise, conversational 150-word spoken audio script explaining the core concept, a memorable real-world analogy, and top exam tricks. Use conversational speech only (no markdown symbols, no bullet asterisks, no tables).`;
    } else if (action === "cram_strategy") {
      prompt = `You are an elite exam triage strategist for engineering exams.
Subject: "${payload?.subject}". Hours Remaining: ${payload?.hours} hrs.
Topics to prioritize: "${payload?.customNotes}".
Provide a minute-by-minute triage timetable table, a concrete skip list of what to ignore to pass, and the top 3 high-yield questions with model solutions. Clean markdown and tables only.`;
    } else if (action === "visual_asset") {
      prompt = `Mode: "${payload?.mode}". Subject: "${payload?.subject}". Topic: "${payload?.topic}". Notes: "${payload?.customNotes}".
Generate a clean ASCII architecture diagram, trace table, and last-minute cheat sheet.`;
    } else if (action === "pyq_bank") {
      prompt = `Scheme: "${payload?.scheme}". Subject: "${payload?.subject}". Module: "${payload?.module}". Keywords: "${payload?.keywords}".
Provide one 10-mark blueprint numerical with mark breakdown table and two 5-mark short questions.`;
    } else if (action === "feynman_grade") {
      prompt = `Evaluate student explanation of "${payload?.topic}": "${payload?.explanation}". Rate intuition /10, strengths, and concept gaps.`;
    } else if (action === "prof_lara_doubt") {
      prompt = `Answer student doubt: "${payload?.query}". Explain using an analogy first, followed by clear technical steps.`;
    } else {
      prompt = `Subject: "${payload?.subject}". Topic: "${payload?.topic}". Action: "${action}". Format cleanly in Markdown with tables.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      if (response?.text) {
        return NextResponse.json({ result: response.text });
      }
    } catch (apiErr: any) {
      return NextResponse.json({ result: generateFallbackContent(action, payload) });
    }

    return NextResponse.json({ result: generateFallbackContent(action, payload) });
  } catch (err: any) {
    return NextResponse.json({ result: generateFallbackContent(action, payload) });
  }
}