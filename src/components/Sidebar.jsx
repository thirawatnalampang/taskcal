import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

const menu = [
  ["calendar", CalendarDays, "ปฏิทินงาน"],
  ["dashboard", LayoutDashboard, "ภาพรวม"],
  ["people", Users, "สมาชิก"],
  ["reports", FileText, "รายงาน"],
  ["settings", Settings, "ตั้งค่า"],
];

export default function Sidebar({ active, setActive, onSignOut }) {
  return (
    <aside className="hidden md:flex w-[236px] shrink-0 bg-white border-r border-[#ececff] flex-col p-4">
      <div className="flex items-center gap-2 px-2 py-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#665cf6] grid place-items-center text-white">
          <CalendarDays size={21} />
        </div>
        <div>
          <div className="font-extrabold text-lg leading-5">TaskCal</div>
          <div className="text-[10px] text-violet-500 font-semibold">
            TEAM & TASKS
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {menu.map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition ${
              active === id
                ? "bg-[#655bf5] text-white shadow-lg shadow-violet-100"
                : "text-slate-500 hover:bg-violet-50"
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-[#f3f2ff] p-3 text-xs text-slate-500">
        <div className="font-bold text-violet-700 mb-1">TaskCal Pro</div>
        จัดการงานของทีมให้เป็นระบบในที่เดียว
      </div>

      <button
        onClick={onSignOut}
        className="flex items-center gap-2 text-sm text-slate-500 px-3 py-4"
      >
        <LogOut size={16} />
        ออกจากระบบ
      </button>
    </aside>
  );
}
