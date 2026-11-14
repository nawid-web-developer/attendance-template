import { RowDataPacket } from "mysql2";
import type { Pool, PoolConnection } from "mysql2/promise";

export type DbExecutor = Pool | PoolConnection;
type PersonRow = RowDataPacket & { id: number; full_name: string; hourly_rate: number; qr_code: string };
type ScheduleRow = RowDataPacket & { work_start: string; work_end: string; grace_minutes: number };
type RecordRow = RowDataPacket & { late_minutes: number; early_leave_minutes: number };

function minutesFromTime(value: string) { const [hour, minute] = String(value).split(":").map(Number); return hour * 60 + minute; }
function minutesFromDate(value: Date) { return value.getHours() * 60 + value.getMinutes(); }
function dateKey(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`; }

export async function recordAttendance(connection: DbExecutor, input: Record<string, unknown>) {
  const workspaceId = Number(input.workspaceId);
  const personId = input.personId ? Number(input.personId) : 0;
  const qrCode = String(input.qrCode ?? "");
  const deviceId = String(input.deviceId ?? "");
  const action = String(input.action ?? "in");
  const method = String(input.method ?? "qr");
  const occurredAt = input.checkedInAt ? new Date(String(input.checkedInAt)) : new Date();
  if (!workspaceId || (!personId && !qrCode) || !deviceId || !["in", "out"].includes(action) || Number.isNaN(occurredAt.valueOf())) throw new Error("workspaceId, personId or qrCode, deviceId, action, and a valid timestamp are required");

  const [people] = await connection.query<PersonRow[]>("SELECT id, full_name, hourly_rate, qr_code FROM people WHERE workspace_id = ? AND active = 1 AND (id = ? OR qr_code = ?) LIMIT 1", [workspaceId, personId || 0, qrCode]);
  const person = people[0];
  if (!person) throw new Error("Employee was not found in this workspace");
  const [schedules] = await connection.query<ScheduleRow[]>("SELECT work_start, work_end, grace_minutes FROM work_schedules WHERE workspace_id = ?", [workspaceId]);
  const schedule = schedules[0] ?? { work_start: "09:00:00", work_end: "17:00:00", grace_minutes: 0 };
  const workDate = dateKey(occurredAt);
  const [existingRows] = await connection.query<RecordRow[]>("SELECT late_minutes, early_leave_minutes FROM attendance_records WHERE workspace_id = ? AND person_id = ? AND work_date = ?", [workspaceId, person.id, workDate]);
  const existing = existingRows[0];
  const lateMinutes = action === "in" ? Math.max(0, minutesFromDate(occurredAt) - minutesFromTime(schedule.work_start) - Number(schedule.grace_minutes)) : Number(existing?.late_minutes ?? 0);
  const earlyLeaveMinutes = action === "out" ? Math.max(0, minutesFromTime(schedule.work_end) - minutesFromDate(occurredAt)) : Number(existing?.early_leave_minutes ?? 0);
  const deductionAmount = Number(((lateMinutes + earlyLeaveMinutes) * Number(person.hourly_rate) / 60).toFixed(2));
  const status = lateMinutes > 0 ? "late" : "present";

  if (existing) {
    await connection.execute("UPDATE attendance_records SET device_id = ?, method = ?, status = ?, checked_in_at = COALESCE(?, checked_in_at), checked_out_at = COALESCE(?, checked_out_at), late_minutes = ?, early_leave_minutes = ?, deduction_amount = ? WHERE workspace_id = ? AND person_id = ? AND work_date = ?", [deviceId, method, status, action === "in" ? occurredAt : null, action === "out" ? occurredAt : null, lateMinutes, earlyLeaveMinutes, deductionAmount, workspaceId, person.id, workDate]);
  } else {
    await connection.execute("INSERT INTO attendance_records (workspace_id, person_id, work_date, device_id, status, method, checked_in_at, checked_out_at, late_minutes, early_leave_minutes, deduction_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [workspaceId, person.id, workDate, deviceId, status, method, action === "in" ? occurredAt : null, action === "out" ? occurredAt : null, lateMinutes, earlyLeaveMinutes, deductionAmount]);
  }
  return { personId: person.id, personName: person.full_name, action, lateMinutes, earlyLeaveMinutes, deductionAmount, hourlyRate: Number(person.hourly_rate), workDate };
}
