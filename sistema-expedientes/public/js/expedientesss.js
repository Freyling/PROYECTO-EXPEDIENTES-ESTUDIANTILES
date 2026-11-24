document.addEventListener("DOMContentLoaded", function () {

    const students =
        JSON.parse(
            localStorage.getItem("students")
        ) || [];

    const enrollments =
        JSON.parse(
            localStorage.getItem("enrollments")
        ) || [];


    const tableBody =
        document.getElementById(
            "recordTableBody"
        );

    const searchInput =
        document.getElementById(
            "recordSearch"
        );

    const recordCount =
        document.getElementById(
            "recordCount"
        );

    const totalRecords =
        document.getElementById(
            "totalRecords"
        );

    const activeRecordStudents =
        document.getElementById(
            "activeRecordStudents"
        );

    const recordsWithEnrollment =
        document.getElementById(
            "recordsWithEnrollment"
        );

    const emptyState =
        document.getElementById(
            "recordEmptyState"
        );


    /* ==============================================
       FUNCIONES AUXILIARES
    ============================================== */

    function normalize(value) {

        return String(value || "")
            .toLowerCase()
            .trim();
    }


    function getStudentName(student) {

    const fullName = [

        student.primerNombre,
        student.segundoNombre,
        student.primerApellido,
        student.segundoApellido

    ]
        .filter(Boolean)
        .join(" ")
        .trim();


    return fullName || "Sin nombre";
}


    function getStudentCode(student) {

        return (
            student.codigo
            ||
            student.codigoEstudiante
            ||
            student.code
            ||
            "-"
        );
    }


    function getIdentification(student) {

        return (
            student.identificacion
            ||
            student.cedula
            ||
            student.numeroIdentificacion
            ||
            "-"
        );
    }


    function getStudentStatus(student) {

        return (
            student.estado
            ||
            "Activo"
        );
    }


    function getStudentLevel(student) {

        /*
            Primero intentamos obtener el nivel
            desde una matrícula activa.
        */

        const studentEnrollment =
            enrollments.find(function (enrollment) {

                return (
                    String(enrollment.studentId)
                    ===
                    String(student.id)
                )
                &&
                (
                    !enrollment.estado
                    ||
                    enrollment.estado === "Activa"
                );

            });


        if (studentEnrollment) {

            return (
                studentEnrollment.nivel
                ||
                studentEnrollment.grado
                ||
                studentEnrollment.level
                ||
                "-"
            );
        }


        return (
            student.nivel
            ||
            student.grado
            ||
            student.nivelAcademico
            ||
            "-"
        );
    }


    function studentHasEnrollment(student) {

        return enrollments.some(
            function (enrollment) {

                return (
                    String(enrollment.studentId)
                    ===
                    String(student.id)
                );

            }
        );
    }


    /* ==============================================
       ESTADÍSTICAS
    ============================================== */

    function updateStatistics() {

        totalRecords.textContent =
            students.length;


        const activeStudents =
            students.filter(
                function (student) {

                    return (
                        getStudentStatus(student)
                        .toLowerCase()
                        ===
                        "activo"
                    );

                }
            );


        activeRecordStudents.textContent =
            activeStudents.length;


        const studentsWithEnrollment =
            students.filter(
                function (student) {

                    return studentHasEnrollment(
                        student
                    );

                }
            );


        recordsWithEnrollment.textContent =
            studentsWithEnrollment.length;
    }


    /* ==============================================
       RENDERIZAR EXPEDIENTES
    ============================================== */

    function renderRecords(list) {

        tableBody.innerHTML = "";


        recordCount.textContent =
            list.length;


        if (list.length === 0) {

            emptyState.classList.remove(
                "d-none"
            );

            return;
        }


        emptyState.classList.add(
            "d-none"
        );


        list.forEach(
            function (student) {

                const row =
                    document.createElement("tr");


                const status =
                    getStudentStatus(student);


                const statusClass =
                    status.toLowerCase()
                    ===
                    "activo"
                        ?
                        "active"
                        :
                        "inactive";


                row.innerHTML = `

                    <td>
                        <strong>
                            ${getStudentCode(student)}
                        </strong>
                    </td>

                    <td>
                        ${getStudentName(student)}
                    </td>

                    <td>
                        ${getIdentification(student)}
                    </td>

                    <td>
                        ${getStudentLevel(student)}
                    </td>

                    <td>

                        <span
                            class="student-status ${statusClass}"
                        >
                            ${status}
                        </span>

                    </td>

                    <td class="text-end">

                        <a
                            href="expediente-estudiante.html?id=${encodeURIComponent(student.id)}"
                            class="btn btn-sm btn-outline-primary"
                            title="Abrir expediente"
                        >
                            <i class="bi bi-folder2-open me-1"></i>
                            Abrir expediente
                        </a>

                    </td>

                `;


                tableBody.appendChild(row);
            }
        );
    }


    /* ==============================================
       BUSCADOR
    ============================================== */

    function filterRecords() {

        const search =
            normalize(
                searchInput.value
            );


        if (!search) {

            renderRecords(
                students
            );

            return;
        }


        const filtered =
            students.filter(
                function (student) {

                    const searchableText =
                        [
                            getStudentName(student),
                            getStudentCode(student),
                            getIdentification(student),
                            getStudentLevel(student),
                            getStudentStatus(student)
                        ]
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        search
                    );
                }
            );


        renderRecords(
            filtered
        );
    }


    /* ==============================================
       EVENTOS
    ============================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterRecords
        );
    }


    /* ==============================================
       INICIO
    ============================================== */

    updateStatistics();

    renderRecords(
        students
    );

});