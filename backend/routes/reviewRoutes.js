import express from "express";
import { body, param, query, validationResult } from "express-validator";
import Review from "../models/Review.js";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Middleware pour valider les erreurs
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 📊 Récupérer les stats d'une recette (moyenne et nombre d'avis)
router.get(
  "/stats/:recipeId",
  [param("recipeId").isMongoId().withMessage("Invalid recipe ID format")],
  validate,
  async (req, res, next) => {
    try {
      const recipeId = req.params.recipeId;
      const stats = await Review.aggregate([
        { $match: { recipe: new mongoose.Types.ObjectId(recipeId) } },
        { $group: { _id: "$recipe", averageRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);

      if (stats.length === 0) {
        return res.json({ averageRating: 0, count: 0 });
      }

      res.json(stats[0]);
    } catch (error) {
      next(error);
    }
  }
);

// ➕ Ajouter un nouvel avis (Empêche les doublons)
router.post(
  "/",
  authMiddleware,
  [
    body("recipe").isMongoId().withMessage("Invalid recipe ID"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").notEmpty().withMessage("Comment is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { recipe, rating, comment } = req.body;
      const userId = req.user.id;

      // Vérifier si l'utilisateur a déjà laissé un avis sur cette recette
      const existingReview = await Review.findOne({ recipe, user: userId });
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this recipe" });
      }

      const newReview = new Review({ recipe, rating, comment, user: userId });
      const savedReview = await newReview.save();
      res.status(201).json(savedReview);
    } catch (error) {
      next(error);
    }
  }
);

// 📜 Récupérer les avis d'une recette avec tri et filtre
router.get(
  "/:recipeId",
  [param("recipeId").isMongoId().withMessage("Invalid recipe ID format")],
  validate,
  async (req, res, next) => {
    try {
      const { sort, minRating, page, limit } = req.query;
      const recipeId = req.params.recipeId;

      let filter = { recipe: recipeId };
      if (minRating) {
        filter.rating = { $gte: parseInt(minRating) };
      }

      let sortOption = { createdAt: -1 };
      if (sort === "asc") sortOption = { createdAt: 1 };
      else if (sort === "rating_desc") sortOption = { rating: -1 };
      else if (sort === "rating_asc") sortOption = { rating: 1 };

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const reviews = await Review.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate("user", "username");

      const totalReviews = await Review.countDocuments(filter);
      const hasMore = skip + limitNum < totalReviews;

      res.json({ reviews, hasMore });
    } catch (error) {
      next(error);
    }
  }
);

// ✏ Modifier un avis
router.put(
  "/:id",
  authMiddleware,
  [
    param("id").isMongoId().withMessage("Invalid review ID"),
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().notEmpty().withMessage("Comment cannot be empty"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: "Review not found" });

      if (review.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      review.rating = req.body.rating ?? review.rating;
      review.comment = req.body.comment ?? review.comment;
      await review.save();

      res.json({ message: "Review updated successfully", review });
    } catch (error) {
      next(error);
    }
  }
);

// 🗑 Supprimer un avis
router.delete(
  "/:id",
  authMiddleware,
  [param("id").isMongoId().withMessage("Invalid review ID")],
  validate,
  async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: "Review not found" });

      if (review.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this review" });
      }

      await review.deleteOne();
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// 👍 Upvote un avis (Empêche les votes multiples)
router.post(
  "/:id/upvote",
  authMiddleware,
  [param("id").isMongoId().withMessage("Invalid review ID")],
  validate,
  async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: "Review not found" });

      if (!review.upvoters.includes(req.user.id)) {
        review.usefulCount++;
        review.upvoters.push(req.user.id);
        await review.save();
      }

      res.json({ message: "Review upvoted", usefulCount: review.usefulCount });
    } catch (error) {
      next(error);
    }
  }
);

// 👎 Downvote un avis (Empêche les votes multiples)
router.post(
  "/:id/downvote",
  authMiddleware,
  [param("id").isMongoId().withMessage("Invalid review ID")],
  validate,
  async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: "Review not found" });

      if (review.upvoters.includes(req.user.id)) {
        review.usefulCount = Math.max(0, review.usefulCount - 1);
        review.upvoters = review.upvoters.filter(id => id !== req.user.id);
        await review.save();
      }

      res.json({ message: "Review downvoted", usefulCount: review.usefulCount });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
