import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AuthScreen from "./components/AuthScreen";
import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("calendar");

  useEffect(() => {
    if (!supabase) {
      setUser({
        id: "demo-user",
        email: "demo@taskcal.local",
        user_metadata: { full_name: "ผู้ใช้งานตัวอย่าง" },
      });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    else setUser(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-violet-600">
        กำลังโหลด TaskCal...
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  const pages = {
    calendar: <Calendar user={user} />,
    dashboard: <Dashboard user={user} />,
    people: <Members user={user} />,
    reports: <Reports user={user} />,
    settings: <Settings user={user} />,
  };

  return (
    <div className="min-h-screen bg-[#f7f8ff] text-[#252542] flex">
      <Sidebar active={active} setActive={setActive} onSignOut={signOut} />
      <main className="flex-1 min-w-0">
        <Header user={user} />
        <div className="p-4 md:p-8 max-w-[1500px] mx-auto">
          {pages[active]}
        </div>
      </main>
    </div>
  );
}
