import express from "express";
import { body, validationResult } from "express-validator";
import BlogPost from "../models/BlogPost.js";

const router = express.Router();

// GET: Récupérer tous les articles du blog (tri par date décroissante)
router.get('/', async (req, res, next) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// GET: Récupérer un article par son ID
router.get('/:id', async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Article non trouvé" });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// POST: Créer un nouvel article
// Vous pouvez protéger cette route avec authMiddleware si nécessaire
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('author').notEmpty().withMessage('Author is required')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const newPost = new BlogPost(req.body);
      await newPost.save();
      res.status(201).json(newPost);
    } catch (error) {
      next(error);
    }
  }
);

// PUT: Mettre à jour un article existant
// Vous pouvez protéger cette route avec authMiddleware si nécessaire
router.put(
  '/:id',
  [
    // Les validations sont optionnelles : si un champ est présent, il ne doit pas être vide
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedPost) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      res.json(updatedPost);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE: Supprimer un article
// Vous pouvez protéger cette route avec authMiddleware si nécessaire
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: "Article non trouvé" });
    }
    res.json({ message: "Article supprimé avec succès" });
  } catch (error) {
    next(error);
  }
});

export default router;

