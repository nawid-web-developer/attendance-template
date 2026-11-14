import { Router } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";
import { recordAttendance } from "../services/attendance.js";

export const attendanceRouter = Router();

attendanceRouter.get("/recent", async (request, response, next) => {
  try {
    const workspaceId = Number(request.query.workspaceId);
    if (!workspaceId) return response.status(400).json({ message: "workspaceId is required" });
    const [rows] = await pool.query<RowDataPacket[]>("SELECT p.id, p.full_name, p.group_name, p.role, p.qr_code, p.hourly_rate, p.avatar_color, ar.status, ar.method, ar.checked_in_at, ar.checked_out_at, ar.late_minutes, ar.early_leave_minutes, ar.deduction_amount FROM attendance_records ar JOIN people p ON p.id = ar.person_id WHERE ar.workspace_id = ? ORDER BY ar.work_date DESC, COALESCE(ar.checked_out_at, ar.checked_in_at) DESC LIMIT 20", [workspaceId]);
    response.json(rows);
  } catch (error) { next(error); }
});

attendanceRouter.post("/check-in", async (request, response, next) => {
  try { response.status(201).json(await recordAttendance(pool, request.body as Record<string, unknown>)); }
  catch (error) { if (error instanceof Error && (error.message.includes("required") || error.message.includes("found"))) return response.status(400).json({ message: error.message }); next(error); }
});

attendanceRouter.post("/sync", async (request, response, next) => {
  const records = request.body?.records;
  if (!Array.isArray(records) || records.length > 1000) return response.status(400).json({ message: "records must be an array with at most 1000 items" });
  const connection = await pool.getConnection();
  try { await connection.beginTransaction(); for (const record of records) await recordAttendance(connection, record as Record<string, unknown>); await connection.commit(); response.status(201).json({ synced: records.length }); }
  catch (error) { await connection.rollback(); next(error); }
  finally { connection.release(); }
});
