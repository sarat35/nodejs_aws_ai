import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { analyzeLog } from "./services/analyze-log.js";

const maxLogSize = Number(process.env.MAX_LOG_SIZE_BYTES ?? 1_048_576);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxLogSize },
});

export const app = express();

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/analyze-log", upload.single("file"), async (request, response, next) => {
  try {
    if (!request.file) {
      response.status(400).json({ error: "Upload a log using the 'file' form field." });
      return;
    }

    const logContent = request.file.buffer.toString("utf8").trim();
    if (!logContent) {
      response.status(400).json({ error: "The uploaded log file is empty." });
      return;
    }

    const analysis = await analyzeLog(logContent);
    response.json({ analysis });
  } catch (error) {
    next(error);
  }
});

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    response.status(413).json({ error: "The uploaded log exceeds MAX_LOG_SIZE_BYTES." });
    return;
  }

  console.error(error);
  response.status(500).json({ error: "Unable to analyze the log.", detail: error.message });
});

