import { Router } from "express";
import QRCode from "qrcode";
import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";
export const peopleRouter = Router();
peopleRouter.get("/:id/qr", async (request, response, next) => { try { const [rows] = await pool.query<RowDataPacket[]>("SELECT qr_code FROM people WHERE id = ? AND active = 1", [Number(request.params.id)]); if (!rows[0]) return response.status(404).json({ message: "Employee not found" }); const png = await QRCode.toBuffer(String(rows[0].qr_code), { margin: 2, width: 420 }); response.type("png").send(png); } catch (error) { next(error); } });
peopleRouter.get("/", async (request, response, next) => { try { const workspaceId = Number(request.query.workspaceId); if (!workspaceId) return response.status(400).json({ message: "workspaceId is required" }); const [rows] = await pool.query<RowDataPacket[]>("SELECT id, full_name, group_name, role, qr_code, hourly_rate, avatar_color FROM people WHERE workspace_id = ? AND active = 1 ORDER BY full_name", [workspaceId]); response.json(rows); } catch (error) { next(error); } });
