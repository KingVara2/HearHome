
document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("panel-admin");
    if (!contenedor) return;

    try {
        // Cargar encabezado compartido
        const respuesta = await fetch("components/panel-admin.html");

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        contenedor.innerHTML = await respuesta.text();

        // Elementos del encabezado
        const menuButton = contenedor.querySelector("#menuButton");
        const mainMenu = contenedor.querySelector("#mainMenu");
        const profileButton = contenedor.querySelector("#profileButton");
        const profileMenu = contenedor.querySelector("#profileMenu");

        function cerrarMenus() {
            mainMenu?.classList.remove("show");
            profileMenu?.classList.remove("show");

            menuButton?.setAttribute("aria-expanded", "false");
            profileButton?.setAttribute("aria-expanded", "false");
        }

        function configurarMenu(boton, menu) {
            if (!boton || !menu) return;

            boton.addEventListener("click", (event) => {
                event.stopPropagation();

                const estabaAbierto = menu.classList.contains("show");
                cerrarMenus();

                if (!estabaAbierto) {
                    menu.classList.add("show");
                    boton.setAttribute("aria-expanded", "true");
                }
            });
        }

        configurarMenu(menuButton, mainMenu);
        configurarMenu(profileButton, profileMenu);

        // Cerrar al hacer clic fuera
        document.addEventListener("click", (event) => {
            if (!contenedor.contains(event.target)) {
                cerrarMenus();
            }
        });

        // Cerrar con Escape
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") cerrarMenus();
        });

        // Marcar automáticamente la página actual
        const paginaActual = window.location.pathname.split("/").pop();

        contenedor.querySelectorAll(".menu-link").forEach((enlace) => {
            const destino = enlace.getAttribute("href");

            enlace.classList.toggle("active", destino === paginaActual);
        });

    } catch (error) {
        console.error("No se pudo cargar el panel administrativo:", error);
    }
});
