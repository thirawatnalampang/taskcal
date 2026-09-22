import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { dateKey, thaiDate, thDays, thMonths } from "../utils/date";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

const demoPeople = [
  { id:"demo-1", full_name:"สมชาย ใจดี" },
  { id:"demo-2", full_name:"มานะ รุ่งเรือง" },
  { id:"demo-3", full_name:"สมหญิง พัฒนา" },
];

const demoTasks = [
  { id:"1", title:"ตรวจสอบเอกสารลูกค้าและอัปเดตข้อมูล", description:"ตรวจสอบเอกสารที่เข้ามาใหม่ให้ครบถ้วน", task_date:dateKey(new Date()), start_time:"09:00", end_time:"10:30", status:"in_progress", priority:"high", assignee:demoPeople[0] },
  { id:"2", title:"ประชุมทีมโปรเจกต์ (Sprint Sync)", description:"สรุปงานที่ทำไปและวางแผนงานรอบถัดไป", task_date:dateKey(new Date()), start_time:"11:00", end_time:"12:00", status:"todo", priority:"medium", assignee:demoPeople[1] },
  { id:"3", title:"อัปเดตข้อมูลและตรวจสอบสิทธิ์ในระบบ ERP", description:"ตรวจสอบข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง", task_date:dateKey(new Date()), start_time:"13:30", end_time:"14:30", status:"todo", priority:"low", assignee:demoPeople[2] },
  { id:"4", title:"สรุปรายงานและส่งต่อให้ทีม", description:"สรุปผลการทำงานประจำวัน", task_date:dateKey(new Date()), start_time:"15:00", end_time:"16:00", status:"done", priority:"medium", assignee:demoPeople[0] },
];

export default function Calendar({user}) {
  const today = useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);return d;},[]);
  const [month,setMonth]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const [selected,setSelected]=useState(dateKey(today));
  const [tasks,setTasks]=useState([]);
  const [people,setPeople]=useState([]);
  const [query,setQuery]=useState("");
  const [showModal,setShowModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [notice,setNotice]=useState("");

  useEffect(()=>{
    if(!supabase || user.id==="demo-user"){setPeople(demoPeople);setTasks(demoTasks);return;}
    loadData();
  },[user.id]);

  async function loadData(){
    const [{data:profiles},{data:rows}]=await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("tasks").select("*, assignee:profiles!tasks_assignee_id_fkey(id,full_name,avatar_url)").order("start_time")
    ]);
    if(profiles) setPeople(profiles);
    if(rows) setTasks(rows);
  }

  const visibleTasks=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q)return tasks;
    return tasks.filter(t=>`${t.title} ${t.description||""} ${t.assignee?.full_name||""}`.toLowerCase().includes(q));
  },[tasks,query]);

  const selectedTasks=visibleTasks.filter(t=>t.task_date===selected).sort((a,b)=>(a.start_time||"").localeCompare(b.start_time||""));

  const calendarCells=useMemo(()=>{
    const first=new Date(month.getFullYear(),month.getMonth(),1);
    const start=new Date(first); start.setDate(1-first.getDay());
    return Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
  },[month]);

  const stats={total:selectedTasks.length,done:selectedTasks.filter(t=>t.status==="done").length,pending:selectedTasks.filter(t=>t.status!=="done").length};

  function notify(message){setNotice(message);setTimeout(()=>setNotice(""),2500);}

  async function saveTask(form){
    if(!supabase || user.id==="demo-user"){
      const assignee=people.find(p=>p.id===form.assignee_id)||people[0];
      const local={...form,id:editing?.id||crypto.randomUUID(),assignee};
      setTasks(old=>editing?old.map(t=>t.id===editing.id?local:t):[...old,local]);
      notify("บันทึกงานเรียบร้อยแล้ว");
    }else{
      const payload={title:form.title,description:form.description,task_date:form.task_date,start_time:form.start_time,end_time:form.end_time,status:form.status,priority:form.priority,assignee_id:form.assignee_id||null,created_by:editing?.created_by||user.id};
      const result=editing?await supabase.from("tasks").update(payload).eq("id",editing.id):await supabase.from("tasks").insert(payload);
      if(result.error){notify(`บันทึกไม่สำเร็จ: ${result.error.message}`);return;}
      await loadData(); notify("บันทึกงานเรียบร้อยแล้ว");
    }
    setShowModal(false);setEditing(null);
  }

  async function removeTask(id){
    if(supabase && user.id!=="demo-user"){
      const {error}=await supabase.from("tasks").delete().eq("id",id);
      if(error){notify(`ลบไม่สำเร็จ: ${error.message}`);return;}
    }
    setTasks(old=>old.filter(t=>t.id!==id));setShowModal(false);setEditing(null);notify("ลบงานเรียบร้อยแล้ว");
  }

  return <>
    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
      <div><div className="text-sm text-violet-500 font-bold mb-2">Workspace / ปฏิทินงาน</div><h1 className="text-2xl md:text-3xl font-extrabold">ตารางงานประจำวัน <span className="text-emerald-500 text-sm align-middle">● ออนไลน์</span></h1><p className="text-sm text-slate-400 mt-2">{thaiDate(selected)} · สรุปงานและผู้รับผิดชอบของทีม</p></div>
      <button onClick={()=>{setEditing(null);setShowModal(true)}} className="flex items-center gap-2 bg-[#655bf5] text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg shadow-violet-200 hover:bg-violet-700"><Plus size={17}/> เพิ่มงานใหม่</button>
    </div>

    <div className="mb-4"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหางาน หรือชื่อสมาชิก..." className="w-full max-w-md bg-white border border-[#ededff] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"/></div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {[["งานทั้งหมด",stats.total,CalendarDays],["เสร็จแล้ว",stats.done,CheckCircle2],["กำลังดำเนินการ",stats.pending,Clock3]].map(([label,num,Icon])=><div key={label} className="bg-white rounded-2xl p-5 border border-[#ededff] flex items-center justify-between"><div><div className="text-xs text-slate-400 mb-2">{label}</div><div className="text-3xl font-extrabold">{num}<span className="text-sm font-medium text-slate-400 ml-1">งาน</span></div></div><div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-500 grid place-items-center"><Icon size={20}/></div></div>)}
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_330px] gap-5">
      <section className="bg-white border border-[#ededff] rounded-2xl p-4 md:p-6 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><div><h2 className="font-extrabold text-lg">ไทม์ไลน์วันนี้</h2><p className="text-xs text-slate-400 mt-1">เวลา 08:00 - 18:00 น.</p></div><div className="flex gap-2"><button onClick={()=>setSelected(dateKey(today))} className="px-3 py-2 text-xs rounded-lg bg-violet-50 text-violet-600 font-bold">วันนี้</button><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} className="p-2 rounded-lg border border-slate-100"><ChevronLeft size={16}/></button><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} className="p-2 rounded-lg border border-slate-100"><ChevronRight size={16}/></button></div></div>
        <div className="space-y-3">{selectedTasks.length?selectedTasks.map(t=><TaskCard key={t.id} task={t} onEdit={()=>{setEditing(t);setShowModal(true)}}/>):<div className="py-16 text-center text-slate-400 text-sm">วันนี้ยังไม่มีงาน 🎉</div>}</div>
      </section>

      <aside className="space-y-5">
        <div className="bg-white border border-[#ededff] rounded-2xl p-5"><div className="flex justify-between items-center mb-4"><h3 className="font-extrabold">{thMonths[month.getMonth()]} {month.getFullYear()+543}</h3><div className="flex gap-1"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} className="p-1"><ChevronLeft size={16}/></button><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} className="p-1"><ChevronRight size={16}/></button></div></div><div className="grid grid-cols-7 text-center text-[11px] text-slate-400 mb-2">{thDays.map(d=><div key={d} className="py-2">{d}</div>)}</div><div className="grid grid-cols-7 gap-y-1 text-center">{calendarCells.map(d=>{const key=dateKey(d);const count=tasks.filter(t=>t.task_date===key).length;return <button key={key} onClick={()=>setSelected(key)} className={`relative h-9 rounded-lg text-xs ${d.getMonth()!==month.getMonth()?"text-slate-300":"text-slate-600"} ${key===selected?"bg-[#655bf5] text-white font-bold":""} hover:bg-violet-100`}>{d.getDate()}{count>0&&key!==selected?<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400"/>:null}</button>})}</div></div>
        <div className="bg-white border border-[#ededff] rounded-2xl p-5"><h3 className="font-extrabold mb-4">สมาชิกในทีม</h3><div className="space-y-3">{people.slice(0,5).map(p=><div key={p.id} className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-violet-100 grid place-items-center text-violet-600 font-bold">{(p.full_name||"U").charAt(0)}</div><div className="min-w-0"><div className="text-sm font-bold truncate">{p.full_name}</div><div className="text-xs text-slate-400">ผู้ร่วมทีม</div></div><div className="ml-auto w-2 h-2 rounded-full bg-emerald-400"/></div>)}</div></div>
      </aside>
    </div>

    {showModal&&<TaskModal task={editing} people={people} defaultDate={selected} onClose={()=>{setShowModal(false);setEditing(null)}} onSave={saveTask} onDelete={removeTask}/>}
    {notice&&<div className="fixed bottom-5 right-5 bg-[#252542] text-white px-4 py-3 rounded-xl text-sm shadow-xl">{notice}</div>}
  </>;
}
