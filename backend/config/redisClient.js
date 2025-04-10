// config/redisClient.js
import { createClient } from "redis";

// Création du client Redis
const redisClient = createClient({
  socket: {
    host: "localhost",
    port: 6379,
  },
});

redisClient.on("error", (err) => {
  console.error("❌ Erreur Redis :", err);
});

redisClient
  .connect()
  .then(() => console.log("✅ Redis connecté"))
  .catch((err) => console.error("❌ Erreur de connexion Redis :", err));

export default redisClient;

