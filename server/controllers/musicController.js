import { searchMusic } from "../services/music/musicProvider.js";

export async function searchMusicController(req, res, next) {
  try {
    const query = String(req.query.q || "");
    const result = await searchMusic(query);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
