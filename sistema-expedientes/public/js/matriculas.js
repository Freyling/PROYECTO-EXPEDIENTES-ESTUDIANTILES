document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       FUNCIONES DE ALMACENAMIENTO
    ===================================================== */

    function getStudents() {

        try {

            const data =
                JSON.parse(
                    localStorage.getItem("students")
                    ||
                    "[]"
                );

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Error al obtener estudiantes:",
                error
            );

            return [];
        }
    }


    function getEnrollments() {

        try {

            const data =
                JSON.parse(
                    localStorage.getItem("enrollments")
                    ||
                    "[]"
                );

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Error al obtener matrículas:",
                error
            );

            return [];
        }
    }


    function saveEnrollments(
        enrollments
    ) {

        localStorage.setItem(
            "enrollments",
            JSON.stringify(enrollments)
        );
    }


    /* =====================================================
   AUDITORÍA DEL SISTEMA
   Registra al usuario autenticado
===================================================== */

function registrarAuditoria(
    accion,
    descripcion,
    estudianteId,
    estudianteNombre
) {

    let history = [];

    try {

        history =
            JSON.parse(
                localStorage.getItem("auditHistory")
                ||
                "[]"
            );

        if (!Array.isArray(history)) {
            history = [];
        }

    } catch (error) {

        console.error(
            "Error al leer el historial de auditoría:",
            error
        );

        history = [];
    }


    /* =================================================
       OBTENER USUARIO AUTENTICADO
    ================================================= */

    let currentUser = null;


    if (
        window.Auth
        &&
        window.Auth.currentUser
    ) {

        currentUser =
            window.Auth.currentUser;
    }


    /*
       Respaldo por si Auth todavía no está disponible
    */

    if (!currentUser) {

        try {

            const sessionUser =
                sessionStorage.getItem(
                    "currentUser"
                );

            const localUser =
                localStorage.getItem(
                    "currentUser"
                );

            const storedUser =
                sessionUser
                ||
                localUser;


            if (storedUser) {

                currentUser =
                    JSON.parse(
                        storedUser
                    );
            }

        } catch (error) {

            console.error(
                "Error al obtener el usuario de la sesión:",
                error
            );
        }
    }


    /* =================================================
       NO REGISTRAR SIN USUARIO AUTENTICADO
    ================================================= */

    if (!currentUser) {

        console.warn(
            "No se registró la auditoría porque no existe un usuario autenticado."
        );

        return;
    }


    /* =================================================
       CREAR REGISTRO
    ================================================= */

    history.push({

        id:
            Date.now(),

        usuarioId:
            currentUser.id,

        usuarioNombre:
            currentUser.nombre
            ||
            "Usuario",

        usuario:
            currentUser.nombre
            ||
            "Usuario",

        rol:
            currentUser.rol
            ||
            "Sin rol",

        accion:
            accion,

        descripcion:
            descripcion,

        estudianteId:
            estudianteId,

        estudianteNombre:
            estudianteNombre,

        fecha:
            new Date().toISOString()
    });


    /* =================================================
       GUARDAR
    ================================================= */

    localStorage.setItem(
        "auditHistory",
        JSON.stringify(history)
    );
}

    /* =====================================================
       NOMBRE COMPLETO
    ===================================================== */

    function getStudentName(
        student
    ) {

        if (!student) {
            return "Estudiante no encontrado";
        }


        return [

            student.primerNombre,
            student.segundoNombre,
            student.primerApellido,
            student.segundoApellido

        ]
        .filter(Boolean)
        .join(" ");
    }


    /* =====================================================
       FECHA
    ===================================================== */

    function formatDate(
        date
    ) {

        if (!date) {
            return "-";
        }


        const parts =
            date.split("-");


        if (parts.length !== 3) {
            return date;
        }


        return (
            parts[2]
            +
            "/"
            +
            parts[1]
            +
            "/"
            +
            parts[0]
        );
    }


    /* =====================================================
       AÑO ACTUAL
    ===================================================== */

    const currentYear =
        new Date().getFullYear();


    const currentEnrollmentYear =
        document.getElementById(
            "currentEnrollmentYear"
        );


    if (currentEnrollmentYear) {

        currentEnrollmentYear.textContent =
            currentYear;
    }


    /* =====================================================
       FORMULARIO NUEVA MATRÍCULA
    ===================================================== */

    const enrollmentForm =
        document.getElementById(
            "enrollmentForm"
        );


    if (enrollmentForm) {


        const students =
            getStudents();


        const studentSelect =
            document.getElementById(
                "enrollmentStudent"
            );


        const studentCode =
            document.getElementById(
                "enrollmentStudentCode"
            );


        const noStudentsMessage =
            document.getElementById(
                "noStudentsMessage"
            );


        const yearField =
            document.getElementById(
                "enrollmentYear"
            );


        const dateField =
            document.getElementById(
                "enrollmentDate"
            );


        /* AÑO AUTOMÁTICO */

        if (yearField) {

            yearField.value =
                currentYear;
        }


        /* FECHA AUTOMÁTICA */

        if (dateField) {

            const today =
                new Date();


            const year =
                today.getFullYear();


            const month =
                String(
                    today.getMonth() + 1
                )
                .padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    today.getDate()
                )
                .padStart(
                    2,
                    "0"
                );


            dateField.value =
                `${year}-${month}-${day}`;
        }


        /* CARGAR ESTUDIANTES */

        if (students.length === 0) {

            if (noStudentsMessage) {

                noStudentsMessage
                    .classList
                    .remove(
                        "d-none"
                    );
            }


            enrollmentForm
                .classList
                .add(
                    "d-none"
                );

        } else {


            students
                .sort(
                    function (a, b) {

                        return getStudentName(a)
                            .localeCompare(
                                getStudentName(b)
                            );
                    }
                )
                .forEach(
                    function (student) {

                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            student.id;


                        option.textContent =
                            `${getStudentName(student)} - ${student.codigo || "Sin código"}`;


                        studentSelect
                            .appendChild(
                                option
                            );
                    }
                );
        }


        /* MOSTRAR CÓDIGO */

        if (studentSelect) {

            studentSelect.addEventListener(
                "change",
                function () {

                    const selectedId =
                        Number(
                            studentSelect.value
                        );


                    const student =
                        students.find(
                            function (item) {

                                return (
                                    Number(item.id)
                                    ===
                                    selectedId
                                );
                            }
                        );


                    if (studentCode) {

                        studentCode.value =
                            student
                                ?
                                student.codigo || ""
                                :
                                "";
                    }
                }
            );
        }


        /* =================================================
           GUARDAR MATRÍCULA
        ================================================= */

        enrollmentForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const selectedStudentId =
                    Number(
                        document
                            .getElementById(
                                "enrollmentStudent"
                            )
                            .value
                    );


                const year =
                    document
                        .getElementById(
                            "enrollmentYear"
                        )
                        .value;


                const level =
                    document
                        .getElementById(
                            "enrollmentLevel"
                        )
                        .value
                        .trim();


                const section =
                    document
                        .getElementById(
                            "enrollmentSection"
                        )
                        .value
                        .trim();


                const shift =
                    document
                        .getElementById(
                            "enrollmentShift"
                        )
                        .value;


                const date =
                    document
                        .getElementById(
                            "enrollmentDate"
                        )
                        .value;


                const status =
                    document
                        .getElementById(
                            "enrollmentStatus"
                        )
                        .value;


                const observations =
                    document
                        .getElementById(
                            "enrollmentObservations"
                        )
                        .value
                        .trim();


                if (
                    !selectedStudentId
                    ||
                    year === ""
                    ||
                    level === ""
                    ||
                    section === ""
                    ||
                    shift === ""
                    ||
                    date === ""
                    ||
                    status === ""
                ) {

                    alert(
                        "Completa todos los campos obligatorios."
                    );

                    return;
                }


                const selectedStudent =
                    students.find(
                        function (student) {

                            return (
                                Number(student.id)
                                ===
                                selectedStudentId
                            );
                        }
                    );


                if (!selectedStudent) {

                    alert(
                        "No se encontró el estudiante seleccionado."
                    );

                    return;
                }


                const enrollments =
                    getEnrollments();


                /* =============================================
                   EVITAR MATRÍCULA DUPLICADA
                ============================================= */

                const duplicated =
                    enrollments.some(
                        function (enrollment) {

                            return (

                                Number(
                                    enrollment.studentId
                                )
                                ===
                                selectedStudentId

                                &&

                                String(
                                    enrollment.anioLectivo
                                )
                                ===
                                String(
                                    year
                                )

                                &&

                                enrollment.estado
                                !==
                                "Cancelada"
                            );
                        }
                    );


                if (duplicated) {

                    alert(
                        "Este estudiante ya posee una matrícula registrada para el año lectivo "
                        +
                        year
                        +
                        "."
                    );

                    return;
                }


                /* =============================================
                   CREAR MATRÍCULA
                ============================================= */

                const newEnrollment = {

                    id:
                        Date.now(),

                    studentId:
                        selectedStudent.id,

                    anioLectivo:
                        year,

                    nivel:
                        level,

                    turno:
                        shift,

                    seccion:
                        section.toUpperCase(),

                    fechaMatricula:
                        date,

                    estado:
                        status,

                    observaciones:
                        observations,

                    fechaRegistro:
                        new Date()
                            .toISOString()
                };


                enrollments.push(
                    newEnrollment
                );


                saveEnrollments(
                    enrollments
                );


                /* =============================================
                   AUDITORÍA
                ============================================= */

                const fullName =
                    getStudentName(
                        selectedStudent
                    );


                registrarAuditoria(

                    "Matrícula registrada",

                    `Se matriculó al estudiante ${fullName} en ${level}, sección ${section.toUpperCase()}, turno ${shift}, año lectivo ${year}.`,

                    selectedStudent.id,

                    fullName
                );


                /* =============================================
                   MENSAJE
                ============================================= */

                const message =
                    document.getElementById(
                        "enrollmentMessage"
                    );


                if (message) {

                    message
                        .classList
                        .remove(
                            "d-none"
                        );


                    message.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "center"
                    });
                }


                setTimeout(
                    function () {

                        window.location.href =
                            "matriculas.html";

                    },
                    1000
                );
            }
        );
    }


    /* =====================================================
       LISTADO DE MATRÍCULAS
    ===================================================== */

    const enrollmentTableBody =
        document.getElementById(
            "enrollmentTableBody"
        );


    const enrollmentEmptyState =
        document.getElementById(
            "enrollmentEmptyState"
        );


    const enrollmentCount =
        document.getElementById(
            "enrollmentCount"
        );


    const totalEnrollments =
        document.getElementById(
            "totalEnrollments"
        );


    const activeEnrollments =
        document.getElementById(
            "activeEnrollments"
        );


    function renderEnrollments(
        enrollmentList
    ) {

        if (!enrollmentTableBody) {
            return;
        }


        const students =
            getStudents();


        enrollmentTableBody.innerHTML =
            "";


        if (enrollmentCount) {

            enrollmentCount.textContent =
                enrollmentList.length;
        }


        if (enrollmentList.length === 0) {

            if (enrollmentEmptyState) {

                enrollmentEmptyState
                    .classList
                    .remove(
                        "d-none"
                    );
            }

            return;
        }


        if (enrollmentEmptyState) {

            enrollmentEmptyState
                .classList
                .add(
                    "d-none"
                );
        }


        enrollmentList
            .slice()
            .sort(
                function (a, b) {

                    return (
                        Number(
                            b.anioLectivo
                        )
                        -
                        Number(
                            a.anioLectivo
                        )
                    );
                }
            )
            .forEach(
                function (enrollment) {


                    const student =
                        students.find(
                            function (item) {

                                return (
                                    Number(item.id)
                                    ===
                                    Number(
                                        enrollment.studentId
                                    )
                                );
                            }
                        );


                    const fullName =
                        getStudentName(
                            student
                        );


                    const code =
                        student
                            ?
                            student.codigo || "-"
                            :
                            "-";


                    let statusClass =
                        "bg-secondary";


                    if (
                        enrollment.estado
                        ===
                        "Activa"
                    ) {

                        statusClass =
                            "bg-success";
                    }


                    if (
                        enrollment.estado
                        ===
                        "Finalizada"
                    ) {

                        statusClass =
                            "bg-primary";
                    }


                    if (
                        enrollment.estado
                        ===
                        "Cancelada"
                    ) {

                        statusClass =
                            "bg-danger";
                    }


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>

                            <strong>
                                ${code}
                            </strong>

                        </td>


                        <td>

                            <strong>
                                ${fullName}
                            </strong>

                        </td>


                        <td>

                            ${enrollment.anioLectivo || "-"}

                        </td>


                        <td>

                            ${enrollment.nivel || "-"}

                        </td>


                        <td>

                            ${enrollment.turno || "-"}

                        </td>


                        <td>

                            ${enrollment.seccion || "-"}

                        </td>


                        <td>

                            ${formatDate(
                                enrollment.fechaMatricula
                            )}

                        </td>


                        <td>

                            <span
                                class="badge ${statusClass}"
                            >

                                ${enrollment.estado || "-"}

                            </span>

                        </td>


                        <td class="text-end">

                            ${
                                student
                                ?
                                `
                                <a
                                    href="expediente-estudiante.html?id=${student.id}"
                                    class="student-action-btn"
                                    title="Abrir expediente"
                                >
                                    <i class="bi bi-folder2-open"></i>
                                </a>
                                `
                                :
                                "-"
                            }

                        </td>
                    `;


                    enrollmentTableBody
                        .appendChild(
                            row
                        );
                }
            );
    }


    /* =====================================================
       INICIALIZAR LISTADO
    ===================================================== */

    if (enrollmentTableBody) {

        const enrollments =
            getEnrollments();


        if (totalEnrollments) {

            totalEnrollments.textContent =
                enrollments.length;
        }


        if (activeEnrollments) {

            activeEnrollments.textContent =
                enrollments.filter(
                    function (enrollment) {

                        return (
                            enrollment.estado
                            ===
                            "Activa"
                        );
                    }
                ).length;
        }


        renderEnrollments(
            enrollments
        );
    }


    /* =====================================================
       BUSCADOR
    ===================================================== */

    const enrollmentSearch =
        document.getElementById(
            "enrollmentSearch"
        );


    if (enrollmentSearch) {

        enrollmentSearch.addEventListener(
            "input",
            function () {


                const searchText =
                    enrollmentSearch
                        .value
                        .trim()
                        .toLowerCase();


                const enrollments =
                    getEnrollments();


                const students =
                    getStudents();


                const filtered =
                    enrollments.filter(
                        function (enrollment) {


                            const student =
                                students.find(
                                    function (item) {

                                        return (
                                            Number(item.id)
                                            ===
                                            Number(
                                                enrollment.studentId
                                            )
                                        );
                                    }
                                );


                            const fullName =
                                getStudentName(
                                    student
                                )
                                .toLowerCase();


                            const code =
                                student
                                    ?
                                    (
                                        student.codigo
                                        ||
                                        ""
                                    )
                                    .toLowerCase()
                                    :
                                    "";


                            const level =
                                (
                                    enrollment.nivel
                                    ||
                                    ""
                                )
                                .toLowerCase();


                            const year =
                                String(
                                    enrollment.anioLectivo
                                    ||
                                    ""
                                )
                                .toLowerCase();


                            const section =
                                (
                                    enrollment.seccion
                                    ||
                                    ""
                                )
                                .toLowerCase();


                            return (

                                fullName.includes(
                                    searchText
                                )

                                ||

                                code.includes(
                                    searchText
                                )

                                ||

                                level.includes(
                                    searchText
                                )

                                ||

                                year.includes(
                                    searchText
                                )

                                ||

                                section.includes(
                                    searchText
                                )
                            );
                        }
                    );


                renderEnrollments(
                    filtered
                );
            }
        );
    }

});