document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       FUNCIONES PARA LEER LOCALSTORAGE
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


            if (
                Array.isArray(parsed)
            ) {

                return parsed;

            }


            return [];


        } catch (error) {


            console.error(
                "Error al leer " + key + ":",
                error
            );


            return [];

        }

    }



    /* =====================================================
       OBTENER INFORMACIÓN
    ===================================================== */

    const students =
        getStorageArray(
            "students"
        );


    const academicRecords =
        getStorageArray(
            "academicRecords"
        );


    const documents =
        getStorageArray(
            "studentDocuments"
        );



    /* =====================================================
       TARJETAS DEL DASHBOARD
    ===================================================== */

    const studentCount =
        document.getElementById(
            "dashboardStudentCount"
        );


    const recordCount =
        document.getElementById(
            "dashboardRecordCount"
        );


    const academicCount =
        document.getElementById(
            "dashboardAcademicCount"
        );


    const documentCount =
        document.getElementById(
            "dashboardDocumentCount"
        );



    if (studentCount) {

        studentCount.textContent =
            students.length;

    }



    /*
        En esta versión del prototipo,
        cada estudiante registrado posee
        un expediente digital asociado.
    */

    if (recordCount) {

        recordCount.textContent =
            students.length;

    }



    if (academicCount) {

        academicCount.textContent =
            academicRecords.length;

    }



    if (documentCount) {

        documentCount.textContent =
            documents.length;

    }



    /* =====================================================
       ESTUDIANTES RECIENTES
    ===================================================== */

    const recentContainer =
        document.getElementById(
            "dashboardRecentContainer"
        );


    const recentEmpty =
        document.getElementById(
            "dashboardRecentEmpty"
        );


    const recentBody =
        document.getElementById(
            "dashboardRecentStudents"
        );



    if (
        students.length === 0
    ) {


        if (recentContainer) {

            recentContainer.classList.add(
                "d-none"
            );

        }


        if (recentEmpty) {

            recentEmpty.classList.remove(
                "d-none"
            );

        }


        return;

    }



    if (recentEmpty) {

        recentEmpty.classList.add(
            "d-none"
        );

    }



    if (recentContainer) {

        recentContainer.classList.remove(
            "d-none"
        );

    }



    if (!recentBody) {

        return;

    }



    recentBody.innerHTML =
        "";



    /* =====================================================
       ORDENAR POR ID
       Los ID fueron generados con Date.now()
    ===================================================== */

    const recentStudents =
        [...students]
            .sort(
                function (a, b) {

                    return (
                        Number(b.id)
                        -
                        Number(a.id)
                    );

                }
            )
            .slice(
                0,
                5
            );



    /* =====================================================
       CREAR FILAS
    ===================================================== */

    recentStudents.forEach(
        function (student) {


            const fullName = [

                student.primerNombre,
                student.segundoNombre,
                student.primerApellido,
                student.segundoApellido

            ]
            .filter(Boolean)
            .join(" ");



            const statusClass =
                student.estado
                ===
                "Activo"
                    ?
                    "bg-success"
                    :
                    "bg-secondary";



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

                    <a
                        href="expediente-estudiante.html?id=${student.id}"
                        class="btn btn-sm btn-outline-primary"
                    >

                        <i class="bi bi-folder2-open me-1"></i>

                        Abrir

                    </a>

                </td>

            `;



            recentBody.appendChild(
                row
            );

        }
    );


});