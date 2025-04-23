import mongoose from "mongoose";

const glossaryEntrySchema = new mongoose.Schema({
  term:      { type: String, required: true, unique: true },
  definition:{ type: String, required: true },
  tags:      [String],               // optionnel, pour filtrer par catégorie
  createdAt: { type: Date, default: Date.now }
});

// pour recherche texte rapide :
glossaryEntrySchema.index({ term: "text", definition: "text" });

export default mongoose.model("GlossaryEntry", glossaryEntrySchema);
