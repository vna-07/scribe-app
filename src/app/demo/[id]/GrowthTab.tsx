"use client";

import { useState, useEffect } from "react";

export default function GrowthTab({ businessId }: { businessId: string }) {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", target: "" });
  const [busy, setBusy] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    const res = await fetch(`/api/goals?business_id=${businessId}`);
    if (res.ok) {
      const data = await res.json();
      setGoals(data.goals);
    }
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, [businessId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/goals", {
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
    setShowAdd(false);
    setForm({ title: "", desc: "", target: "" });
    fetchGoals();
    setBusy(false);
  };

  const handleUpdateProgress = async (id: string, current: number, target: number) => {
    const newValue = prompt("Enter new current value:", current.toString());
    if (newValue === null) return;
    await fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "update_progress", business_id: businessId, id, current_value: parseFloat(newValue) }),
    });
    fetchGoals();
  };

  const handleCompleteTask = async (taskId: string) => {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "complete_task", business_id: businessId, task_id: taskId }),
    });
    fetchGoals();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "delete_task", business_id: businessId, task_id: taskId }),
    });
    fetchGoals();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Growth Studio</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Track goals and measurable milestones.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#5B5BE0] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#4B4FC9] transition-colors">
          + New Goal
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2].map(i => <div key={i} className="h-32 bg-white/50 dark:bg-[#1A1F52] rounded-xl" />)}
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
                  <div>
                    <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg">{goal.title}</h3>
                    <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">{goal.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-wider">Progress</p>
                    <p className="font-extrabold text-[#5B5BE0] dark:text-[#A9AEFF] tabular-nums">{progress}%</p>
                  </div>
                </div>

                <div className="h-2 w-full bg-[#E1E4F7] dark:bg-[#2A3070] rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-[#5B5BE0] dark:bg-[#A9AEFF] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-wider">Milestones / Tasks</p>
                  <button onClick={() => handleUpdateProgress(goal.id, goal.current_value, goal.target_value)} className="text-xs font-bold text-[#5B5BE0] hover:underline">
                    Update Progress
                  </button>
                </div>

                {goal.tasks.length === 0 ? (
                  <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] italic">No tasks assigned yet. Ask Themba to create a plan.</p>
                ) : (
                  <div className="space-y-2">
                    {goal.tasks.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-[#F1F2FF] dark:bg-[#2A3070] group">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleCompleteTask(t.id)}
                            disabled={t.status === 'completed'}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${t.status === 'completed' ? 'bg-[#47745D] border-[#47745D]' : 'border-[#5B5BE0] hover:bg-[#E1E4F7] dark:hover:bg-[#3A4080]'}`}
                          >
                            {t.status === 'completed' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </button>
                          <span className={`text-sm ${t.status === 'completed' ? 'line-through text-[#5A5F8C] dark:text-[#C5C9F5]' : 'text-[#14173F] dark:text-white font-medium'}`}>
                            {t.title}
                          </span>
                        </div>
                        
                        {/* Delete Button (Visible on hover) */}
                        <button 
                          onClick={() => handleDeleteTask(t.id)}
                          className="text-[#A94E40] opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          title="Delete task"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── ADD GOAL MODAL ─── */}
      {showAdd && (
        <div className="fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white dark:bg-[#1A1F52] rounded-[28px] p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-6">Create Growth Goal</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Goal Title</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="e.g. Increase Monthly Revenue" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Description / Strategy</label>
                <input value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="How will you achieve this?" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Target Value (e.g. 50000 for R50k)</label>
                <input type="number" value={form.target} onChange={e => setForm({...form, target: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="50000" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50">Create Goal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}