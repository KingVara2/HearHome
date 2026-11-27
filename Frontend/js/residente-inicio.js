
/* ==========================================
   HEARHOME - INICIO DEL RESIDENTE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    // ==========================================
    // CONFIGURACIÓN
    // ==========================================

    const API_URL = "http://localhost:3000/api/propiedades";

    // Asignación temporal del residente.
    // Después la obtendremos de su cuenta.
    const RESIDENT_PROPERTY_ID = "prop-001";
    const RESIDENT_UNIT = "Departamento 204";

    // ==========================================
    // FORMATO DE DINERO
    // ==========================================

    function formatMoney(amount) {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // ==========================================
    // CARGAR DATOS REALES DE LA PROPIEDAD
    // ==========================================

    async function loadResidentProperty() {

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    `Error al consultar propiedades: ${response.status}`
                );
            }

            const data = await response.json();

            if (
                !data.success ||
                !Array.isArray(data.propiedades)
            ) {
                throw new Error(
                    "La respuesta del servidor no es válida."
                );
            }

            // Buscar Residencial Los Olivos.
            const property = data.propiedades.find(
                item =>
                    String(item.id) === RESIDENT_PROPERTY_ID
            );

            if (!property) {
                throw new Error(
                    "No se encontró la propiedad del residente."
                );
            }

            // ==================================
            // DATOS DE LA PROPIEDAD
            // ==================================

            const propertyName =
                property.name ?? property.nombre ?? "Propiedad";

            const propertyAddress =
                property.address ?? property.direccion ?? "";

            const baseRent = Number(
                property.rent ?? property.renta ?? 0
            );

            const services =
                property.services ?? property.servicios ?? [];

            // ==================================
            // SUMAR SERVICIOS
            // ==================================

            const servicesTotal = Array.isArray(services)
                ? services.reduce((total, service) => {
                    const amount = Number(
                        service.amount ?? service.importe ?? 0
                    );

                    return total + amount;
                }, 0)
                : 0;

            // ==================================
            // TOTAL MENSUAL
            // ==================================

            const monthlyTotal = baseRent + servicesTotal;

            // ==================================
            // ACTUALIZAR MY HOME
            // ==================================

            // Estos identificadores los agregaremos
            // al HTML de residente-inicio.
            const nameElement = $("residentPropertyName");
            const addressElement = $("residentPropertyAddress");
            const unitElement = $("residentUnitName");
            const rentElement = $("residentMonthlyRent");

            if (nameElement) {
                nameElement.textContent = propertyName;
            }

            if (addressElement) {
                addressElement.textContent = propertyAddress;
            }

            if (unitElement) {
                unitElement.textContent = RESIDENT_UNIT;
            }

            if (rentElement) {
                rentElement.textContent = formatMoney(monthlyTotal);
            }

            console.log("Propiedad del residente:", {
                propertyName,
                baseRent,
                servicesTotal,
                monthlyTotal
            });

        } catch (error) {
            console.error(
                "Error al cargar información del residente:",
                error
            );
        }
    }

    // ==========================================
    // MENÚ DEL PERFIL
    // ==========================================

    const profileButton = $("residentProfileButton");
    const profileDropdown = $("residentProfileDropdown");

    function closeProfile() {

        if (!profileButton || !profileDropdown) return;

        profileDropdown.hidden = true;

        profileButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    function toggleProfile() {

        if (!profileButton || !profileDropdown) return;

        const isOpen = !profileDropdown.hidden;

        profileDropdown.hidden = isOpen;

        profileButton.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );
    }

    profileButton?.addEventListener("click", event => {

        event.stopPropagation();
        toggleProfile();

    });

    // ==========================================
    // CERRAR MENÚ AL HACER CLIC FUERA
    // ==========================================

    document.addEventListener("click", event => {

        if (
            profileButton &&
            profileDropdown &&
            !profileButton.contains(event.target) &&
            !profileDropdown.contains(event.target)
        ) {
            closeProfile();
        }
    });

    // ==========================================
    // CERRAR MENÚ CON ESCAPE
    // ==========================================

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            profileDropdown &&
            !profileDropdown.hidden
        ) {
            closeProfile();
            profileButton?.focus();
        }
    });

    // ==========================================
    // CERRAR SESIÓN
    // ==========================================

    document.querySelectorAll(".logout-link").forEach(link => {

        link.addEventListener("click", () => {

            sessionStorage.removeItem("hearhome-sesion");

        });
    });

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================

    loadResidentProperty();

});
