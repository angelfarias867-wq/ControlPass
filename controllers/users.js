const usersRouter = require('express').Router();// Importar el modelo de usuario
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const axios = require('axios');
const { PAGE_URL } = require('../config'); // Importar la URL de la página desde el archivo de configuración

//se valida que los campos no estén vacíos y se hace desestructuracion de objetos
usersRouter.post('/', async (request, response) => {
  const { name, email, password } = request.body;
  // console.log(name, email, password);

  if (!name || !email || !password) {
    return response
      .status(400)
      .json({ error: 'Todos los espacios son requeridos' });
  }

  //se verifica si el email ya existe
  const userExists = await User.findOne({ email });

  //Si el usuario ya existe, retornar un error
  if (userExists) {
    return response
      .status(400)
      .json({ error: 'El email ya se encuentra en uso' });
  }


//---------LA API--------------
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
  //--------------------------------------
  
  //Se define el numero de rondas y luego y se usa la función .hash para encriptar la contraseña
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  //Se crea un nuevo usuario tomando como referencia el esquema de los modelos
  const newUser = new User({
    name,
    email,
    passwordHash,
    verified: true,
  });

  // Se guarda el usuario en la base de datos
  await newUser.save();
  
return response
    .status(201)
.json('Usuario creado exitosamente');
})

module.exports = usersRouter;