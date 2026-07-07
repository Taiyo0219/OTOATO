import { Router } from "express";
import { createPost, getArchivePosts, getNearbyPosts, getPostById } from "../controllers/postsController.js";

const router = Router();

router.post("/", createPost);
router.get("/nearby", getNearbyPosts);
router.get("/archive", getArchivePosts);
router.get("/:id", getPostById);

export default router;
