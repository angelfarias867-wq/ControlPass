const mongoose = require("mongoose");

// Se definen las propiedades o atributos de la base de datos
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // Agregado para que no existan dos usuarios con el mismo nombre
    },
    // El campo 'email' fue eliminado completamente de aquí
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
        returnedObject.id = returnedObject._id.toString(); // Aquí lo convierte a 'id'
        delete returnedObject._id; // Aquí lo borra
        delete returnedObject.__v; // Borra la versión interna de Mongoose
        delete returnedObject.passwordHash; // Buena práctica: no enviar la contraseña encriptada al frontend
    }
});

// Se crea el modelo
const User = mongoose.model('User', userSchema);

// Se exporta el modelo
module.exports = User;