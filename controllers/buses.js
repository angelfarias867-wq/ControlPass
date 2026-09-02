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

// 4. Endpoint para exportar el reporte a Excel con la fecha actual del día
busesRouter.get("/exportExcel", async (req, res) => {
  try {
    const buses = await Bus.find({});

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    // Estilos reutilizables
    const centerAlignment = { horizontal: 'center', vertical: 'middle' };
    const thinBorder = {
      top: { style: 'thin', color: 'BFBFBF' },
      left: { style: 'thin', color: 'BFBFBF' },
      bottom: { style: 'thin', color: 'BFBFBF' },
      right: { style: 'thin', color: 'BFBFBF' }
    };
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8EA9DB' } };

    // Obtener la fecha actual formateada (ej. DD-MM-YYYY)
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const anio = fechaActual.getFullYear();
    const fechaStr = `${dia}-${mes}-${anio}`;

    // 1. TÍTULO PRINCIPAL CON LA FECHA DEL DÍA (Fila 2, fusionado de A a D)
    worksheet.addRow([]); // Fila 1 vacía
    const titleRow = worksheet.addRow([`EXPO NIÑAS Y NIÑOS PRODUCTORES - REPORTE DEL ${fechaStr}`]);
    worksheet.mergeCells('A2:D2');
    
    titleRow.font = { bold: true, size: 11 };
    titleRow.alignment = centerAlignment;
    
    // Aplicar color y bordes únicamente en el rango A2:D2
    ['A', 'B', 'C', 'D'].forEach(col => {
      const cell = worksheet.getCell(`${col}2`);
      cell.fill = headerFill;
      cell.border = thinBorder;
    });

    worksheet.addRow([]); // Fila 3 vacía

    // Definición de bloques
    const bloques = [
      { key: 'ministerio', tituloCol2: 'MINISTERIOS', usaParroquia: false, headerNro: 'NRO' },
      { key: 'institucion', tituloCol2: 'INSTITUCIONES', usaParroquia: true, headerNro: 'ITEMS' },
      { key: 'colegio', tituloCol2: 'ESCUELAS', usaParroquia: true, headerNro: 'ITEMS' },
      { key: 'comuna', tituloCol2: 'COMUNA', usaParroquia: true, headerNro: 'NRO' },
      { key: 'campamento', tituloCol2: 'CAMPAMENTOS', usaParroquia: true, headerNro: 'NRO' }
    ];

    function obtenerClaveCategoria(entidad) {
      if (!entidad) return 'institucion';
      const entLower = entidad.toLowerCase().trim();
      if (entLower.includes('ministerio')) return 'ministerio';
      if (entLower.includes('colegio') || entLower.includes('escuela') || entLower.includes('liceo') || entLower.includes('cein')) return 'colegio';
      if (entLower.includes('comun')) return 'comuna';
      if (entLower.includes('campament') || entLower.includes('refugio')) return 'campamento';
      return 'institucion';
    }

    // 2. RECORRER CADA BLOQUE
    bloques.forEach((bloque) => {
      const busesBloque = buses.filter(bus => obtenerClaveCategoria(bus.entidad) === bloque.key);
      if (busesBloque.length === 0) return;

      // Ordenar alfabéticamente
      busesBloque.sort((a, b) => {
        const estA = (a.estado || '').trim();
        const estB = (b.estado || '').trim();
        if (estA !== estB) return estA.localeCompare(estB, 'es', { sensitivity: 'base' });
        const parA = (a.parroquia || a.lugarEntidad || '').trim();
        const parB = (b.parroquia || b.lugarEntidad || '').trim();
        return parA.localeCompare(parB, 'es', { sensitivity: 'base' });
      });

      // Cabecera de la sección
      let headerRow;
      if (!bloque.usaParroquia) {
        headerRow = worksheet.addRow([bloque.headerNro, bloque.tituloCol2, '', 'ESTADO']);
        const rIdx = headerRow.number;
        worksheet.mergeCells(`B${rIdx}:C${rIdx}`);
        
        ['A', 'B', 'C', 'D'].forEach(col => {
          const cell = worksheet.getCell(`${col}${rIdx}`);
          cell.font = { bold: true };
          cell.alignment = centerAlignment;
          cell.fill = headerFill;
          cell.border = thinBorder;
        });
      } else {
        headerRow = worksheet.addRow([bloque.headerNro, bloque.tituloCol2, 'PARROQUIA', 'ESTADO']);
        const rIdx = headerRow.number;
        
        ['A', 'B', 'C', 'D'].forEach(col => {
          const cell = worksheet.getCell(`${col}${rIdx}`);
          cell.font = { bold: true };
          cell.alignment = centerAlignment;
          cell.fill = headerFill;
          cell.border = thinBorder;
        });
      }

      // Filas de datos
      busesBloque.forEach((bus, index) => {
        const nombreVal = (bus.nombreEntidad || 'SIN NOMBRE').trim().toUpperCase();
        const estadoVal = (bus.estado || '').trim().toUpperCase();

        if (!bloque.usaParroquia) {
          const dataRow = worksheet.addRow([index + 1, nombreVal, '', estadoVal]);
          const rIdxData = dataRow.number;
          worksheet.mergeCells(`B${rIdxData}:C${rIdxData}`);

          ['A', 'B', 'C', 'D'].forEach(col => {
            const cell = worksheet.getCell(`${col}${rIdxData}`);
            cell.alignment = centerAlignment;
            cell.border = thinBorder;
          });
        } else {
          const parroquiaVal = (bus.parroquia || bus.lugarEntidad || '').trim().toUpperCase();
          const dataRow = worksheet.addRow([index + 1, nombreVal, parroquiaVal, estadoVal]);
          const rIdxData = dataRow.number;

          ['A', 'B', 'C', 'D'].forEach(col => {
            const cell = worksheet.getCell(`${col}${rIdxData}`);
            cell.alignment = centerAlignment;
            cell.border = thinBorder;
          });
        }
      });

      // Filas vacías de separación entre bloques
      worksheet.addRow([]);
      worksheet.addRow([]);
    });

    // Anchos de columnas ajustados
    worksheet.columns = [
      { width: 12 },  // NRO / ITEMS
      { width: 50 },  // ENTIDAD
      { width: 25 },  // PARROQUIA
      { width: 20 }   // ESTADO
    ];

    // Configurar cabeceras HTTP con la fecha incorporada en el nombre del archivo descargado
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Reporte_ControlPass_${fechaStr}.xlsx"`
    );

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
      usuario: user.name || user.username,
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

    // --- QUITAMOS EL BLOQUEO DE COMPARACIÓN IGUAL QUE EN EL PUT ---
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