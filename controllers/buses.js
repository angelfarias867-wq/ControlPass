const busesRouter = require("express").Router();
const User = require("../models/user");
const Bus = require("../models/buses");

// Obtener todos los buses registrados
busesRouter.get("/", async (request, response) => {
  const user = request.user;
  const buses = await Bus.find({});
  return response.status(200).json(buses);
});

// Crear un nuevo bus
busesRouter.post("/", async (request, response) => {
  const user = request.user;
  const { numeroBus, placa, nombreEntidad, lugarEntidad, cantidadNinos, cantidadAdultos } = request.body;

  const newBus = new Bus({
    usuario: user.name, // Asigna automáticamente el nombre del usuario logueado
    numeroBus,
    placa,
    nombreEntidad,
    lugarEntidad,
    cantidadNinos,
    cantidadAdultos
  });

  const savedBus = await newBus.save();
  return response.status(201).json(savedBus);
});

// Eliminar un bus por ID
busesRouter.delete("/:id", async (request, response) => {
  const user = request.user;
  await Bus.findByIdAndDelete(request.params.id);
  return response.sendStatus(204);
});

// Actualizar/Editar un bus por ID
busesRouter.patch("/:id", async (request, response) => {
  const user = request.user;
  const { numeroBus, placa, nombreEntidad, lugarEntidad, cantidadNinos, cantidadAdultos } = request.body;

  await Bus.findByIdAndUpdate(request.params.id, {
    numeroBus,
    placa,
    nombreEntidad,
    lugarEntidad,
    cantidadNinos,
    cantidadAdultos
  });

  return response.sendStatus(200);
});

module.exports = busesRouter;