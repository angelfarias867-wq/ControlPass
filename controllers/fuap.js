const dailyCheckRouter = require('express').Router();
const Bus = require('../models/buses');   // Ajusta la mayúscula según tu archivo (ej. Bus)
const User = require('../models/user'); // Importa el modelo de usuarios

// GET /api/daily-check
dailyCheckRouter.get('/', async (req, res) => {
  try {
    // 1. Obtener todos los usuarios registrados en el sistema
    const allUsers = await User.find({});

    // 2. Agrupar los autobuses activos por el nombre del usuario
    const busStats = await Bus.aggregate([
      { $match: { cerrado: false } },
      {
        $group: {
          _id: '$usuario',
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Crear un mapa para buscar rápido los conteos
    const countsMap = busStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // 4. Mapear todos los usuarios y asignar 0 si no tienen registros activos
    const usersReport = allUsers.map(user => {
      const userName = user.name || user.username; // Ajusta según el campo de tu modelo User
      return {
        name: userName,
        count: countsMap[userName] || 0
      };
    });

    // 5. Total acumulado global
    const totalToday = busStats.reduce((acc, curr) => acc + curr.count, 0);

    res.json({
      totalToday,
      users: usersReport
    });
  } catch (error) {
    console.error('Error en chequeo del día:', error);
    res.status(500).json({ error: 'Error al obtener el chequeo del día' });
  }
});

module.exports = dailyCheckRouter;