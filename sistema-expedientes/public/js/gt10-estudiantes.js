
document.addEventListener("DOMContentLoaded", function () {

    function actualizarEstadisticas() {

        let estudiantes = [];

        try {
            estudiantes = JSON.parse(
                localStorage.getItem("students") || "[]"
            );

            if (!Array.isArray(estudiantes)) {
                estudiantes = [];
            }

        } catch (error) {
            console.error("Error al leer estudiantes:", error);
            return;
        }

        const total = estudiantes.length;

        const activos = estudiantes.filter(
            estudiante => estudiante.estado === "Activo"
        ).length;

        const inactivos = estudiantes.filter(
            estudiante => estudiante.estado === "Inactivo"
        ).length;

        const totalElement =
            document.getElementById("gt10TotalStudents");

        const activeElement =
            document.getElementById("gt10ActiveStudents");

        const inactiveElement =
            document.getElementById("gt10InactiveStudents");

        if (totalElement) totalElement.textContent = total;
        if (activeElement) activeElement.textContent = activos;
        if (inactiveElement) inactiveElement.textContent = inactivos;
    }

    actualizarEstadisticas();

});
