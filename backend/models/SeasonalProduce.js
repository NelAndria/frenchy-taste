// backend/models/SeasonalProduce.js
import mongoose from "mongoose";

const seasonalProduceSchema = new mongoose.Schema({
  name: { type: String, required: true },           // ex. "Strawberry"
  type: { type: String, enum: ["fruit","vegetable"], required: true },
  availability: [
    {
      season: { 
        type: String,
        enum: ["spring","summer","fall","winter"],
        required: true
      },
      months: [
        {
          type: String,
          enum: [
            "january","february","march","april","may","june",
            "july","august","september","october","november","december"
          ]
        }
      ]
    }
  ]
}, { timestamps: true });

export default mongoose.model("SeasonalProduce", seasonalProduceSchema);
