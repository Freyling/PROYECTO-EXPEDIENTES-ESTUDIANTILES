document.addEventListener("DOMContentLoaded", function () {

        /* =====================================================
       INICIO DE SESIÓN
       PROTOTIPO LOCAL CON ROLES
    ===================================================== */

    const loginForm =
        document.getElementById("loginForm");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const identifier =
                    document
                        .getElementById("loginIdentifier")
                        .value
                        .trim()
                        .toLowerCase();


                const password =
                    document
                        .getElementById("password")
                        .value;


                const remember =
                    document.getElementById("remember");


                const message =
                    document.getElementById("loginMessage");


                /* =========================================
                   FUNCIÓN PARA MOSTRAR ERROR
                ========================================== */

                function showLoginError(text) {

                    if (!message) {
                        return;
                    }

                    message.textContent =
                        text;

                    message.classList.remove(
                        "d-none"
                    );
                }


                /* =========================================
                   VALIDAR CAMPOS
                ========================================== */

                if (
                    identifier === ""
                    ||
                    password === ""
                ) {

                    showLoginError(
                        "Debes ingresar tu correo o código estudiantil y la contraseña."
                    );

                    return;
                }


                /* =========================================
                   LEER USUARIOS
                ========================================== */

                let users = [];

                try {

                    users =
                        JSON.parse(
                            localStorage.getItem(
                                "systemUsers"
                            )
                            ||
                            "[]"
                        );


                    if (!Array.isArray(users)) {

                        users = [];
                    }

                } catch (error) {

                    console.error(
                        "Error al leer los usuarios:",
                        error
                    );

                    showLoginError(
                        "No fue posible leer las cuentas del sistema."
                    );

                    return;
                }


                /* =========================================
                   BUSCAR CUENTA

                   Administrador / Personal:
                   correo

                   Estudiante:
                   código estudiantil
                ========================================== */

                const userIndex =
                    users.findIndex(
                        function (user) {

                            if (
                                user.rol
                                ===
                                "Estudiante"
                            ) {

                                return (
                                    String(
                                        user.codigoAcceso
                                        ||
                                        ""
                                    )
                                    .trim()
                                    .toLowerCase()
                                    ===
                                    identifier
                                );
                            }


                            return (
                                String(
                                    user.correo
                                    ||
                                    ""
                                )
                                .trim()
                                .toLowerCase()
                                ===
                                identifier
                            );
                        }
                    );


                /* =========================================
                   USUARIO NO ENCONTRADO
                ========================================== */

                if (userIndex === -1) {

                    showLoginError(
                        "El usuario o código ingresado no está registrado."
                    );

                    return;
                }


                const user =
                    users[userIndex];


                /* =========================================
                   VALIDAR ESTADO
                ========================================== */

                if (
                    user.estado
                    !==
                    "Activo"
                ) {

                    showLoginError(
                        "Esta cuenta se encuentra inactiva. Contacta al administrador."
                    );

                    return;
                }


                /* =========================================
                   VALIDAR CONTRASEÑA
                ========================================== */

                if (
                    String(user.password || "")
                    !==
                    password
                ) {

                    showLoginError(
                        "La contraseña ingresada es incorrecta."
                    );

                    return;
                }


                /* =========================================
                   LOGIN CORRECTO
                ========================================== */

                if (message) {

                    message.classList.add(
                        "d-none"
                    );
                }


                /* =========================================
                   ACTUALIZAR ÚLTIMO ACCESO
                ========================================== */

                const loginDate =
                    new Date().toISOString();


                users[userIndex].ultimoAcceso =
                    loginDate;


                localStorage.setItem(
                    "systemUsers",
                    JSON.stringify(users)
                );


                /* =========================================
                   CREAR SESIÓN

                   No guardamos la contraseña dentro
                   de currentUser.
                ========================================== */

                const currentUser = {

                    id:
                        user.id,

                    nombre:
                        user.nombre,

                    correo:
                        user.correo || "",

                    rol:
                        user.rol,

                    estado:
                        user.estado,

                    permisos:
                        Array.isArray(user.permisos)
                            ? user.permisos
                            : [],

                    studentId:
                        user.studentId || null,

                    studentName:
                        user.studentName || "",

                    codigoAcceso:
                        user.codigoAcceso || null,

                    inicioSesion:
                        loginDate
                };


                /* =========================================
                   RECORDAR SESIÓN
                ========================================== */

                if (
                    remember
                    &&
                    remember.checked
                ) {

                    localStorage.setItem(
                        "currentUser",
                        JSON.stringify(currentUser)
                    );

                    sessionStorage.removeItem(
                        "currentUser"
                    );

                } else {

                    sessionStorage.setItem(
                        "currentUser",
                        JSON.stringify(currentUser)
                    );

                    localStorage.removeItem(
                        "currentUser"
                    );
                }


                /* =========================================
                   AUDITORÍA DE INICIO DE SESIÓN
                ========================================== */

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


                    if (!Array.isArray(history)) {

                        history = [];
                    }

                } catch (error) {

                    history = [];
                }


                history.push({

                    id:
                        Date.now(),

                    usuarioId:
                        user.id,

                    usuarioNombre:
                        user.nombre,

                    usuario:
                        user.nombre,

                    rol:
                        user.rol,

                    accion:
                        "Inicio de sesión",

                    descripcion:
                        "El usuario "
                        +
                        user.nombre
                        +
                        " inició sesión en el sistema.",

                    estudianteId:
                        user.studentId || null,

                    estudianteNombre:
                        user.studentName || "",

                    fecha:
                        loginDate
                });


                localStorage.setItem(
                    "auditHistory",
                    JSON.stringify(history)
                );


                /* =========================================
                   REDIRECCIÓN SEGÚN ROL
                ========================================== */

                if (
                    user.rol
                    ===
                    "Administrador"
                ) {

                    window.location.href =
                        "dashboard.html";

                    return;
                }


                if (
                    user.rol
                    ===
                    "Personal educativo"
                ) {

                    /*
                        Por ahora utilizamos el dashboard
                        existente.

                        En el siguiente paso aplicaremos
                        sus permisos para mostrar solamente
                        las opciones autorizadas.
                    */

                    window.location.href =
                        "dashboard.html";

                    return;
                }


                if (
                    user.rol
                    ===
                    "Estudiante"
                ) {

                    /*
                        El portal del estudiante será
                        nuestra siguiente pantalla.
                    */

                    window.location.href =
                        "portal-estudiante.html";

                    return;
                }


                showLoginError(
                    "La cuenta no tiene un rol válido."
                );
            }
        );
    }


    /* =====================================================
       MENÚ LATERAL RESPONSIVE
    ===================================================== */

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const sidebar =
        document.querySelector(".sidebar");

    if (mobileMenuButton && sidebar) {

        mobileMenuButton.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "sidebar-open"
                );
            }
        );
    }


    /* =====================================================
       FUNCIONES DE ALMACENAMIENTO
    ===================================================== */

    function getStudents() {

        const storedStudents =
            localStorage.getItem("students");

        if (!storedStudents) {
            return [];
        }

        try {

            const students =
                JSON.parse(storedStudents);

            return Array.isArray(students)
                ? students
                : [];

        } catch (error) {

            console.error(
                "Error al leer estudiantes:",
                error
            );

            return [];
        }
    }


    function saveStudents(students) {

        localStorage.setItem(
            "students",
            JSON.stringify(students)
        );
    }
    
/* GENERADOR AUTOMÁTICO DE CÓDIGOS ESTUDIANTILES */

function generarCodigoEstudiante(students) {

    const ultimoGuardado = Number(
        localStorage.getItem("ultimoCodigoEstudiante") || 0
    );

    let ultimoNumero = ultimoGuardado;

    students.forEach(function (student) {

        const codigo = String(student.codigo || "")
            .trim()
            .toLowerCase();

        const coincidencia = codigo.match(/^est-(\d+)$/);

        if (coincidencia) {
            const numero = Number(coincidencia[1]);

            if (numero > ultimoNumero) {
                ultimoNumero = numero;
            }
        }
    });

    const siguienteNumero = ultimoNumero + 1;

    return "est-" + String(siguienteNumero).padStart(4, "0");
}


    /* =====================================================
   AUDITORÍA DEL SISTEMA
   Registra automáticamente al usuario autenticado
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
                || "[]"
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


    /* Primero intentamos obtenerlo desde Auth */

    if (
        window.Auth
        &&
        window.Auth.currentUser
    ) {

        currentUser =
            window.Auth.currentUser;
    }


    /* Si Auth todavía no está disponible,
       buscamos la sesión directamente */

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
       SEGURIDAD:
       No registrar una acción sin usuario autenticado
    ================================================= */

    if (!currentUser) {

        console.warn(
            "No se registró la auditoría porque no existe un usuario autenticado."
        );

        return;
    }


    /* =================================================
       CREAR REGISTRO DE AUDITORÍA
    ================================================= */

    const newHistoryItem = {

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
    };


    /* =================================================
       GUARDAR REGISTRO
    ================================================= */

    history.push(
        newHistoryItem
    );


    localStorage.setItem(
        "auditHistory",
        JSON.stringify(history)
    );
}


    /* =====================================================
       REGISTRAR ESTUDIANTE
    ===================================================== */

    const studentForm =
        document.getElementById(
            "studentForm"
        );


    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


               const student = {

    id:
        Date.now(),

    fechaRegistro:
        new Date().toISOString(),

    primerNombre:
                        document
                            .getElementById(
                                "primerNombre"
                            )
                            .value
                            .trim(),

                    segundoNombre:
                        document
                            .getElementById(
                                "segundoNombre"
                            )
                            .value
                            .trim(),

                    primerApellido:
                        document
                            .getElementById(
                                "primerApellido"
                            )
                            .value
                            .trim(),

                    segundoApellido:
                        document
                            .getElementById(
                                "segundoApellido"
                            )
                            .value
                            .trim(),

                    identificacion:
                        document
                            .getElementById(
                                "identificacion"
                            )
                            .value
                            .trim(),

                    fechaNacimiento:
                        document
                            .getElementById(
                                "fechaNacimiento"
                            )
                            .value,

                    sexo:
                        document
                            .getElementById(
                                "sexo"
                            )
                            .value,

                    direccion:
                        document
                            .getElementById(
                                "direccion"
                            )
                            .value
                            .trim(),

                    telefono:
                        document
                            .getElementById(
                                "telefono"
                            )
                            .value
                            .trim(),

                    correo:
                        document
                            .getElementById(
                                "correo"
                            )
                            .value
                            .trim(),

                    codigo: generarCodigoEstudiante(getStudents()),

                    estado:
                        document
                            .getElementById(
                                "estadoEstudiante"
                            )
                            .value
                };


                const students =
                    getStudents();


                /* VALIDAR CÓDIGO */

                const codeExists =
                    students.some(
                        function (item) {

                            return (
                                item.codigo || ""
                            )
                            .toLowerCase()
                            ===
                            student.codigo
                                .toLowerCase();
                        }
                    );


                if (codeExists) {

                    alert(
                        "Ya existe un estudiante con ese código."
                    );

                    return;
                }


                /* VALIDAR IDENTIFICACIÓN */

                const identificationExists =
                    students.some(
                        function (item) {

                            return (
                                item.identificacion || ""
                            )
                            .toLowerCase()
                            ===
                            student.identificacion
                                .toLowerCase();
                        }
                    );


                if (identificationExists) {

                    alert(
                        "Ya existe un estudiante con ese número de identificación."
                    );

                    return;
                }

                /* GUARDAR EN LOCALSTORAGE */

students.push(
    student
);

saveStudents(
    students
);
localStorage.setItem(
    "ultimoCodigoEstudiante",
    String(Number(student.codigo.split("-")[1]))
);

/* GUARDAR TAMBIÉN EN FIRESTORE */

if (
    typeof window.guardarEstudianteFirestore
    === "function"
) {

    window.guardarEstudianteFirestore(
        student
    );

} else {

    console.warn(
        "Firestore todavía no está disponible."
    );
}


                /* NOMBRE COMPLETO */

                const registeredStudentName = [

                    student.primerNombre,
                    student.segundoNombre,
                    student.primerApellido,
                    student.segundoApellido

                ]
                .filter(Boolean)
                .join(" ");


                /* AUDITORÍA */

                registrarAuditoria(

                    "Registro de estudiante",

                    `Se registró al estudiante ${registeredStudentName} con código ${student.codigo}.`,

                    student.id,

                    registeredStudentName
                );


                const studentMessage =
                    document.getElementById(
                        "studentMessage"
                    );


                if (studentMessage) {

                    studentMessage.classList.remove(
                        "d-none"
                    );
                }


                setTimeout(
                    function () {

                        window.location.href =
                            "estudiantes.html";

                    },
                    1000
                );
            }
        );
    }


    /* =====================================================
       LISTADO DE ESTUDIANTES
    ===================================================== */

    const studentTableBody =
        document.getElementById(
            "studentTableBody"
        );

    const studentEmptyState =
        document.getElementById(
            "studentEmptyState"
        );

    const studentCount =
        document.getElementById(
            "studentCount"
        );


    function renderStudents(
        studentList
    ) {

        if (!studentTableBody) {
            return;
        }


        studentTableBody.innerHTML =
            "";


        if (studentCount) {

            studentCount.textContent =
                studentList.length;
        }


        if (studentList.length === 0) {

            if (studentEmptyState) {

                studentEmptyState
                    .classList
                    .remove(
                        "d-none"
                    );
            }

            return;
        }


        if (studentEmptyState) {

            studentEmptyState
                .classList
                .add(
                    "d-none"
                );
        }


        studentList.forEach(
            function (student) {

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
                        ?
                        student.primerNombre
                            .charAt(0)
                        :
                        "";


                const lastInitial =
                    student.primerApellido
                        ?
                        student.primerApellido
                            .charAt(0)
                        :
                        "";


                const initials =
                    (
                        firstInitial
                        +
                        lastInitial
                    )
                    .toUpperCase();


                const statusClass =
                    student.estado
                    ===
                    "Activo"
                        ?
                        "active"
                        :
                        "inactive";


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

                        <div class="student-name">

                            <div class="student-table-avatar">

                                ${initials || "E"}

                            </div>


                            <div class="student-name-info">

                                <strong>

                                    ${fullName || "Sin nombre"}

                                </strong>


                                <span>

                                    ${student.telefono || "Sin teléfono"}

                                </span>

                            </div>

                        </div>

                    </td>


                    <td>

                        ${student.identificacion || "-"}

                    </td>


                    <td>

                        ${student.correo || "Sin correo"}

                    </td>


                    <td>

                        <span
                            class="student-status ${statusClass}"
                        >

                            ${student.estado || "Sin estado"}

                        </span>

                    </td>


                    <td>

                       <div class="student-actions">

    <a
        href="detalle-estudiante.html?id=${student.id}"
        class="student-action-btn"
        title="Consultar estudiante"
        data-permission="estudiantes.ver"
    >
        <i class="bi bi-eye"></i>
    </a>

    ${
        window.Auth
        &&
        window.Auth.currentUser
        &&
        window.Auth.currentUser.rol === "Administrador"
            ?
            `
                <a
                    href="editar-estudiante.html?id=${student.id}"
                    class="student-action-btn"
                    title="Editar estudiante"
                >
                    <i class="bi bi-pencil"></i>
                </a>
            `
            :
            ""
    }

</div>

                    </td>
                `;


                studentTableBody
                    .appendChild(
                        row
                    );
            }
        );
    }


    if (studentTableBody) {

        renderStudents(
            getStudents()
        );
    }


    /* =====================================================
       BUSCADOR DE ESTUDIANTES
    ===================================================== */

    const studentSearch =
        document.getElementById(
            "studentSearch"
        );


    if (studentSearch) {

        studentSearch.addEventListener(
            "input",
            function () {

                const searchText =
                    studentSearch
                        .value
                        .trim()
                        .toLowerCase();


                const students =
                    getStudents();


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


                            const identification =
                                (
                                    student.identificacion
                                    ||
                                    ""
                                )
                                .toLowerCase();


                            const code =
                                (
                                    student.codigo
                                    ||
                                    ""
                                )
                                .toLowerCase();


                            return (

                                fullName.includes(
                                    searchText
                                )

                                ||

                                identification.includes(
                                    searchText
                                )

                                ||

                                code.includes(
                                    searchText
                                )
                            );
                        }
                    );


                renderStudents(
                    filteredStudents
                );
            }
        );
    }


    /* =====================================================
       DETALLE DEL ESTUDIANTE
    ===================================================== */

    const studentDetailContent =
        document.getElementById(
            "studentDetailContent"
        );


    if (studentDetailContent) {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const studentId =
            Number(
                params.get("id")
            );


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
                "studentNotFound"
            );


        if (!student) {

            studentDetailContent
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

        } else {

            const fullName = [

                student.primerNombre,
                student.segundoNombre,
                student.primerApellido,
                student.segundoApellido

            ]
            .filter(Boolean)
            .join(" ");


            const initials =
                (
                    (
                        student.primerNombre
                        ||
                        "E"
                    ).charAt(0)

                    +

                    (
                        student.primerApellido
                        ||
                        ""
                    ).charAt(0)
                )
                .toUpperCase();


            function setText(
                id,
                value
            ) {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.textContent =
                        value || "-";
                }
            }


            setText(
                "detailStudentName",
                fullName
            );

            setText(
    "detailFullName",
    "Ficha del estudiante"
);

            setText(
                "detailAvatar",
                initials
            );

            setText(
                "detailCode",
                student.codigo
            );
            /* FECHA DE REGISTRO DEL ESTUDIANTE */

let fechaRegistro = student.fechaRegistro;

if (!fechaRegistro) {
    const idNumerico = Number(student.id);

    if (
        Number.isFinite(idNumerico) &&
        idNumerico >= 946684800000 &&
        idNumerico <= Date.now()
    ) {
        fechaRegistro = new Date(idNumerico).toISOString();
    }
}

let fechaFormateada = "No disponible";

if (fechaRegistro) {
    const fecha = new Date(fechaRegistro);

    if (!Number.isNaN(fecha.getTime())) {
        fechaFormateada = fecha.toLocaleDateString("es-NI", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }
}

setText(
    "detailRegistrationDate",
    fechaFormateada
);

            setText(
                "detailIdentification",
                student.identificacion
            );

            setText(
                "detailFirstName",
                student.primerNombre
            );

            setText(
                "detailSecondName",
                student.segundoNombre
            );

            setText(
                "detailFirstLastName",
                student.primerApellido
            );

            setText(
                "detailSecondLastName",
                student.segundoApellido
            );

            setText(
                "detailBirthDate",
                student.fechaNacimiento
            );

            setText(
                "detailSex",
                student.sexo
            );

            setText(
                "detailAddress",
                student.direccion
            );

            setText(
                "detailPhone",
                student.telefono
            );

            setText(
                "detailEmail",
                student.correo
            );

            setText(
                "detailAcademicCode",
                student.codigo
            );

            setText(
                "detailAcademicStatus",
                student.estado
            );


            /* ESTADO */

            const status =
                document.getElementById(
                    "detailStatus"
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

                    student.estado
                    ===
                    "Activo"
                        ?
                        "active"
                        :
                        "inactive"
                );
            }


            /* BOTÓN EDITAR */

            const editButton =
                document.getElementById(
                    "detailEditButton"
                );


            if (editButton) {

                editButton.href =
                    "editar-estudiante.html?id="
                    +
                    student.id;
            }


            /* BOTÓN EXPEDIENTE */

            const recordButton =
                document.getElementById(
                    "detailRecordButton"
                );


            if (recordButton) {

                recordButton.href =
                    "expediente-estudiante.html?id="
                    +
                    student.id;
            }
        }
    }


    /* =====================================================
       EDITAR ESTUDIANTE
    ===================================================== */

    const editStudentForm =
        document.getElementById(
            "editStudentForm"
        );


    if (editStudentForm) {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const studentId =
            Number(
                params.get("id")
            );


        const students =
            getStudents();


        const studentIndex =
            students.findIndex(
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
                "editStudentNotFound"
            );


        if (studentIndex === -1) {

            editStudentForm
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

        } else {

            const student =
                students[
                    studentIndex
                ];


            document.getElementById(
                "editPrimerNombre"
            ).value =
                student.primerNombre
                ||
                "";


            document.getElementById(
                "editSegundoNombre"
            ).value =
                student.segundoNombre
                ||
                "";


            document.getElementById(
                "editPrimerApellido"
            ).value =
                student.primerApellido
                ||
                "";


            document.getElementById(
                "editSegundoApellido"
            ).value =
                student.segundoApellido
                ||
                "";


            document.getElementById(
                "editIdentificacion"
            ).value =
                student.identificacion
                ||
                "";


            document.getElementById(
                "editFechaNacimiento"
            ).value =
                student.fechaNacimiento
                ||
                "";


            document.getElementById(
                "editSexo"
            ).value =
                student.sexo
                ||
                "Masculino";


            document.getElementById(
                "editDireccion"
            ).value =
                student.direccion
                ||
                "";


            document.getElementById(
                "editTelefono"
            ).value =
                student.telefono
                ||
                "";


            document.getElementById(
                "editCorreo"
            ).value =
                student.correo
                ||
                "";


            document.getElementById(
                "editCodigoEstudiante"
            ).value =
                student.codigo
                ||
                "";


            document.getElementById(
                "editEstadoEstudiante"
            ).value =
                student.estado
                ||
                "Activo";


            editStudentForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();


                    const updatedStudent = {

                        id:
                            student.id,

                        primerNombre:
                            document
                                .getElementById(
                                    "editPrimerNombre"
                                )
                                .value
                                .trim(),

                        segundoNombre:
                            document
                                .getElementById(
                                    "editSegundoNombre"
                                )
                                .value
                                .trim(),

                        primerApellido:
                            document
                                .getElementById(
                                    "editPrimerApellido"
                                )
                                .value
                                .trim(),

                        segundoApellido:
                            document
                                .getElementById(
                                    "editSegundoApellido"
                                )
                                .value
                                .trim(),

                        identificacion:
                            document
                                .getElementById(
                                    "editIdentificacion"
                                )
                                .value
                                .trim(),

                        fechaNacimiento:
                            document
                                .getElementById(
                                    "editFechaNacimiento"
                                )
                                .value,

                        sexo:
                            document
                                .getElementById(
                                    "editSexo"
                                )
                                .value,

                        direccion:
                            document
                                .getElementById(
                                    "editDireccion"
                                )
                                .value
                                .trim(),

                        telefono:
                            document
                                .getElementById(
                                    "editTelefono"
                                )
                                .value
                                .trim(),

                        correo:
                            document
                                .getElementById(
                                    "editCorreo"
                                )
                                .value
                                .trim(),

                        codigo: student.codigo,

                        estado:
                            document
                                .getElementById(
                                    "editEstadoEstudiante"
                                )
                                .value
                    };


                    /* VALIDAR CÓDIGO */

                    const duplicatedCode =
                        students.some(
                            function (
                                item,
                                index
                            ) {

                                return (

                                    index
                                    !==
                                    studentIndex

                                    &&

                                    (
                                        item.codigo
                                        ||
                                        ""
                                    )
                                    .toLowerCase()
                                    ===
                                    updatedStudent
                                        .codigo
                                        .toLowerCase()
                                );
                            }
                        );


                    if (duplicatedCode) {

                        alert(
                            "Ya existe otro estudiante con ese código."
                        );

                        return;
                    }


                    /* VALIDAR IDENTIFICACIÓN */

                    const duplicatedIdentification =
                        students.some(
                            function (
                                item,
                                index
                            ) {

                                return (

                                    index
                                    !==
                                    studentIndex

                                    &&

                                    (
                                        item.identificacion
                                        ||
                                        ""
                                    )
                                    .toLowerCase()
                                    ===
                                    updatedStudent
                                        .identificacion
                                        .toLowerCase()
                                );
                            }
                        );


                    if (
                        duplicatedIdentification
                    ) {

                        alert(
                            "Ya existe otro estudiante con ese número de identificación."
                        );

                        return;
                    }


                    /* GUARDAR CAMBIOS */

                    students[
    studentIndex
] =
    updatedStudent;


/* ACTUALIZAR LOCALSTORAGE */

saveStudents(
    students
);


/* ACTUALIZAR TAMBIÉN EN FIRESTORE */

if (
    typeof window.actualizarEstudianteFirestore
    === "function"
) {

    window.actualizarEstudianteFirestore(
        updatedStudent
    );

} else {

    console.warn(
        "Firestore todavía no está disponible para actualizar."
    );
}


                    /* NOMBRE COMPLETO */

                    const updatedStudentName = [

                        updatedStudent
                            .primerNombre,

                        updatedStudent
                            .segundoNombre,

                        updatedStudent
                            .primerApellido,

                        updatedStudent
                            .segundoApellido

                    ]
                    .filter(Boolean)
                    .join(" ");


                    /* AUDITORÍA */

                    registrarAuditoria(

                        "Modificación de estudiante",

                        `Se actualizó la información del estudiante ${updatedStudentName}.`,

                        updatedStudent.id,

                        updatedStudentName
                    );


                    const message =
                        document.getElementById(
                            "editStudentMessage"
                        );


                    if (message) {

                        message
                            .classList
                            .remove(
                                "d-none"
                            );
                    }


                    setTimeout(
                        function () {

                            window.location.href =
                                "detalle-estudiante.html?id="
                                +
                                updatedStudent.id;

                        },
                        1000
                    );
                }
            );
        }
    }

});