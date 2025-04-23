import express from "express";
import GlossaryEntry from "../models/GlossaryEntry.js";
import authMiddleware from "../middleware/authMiddleware.js"; // si tu veux protéger la gestion

const router = express.Router();

/**
 * GET /api/glossary
 *   ?term=mot
 *   → renvoie tous les termes contenant `mot` dans `term` ou `definition`
 */
router.get("/", async (req, res, next) => {
  try {
    const { term } = req.query;
    const filter = term
      ? { $text: { $search: term } }
      : {};
    const entries = await GlossaryEntry.find(filter)
      .sort({ term: 1 })
      .limit(1000); // limite raisonnable
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

// (Facultatif) routes protégées pour CRUD
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const entry = await GlossaryEntry.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});
router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const entry = await GlossaryEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(entry);
  } catch (err) {
    next(err);
  }
});
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    await GlossaryEntry.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
