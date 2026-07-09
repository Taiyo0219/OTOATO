import { Router } from "express";
import { createPost, getArchivePosts, getMyPosts, getNearbyPosts, getPostById } from "../controllers/postsController.js";
import { attachOptionalUser, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", requireAuth, createPost);
router.get("/nearby", attachOptionalUser, getNearbyPosts);
router.get("/archive", attachOptionalUser, getArchivePosts);
router.get("/mine", requireAuth, getMyPosts);
router.get("/:id", attachOptionalUser, getPostById);

export default router;
