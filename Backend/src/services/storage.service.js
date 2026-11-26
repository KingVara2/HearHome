
const fs = require("fs/promises");
const path = require("path");

// Archivo JSON donde guardaremos los datos.
const DATA_FILE = path.join(
    __dirname,
    "../DATA/hearhome.json"
);

// ==========================================
// LEER DATOS
// ==========================================

async function leerDatos() {
    const contenido = await fs.readFile(DATA_FILE, "utf8");

    const datos = JSON.parse(contenido);

    return datos;
}

// ==========================================
// GUARDAR DATOS
// ==========================================

async function guardarDatos(datos) {
    await fs.writeFile(
        DATA_FILE,
        JSON.stringify(datos, null, 4),
        "utf8"
    );

    return datos;
}

// ==========================================
// OBTENER TODAS LAS PROPIEDADES
// ==========================================

async function obtenerPropiedades() {
    const datos = await leerDatos();

    return datos.propiedades || [];
}

// ==========================================
// AGREGAR UNA PROPIEDAD
// ==========================================

async function agregarPropiedad(propiedad) {
    const datos = await leerDatos();

    if (!Array.isArray(datos.propiedades)) {
        datos.propiedades = [];
    }

    const nuevaPropiedad = {
        ...propiedad,
        id: propiedad.id || require("crypto").randomUUID()
    };

    datos.propiedades.push(nuevaPropiedad);

    await guardarDatos(datos);

    return nuevaPropiedad;
}

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
    leerDatos,
    guardarDatos,
    obtenerPropiedades,
    agregarPropiedad
};
