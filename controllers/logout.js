const logoutRouter = require("express").Router();
const User = require('../models/user');

logoutRouter.get("/", async (request, response) => {
const cookies = request.cookies;

if (!cookies?.accessToken) {
    return response.sendStatus(401)
}

//Borrar la cookie para cerrar la sesion
response.clearCookie("accessToken", {
     secure: process.env.NODE_ENV === 'production',
    httpOnly: true 
})
return response.sendStatus(204);
})

module.exports = logoutRouter;