const busesRouter = require("express").Router();
const excelJS = require('exceljs');
const User = require("../models/user");
const Bus = require("../models/buses");
const upload = require("../middleware/multer");

// 1. Obtener todos los buses registrados
busesRouter.get("/", async (req, res) => {
  try {
    const buses = await Bus.find({});
    return res.status(200).json(buses);
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener los buses" });
  }
});

// 2. Endpoint para obtener el reporte momentáneo de todos los buses
busesRouter.get("/momentaryReport", async (req, res) => {
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

    return res.status(200).json({ ninos, adultos, total });
  } catch (error) {
    console.error("Error al generar el reporte momentáneo:", error);
    return res.status(500).json({ error: "Error al obtener el reporte momentáneo" });
  }
});

// 3. NUEVO: Endpoint para obtener el reporte final (incluye buses totales)
busesRouter.get("/finalReport", async (req, res) => {
  try {
    const stats = await Bus.aggregate([
      {
        $group: {
          _id: null,
          totalNinos: { $sum: '$cantidadNinos' },
          totalAdultos: { $sum: '$cantidadAdultos' },
          totalBuses: { $sum: 1 } // Suma 1 por cada registro encontrado
        }
      }
    ]);

    const ninos = stats.length > 0 ? stats[0].totalNinos : 0;
    const adultos = stats.length > 0 ? stats[0].totalAdultos : 0;
    const buses = stats.length > 0 ? stats[0].totalBuses : 0;
    const total = ninos + adultos;

    return res.status(200).json({ ninos, adultos, total, buses });
  } catch (error) {
    console.error("Error al generar el reporte final:", error);
    return res.status(500).json({ error: "Error al obtener el reporte final" });
  }
});

// 4. Endpoint para exportar el reporte a Excel
busesRouter.get("/exportExcel", async (req, res) => {
  try {
    // Traemos todos los buses de la base de datos
    const buses = await Bus.find({});

    // Creamos un nuevo libro de Excel y una hoja de trabajo
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Buses');

    // Definimos las columnas del Excel
    worksheet.columns = [
      { header: 'N° Bus', key: 'numeroBus', width: 10 },
      { header: 'Registrado por', key: 'usuario', width: 20 },
      { header: 'Tipo', key: 'entidad', width: 15 },
      { header: 'Nombre', key: 'nombreEntidad', width: 35 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Municipio', key: 'municipio', width: 25 },
      { header: 'Parroquia', key: 'parroquia', width: 25 },
      { header: 'Niños', key: 'cantidadNinos', width: 10 },
      { header: 'Adultos', key: 'cantidadAdultos', width: 10 },
      { header: 'Total Pasajeros', key: 'totalPasajeros', width: 15 },
    ];

    // Variables para calcular los totales finales
    let sumaNinos = 0;
    let sumaAdultos = 0;

    // Llenamos las filas con los datos de cada bus
    buses.forEach(bus => {
      const ninos = bus.cantidadNinos || 0;
      const adultos = bus.cantidadAdultos || 0;
      sumaNinos += ninos;
      sumaAdultos += adultos;

      worksheet.addRow({
        numeroBus: bus.numeroBus,
        usuario: bus.usuario,
        entidad: bus.entidad,
        nombreEntidad: bus.nombreEntidad,
        estado: bus.estado,
        municipio: bus.municipio,
        parroquia: bus.parroquia || bus.lugarEntidad,
        cantidadNinos: ninos,
        cantidadAdultos: adultos,
        totalPasajeros: ninos + adultos
      });
    });

    // Le damos estilo negrita a la primera fila (los encabezados)
    worksheet.getRow(1).font = { bold: true };

    // Agregamos una fila vacía para separar
    worksheet.addRow({});

    // Agregamos la fila de TOTALES al final del documento
    const filaTotales = worksheet.addRow({
      nombreEntidad: 'TOTAL FINALES',
      cantidadNinos: sumaNinos,
      cantidadAdultos: sumaAdultos,
      totalPasajeros: sumaNinos + sumaAdultos
    });
    filaTotales.font = { bold: true };

    // Configuramos las cabeceras de la respuesta para que el navegador sepa que es un Excel
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Reporte_Final_ControlPass.xlsx"'
    );

    // Escribimos el archivo y lo enviamos
    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error("Error al exportar Excel:", error);
    res.status(500).json({ error: "Error al generar el archivo Excel" });
  }
});

// 5. Obtener un solo bus por ID para el formulario de edición
busesRouter.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus no encontrado' });
    }
    return res.status(200).json(bus);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener el bus' });
  }
});

// 6. Crear un nuevo bus
busesRouter.post("/", upload.single('foto'), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "No estás autenticado" });
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

    const newBus = new Bus({
      usuario: user.name || user.username || "Usuario",
      numeroBus: Number(numeroBus) || 0,
      foto: req.file ? req.file.path : undefined,
      entidad: entidad || "Entidad no especificada",
      nombreEntidad: nombreEntidad || "",
      lugarEntidad: lugarEntidad || parroquia || "",
      estado: estado || "",
      municipio: municipio || "",
      parroquia: parroquia || lugarEntidad || "",
      cantidadNinos: Number(cantidadNinos) || 0,
      cantidadAdultos: Number(cantidadAdultos) || 0
    });

    const savedBus = await newBus.save();
    return res.status(201).json(savedBus);

  } catch (error) {
    console.error("Error al guardar el bus:", error);
    return res.status(400).json({ error: error.message });
  }
});

// 7. Eliminar un bus por ID (Únicamente el creador del bus)
busesRouter.delete("/:id", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ error: "Bus no encontrado" });
    }

    const currentUserName = user.name || user.username;

    if (bus.usuario !== currentUserName) {
      return res.status(403).json({ error: "No tienes permiso para eliminar este bus porque no lo creaste tú" });
    }

    await Bus.findByIdAndDelete(req.params.id);
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error: "Error al eliminar el bus" });
  }
});

// 8. Actualizar/Editar un bus por ID 
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

    // --- QUITAMOS EL BLOQUEO DE COMPARACIÓN DE NOMBRES AQUÍ ---
    // Como ya validamos en el frontend que eres tú, dejamos pasar la edición libremente:

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
      numeroBus: Number(numeroBus) || bus.numeroBus,
      entidad: entidad || bus.entidad, 
      nombreEntidad: nombreEntidad !== undefined ? nombreEntidad : bus.nombreEntidad,
      lugarEntidad: lugarEntidad || parroquia || bus.lugarEntidad,
      estado: estado || bus.estado,
      municipio: municipio || bus.municipio,
      parroquia: parroquia || lugarEntidad || bus.parroquia,
      cantidadNinos: cantidadNinos !== undefined ? Number(cantidadNinos) : bus.cantidadNinos,
      cantidadAdultos: cantidadAdultos !== undefined ? Number(cantidadAdultos) : bus.cantidadAdultos
    };

    if (req.file) {
      datosActualizados.foto = req.file.path;
    }

    const busActualizado = await Bus.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true });
    return res.status(200).json(busActualizado);
  } catch (error) {
    console.error("Error al actualizar el bus:", error);
    return res.status(500).json({ error: 'Error al actualizar el bus' });
  }
});

module.exports = busesRouter;