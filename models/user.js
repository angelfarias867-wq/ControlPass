const mongoose = require("mongoose");
//const { app } = require("../app");

// Se definen las propiedades o atributos de la base de datos
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: String,
    passwordHash: String,
    verified:{
        type: Boolean,
        default: false
    },
    buses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
    }]
})

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