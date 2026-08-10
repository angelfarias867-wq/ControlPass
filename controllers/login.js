const loginRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
console.log("Admin Email cargado:", adminEmail);
console.log("Admin Password cargado:", adminPassword);

loginRouter.post('/', async (request, response) => {
  const { email, password } = request.body;

  // EVALUACIÓN 1: ¿Es el Administrador? (Comparación True / False)
  const isAdmin = (email === adminEmail) && (password === adminPassword);

  if (isAdmin) {
    // Es True -> Generamos token de Admin con el nombre 'Administrador'
    const userForToken = {
      id: "admin-static-id",
      role: "admin",
      name: "Administrador" // 👈 Nombre para la cuenta de Admin
    };

    const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    response.cookie('accessToken', accessToken, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    return response.status(200).json({ 
      role: 'admin', 
      redirectUrl: '/listBuses/' 
    });
  }

  // EVALUACIÓN 2: ¿Es un Usuario registrado en MongoDB?
  const userExists = await User.findOne({ email });

  // Si no existe el correo en la base de datos (false)
  if (!userExists) {
    return response.status(400).json({ error: "email o contraseña incorrectos" });
  }

  // Si el usuario no está verificado (false)
  if (!userExists.verified) { 
    return response.status(400).json({ error: "Tu email no ha sido verificado" });
  }

  // Comparamos la contraseña encriptada (devuelve true o false)
  const isPasswordCorrect = await bcrypt.compare(password, userExists.passwordHash);

  if (!isPasswordCorrect) {
    return response.status(400).json({ error: "email o contraseña incorrectos" });
  }

  const userForToken = {
    id: userExists._id,
    role: userExists.role || 'user',
    name: userExists.name // 👈 Toma la propiedad 'name' del registro en MongoDB
  };

  const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  response.cookie('accessToken', accessToken, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  return response.status(200).json({ 
    role: 'user', 
    redirectUrl: '/listBuses/' 
  });
});

module.exports = loginRouter;