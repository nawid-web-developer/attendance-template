import "dotenv/config";
import { app } from "./app.js";
import { assertDatabaseConnection } from "./db.js";
const port = Number(process.env.PORT ?? 4000);
assertDatabaseConnection().then(() => app.listen(port, () => console.log(`Attendance API listening on http://localhost:${port}`))).catch((error) => { console.error("Could not connect to MySQL", error); process.exit(1); });
