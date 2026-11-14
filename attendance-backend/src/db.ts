import "dotenv/config";
import mysql from "mysql2/promise";
export const pool = mysql.createPool({ host: process.env.MYSQL_HOST ?? "127.0.0.1", port: Number(process.env.MYSQL_PORT ?? 3306), database: process.env.MYSQL_DATABASE ?? "attendance", user: process.env.MYSQL_USER ?? "attendance_app", password: process.env.MYSQL_PASSWORD ?? "attendance_secret", waitForConnections: true, connectionLimit: 10, dateStrings: true });
export async function assertDatabaseConnection() { await pool.query("SELECT 1"); }
