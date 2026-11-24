document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       FUNCIONES DE ALMACENAMIENTO
    ===================================================== */

    function getData(key) {

        try {

            const data =
                JSON.parse(
                    localStorage.getItem(key)
                    ||
                    "[]"
                );

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Error al leer " + key + ":",
                error
            );

            return [];
        }
    }


    function saveGrades(grades) {

        localStorage.setItem(
            "grades",
            JSON.stringify(grades)
        );
    }


    function getStudents() {
        return getData("students");
    }


    function getEnrollments() {
        return getData("enrollments");
    }


    function getSubjects() {
        return getData("subjects");
    }


    function getGrades() {
        return getData("grades");
    }
/* =====================================================
   OBTENER ASIGNACIONES DOCENTES
===================================================== */

function getTeacherAssignments() {
    return getData("teacherAssignments");
}

function getCurrentUser() {
    return window.Auth?.currentUser || null;
}

function isAdministrator() {
    return getCurrentUser()?.rol === "Administrador";
}

function isTeacher() {
    return getCurrentUser()?.rol === "Personal educativo";
}

    /* =====================================================
       NOMBRE COMPLETO
    ===================================================== */

    function getStudentName(student) {

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
       NORMALIZAR TEXTO
    ===================================================== */

    function normalizeText(text) {

        return String(text || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );
    }


    /* =====================================================
   AUDITORÍA DEL SISTEMA
   Registra al usuario autenticado
===================================================== */

function registerAudit(
    action,
    description,
    studentId,
    studentName
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
            action,

        descripcion:
            description,

        estudianteId:
            studentId,

        estudianteNombre:
            studentName,

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
       ELEMENTOS
    ===================================================== */

    const gradeForm =
        document.getElementById(
            "gradeForm"
        );


    const enrollmentSelect =
        document.getElementById(
            "gradeEnrollment"
        );


    const yearField =
        document.getElementById(
            "gradeYear"
        );


    const levelField =
        document.getElementById(
            "gradeLevel"
        );


    const semesterSelect =
        document.getElementById(
            "gradeSemester"
        );


    const subjectSelect =
        document.getElementById(
            "gradeSubject"
        );


    const evaluationSelect =
        document.getElementById(
            "gradeEvaluation"
        );


    const gradeValue =
        document.getElementById(
            "gradeValue"
        );


    const gradeStatus =
        document.getElementById(
            "gradeStatus"
        );


    const gradeDate =
        document.getElementById(
            "gradeDate"
        );


    const observations =
        document.getElementById(
            "gradeObservations"
        );


    const noEnrollmentsMessage =
        document.getElementById(
            "noEnrollmentsMessage"
        );


    /* =====================================================
       FECHA ACTUAL
    ===================================================== */

    if (gradeDate) {

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


        gradeDate.value =
            `${year}-${month}-${day}`;
    }


    /* =====================================================
       CARGAR MATRÍCULAS ACTIVAS
    ===================================================== */

    function loadEnrollments() {

        if (!enrollmentSelect) {
            return;
        }


        const students =
            getStudents();

const currentUser = getCurrentUser();

const assignments = getTeacherAssignments();

const enrollments = getEnrollments().filter(function (enrollment) {

    if (enrollment.estado !== "Activa") {
        return false;
    }

    // El administrador puede consultar todas las matrículas.
    if (isAdministrator()) {
        return true;
    }

    // El personal educativo solo ve sus matrículas asignadas.
    if (isTeacher() && currentUser) {

        return assignments.some(function (assignment) {

            return (
                String(assignment.docenteId) === String(currentUser.id) &&
                assignment.estado === "Activa" &&
                normalizeText(assignment.grado) ===
                    normalizeText(enrollment.nivel) &&
                normalizeText(assignment.seccion) ===
                    normalizeText(enrollment.seccion) &&
                String(assignment.anio) ===
                    String(enrollment.anioLectivo)
            );

        });
    }

    // Otros roles no pueden seleccionar matrículas.
    return false;

});


        enrollmentSelect.innerHTML = `

            <option value="">
                Selecciona un estudiante
            </option>

        `;


        if (enrollments.length === 0) {

            if (noEnrollmentsMessage) {

                noEnrollmentsMessage
                    .classList
                    .remove(
                        "d-none"
                    );
            }


            if (gradeForm) {

                gradeForm
                    .classList
                    .add(
                        "d-none"
                    );
            }


            return;
        }


        enrollments.forEach(
            function (enrollment) {


                const student =
                    students.find(
                        function (item) {

                            return (
    String(item.id) === String(enrollment.studentId)
);
                        }
                    );


                if (!student) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    enrollment.id;


                option.textContent =
                    `${getStudentName(student)} - ${enrollment.anioLectivo} - ${enrollment.nivel}`;


                enrollmentSelect
                    .appendChild(
                        option
                    );
            }
        );
    }


    /* =====================================================
       CARGAR ASIGNATURAS DEL NIVEL
    ===================================================== */

    function loadSubjectsForEnrollment(
        enrollment
    ) {

        if (!subjectSelect) {
            return;
        }


        subjectSelect.innerHTML = `

            <option value="">
                Selecciona una asignatura
            </option>

        `;


        subjectSelect.disabled =
            true;


        if (!enrollment) {
            return;
        }


        const subjects =
            getSubjects();


        const enrollmentLevel =
            normalizeText(
                enrollment.nivel
            );

const currentUser = getCurrentUser();
const assignments = getTeacherAssignments();

const matchingSubjects = subjects.filter(function (subject) {

    // La asignatura debe estar activa y pertenecer al grado.
    if (
        subject.estado !== "Activa" ||
        normalizeText(subject.nivel) !== enrollmentLevel
    ) {
        return false;
    }

    // El administrador puede seleccionar cualquier asignatura del grado.
    if (isAdministrator()) {
        return true;
    }

    // El docente solo puede seleccionar asignaturas asignadas.
    if (isTeacher() && currentUser) {

        return assignments.some(function (assignment) {

            return (
                String(assignment.docenteId) === String(currentUser.id) &&
                String(assignment.asignaturaId) === String(subject.id) &&
                assignment.estado === "Activa" &&
                normalizeText(assignment.grado) === enrollmentLevel &&
                normalizeText(assignment.seccion) ===
                    normalizeText(enrollment.seccion) &&
                String(assignment.anio) ===
                    String(enrollment.anioLectivo)
            );

        });
    }

    return false;

});


        if (
            matchingSubjects.length
            ===
            0
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "No hay asignaturas para este nivel";


            subjectSelect
                .appendChild(
                    option
                );


            return;
        }


        matchingSubjects
            .sort(
                function (a, b) {

                    return (
                        a.nombre
                        ||
                        ""
                    )
                    .localeCompare(
                        b.nombre
                        ||
                        ""
                    );
                }
            )
            .forEach(
                function (subject) {


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        subject.id;


                    option.textContent =
                        `${subject.nombre} (${subject.codigo})`;


                    subjectSelect
                        .appendChild(
                            option
                        );
                }
            );


        subjectSelect.disabled =
            false;
    }


    /* =====================================================
       CAMBIO DE MATRÍCULA
    ===================================================== */

    if (enrollmentSelect) {

        enrollmentSelect.addEventListener(
            "change",
            function () {


                const enrollmentId = enrollmentSelect.value;

const enrollment = getEnrollments().find(
    function (item) {
        return String(item.id) === String(enrollmentId);
    }
);


                if (!enrollment) {

                    yearField.value =
                        "";


                    levelField.value =
                        "";


                    loadSubjectsForEnrollment(
                        null
                    );


                    return;
                }


                yearField.value =
                    enrollment.anioLectivo
                    ||
                    "";


                levelField.value =
                    enrollment.nivel
                    ||
                    "";


                loadSubjectsForEnrollment(
                    enrollment
                );
            }
        );
    }


    /* =====================================================
       ESTADO AUTOMÁTICO DE LA NOTA
    ===================================================== */

    if (gradeValue) {

        gradeValue.addEventListener(
            "input",
            function () {


                const value =
                    Number(
                        gradeValue.value
                    );


                if (
                    gradeValue.value
                    ===
                    ""
                ) {

                    gradeStatus.value =
                        "";

                    return;
                }


                if (
                    value < 0
                    ||
                    value > 100
                ) {

                    gradeStatus.value =
                        "Nota inválida";

                    return;
                }


                /*
                    Para el prototipo utilizaremos
                    60 como nota mínima aprobatoria.
                    Esto se podrá parametrizar después.
                */

                gradeStatus.value =
                    value >= 60
                    ?
                    "Aprobado"
                    :
                    "Reprobado";
            }
        );
    }


    /* =====================================================
       GUARDAR CALIFICACIÓN
    ===================================================== */

    if (gradeForm) {

        gradeForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const enrollmentId = enrollmentSelect.value;
const subjectId = subjectSelect.value;


                const semester =
                    semesterSelect.value;


                const evaluation =
                    evaluationSelect.value;


                const value =
                    Number(
                        gradeValue.value
                    );


                const date =
                    gradeDate.value;


                const observationText =
                    observations.value.trim();


                if (
                    !enrollmentId
                    ||
                    !subjectId
                    ||
                    semester === ""
                    ||
                    evaluation === ""
                    ||
                    gradeValue.value === ""
                    ||
                    date === ""
                ) {

                    alert(
                        "Completa todos los campos obligatorios."
                    );

                    return;
                }


                if (
                    value < 0
                    ||
                    value > 100
                ) {

                    alert(
                        "La calificación debe estar entre 0 y 100."
                    );

                    return;
                }


                const enrollments =
                    getEnrollments();


                const enrollment =
                    enrollments.find(
                        function (item) {
                            return (
    String(item.id) === String(enrollmentId)
);
                        }
                    );


                if (!enrollment) {

                    alert(
                        "No se encontró la matrícula."
                    );

                    return;
                }


                const students =
                    getStudents();


                const student =
                    students.find(
                        function (item) {

                            return (
                                String(item.id) === String(enrollment.studentId)
                            );
                        }
                    );


                if (!student) {

                    alert(
                        "No se encontró el estudiante."
                    );

                    return;
                }


                const subjects =
                    getSubjects();


                const subject =
                    subjects.find(
                        function (item) {

                            return (
    String(item.id) === String(subjectId)
);
                        }
                    );


                if (!subject) {

                    alert(
                        "No se encontró la asignatura."
                    );

                    return;
                }


                /* =====================================================
   VALIDAR PERMISOS PARA REGISTRAR CALIFICACIONES
===================================================== */

const currentUser = getCurrentUser();

if (!currentUser) {
    alert("Debes iniciar sesión para registrar calificaciones.");
    return;
}

if (enrollment.estado !== "Activa" || subject.estado !== "Activa") {
    alert("La matrícula y la asignatura deben estar activas.");
    return;
}

if (
    normalizeText(subject.nivel) !==
    normalizeText(enrollment.nivel)
) {
    alert("La asignatura no corresponde al grado del estudiante.");
    return;
}

if (!isAdministrator()) {

    if (!isTeacher()) {
        alert("No tienes permisos para registrar calificaciones.");
        return;
    }

    const authorized = getTeacherAssignments().some(function (assignment) {

        return (
            String(assignment.docenteId) === String(currentUser.id) &&
            String(assignment.asignaturaId) === String(subject.id) &&
            assignment.estado === "Activa" &&
            normalizeText(assignment.grado) ===
                normalizeText(enrollment.nivel) &&
            normalizeText(assignment.seccion) ===
                normalizeText(enrollment.seccion) &&
            String(assignment.anio) ===
                String(enrollment.anioLectivo)
        );

    });

    if (!authorized) {
        alert(
            "No tienes una asignación activa para registrar " +
            "calificaciones en esta asignatura, grado, sección y año."
        );
        return;
    }
}
                const grades =
                    getGrades();


                /* =============================================
                   EVITAR EVALUACIÓN DUPLICADA
                ============================================= */

                const duplicated =
                    grades.some(
                        function (grade) {

                            return (

                                Number(
                                    grade.enrollmentId
                                )
                                ===
                                enrollmentId

                                &&

                                Number(
                                    grade.subjectId
                                )
                                ===
                                subjectId

                                &&

                                grade.semestre
                                ===
                                semester

                                &&

                                grade.evaluacion
                                ===
                                evaluation
                            );
                        }
                    );


                if (duplicated) {

                    alert(
                        "Ya existe una calificación para esta asignatura, semestre y evaluación."
                    );

                    return;
                }


                const status =
                    value >= 60
                    ?
                    "Aprobado"
                    :
                    "Reprobado";


                const newGrade = {
                    usuarioRegistroId: String(currentUser.id),
usuarioRegistroNombre: currentUser.nombre || "Usuario",
usuarioRegistroRol: currentUser.rol,

                    id:
                        Date.now(),

                    enrollmentId:
                        enrollment.id,

                    studentId:
                        student.id,

                    subjectId:
                        subject.id,

                    anioLectivo:
                        enrollment.anioLectivo,

                    nivel:
                        enrollment.nivel,

                    semestre:
                        semester,

                    asignatura:
                        subject.nombre,

                    codigoAsignatura:
                        subject.codigo,

                    evaluacion:
                        evaluation,

                    nota:
                        value,

                    estado:
                        status,

                    fecha:
                        date,

                    observaciones:
                        observationText,

                    fechaRegistro:
                        new Date()
                            .toISOString()

                };


                grades.push(
                    newGrade
                );


                saveGrades(
                    grades
                );


                /* =============================================
                   AUDITORÍA
                ============================================= */

                const studentName =
                    getStudentName(
                        student
                    );


                registerAudit(

                    "Calificación registrada",

                    `Se registró ${evaluation} de ${subject.nombre}, ${semester}, con nota ${value} para ${studentName}.`,

                    student.id,

                    studentName
                );


                /* =============================================
                   MENSAJE
                ============================================= */

                const message =
                    document.getElementById(
                        "gradeMessage"
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


                /*
                    Limpiamos solamente los datos
                    de la evaluación.

                    Conservamos estudiante y matrícula
                    para facilitar el ingreso de varias notas.
                */

                semesterSelect.value =
                    "";


                subjectSelect.value =
                    "";


                evaluationSelect.value =
                    "";


                gradeValue.value =
                    "";


                gradeStatus.value =
                    "";


                observations.value =
                    "";


                renderGrades(
                    getGrades()
                );


                setTimeout(
                    function () {

                        if (message) {

                            message
                                .classList
                                .add(
                                    "d-none"
                                );
                        }

                    },
                    1800
                );
            }
        );
    }


    /* =====================================================
       TABLA DE CALIFICACIONES
    ===================================================== */

    const gradeTableBody =
        document.getElementById(
            "gradeTableBody"
        );


    const gradeEmptyState =
        document.getElementById(
            "gradeEmptyState"
        );


    function renderGrades(
        gradeList
    ) {

        if (!gradeTableBody) {
            return;
        }


        gradeTableBody.innerHTML =
            "";
const visibleGrades = gradeList.filter(function (grade) {

    const currentUser = getCurrentUser();

    if (!currentUser) return false;

    if (isAdministrator()) return true;

    if (!isTeacher()) return false;

    const enrollment = getEnrollments().find(function (item) {
        return String(item.id) === String(grade.enrollmentId);
    });

    if (!enrollment) return false;

    return getTeacherAssignments().some(function (assignment) {

        return (
            String(assignment.docenteId) === String(currentUser.id) &&
            String(assignment.asignaturaId) === String(grade.subjectId) &&
            assignment.estado === "Activa" &&
            normalizeText(assignment.grado) === normalizeText(enrollment.nivel) &&
            normalizeText(assignment.seccion) === normalizeText(enrollment.seccion) &&
            String(assignment.anio) === String(enrollment.anioLectivo)
        );

    });

});

        if (
            visibleGrades.length
            ===
            0
        ) {

            if (gradeEmptyState) {

                gradeEmptyState
                    .classList
                    .remove(
                        "d-none"
                    );
            }


            return;
        }


        if (gradeEmptyState) {

            gradeEmptyState
                .classList
                .add(
                    "d-none"
                );
        }


        const students =
    getStudents();

visibleGrades
    .slice()
    .sort(
                function (a, b) {

                    return (
                        new Date(
                            b.fechaRegistro
                            ||
                            0
                        )
                        -
                        new Date(
                            a.fechaRegistro
                            ||
                            0
                        )
                    );
                }
            )
            .forEach(
                function (grade) {


                    const student =
                        students.find(
                            function (item) {

                                return (
                                    Number(item.id)
                                    ===
                                    Number(
                                        grade.studentId
                                    )
                                );
                            }
                        );


                    const studentName =
                        getStudentName(
                            student
                        );


                    const badgeClass =
                        grade.estado
                        ===
                        "Aprobado"
                        ?
                        "bg-success"
                        :
                        "bg-danger";


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            <strong>
                                ${studentName}
                            </strong>
                        </td>

                        <td>
                            ${grade.anioLectivo || "-"}
                        </td>

                        <td>
                            ${grade.nivel || "-"}
                        </td>

                        <td>
                            ${grade.semestre || "-"}
                        </td>

                        <td>

                            <strong>
                                ${grade.asignatura || "-"}
                            </strong>

                            <div class="small text-muted">
                                ${grade.codigoAsignatura || ""}
                            </div>

                        </td>

                        <td>
                            ${grade.evaluacion || "-"}
                        </td>

                        <td>

                            <strong>
                                ${grade.nota}
                            </strong>

                        </td>

                        <td>

                            <span
                                class="badge ${badgeClass}"
                            >
                                ${grade.estado || "-"}
                            </span>

                        </td>

                    `;


                    gradeTableBody
                        .appendChild(
                            row
                        );
                }
            );
    }


    /* =====================================================
       BUSCADOR
    ===================================================== */

    const gradeSearch =
        document.getElementById(
            "gradeSearch"
        );


    if (gradeSearch) {

        gradeSearch.addEventListener(
            "input",
            function () {


                const searchText =
                    normalizeText(
                        gradeSearch.value
                    );


                const students =
                    getStudents();


                const grades =
                    getGrades();


                const filtered =
                    grades.filter(
                        function (grade) {


                            const student =
                                students.find(
                                    function (item) {

                                        return (
                                            Number(item.id)
                                            ===
                                            Number(
                                                grade.studentId
                                            )
                                        );
                                    }
                                );


                            const studentName =
                                normalizeText(
                                    getStudentName(
                                        student
                                    )
                                );


                            const subject =
                                normalizeText(
                                    grade.asignatura
                                );


                            const semester =
                                normalizeText(
                                    grade.semestre
                                );


                            const evaluation =
                                normalizeText(
                                    grade.evaluacion
                                );


                            return (

                                studentName.includes(
                                    searchText
                                )

                                ||

                                subject.includes(
                                    searchText
                                )

                                ||

                                semester.includes(
                                    searchText
                                )

                                ||

                                evaluation.includes(
                                    searchText
                                )
                            );
                        }
                    );


                renderGrades(
                    filtered
                );
            }
        );
    }


    /* =====================================================
       INICIALIZAR
    ===================================================== */

   
loadEnrollments();

/* Seleccionar matrícula desde el expediente */

const parametros = new URLSearchParams(window.location.search);
const estudianteId = parametros.get("studentId");

if (estudianteId && enrollmentSelect) {

    const matriculas = getEnrollments();

    const matriculaActiva = matriculas.find(function (matricula) {
        return (
            String(matricula.studentId) === String(estudianteId)
            &&
            matricula.estado === "Activa"
        );
    });

    if (matriculaActiva) {

        enrollmentSelect.value = String(matriculaActiva.id);

        enrollmentSelect.dispatchEvent(
            new Event("change", { bubbles: true })
        );
    }
}

renderGrades(
    getGrades()
);


});