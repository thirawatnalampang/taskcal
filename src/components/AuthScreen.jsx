import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function login(e) {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError("ยังไม่ได้ตั้งค่า Supabase");
      return;
    }

    const { error: loginError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (loginError) setError(loginError.message);
  }

  return (
    <div className="min-h-screen bg-[#f7f8ff] grid place-items-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-xl border border-violet-100">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#655bf5] grid place-items-center text-white">
            <CalendarDays />
          </div>
          <div className="text-2xl font-extrabold">TaskCal</div>
        </div>

        <h1 className="text-2xl font-extrabold mb-2">เข้าสู่ระบบ</h1>
        <p className="text-sm text-slate-400 mb-6">
          จัดการงานของคุณและทีมได้ในที่เดียว
        </p>

        <form onSubmit={login} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="อีเมล"
            className="w-full rounded-xl bg-slate-50 px-4 py-3 outline-none"
          />

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="รหัสผ่าน"
            className="w-full rounded-xl bg-slate-50 px-4 py-3 outline-none"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button className="w-full py-3 rounded-xl bg-[#655bf5] text-white font-bold">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
