
/* ==========================================
   HEARHOME - AUTENTICACIÓN TEMPORAL
   TODO BD: Migrar a Node.js + SQL Server
========================================== */

const HearHomeAuth = (() => {

    // ======================================
    // USUARIOS DE DEMOSTRACIÓN
    // NO UTILIZAR EN PRODUCCIÓN
    // ======================================

    const usuarios = [
        {
            id: 1,
            nombre: "Administrador",
            correo: "admin@hearhome.com",
            password: "Admin123!",
            rol: "admin"
        },
        {
            id: 2,
            nombre: "Residente",
            correo: "residente@hearhome.com",
            password: "Residente123!",
            rol: "residente"
        }
    ];

    const SESSION_KEY = "hearhome-sesion";

    // ======================================
    // INICIAR SESIÓN
    // ======================================

    function login(correo, password) {

        const usuario = usuarios.find(user =>
            user.correo.toLowerCase() ===
                String(correo).trim().toLowerCase() &&
            user.password === password
        );

        if (!usuario) {
            return {
                success: false,
                message: "Correo o contraseña incorrectos."
            };
        }

        // Nunca guardar la contraseña en la sesión.
        const sesion = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        };

        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify(sesion)
        );

        return {
            success: true,
            usuario: sesion
        };
    }

    // ======================================
    // OBTENER USUARIO CONECTADO
    // ======================================

    function current() {
        try {
            return JSON.parse(
                sessionStorage.getItem(SESSION_KEY) || "null"
            );
        } catch {
            return null;
        }
    }

    // ======================================
    // CERRAR SESIÓN
    // ======================================

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.replace("index.html");
    }

    // ======================================
    // VALIDAR ROL
    // ======================================

    function requireRole(rolPermitido) {
        const usuario = current();

        if (!usuario) {
            window.location.replace("index.html");
            return false;
        }

        if (usuario.rol !== rolPermitido) {
            redirectByRole(usuario);
            return false;
        }

        return true;
    }

    // ======================================
    // REDIRIGIR SEGÚN ROL
    // ======================================

    function redirectByRole(usuario = current()) {
        if (!usuario) {
            window.location.replace("index.html");
            return;
        }

        const destino = usuario.rol === "admin"
            ? "admin-edificios.html"
            : "residente-inicio.html";

        window.location.replace(destino);
    }

    // ======================================
    // FUNCIONES DISPONIBLES
    // ======================================

    return {
        login,
        logout,
        current,
        requireRole,
        redirectByRole
    };

})();
