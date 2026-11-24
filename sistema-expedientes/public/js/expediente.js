document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       CONTENEDOR
    ===================================================== */

    const recordContent =
        document.getElementById(
            "recordContent"
        );


    if (!recordContent) {
        return;
    }


    /* =====================================================
       ID DEL ESTUDIANTE
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const studentId =
        Number(
            params.get("id")
        );


    /* =====================================================
       FUNCIONES GENERALES
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


    function getStudents() {
        return getData("students");
    }


    function getAcademicRecords() {
        return getData("academicRecords");
    }


    function getDocuments() {
        return getData("studentDocuments");
    }


    function getEnrollments() {
        return getData("enrollments");
    }


    function getGrades() {
        return getData("grades");
    }


    function getAuditHistory() {
        return getData("auditHistory");
    }


    function setText(id, value) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value !== undefined
                &&
                value !== null
                &&
                value !== ""
                    ? value
                    : "-";
        }
    }


    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatDate(dateValue) {

        if (!dateValue) {
            return "-";
        }


        const parts =
            String(dateValue)
                .split("-");


        if (parts.length === 3) {

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


        return dateValue;
    }


    function formatDateTime(dateValue) {

        if (!dateValue) {
            return "-";
        }


        const date =
            new Date(dateValue);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return dateValue;
        }


        return date.toLocaleString(
            "es-NI",
            {
                dateStyle:
                    "short",

                timeStyle:
                    "short"
            }
        );
    }


    /* =====================================================
       BUSCAR ESTUDIANTE
    ===================================================== */

    const students =
        getStudents();


    const student =
        students.find(
            function (item) {

                return (
                    Number(item.id)
                    ===
                    studentId
                );
            }
        );


    const notFound =
        document.getElementById(
            "recordStudentNotFound"
        );


    if (!student) {

        recordContent.classList.add(
            "d-none"
        );


        if (notFound) {

            notFound.classList.remove(
                "d-none"
            );
        }


        return;
    }


    /* =====================================================
       DATOS DEL ESTUDIANTE
    ===================================================== */

    const fullName = [

        student.primerNombre,
        student.segundoNombre,
        student.primerApellido,
        student.segundoApellido

    ]
    .filter(Boolean)
    .join(" ");


    const firstInitial =
        student.primerNombre
            ? student.primerNombre.charAt(0)
            : "E";


    const lastInitial =
        student.primerApellido
            ? student.primerApellido.charAt(0)
            : "";


    const initials =
        (
            firstInitial
            +
            lastInitial
        )
        .toUpperCase();


    setText(
        "recordPageTitle",
        "Expediente de " + fullName
    );


    setText(
        "recordStudentName",
        fullName
    );


    setText(
        "recordAvatar",
        initials
    );


    setText(
        "recordStudentCode",
        student.codigo
    );


    setText(
        "recordIdentification",
        student.identificacion
    );


    setText(
        "recordFullName",
        fullName
    );


    setText(
        "recordIdentificationDetail",
        student.identificacion
    );


    setText(
        "recordBirthDate",
        formatDate(
            student.fechaNacimiento
        )
    );


    setText(
        "recordSex",
        student.sexo
    );


    setText(
        "recordPhone",
        student.telefono
    );


    setText(
        "recordEmail",
        student.correo
    );


    setText(
        "recordAddress",
        student.direccion
    );


    /* =====================================================
       ESTADO DEL ESTUDIANTE
    ===================================================== */

    const status =
        document.getElementById(
            "recordStudentStatus"
        );


    if (status) {

        status.textContent =
            student.estado
            ||
            "Sin estado";


        status.classList.remove(
            "active",
            "inactive"
        );


        status.classList.add(
            student.estado === "Activo"
                ? "active"
                : "inactive"
        );
    }


    /* =====================================================
       ENLACES
    ===================================================== */

    const editStudentButton =
        document.getElementById(
            "recordEditStudent"
        );


    if (editStudentButton) {

        editStudentButton.href =
            "editar-estudiante.html?id="
            +
            student.id;
    }


    const addAcademicRecordButton =
        document.getElementById(
            "addAcademicRecordButton"
        );


    if (addAcademicRecordButton) {

        addAcademicRecordButton.href =
            "registro-academico.html?id="
            +
            student.id;
    }


    const addDocumentButton =
        document.getElementById(
            "addDocumentButton"
        );


    if (addDocumentButton) {

        addDocumentButton.href =
            "agregar-documento.html?id="
            +
            student.id;
    }


    /* =====================================================
       MATRÍCULAS DEL ESTUDIANTE
    ===================================================== */

    const studentEnrollments =
        getEnrollments()
            .filter(
                function (enrollment) {

                    return (
                        Number(
                            enrollment.studentId
                        )
                        ===
                        studentId
                    );
                }
            );


    setText(
        "enrollmentCount",
        studentEnrollments.length
    );


    const enrollmentEmpty =
        document.getElementById(
            "enrollmentEmpty"
        );


    const enrollmentTableContainer =
        document.getElementById(
            "enrollmentTableContainer"
        );


    const enrollmentTableBody =
        document.getElementById(
            "enrollmentTableBody"
        );


    if (
        studentEnrollments.length
        ===
        0
    ) {

        if (enrollmentEmpty) {

            enrollmentEmpty.classList.remove(
                "d-none"
            );
        }


        if (enrollmentTableContainer) {

            enrollmentTableContainer.classList.add(
                "d-none"
            );
        }

    } else {

        if (enrollmentEmpty) {

            enrollmentEmpty.classList.add(
                "d-none"
            );
        }


        if (enrollmentTableContainer) {

            enrollmentTableContainer.classList.remove(
                "d-none"
            );
        }


        if (enrollmentTableBody) {

            enrollmentTableBody.innerHTML =
                "";


            studentEnrollments
                .slice()
                .sort(
                    function (a, b) {

                        return (
                            Number(
                                b.anioLectivo
                                ||
                                0
                            )
                            -
                            Number(
                                a.anioLectivo
                                ||
                                0
                            )
                        );
                    }
                )
                .forEach(
                    function (enrollment) {


                        let badgeClass =
                            "bg-secondary";


                        if (
                            enrollment.estado
                            ===
                            "Activa"
                        ) {

                            badgeClass =
                                "bg-success";
                        }


                        if (
                            enrollment.estado
                            ===
                            "Finalizada"
                        ) {

                            badgeClass =
                                "bg-primary";
                        }


                        if (
                            enrollment.estado
                            ===
                            "Cancelada"
                        ) {

                            badgeClass =
                                "bg-danger";
                        }


                        const row =
                            document.createElement(
                                "tr"
                            );


                        row.innerHTML = `

                           <td>
    <strong>
        <i class="bi bi-calendar3 me-2"></i>
        ${escapeHtml(enrollment.anioLectivo || "-")}
    </strong>
</td>

                            <td>
                                ${escapeHtml(enrollment.nivel || "-")}
                            </td>

                            <td>
                                ${escapeHtml(enrollment.turno || "-")}
                            </td>

                            <td>
                                ${escapeHtml(enrollment.seccion || "-")}
                            </td>

                            <td>
                                ${escapeHtml(formatDate(enrollment.fechaMatricula || enrollment.fecha))}
                            </td>

                            <td>

                                <span
                                    class="badge ${badgeClass}"
                                >
                                    ${escapeHtml(enrollment.estado || "-")}
                                </span>

                            </td>

                        `;


                        enrollmentTableBody
                            .appendChild(
                                row
                            );
                    }
                );
        }
    }


    /* =====================================================
       CALIFICACIONES DEL ESTUDIANTE
    ===================================================== */

    const studentGrades =
        getGrades()
            .filter(
                function (grade) {

                    return (
                        Number(
                            grade.studentId
                        )
                        ===
                        studentId
                    );
                }
            );


    setText(
        "gradeCount",
        studentGrades.length
    );


    const gradeEmpty =
        document.getElementById(
            "gradeEmpty"
        );


    const gradeContent =
        document.getElementById(
            "gradeContent"
        );


    if (
        studentGrades.length
        ===
        0
    ) {

        if (gradeEmpty) {

            gradeEmpty.classList.remove(
                "d-none"
            );
        }


        if (gradeContent) {

            gradeContent.classList.add(
                "d-none"
            );
        }

    } else {

        if (gradeEmpty) {

            gradeEmpty.classList.add(
                "d-none"
            );
        }


        if (gradeContent) {

            gradeContent.classList.remove(
                "d-none"
            );


            gradeContent.innerHTML =
                "";


            /*
                AGRUPAR POR:
                AÑO -> SEMESTRE
            */

            const years = {};


            studentGrades.forEach(
                function (grade) {


                    const year =
                        grade.anioLectivo
                        ||
                        "Sin año";


                    const semester =
                        grade.semestre
                        ||
                        "Sin semestre";


                    if (!years[year]) {

                        years[year] = {};
                    }


                    if (!years[year][semester]) {

                        years[year][semester] =
                            [];
                    }


                    years[year][semester]
                        .push(
                            grade
                        );
                }
            );


            const sortedYears =
                Object.keys(years)
                    .sort(
                        function (a, b) {

                            return (
                                Number(b)
                                -
                                Number(a)
                            );
                        }
                    );


            sortedYears.forEach(
                function (year) {


                    const yearBlock =
                        document.createElement(
                            "div"
                        );


                    yearBlock.className =
                        "mb-4";


                    const yearGrades =
                        studentGrades.filter(
                            function (grade) {

                                return (
                                    String(
                                        grade.anioLectivo
                                    )
                                    ===
                                    String(year)
                                );
                            }
                        );


                    const level =
                        yearGrades.length > 0
                            ? yearGrades[0].nivel
                            : "";


                    yearBlock.innerHTML = `

                        <div
                            class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3"
                        >

                            <div>

                                <h5 class="mb-1">

                                    <i class="bi bi-calendar3 me-2"></i>

                                    Año lectivo
                                    ${escapeHtml(year)}

                                </h5>

                                <span class="text-muted">
                                    ${escapeHtml(level || "")}
                                </span>

                            </div>

                        </div>

                    `;


                    const semesters =
                        years[year];


                    const semesterOrder = [

                        "I Semestre",
                        "II Semestre"

                    ];


                    Object.keys(semesters)
                        .sort(
                            function (a, b) {

                                const indexA =
                                    semesterOrder.indexOf(
                                        a
                                    );


                                const indexB =
                                    semesterOrder.indexOf(
                                        b
                                    );


                                if (
                                    indexA === -1
                                    &&
                                    indexB === -1
                                ) {

                                    return a.localeCompare(
                                        b
                                    );
                                }


                                if (indexA === -1) {
                                    return 1;
                                }


                                if (indexB === -1) {
                                    return -1;
                                }


                                return (
                                    indexA
                                    -
                                    indexB
                                );
                            }
                        )
                        .forEach(
                            function (semester) {


                                const semesterGrades =
                                    semesters[
                                        semester
                                    ];


                                const subjects = {};


                                semesterGrades.forEach(
                                    function (grade) {


                                        const subjectKey =
                                            grade.codigoAsignatura
                                            ||
                                            grade.asignatura;


                                        if (
                                            !subjects[
                                                subjectKey
                                            ]
                                        ) {

                                            subjects[
                                                subjectKey
                                            ] = {

                                                nombre:
                                                    grade.asignatura,

                                                codigo:
                                                    grade.codigoAsignatura,

                                                parcial1:
                                                    null,

                                                parcial2:
                                                    null,

                                                semestral:
                                                    null

                                            };
                                        }


                                        if (
                                            grade.evaluacion
                                            ===
                                            "I Parcial"
                                        ) {

                                            subjects[
                                                subjectKey
                                            ].parcial1 =
                                                grade;
                                        }


                                        if (
                                            grade.evaluacion
                                            ===
                                            "II Parcial"
                                        ) {

                                            subjects[
                                                subjectKey
                                            ].parcial2 =
                                                grade;
                                        }


                                        if (
                                            grade.evaluacion
                                            ===
                                            "Nota semestral"
                                        ) {

                                            subjects[
                                                subjectKey
                                            ].semestral =
                                                grade;
                                        }
                                    }
                                );


                                const semesterBlock =
                                    document.createElement(
                                        "div"
                                    );


                                semesterBlock.className =
                                    "border rounded-3 p-3 mb-3";


                                semesterBlock.innerHTML = `

                                    <h6 class="mb-3">

                                        <i class="bi bi-journal-bookmark me-2"></i>

                                        ${escapeHtml(semester)}

                                    </h6>


                                    <div class="table-responsive">

                                        <table
                                            class="table align-middle mb-0"
                                        >

                                            <thead>

                                                <tr>
                                                    <th>
                                                        Asignatura
                                                    </th>

                                                    <th>
                                                        I Parcial
                                                    </th>

                                                    <th>
                                                        II Parcial
                                                    </th>

                                                    <th>
                                                        Nota semestral
                                                    </th>

                                                    <th>
                                                        Estado
                                                    </th>
                                                </tr>

                                            </thead>

                                            <tbody>
                                            </tbody>

                                        </table>

                                    </div>

                                `;


                                const tbody =
                                    semesterBlock.querySelector(
                                        "tbody"
                                    );


                                Object.values(subjects)
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


                                            const finalGrade =
                                                subject.semestral;


                                            let statusHtml =
                                                `<span class="badge bg-secondary">En proceso</span>`;


                                            if (finalGrade) {

                                                const badgeClass =
                                                    finalGrade.estado
                                                    ===
                                                    "Aprobado"
                                                        ? "bg-success"
                                                        : "bg-danger";


                                                statusHtml = `

                                                    <span
                                                        class="badge ${badgeClass}"
                                                    >
                                                        ${escapeHtml(finalGrade.estado)}
                                                    </span>

                                                `;
                                            }


                                            const row =
                                                document.createElement(
                                                    "tr"
                                                );


                                            row.innerHTML = `

                                                <td>

                                                    <strong>
                                                        ${escapeHtml(subject.nombre || "-")}
                                                    </strong>

                                                    <div
                                                        class="small text-muted"
                                                    >
                                                        ${escapeHtml(subject.codigo || "")}
                                                    </div>

                                                </td>


                                                <td>

                                                    ${
                                                        subject.parcial1
                                                            ? `<strong>${escapeHtml(subject.parcial1.nota)}</strong>`
                                                            : `<span class="text-muted">-</span>`
                                                    }

                                                </td>


                                                <td>

                                                    ${
                                                        subject.parcial2
                                                            ? `<strong>${escapeHtml(subject.parcial2.nota)}</strong>`
                                                            : `<span class="text-muted">-</span>`
                                                    }

                                                </td>


                                                <td>

                                                    ${
                                                        subject.semestral
                                                            ? `<strong>${escapeHtml(subject.semestral.nota)}</strong>`
                                                            : `<span class="text-muted">-</span>`
                                                    }

                                                </td>


                                                <td>
                                                    ${statusHtml}
                                                </td>

                                            `;


                                            tbody.appendChild(
                                                row
                                            );
                                        }
                                    );


                                yearBlock.appendChild(
                                    semesterBlock
                                );
                            }
                        );


                    gradeContent.appendChild(
                        yearBlock
                    );
                }
            );
        }
    }


    /* =====================================================
       REGISTROS ACADÉMICOS ANTERIORES
    ===================================================== */

    const studentAcademicRecords =
        getAcademicRecords()
            .filter(
                function (record) {

                    return (
                        Number(
                            record.studentId
                        )
                        ===
                        studentId
                    );
                }
            );


    setText(
        "academicRecordCount",
        studentAcademicRecords.length
    );


    const academicRecordEmpty =
        document.getElementById(
            "academicRecordEmpty"
        );


    const academicTableContainer =
        document.getElementById(
            "academicRecordTableContainer"
        );


    const academicTableBody =
        document.getElementById(
            "academicRecordTableBody"
        );


    if (
        studentAcademicRecords.length
        ===
        0
    ) {

        if (academicRecordEmpty) {

            academicRecordEmpty.classList.remove(
                "d-none"
            );
        }


        if (academicTableContainer) {

            academicTableContainer.classList.add(
                "d-none"
            );
        }

    } else {

        if (academicRecordEmpty) {

            academicRecordEmpty.classList.add(
                "d-none"
            );
        }


        if (academicTableContainer) {

            academicTableContainer.classList.remove(
                "d-none"
            );
        }


        if (academicTableBody) {

            academicTableBody.innerHTML =
                "";


            studentAcademicRecords
                .slice()
                .sort(
                    function (a, b) {

                        return (
                            Number(b.anio)
                            -
                            Number(a.anio)
                        );
                    }
                )
                .forEach(
                    function (record) {


                        let badgeClass =
                            "bg-secondary";


                        if (
                            record.estado
                            ===
                            "Aprobado"
                        ) {

                            badgeClass =
                                "bg-success";
                        }


                        if (
                            record.estado
                            ===
                            "Reprobado"
                        ) {

                            badgeClass =
                                "bg-danger";
                        }


                        if (
                            record.estado
                            ===
                            "En curso"
                        ) {

                            badgeClass =
                                "bg-warning text-dark";
                        }


                        const row =
                            document.createElement(
                                "tr"
                            );


                        row.innerHTML = `

                            <td>
                                <strong>
                                    ${escapeHtml(record.anio || "-")}
                                </strong>
                            </td>

                            <td>
                                ${escapeHtml(record.periodo || "-")}
                            </td>

                            <td>
                                ${escapeHtml(record.nivel || "-")}
                            </td>

                            <td>
                                ${escapeHtml(record.asignatura || "-")}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtml(record.calificacion ?? "-")}
                                </strong>
                            </td>

                            <td>

                                <span
                                    class="badge ${badgeClass}"
                                >
                                    ${escapeHtml(record.estado || "-")}
                                </span>

                            </td>

                        `;


                        academicTableBody
                            .appendChild(
                                row
                            );
                    }
                );
        }
    }


    /* =====================================================
       DOCUMENTOS
    ===================================================== */

    const studentDocuments =
        getDocuments()
            .filter(
                function (documentItem) {

                    return (
                        Number(
                            documentItem.studentId
                        )
                        ===
                        studentId
                    );
                }
            );


    setText(
        "documentCount",
        studentDocuments.length
    );


    const documentEmpty =
        document.getElementById(
            "documentEmpty"
        );


    const documentTableContainer =
        document.getElementById(
            "documentTableContainer"
        );


    const documentTableBody =
        document.getElementById(
            "documentTableBody"
        );


    if (
        studentDocuments.length
        ===
        0
    ) {

        if (documentEmpty) {

            documentEmpty.classList.remove(
                "d-none"
            );
        }


        if (documentTableContainer) {

            documentTableContainer.classList.add(
                "d-none"
            );
        }

    } else {

        if (documentEmpty) {

            documentEmpty.classList.add(
                "d-none"
            );
        }


        if (documentTableContainer) {

            documentTableContainer.classList.remove(
                "d-none"
            );
        }


        if (documentTableBody) {

            documentTableBody.innerHTML =
                "";


            studentDocuments
                .slice()
                .sort(
                    function (a, b) {

                        return (
                            Number(b.id)
                            -
                            Number(a.id)
                        );
                    }
                )
                .forEach(
                    function (documentItem) {


                        let statusClass =
                            "bg-secondary";


                        if (
                            documentItem.estado
                            ===
                            "Vigente"
                        ) {

                            statusClass =
                                "bg-success";
                        }


                        if (
                            documentItem.estado
                            ===
                            "Pendiente"
                        ) {

                            statusClass =
                                "bg-warning text-dark";
                        }


                        if (
                            documentItem.estado
                            ===
                            "Vencido"
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
                                    ${escapeHtml(documentItem.nombre || "-")}
                                </strong>
                            </td>

                            <td>
                                ${escapeHtml(documentItem.tipo || "-")}
                            </td>

                            <td>

                                <i class="bi bi-paperclip me-1"></i>

                                ${escapeHtml(documentItem.archivo || "Sin archivo")}

                            </td>

                            <td>
                                ${escapeHtml(formatDate(documentItem.fecha))}
                            </td>

                            <td>

                                <span
                                    class="badge ${statusClass}"
                                >
                                    ${escapeHtml(documentItem.estado || "-")}
                                </span>

                            </td>

                        `;


                        documentTableBody
                            .appendChild(
                                row
                            );
                    }
                );
        }
    }


    /* =====================================================
       ACTIVIDAD DEL EXPEDIENTE
    ===================================================== */

    const recordActivityList =
        document.getElementById(
            "recordActivityList"
        );


    if (recordActivityList) {

        const studentActivities =
            getAuditHistory()
                .filter(
                    function (activity) {

                        return (
                            Number(
                                activity.estudianteId
                            )
                            ===
                            studentId
                        );
                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                b.fecha
                                ||
                                0
                            )
                            -
                            new Date(
                                a.fecha
                                ||
                                0
                            )
                        );
                    }
                )
                .slice(
                    0,
                    5
                );


        if (
            studentActivities.length
            ===
            0
        ) {

            recordActivityList.innerHTML = `

                <div class="record-empty-box">

                    <div class="record-empty-icon">
                        <i class="bi bi-clock-history"></i>
                    </div>

                    <h5>
                        Sin actividad
                    </h5>

                    <p>
                        No existen actividades registradas
                        para este estudiante.
                    </p>

                </div>

            `;

        } else {

            recordActivityList.innerHTML =
                "";


            studentActivities.forEach(
                function (activity) {


                    let icon =
                        "bi-clock-history";


                    if (
                        activity.accion
                        ===
                        "Registro de estudiante"
                    ) {

                        icon =
                            "bi-person-plus-fill";
                    }


                    if (
                        activity.accion
                        ===
                        "Modificación de estudiante"
                    ) {

                        icon =
                            "bi-pencil-fill";
                    }


                    if (
                        activity.accion
                        ===
                        "Documento agregado"
                    ) {

                        icon =
                            "bi-file-earmark-plus-fill";
                    }


                    if (
                        activity.accion
                        ===
                        "Calificación registrada"
                    ) {

                        icon =
                            "bi-clipboard-check-fill";
                    }


                    if (
                        activity.accion
                        ===
                        "Matrícula registrada"
                    ) {

                        icon =
                            "bi-journal-check";
                    }


                    const activityItem =
                        document.createElement(
                            "div"
                        );


                    activityItem.className =
                        "record-activity";


                    activityItem.innerHTML = `

                        <div class="record-activity-icon">

                            <i class="bi ${icon}"></i>

                        </div>


                        <div>

                            <strong>
                                ${escapeHtml(activity.accion || "Actividad")}
                            </strong>

                            <p class="mb-1">
                                ${escapeHtml(activity.descripcion || "")}
                            </p>

                            <small class="text-muted">

                                ${escapeHtml(formatDateTime(activity.fecha))}

                                ·

                                ${escapeHtml(
                                    activity.usuarioNombre
                                    ||
                                    activity.usuario
                                    ||
                                    "Administrador"
                                )}

                            </small>

                        </div>

                    `;


                    recordActivityList
                        .appendChild(
                            activityItem
                        );
                }
            );
        }
    }


});