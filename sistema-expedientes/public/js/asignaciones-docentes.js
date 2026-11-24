document.addEventListener("DOMContentLoaded", function () {

    const assignmentSubject = document.getElementById("assignmentSubject");

    if (!assignmentSubject) return;

    let subjects = [];

    try {
        const saved = JSON.parse(
            localStorage.getItem("subjects") || "[]"
        );

        subjects = Array.isArray(saved) ? saved : [];

    } catch (error) {
        console.error("Error al cargar asignaturas:", error);
    }

    const activeSubjects = subjects.filter(
        subject => subject.estado === "Activa"
    );

    activeSubjects.sort((a, b) =>
        (a.nombre || "").localeCompare(b.nombre || "")
    );

    activeSubjects.forEach(function (subject) {

        const option = document.createElement("option");

        option.value = String(subject.id);

        option.textContent =
            `${subject.nombre} (${subject.codigo}) - ${subject.nivel}`;

        assignmentSubject.appendChild(option);

    });
    /* =====================================================
       CARGAR DOCENTES REGISTRADOS
    ===================================================== */

    const assignmentTeacher =
        document.getElementById("assignmentTeacher");

    if (assignmentTeacher) {

        let users = [];

        try {
            const saved = JSON.parse(
                localStorage.getItem("systemUsers") || "[]"
            );

            users = Array.isArray(saved) ? saved : [];

        } catch (error) {
            console.error("Error al cargar docentes:", error);
        }

        const teachers = users
            .filter(user =>
                user.rol === "Personal educativo" &&
                user.estado === "Activo"
            )
            .sort((a, b) =>
                (a.nombre || "").localeCompare(b.nombre || "")
            );

        teachers.forEach(function (teacher) {

            const option = document.createElement("option");

            option.value = String(teacher.id);
            option.textContent = teacher.nombre;

            assignmentTeacher.appendChild(option);

        });

    }

        /* =====================================================
       GUARDAR ASIGNACIONES DOCENTES
    ===================================================== */

    const assignmentForm =
        document.getElementById("teacherAssignmentForm");

    const assignmentMessage =
        document.getElementById("assignmentMessage");

    function showAssignmentMessage(message, type) {

        if (!assignmentMessage) return;

        assignmentMessage.textContent = message;

        assignmentMessage.className =
            `alert alert-${type} mb-4`;

    }

    if (assignmentForm) {

        assignmentForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const teacherId =
                document.getElementById("assignmentTeacher").value;

            const subjectId =
                document.getElementById("assignmentSubject").value;

            const grade =
                document.getElementById("assignmentGrade").value.trim();

            const section =
                document.getElementById("assignmentSection")
                    .value.trim().toUpperCase();

            const year =
                document.getElementById("assignmentYear").value;

            const status =
                document.getElementById("assignmentStatus").value;

            if (!teacherId || !subjectId || !grade || !section || !year) {
                showAssignmentMessage(
                    "Completa todos los campos obligatorios.",
                    "danger"
                );
                return;
            }

            const selectedSubject = subjects.find(
    subject => String(subject.id) === subjectId
);

if (!selectedSubject) {
    showAssignmentMessage(
        "La asignatura seleccionada no existe.",
        "danger"
    );
    return;
}

function normalizarGrado(valor) {
    return String(valor || "")
        .trim()
        .toLowerCase()
        .replace(/\b(\d+)mo\b/g, "$1no")
        .replace(/\s+/g, " ");
}

if (
    normalizarGrado(selectedSubject.nivel) !==
    normalizarGrado(grade)
) {
    showAssignmentMessage(
        `Esta asignatura corresponde a ${selectedSubject.nivel}. Corrige el grado.`,
        "warning"
    );
    return;
}
            const currentUser = window.Auth?.currentUser;

            if (!currentUser || currentUser.rol !== "Administrador") {
                showAssignmentMessage(
                    "Solo el administrador puede registrar asignaciones.",
                    "danger"
                );
                return;
            }

            let assignments = [];

            try {
                const saved = JSON.parse(
                    localStorage.getItem("teacherAssignments") || "[]"
                );

                assignments = Array.isArray(saved) ? saved : [];

            } catch (error) {
                showAssignmentMessage(
                    "No se pudieron leer las asignaciones existentes.",
                    "danger"
                );
                return;
            }
            const editingId = document.getElementById(
    "editingAssignmentId"
).value;

if (editingId) {

    const existingAssignment = assignments.find(
        item => String(item.id) === editingId
    );

    if (!existingAssignment) {
        showAssignmentMessage(
            "No se encontró la asignación que deseas editar.",
            "danger"
        );
        return;
    }

    const duplicateEdit = assignments.some(function (item) {
        return (
            String(item.id) !== editingId &&
            String(item.docenteId) === teacherId &&
            String(item.asignaturaId) === subjectId &&
            String(item.grado).trim().toLowerCase() === grade.toLowerCase() &&
            String(item.seccion).trim().toUpperCase() === section &&
            String(item.anio) === year
        );
    });

    if (duplicateEdit) {
        showAssignmentMessage(
            "Ya existe otra asignación con esos mismos datos.",
            "warning"
        );
        return;
    }

    existingAssignment.docenteId = teacherId;
    existingAssignment.asignaturaId = subjectId;
    existingAssignment.grado = grade;
    existingAssignment.seccion = section;
    existingAssignment.anio = Number(year);
    existingAssignment.estado = status;

    try {
        localStorage.setItem(
            "teacherAssignments",
            JSON.stringify(assignments)
        );
    } catch (error) {
        showAssignmentMessage(
            "No se pudieron guardar los cambios.",
            "danger"
        );
        return;
    }

    assignmentForm.reset();

    document.getElementById("editingAssignmentId").value = "";

    document.getElementById("assignmentYear").value =
        new Date().getFullYear();

    renderTeacherAssignments();

    showAssignmentMessage(
        "Asignación docente actualizada correctamente.",
        "success"
    );

    return;
}
            const duplicate = assignments.some(function (item) {

                return (
                    String(item.docenteId) === teacherId &&
                    String(item.asignaturaId) === subjectId &&
                    String(item.grado).trim().toLowerCase() ===
                        grade.toLowerCase() &&
                    String(item.seccion).trim().toUpperCase() === section &&
                    String(item.anio) === year
                );

            });

            if (duplicate) {
                showAssignmentMessage(
                    "Esta asignación docente ya está registrada.",
                    "warning"
                );
                return;
            }

            const newAssignment = {

                id: crypto.randomUUID(),

                docenteId: teacherId,
                asignaturaId: subjectId,

                grado: grade,
                seccion: section,
                anio: Number(year),

                estado: status,

                fechaRegistro: new Date().toISOString()

            };

            assignments.push(newAssignment);

            try {
                localStorage.setItem(
                    "teacherAssignments",
                    JSON.stringify(assignments)
                );
            } catch (error) {
                showAssignmentMessage(
                    "No se pudo guardar la asignación.",
                    "danger"
                );
                return;
            }

            showAssignmentMessage(
                "Asignación docente registrada correctamente.",
                "success"
            );

            assignmentForm.reset();

            document.getElementById("assignmentYear").value =
                new Date().getFullYear();
                renderTeacherAssignments();

        });

    }

        /* =====================================================
       MOSTRAR ASIGNACIONES DOCENTES REGISTRADAS
    ===================================================== */

    function renderTeacherAssignments() {

        const tableBody = document.getElementById(
            "teacherAssignmentsTableBody"
        );

        if (!tableBody) return;

        const assignments = JSON.parse(
            localStorage.getItem("teacherAssignments") || "[]"
        );

        const users = JSON.parse(
            localStorage.getItem("systemUsers") || "[]"
        );

        const subjects = JSON.parse(
            localStorage.getItem("subjects") || "[]"
        );

        tableBody.innerHTML = "";

        if (assignments.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7;
            cell.className = "text-center text-muted";
            cell.textContent = "No hay asignaciones docentes registradas.";
            return;
        }

        assignments.forEach(function (assignment) {

            const teacher = users.find(
                user => String(user.id) === String(assignment.docenteId)
            );

            const subject = subjects.find(
                item => String(item.id) === String(assignment.asignaturaId)
            );

            const row = tableBody.insertRow();

            const values = [
                teacher ? teacher.nombre : "Docente no encontrado",
                subject
                    ? `${subject.nombre} (${subject.codigo})`
                    : "Asignatura no encontrada",
                assignment.grado,
                assignment.seccion,
                assignment.anio,
                assignment.estado
            ];

            values.forEach(function (value) {
                const cell = row.insertCell();
                cell.textContent = value ?? "";
            });

            const actionsCell = row.insertCell();
           const editButton = document.createElement("button");
editButton.type = "button";
editButton.className = "btn btn-sm btn-outline-primary me-2";
editButton.innerHTML = '<i class="bi bi-pencil-square"></i> Editar';
editButton.dataset.action = "edit";
editButton.dataset.id = String(assignment.id);

const statusButton = document.createElement("button");
statusButton.type = "button";

const isActive = assignment.estado === "Activa";

statusButton.className = isActive
    ? "btn btn-sm btn-outline-danger"
    : "btn btn-sm btn-outline-success";

statusButton.innerHTML = isActive
    ? '<i class="bi bi-x-circle"></i> Desactivar'
    : '<i class="bi bi-check-circle"></i> Activar';

statusButton.dataset.action = "status";
statusButton.dataset.id = String(assignment.id);

actionsCell.appendChild(editButton);
actionsCell.appendChild(statusButton);

        });

    }

    /* =====================================================
   ACTIVAR Y DESACTIVAR ASIGNACIONES DOCENTES
===================================================== */

const assignmentsTable = document.getElementById(
    "teacherAssignmentsTableBody"
);

if (assignmentsTable) {

    assignmentsTable.addEventListener("click", function (event) {

        const button = event.target.closest(
            'button[data-action="status"]'
        );

        if (!button) return;

        const currentUser = window.Auth?.currentUser;

        if (!currentUser || currentUser.rol !== "Administrador") {
            showAssignmentMessage(
                "Solo el administrador puede modificar asignaciones.",
                "danger"
            );
            return;
        }

        const assignmentId = button.dataset.id;

        let assignments;

        try {
            assignments = JSON.parse(
                localStorage.getItem("teacherAssignments") || "[]"
            );

            if (!Array.isArray(assignments)) {
                throw new Error("Formato inválido");
            }
        } catch (error) {
            showAssignmentMessage(
                "No se pudieron leer las asignaciones.",
                "danger"
            );
            return;
        }

        const assignment = assignments.find(
            item => String(item.id) === assignmentId
        );

        if (!assignment) {
            showAssignmentMessage(
                "No se encontró la asignación seleccionada.",
                "danger"
            );
            return;
        }

        const newStatus = assignment.estado === "Activa"
            ? "Inactiva"
            : "Activa";

        const confirmed = confirm(
            `¿Deseas cambiar esta asignación a ${newStatus}?`
        );

        if (!confirmed) return;

        assignment.estado = newStatus;

        try {
            localStorage.setItem(
                "teacherAssignments",
                JSON.stringify(assignments)
            );
        } catch (error) {
            showAssignmentMessage(
                "No se pudo actualizar la asignación.",
                "danger"
            );
            return;
        }

        renderTeacherAssignments();

        showAssignmentMessage(
            `Asignación actualizada a ${newStatus} correctamente.`,
            "success"
        );

    });

}

/* =====================================================
   CARGAR ASIGNACIÓN EN EL FORMULARIO PARA EDITAR
===================================================== */

if (assignmentsTable) {

    assignmentsTable.addEventListener("click", function (event) {

        const button = event.target.closest(
            'button[data-action="edit"]'
        );

        if (!button) return;

        const currentUser = window.Auth?.currentUser;

        if (!currentUser || currentUser.rol !== "Administrador") {
            showAssignmentMessage(
                "Solo el administrador puede editar asignaciones.",
                "danger"
            );
            return;
        }

        const assignmentId = button.dataset.id;

        let assignments = [];

        try {
            const saved = JSON.parse(
                localStorage.getItem("teacherAssignments") || "[]"
            );

            assignments = Array.isArray(saved) ? saved : [];

        } catch (error) {
            showAssignmentMessage(
                "No se pudieron cargar las asignaciones.",
                "danger"
            );
            return;
        }

        const assignment = assignments.find(
            item => String(item.id) === assignmentId
        );

        if (!assignment) {
            showAssignmentMessage(
                "No se encontró la asignación seleccionada.",
                "danger"
            );
            return;
        }

        document.getElementById("editingAssignmentId").value =
            assignment.id;

        document.getElementById("assignmentTeacher").value =
            String(assignment.docenteId);

        document.getElementById("assignmentSubject").value =
            String(assignment.asignaturaId);

        document.getElementById("assignmentGrade").value =
            assignment.grado;

        document.getElementById("assignmentSection").value =
            assignment.seccion;

        document.getElementById("assignmentYear").value =
            assignment.anio;

        document.getElementById("assignmentStatus").value =
            assignment.estado;

        showAssignmentMessage(
            "Estás editando una asignación. Modifica los campos necesarios.",
            "info"
        );

        assignmentForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

}
    // Mostrar las asignaciones al abrir la página
    renderTeacherAssignments();
});