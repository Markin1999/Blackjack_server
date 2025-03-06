import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getAll,
  takecards,
  value,
  deleteFunction,
  takeMoves,
} from "./controllers/controllers.js";

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
app.delete("/:id", deleteFunction);
app.post("/moves", takeMoves);

// LISTEN
app.listen(PORT, () => {
  console.log(`server in ascolto su http://localhost:${PORT}`);
});
