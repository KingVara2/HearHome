
document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    // ==========================================
    // CONFIGURACIÓN
    // ==========================================

    const API_URL = "http://localhost:3000/api/propiedades";
    const PROPERTY_KEY = "hearhome-propiedad-actual";

    let property = null;
    let services = [];
    let rent = 0;
    let changesPending = false;
    let saving = false;

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const servicesList = $("servicesList");
    const servicesEmpty = $("servicesEmpty");
    const rentInput = $("monthlyRent");

    const modal = $("serviceModal");
    const addButton = $("addService");
    const closeModalButton = $("closeServiceModal");
    const form = $("newServiceForm");
    const saveButton = $("saveServices");

    // ==========================================
    // UTILIDADES
    // ==========================================

    function showMessage(message) {
        const element = $("saveMessage");

        if (element) {
            element.textContent = message;
        }
    }

    function formatMoney(amount) {
        return Number(amount).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function validAmount(value) {
        return (
            String(value).trim() !== "" &&
            Number.isFinite(Number(value)) &&
            Number(value) >= 0
        );
    }

    function markChanged() {
        changesPending = true;
        showMessage("Cambios pendientes de guardar.");
    }

    // ==========================================
    // CALCULAR TOTAL MENSUAL
    // ==========================================

    function calculateTotal() {
        const baseRent = Number(rent) || 0;

        const servicesTotal = services.reduce(
            (total, service) => {
                return total + (Number(service.amount) || 0);
            },
            0
        );

        const monthlyTotal = baseRent + servicesTotal;

        return {
            baseRent,
            servicesTotal,
            monthlyTotal
        };
    }

    // ==========================================
    // MOSTRAR RESUMEN DE COBROS
    // ==========================================

    function renderTotal() {
        const totals = calculateTotal();

        let summary = $("monthlyPaymentSummary");

        // Crear el resumen sin modificar el HTML.
        if (!summary) {
            summary = document.createElement("section");
            summary.id = "monthlyPaymentSummary";
            summary.className = "monthly-payment-summary";

            summary.style.cssText = `
                margin-top: 24px;
                padding: 24px 28px;
                background: #f4f8f5;
                border: 1px solid #dfe8df;
                border-radius: 20px;
                color: #153f34;
            `;

            const rentSection = document.querySelector(
                ".rent-section"
            );

            rentSection?.insertAdjacentElement(
                "afterend",
                summary
            );
        }

        summary.innerHTML = `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:20px;
                flex-wrap:wrap;
            ">
                <div>
                    <span style="
                        display:block;
                        font-size:12px;
                        font-weight:800;
                        letter-spacing:1px;
                        color:#b66b50;
                        margin-bottom:8px;
                    ">
                        RESUMEN DE COBROS
                    </span>

                    <h2 style="
                        margin:0 0 6px;
                        font-size:23px;
                    ">
                        Total mensual a pagar
                    </h2>

                    <p style="
                        margin:0;
                        color:#73877e;
                        font-size:14px;
                    ">
                        Renta base + servicios mensuales
                    </p>
                </div>

                <strong style="
                    font-size:30px;
                    color:#153f34;
                ">
                    $${formatMoney(totals.monthlyTotal)}
                    <small style="font-size:13px;">MXN</small>
                </strong>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                gap:12px;
                flex-wrap:wrap;
                margin-top:18px;
                padding-top:18px;
                border-top:1px solid #dfe8df;
                font-size:14px;
            ">
                <span>
                    Renta:
                    <strong>$${formatMoney(totals.baseRent)}</strong>
                </span>

                <span>
                    Servicios:
                    <strong>$${formatMoney(totals.servicesTotal)}</strong>
                </span>
            </div>
        `;
    }

    // ==========================================
    // CARGAR PROPIEDAD DESDE EL BACKEND
    // ==========================================

    async function loadProperty() {
        let selectedProperty = null;

        try {
            selectedProperty = JSON.parse(
                sessionStorage.getItem(PROPERTY_KEY) || "null"
            );
        } catch {
            selectedProperty = null;
        }

        if (!selectedProperty?.id) {
            showMessage("No hay una propiedad seleccionada.");
            return;
        }

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("No se pudieron consultar las propiedades.");
            }

            const data = await response.json();

            if (!data.success || !Array.isArray(data.propiedades)) {
                throw new Error("Respuesta inválida del servidor.");
            }

            const savedProperty = data.propiedades.find(
                item => String(item.id) === String(selectedProperty.id)
            );

            if (!savedProperty) {
                throw new Error(
                    "La propiedad no existe en el archivo del proyecto."
                );
            }

            property = savedProperty;

            // Compatible con nombres del JSON y del frontend.
            property.name = property.name ?? property.nombre ?? "";
            property.address =
                property.address ?? property.direccion ?? "";
            property.type = property.type ?? property.tipo ?? "edificio";

            // Renta guardada en el JSON.
            rent = Number(
                property.rent ?? property.renta ?? 0
            );

            // Servicios guardados en el JSON.
            const savedServices =
                property.services ?? property.servicios ?? [];

            services = Array.isArray(savedServices)
                ? savedServices.map(service => ({
                    name: service.name ?? service.nombre ?? "",
                    amount: Number(
                        service.amount ?? service.importe ?? 0
                    )
                }))
                : [];

            renderProperty();
            renderServices();
            renderTotal();

            changesPending = false;
            showMessage("Datos cargados correctamente.");

        } catch (error) {
            console.error("Error al cargar propiedad:", error);
            showMessage(error.message);
        }
    }

    // ==========================================
    // MOSTRAR INFORMACIÓN DE LA PROPIEDAD
    // ==========================================

    function renderProperty() {
        if (!property) return;

        const pisos = property.pisos || [];

        const unitsFromFloors = Array.isArray(pisos)
            ? pisos.reduce((total, piso) => {
                if (Array.isArray(piso.departamentos)) {
                    return total + piso.departamentos.length;
                }

                return total + (Number(piso.departamentos) || 0);
            }, 0)
            : 0;

        $("propertyName").textContent =
            property.name || "Propiedad";

        $("propertyAddress").textContent =
            property.address || "Sin dirección";

        $("propertyUnits").textContent =
            property.totalUnits ?? unitsFromFloors;

        const icon = $("propertyIcon");

        if (icon) {
            icon.innerHTML = property.type === "casa"
                ? '<i class="fa-solid fa-house"></i>'
                : '<i class="fa-solid fa-building"></i>';
        }

        if (rentInput) {
            rentInput.value = rent;
        }
    }

    // ==========================================
    // MOSTRAR SERVICIOS
    // ==========================================

    function renderServices() {
        if (!servicesList) return;

        servicesList.replaceChildren();

        if (servicesEmpty) {
            servicesEmpty.hidden = services.length > 0;
        }

        services.forEach((service, index) => {

            const row = document.createElement("div");

            row.className = "service-row";
            row.dataset.index = index;

            row.innerHTML = `
                <div class="service-name">
                    <span class="service-icon">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </span>

                    <input
                        type="text"
                        class="service-name-input"
                        maxlength="80"
                        aria-label="Nombre del servicio"
                    >
                </div>

                <div class="service-amount">
                    <span>$</span>

                    <input
                        type="number"
                        class="service-price-input"
                        min="0"
                        step="0.01"
                        aria-label="Importe mensual"
                    >
                </div>

                <button
                    type="button"
                    class="delete-service"
                    title="Eliminar servicio"
                    aria-label="Eliminar servicio"
                >
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            row.querySelector(".service-name-input").value =
                service.name;

            row.querySelector(".service-price-input").value =
                service.amount;

            servicesList.appendChild(row);
        });

        renderTotal();
    }

    // ==========================================
    // EDITAR SERVICIOS
    // ==========================================

    servicesList?.addEventListener("input", event => {

        const row = event.target.closest(".service-row");
        if (!row) return;

        const index = Number(row.dataset.index);
        const service = services[index];

        if (!service) return;

        if (event.target.matches(".service-name-input")) {
            service.name = event.target.value;
        }

        if (event.target.matches(".service-price-input")) {
            service.amount = event.target.value;
        }

        markChanged();
        renderTotal();
    });

    // ==========================================
    // ELIMINAR SERVICIOS
    // ==========================================

    servicesList?.addEventListener("click", event => {

        const button = event.target.closest(".delete-service");
        if (!button) return;

        const row = button.closest(".service-row");
        if (!row) return;

        const index = Number(row.dataset.index);

        if (!services[index]) return;

        services.splice(index, 1);

        renderServices();
        markChanged();
    });

    // ==========================================
    // AÑADIR SERVICIO
    // ==========================================

    function openModal() {
        if (!modal) return;

        modal.hidden = false;
        $("newServiceName")?.focus();
    }

    function closeModal() {
        if (!modal) return;

        modal.hidden = true;
        form?.reset();
        addButton?.focus();
    }

    addButton?.addEventListener("click", openModal);

    closeModalButton?.addEventListener("click", closeModal);

    // Solo cerrar con la X.
    // No cerrar al hacer clic fuera ni con Escape.

    form?.addEventListener("submit", event => {

        event.preventDefault();

        const name = $("newServiceName").value.trim();
        const priceInput = $("newServicePrice");
        const amount = Number(priceInput.value);

        if (
            !name ||
            !validAmount(priceInput.value)
        ) {
            showMessage("Ingresa un servicio y un importe válido.");
            return;
        }

        services.push({
            name,
            amount
        });

        renderServices();
        closeModal();
        markChanged();
    });

    // ==========================================
    // MODIFICAR RENTA
    // ==========================================

    rentInput?.addEventListener("input", () => {
        rent = rentInput.value;

        markChanged();
        renderTotal();
    });

    // ==========================================
    // GUARDAR EN EL ARCHIVO HEARHOME.JSON
    // ==========================================

    saveButton?.addEventListener("click", async () => {

        if (saving) return;

        if (!property?.id) {
            showMessage("No hay una propiedad válida seleccionada.");
            return;
        }

        const validServices = services.every(service =>
            typeof service.name === "string" &&
            service.name.trim() &&
            validAmount(service.amount)
        );

        if (!validServices || !validAmount(rent)) {
            showMessage("Revisa los nombres y los importes.");
            return;
        }

        saving = true;
        saveButton.disabled = true;

        showMessage("Guardando cambios...");

        const payload = {
            rent: Number(rent),
            services: services.map(service => ({
                name: service.name.trim(),
                amount: Number(service.amount)
            }))
        };

        try {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(property.id)}/cobros`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "No se pudieron guardar los cobros."
                );
            }

            changesPending = false;

            showMessage(
                "Cambios guardados correctamente en HearHome."
            );

            console.log(
                "Cobros guardados en el backend:",
                data
            );

        } catch (error) {
            console.error("Error al guardar cobros:", error);

            showMessage(
                "Error al guardar: " + error.message
            );

        } finally {
            saving = false;
            saveButton.disabled = false;
        }
    });

    // ==========================================
    // CERRAR ADMINISTRACIÓN
    // ==========================================

    $("closeServices")?.addEventListener("click", () => {

        if (!modal?.hidden) {
            return;
        }

        if (
            changesPending &&
            !confirm(
                "Tienes cambios sin guardar. ¿Deseas salir?"
            )
        ) {
            return;
        }

        if (window.parent !== window) {

            window.parent.postMessage(
                {
                    source: "hearhome-property-services",
                    action: "close-services"
                },
                window.location.origin
            );

        } else {
            window.location.href = "admin-edificios.html";
        }
    });

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================

    loadProperty();

});
