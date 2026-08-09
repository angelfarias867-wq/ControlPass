require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express();
exports.app = app;
const { MONGO_URI } = require("./config");

(async() => {

try {
    //Se conecta a la base de datos
await mongoose.connect(MONGO_URI)
console.log("Conectado a Mongo DB");

} catch (error) {
console.log(error);
}
})()


app.use(express.json())


//Rutas Frontend
app.use("/", express.static(path.resolve("views", "login")));
app.use('/signup', express.static(path.resolve('views','signup')));
app.use('/components', express.static(path.resolve('views','components')));
app.use('/img', express.static(path.resolve('img')));


//Rutas backend
app.use("/api/users", usersRouter)
app.use("/api/login", loginRouter)


module.exports = app;