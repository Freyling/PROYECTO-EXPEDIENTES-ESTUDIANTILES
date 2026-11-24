
/* ==========================================
   GT10 - MENÚ PLEGABLE DEL ESTUDIANTE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const boton = document.getElementById("studentToggleSidebar");
    const sidebar = document.getElementById("studentPortalSidebar");

    if (!boton || !sidebar) {
        return;
    }

    boton.addEventListener("click", () => {

        const oculto = document.body.classList.toggle(
            "student-sidebar-hidden"
        );

        boton.setAttribute(
            "aria-expanded",
            String(!oculto)
        );

        boton.setAttribute(
            "aria-label",
            oculto ? "Mostrar menú lateral" : "Ocultar menú lateral"
        );

        boton.title = oculto
            ? "Mostrar menú"
            : "Ocultar menú";

    });

});
