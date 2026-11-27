
document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const searchInput = $("searchBuilding");
    const emptyState = $("emptyState");
    const grid = $("buildingsGrid");

    // ==========================================
    // CONFIGURACIÓN DEL BACKEND
    // ==========================================

    const API_URL = "http://localhost:3000/api/propiedades";
    const CURRENT_PROPERTY_KEY = "hearhome-propiedad-actual";

    let propertiesCache = [];
    let savingProperty = false;

    // ==========================================
    // NORMALIZAR DATOS
    // ==========================================

    function normalizeProperty(property) {
        const pisos = property.pisos || property.floors || [];

        const unidades = Array.isArray(pisos)
            ? pisos.reduce((total, piso) => {
                const departamentos = piso.departamentos;

                if (Array.isArray(departamentos)) {
                    return total + departamentos.length;
                }

                return total + (Number(departamentos) || 0);
            }, 0)
            : 0;

        return {
            ...property,
            id: String(property.id || ""),
            name: property.name ?? property.nombre ?? "",
            address: property.address ?? property.direccion ?? "",
            type: property.type ?? property.tipo ?? "edificio",
            totalUnits: Number(
                property.totalUnits ?? unidades
            ),
            residents: Number(property.residents ?? 0)
        };
    }

    // ==========================================
    // CONSULTAR PROPIEDADES
    // ==========================================

    async function getSavedProperties() {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status} al consultar propiedades.`
            );
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.propiedades)) {
            throw new Error("La API devolvió datos inválidos.");
        }

        propertiesCache = data.propiedades.map(normalizeProperty);

        return propertiesCache;
    }

    // ==========================================
    // GUARDAR PROPIEDAD EN EL PROYECTO
    // ==========================================

    async function saveProperty(property) {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(property)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "No se pudo guardar la propiedad."
            );
        }

        const savedProperty = normalizeProperty(data.propiedad);

        propertiesCache.push(savedProperty);

        return savedProperty;
    }

    // ==========================================
    // CONSTRUCTOR DE PROPIEDADES
    // ==========================================

    const builderOverlay = $("newBuildingModal");
    const openButton = $("openNewBuilding");
    const closeButton = $("closeNewBuilding");
    const builderFrame = builderOverlay?.querySelector("iframe");

    // ==========================================
    // VENTANA DE ADMINISTRACIÓN
    // ==========================================

    const servicesOverlay = document.createElement("div");

    servicesOverlay.id = "servicesOverlay";
    servicesOverlay.hidden = true;

    servicesOverlay.innerHTML = `
        <div
            class="services-window"
            role="dialog"
            aria-modal="true"
            aria-label="Administrar propiedad"
        >
            <iframe
                id="servicesFrame"
                title="Administración de propiedad"
                src="about:blank"
            ></iframe>
        </div>
    `;

    document.body.appendChild(servicesOverlay);

    const servicesFrame = $("servicesFrame");
    let lastManageButton = null;

    function updateScrollLock() {
        const builderOpen =
            builderOverlay && !builderOverlay.hidden;

        const servicesOpen = !servicesOverlay.hidden;

        document.body.style.overflow =
            builderOpen || servicesOpen ? "hidden" : "";
    }

    // ==========================================
    // ABRIR ADMINISTRACIÓN
    // ==========================================

    async function openPropertyServices(button) {
        const card = button.closest(".building-card");

        if (!card) return;

        const propertyId = card.dataset.propertyId;

        let property = propertiesCache.find(
            item => item.id === propertyId
        );

        // Si la propiedad no está en memoria,
        // recuperarla nuevamente desde el backend.
        if (!property) {
            try {
                const properties = await getSavedProperties();

                property = properties.find(
                    item => item.id === propertyId
                );
            } catch (error) {
                console.error(error);
            }
        }

        // Compatibilidad con tarjetas de demostración.
        if (!property) {
            property = {
                id: propertyId || button.dataset.building,
                name: button.dataset.building || "",
                address: button.dataset.address || "",
                type: button.dataset.type || "edificio",
                totalUnits: Number(button.dataset.units) || 0,
                residents: Number(button.dataset.residents) || 0
            };
        }

        // La propiedad seleccionada se comparte
        // temporalmente con admin-servicios.html.
        sessionStorage.setItem(
            CURRENT_PROPERTY_KEY,
            JSON.stringify(property)
        );

        lastManageButton = button;

        servicesOverlay.hidden = false;
        servicesFrame.src = "admin-servicios.html";

        updateScrollLock();
    }

    function closePropertyServices() {
        servicesOverlay.hidden = true;
        servicesFrame.src = "about:blank";

        updateScrollLock();
        lastManageButton?.focus();
    }

    document.addEventListener("click", event => {
        const button = event.target.closest(".card-button");

        if (!button) return;

        openPropertyServices(button);
    });

    // ==========================================
    // BUSCADOR DE EDIFICIOS
    // ==========================================

    function filterBuildings() {
        const search = (searchInput?.value || "")
            .toLowerCase()
            .trim();

        let visibleCards = 0;

        grid?.querySelectorAll(".building-card").forEach(card => {

            if (card.classList.contains("building-placeholder")) {
                card.hidden = search !== "";
                return;
            }

            const name = (card.dataset.name || "").toLowerCase();
            const visible = name.includes(search);

            card.hidden = !visible;

            if (visible) {
                visibleCards++;
            }
        });

        if (emptyState) {
            emptyState.hidden =
                visibleCards > 0 || search === "";
        }
    }

    searchInput?.addEventListener("input", filterBuildings);

    // ==========================================
    // ABRIR Y CERRAR CONSTRUCTOR
    // ==========================================

    function openBuilder() {
        if (!builderOverlay) return;

        builderOverlay.hidden = false;
        updateScrollLock();

        closeButton?.focus();
    }

    function closeBuilder() {
        if (!builderOverlay) return;

        builderOverlay.hidden = true;
        updateScrollLock();

        openButton?.focus();
    }

    openButton?.addEventListener("click", openBuilder);
    closeButton?.addEventListener("click", closeBuilder);

    builderOverlay?.addEventListener("click", event => {
        if (event.target === builderOverlay) {
            closeBuilder();
        }
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            builderOverlay &&
            !builderOverlay.hidden
        ) {
            closeBuilder();
        }
    });

    // ==========================================
    // CREAR TARJETAS
    // ==========================================

    function createBuildingCard(property) {
        if (!grid) return;

        property = normalizeProperty(property);

        // Evitar duplicados.
        if (
            property.id &&
            [...grid.querySelectorAll("[data-property-id]")]
                .some(card =>
                    card.dataset.propertyId === property.id
                )
        ) {
            return;
        }

        const styles = [
            "visual-olivos",
            "visual-valle",
            "visual-aurora",
            "visual-monteverde"
        ];

        const icons = [
            "fa-building",
            "fa-city",
            "fa-house-chimney",
            "fa-tree-city"
        ];

        const index = grid.querySelectorAll(
            ".building-card:not(.building-placeholder)"
        ).length;

        const isHouse = property.type === "casa";
        const visualClass = styles[index % styles.length];

        const iconClass = isHouse
            ? "fa-house"
            : icons[index % icons.length];

        const card = document.createElement("article");

        card.className = "building-card";
        card.dataset.name = property.name;
        card.dataset.propertyId = property.id;

        card.innerHTML = `
            <div class="card-visual ${visualClass}">

                <div class="card-visual-icon">
                    <i class="fa-solid ${iconClass}"></i>
                </div>

                <span class="building-status">
                    <span class="status-dot"></span>
                    Activo
                </span>

            </div>

            <div class="card-content">

                <div class="card-topline">
                    <span class="card-category">
                        ${isHouse ? "CASA" : "EDIFICIO"}
                    </span>

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </div>

                <h3 class="property-name"></h3>

                <p class="card-address">
                    <i class="fa-solid fa-location-dot"></i>
                    <span class="property-address"></span>
                </p>

                <div class="card-divider"></div>

                <div class="card-stats">

                    <div class="stat">
                        <span class="stat-icon">
                            <i class="fa-solid fa-door-closed"></i>
                        </span>

                        <div>
                            <strong class="property-units"></strong>
                            <small>Unidades</small>
                        </div>
                    </div>

                    <div class="stat">
                        <span class="stat-icon">
                            <i class="fa-solid fa-users"></i>
                        </span>

                        <div>
                            <strong class="property-residents"></strong>
                            <small>Residentes</small>
                        </div>
                    </div>

                </div>

                <button type="button" class="card-button">
                    ${isHouse ? "Administrar casa" : "Administrar edificio"}
                    <i class="fa-solid fa-arrow-right"></i>
                </button>

            </div>
        `;

        card.querySelector(".property-name").textContent =
            property.name;

        card.querySelector(".property-address").textContent =
            property.address;

        card.querySelector(".property-units").textContent =
            property.totalUnits;

        card.querySelector(".property-residents").textContent =
            property.residents;

        const manage = card.querySelector(".card-button");

        manage.dataset.building = property.name;
        manage.dataset.address = property.address;
        manage.dataset.units = String(property.totalUnits);
        manage.dataset.residents = String(property.residents);
        manage.dataset.type = property.type;

        const placeholder = grid.querySelector(
            ".building-placeholder"
        );

        if (placeholder) {
            placeholder.replaceWith(card);
        } else {
            grid.appendChild(card);
        }

        filterBuildings();
    }

    // ==========================================
    // CARGAR PROPIEDADES GUARDADAS
    // ==========================================

    async function loadSavedProperties() {
        try {
            const properties = await getSavedProperties();

            properties.forEach(property => {
                createBuildingCard(property);
            });

            console.log(
                `HearHome: ${properties.length} propiedades cargadas.`
            );

        } catch (error) {
            console.error(
                "No se pudieron cargar las propiedades:",
                error
            );

            alert(
                "No se pudo conectar con el servidor de HearHome. " +
                "Comprueba que Node.js esté ejecutándose."
            );
        }

        filterBuildings();
    }

    // ==========================================
    // MENSAJES DE LOS IFRAME
    // ==========================================

    window.addEventListener("message", async event => {

        if (event.origin !== window.location.origin) {
            return;
        }

        // CERRAR ADMINISTRACIÓN
        if (
            event.source === servicesFrame.contentWindow &&
            event.data?.source === "hearhome-property-services" &&
            event.data?.action === "close-services"
        ) {
            closePropertyServices();
            return;
        }

        // MENSAJES DEL CONSTRUCTOR
        if (
            !builderFrame ||
            event.source !== builderFrame.contentWindow ||
            event.data?.source !== "hearhome-property-builder"
        ) {
            return;
        }

        if (event.data.action === "close-builder") {
            closeBuilder();
            return;
        }

        if (event.data.action !== "property-created") {
            return;
        }

        const property = event.data.property;

        if (
            !property ||
            typeof property.name !== "string" ||
            !property.name.trim() ||
            typeof property.address !== "string" ||
            !property.address.trim() ||
            !["casa", "edificio"].includes(property.type) ||
            !Number.isInteger(property.totalUnits) ||
            property.totalUnits < 1 ||
            property.totalUnits > 900
        ) {
            alert("Los datos de la propiedad no son válidos.");
            return;
        }

        if (savingProperty) return;

        savingProperty = true;

        try {
            // GUARDAR EN EL ARCHIVO DEL PROYECTO
            const savedProperty = await saveProperty(property);

            // MOSTRAR LA PROPIEDAD GUARDADA
            createBuildingCard(savedProperty);

            // REINICIAR EL CONSTRUCTOR
            if (builderFrame) {
                builderFrame.src =
                    builderFrame.getAttribute("src");
            }

            closeBuilder();

            if (searchInput) {
                searchInput.value = "";
            }

            filterBuildings();

            console.log(
                "Propiedad guardada en el backend:",
                savedProperty
            );

        } catch (error) {
            console.error("Error al guardar propiedad:", error);

            alert(
                "No se pudo guardar la propiedad en HearHome.\n\n" +
                error.message +
                "\n\nVerifica que el backend esté encendido."
            );

        } finally {
            savingProperty = false;
        }
    });

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================

    loadSavedProperties();
    filterBuildings();

});
