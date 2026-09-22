import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import { avatar } from "../utils/avatar";

export default function Members({ user }) {
  const [people,setPeople] = useState([]);
  const [query,setQuery] = useState("");

  useEffect(() => {
    if (!supabase || user.id === "demo-user") {
      setPeople([
        {id:"demo-1",full_name:"สมชาย ใจดี"},
        {id:"demo-2",full_name:"มานะ รุ่งเรือง"},
        {id:"demo-3",full_name:"สมหญิง พัฒนา"},
      ]);
      return;
    }
    supabase.from("profiles").select("*").order("full_name")
      .then(({data}) => setPeople(data || []));
  }, [user.id]);

  const filtered = people.filter(p =>
    (p.full_name || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="mb-6">
        <div className="text-sm text-violet-500 font-bold mb-2">Workspace / สมาชิก</div>
        <h1 className="text-2xl md:text-3xl font-extrabold">สมาชิกในทีม</h1>
        <p className="text-sm text-slate-400 mt-2">รายชื่อสมาชิกที่เชื่อมต่อกับระบบ</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#ededff] p-5 mb-5">
        <div className="relative max-w-md">
          <Search size={17} className="absolute left-3 top-3.5 text-slate-400"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาสมาชิก..." className="w-full bg-slate-50 rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"/>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(person => (
          <div key={person.id} className="bg-white rounded-2xl border border-[#ededff] p-5 flex items-center gap-4">
            <img src={avatar(person)} className="w-14 h-14 rounded-full object-cover"/>
            <div className="min-w-0">
              <div className="font-extrabold truncate">{person.full_name || "ไม่ระบุชื่อ"}</div>
              <div className="text-xs text-slate-400 mt-1">สมาชิกในทีม</div>
            </div>
          </div>
        ))}
        {!filtered.length && <div className="col-span-full bg-white rounded-2xl border border-[#ededff] py-16 text-center text-slate-400"><Users className="mx-auto mb-3"/>ไม่พบสมาชิก</div>}
      </div>
    </>
  );
}
