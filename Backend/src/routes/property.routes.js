
const express = require("express");
const router = express.Router();

const {
    leerDatos,
    guardarDatos,
    obtenerPropiedades,
    agregarPropiedad
} = require("../services/storage.service");

// ==========================================
// OBTENER TODAS LAS PROPIEDADES
// GET /api/propiedades
// ==========================================

router.get("/", async (req, res) => {
    try {
        const propiedades = await obtenerPropiedades();

        res.status(200).json({
            success: true,
            propiedades
        });

    } catch (error) {
        console.error("Error al obtener propiedades:", error);

        res.status(500).json({
            success: false,
            message: "No se pudieron cargar las propiedades."
        });
    }
});

// ==========================================
// GUARDAR UNA PROPIEDAD
// POST /api/propiedades
// ==========================================

router.post("/", async (req, res) => {
    try {
        const propiedad = req.body;

        if (
            !propiedad ||
            typeof propiedad.name !== "string" ||
            !propiedad.name.trim() ||
            typeof propiedad.address !== "string" ||
            !propiedad.address.trim() ||
            !["casa", "edificio"].includes(propiedad.type) ||
            !Number.isInteger(propiedad.totalUnits) ||
            propiedad.totalUnits < 1 ||
            propiedad.totalUnits > 900
        ) {
            return res.status(400).json({
                success: false,
                message: "Los datos de la propiedad no son válidos."
            });
        }

        const nuevaPropiedad = await agregarPropiedad(propiedad);

        res.status(201).json({
            success: true,
            message: "Propiedad guardada correctamente.",
            propiedad: nuevaPropiedad
        });

    } catch (error) {
        console.error("Error al guardar propiedad:", error);

        res.status(500).json({
            success: false,
            message: "No se pudo guardar la propiedad."
        });
    }
});

// ==========================================
// ACTUALIZAR RENTA Y SERVICIOS
// PUT /api/propiedades/:id/cobros
// ==========================================

router.put("/:id/cobros", async (req, res) => {
    try {
        const propertyId = req.params.id;
        const { rent, services } = req.body || {};

        // ======================================
        // VALIDAR RENTA
        // ======================================

        if (
            typeof rent !== "number" ||
            !Number.isFinite(rent) ||
            rent < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "El importe de renta no es válido."
            });
        }

        // ======================================
        // VALIDAR SERVICIOS
        // ======================================

        if (!Array.isArray(services)) {
            return res.status(400).json({
                success: false,
                message: "La lista de servicios no es válida."
            });
        }

        const validServices = services.every(service =>
            service &&
            typeof service.name === "string" &&
            service.name.trim().length > 0 &&
            service.name.trim().length <= 80 &&
            typeof service.amount === "number" &&
            Number.isFinite(service.amount) &&
            service.amount >= 0
        );

        if (!validServices) {
            return res.status(400).json({
                success: false,
                message: "Uno o más servicios tienen datos incorrectos."
            });
        }

        // ======================================
        // LEER ARCHIVO JSON
        // ======================================

        const datos = await leerDatos();

        if (!Array.isArray(datos.propiedades)) {
            return res.status(500).json({
                success: false,
                message: "El archivo de propiedades no es válido."
            });
        }

        // ======================================
        // BUSCAR PROPIEDAD POR ID
        // ======================================

        const propertyIndex = datos.propiedades.findIndex(
            property => String(property.id) === String(propertyId)
        );

        if (propertyIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "No se encontró la propiedad seleccionada."
            });
        }

        // ======================================
        // NORMALIZAR SERVICIOS
        // ======================================

        const normalizedServices = services.map(service => ({
            name: service.name.trim(),
            amount: service.amount
        }));

        // ======================================
        // CALCULAR TOTAL MENSUAL
        // ======================================

        const servicesTotal = normalizedServices.reduce(
            (total, service) => total + service.amount,
            0
        );

        const monthlyTotal = rent + servicesTotal;

        // ======================================
        // ACTUALIZAR PROPIEDAD
        // ======================================

        const propiedad = datos.propiedades[propertyIndex];

        // Conservamos nombre, dirección, pisos,
        // departamentos y demás información.
        propiedad.rent = rent;
        propiedad.services = normalizedServices;

        // Eliminar campos antiguos para evitar
        // tener dos versiones de los cobros.
        delete propiedad.renta;
        delete propiedad.servicios;

        propiedad.updatedAt = new Date().toISOString();

        // ======================================
        // GUARDAR CAMBIOS EN HEARHOME.JSON
        // ======================================

        await guardarDatos(datos);

        // ======================================
        // RESPONDER AL FRONTEND
        // ======================================

        res.status(200).json({
            success: true,
            message: "Cobros guardados correctamente.",
            propiedad,
            resumen: {
                rentaBase: rent,
                totalServicios: servicesTotal,
                totalMensual: monthlyTotal
            }
        });

    } catch (error) {
        console.error("Error al actualizar cobros:", error);

        res.status(500).json({
            success: false,
            message: "No se pudieron guardar los cobros."
        });
    }
});

module.exports = router;
