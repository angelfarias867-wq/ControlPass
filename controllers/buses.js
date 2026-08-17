const busesRouter = require("express").Router();
const User = require("../models/user");
const Bus = require("../models/buses");

// Obtener todos los buses registrados
busesRouter.get("/", async (request, response) => {
  const user = request.user;
  const buses = await Bus.find({});
  return response.status(200).json(buses);
});

// Obtener un solo bus por ID para el formulario de edición
busesRouter.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus no encontrado' });
    }
    return res.json(bus);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener el bus' });
  }
});

// Crear un nuevo bus
// En controllers/buses.js (POST /)
busesRouter.post("/", async (request, response) => {
  try {
    const user = request.user;

    if (!user) {
      return response.status(401).json({ 
        error: "No estás autenticado o la sesión expiró" 
      });
    }

    // Muestra en la consola de Node qué trae exactamente el token
    console.log("Datos del usuario en la sesión:", user);

    const { numeroBus, placa, nombreEntidad, lugarEntidad, cantidadNinos, cantidadAdultos } = request.body;

    const newBus = new Bus({
      // Busca 'name' o 'username', si no los encuentra usa 'Usuario' por defecto
      usuario: user.name || user.username || "Usuario",
      numeroBus,
      placa,
      nombreEntidad,
      lugarEntidad,
      cantidadNinos,
      cantidadAdultos
    });

    const savedBus = await newBus.save();
    return response.status(201).json(savedBus);

  } catch (error) {
    console.error("Error al guardar el bus:", error);
    return response.status(400).json({ error: error.message });
  }
});
// Eliminar un bus por ID
busesRouter.delete("/:id", async (request, response) => {
  const user = request.user;
  await Bus.findByIdAndDelete(request.params.id);
  return response.sendStatus(204);
});

// Actualizar/Editar un bus por ID
busesRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const busActualizado = req.body;

    // Si usas Mongoose / MongoDB:
    const bus = await Bus.findByIdAndUpdate(id, busActualizado, { new: true });

    if (!bus) {
      return res.status(404).json({ error: 'El bus no existe en la base de datos' });
    }

    return res.status(200).json(bus);
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar el bus' });
  }
});

module.exports = busesRouter;