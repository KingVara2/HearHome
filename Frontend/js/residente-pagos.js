
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // CONFIGURACIÓN
    // ==========================================

    const API_URL = "http://localhost:3000/api/propiedades";

    // TEMPORAL:
    // Este residente pertenece a Residencial Los Olivos.
    // Después relacionaremos cada usuario con su
    // propiedad y departamento desde el backend.
    const RESIDENT_PROPERTY_ID = "prop-001";
    const RESIDENT_UNIT = "Departamento 204";

    const $ = id => document.getElementById(id);

    // ==========================================
    // FORMATO DE DINERO
    // ==========================================

    function formatMoney(value) {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    // ==========================================
    // MENSAJES DEL SISTEMA
    // ==========================================

    function showMessage(message) {
        const element = $("paymentStatusMessage");

        if (element) {
            element.textContent = message;
        }
    }

    // ==========================================
    // NORMALIZAR DATOS DEL BACKEND
    // ==========================================

    function normalizeProperty(data) {

        const savedServices =
            data.services ?? data.servicios ?? [];

        const services = Array.isArray(savedServices)
            ? savedServices.map(service => ({
                name: service.name ?? service.nombre ?? "",
                amount: Number(
                    service.amount ?? service.importe ?? 0
                )
            }))
            : [];

        return {
            id: String(data.id),
            name: data.name ?? data.nombre ?? "Propiedad",
            address: data.address ?? data.direccion ?? "",
            type: data.type ?? data.tipo ?? "edificio",
            rent: Number(data.rent ?? data.renta ?? 0),
            services
        };
    }

    // ==========================================
    // CALCULAR COBROS
    // ==========================================

    function calculatePayments(property) {

        const baseRent = property.rent;

        const servicesTotal = property.services.reduce(
            (total, service) => {
                return total + service.amount;
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
    // MOSTRAR PROPIEDAD
    // ==========================================

    function renderProperty(property) {

        $("paymentPropertyName").textContent = property.name;

        $("paymentUnitName").textContent = RESIDENT_UNIT;

        const propertyIcon = document.querySelector(
            ".payment-property-icon i"
        );

        if (propertyIcon) {
            propertyIcon.className =
                property.type === "casa"
                    ? "fa-solid fa-house"
                    : "fa-solid fa-building";
        }
    }

    // ==========================================
    // MOSTRAR RESUMEN DE PAGOS
    // ==========================================

    function renderSummary(property) {

        const totals = calculatePayments(property);

        // Tarjeta principal
        $("paymentMonthlyTotal").textContent =
            formatMoney(totals.monthlyTotal);

        // Renta base
        $("paymentBaseRent").textContent =
            formatMoney(totals.baseRent);

        // Total de servicios
        $("paymentServicesTotal").textContent =
            formatMoney(totals.servicesTotal);

        // Número de servicios
        $("paymentServicesCount").textContent =
            property.services.length;

        // Desglose
        $("breakdownRent").textContent =
            formatMoney(totals.baseRent);

        $("breakdownTotal").textContent =
            formatMoney(totals.monthlyTotal);
    }

    // ==========================================
    // MOSTRAR SERVICIOS
    // ==========================================

    function renderServices(services) {

        const container = $("paymentServicesList");

        if (!container) return;

        container.replaceChildren();

        if (services.length === 0) {

            const message = document.createElement("p");

            message.className = "loading-services";
            message.textContent =
                "Esta propiedad no tiene servicios adicionales.";

            container.appendChild(message);
            return;
        }

        services.forEach(service => {

            const row = document.createElement("div");
            row.className = "breakdown-row";

            const nameContainer = document.createElement("div");
            nameContainer.className = "breakdown-name";

            const icon = document.createElement("span");
            icon.className = "breakdown-icon";

            const iconElement = document.createElement("i");
            iconElement.className =
                "fa-solid fa-file-invoice-dollar";

            icon.appendChild(iconElement);

            const name = document.createElement("span");
            name.textContent = service.name;

            nameContainer.appendChild(icon);
            nameContainer.appendChild(name);

            const amount = document.createElement("strong");
            amount.textContent = formatMoney(service.amount);

            row.appendChild(nameContainer);
            row.appendChild(amount);

            container.appendChild(row);
        });
    }

    // ==========================================
    // HISTORIAL DE PAGOS
    // ==========================================

    function renderPaymentHistory() {

        const container = $("paymentHistoryBody");

        if (!container) return;

        // Por ahora no existe un registro real
        // de pagos en hearhome.json.
        // No inventamos pagos anteriores.

        container.innerHTML = `
            <tr>
                <td colspan="4" class="history-empty">
                    <i class="fa-solid fa-receipt"></i>
                    Todavía no hay pagos registrados.
                </td>
            </tr>
        `;
    }

    // ==========================================
    // FECHA DE VENCIMIENTO
    // ==========================================

    function renderDueDate() {

        const element = $("paymentDueDate");

        if (!element) return;

        // Todavía no existe una fecha de pago
        // configurada en el backend.

        element.textContent = "Por configurar";
    }

    // ==========================================
    // CONSULTAR EL BACKEND
    // ==========================================

    async function loadPayments() {

        showMessage("Consultando información de pagos...");

        try {

            const response = await fetch(API_URL, {
                method: "GET",
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    `El servidor respondió con error ${response.status}.`
                );
            }

            const data = await response.json();

            if (
                !data.success ||
                !Array.isArray(data.propiedades)
            ) {
                throw new Error(
                    "El servidor devolvió información inválida."
                );
            }

            // Buscar la propiedad asignada al residente.
            const savedProperty = data.propiedades.find(
                property =>
                    String(property.id) === RESIDENT_PROPERTY_ID
            );

            if (!savedProperty) {
                throw new Error(
                    "No se encontró la propiedad asignada al residente."
                );
            }

            const property = normalizeProperty(savedProperty);

            // Validar que los importes sean correctos.
            const validAmounts =
                Number.isFinite(property.rent) &&
                property.rent >= 0 &&
                property.services.every(service =>
                    Number.isFinite(service.amount) &&
                    service.amount >= 0
                );

            if (!validAmounts) {
                throw new Error(
                    "La propiedad tiene importes incorrectos."
                );
            }

            // Mostrar datos actualizados.
            renderProperty(property);
            renderSummary(property);
            renderServices(property.services);
            renderPaymentHistory();
            renderDueDate();

            showMessage(
                "Importes actualizados desde HearHome."
            );

            console.log(
                "Pagos del residente cargados:",
                property
            );

        } catch (error) {

            console.error(
                "Error al consultar los pagos:",
                error
            );

            showMessage(
                "No se pudieron cargar los pagos: " +
                error.message
            );

            const servicesList = $("paymentServicesList");

            if (servicesList) {
                servicesList.textContent =
                    "No fue posible consultar los servicios.";
            }
        }
    }

    // ==========================================
    // MENÚ DEL PERFIL
    // ==========================================

    const profileButton = $("residentProfileButton");
    const profileDropdown = $("residentProfileDropdown");

    function closeProfileMenu() {

        if (!profileDropdown || !profileButton) return;

        profileDropdown.hidden = true;
        profileButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    profileButton?.addEventListener("click", event => {

        event.stopPropagation();

        if (!profileDropdown) return;

        const shouldOpen = profileDropdown.hidden;

        profileDropdown.hidden = !shouldOpen;

        profileButton.setAttribute(
            "aria-expanded",
            String(shouldOpen)
        );
    });

    document.addEventListener("click", event => {

        if (
            profileDropdown &&
            !profileDropdown.contains(event.target) &&
            !profileButton?.contains(event.target)
        ) {
            closeProfileMenu();
        }
    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeProfileMenu();
        }
    });

    // ==========================================
    // CERRAR SESIÓN
    // ==========================================

    document.querySelectorAll(".logout-link").forEach(link => {

        link.addEventListener("click", () => {

            // Sesión de demostración.
            // No eliminamos propiedades ni cobros.
            sessionStorage.removeItem("hearhome-sesion");

        });
    });

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================

    renderPaymentHistory();
    renderDueDate();
    loadPayments();

});
