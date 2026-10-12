import { existsSync } from "node:fs";
import path from "node:path";
import express from "express";
import { app } from "./app";

const PORT = Number(process.env.PORT ?? 3001);

// In production, serve the built web app from the same server.
const dist = path.resolve(import.meta.dirname, "../dist");
if (process.env.NODE_ENV === "production" && existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
