
document.addEventListener("DOMContentLoaded", () => {

    const boton = document.getElementById("toggleSidebar");
    const menu = document.getElementById("gt10Sidebar");

    if (!boton || !menu) return;

    const icono = boton.querySelector("i");

    function actualizarBoton() {
        const oculto = document.body.classList.contains(
            "gt10-menu-hidden"
        );

        boton.setAttribute("aria-expanded", String(!oculto));

        boton.setAttribute(
            "aria-label",
            oculto ? "Mostrar menú lateral" : "Ocultar menú lateral"
        );

        icono.className = oculto
            ? "bi bi-layout-sidebar-inset-reverse"
            : "bi bi-layout-sidebar-inset";
    }

    boton.addEventListener("click", () => {
        document.body.classList.toggle("gt10-menu-hidden");
        actualizarBoton();
    });

    actualizarBoton();
});
