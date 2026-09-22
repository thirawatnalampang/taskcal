import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!supabase || user.id === "demo-user") return;
    supabase.from("tasks")
      .select("*, assignee:profiles!tasks_assignee_id_fkey(id,full_name)")
      .then(({ data }) => setTasks(data || []));
  }, [user.id]);

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter(t => t.status === "done").length,
    progress: tasks.filter(t => t.status === "in_progress").length,
    todo: tasks.filter(t => t.status === "todo").length,
  }), [tasks]);

  const percent = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <>
      <div className="mb-6">
        <div className="text-sm text-violet-500 font-bold mb-2">Workspace / ภาพรวม</div>
        <h1 className="text-2xl md:text-3xl font-extrabold">ภาพรวมงาน</h1>
        <p className="text-sm text-slate-400 mt-2">สรุปสถานะงานทั้งหมดของทีม</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ["งานทั้งหมด", stats.total, ListTodo],
          ["เสร็จแล้ว", stats.done, CheckCircle2],
          ["กำลังทำ", stats.progress, Clock3],
          ["รอดำเนินการ", stats.todo, BarChart3],
        ].map(([label,value,Icon]) => (
          <div key={label} className="bg-white rounded-2xl border border-[#ededff] p-5">
            <div className="flex justify-between items-center">
              <div><div className="text-xs text-slate-400">{label}</div><div className="text-3xl font-extrabold mt-2">{value}</div></div>
              <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-500 grid place-items-center"><Icon size={20}/></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <section className="bg-white rounded-2xl border border-[#ededff] p-6">
          <h2 className="font-extrabold text-lg">ความคืบหน้า</h2>
          <div className="mt-6 h-4 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#655bf5] rounded-full transition-all" style={{width:`${percent}%`}}/>
          </div>
          <div className="flex justify-between mt-3 text-sm"><span className="text-slate-400">งานเสร็จแล้ว</span><span className="font-bold text-violet-600">{percent}%</span></div>
        </section>

        <section className="bg-white rounded-2xl border border-[#ededff] p-6">
          <h2 className="font-extrabold text-lg mb-5">งานล่าสุด</h2>
          {tasks.length ? (
            <div className="space-y-3">
              {tasks.slice(0,5).map(task => (
                <div key={task.id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div><div className="font-bold text-sm">{task.title}</div><div className="text-xs text-slate-400 mt-1">{task.assignee?.full_name || "ไม่ระบุผู้รับผิดชอบ"}</div></div>
                  <span className="text-xs text-slate-400">{task.task_date}</span>
                </div>
              ))}
            </div>
          ) : <div className="py-10 text-center text-sm text-slate-400">ยังไม่มีข้อมูลงาน</div>}
        </section>
      </div>
    </>
  );
}
