
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const toggle = document.getElementById("togglePassword");
    const message = document.getElementById("loginMessage");
    const loginButton = document.getElementById("loginButton");

    // ==========================================
    // MOSTRAR / OCULTAR CONTRASEÑA
    // ==========================================

    toggle?.addEventListener("click", () => {
        const visible = password.type === "text";

        password.type = visible ? "password" : "text";
        toggle.textContent = visible ? "Ver" : "Ocultar";

        toggle.setAttribute(
            "aria-label",
            visible ? "Mostrar contraseña" : "Ocultar contraseña"
        );
    });

    // ==========================================
    // INICIAR SESIÓN
    // ==========================================

    form?.addEventListener("submit", event => {
        event.preventDefault();

        const correo = email.value.trim();
        const clave = password.value;

        message.textContent = "";

        if (!correo || !clave) {
            message.textContent = "Completa todos los campos.";
            return;
        }

        // TEMPORAL: autenticación local.
        // TODO BD: POST /api/auth/login
        const resultado = HearHomeAuth.login(correo, clave);

        if (!resultado.success) {
            message.textContent = resultado.message;
            password.value = "";
            password.focus();
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Ingresando...";

        // Redirigir según el rol del usuario.
        HearHomeAuth.redirectByRole(resultado.usuario);
    });

});
