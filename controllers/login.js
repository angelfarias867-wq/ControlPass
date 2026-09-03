const loginRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

loginRouter.post('/', async (request, response) => {
  const { email, password } = request.body;

  // 1. Buscar el usuario en MongoDB por su correo
  const userExists = await User.findOne({ email });

  if (!userExists) {
    return response.status(400).json({ error: "Email o contraseña incorrectos" });
  }

  // 2. Verificar si la cuenta ha sido verificada
  if (!userExists.verified) { 
    return response.status(400).json({ error: "Tu email no ha sido verificado" });
  }

  // 3. Comparar la contraseña ingresada con el hash encriptado
  const isPasswordCorrect = await bcrypt.compare(password, userExists.passwordHash);

  if (!isPasswordCorrect) {
    return response.status(400).json({ error: "Email o contraseña incorrectos" });
  }

  // 4. Crear el payload del token con el ID, rol y nombre real guardados en la BD
  const userForToken = {
    id: userExists._id,
    role: userExists.role || 'user',
    name: userExists.name
  };

  // 5. Firmar el token de acceso con una duración larga (ej. 30 días)
  const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30d",
  });

  // 6. Guardar la cookie con una vigencia de 30 días usando maxAge
  response.cookie('accessToken', accessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días de duración persistente
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  });

  // 7. Responder con el rol y la URL de redirección
  return response.status(200).json({ 
    role: userExists.role || 'user', 
    redirectUrl: '/listBuses/' 
  });
});

module.exports = loginRouter;