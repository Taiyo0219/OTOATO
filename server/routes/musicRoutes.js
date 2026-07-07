import { Router } from "express";
import { searchMusicController } from "../controllers/musicController.js";

const router = Router();

router.get("/search", searchMusicController);

export default router;
