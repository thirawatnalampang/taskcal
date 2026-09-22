import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Reports({ user }) {
  const [tasks,setTasks] = useState([]);

  useEffect(() => {
    if (!supabase || user.id === "demo-user") return;
    supabase.from("tasks").select("*, assignee:profiles!tasks_assignee_id_fkey(id,full_name)")
      .then(({data}) => setTasks(data || []));
  }, [user.id]);

  const status = useMemo(() => ({
    todo: tasks.filter(t=>t.status==="todo").length,
    in_progress: tasks.filter(t=>t.status==="in_progress").length,
    done: tasks.filter(t=>t.status==="done").length,
  }), [tasks]);

  const priority = useMemo(() => ({
    high: tasks.filter(t=>t.priority==="high").length,
    medium: tasks.filter(t=>t.priority==="medium").length,
    low: tasks.filter(t=>t.priority==="low").length,
  }), [tasks]);

  return (
    <>
      <div className="mb-6">
        <div className="text-sm text-violet-500 font-bold mb-2">Workspace / รายงาน</div>
        <h1 className="text-2xl md:text-3xl font-extrabold">รายงานงาน</h1>
        <p className="text-sm text-slate-400 mt-2">สรุปงานตามสถานะและระดับความสำคัญ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <ReportCard title="รอดำเนินการ" value={status.todo}/>
        <ReportCard title="กำลังดำเนินการ" value={status.in_progress}/>
        <ReportCard title="เสร็จแล้ว" value={status.done}/>
      </div>

      <section className="bg-white rounded-2xl border border-[#ededff] p-6">
        <div className="flex items-center gap-2 mb-5"><FileText size={20} className="text-violet-500"/><h2 className="font-extrabold">ระดับความสำคัญ</h2></div>
        <div className="space-y-4">
          <ReportRow label="สำคัญมาก" value={priority.high}/>
          <ReportRow label="ปานกลาง" value={priority.medium}/>
          <ReportRow label="ทั่วไป" value={priority.low}/>
        </div>
      </section>
    </>
  );
}

function ReportCard({title,value}) {
  return <div className="bg-white rounded-2xl border border-[#ededff] p-6"><div className="text-sm text-slate-400">{title}</div><div className="text-3xl font-extrabold mt-2">{value}</div><div className="text-xs text-slate-400 mt-1">งาน</div></div>;
}

function ReportRow({label,value}) {
  return <div><div className="flex justify-between text-sm mb-2"><span className="font-semibold">{label}</span><span className="font-bold">{value} งาน</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#655bf5]" style={{width:`${Math.min(value*10,100)}%`}}/></div></div>;
}
