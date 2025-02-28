import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getAll, takecards } from "./controllers/controllers.js";
import value from "./controllers/somma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// middleware
app.use(json());
app.use(cors());

// -----------
app.post("/", takecards);
app.post("/dc", value);
app.get("/", getAll);

// LISTEN
app.listen(PORT, () => {
  console.log(`server in ascolto su http://localhost:${PORT}`);
});
