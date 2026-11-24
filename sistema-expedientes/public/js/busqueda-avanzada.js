document.addEventListener("DOMContentLoaded", function () {


    const searchForm =
        document.getElementById(
            "advancedSearchForm"
        );


    if (!searchForm) {
        return;
    }



    /* =====================================================
       FUNCIONES DE ALMACENAMIENTO
    ===================================================== */

    function getStudents() {

        const data =
            localStorage.getItem(
                "students"
            );


        if (!data) {
            return [];
        }


        try {

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "Error al obtener estudiantes:",
                error
            );

            return [];

        }

    }

    function getGrades() {

    const data = localStorage.getItem("grades");

    if (!data) {
        return [];
    }

    try {

        const grades = JSON.parse(data);

        return Array.isArray(grades)
            ? grades
            : [];

    } catch (error) {

        console.error(
            "Error al obtener calificaciones:",
            error
        );

        return [];
    }
}

    function getEnrollments() {

    const data = localStorage.getItem("enrollments");

    if (!data) {
        return [];
    }

    try {

        const enrollments = JSON.parse(data);

        return Array.isArray(enrollments)
            ? enrollments
            : [];

    } catch (error) {

        console.error(
            "Error al obtener matrículas:",
            error
        );

        return [];
    }
}

    function getAcademicRecords() {

        const data =
            localStorage.getItem(
                "academicRecords"
            );


        if (!data) {
            return [];
        }


        try {

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "Error al obtener registros académicos:",
                error
            );

            return [];

        }

    }



    function getDocuments() {

        const data =
            localStorage.getItem(
                "studentDocuments"
            );


        if (!data) {
            return [];
        }


        try {

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "Error al obtener documentos:",
                error
            );

            return [];

        }

    }



    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const resultBody =
        document.getElementById(
            "searchResultsBody"
        );


    const resultContainer =
        document.getElementById(
            "searchResultsContainer"
        );


    const emptyState =
        document.getElementById(
            "searchEmptyState"
        );


    const resultCount =
        document.getElementById(
            "searchResultCount"
        );


    const clearButton =
        document.getElementById(
            "clearSearchButton"
        );



    /* =====================================================
       RENDERIZAR RESULTADOS
    ===================================================== */

    function renderResults(
        students
    ) {

        resultBody.innerHTML =
            "";


        resultCount.textContent =
            students.length;



        if (
            students.length === 0
        ) {

            resultContainer.classList.add(
                "d-none"
            );


            emptyState.classList.remove(
                "d-none"
            );


            emptyState.innerHTML = `

                <div class="record-empty-icon">

                    <i class="bi bi-search"></i>

                </div>

                <h5>
                    Sin resultados
                </h5>

                <p>
                    No se encontraron estudiantes
                    con los criterios seleccionados.
                </p>

            `;


            return;

        }



        emptyState.classList.add(
            "d-none"
        );


        resultContainer.classList.remove(
            "d-none"
        );


        const academicRecords =
            getAcademicRecords();


        const documents =
            getDocuments();



        students.forEach(
            function (student) {


                const fullName = [

                    student.primerNombre,
                    student.segundoNombre,
                    student.primerApellido,
                    student.segundoApellido

                ]
                .filter(Boolean)
                .join(" ");



                const studentRecords =
                    academicRecords.filter(
                        function (record) {

                            return (
                                Number(record.studentId)
                                ===
                                Number(student.id)
                            );

                        }
                    );



                const studentDocuments =
                    documents.filter(
                        function (documentItem) {

                            return (
                                Number(documentItem.studentId)
                                ===
                                Number(student.id)
                            );

                        }
                    );



                const statusClass =
                    student.estado === "Activo"
                        ? "bg-success"
                        : "bg-secondary";



                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <strong>
                            ${student.codigo || "-"}
                        </strong>

                    </td>


                    <td>

                        <strong>
                            ${fullName || "Sin nombre"}
                        </strong>

                        <div class="text-muted small">
                            ${student.correo || "Sin correo"}
                        </div>

                    </td>


                    <td>
                        ${student.identificacion || "-"}
                    </td>


                    <td>

                        <span
                            class="badge ${statusClass}"
                        >
                            ${student.estado || "-"}
                        </span>

                    </td>


                    <td>

                        <span class="badge bg-light text-dark border">
                            ${studentRecords.length}
                        </span>

                    </td>


                    <td>

                        <span class="badge bg-light text-dark border">
                            ${studentDocuments.length}
                        </span>

                    </td>


                    <td>

                        <div class="student-actions">

                            <a
                                href="detalle-estudiante.html?id=${student.id}"
                                class="student-action-btn"
                                title="Ver estudiante"
                            >
                                <i class="bi bi-eye"></i>
                            </a>


                            <a
                                href="expediente-estudiante.html?id=${student.id}"
                                class="student-action-btn"
                                title="Abrir expediente"
                            >
                                <i class="bi bi-folder2-open"></i>
                            </a>

                        </div>

                    </td>

                `;


                resultBody.appendChild(
                    row
                );

            }
        );

    }



    /* =====================================================
       REALIZAR BÚSQUEDA
    ===================================================== */

    searchForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();



            const name =
                document
                    .getElementById(
                        "searchName"
                    )
                    .value
                    .trim()
                    .toLowerCase();



            const code =
                document
                    .getElementById(
                        "searchCode"
                    )
                    .value
                    .trim()
                    .toLowerCase();



            const identification =
                document
                    .getElementById(
                        "searchIdentification"
                    )
                    .value
                    .trim()
                    .toLowerCase();


const grade = document
    .getElementById("searchGrade")
    .value;

const section = document
    .getElementById("searchSection")
    .value;
            const status =
                document
                    .getElementById(
                        "searchStatus"
                    )
                    .value;



            const academicYear =
                document
                    .getElementById(
                        "searchAcademicYear"
                    )
                    .value
                    .trim();



            const subject =
                document
                    .getElementById(
                        "searchSubject"
                    )
                    .value
                    .trim()
                    .toLowerCase();



            const documentType =
                document
                    .getElementById(
                        "searchDocumentType"
                    )
                    .value;



            const students =
                getStudents();


            const academicRecords =
                getAcademicRecords();


            const documents =
                getDocuments();
                    const enrollments = getEnrollments();
                    const grades = getGrades();

            const filteredStudents =
                students.filter(
                    function (student) {


                        const fullName = [

                            student.primerNombre,
                            student.segundoNombre,
                            student.primerApellido,
                            student.segundoApellido

                        ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();



                        const studentCode =
                            (
                                student.codigo || ""
                            ).toLowerCase();



                        const studentIdentification =
                            (
                                student.identificacion || ""
                            ).toLowerCase();



                        /* =====================================
                           FILTRO POR DATOS DEL ESTUDIANTE
                        ===================================== */

                        const matchesName =
                            name === ""
                            ||
                            fullName.includes(
                                name
                            );


                        const matchesCode =
                            code === ""
                            ||
                            studentCode.includes(
                                code
                            );


                        const matchesIdentification =
                            identification === ""
                            ||
                            studentIdentification.includes(
                                identification
                            );


                        const matchesStatus =
                            status === ""
                            ||
                            student.estado === status;

                            const matchesEnrollment =
    (grade === "" && section === "")
    ||
    enrollments.some(function (enrollment) {

        return (
            String(enrollment.studentId) === String(student.id)
            &&
            (grade === "" || enrollment.nivel === grade)
            &&
            (section === "" || enrollment.seccion === section)
        );

    });



                        /* =====================================
                           FILTRO POR HISTORIAL ACADÉMICO
                        ===================================== */

                        const studentAcademicRecords =
                            academicRecords.filter(
                                function (record) {

                                    return (
                                        Number(record.studentId)
                                        ===
                                        Number(student.id)
                                    );

                                }
                            );



                        let matchesAcademicYear =
                            true;


                        if (academicYear !== "") {

    matchesAcademicYear =
        enrollments.some(function (enrollment) {

            return (
                String(enrollment.studentId) === String(student.id)
                &&
                String(enrollment.anioLectivo) === academicYear
                &&
                (grade === "" || enrollment.nivel === grade)
                &&
                (section === "" || enrollment.seccion === section)
            );

        });

}


                        
let matchesSubject = true;

if (subject !== "") {
    matchesSubject = grades.some(function (gradeRecord) {
        return (
            String(gradeRecord.studentId) === String(student.id)
            &&
            String(gradeRecord.asignatura || "")
                .toLowerCase()
                .includes(subject)
        );
    });
}



                        /* =====================================
                           FILTRO POR DOCUMENTOS
                        ===================================== */

                        const studentDocuments =
                            documents.filter(
                                function (documentItem) {

                                    return (
                                        Number(documentItem.studentId)
                                        ===
                                        Number(student.id)
                                    );

                                }
                            );



                        let matchesDocumentType =
                            true;


                        if (
                            documentType !== ""
                        ) {

                            matchesDocumentType =
                                studentDocuments.some(
                                    function (documentItem) {

                                        return (
                                            documentItem.tipo
                                            ===
                                            documentType
                                        );

                                    }
                                );

                        }



                        return (

                            matchesName
                            &&
                            matchesCode
                            &&
                            matchesIdentification
                            &&
                            matchesStatus
                            &&
                            matchesEnrollment
                            &&
                            matchesAcademicYear
                            &&
                            matchesSubject
                            &&
                            matchesDocumentType

                        );

                    }
                );



            renderResults(
                filteredStudents
            );

        }
    );



    /* =====================================================
       LIMPIAR FILTROS
    ===================================================== */

    clearButton.addEventListener(
        "click",
        function () {


            searchForm.reset();


            resultBody.innerHTML =
                "";


            resultCount.textContent =
                "0";


            resultContainer.classList.add(
                "d-none"
            );


            emptyState.classList.remove(
                "d-none"
            );


            emptyState.innerHTML = `

                <div class="record-empty-icon">

                    <i class="bi bi-search"></i>

                </div>

                <h5>
                    Realiza una búsqueda
                </h5>

                <p>
                    Utiliza los filtros para localizar
                    estudiantes y expedientes.
                </p>

            `;

        }
    );


});