"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Loader2, Trash2, Zap, ChevronDown,
  UserSearch, BrainCircuit, Briefcase, BarChart3,
  MessageSquareDiff, Bot,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TOOL METADATA — label + icon for each tool call badge
// ─────────────────────────────────────────────────────────────────────────────
const TOOL_META = {
  get_all_candidates:        { label: "Reading candidates",       icon: "📋" },
  get_candidate_details:     { label: "Fetching full profile",    icon: "👤" },
  get_candidate_full_report: { label: "Writing AI report",        icon: "📝" },
  compare_candidates:        { label: "Comparing candidates",     icon: "⚖️"  },
  search_candidates_by_skill:{ label: "Skill search",             icon: "🔍" },
  get_all_jobs:              { label: "Loading jobs",             icon: "💼" },
  rank_candidates_for_job:   { label: "Running ATS algorithm",    icon: "⚡" },
  shortlist_top_candidates:  { label: "Auto-shortlisting",        icon: "✅" },
  get_pipeline_stats:        { label: "Pipeline analysis",        icon: "📊" },
  update_candidate_status:   { label: "Updating status",          icon: "✏️"  },
  bulk_update_status:        { label: "Bulk status update",       icon: "🔄" },
  bulk_reject_below_score:   { label: "Auto-rejecting weak",      icon: "🚫" },
  initiate_ai_interview:     { label: "Building interview plan",  icon: "🎤" },
  evaluate_full_interview:   { label: "Scoring interview",        icon: "🏆" },
  create_candidate_from_text:{ label: "Adding candidate",         icon: "➕" },
  create_job_posting:        { label: "Creating job",             icon: "📌" },
  delete_candidate:          { label: "Deleting candidate",       icon: "🗑️"  },
  get_recruitment_intelligence:{ label: "Intelligence report",    icon: "🧠" },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE MARKDOWN RENDERER — no external deps needed
// ─────────────────────────────────────────────────────────────────────────────
function renderInline(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">{part.slice(1, -1)}</code>;
    return part;
  });
}

function MarkdownMessage({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="text-sm font-bold text-indigo-700 mt-3 mb-1 border-b border-indigo-100 pb-0.5">
          {renderInline(line.slice(2))}
        </h2>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="text-[13px] font-bold text-slate-800 mt-2.5 mb-1">
          {renderInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="text-xs font-semibold text-slate-700 mt-2 mb-0.5 uppercase tracking-wide">
          {renderInline(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <div key={i} className="flex gap-1.5 items-start my-0.5">
          <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
          <span className="text-[13px] leading-snug">{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-1.5 items-start my-0.5">
            <span className="text-indigo-500 font-semibold min-w-[18px] text-[12px] mt-0.5">{match[1]}.</span>
            <span className="text-[13px] leading-snug">{renderInline(match[2])}</span>
          </div>
        );
      }
    } else if (line.match(/^[-─═]{3,}$/)) {
      elements.push(<hr key={i} className="border-slate-200 my-2" />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(
        <p key={i} className="text-[13px] leading-snug">
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUICK ACTION CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: "Candidates",
    icon: UserSearch,
    color: "indigo",
    prompts: [
      "Show all candidates with their ATS scores",
      "Give me full details on candidate #1",
      "Find all candidates with React skills",
      "Compare candidates #1 and #2",
    ],
  },
  {
    label: "Jobs & Match",
    icon: Briefcase,
    color: "violet",
    prompts: [
      "Rank all candidates for the latest job",
      "Shortlist top 5 candidates for the first job",
      "Which job fits candidate #1 best?",
    ],
  },
  {
    label: "AI Interview",
    icon: BrainCircuit,
    color: "emerald",
    prompts: [
      "Conduct an AI interview with candidate #1",
      "Generate interview questions for candidate #1",
      "Evaluate the interview for candidate #1",
    ],
  },
  {
    label: "Pipeline",
    icon: BarChart3,
    color: "amber",
    prompts: [
      "Show pipeline stats",
      "Auto-reject candidates below 30 score",
      "Move candidate #1 to Interview stage",
      "Show recruitment intelligence report",
    ],
  },
  {
    label: "Add Data",
    icon: MessageSquareDiff,
    color: "rose",
    prompts: [
      "Add John Smith as new candidate: 5yr React developer, john@email.com, skills: React TypeScript Node.js",
      "Create a new Frontend Developer job posting",
    ],
  },
];

const WELCOME = {
  role: "ai",
  text: `## 👋 AI Recruiting Agent

I have **live access** to your entire ATS database. I can:

- 🔍 **Search & rank** candidates with real match scores
- 👤 **Full candidate profiles** — skills, experience, projects, interview history
- 🎤 **Conduct AI interviews** — ask questions & score responses
- ✏️ **Update pipeline** — move candidates, bulk actions, auto-shortlist
- ➕ **Add candidates** from text descriptions
- 📊 **Intelligence reports** — pipeline health, skill gaps, recommendations

**Try the quick actions below ↓ or type anything!**`,
  tools_used: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AIAgent() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([WELCOME]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState(null);   // quick-action category
  const [thinkLabel, setThinkLabel] = useState("Thinking…");

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Cycle thinking labels while loading
  useEffect(() => {
    if (!loading) return;
    const labels = [
      "Thinking…",
      "Querying database…",
      "Running analysis…",
      "Processing results…",
      "Almost done…",
    ];
    let idx = 0;
    const t = setInterval(() => { idx = (idx + 1) % labels.length; setThinkLabel(labels[idx]); }, 1800);
    return () => clearInterval(t);
  }, [loading]);

  const getHistory = useCallback(() =>
    messages.slice(1).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      text: m.text,
    })),
  [messages]);

  async function send(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setActiveTab(null);
    setMessages((prev) => [...prev, { role: "user", text: userText, tools_used: [] }]);
    setLoading(true);
    setThinkLabel("Thinking…");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: userText, history: getHistory() }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply || "No response received.",
          tools_used: data.tools_used || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "❌ Connection error — is the backend running?", tools_used: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const colorMap = {
    indigo:  { btn: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",  icon: "text-indigo-600", active: "bg-indigo-100 border-indigo-400" },
    violet:  { btn: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",  icon: "text-violet-600", active: "bg-violet-100 border-violet-400" },
    emerald: { btn: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", icon: "text-emerald-600", active: "bg-emerald-100 border-emerald-400" },
    amber:   { btn: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",      icon: "text-amber-600", active: "bg-amber-100 border-amber-400"  },
    rose:    { btn: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",          icon: "text-rose-600", active: "bg-rose-100 border-rose-400"    },
  };

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
        aria-label="Toggle AI Agent"
      >
        {open ? <X size={22} /> : <Zap size={22} />}
      </button>
      {!open && (
        <span className="fixed bottom-[76px] right-4 z-50 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white shadow tracking-wide">
          AGENT
        </span>
      )}

      {/* ── Chat window ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          style={{ width: 420, height: 620 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Zap size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">AI Recruiting Agent</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs text-indigo-100">18 tools · Live DB access · Gemini</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setMessages([WELCOME]); setActiveTab(null); }}
              className="rounded-lg p-1.5 hover:bg-white/20 transition"
              title="Clear conversation"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} w-full gap-2`}>
                  {m.role === "ai" && (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 mt-0.5">
                      <Bot size={13} className="text-indigo-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-sm text-[13px] leading-snug"
                        : "bg-slate-50 text-slate-800 rounded-bl-sm border border-slate-100"
                    }`}
                  >
                    {m.role === "ai" ? (
                      <MarkdownMessage text={m.text} />
                    ) : (
                      <span className="whitespace-pre-wrap">{m.text}</span>
                    )}
                  </div>
                </div>

                {/* Tool badges */}
                {m.role === "ai" && m.tools_used && m.tools_used.length > 0 && (
                  <div className="ml-9 mt-1.5 flex flex-wrap gap-1">
                    {[...new Set(m.tools_used)].map((tool) => {
                      const meta = TOOL_META[tool] || { label: tool.replace(/_/g, " "), icon: "🔧" };
                      return (
                        <span
                          key={tool}
                          className="flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-600"
                        >
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                  <Zap size={13} className="text-indigo-600 animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-slate-50 border border-slate-100 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-indigo-500" />
                    <span className="text-xs text-slate-500 italic">{thinkLabel}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50 px-3 py-2">
              {/* Category tabs */}
              <div className="flex gap-1.5 flex-wrap mb-1.5">
                {QUICK_ACTIONS.map((cat) => {
                  const Icon = cat.icon;
                  const c = colorMap[cat.color];
                  const isActive = activeTab === cat.label;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => setActiveTab(isActive ? null : cat.label)}
                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition ${
                        isActive ? c.active : c.btn
                      }`}
                    >
                      <Icon size={11} className={c.icon} />
                      {cat.label}
                      <ChevronDown size={10} className={`transition-transform ${isActive ? "rotate-180" : ""}`} />
                    </button>
                  );
                })}
              </div>

              {/* Expanded prompts */}
              {activeTab && (() => {
                const cat = QUICK_ACTIONS.find((c) => c.label === activeTab);
                if (!cat) return null;
                return (
                  <div className="flex flex-col gap-1">
                    {cat.prompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="text-left rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-slate-100 p-3 flex-shrink-0">
            <textarea
              ref={inputRef}
              className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 max-h-28 min-h-[36px]"
              placeholder="Ask anything — candidate info, ranking, interviews, add candidate..."
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
