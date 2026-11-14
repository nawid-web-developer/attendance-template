import { Router } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";

export const settingsRouter = Router();
settingsRouter.get("/work-time", async (request, response, next) => {
  try {
    const workspaceId = Number(request.query.workspaceId);
    if (!workspaceId) return response.status(400).json({ message: "workspaceId is required" });
    const [rows] = await pool.query<RowDataPacket[]>("SELECT workspace_id, TIME_FORMAT(work_start, '%H:%i') AS work_start, TIME_FORMAT(work_end, '%H:%i') AS work_end, grace_minutes FROM work_schedules WHERE workspace_id = ?", [workspaceId]);
    response.json(rows[0] ?? { workspace_id: workspaceId, work_start: "09:00", work_end: "17:00", grace_minutes: 0 });
  } catch (error) { next(error); }
});

settingsRouter.put("/work-time", async (request, response, next) => {
  try {
    const workspaceId = Number(request.body.workspaceId);
    const workStart = String(request.body.workStart ?? "");
    const workEnd = String(request.body.workEnd ?? "");
    const graceMinutes = Number(request.body.graceMinutes ?? 0);
    if (!workspaceId || !/^\d{2}:\d{2}$/.test(workStart) || !/^\d{2}:\d{2}$/.test(workEnd) || graceMinutes < 0 || graceMinutes > 240) return response.status(400).json({ message: "A valid start time, end time, and grace period are required" });
    await pool.execute("INSERT INTO work_schedules (workspace_id, work_start, work_end, grace_minutes) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE work_start = VALUES(work_start), work_end = VALUES(work_end), grace_minutes = VALUES(grace_minutes)", [workspaceId, `${workStart}:00`, `${workEnd}:00`, graceMinutes]);
    response.json({ workspaceId, workStart, workEnd, graceMinutes });
  } catch (error) { next(error); }
});
