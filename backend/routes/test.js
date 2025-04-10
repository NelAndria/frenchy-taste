// backend/routes/test.js
import express from "express";
const router = express.Router();

router.get("/setcookie", (req, res) => {
  res.cookie("testCookie", "hello", {
    httpOnly: true,
    secure: false, // False en dev
    maxAge: 60000, // 1 minute
    sameSite: "lax"
  });
  res.json({ message: "Cookie set" });
});

export default router;
