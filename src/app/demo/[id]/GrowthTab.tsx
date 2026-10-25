"use client";

import { useState, useEffect, useCallback } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target_value: number | null;
  current_value: number;
  status: string;
  tasks: Task[];
}

export default function GrowthTab({ businessId, onTasksChanged }: { businessId: string; onTasksChanged?: () => void }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", target: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Set<string>>(new Set());

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/goals?business_id=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals);
      }
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create_goal",
          business_id: businessId,
          title: form.title,
          description: form.desc,
          target_value: form.target ? parseFloat(form.target) : null,
        }),
      });
      if (!res.ok) throw new Error("Could not create goal");
      setShowAdd(false);
      setForm({ title: "", desc: "", target: "" });
      await fetchGoals();
      onTasksChanged?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateProgress = async (id: string, current: number) => {
    const newValue = prompt("Enter new current value:", current.toString());
    if (newValue === null) return;
    const num = parseFloat(newValue);
    if (isNaN(num)) return;
    await fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "update_progress", business_id: businessId, id, current_value: num }),
    });
    fetchGoals();
  };

  const handleCompleteTask = async (taskId: string) => {
    // Optimistic
    setGoals(prev => prev.map(g => ({
      ...g,
      tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: "completed" } : t),
    })));
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "complete_task", business_id: businessId, task_id: taskId }),
      });
      if (!res.ok) throw new Error();
      onTasksChanged?.();
    } catch {
      setError("Could not mark task complete. Please try again.");
      fetchGoals();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    
    // Optimistic: remove from UI immediately
    setPendingDelete(prev => new Set(prev).add(taskId));
    const previousGoals = goals;
    setGoals(prev => prev.map(g => ({ ...g, tasks: g.tasks.filter(t => t.id !== taskId) })));

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete_task", business_id: businessId, task_id: taskId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Delete failed");
      onTasksChanged?.();
    } catch (e: any) {
      // Rollback
      setGoals(previousGoals);
      setError(e.message || "Could not delete task. Please try again.");
    } finally {
      setPendingDelete(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const handleClearCompleted = async () => {
    const completedCount = goals.reduce((sum, g) => sum + g.tasks.filter(t => t.status === "completed").length, 0);
    if (completedCount === 0) {
      setError("No completed tasks to clear.");
      return;
    }
    if (!confirm(`Clear all ${completedCount} completed task${completedCount === 1 ? "" : "s"}? This cannot be undone.`)) return;

    const previousGoals = goals;
    setGoals(prev => prev.map(g => ({ ...g, tasks: g.tasks.filter(t => t.status !== "completed") })));

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "clear_completed", business_id: businessId }),
      });
      if (!res.ok) throw new Error("Clear failed");
      onTasksChanged?.();
    } catch {
      setGoals(previousGoals);
      setError("Could not clear completed tasks.");
    }
  };

  const totalCompleted = goals.reduce((sum, g) => sum + g.tasks.filter(t => t.status === "completed").length, 0);

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 bg-[#B3261E]/10 border border-[#B3261E] text-[#B3261E] dark:text-[#FF8A80] rounded-xl p-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div className="flex-1">
            <p className="text-sm font-bold">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-sm font-bold opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Growth Studio</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Track goals and measurable milestones.</p>
        </div>
        <div className="flex gap-2">
          {totalCompleted > 0 && (
            <button onClick={handleClearCompleted} className="px-4 py-2 bg-white dark:bg-[#2A3070] text-[#B3261E] dark:text-[#FF8A80] border border-[#E1E4F7] dark:border-[#3A4080] rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-[#3A4080] transition-colors">
              Clear completed ({totalCompleted})
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#5B5BE0] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#4B4FC9] transition-colors">
            + New Goal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map(i => <div key={i} className="h-32 bg-white/50 dark:bg-[#1A1F52] rounded-xl" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-4">No active goals yet.</p>
          <button onClick={() => setShowAdd(true)} className="text-sm font-bold text-[#5B5BE0] hover:underline">Set your first goal</button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = goal.target_value ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100)) : 0;
            return (
              <div key={goal.id} className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg">{goal.title}</h3>
                    <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">{goal.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-wider">Progress</p>
                    <p className="font-extrabold text-[#5B5BE0] dark:text-[#A9AEFF] tabular-nums">{progress}%</p>
                  </div>
                </div>

                <div className="h-2 w-full bg-[#E1E4F7] dark:bg-[#2A3070] rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-[#5B5BE0] dark:bg-[#A9AEFF] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-wider">Milestones / Tasks</p>
                  <button onClick={() => handleUpdateProgress(goal.id, goal.current_value)} className="text-xs font-bold text-[#5B5BE0] hover:underline">
                    Update Progress
                  </button>
                </div>

                {goal.tasks.length === 0 ? (
                  <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] italic">No tasks yet. Ask Themba to create a plan.</p>
                ) : (
                  <div className="space-y-2">
                    {goal.tasks.map(t => {
                      const isDeleting = pendingDelete.has(t.id);
                      return (
                        <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg bg-[#F1F2FF] dark:bg-[#2A3070] transition-opacity ${isDeleting ? "opacity-40" : ""}`}>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => handleCompleteTask(t.id)}
                              disabled={t.status === "completed"}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                t.status === "completed"
                                  ? "bg-[#47745D] border-[#47745D]"
                                  : "border-[#5B5BE0] hover:bg-[#E1E4F7] dark:hover:bg-[#3A4080]"
                              }`}
                            >
                              {t.status === "completed" && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </button>
                            <span className={`text-sm truncate ${t.status === "completed" ? "line-through text-[#5A5F8C] dark:text-[#C5C9F5]" : "text-[#14173F] dark:text-white font-medium"}`}>
                              {t.title}
                            </span>
                          </div>

                          {/* Always-visible delete button — works on mobile and desktop */}
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            disabled={isDeleting}
                            className="ml-3 shrink-0 p-2 rounded-md text-[#B3261E] dark:text-[#FF8A80] hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/40 transition-colors disabled:opacity-40"
                            aria-label={`Delete task: ${t.title}`}
                            title="Delete task"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white dark:bg-[#1A1F52] rounded-[28px] p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-6">Create Growth Goal</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Goal Title</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="e.g. Increase Monthly Revenue" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Description</label>
                <input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="How will you achieve this?" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Target Value</label>
                <input type="number" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="50000" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50">
                {busy ? "Creating..." : "Create Goal"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}