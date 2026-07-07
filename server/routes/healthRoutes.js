import { Router } from "express";
import { getDatabaseStatus } from "../config/database.js";
import { getMusicProviderStatus } from "../services/music/youtubeProvider.js";

const router = Router();

router.get("/", (req, res) => {
  const database = getDatabaseStatus();

  res.json({
    ok: true,
    server: "ok",
    service: "otoato-api",
    mongodb: database.state,
    database,
    musicProvider: getMusicProviderStatus()
  });
});

export default router;
