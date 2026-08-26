const busesRouter = require("express").Router();
const User = require("../models/user");
const Bus = require("../models/buses");
const upload = require("../middleware/multer");

// Obtener todos los buses registrados
busesRouter.get("/", async (request, response) => {
  try {
    const buses = await Bus.find({});
    return response.status(200).json(buses);
  } catch (error) {
    return response.status(500).json({ error: "Error al obtener los buses" });
  }
});

// Endpoint para obtener el reporte momentáneo de todos los buses
busesRouter.get("/momentaryReport", async (request, response) => {
  try {
    const reporte = await Bus.aggregate([
      {
        $group: {
          _id: null,
          totalNinos: { $sum: '$cantidadNinos' },
          totalAdultos: { $sum: '$cantidadAdultos' }
        }
      }
    ]);

    const ninos = reporte.length > 0 ? reporte[0].totalNinos : 0;
    const adultos = reporte.length > 0 ? reporte[0].totalAdultos : 0;
    const total = ninos + adultos;

    return response.status(200).json({ ninos, adultos, total });
  } catch (error) {
    console.error("Error al generar el reporte momentáneo:", error);
    return response.status(500).json({ error: "Error al obtener el reporte" });
  }
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
busesRouter.post("/", upload.single('foto'), async (request, response) => {
  try {
    const user = request.user;
    if (!user) {
      return response.status(401).json({ error: "No estás autenticado" });
    }

    const {
      numeroBus,
      entidad,
      nombreEntidad,
      lugarEntidad,
      estado,
      municipio,
      parroquia,
      cantidadNinos,
      cantidadAdultos
    } = request.body;

    const newBus = new Bus({
      usuario: user.name || user.username || "Usuario",
      numeroBus,
      foto: request.file ? request.file.path : undefined,
      entidad: request.body.entidad || "Entidad no especificada",
      nombreEntidad,
      lugarEntidad,
      estado,
      municipio,
      parroquia,
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

// Eliminar un bus por ID (Únicamente el creador del bus)
busesRouter.delete("/:id", async (request, response) => {
  try {
    const user = request.user;
    if (!user) {
      return response.status(401).json({ error: "No autenticado" });
    }

    const bus = await Bus.findById(request.params.id);
    if (!bus) {
      return response.status(404).json({ error: "Bus no encontrado" });
    }

    const currentUserName = user.name || user.username;

    if (bus.usuario !== currentUserName) {
      return response.status(403).json({ error: "No tienes permiso para eliminar este bus porque no lo creaste tú" });
    }

    await Bus.findByIdAndDelete(request.params.id);
    return response.sendStatus(204);
  } catch (error) {
    return response.status(500).json({ error: "Error al eliminar el bus" });
  }
});

// Actualizar/Editar un bus por ID (Únicamente el creador del bus)
busesRouter.put('/:id', upload.single('foto'), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { id } = req.params;
    const bus = await Bus.findById(id);

    if (!bus) {
      return res.status(404).json({ error: 'El bus no existe en la base de datos' });
    }

    const currentUserName = user.name || user.username;

    if (bus.usuario !== currentUserName) {
      return res.status(403).json({ error: "No tienes permiso para editar este bus porque no lo creaste tú" });
    }

    const {
      numeroBus,
      entidad,
      nombreEntidad,
      lugarEntidad,
      estado,
      municipio,
      parroquia,
      cantidadNinos,
      cantidadAdultos
    } = req.body;

    const datosActualizados = {
      numeroBus,
      entidad, 
      nombreEntidad,
      lugarEntidad,
      estado,
      municipio,
      parroquia,
      cantidadNinos,
      cantidadAdultos
    };

    // Si el usuario subió una nueva foto al editar, la actualizamos
    if (req.file) {
      datosActualizados.foto = req.file.path;
    }

    const busActualizado = await Bus.findByIdAndUpdate(id, datosActualizados, { new: true });
    return res.status(200).json(busActualizado);
  } catch (error) {
    console.error("Error al actualizar el bus:", error);
    return response.status(500).json({ error: 'Error al actualizar el bus' });
  }
});

module.exports = busesRouter;