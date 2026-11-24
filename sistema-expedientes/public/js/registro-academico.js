document.addEventListener("DOMContentLoaded", function () {

    const academicForm =
        document.getElementById(
            "academicRecordForm"
        );


    if (!academicForm) {
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
       ESTUDIANTES
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

            return JSON.parse(
                data
            );

        } catch (error) {

            console.error(
                "Error al obtener estudiantes:",
                error
            );

            return [];
        }
    }


    /* =====================================================
       REGISTROS ACADÉMICOS
    ===================================================== */

    function getAcademicRecords() {

        const data =
            localStorage.getItem(
                "academicRecords"
            );


        if (!data) {
            return [];
        }


        try {

            return JSON.parse(
                data
            );

        } catch (error) {

            console.error(
                "Error al obtener registros académicos:",
                error
            );

            return [];
        }
    }


    function saveAcademicRecords(
        records
    ) {

        localStorage.setItem(
            "academicRecords",
            JSON.stringify(
                records
            )
        );
    }


    /* =====================================================
       AUDITORÍA PROVISIONAL
    ===================================================== */

    function registrarAuditoria(
        accion,
        descripcion,
        estudianteId = null,
        estudianteNombre = ""
    ) {

        let history = [];


        try {

            history =
                JSON.parse(
                    localStorage.getItem(
                        "auditHistory"
                    )
                    ||
                    "[]"
                );


            if (
                !Array.isArray(
                    history
                )
            ) {

                history = [];
            }

        } catch (error) {

            console.error(
                "Error al leer el historial de auditoría:",
                error
            );

            history = [];
        }


        const currentUser = {

            id:
                "admin-provisional",

            nombre:
                "Administrador",

            rol:
                "Administrador"
        };


        history.push({

            id:
                Date.now(),

            usuarioId:
                currentUser.id,

            usuarioNombre:
                currentUser.nombre,

            usuario:
                currentUser.nombre,

            rol:
                currentUser.rol,

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


        localStorage.setItem(
            "auditHistory",
            JSON.stringify(
                history
            )
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
                    Number(
                        item.id
                    )
                    ===
                    studentId
                );
            }
        );


    const notFound =
        document.getElementById(
            "academicStudentNotFound"
        );


    if (!student) {

        academicForm
            .classList
            .add(
                "d-none"
            );


        if (notFound) {

            notFound
                .classList
                .remove(
                    "d-none"
                );
        }


        return;
    }


    /* =====================================================
       NOMBRE DEL ESTUDIANTE
    ===================================================== */

    const fullName = [

        student.primerNombre,
        student.segundoNombre,
        student.primerApellido,
        student.segundoApellido

    ]
    .filter(Boolean)
    .join(" ");


    const studentName =
        document.getElementById(
            "academicStudentName"
        );


    if (studentName) {

        studentName.textContent =
            fullName;
    }


    /* =====================================================
       ENLACES DE REGRESO
    ===================================================== */

    const backUrl =
        "expediente-estudiante.html?id="
        +
        student.id;


    const backButton =
        document.getElementById(
            "academicBackButton"
        );


    const cancelButton =
        document.getElementById(
            "academicCancelButton"
        );


    const breadcrumbRecord =
        document.getElementById(
            "academicBreadcrumbRecord"
        );


    if (backButton) {

        backButton.href =
            backUrl;
    }


    if (cancelButton) {

        cancelButton.href =
            backUrl;
    }


    if (breadcrumbRecord) {

        breadcrumbRecord.href =
            backUrl;
    }


    /* =====================================================
       AÑO ACTUAL AUTOMÁTICO
    ===================================================== */

    const yearField =
        document.getElementById(
            "academicYear"
        );


    if (yearField) {

        yearField.value =
            new Date()
                .getFullYear();
    }


    /* =====================================================
       GUARDAR REGISTRO
    ===================================================== */

    academicForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const year =
                document
                    .getElementById(
                        "academicYear"
                    )
                    .value;


            const period =
                document
                    .getElementById(
                        "academicPeriod"
                    )
                    .value;


            const level =
                document
                    .getElementById(
                        "academicLevel"
                    )
                    .value
                    .trim();


            const subject =
                document
                    .getElementById(
                        "academicSubject"
                    )
                    .value
                    .trim();


            const grade =
                document
                    .getElementById(
                        "academicGrade"
                    )
                    .value;


            const status =
                document
                    .getElementById(
                        "academicStatus"
                    )
                    .value;


            const observations =
                document
                    .getElementById(
                        "academicObservations"
                    )
                    .value
                    .trim();


            /* VALIDACIÓN */

            if (
                year === ""
                ||
                period === ""
                ||
                level === ""
                ||
                subject === ""
                ||
                grade === ""
                ||
                status === ""
            ) {

                alert(
                    "Completa todos los campos obligatorios."
                );

                return;
            }


            const numericGrade =
                Number(
                    grade
                );


            if (
                numericGrade < 0
                ||
                numericGrade > 100
            ) {

                alert(
                    "La calificación debe estar entre 0 y 100."
                );

                return;
            }


            const records =
                getAcademicRecords();


            /* =================================================
               EVITAR REGISTRO DUPLICADO
            ================================================= */

            const duplicated =
                records.some(
                    function (record) {

                        return (

                            Number(
                                record.studentId
                            )
                            ===
                            studentId

                            &&

                            String(
                                record.anio
                            )
                            ===
                            String(
                                year
                            )

                            &&

                            (
                                record.periodo
                                ||
                                ""
                            )
                            .toLowerCase()
                            ===
                            period
                                .toLowerCase()

                            &&

                            (
                                record.asignatura
                                ||
                                ""
                            )
                            .toLowerCase()
                            ===
                            subject
                                .toLowerCase()
                        );
                    }
                );


            if (duplicated) {

                alert(
                    "Ya existe un registro de esta asignatura para el mismo año y período."
                );

                return;
            }


            /* =================================================
               CREAR REGISTRO
            ================================================= */

            const newAcademicRecord = {

                id:
                    Date.now(),

                studentId:
                    student.id,

                anio:
                    year,

                periodo:
                    period,

                nivel:
                    level,

                asignatura:
                    subject,

                calificacion:
                    numericGrade,

                estado:
                    status,

                observaciones:
                    observations,

                fechaRegistro:
                    new Date()
                        .toISOString()
            };


            records.push(
                newAcademicRecord
            );


            saveAcademicRecords(
                records
            );


            /* =================================================
               AUDITORÍA
            ================================================= */

            registrarAuditoria(

                "Registro académico",

                `Se registró ${subject}, ${period}, año ${year}, calificación ${numericGrade}, estado ${status}.`,

                student.id,

                fullName
            );


            /* =================================================
               MENSAJE
            ================================================= */

            const message =
                document.getElementById(
                    "academicRecordMessage"
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
                        backUrl;

                },
                1000
            );
        }
    );

});