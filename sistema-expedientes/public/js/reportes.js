document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================================
           LEER ARRAYS DE LOCALSTORAGE
        ===================================================== */

        function getStorageArray(key) {


            const data =
                localStorage.getItem(key);


            if (!data) {

                return [];

            }


            try {


                const parsed =
                    JSON.parse(data);


                return Array.isArray(parsed)
                    ? parsed
                    : [];


            } catch (error) {


                console.error(
                    "Error al leer "
                    + key
                    + ":",
                    error
                );


                return [];

            }

        }



        /* =====================================================
           DATOS
        ===================================================== */

        const students =
            getStorageArray(
                "students"
            );


        const academicRecords =
            getStorageArray(
                "academicRecords"
            );
            const grades =
    getStorageArray(
        "grades"
    );

        const documents =
            getStorageArray(
                "studentDocuments"
            );



        /* =====================================================
           ELEMENTOS PRINCIPALES
        ===================================================== */

        const studentCount =
            document.getElementById(
                "reportStudentCount"
            );


        const recordCount =
            document.getElementById(
                "reportRecordCount"
            );


        const academicCount =
            document.getElementById(
                "reportAcademicCount"
            );


        const documentCount =
            document.getElementById(
                "reportDocumentCount"
            );


        const totalStudents =
            document.getElementById(
                "reportTotalStudents"
            );


        const activeStudents =
            document.getElementById(
                "reportActiveStudents"
            );


        const inactiveStudents =
            document.getElementById(
                "reportInactiveStudents"
            );



        /* =====================================================
           CONTADORES GENERALES
        ===================================================== */

        if (studentCount) {

            studentCount.textContent =
                students.length;

        }


        /*
            Actualmente cada estudiante
            posee un expediente digital.
        */

        if (recordCount) {

            recordCount.textContent =
                students.length;

        }

        if (academicCount) {

    academicCount.textContent =
        grades.length;

}


        if (documentCount) {

            documentCount.textContent =
                documents.length;

        }



        /* =====================================================
           ESTUDIANTES ACTIVOS / INACTIVOS
        ===================================================== */

        const active =
            students.filter(
                function (student) {

                    return (
                        student.estado
                        ===
                        "Activo"
                    );

                }
            );


        const inactive =
            students.filter(
                function (student) {

                    return (
                        student.estado
                        ===
                        "Inactivo"
                    );

                }
            );


        if (totalStudents) {

            totalStudents.textContent =
                students.length;

        }


        if (activeStudents) {

            activeStudents.textContent =
                active.length;

        }


        if (inactiveStudents) {

            inactiveStudents.textContent =
                inactive.length;

        }



        /* =====================================================
           RESUMEN ACADÉMICO
        ===================================================== */

        const approvedRecords =
    grades.filter(function (grade) {
        return grade.estado === "Aprobado";
    });

const failedRecords =
    grades.filter(function (grade) {
        return grade.estado === "Reprobado";
    });

const inProgressRecords =
    academicRecords.filter(function (record) {
        return record.estado === "En curso";
    });



        const approvedCount =
            document.getElementById(
                "reportApprovedCount"
            );


        const failedCount =
            document.getElementById(
                "reportFailedCount"
            );


        const inProgressCount =
            document.getElementById(
                "reportInProgressCount"
            );


        if (approvedCount) {

            approvedCount.textContent =
                approvedRecords.length;

        }


        if (failedCount) {

            failedCount.textContent =
                failedRecords.length;

        }


        if (inProgressCount) {

            inProgressCount.textContent =
                inProgressRecords.length;

        }



        /* =====================================================
           TABLA
        ===================================================== */

        const tableBody =
            document.getElementById(
                "reportTableBody"
            );


        const tableContainer =
            document.getElementById(
                "reportTableContainer"
            );


        const emptyState =
            document.getElementById(
                "reportEmptyState"
            );


        const resultCount =
            document.getElementById(
                "reportResultCount"
            );



        function renderReport(
            studentList
        ) {


            if (!tableBody) {

                return;

            }


            tableBody.innerHTML =
                "";


            if (resultCount) {

                resultCount.textContent =
                    studentList.length;

            }



            if (
                studentList.length === 0
            ) {


                if (tableContainer) {

                    tableContainer.classList.add(
                        "d-none"
                    );

                }


                if (emptyState) {

                    emptyState.classList.remove(
                        "d-none"
                    );

                }


                return;

            }



            if (emptyState) {

                emptyState.classList.add(
                    "d-none"
                );

            }


            if (tableContainer) {

                tableContainer.classList.remove(
                    "d-none"
                );

            }



            studentList.forEach(
                function (student) {


                    /* =============================
                       NOMBRE COMPLETO
                    ============================== */

                    const fullName = [

                        student.primerNombre,
                        student.segundoNombre,
                        student.primerApellido,
                        student.segundoApellido

                    ]
                    .filter(Boolean)
                    .join(" ");



                    /* =============================
                       REGISTROS ACADÉMICOS
                    ============================== */

                    const studentAcademicRecords =
                        academicRecords.filter(
                            function (record) {

                                return (

                                    Number(
                                        record.studentId
                                    )

                                    ===

                                    Number(
                                        student.id
                                    )

                                );

                            }
                        );
                        const studentGrades =
    grades.filter(function (grade) {
        return (
            String(grade.studentId) ===
            String(student.id)
        );
    });



                    /* =============================
                       DOCUMENTOS
                    ============================== */

                    const studentDocuments =
                        documents.filter(
                            function (documentItem) {

                                return (

                                    Number(
                                        documentItem.studentId
                                    )

                                    ===

                                    Number(
                                        student.id
                                    )

                                );

                            }
                        );



                    /* =============================
                       ESTADO
                    ============================== */

                    const statusClass =

                        student.estado
                        ===
                        "Activo"

                        ?

                        "bg-success"

                        :

                        "bg-secondary";



                    /* =============================
                       FILA
                    ============================== */

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

                            <span
                                class="badge bg-light text-dark border"
                            >

                                ${studentAcademicRecords.length + studentGrades.length}

                            </span>

                        </td>



                        <td>

                            <span
                                class="badge bg-light text-dark border"
                            >

                                ${studentDocuments.length}

                            </span>

                        </td>


                    `;



                    tableBody.appendChild(
                        row
                    );


                }
            );


        }



        /* =====================================================
           MOSTRAR TODOS AL INICIAR
        ===================================================== */

        renderReport(
            students
        );



        /* =====================================================
           FILTROS
        ===================================================== */

        const filterForm =
            document.getElementById(
                "reportFilterForm"
            );


        if (filterForm) {


            filterForm.addEventListener(
                "submit",
                function (event) {


                    event.preventDefault();



                    const searchText =
                        document
                            .getElementById(
                                "reportNameFilter"
                            )
                            .value
                            .trim()
                            .toLowerCase();



                    const status =
                        document
                            .getElementById(
                                "reportStatusFilter"
                            )
                            .value;



                    const filtered =
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



                                const code =
                                    (
                                        student.codigo
                                        ||
                                        ""
                                    )
                                    .toLowerCase();



                                const matchesText =

                                    searchText
                                    ===
                                    ""

                                    ||

                                    fullName.includes(
                                        searchText
                                    )

                                    ||

                                    code.includes(
                                        searchText
                                    );



                                const matchesStatus =

                                    status
                                    ===
                                    ""

                                    ||

                                    student.estado
                                    ===
                                    status;



                                return (

                                    matchesText

                                    &&

                                    matchesStatus

                                );


                            }
                        );



                    renderReport(
                        filtered
                    );


                }
            );


        }



        /* =====================================================
           LIMPIAR FILTROS
        ===================================================== */

        const clearFilters =
            document.getElementById(
                "clearReportFilters"
            );


        if (clearFilters) {


            clearFilters.addEventListener(
                "click",
                function () {


                    if (filterForm) {

                        filterForm.reset();

                    }


                    renderReport(
                        students
                    );


                }
            );


        }



        /* =====================================================
           IMPRIMIR REPORTE
        ===================================================== */

        const printButton =
            document.getElementById(
                "printReportButton"
            );


        if (printButton) {


            printButton.addEventListener(
                "click",
                function () {


                    window.print();


                }
            );


        }


    }
);