require("dotenv").config();
const http = require('http');
const { Server } = require('socket.io');
const expressApp = require("./app.js");
const PUERTO = 3000;

// 1. Creamos el servidor HTTP nativo usando tu app de Express
const server = http.createServer(expressApp);

// 2. Inicializamos Socket.io sobre el servidor HTTP
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 3. Inyectamos 'io' en cada petición (req) para usarlo en los controladores de buses
expressApp.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado en tiempo real');
});

// 4. IMPORTANTE: Usamos server.listen en lugar de app.listen
server.listen(PUERTO, () => {
  console.log(`Escuchando en el puerto ${PUERTO} con WebSockets activos`);
});