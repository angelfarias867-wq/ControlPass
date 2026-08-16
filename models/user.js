const mongoose = require("mongoose");
//const { app } = require("../app");

// Se definen las propiedades o atributos de la base de datos
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: String,
    verified: {
        type: Boolean,
        default: false // false por defecto, espera la aprobación del administrador
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user' // Diferencia entre usuarios normales y administradores
    },
    buses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
    }]
});
userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.passwordHash;
    }
})

//Se crea el modelo
const User = mongoose.model('User', userSchema);

//Se exporta el modelo
module.exports = User;