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

  // 5. Firmar el token de acceso
  const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  // 6. Guardar el token en la cookie de la sesión
  response.cookie('accessToken', accessToken, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  // 7. Responder con el rol y la URL de redirección
  return response.status(200).json({ 
    role: userExists.role || 'user', 
    redirectUrl: '/listBuses/' 
  });
});

module.exports = loginRouter;