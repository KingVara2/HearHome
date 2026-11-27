
document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const form = $("newBuildingForm");
    const step1 = $("builderStep1");
    const step2 = $("builderStep2");
    const message = $("newBuildingMessage");

    const nameInput = $("propertyName");
    const addressInput = $("propertyAddress");
    const floorInput = $("floorCount");

    const floorEditor = $("floorEditor");
    const buildingPreview = $("buildingPreview");

    const MAX_FLOORS = 30;
    const MAX_UNITS = 30;
    const DEFAULT_UNITS = 4;

    let propertyType = "edificio";
    let floors = [4, 4, 4];
    let currentStep = 1;

    // ==========================================
    // FUNCIONES GENERALES
    // ==========================================

    function limit(value, min, max) {
        const number = Number(value);

        if (!Number.isFinite(number)) return min;

        return Math.max(min, Math.min(max, Math.trunc(number)));
    }

    function totalUnits() {
        return floors.reduce((total, units) => total + units, 0);
    }

    function showMessage(text) {
        message.textContent = text;
    }

    // ==========================================
    // NAVEGACIÓN ENTRE PANTALLAS
    // ==========================================

    function showStep(step) {
        currentStep = step;

        step1.hidden = step !== 1;
        step2.hidden = step !== 2;

        document.querySelectorAll(".progress-dot").forEach(dot => {
            dot.classList.toggle(
                "active",
                Number(dot.dataset.step) <= step
            );
        });

        showMessage("");
        window.scrollTo(0, 0);
    }

    function updatePropertyType() {
        propertyType = document.querySelector(
            'input[name="propertyType"]:checked'
        ).value;

        const isHouse = propertyType === "casa";

        $("nextStepText").textContent = isHouse
            ? "Crear casa"
            : "Continuar";

        $("nextStepIcon").className = isHouse
            ? "fa-solid fa-check"
            : "fa-solid fa-arrow-right";

        $("builderProgress").hidden = isHouse;
    }

    function validateGeneralInfo() {
        if (!nameInput.value.trim()) {
            showMessage("Ingresa el nombre de la propiedad.");
            nameInput.focus();
            return false;
        }

        if (!addressInput.value.trim()) {
            showMessage("Ingresa la ubicación de la propiedad.");
            addressInput.focus();
            return false;
        }

        return true;
    }

    $("nextBuilderStep").addEventListener("click", () => {
        if (!validateGeneralInfo()) return;

        if (propertyType === "casa") {
            createProperty();
        } else {
            showStep(2);
        }
    });

    $("previousBuilderStep").addEventListener("click", () => {
        showStep(1);
    });

    document.querySelectorAll('input[name="propertyType"]').forEach(radio => {
        radio.addEventListener("change", updatePropertyType);
    });

    // ==========================================
    // NÚMERO DE PISOS
    // ==========================================

    function setFloorCount(value) {
        const count = limit(value, 1, MAX_FLOORS);

        while (floors.length < count) {
            floors.push(DEFAULT_UNITS);
        }

        floors = floors.slice(0, count);

        render();
    }

    $("decreaseFloors").addEventListener("click", () => {
        setFloorCount(floors.length - 1);
    });

    $("increaseFloors").addEventListener("click", () => {
        setFloorCount(floors.length + 1);
    });

    floorInput.addEventListener("change", () => {
        setFloorCount(floorInput.value);
    });

    // ==========================================
    // PERSONALIZAR DEPARTAMENTOS POR PISO
    // ==========================================

    function renderFloorEditor() {
        floorEditor.innerHTML = floors.map((units, index) => `
            <div class="floor-row" data-index="${index}">

                <div class="floor-info">
                    <i class="fa-solid fa-layer-group"></i>

                    <div>
                        <strong>Piso ${index + 1}</strong>
                        <small>
                            ${units} ${units === 1 ? "departamento" : "departamentos"}
                        </small>
                    </div>
                </div>

                <div class="floor-counter">

                    <button
                        type="button"
                        data-action="minus"
                        aria-label="Quitar departamento del piso ${index + 1}"
                        ${units <= 1 ? "disabled" : ""}
                    >
                        <i class="fa-solid fa-minus"></i>
                    </button>

                    <input
                        type="number"
                        min="1"
                        max="${MAX_UNITS}"
                        value="${units}"
                        aria-label="Departamentos del piso ${index + 1}"
                    >

                    <button
                        type="button"
                        data-action="plus"
                        aria-label="Agregar departamento al piso ${index + 1}"
                        ${units >= MAX_UNITS ? "disabled" : ""}
                    >
                        <i class="fa-solid fa-plus"></i>
                    </button>

                </div>
            </div>
        `).join("");
    }

    floorEditor.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        const row = button.closest(".floor-row");
        const index = Number(row.dataset.index);

        const change = button.dataset.action === "plus" ? 1 : -1;

        floors[index] = limit(
            floors[index] + change,
            1,
            MAX_UNITS
        );

        render();
    });

    floorEditor.addEventListener("change", event => {
        if (!event.target.matches("input")) return;

        const row = event.target.closest(".floor-row");
        const index = Number(row.dataset.index);

        floors[index] = limit(
            event.target.value,
            1,
            MAX_UNITS
        );

        render();
    });

    // ==========================================
    // VISTA PREVIA DEL EDIFICIO
    // ==========================================

    function renderBuilding() {
        buildingPreview.innerHTML = [...floors]
            .reverse()
            .map((units, reverseIndex) => {

                const floorNumber = floors.length - reverseIndex;

                const apartments = Array.from(
                    { length: units },
                    (_, index) => {

                        const number =
                            `${floorNumber}${String(index + 1).padStart(2, "0")}`;

                        return `
                            <div
                                class="preview-unit"
                                title="Departamento ${number}"
                            >
                                ${number}
                            </div>
                        `;
                    }
                ).join("");

                return `
                    <div class="preview-floor">
                        ${apartments}
                    </div>
                `;
            })
            .join("");
    }

    function render() {
        floorInput.value = floors.length;

        $("decreaseFloors").disabled = floors.length <= 1;
        $("increaseFloors").disabled = floors.length >= MAX_FLOORS;

        $("totalUnits").textContent =
            `${totalUnits()} ${totalUnits() === 1 ? "unidad" : "unidades"}`;

        renderFloorEditor();
        renderBuilding();
    }

    // ==========================================
    // CREAR CASA O EDIFICIO
    // ==========================================

    function createProperty() {
        if (!validateGeneralInfo()) return;

        const isHouse = propertyType === "casa";

        const property = {
            name: nameInput.value.trim(),
            address: addressInput.value.trim(),
            type: propertyType,

            floors: isHouse
                ? [{
                    number: 1,
                    apartments: [{ number: "1" }]
                }]
                : floors.map((units, index) => ({
                    number: index + 1,
                    apartments: Array.from(
                        { length: units },
                        (_, unitIndex) => ({
                            number: `${index + 1}${String(unitIndex + 1).padStart(2, "0")}`
                        })
                    )
                })),

            totalUnits: isHouse ? 1 : totalUnits(),
            residents: 0
        };

        if (window.parent !== window) {
            window.parent.postMessage({
                source: "hearhome-property-builder",
                action: "property-created",
                property
            }, window.location.origin);
        } else {
            showMessage("Abre el constructor desde la página de edificios.");
        }
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (propertyType === "casa") {
            createProperty();
            return;
        }

        if (currentStep === 1) {
            if (validateGeneralInfo()) showStep(2);
            return;
        }

        createProperty();
    });

    // ==========================================
    // CANCELAR
    // ==========================================

    $("cancelNewBuilding").addEventListener("click", () => {
        if (window.parent !== window) {
            window.parent.postMessage({
                source: "hearhome-property-builder",
                action: "close-builder"
            }, window.location.origin);
        } else {
            window.location.href = "admin-edificios.html";
        }
    });

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================

    updatePropertyType();
    render();
    showStep(1);

});
