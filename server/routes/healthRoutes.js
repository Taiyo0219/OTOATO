import { Router } from "express";
import { getDatabaseStatus } from "../config/database.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "otoato-api",
    database: getDatabaseStatus()
  });
});

export default router;
