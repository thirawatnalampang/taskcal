import { Bell, Menu, Search } from "lucide-react";
import { avatar } from "../utils/avatar";

export default function Header({ user }) {
  const name =
    user?.user_metadata?.full_name || user?.email || "ผู้ใช้งาน";

  return (
    <header className="h-[76px] bg-white border-b border-[#ececff] flex items-center justify-between px-4 md:px-8 gap-4">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-lg bg-violet-50">
          <Menu size={18} />
        </button>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-3 text-slate-400"
          />
          <input
            placeholder="ค้นหางาน หรือชื่อสมาชิก..."
            className="w-[210px] md:w-[330px] bg-[#f7f7ff] rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-violet-50">
          <Bell size={18} className="text-slate-500" />
        </button>

        <div className="hidden sm:block text-right">
          <div className="text-xs text-slate-400">ยินดีต้อนรับ</div>
          <div className="text-sm font-bold">{name}</div>
        </div>

        <img
          src={avatar({
            full_name: user?.user_metadata?.full_name,
            avatar_url: user?.user_metadata?.avatar_url,
          })}
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </header>
  );
}
