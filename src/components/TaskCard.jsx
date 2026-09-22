import { MoreHorizontal } from "lucide-react";
import { avatar } from "../utils/avatar";

export default function TaskCard({ task, onEdit }) {
  const status =
    {
      done: ["เสร็จแล้ว", "bg-emerald-50 text-emerald-600"],
      in_progress: ["กำลังทำ", "bg-violet-50 text-violet-600"],
      todo: ["รอดำเนินการ", "bg-amber-50 text-amber-600"],
    }[task.status] || ["รอดำเนินการ", "bg-slate-50 text-slate-600"];

  return (
    <div className="group border border-slate-100 rounded-xl p-4 hover:border-violet-200 hover:shadow-md transition flex gap-4">
      <div className="w-[58px] shrink-0 text-center pt-1">
        <div className="text-sm font-extrabold">
          {task.start_time || "--:--"}
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          {task.end_time ? `ถึง ${task.end_time}` : ""}
        </div>
      </div>

      <div className="w-1 rounded-full bg-violet-400 shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`text-[10px] px-2 py-1 rounded-md font-bold ${status[1]}`}
          >
            {status[0]}
          </span>
          <span className="text-[10px] text-slate-400">
            {task.priority === "high"
              ? "สำคัญมาก"
              : task.priority === "medium"
              ? "ปานกลาง"
              : "ทั่วไป"}
          </span>
        </div>

        <h3 className="font-extrabold text-sm md:text-base">
          {task.title}
        </h3>

        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
          {task.description || "ไม่มีรายละเอียดเพิ่มเติม"}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <img
            src={avatar(task.assignee)}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-xs font-semibold text-slate-500">
            {task.assignee?.full_name || "ยังไม่ระบุผู้รับผิดชอบ"}
          </span>
        </div>
      </div>

      <button
        onClick={onEdit}
        className="self-start p-1 rounded-lg text-slate-300 hover:text-violet-600 hover:bg-violet-50"
      >
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}
