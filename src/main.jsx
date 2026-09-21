import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './lib/supabase'
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, FileText, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, Users, X, Bell, MoreHorizontal, CircleUserRound } from 'lucide-react'
import './index.css'

const demoPeople = [
  { id: 'demo-1', full_name: 'สมชาย ใจดี', avatar_url: 'https://i.pravatar.cc/100?img=12' },
  { id: 'demo-2', full_name: 'มานะ รุ่งเรือง', avatar_url: 'https://i.pravatar.cc/100?img=33' },
  { id: 'demo-3', full_name: 'สมหญิง พัฒนา', avatar_url: 'https://i.pravatar.cc/100?img=47' },
]
const demoTasks = [
  { id:'1', title:'ตรวจสอบเอกสารลูกค้าและอัปเดตข้อมูล', description:'ตรวจสอบเอกสารที่เข้ามาใหม่ให้ครบถ้วน', task_date:new Date().toISOString().slice(0,10), start_time:'09:00', end_time:'10:30', status:'in_progress', priority:'high', assignee:demoPeople[0] },
  { id:'2', title:'ประชุมทีมโปรเจกต์ (Sprint Sync)', description:'สรุปงานที่ทำไปและวางแผนงานรอบถัดไป', task_date:new Date().toISOString().slice(0,10), start_time:'11:00', end_time:'12:00', status:'todo', priority:'medium', assignee:demoPeople[1] },
  { id:'3', title:'อัปเดตข้อมูลและตรวจสอบสิทธิ์ในระบบ ERP', description:'ตรวจสอบข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง', task_date:new Date().toISOString().slice(0,10), start_time:'13:30', end_time:'14:30', status:'todo', priority:'low', assignee:demoPeople[2] },
  { id:'4', title:'สรุปรายงานและส่งต่อให้ทีม', description:'สรุปผลการทำงานประจำวัน', task_date:new Date().toISOString().slice(0,10), start_time:'15:00', end_time:'16:00', status:'done', priority:'medium', assignee:demoPeople[0] },
]

const thMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const thDays = ['อา','จ','อ','พ','พฤ','ศ','ส']
const pad = n => String(n).padStart(2,'0')
const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
const thaiDate = value => new Date(`${value}T00:00:00`).toLocaleDateString('th-TH',{day:'numeric',month:'long',year:'numeric'})
const avatar = p => p?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p?.full_name || 'U')}&background=635bff&color=fff`

function App(){
  const today = new Date(); today.setHours(0,0,0,0)
  const [user,setUser] = useState(null)
  const [sessionLoading,setSessionLoading] = useState(true)
  const [active,setActive] = useState('calendar')
  const [month,setMonth] = useState(new Date(today.getFullYear(),today.getMonth(),1))
  const [selected,setSelected] = useState(dateKey(today))
  const [tasks,setTasks] = useState([])
  const [people,setPeople] = useState(demoPeople)
  const [query,setQuery] = useState('')
  const [showModal,setShowModal] = useState(false)
  const [editing,setEditing] = useState(null)
  const [notice,setNotice] = useState('')

  useEffect(()=>{
    if(!supabase){ setUser({id:'demo-user',email:'demo@taskcal.local',user_metadata:{full_name:'ผู้ใช้งานตัวอย่าง'}}); setTasks(demoTasks); setSessionLoading(false); return }
    supabase.auth.getSession().then(({data})=>{setUser(data.session?.user || null);setSessionLoading(false)})
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null))
    return ()=>subscription.unsubscribe()
  },[])
  useEffect(()=>{ if(user && supabase) loadData() },[user])
  async function loadData(){
    const [{data:profiles},{data:rows}] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('tasks').select('*, assignee:profiles!tasks_assignee_id_fkey(id,full_name,avatar_url)').order('start_time')
    ])
    if(profiles?.length) setPeople(profiles)
    if(rows) setTasks(rows)
  }
  const visibleTasks = useMemo(()=>tasks.filter(t=>(!query || `${t.title} ${t.description||''} ${t.assignee?.full_name||''}`.toLowerCase().includes(query.toLowerCase()))),[tasks,query])
  const selectedTasks = visibleTasks.filter(t=>t.task_date===selected).sort((a,b)=>(a.start_time||'').localeCompare(b.start_time||''))
  const calendarCells = useMemo(()=>{
    const first = new Date(month.getFullYear(),month.getMonth(),1)
    const start = new Date(first); start.setDate(1-first.getDay())
    return Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d})
  },[month])
  const stats = { total:visibleTasks.filter(t=>t.task_date===selected).length, done:visibleTasks.filter(t=>t.task_date===selected&&t.status==='done').length, pending:visibleTasks.filter(t=>t.task_date===selected&&t.status!=='done').length }

  async function saveTask(form){
    const assignee = people.find(p=>p.id===form.assignee_id) || demoPeople[0]
    const local = {...form,id:editing?.id||crypto.randomUUID(),assignee}
    setTasks(old=>editing?old.map(t=>t.id===editing.id?local:t):[...old,local])
    setShowModal(false); setEditing(null); setNotice('บันทึกงานเรียบร้อยแล้ว'); setTimeout(()=>setNotice(''),2500)
    if(supabase){
      const payload={title:form.title,description:form.description,task_date:form.task_date,start_time:form.start_time,end_time:form.end_time,status:form.status,priority:form.priority,assignee_id:form.assignee_id,created_by:user.id}
      const result=editing?await supabase.from('tasks').update(payload).eq('id',editing.id):await supabase.from('tasks').insert(payload)
      if(result.error) setNotice(`บันทึกไม่สำเร็จ: ${result.error.message}`)
      else loadData()
    }
  }
  async function removeTask(id){
    setTasks(old=>old.filter(t=>t.id!==id)); setShowModal(false); setEditing(null)
    if(supabase) await supabase.from('tasks').delete().eq('id',id)
  }
  async function signOut(){ if(supabase) await supabase.auth.signOut(); else setUser(null) }

  if(sessionLoading) return <div className="min-h-screen grid place-items-center text-violet-600">กำลังโหลด TaskCal...</div>
  if(!user) return <AuthScreen onDemo={()=>{setUser({id:'demo-user',email:'demo@taskcal.local',user_metadata:{full_name:'ผู้ใช้งานตัวอย่าง'}});setTasks(demoTasks)}} />

  return <div className="min-h-screen bg-[#f7f8ff] text-[#252542] flex">
    <aside className="hidden md:flex w-[236px] shrink-0 bg-white border-r border-[#ececff] flex-col p-4">
      <div className="flex items-center gap-2 px-2 py-3 mb-6"><div className="w-9 h-9 rounded-xl bg-[#665cf6] grid place-items-center text-white"><CalendarDays size={21}/></div><div><div className="font-extrabold text-lg leading-5">TaskCal</div><div className="text-[10px] text-violet-500 font-semibold">TEAM & TASKS</div></div></div>
      <nav className="space-y-2">{[["calendar",CalendarDays,'ปฏิทินงาน'],['dashboard',LayoutDashboard,'ภาพรวม'],['people',Users,'สมาชิก'],['reports',FileText,'รายงาน'],['settings',Settings,'ตั้งค่า']].map(([id,Icon,label])=><button key={id} onClick={()=>setActive(id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition ${active===id?'bg-[#655bf5] text-white shadow-lg shadow-violet-100':'text-slate-500 hover:bg-violet-50'}`}><Icon size={17}/>{label}</button>)}</nav>
      <div className="mt-auto rounded-2xl bg-[#f3f2ff] p-3 text-xs text-slate-500"><div className="font-bold text-violet-700 mb-1">TaskCal Pro</div>จัดการงานของทีมให้เป็นระบบในที่เดียว</div>
      <button onClick={signOut} className="flex items-center gap-2 text-sm text-slate-500 px-3 py-4"><LogOut size={16}/> ออกจากระบบ</button>
    </aside>
    <main className="flex-1 min-w-0">
      <header className="h-[76px] bg-white border-b border-[#ececff] flex items-center justify-between px-4 md:px-8 gap-4"><div className="flex items-center gap-3"><button className="md:hidden p-2 rounded-lg bg-violet-50"><Menu size={18}/></button><div className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหางาน หรือชื่อสมาชิก..." className="w-[210px] md:w-[330px] bg-[#f7f7ff] rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"/></div></div><div className="flex items-center gap-3"><button className="p-2 rounded-xl hover:bg-violet-50"><Bell size={18} className="text-slate-500"/></button><div className="hidden sm:block text-right"><div className="text-xs text-slate-400">ยินดีต้อนรับ</div><div className="text-sm font-bold">{user.user_metadata?.full_name||user.email}</div></div><img src={avatar({full_name:user.user_metadata?.full_name,avatar_url:user.user_metadata?.avatar_url})} className="w-10 h-10 rounded-full object-cover"/></div></header>
      <div className="p-4 md:p-8 max-w-[1500px] mx-auto">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6"><div><div className="text-sm text-violet-500 font-bold mb-2">Workspace / ปฏิทินงาน</div><h1 className="text-2xl md:text-3xl font-extrabold">ตารางงานประจำวัน <span className="text-emerald-500 text-sm align-middle">● ออนไลน์</span></h1><p className="text-sm text-slate-400 mt-2">{thaiDate(selected)} · สรุปงานและผู้รับผิดชอบของทีม</p></div><button onClick={()=>{setEditing(null);setShowModal(true)}} className="flex items-center gap-2 bg-[#655bf5] text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg shadow-violet-200 hover:bg-violet-700"><Plus size={17}/> เพิ่มงานใหม่</button></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">{[["งานทั้งหมด",stats.total,CalendarDays],["เสร็จแล้ว",stats.done,CheckCircle2],["กำลังดำเนินการ",stats.pending,Clock3]].map(([label,num,Icon],i)=><div key={label} className="bg-white rounded-2xl p-5 border border-[#ededff] flex items-center justify-between"><div><div className="text-xs text-slate-400 mb-2">{label}</div><div className="text-3xl font-extrabold">{num}<span className="text-sm font-medium text-slate-400 ml-1">งาน</span></div></div><div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-500 grid place-items-center"><Icon size={20}/></div></div>)}</div>
        {active==='calendar'?<div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_330px] gap-5">
          <section className="bg-white border border-[#ededff] rounded-2xl p-4 md:p-6 min-w-0"><div className="flex flex-wrap items-center justify-between gap-3 mb-5"><div><h2 className="font-extrabold text-lg">ไทม์ไลน์วันนี้</h2><p className="text-xs text-slate-400 mt-1">เวลา 08:00 - 18:00 น.</p></div><div className="flex gap-2"><button onClick={()=>setSelected(dateKey(today))} className="px-3 py-2 text-xs rounded-lg bg-violet-50 text-violet-600 font-bold">วันนี้</button><button onClick={()=>{setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}} className="p-2 rounded-lg border border-slate-100"><ChevronLeft size={16}/></button><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} className="p-2 rounded-lg border border-slate-100"><ChevronRight size={16}/></button></div></div><div className="space-y-3">{selectedTasks.length?selectedTasks.map(t=><TaskCard key={t.id} task={t} onEdit={()=>{setEditing(t);setShowModal(true)}}/>):<div className="py-16 text-center text-slate-400 text-sm">วันนี้ยังไม่มีงาน 🎉</div>}</div></section>
          <aside className="space-y-5"><div className="bg-white border border-[#ededff] rounded-2xl p-5"><div className="flex justify-between items-center mb-4"><h3 className="font-extrabold">{thMonths[month.getMonth()]} {month.getFullYear()+543}</h3><div className="flex gap-1"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} className="p-1"><ChevronLeft size={16}/></button><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} className="p-1"><ChevronRight size={16}/></button></div></div><div className="grid grid-cols-7 text-center text-[11px] text-slate-400 mb-2">{thDays.map(d=><div key={d} className="py-2">{d}</div>)}</div><div className="grid grid-cols-7 gap-y-1 text-center">{calendarCells.map(d=>{const key=dateKey(d);const count=tasks.filter(t=>t.task_date===key).length;return <button key={key} onClick={()=>setSelected(key)} className={`relative h-9 rounded-lg text-xs ${d.getMonth()!==month.getMonth()?'text-slate-300':'text-slate-600'} ${key===selected?'bg-[#655bf5] text-white font-bold':''} hover:bg-violet-100`}>{d.getDate()}{count>0&&key!==selected?<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400"/>:null}</button>})}</div></div><div className="bg-white border border-[#ededff] rounded-2xl p-5"><h3 className="font-extrabold mb-4">สมาชิกในทีม</h3><div className="space-y-3">{people.slice(0,5).map(p=><div key={p.id} className="flex items-center gap-3"><img src={avatar(p)} className="w-9 h-9 rounded-full object-cover"/><div className="min-w-0"><div className="text-sm font-bold truncate">{p.full_name}</div><div className="text-xs text-slate-400">ผู้ร่วมทีม</div></div><div className="ml-auto w-2 h-2 rounded-full bg-emerald-400"/></div>)}</div></div></aside>
        </div>:<div className="bg-white rounded-2xl p-8 border border-[#ededff]"><h2 className="text-xl font-extrabold mb-4">{active==='people'?'สมาชิกในทีม':active==='reports'?'รายงานงาน':active==='settings'?'ตั้งค่า':'ภาพรวม'}</h2><p className="text-slate-500 text-sm">หน้านี้เตรียมโครงสร้างไว้แล้ว สามารถต่อยอดได้จากฐานข้อมูล Supabase</p></div>}
      </div>
    </main>
    {showModal&&<TaskModal task={editing} people={people} defaultDate={selected} onClose={()=>{setShowModal(false);setEditing(null)}} onSave={saveTask} onDelete={removeTask}/>} {notice&&<div className="fixed bottom-5 right-5 bg-[#252542] text-white px-4 py-3 rounded-xl text-sm shadow-xl">{notice}</div>}
  </div>
}

function TaskCard({task,onEdit}){const status={done:['เสร็จแล้ว','bg-emerald-50 text-emerald-600'],in_progress:['กำลังทำ','bg-violet-50 text-violet-600'],todo:['รอดำเนินการ','bg-amber-50 text-amber-600']}[task.status]||['รอดำเนินการ','bg-slate-50 text-slate-600'];return <div className="group border border-slate-100 rounded-xl p-4 hover:border-violet-200 hover:shadow-md transition flex gap-4"><div className="w-[58px] shrink-0 text-center pt-1"><div className="text-sm font-extrabold">{task.start_time||'--:--'}</div><div className="text-[10px] text-slate-400 mt-1">{task.end_time?`ถึง ${task.end_time}`:''}</div></div><div className="w-1 rounded-full bg-violet-400 shrink-0"/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2 mb-2"><span className={`text-[10px] px-2 py-1 rounded-md font-bold ${status[1]}`}>{status[0]}</span><span className="text-[10px] text-slate-400">{task.priority==='high'?'สำคัญมาก':task.priority==='medium'?'ปานกลาง':'ทั่วไป'}</span></div><h3 className="font-extrabold text-sm md:text-base">{task.title}</h3><p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description||'ไม่มีรายละเอียดเพิ่มเติม'}</p><div className="flex items-center gap-2 mt-3"><img src={avatar(task.assignee)} className="w-6 h-6 rounded-full object-cover"/><span className="text-xs font-semibold text-slate-500">{task.assignee?.full_name||'ยังไม่ระบุผู้รับผิดชอบ'}</span></div></div><button onClick={onEdit} className="self-start p-1 rounded-lg text-slate-300 hover:text-violet-600 hover:bg-violet-50"><MoreHorizontal size={18}/></button></div>}

function TaskModal({task,people,defaultDate,onClose,onSave,onDelete}){const [form,setForm]=useState({title:task?.title||'',description:task?.description||'',task_date:task?.task_date||defaultDate,start_time:task?.start_time||'09:00',end_time:task?.end_time||'10:00',status:task?.status||'todo',priority:task?.priority||'medium',assignee_id:task?.assignee?.id||people[0]?.id||''});const update=(k,v)=>setForm(f=>({...f,[k]:v}));return <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm grid place-items-center p-4"><form onSubmit={e=>{e.preventDefault();if(form.title.trim())onSave(form)}} className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-5 md:p-7 max-h-[95vh] overflow-y-auto scrollbar"><div className="flex justify-between items-center mb-5"><div><h2 className="text-xl font-extrabold">{task?'แก้ไขงาน':'เพิ่มงานใหม่'}</h2><p className="text-xs text-slate-400 mt-1">กรอกรายละเอียดงานและผู้รับผิดชอบ</p></div><button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-50"><X size={18}/></button></div><div className="space-y-4"><label className="block"><span className="text-sm font-bold">ชื่องาน *</span><input required value={form.title} onChange={e=>update('title',e.target.value)} className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3 outline-none focus:ring-2 focus:ring-violet-200" placeholder="เช่น ประชุมทีมประจำสัปดาห์"/></label><label className="block"><span className="text-sm font-bold">รายละเอียด</span><textarea value={form.description} onChange={e=>update('description',e.target.value)} className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3 min-h-24 outline-none focus:ring-2 focus:ring-violet-200"/></label><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><label><span className="text-xs font-bold">วันที่</span><input type="date" value={form.task_date} onChange={e=>update('task_date',e.target.value)} className="mt-2 w-full rounded-xl bg-slate-50 px-2 py-3 text-sm"/></label><label><span className="text-xs font-bold">เริ่ม</span><input type="time" value={form.start_time} onChange={e=>update('start_time',e.target.value)} className="mt-2 w-full rounded-xl bg-slate-50 px-2 py-3 text-sm"/></label><label><span className="text-xs font-bold">สิ้นสุด</span><input type="time" value={form.end_time} onChange={e=>update('end_time',e.target.value)} className="mt-2 w-full rounded-xl bg-slate-50 px-2 py-3 text-sm"/></label></div><label className="block"><span className="text-sm font-bold">ผู้รับผิดชอบ</span><select value={form.assignee_id} onChange={e=>update('assignee_id',e.target.value)} className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3">{people.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label><span className="text-xs font-bold">สถานะ</span><select value={form.status} onChange={e=>update('status',e.target.value)} className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3 text-sm"><option value="todo">รอดำเนินการ</option><option value="in_progress">กำลังทำ</option><option value="done">เสร็จแล้ว</option></select></label><label><span className="text-xs font-bold">ความสำคัญ</span><select value={form.priority} onChange={e=>update('priority',e.target.value)} className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3 text-sm"><option value="low">ทั่วไป</option><option value="medium">ปานกลาง</option><option value="high">สำคัญมาก</option></select></label></div></div><div className="flex justify-between gap-3 mt-7">{task?<button type="button" onClick={()=>onDelete(task.id)} className="px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50">ลบงาน</button>:<div/>}<div className="flex gap-2"><button type="button" onClick={onClose} className="px-4 py-3 rounded-xl bg-slate-100 text-sm font-bold">ยกเลิก</button><button className="px-5 py-3 rounded-xl bg-[#655bf5] text-white text-sm font-bold">บันทึกงาน</button></div></div></form></div>}

function AuthScreen({onDemo}){const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');async function login(e){e.preventDefault();if(!supabase){onDemo();return}const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message)}return <div className="min-h-screen bg-[#f7f8ff] grid place-items-center p-4"><div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-xl border border-violet-100"><div className="flex items-center gap-2 mb-8"><div className="w-10 h-10 rounded-xl bg-[#655bf5] grid place-items-center text-white"><CalendarDays/></div><div className="text-2xl font-extrabold">TaskCal</div></div><h1 className="text-2xl font-extrabold mb-2">เข้าสู่ระบบ</h1><p className="text-sm text-slate-400 mb-6">จัดการงานของคุณและทีมได้ในที่เดียว</p><form onSubmit={login} className="space-y-4"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="อีเมล" className="w-full rounded-xl bg-slate-50 px-4 py-3 outline-none"/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="รหัสผ่าน" className="w-full rounded-xl bg-slate-50 px-4 py-3 outline-none"/>{error&&<p className="text-sm text-red-500">{error}</p>}<button className="w-full py-3 rounded-xl bg-[#655bf5] text-white font-bold">เข้าสู่ระบบ</button></form><button onClick={onDemo} className="w-full mt-3 py-3 rounded-xl border border-violet-200 text-violet-600 font-bold text-sm">ทดลองใช้งานตัวอย่าง</button></div></div>}

createRoot(document.getElementById('root')).render(<App />)
