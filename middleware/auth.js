const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userExtractor = (request, response, next) => {
  const token = request.cookies?.accessToken;

  if (!token) {
    return response.status(401).json({ error: "No hay sesión activa" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken.id) {
      return response.status(401).json({ error: "Token inválido" });
    }

    request.user = decodedToken;
    next();
  } catch (error) {
    return response.status(401).json({ error: "Sesión inválida o expirada" });
  }
};

module.exports = { userExtractor };