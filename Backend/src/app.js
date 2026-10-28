
const express = require("express");

const app = express();

// Permitir recibir información en formato JSON
app.use(express.json());

// Ruta para comprobar que la API funciona
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "HearHome API funcionando correctamente"
    });
});

module.exports = app;
