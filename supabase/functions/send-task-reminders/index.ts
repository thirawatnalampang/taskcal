import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // =========================
    // Security
    // =========================

    const cronSecret = Deno.env.get("CRON_SECRET");

    if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // =========================
    // Environment
    // =========================

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const emailFrom =
      Deno.env.get("EMAIL_FROM") ||
      "TaskCal <onboarding@resend.dev>";

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
    );

    const resend = new Resend(resendApiKey);

    // =========================
    // Current time
    // =========================

    const now = new Date();

    const dateFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const timeFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const today = dateFormatter.format(now);
    const currentTime = timeFormatter.format(now);

    const target = new Date(
      now.getTime() + 30 * 60 * 1000,
    );

    const targetTime = timeFormatter.format(target);

    // =========================
    // Get today's tasks
    // =========================

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        task_date,
        start_time,
        end_time,
        status,
        priority,
        reminder_sent_at,
        assignee:profiles!tasks_assignee_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq("task_date", today)
      .is("reminder_sent_at", null)
      .neq("status", "done");

    if (error) {
      throw error;
    }

    // =========================
    // Find tasks within 30 min
    // =========================

    const candidates = (tasks || []).filter((task) => {
      if (!task.start_time) return false;

      const taskStart = new Date(
        `${task.task_date}T${task.start_time}+07:00`,
      );

      const diffMs =
        taskStart.getTime() - now.getTime();

      const diffMinutes =
        diffMs / 60000;

      return (
        diffMinutes > 0 &&
        diffMinutes <= 30
      );
    });

    let sent = 0;
    let failed = 0;

    // =========================
    // Send emails
    // =========================

    for (const task of candidates) {
      const recipient = task.assignee?.email;

      if (!recipient) {
        failed++;

        console.error(
          `Task ${task.id} has no recipient email`,
        );

        continue;
      }

      // -------------------------
      // Format priority
      // -------------------------

      const priorityText =
        task.priority === "high"
          ? "ด่วน"
          : task.priority === "medium"
          ? "ปานกลาง"
          : "ต่ำ";

      const priorityBg =
        task.priority === "high"
          ? "#fef2f2"
          : task.priority === "medium"
          ? "#fff7ed"
          : "#f0fdf4";

      const priorityColor =
        task.priority === "high"
          ? "#dc2626"
          : task.priority === "medium"
          ? "#ea580c"
          : "#16a34a";

      // -------------------------
      // Format status
      // -------------------------

      const statusText =
        task.status === "todo"
          ? "รอดำเนินการ"
          : task.status === "in_progress"
          ? "กำลังดำเนินการ"
          : task.status === "done"
          ? "เสร็จแล้ว"
          : task.status;

      // -------------------------
      // Send
      // -------------------------

      const result = await resend.emails.send({
        from: emailFrom,
        to: recipient,

        subject: `แจ้งเตือนงาน: ${task.title}`,

        html: `
<!DOCTYPE html>
<html lang="th">

<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>TaskCal Reminder</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f6fb;
  font-family:Arial,'Noto Sans Thai',Tahoma,sans-serif;
  color:#1f2937;
">

  <div style="
    width:100%;
    padding:40px 16px;
    box-sizing:border-box;
  ">

    <div style="
      max-width:600px;
      margin:0 auto;
      background:#ffffff;
      border-radius:18px;
      overflow:hidden;
      border:1px solid #e8e9f3;
      box-shadow:0 8px 30px rgba(31,41,55,0.06);
    ">

      <!-- HEADER -->

      <div style="
        background:#655bf5;
        padding:28px 32px;
        color:#ffffff;
      ">

        <div style="
          font-size:23px;
          font-weight:800;
          letter-spacing:-0.3px;
        ">
          TaskCal
        </div>

        <div style="
          margin-top:6px;
          font-size:14px;
          opacity:0.9;
        ">
          แจ้งเตือนตารางงาน
        </div>

      </div>


      <!-- CONTENT -->

      <div style="
        padding:32px;
      ">

        <div style="
          font-size:14px;
          color:#6b7280;
          margin-bottom:8px;
        ">
          สวัสดี ${task.assignee?.full_name || "ผู้ใช้งาน"},
        </div>


        <div style="
          font-size:24px;
          line-height:1.4;
          font-weight:800;
          color:#111827;
          margin-bottom:8px;
        ">
          งานของคุณกำลังจะเริ่ม
        </div>


        <div style="
          font-size:14px;
          color:#6b7280;
          margin-bottom:26px;
        ">
          เหลือเวลาอีกประมาณ
          <strong style="
            color:#655bf5;
          ">
            30 นาที
          </strong>
        </div>


        <!-- TASK CARD -->

        <div style="
          border:1px solid #e8e9f3;
          border-radius:14px;
          padding:22px;
          background:#fafaff;
        ">

          <!-- TITLE -->

          <div style="
            font-size:20px;
            font-weight:800;
            color:#111827;
            line-height:1.4;
            margin-bottom:8px;
          ">
            ${task.title}
          </div>


          <!-- DESCRIPTION -->

          ${
            task.description
              ? `
          <div style="
            font-size:14px;
            color:#6b7280;
            line-height:1.7;
            margin-bottom:20px;
          ">
            ${task.description}
          </div>
          `
              : ""
          }


          <!-- DATE -->

          <div style="
            padding:13px 0;
            border-top:1px solid #eeeeF5;
          ">

            <div style="
              font-size:11px;
              color:#9ca3af;
              margin-bottom:4px;
            ">
              วันที่
            </div>

            <div style="
              font-size:15px;
              font-weight:700;
              color:#374151;
            ">
              ${task.task_date}
            </div>

          </div>


          <!-- TIME -->

          <div style="
            padding:13px 0;
            border-top:1px solid #eeeeF5;
          ">

            <div style="
              font-size:11px;
              color:#9ca3af;
              margin-bottom:4px;
            ">
              เวลา
            </div>

            <div style="
              font-size:18px;
              font-weight:800;
              color:#655bf5;
            ">
              ${task.start_time}
              ${
                task.end_time
                  ? ` - ${task.end_time}`
                  : ""
              }
            </div>

          </div>


          <!-- STATUS + PRIORITY -->

          <div style="
            padding-top:14px;
            border-top:1px solid #eeeeF5;
          ">

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
            >

              <tr>

                <td
                  width="50%"
                  valign="top"
                >

                  <div style="
                    font-size:11px;
                    color:#9ca3af;
                    margin-bottom:6px;
                  ">
                    สถานะ
                  </div>

                  <span style="
                    display:inline-block;
                    padding:6px 10px;
                    border-radius:7px;
                    background:#f3f4f6;
                    color:#374151;
                    font-size:12px;
                    font-weight:700;
                  ">
                    ${statusText}
                  </span>

                </td>


                <td
                  width="50%"
                  valign="top"
                >

                  <div style="
                    font-size:11px;
                    color:#9ca3af;
                    margin-bottom:6px;
                  ">
                    ความสำคัญ
                  </div>

                  <span style="
                    display:inline-block;
                    padding:6px 10px;
                    border-radius:7px;
                    background:${priorityBg};
                    color:${priorityColor};
                    font-size:12px;
                    font-weight:700;
                  ">
                    ${priorityText}
                  </span>

                </td>

              </tr>

            </table>

          </div>

        </div>


        <!-- REMINDER -->

        <div style="
          margin-top:20px;
          padding:14px 16px;
          border-radius:10px;
          background:#f5f3ff;
          border:1px solid #e9e5ff;
          color:#5b21b6;
          font-size:13px;
          line-height:1.6;
        ">

          งานนี้กำลังจะเริ่มในอีกประมาณ
          <strong>30 นาที</strong>
          กรุณาเตรียมตัวให้พร้อม

        </div>


        <!-- FOOTER -->

        <div style="
          margin-top:28px;
          padding-top:20px;
          border-top:1px solid #eeeeF5;
          text-align:center;
          color:#9ca3af;
          font-size:12px;
          line-height:1.6;
        ">

          อีเมลนี้ส่งโดยระบบอัตโนมัติของ
          <strong style="color:#655bf5;">
            TaskCal
          </strong>

          <br />

          กรุณาอย่าตอบกลับอีเมลฉบับนี้

        </div>

      </div>

    </div>

  </div>

</body>
</html>
        `,
      });

      // =========================
      // Resend result
      // =========================

      if (result.error) {
        failed++;

        console.error(
          "Resend error:",
          result.error,
        );

        continue;
      }

      sent++;

      // =========================
      // Mark as sent
      // =========================

      const { error: updateError } =
        await supabase
          .from("tasks")
          .update({
            reminder_sent_at:
              new Date().toISOString(),
          })
          .eq("id", task.id)
          .is("reminder_sent_at", null);

      if (updateError) {
        console.error(
          "Failed to update reminder_sent_at:",
          updateError,
        );
      }
    }

    // =========================
    // Response
    // =========================

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        currentTime,
        targetTime,
        found: candidates.length,
        sent,
        failed,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );

  } catch (error) {

    console.error(
      "Function error:",
      error,
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
})