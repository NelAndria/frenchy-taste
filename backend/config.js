import dotenv from "dotenv";
dotenv.config();

const CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:5000",
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

export default CONFIG;
