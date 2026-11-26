
const express = require("express");

const app = express();

// ==========================================
// PERMITIR CONEXIONES DESDE LIVE SERVER
// ==========================================

app.use((req, res, next) => {
    const origenesPermitidos = [
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ];

    const origen = req.headers.origin;

    if (origenesPermitidos.includes(origen)) {
        res.header("Access-Control-Allow-Origin", origen);
    }

    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// ==========================================
// RECIBIR INFORMACIÓN JSON
// ==========================================

app.use(express.json());

// ==========================================
// COMPROBAR QUE FUNCIONA LA API
// ==========================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "HearHome API funcionando correctamente"
    });
});

// ==========================================
// RUTAS DE PROPIEDADES
// ==========================================

const propertyRoutes = require("./routes/property.routes");

app.use("/api/propiedades", propertyRoutes);

module.exports = app;
