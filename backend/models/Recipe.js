import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    ingredients: [String],
    instructions: [String],
    category: String
});

recipeSchema.index({ title: "text", description: "text", ingredients: "text", category: "text" });

const Recipe = mongoose.model('Recipe', recipeSchema, 'recipes');

export default Recipe;