const mongoose = require("mongoose");
//const { app } = require("../app");

const busSchema = new mongoose.Schema({
    usuario: {
        type: String, // Aquí se guarda el nombre del usuario o admin que lo registró
        required: true
    },
    numeroBus: {
        type: Number,
        required: true
    },
    placa: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    nombreEntidad: {
        type: String,
        required: true
    },
    lugarEntidad: {
        type: String,
        required: true
    },
    cantidadNinos: {
        type: Number,
        required: true,
        default: 0
    },
    cantidadAdultos: {
        type: Number,
        required: true,
        default: 0
    },
    cerrado: {
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

busSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

//creacion del modelo
const Bus = mongoose.model('Bus', busSchema);

//exportacion del modelo
module.exports = Bus;