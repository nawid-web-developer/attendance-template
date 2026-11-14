import { Router } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../db.js";
export const workspacesRouter = Router();
workspacesRouter.get("/", async (_request, response, next) => { try { const [rows] = await pool.query<RowDataPacket[]>("SELECT id, name, type, timezone FROM workspaces WHERE active = 1 ORDER BY id"); response.json(rows); } catch (error) { next(error); } });
