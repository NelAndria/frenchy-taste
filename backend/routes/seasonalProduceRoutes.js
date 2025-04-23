// backend/routes/seasonalProduceRoutes.js
import express from "express";
import SeasonalProduce from "../models/SeasonalProduce.js";

const router = express.Router();

// 1️⃣ Récupérer la liste unique des saisons
router.get("/seasons", async (req, res, next) => {
  try {
    const all = await SeasonalProduce.find().select("availability.season -_id");
    const seasons = new Set(all.flatMap(p => p.availability.map(a => a.season)));
    res.json([...seasons]);
  } catch (err) { next(err); }
});

// 2️⃣ Récupérer les mois pour une saison donnée
router.get("/months", async (req, res, next) => {
  try {
    const { season } = req.query;
    if (!season) return res.status(400).json({ message: "season is required" });
    const all = await SeasonalProduce.find({ "availability.season": season })
      .select("availability.$ months -_id");
    const months = new Set(all.flatMap(p => p.availability[0].months));
    res.json([...months]);
  } catch (err) { next(err); }
});

// 3️⃣ Récupérer les fruits/légumes pour une saison + mois
router.get("/", async (req, res, next) => {
  try {
    const { season, month, type } = req.query;
    const filter = {};
    if (season)  filter["availability.season"] = season;
    if (month)   filter["availability.months"] = month;
    if (type)    filter.type = type;
    const list = await SeasonalProduce.find(filter);
    res.json(list);
  } catch (err) { next(err); }
});

export default router;

