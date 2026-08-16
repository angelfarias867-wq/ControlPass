require("dotenv").config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const busesRouter = require('./controllers/buses');
const logoutRouter = require('./controllers/logout');

const { userExtractor } = require('./middleware/auth'); 


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


app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Rutas Frontend
app.use("/", express.static(path.resolve("views", "login")));
app.use('/signup', express.static(path.resolve('views','signup')));
app.use('/listBuses', express.static(path.resolve('views','listBuses')));
app.use('/newBus', express.static(path.resolve('views','newBus')));
app.use('/configuration', express.static(path.resolve('views','configuration')));
//app.use('/momentaryReport', express.static(path.resolve('views','momentaryReport')));
app.use('/components', express.static(path.resolve('views','components')));
app.use('/img', express.static(path.resolve('img')));


//Rutas backend
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use('/api/buses', userExtractor, busesRouter);
app.use("/api/logout", logoutRouter)

module.exports = app;
