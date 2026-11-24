document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       SESIÓN
    ===================================================== */

    const currentUser =
        window.Auth
            ?
            window.Auth.currentUser
            :
            null;


    if (!currentUser) {

        window.location.replace(
            "login.html"
        );

        return;
    }


    if (
        currentUser.rol
        !==
        "Estudiante"
    ) {

        window.location.replace(
            "dashboard.html"
        );

        return;
    }


    /* =====================================================
       LEER LOCALSTORAGE
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
                ?
                data
                :
                [];

        } catch (error) {

            console.error(
                "Error leyendo " + key,
                error
            );

            return [];
        }
    }


    const students =
        getData("students");

    const enrollments =
        getData("enrollments");

    const subjects =
        getData("subjects");

    /*
        Dejamos compatibilidad con diferentes nombres
        mientras estamos en el prototipo.
    */

    let grades =
        getData("grades");

    if (grades.length === 0) {

        grades =
            getData("studentGrades");
    }

    if (grades.length === 0) {

        grades =
            getData("calificaciones");
    }


    const documents =
        getData("studentDocuments");


    /* =====================================================
       IDENTIFICAR ESTUDIANTE
    ===================================================== */

    function sameId(a, b) {

        return String(a ?? "")
            ===
            String(b ?? "");
    }


    let student =
        students.find(
            function (item) {

                return sameId(
                    item.id,
                    currentUser.studentId
                );
            }
        );


    /*
        Respaldo mediante código estudiantil.
    */

    if (!student) {

        student =
            students.find(
                function (item) {

                    return String(
                        item.codigo || ""
                    )
                        .toLowerCase()
                    ===
                    String(
                        currentUser.codigoAcceso || ""
                    )
                        .toLowerCase();
                }
            );
    }


    if (!student) {

        alert(
            "No se encontró el expediente estudiantil vinculado a esta cuenta."
        );

        return;
    }


    /* =====================================================
       FUNCIONES DEL ESTUDIANTE
    ===================================================== */

    function getStudentName(item) {

        return [
            item.primerNombre,
            item.segundoNombre,
            item.primerApellido,
            item.segundoApellido
        ]
            .filter(Boolean)
            .join(" ")
            .trim()
            ||
            currentUser.studentName
            ||
            "Estudiante";
    }


    function valueOrDash(value) {

        return (
            value !== undefined
            &&
            value !== null
            &&
            String(value).trim() !== ""
        )
            ?
            value
            :
            "-";
    }


    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatDate(value) {

        if (!value) {
            return "-";
        }


        const dateParts =
            String(value)
                .split("-");


        if (
            dateParts.length
            ===
            3
        ) {

            return (
                dateParts[2]
                +
                "/"
                +
                dateParts[1]
                +
                "/"
                +
                dateParts[0]
            );
        }


        return value;
    }


    const studentName =
        getStudentName(student);


    /* =====================================================
       DATOS PROPIOS
    ===================================================== */

    const studentEnrollments =
        enrollments.filter(
            function (item) {

                return sameId(
                    item.studentId,
                    student.id
                );
            }
        );


    const currentEnrollment =
        studentEnrollments
            .slice()
            .sort(
                function (a, b) {

                    return Number(
                        b.anio
                        ||
                        b.anioLectivo
                        ||
                        0
                    )
                    -
                    Number(
                        a.anio
                        ||
                        a.anioLectivo
                        ||
                        0
                    );
                }
            )[0]
        ||
        null;


    const studentGrades =
        grades.filter(
            function (item) {

                return sameId(
                    item.studentId,
                    student.id
                );
            }
        );


    const studentDocuments =
        documents.filter(
            function (item) {

                return sameId(
                    item.studentId,
                    student.id
                );
            }
        );


    /* =====================================================
       ASIGNATURAS CORRESPONDIENTES
    ===================================================== */

    function getEnrollmentLevel() {

        if (!currentEnrollment) {
            return "";
        }

        return (
            currentEnrollment.nivel
            ||
            currentEnrollment.grado
            ||
            currentEnrollment.level
            ||
            ""
        );
    }


    const enrollmentLevel =
        getEnrollmentLevel();


    let studentSubjects =
        subjects.filter(
            function (subject) {

                const subjectLevel =
                    subject.nivel
                    ||
                    subject.grado
                    ||
                    subject.level
                    ||
                    "";


                if (!enrollmentLevel) {
                    return false;
                }


                return (
                    String(subjectLevel)
                        .trim()
                        .toLowerCase()
                    ===
                    String(enrollmentLevel)
                        .trim()
                        .toLowerCase()
                );
            }
        );


    /*
        Si todavía no existe relación nivel-asignatura
        pero sí hay calificaciones, mostramos las materias
        que aparecen en sus calificaciones.
    */

    if (
        studentSubjects.length === 0
        &&
        studentGrades.length > 0
    ) {

        const usedSubjectNames =
            new Set();


        studentGrades.forEach(
            function (grade) {

                const name =
                    grade.asignatura
                    ||
                    grade.nombreAsignatura
                    ||
                    grade.subjectName
                    ||
                    "";

                if (name) {

                    usedSubjectNames.add(
                        String(name)
                    );
                }
            }
        );


        studentSubjects =
            Array.from(
                usedSubjectNames
            )
                .map(
                    function (name) {

                        return {
                            codigo: "-",
                            nombre: name,
                            nivel: enrollmentLevel,
                            estado: "Activa"
                        };
                    }
                );
    }


    /* =====================================================
       DATOS VISUALES
    ===================================================== */

    const firstLetter =
        studentName
            .charAt(0)
            .toUpperCase()
        ||
        "E";


    const sidebarName =
        document.getElementById(
            "studentSidebarName"
        );

    const sidebarAvatar =
        document.getElementById(
            "studentSidebarAvatar"
        );

    const headerAvatar =
        document.getElementById(
            "studentHeaderAvatar"
        );

    const welcome =
        document.getElementById(
            "studentWelcome"
        );


    if (sidebarName) {

        sidebarName.textContent =
            studentName;
    }


    if (sidebarAvatar) {

        sidebarAvatar.textContent =
            firstLetter;
    }


    if (headerAvatar) {

        headerAvatar.textContent =
            firstLetter;
    }


    if (welcome) {

        welcome.textContent =
            "Bienvenido, "
            +
            (
                student.primerNombre
                ||
                studentName
            );
    }


    /* =====================================================
       ESTADÍSTICAS
    ===================================================== */

    const enrollmentStatus =
        document.getElementById(
            "studentEnrollmentStatus"
        );

    const subjectCount =
        document.getElementById(
            "studentSubjectCount"
        );

    const gradeCount =
        document.getElementById(
            "studentGradeCount"
        );

    const documentCount =
        document.getElementById(
            "studentDocumentCount"
        );


    if (enrollmentStatus) {

        enrollmentStatus.textContent =
            currentEnrollment
                ?
                (
                    currentEnrollment.estado
                    ||
                    "Activa"
                )
                :
                "Sin matrícula";
    }


    if (subjectCount) {

        subjectCount.textContent =
            studentSubjects.length;
    }


    if (gradeCount) {

        gradeCount.textContent =
            studentGrades.length;
    }


    if (documentCount) {

        documentCount.textContent =
            studentDocuments.length;
    }


    /* =====================================================
       MATRÍCULA ACTUAL
    ===================================================== */

    const enrollmentContainer =
        document.getElementById(
            "studentCurrentEnrollment"
        );


    if (enrollmentContainer) {

        if (!currentEnrollment) {

            enrollmentContainer.innerHTML = `

                <div class="portal-empty">

                    <i class="bi bi-journal-x"></i>

                    No tienes una matrícula registrada.

                </div>

            `;

        } else {

            enrollmentContainer.innerHTML = `

                <div class="row">

                    <div class="col-6">

                        <div class="student-data-label">
                            Año lectivo
                        </div>

                        <div class="student-data-value">
                            ${escapeHtml(
                                valueOrDash(
                                    currentEnrollment.anio
                                    ||
                                    currentEnrollment.anioLectivo
                                )
                            )}
                        </div>

                    </div>


                    <div class="col-6">

                        <div class="student-data-label">
                            Nivel / Grado
                        </div>

                        <div class="student-data-value">
                            ${escapeHtml(
                                valueOrDash(
                                    currentEnrollment.nivel
                                    ||
                                    currentEnrollment.grado
                                )
                            )}
                        </div>

                    </div>


                    <div class="col-6">

                        <div class="student-data-label">
                            Turno
                        </div>

                        <div class="student-data-value">
                            ${escapeHtml(
                                valueOrDash(
                                    currentEnrollment.turno
                                )
                            )}
                        </div>

                    </div>


                    <div class="col-6">

                        <div class="student-data-label">
                            Sección
                        </div>

                        <div class="student-data-value">
                            ${escapeHtml(
                                valueOrDash(
                                    currentEnrollment.seccion
                                )
                            )}
                        </div>

                    </div>


                    <div class="col-6">

                        <div class="student-data-label">
                            Estado
                        </div>

                        <div class="student-data-value">
                            ${escapeHtml(
                                valueOrDash(
                                    currentEnrollment.estado
                                )
                            )}
                        </div>

                    </div>

                </div>

            `;
        }
    }


    /* =====================================================
       PERFIL RÁPIDO
    ===================================================== */

    const quickProfile =
        document.getElementById(
            "studentQuickProfile"
        );


    if (quickProfile) {

        quickProfile.innerHTML = `

            <div class="student-data-label">
                Nombre completo
            </div>

            <div class="student-data-value">
                ${escapeHtml(studentName)}
            </div>


            <div class="student-data-label">
                Código estudiantil
            </div>

            <div class="student-data-value">
                ${escapeHtml(
                    valueOrDash(
                        student.codigo
                    )
                )}
            </div>


            <div class="student-data-label">
                Identificación
            </div>

            <div class="student-data-value">
                ${escapeHtml(
                    valueOrDash(
                        student.identificacion
                    )
                )}
            </div>

        `;
    }


    /* =====================================================
       PERFIL COMPLETO
    ===================================================== */

    const profileContent =
        document.getElementById(
            "studentProfileContent"
        );


    if (profileContent) {

        const profileFields = [

            [
                "Nombre completo",
                studentName
            ],

            [
                "Código estudiantil",
                student.codigo
            ],

            [
                "Identificación",
                student.identificacion
            ],

            [
                "Fecha de nacimiento",
                formatDate(
                    student.fechaNacimiento
                )
            ],

            [
                "Sexo",
                student.sexo
            ],

            [
                "Teléfono",
                student.telefono
            ],

            [
                "Correo electrónico",
                student.correo
            ],

            [
                "Dirección",
                student.direccion
            ],

            [
                "Estado",
                student.estado
            ]

        ];


        profileContent.innerHTML =
            profileFields
                .map(
                    function (field) {

                        return `

                            <div class="col-md-6 col-lg-4">

                                <div class="student-data-label">
                                    ${escapeHtml(field[0])}
                                </div>

                                <div class="student-data-value">
                                    ${escapeHtml(
                                        valueOrDash(
                                            field[1]
                                        )
                                    )}
                                </div>

                            </div>

                        `;
                    }
                )
                .join("");
    }


    /* =====================================================
       MI EXPEDIENTE
    ===================================================== */

    const recordContent =
        document.getElementById(
            "studentRecordContent"
        );


    if (recordContent) {

        recordContent.innerHTML = `

            <div class="row g-4">

                <div class="col-lg-6">

                    <div class="portal-card">

                        <div class="portal-section-title">

                            <div class="portal-stat-icon">
                                <i class="bi bi-person-fill"></i>
                            </div>

                            <h5>
                                Datos generales
                            </h5>

                        </div>

                        <div class="student-data-label">
                            Estudiante
                        </div>

                        <div class="student-data-value">
                            ${escapeHtml(studentName)}
                        </div>

                        <div class="student-data-label">
                            Código
                        </div>

                        <div class="student-data-value">
                            ${escapeHtml(
                                valueOrDash(
                                    student.codigo
                                )
                            )}
                        </div>

                        <div class="student-data-label">
                            Identificación
                        </div>

                        <div class="student-data-value">
                            ${escapeHtml(
                                valueOrDash(
                                    student.identificacion
                                )
                            )}
                        </div>

                    </div>

                </div>


                <div class="col-lg-6">

                    <div class="portal-card">

                        <div class="portal-section-title">

                            <div class="portal-stat-icon">
                                <i class="bi bi-journal-check"></i>
                            </div>

                            <h5>
                                Resumen académico
                            </h5>

                        </div>

                        <div class="student-data-label">
                            Matrículas registradas
                        </div>

                        <div class="student-data-value">
                            ${studentEnrollments.length}
                        </div>

                        <div class="student-data-label">
                            Calificaciones registradas
                        </div>

                        <div class="student-data-value">
                            ${studentGrades.length}
                        </div>

                        <div class="student-data-label">
                            Documentos digitales
                        </div>

                        <div class="student-data-value">
                            ${studentDocuments.length}
                        </div>

                    </div>

                </div>

            </div>

        `;
    }


    /* =====================================================
       MIS ASIGNATURAS
    ===================================================== */

    const subjectsBody =
        document.getElementById(
            "studentSubjectsBody"
        );

    const subjectsEmpty =
        document.getElementById(
            "studentSubjectsEmpty"
        );


    if (subjectsBody) {

        subjectsBody.innerHTML =
            "";


        if (
            studentSubjects.length
            ===
            0
        ) {

            subjectsEmpty
                ?.classList
                .remove("d-none");

        } else {

            subjectsEmpty
                ?.classList
                .add("d-none");


            studentSubjects.forEach(
                function (subject) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${escapeHtml(
                                valueOrDash(
                                    subject.codigo
                                    ||
                                    subject.codigoAsignatura
                                )
                            )}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    valueOrDash(
                                        subject.nombre
                                        ||
                                        subject.asignatura
                                    )
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                                valueOrDash(
                                    subject.nivel
                                    ||
                                    subject.grado
                                )
                            )}
                        </td>

                        <td>
                            <span class="badge bg-success">
                                ${escapeHtml(
                                    valueOrDash(
                                        subject.estado
                                        ||
                                        "Activa"
                                    )
                                )}
                            </span>
                        </td>

                    `;


                    subjectsBody.appendChild(
                        row
                    );
                }
            );
        }
    }


    /* =====================================================
       MIS CALIFICACIONES
    ===================================================== */

    const gradesBody =
        document.getElementById(
            "studentGradesBody"
        );

    const gradesEmpty =
        document.getElementById(
            "studentGradesEmpty"
        );


    if (gradesBody) {

        gradesBody.innerHTML =
            "";


        if (
            studentGrades.length
            ===
            0
        ) {

            gradesEmpty
                ?.classList
                .remove("d-none");

        } else {

            gradesEmpty
                ?.classList
                .add("d-none");


            studentGrades.forEach(
                function (grade) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    const status =
                        grade.estado
                        ||
                        (
                            Number(
                                grade.calificacion
                                ||
                                grade.nota
                            )
                            >=
                            60
                                ?
                                "Aprobado"
                                :
                                "Reprobado"
                        );


                    row.innerHTML = `

                        <td>
                            ${escapeHtml(
                                valueOrDash(
                                    grade.anio
                                    ||
                                    grade.anioLectivo
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                valueOrDash(
                                    grade.semestre
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                valueOrDash(
                                    grade.asignatura
                                    ||
                                    grade.nombreAsignatura
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                valueOrDash(
                                    grade.evaluacion
                                )
                            )}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    valueOrDash(
                                        grade.calificacion
                                        ??
                                        grade.nota
                                    )
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(status)}
                        </td>

                    `;


                    gradesBody.appendChild(
                        row
                    );
                }
            );
        }
    }


    /* =====================================================
       MIS DOCUMENTOS
    ===================================================== */

    const documentsBody =
        document.getElementById(
            "studentDocumentsBody"
        );

    const documentsEmpty =
        document.getElementById(
            "studentDocumentsEmpty"
        );


    if (documentsBody) {

        documentsBody.innerHTML =
            "";


        if (
            studentDocuments.length
            ===
            0
        ) {

            documentsEmpty
                ?.classList
                .remove("d-none");

        } else {

            documentsEmpty
                ?.classList
                .add("d-none");


            studentDocuments.forEach(
                function (documentItem) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            <strong>
                                ${escapeHtml(
                                    valueOrDash(
                                        documentItem.nombre
                                    )
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                                valueOrDash(
                                    documentItem.tipo
                                )
                            )}
                        </td>

                        <td>
                            <i class="bi bi-paperclip me-1"></i>

                            ${escapeHtml(
                                valueOrDash(
                                    documentItem.archivo
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                formatDate(
                                    documentItem.fecha
                                )
                            )}
                        </td>

                        <td>
                            <span class="badge bg-success">
                                ${escapeHtml(
                                    valueOrDash(
                                        documentItem.estado
                                    )
                                )}
                            </span>
                        </td>

                    `;


                    documentsBody.appendChild(
                        row
                    );
                }
            );
        }
    }


    /* =====================================================
       NAVEGACIÓN INTERNA DEL PORTAL
    ===================================================== */

    const links =
        document.querySelectorAll(
            ".student-portal-link"
        );

    const sections =
        document.querySelectorAll(
            ".student-portal-section"
        );

    const headerTitle =
        document.getElementById(
            "studentHeaderTitle"
        );


    const sectionTitles = {

        inicio:
            "Mi portal",

        perfil:
            "Mi perfil",

        expediente:
            "Mi expediente",

        asignaturas:
            "Mis asignaturas",

        calificaciones:
            "Mis calificaciones",

        documentos:
            "Mis documentos"

    };


    function showSection(sectionName) {

        sections.forEach(
            function (section) {

                section.classList.remove(
                    "active"
                );
            }
        );


        links.forEach(
            function (link) {

                link.classList.remove(
                    "active"
                );
            }
        );


        const targetSection =
            document.getElementById(
                "section-"
                +
                sectionName
            );


        const targetLink =
            document.querySelector(
                '.student-portal-link[data-section="'
                +
                sectionName
                +
                '"]'
            );


        if (targetSection) {

            targetSection.classList.add(
                "active"
            );
        }


        if (targetLink) {

            targetLink.classList.add(
                "active"
            );
        }


        if (headerTitle) {

            headerTitle.textContent =
                sectionTitles[sectionName]
                ||
                "Mi portal";
        }
    }


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const sectionName =
                        link.dataset.section;


                    showSection(
                        sectionName
                    );


                    window.location.hash =
                        sectionName;
                }
            );
        }
    );


    const initialSection =
        window.location.hash
            .replace("#", "")
        ||
        "inicio";


    if (
        sectionTitles[
            initialSection
        ]
    ) {

        showSection(
            initialSection
        );
    }


    /* =====================================================
       CERRAR SESIÓN
    ===================================================== */

    const logoutButton =
        document.getElementById(
            "studentLogoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                let history =
                    getData(
                        "auditHistory"
                    );


                history.push({

                    id:
                        Date.now(),

                    usuarioId:
                        currentUser.id,

                    usuarioNombre:
                        studentName,

                    usuario:
                        studentName,

                    rol:
                        "Estudiante",

                    accion:
                        "Cierre de sesión",

                    descripcion:
                        "El estudiante "
                        +
                        studentName
                        +
                        " cerró sesión en el sistema.",

                    estudianteId:
                        student.id,

                    estudianteNombre:
                        studentName,

                    fecha:
                        new Date()
                            .toISOString()

                });


                localStorage.setItem(
                    "auditHistory",
                    JSON.stringify(
                        history
                    )
                );


                sessionStorage.removeItem(
                    "currentUser"
                );


                localStorage.removeItem(
                    "currentUser"
                );


                window.location.replace(
                    "login.html"
                );
            }
        );
    }

});