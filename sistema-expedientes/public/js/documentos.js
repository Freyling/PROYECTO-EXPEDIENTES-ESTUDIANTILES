document.addEventListener("DOMContentLoaded", function () {

    const documentForm =
        document.getElementById(
            "documentForm"
        );


    if (!documentForm) {
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
       DOCUMENTOS
    ===================================================== */

    function getDocuments() {

        const data =
            localStorage.getItem(
                "studentDocuments"
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
                "Error al obtener documentos:",
                error
            );

            return [];
        }
    }


    function saveDocuments(
        documents
    ) {

        localStorage.setItem(
            "studentDocuments",
            JSON.stringify(
                documents
            )
        );
    }


    /* =====================================================
   AUDITORÍA DEL SISTEMA
   Registra al usuario autenticado
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
            "documentStudentNotFound"
        );


    if (!student) {

        documentForm
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
            "documentStudentName"
        );


    if (studentName) {

        studentName.textContent =
            fullName;
    }


    /* =====================================================
       ENLACES DE RETORNO
    ===================================================== */

    const backUrl =
        "expediente-estudiante.html?id="
        +
        student.id;


    const backButton =
        document.getElementById(
            "documentBackButton"
        );


    const cancelButton =
        document.getElementById(
            "documentCancelButton"
        );


    const breadcrumbRecord =
        document.getElementById(
            "documentBreadcrumbRecord"
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
       FECHA ACTUAL
    ===================================================== */

    const dateField =
        document.getElementById(
            "documentDate"
        );


    if (dateField) {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth()
                +
                1
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


    /* =====================================================
       GUARDAR DOCUMENTO
    ===================================================== */

    documentForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "documentName"
                    )
                    .value
                    .trim();


            const type =
                document
                    .getElementById(
                        "documentType"
                    )
                    .value;


            const date =
                document
                    .getElementById(
                        "documentDate"
                    )
                    .value;


            const status =
                document
                    .getElementById(
                        "documentStatus"
                    )
                    .value;


            const description =
                document
                    .getElementById(
                        "documentDescription"
                    )
                    .value
                    .trim();


            const fileInput =
                document.getElementById(
                    "documentFile"
                );


            /* VALIDACIÓN */

            if (
                name === ""
                ||
                type === ""
                ||
                date === ""
                ||
                status === ""
                ||
                !fileInput.files.length
            ) {

                alert(
                    "Completa todos los campos obligatorios."
                );

                return;
            }


            const selectedFile =
                fileInput.files[0];


            const documents =
                getDocuments();


            /* =================================================
               EVITAR DOCUMENTO DUPLICADO
            ================================================= */

            const duplicated =
                documents.some(
                    function (item) {

                        return (

                            Number(
                                item.studentId
                            )
                            ===
                            studentId

                            &&

                            (
                                item.nombre
                                ||
                                ""
                            )
                            .toLowerCase()
                            ===
                            name
                                .toLowerCase()

                            &&

                            (
                                item.archivo
                                ||
                                ""
                            )
                            .toLowerCase()
                            ===
                            selectedFile
                                .name
                                .toLowerCase()
                        );
                    }
                );


            if (duplicated) {

                alert(
                    "Este documento ya fue registrado para el estudiante."
                );

                return;
            }


            /* =================================================
               CREAR DOCUMENTO
            ================================================= */

            const newDocument = {

                id:
                    Date.now(),

                studentId:
                    student.id,

                nombre:
                    name,

                tipo:
                    type,

                fecha:
                    date,

                estado:
                    status,

                descripcion:
                    description,

                archivo:
                    selectedFile.name,

                tipoArchivo:
                    selectedFile.type,

                tamano:
                    selectedFile.size,

                fechaRegistro:
                    new Date()
                        .toISOString()
            };


            documents.push(
                newDocument
            );


            saveDocuments(
                documents
            );


            /* =================================================
               AUDITORÍA
            ================================================= */

            registrarAuditoria(

                "Documento agregado",

                `Se agregó el documento "${name}" (${type}), archivo ${selectedFile.name}, estado ${status}.`,

                student.id,

                fullName
            );


            /* =================================================
               MENSAJE
            ================================================= */

            const message =
                document.getElementById(
                    "documentMessage"
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