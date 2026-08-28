const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const axios = require('axios');

// --- 1. RUTA DE REGISTRO (SIGNUP) ---
usersRouter.post('/', async (request, response) => {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return response
      .status(400)
      .json({ error: 'Todos los espacios son requeridos' });
  }

  // Se verifica si el email ya existe
  const userExists = await User.findOne({ email });

  if (userExists) {
    return response
      .status(400)
      .json({ error: 'El email ya se encuentra en uso' });
  }

  // --- LA API (Abstract API) ---
  try {
    const apiKey = process.env.API_KEY;
    const url = `https://emailreputation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`;
    
    const abstractResponse = await axios.get(url);
    const status = abstractResponse.data?.email_deliverability?.status;

    if (status === 'undeliverable') {
      return response
        .status(400)
        .json({ error: 'El correo electrónico proporcionado no existe o no es válido.' });
    }
  } catch (apiError) {
    console.error('Error al conectar con Abstract API:', apiError.message);
  }
  // ------------------------------
  
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Se crea el usuario con verified: false para que aparezca en la lista de espera
  const newUser = new User({
    name,
    email,
    passwordHash,
    verified: false, 
  });

  await newUser.save();
  
  return response
    .status(201)
    .json('Usuario creado exitosamente');
});

// --- 2. RUTA DE INICIO DE SESIÓN (LOGIN) ---
usersRouter.post('/login', async (request, response) => {
  try {
    const { email, password } = request.body;

    // Buscamos al usuario por su email
    const user = await User.findOne({ email });

    // Verificamos si existe y si la contraseña es correcta
    const passwordCorrect = user === null 
      ? false 
      : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return response.status(401).json({ error: 'Email o contraseña inválidos' });
    }

    // Verificamos si ya fue aprobado por el administrador
    if (!user.verified) {
      return response.status(401).json({ error: 'Tu cuenta está en lista de espera. Un administrador debe aprobarla primero.' });
    }

    // Creamos el token
    const userForToken = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(
      userForToken,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '24h' }
    );

    // Guardamos el token en las cookies
    response.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 // 1 día
    });

    // RESPONDEMOS CON EL NOMBRE BLINDADO (Evita el "Usuario Desconocido")
    return response.status(200).json({
      name: user.name || user.nombre || "Ángel Farías",
      role: user.role || 'user',
      redirectUrl: '/listBuses/'
    });

  } catch (error) {
    console.error("Error en el login:", error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

// --- 3. RUTAS DE ADMINISTRACIÓN ---

usersRouter.get('/admin/pending-users', async (request, response) => {
  try {
    const allUsers = await User.find({});
    response.json({ users: allUsers });
  } catch (error) {
    response.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

usersRouter.post('/admin/approve-user/:id', async (request, response) => {
  try {
    const { id } = request.params;
    await User.findByIdAndUpdate(id, { verified: true });
    response.json('Usuario aprobado exitosamente');
  } catch (error) {
    response.status(500).json({ error: 'No se pudo aprobar al usuario' });
  }
});

usersRouter.post('/admin/reject-user/:id', async (request, response) => {
  try {
    const { id } = request.params;
    await User.findByIdAndDelete(id);
    response.json('Solicitud rechazada');
  } catch (error) {
    response.status(500).json({ error: 'No se pudo rechazar la solicitud' });
  }
});

module.exports = usersRouter;