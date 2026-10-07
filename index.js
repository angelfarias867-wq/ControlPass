require("dotenv").config();
const http = require('http');
const { Server } = require('socket.io');
const app = "./app.js"; // O require('./app.js') según lo tengas

// Cargamos la app de Express que ya tienes configurada
const expressApp = require("./app.js");
const PUERTO = 3000;

// 1. Creamos el servidor HTTP usando Express
const server = http.createServer(expressApp);

// 2. Inicializamos Socket.io sobre el servidor HTTP
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 3. Inyectamos 'io' en la petición (req) para poder usarlo dentro de tus controladores
expressApp.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado en tiempo real');
});

// 4. Levantamos el servidor con server.listen
server.listen(PUERTO, () => {
  console.log(`Escuchando en el puerto ${PUERTO} con tiempo real activo`);
});