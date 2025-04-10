import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Log pour vérifier les cookies reçus
  console.log("Cookies reçus dans authMiddleware:", req.cookies);

  let token;
  // Vérifier l'en-tête Authorization
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Sinon, vérifier si un token est stocké dans un cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

export default authMiddleware;

