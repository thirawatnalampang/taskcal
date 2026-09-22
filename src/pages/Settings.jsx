import { useEffect, useState } from "react";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Settings({ user }) {
  const [name,setName] = useState(user?.user_metadata?.full_name || "");
  const [saved,setSaved] = useState("");

  useEffect(() => setName(user?.user_metadata?.full_name || ""), [user]);

  async function save() {
    setSaved("");

    if (!supabase || user.id === "demo-user") {
      setSaved("บันทึกเรียบร้อยแล้ว");
      setTimeout(()=>setSaved(""),2500);
      return;
    }

    const authResult = await supabase.auth.updateUser({data:{full_name:name}});
    if (authResult.error) {
      setSaved(`บันทึกไม่สำเร็จ: ${authResult.error.message}`);
      return;
    }

    const profileResult = await supabase.from("profiles").update({full_name:name}).eq("id",user.id);
    if (profileResult.error) {
      setSaved(`Auth อัปเดตแล้ว แต่ Profile ไม่สำเร็จ: ${profileResult.error.message}`);
      return;
    }

    setSaved("บันทึกเรียบร้อยแล้ว");
    setTimeout(()=>setSaved(""),2500);
  }

  return (
    <>
      <div className="mb-6">
        <div className="text-sm text-violet-500 font-bold mb-2">Workspace / ตั้งค่า</div>
        <h1 className="text-2xl md:text-3xl font-extrabold">ตั้งค่า</h1>
        <p className="text-sm text-slate-400 mt-2">ตั้งค่าข้อมูลโปรไฟล์ของผู้ใช้งาน</p>
      </div>

      <section className="bg-white rounded-2xl border border-[#ededff] p-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-6"><SettingsIcon size={20} className="text-violet-500"/><h2 className="font-extrabold">ข้อมูลโปรไฟล์</h2></div>

        <label className="block">
          <span className="text-sm font-bold">ชื่อผู้ใช้งาน</span>
          <input value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-200"/>
        </label>

        <div className="mt-4">
          <span className="text-sm font-bold">อีเมล</span>
          <div className="mt-2 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">{user?.email || "-"}</div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={save} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#655bf5] text-white text-sm font-bold"><Save size={17}/>บันทึกการตั้งค่า</button>
          {saved && <span className="text-sm text-emerald-600">{saved}</span>}
        </div>
      </section>
    </>
  );
}
