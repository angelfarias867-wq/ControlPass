require("dotenv").config();
const app = require("./app.js");
const PUERTO = 3000;

app.listen(PUERTO, () => {
  console.log("Escuchando en el puerto 3000");
});