import { Router } from "express";
import {
  followUser,
  getFollowers,
  getFollowing,
  getMyProfile,
  getUserDayTrace,
  getUserPosts,
  getUserProfile,
  searchUsers,
  unfollowUser,
  updateMyProfile
} from "../controllers/usersController.js";
import { attachOptionalUser, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me/profile", requireAuth, getMyProfile);
router.patch("/me/profile", requireAuth, updateMyProfile);
router.get("/search", attachOptionalUser, searchUsers);
router.get("/:userId", attachOptionalUser, getUserProfile);
router.post("/:userId/follow", requireAuth, followUser);
router.delete("/:userId/follow", requireAuth, unfollowUser);
router.get("/:userId/followers", attachOptionalUser, getFollowers);
router.get("/:userId/following", attachOptionalUser, getFollowing);
router.get("/:userId/posts", attachOptionalUser, getUserPosts);
router.get("/:userId/day-trace", attachOptionalUser, getUserDayTrace);

export default router;
