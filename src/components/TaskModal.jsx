import { useState } from "react";
import { X } from "lucide-react";

export default function TaskModal({
  task,
  people,
  defaultDate,
  onClose,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    task_date: task?.task_date || defaultDate,
    start_time: task?.start_time || "09:00",
    end_time: task?.end_time || "10:00",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    assignee_id: task?.assignee?.id || people[0]?.id || "",
  });

  const update = (key, value) =>
    setForm((old) => ({ ...old, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm grid place-items-center p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (form.title.trim()) onSave(form);
        }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-5 md:p-7 max-h-[95vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-extrabold">
              {task ? "แก้ไขงาน" : "เพิ่มงานใหม่"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              กรอกรายละเอียดงานและผู้รับผิดชอบ
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold">ชื่องาน *</span>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3 outline-none focus:ring-2 focus:ring-violet-200"
              placeholder="เช่น ประชุมทีมประจำสัปดาห์"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold">รายละเอียด</span>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3 min-h-24 outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label>
              <span className="text-xs font-bold">วันที่</span>
              <input
                type="date"
                value={form.task_date}
                onChange={(e) => update("task_date", e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-50 px-2 py-3 text-sm"
              />
            </label>

            <label>
              <span className="text-xs font-bold">เริ่ม</span>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => update("start_time", e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-50 px-2 py-3 text-sm"
              />
            </label>

            <label>
              <span className="text-xs font-bold">สิ้นสุด</span>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => update("end_time", e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-50 px-2 py-3 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-bold">ผู้รับผิดชอบ</span>
            <select
              value={form.assignee_id}
              onChange={(e) => update("assignee_id", e.target.value)}
              className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3"
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.full_name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="text-xs font-bold">สถานะ</span>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3 text-sm"
              >
                <option value="todo">รอดำเนินการ</option>
                <option value="in_progress">กำลังทำ</option>
                <option value="done">เสร็จแล้ว</option>
              </select>
            </label>

            <label>
              <span className="text-xs font-bold">ความสำคัญ</span>
              <select
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-50 px-3 py-3 text-sm"
              >
                <option value="low">ทั่วไป</option>
                <option value="medium">ปานกลาง</option>
                <option value="high">สำคัญมาก</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex justify-between gap-3 mt-7">
          {task ? (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50"
            >
              ลบงาน
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-slate-100 text-sm font-bold"
            >
              ยกเลิก
            </button>
            <button className="px-5 py-3 rounded-xl bg-[#655bf5] text-white text-sm font-bold">
              บันทึกงาน
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
