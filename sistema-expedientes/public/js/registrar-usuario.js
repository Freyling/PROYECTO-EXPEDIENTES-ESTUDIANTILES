document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTOS PRINCIPALES
    ===================================================== */

    const userForm =
        document.getElementById("userForm");

    if (!userForm) {
        return;
    }

    const userName =
        document.getElementById("userName");

    const userEmail =
        document.getElementById("userEmail");

    const userPassword =
        document.getElementById("userPassword");

    const userConfirmPassword =
        document.getElementById("userConfirmPassword");

    const userRole =
        document.getElementById("userRole");

    const userStatus =
        document.getElementById("userStatus");

    const userNameContainer =
        document.getElementById("userNameContainer");

    const userEmailContainer =
        document.getElementById("userEmailContainer");

    const administratorInformation =
        document.getElementById("administratorInformation");

    const staffPermissions =
        document.getElementById("staffPermissions");

    const studentLinkSection =
        document.getElementById("studentLinkSection");

    const linkedStudent =
        document.getElementById("linkedStudent");

    const studentAccessCode =
        document.getElementById("studentAccessCode");

    const permissionCheckboxes =
        document.querySelectorAll(".permission-checkbox");


    /* =====================================================
       LOCAL STORAGE
    ===================================================== */

    function getData(key) {

        try {

            const data =
                JSON.parse(
                    localStorage.getItem(key) || "[]"
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


    function saveUsers(users) {

        localStorage.setItem(
            "systemUsers",
            JSON.stringify(users)
        );
    }


    /* =====================================================
       NORMALIZAR TEXTO
    ===================================================== */

    function normalizeText(value) {

        return String(value || "")
            .trim()
            .toLowerCase();
    }


    /* =====================================================
       NOMBRE COMPLETO DEL ESTUDIANTE
    ===================================================== */

    function getStudentName(student) {

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
       CARGAR ESTUDIANTES
    ===================================================== */

    function loadStudents() {

        const students =
            getData("students");

        if (!linkedStudent) {
            return;
        }

        linkedStudent.innerHTML = `
            <option value="">
                Selecciona un estudiante
            </option>
        `;

        students
            .slice()
            .sort(function (a, b) {

                return getStudentName(a)
                    .localeCompare(
                        getStudentName(b)
                    );
            })
            .forEach(function (student) {

                const option =
                    document.createElement("option");

                option.value =
                    student.id;

                option.textContent =
                    (student.codigo || "Sin código")
                    +
                    " - "
                    +
                    getStudentName(student);

                linkedStudent.appendChild(
                    option
                );
            });
    }


    /* =====================================================
       ACTUALIZAR CÓDIGO DEL ESTUDIANTE
    ===================================================== */

    function updateStudentAccessCode() {

        if (!studentAccessCode) {
            return;
        }

        const studentId =
            Number(linkedStudent.value);

        if (!studentId) {

            studentAccessCode.value = "";

            return;
        }

        const students =
            getData("students");

        const student =
            students.find(function (item) {

                return (
                    Number(item.id)
                    ===
                    studentId
                );
            });

        if (!student) {

            studentAccessCode.value = "";

            return;
        }

        studentAccessCode.value =
            student.codigo || "";
    }


    if (linkedStudent) {

        linkedStudent.addEventListener(
            "change",
            updateStudentAccessCode
        );
    }


    /* =====================================================
       GENERAR CONTRASEÑA PROVISIONAL
    ===================================================== */

    function generateStudentPassword() {

        const letters =
            "ABCDEFGHJKLMNPQRSTUVWXYZ";

        const numbers =
            "23456789";

        let password = "";

        for (let i = 0; i < 4; i++) {

            password +=
                letters[
                    Math.floor(
                        Math.random()
                        *
                        letters.length
                    )
                ];
        }

        for (let i = 0; i < 4; i++) {

            password +=
                numbers[
                    Math.floor(
                        Math.random()
                        *
                        numbers.length
                    )
                ];
        }

        return password;
    }


    /* =====================================================
       SECCIONES SEGÚN ROL
    ===================================================== */

    function updateRoleSections() {

        const role =
            userRole.value;

        administratorInformation
            .classList
            .add("d-none");

        staffPermissions
            .classList
            .add("d-none");

        studentLinkSection
            .classList
            .add("d-none");


        /* =============================================
           ADMINISTRADOR / PERSONAL
        ============================================== */

        if (
            role !== "Estudiante"
        ) {

            if (userNameContainer) {

                userNameContainer
                    .classList
                    .remove("d-none");
            }

            if (userEmailContainer) {

                userEmailContainer
                    .classList
                    .remove("d-none");
            }

            userName.required =
                true;

            userEmail.required =
                true;

            userPassword.required =
                true;

            userConfirmPassword.required =
                true;
        }


        /* =============================================
           ADMINISTRADOR
        ============================================== */

        if (
            role === "Administrador"
        ) {

            administratorInformation
                .classList
                .remove("d-none");
        }


        /* =============================================
           PERSONAL EDUCATIVO
        ============================================== */

        if (
            role === "Personal educativo"
        ) {

            staffPermissions
                .classList
                .remove("d-none");
        }


        /* =============================================
           ESTUDIANTE
        ============================================== */

        if (
            role === "Estudiante"
        ) {

            studentLinkSection
                .classList
                .remove("d-none");


            /*
                El nombre y correo se obtienen
                del estudiante registrado.
            */

            if (userNameContainer) {

                userNameContainer
                    .classList
                    .add("d-none");
            }

            if (userEmailContainer) {

                userEmailContainer
                    .classList
                    .add("d-none");
            }


            userName.required =
                false;

            userEmail.required =
                false;


            /*
                Generamos contraseña provisional.
            */

            const generatedPassword =
                generateStudentPassword();

            userPassword.value =
                generatedPassword;

            userConfirmPassword.value =
                generatedPassword;

            userPassword.required =
                true;

            userConfirmPassword.required =
                true;


            /*
                Mostramos temporalmente la contraseña
                para que el administrador pueda verla.
            */

            userPassword.type =
                "text";

            updateStudentAccessCode();

        } else {

            /*
                Si vuelve a otro rol,
                limpiamos la contraseña automática.
            */

            userPassword.type =
                "password";
        }
    }


    /* =====================================================
       PERMISOS ADMINISTRADOR
    ===================================================== */

    function getAdministratorPermissions() {

        return [

            "estudiantes.ver",
            "estudiantes.crear",
            "estudiantes.editar",

            "matriculas.ver",
            "matriculas.crear",

            "expedientes.ver",

            "documentos.ver",
            "documentos.crear",

            "asignaturas.ver",
            "asignaturas.crear",

            "calificaciones.ver",
"calificaciones.crear",

"analitica.ver",

"reportes.ver",

            "usuarios.ver",
            "usuarios.crear",
            "usuarios.editar",

            "historial.ver"
        ];
    }


    /* =====================================================
       PERMISOS PERSONAL EDUCATIVO
    ===================================================== */

    function getSelectedPermissions() {

        const permissions = [];

        permissionCheckboxes
            .forEach(function (checkbox) {

                if (checkbox.checked) {

                    permissions.push(
                        checkbox.value
                    );
                }
            });

        return permissions;
    }


    /* =====================================================
       PERMISOS ESTUDIANTE
    ===================================================== */

    function getStudentPermissions() {

        return [

            "portal.ver",
            "perfil.propio.ver",
            "matricula.propia.ver",
            "expediente.propio.ver",
            "calificaciones.propias.ver",
            "documentos.propios.ver"
        ];
    }


    /* =====================================================
       AUDITORÍA
    ===================================================== */

    function registerAudit(
        action,
        description,
        studentId = null,
        studentName = ""
    ) {

        const history =
            getData("auditHistory");

        history.push({

            id:
                Date.now(),

            accion:
                action,

            descripcion:
                description,

            estudianteId:
                studentId,

            estudianteNombre:
                studentName,

            usuario:
                "Administrador",

            usuarioNombre:
                "Administrador",

            rol:
                "Administrador",

            fecha:
                new Date().toISOString()
        });

        localStorage.setItem(
            "auditHistory",
            JSON.stringify(history)
        );
    }


    /* =====================================================
       MOSTRAR / OCULTAR CONTRASEÑA
    ===================================================== */

    const togglePassword =
        document.getElementById(
            "togglePassword"
        );


    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            function () {

                if (
                    userPassword.type
                    ===
                    "password"
                ) {

                    userPassword.type =
                        "text";

                    togglePassword.innerHTML =
                        `<i class="bi bi-eye-slash"></i>`;

                } else {

                    userPassword.type =
                        "password";

                    togglePassword.innerHTML =
                        `<i class="bi bi-eye"></i>`;
                }
            }
        );
    }


    /* =====================================================
       CAMBIO DE ROL
    ===================================================== */

    userRole.addEventListener(
        "change",
        updateRoleSections
    );


    /* =====================================================
       GUARDAR USUARIO
    ===================================================== */

    userForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const role =
                userRole.value;

            const status =
                userStatus.value;

            let name =
                userName.value.trim();

            let email =
                userEmail.value.trim();

            const password =
                userPassword.value;

            const confirmPassword =
                userConfirmPassword.value;


            /* =============================================
               VALIDACIONES GENERALES
            ============================================== */

            if (
                role === ""
                ||
                status === ""
            ) {

                alert(
                    "Selecciona el rol y estado del usuario."
                );

                return;
            }


            if (
                password === ""
                ||
                confirmPassword === ""
            ) {

                alert(
                    "La contraseña es obligatoria."
                );

                return;
            }


            if (
                password.length < 6
            ) {

                alert(
                    "La contraseña debe tener al menos 6 caracteres."
                );

                return;
            }


            if (
                password
                !==
                confirmPassword
            ) {

                alert(
                    "Las contraseñas no coinciden."
                );

                return;
            }


            const users =
                getData("systemUsers");


            let permissions = [];

            let studentId = null;

            let studentName = "";

            let accessCode = null;


            /* =============================================
               ADMINISTRADOR
            ============================================== */

            if (
                role === "Administrador"
            ) {

                if (
                    name === ""
                    ||
                    email === ""
                ) {

                    alert(
                        "Completa el nombre y correo electrónico."
                    );

                    return;
                }


                const duplicatedEmail =
                    users.some(function (user) {

                        return (
                            normalizeText(
                                user.correo
                            )
                            ===
                            normalizeText(
                                email
                            )
                        );
                    });


                if (duplicatedEmail) {

                    alert(
                        "Ya existe un usuario registrado con este correo electrónico."
                    );

                    return;
                }


                permissions =
                    getAdministratorPermissions();
            }


            /* =============================================
               PERSONAL EDUCATIVO
            ============================================== */

            if (
                role
                ===
                "Personal educativo"
            ) {

                if (
                    name === ""
                    ||
                    email === ""
                ) {

                    alert(
                        "Completa el nombre y correo electrónico."
                    );

                    return;
                }


                const duplicatedEmail =
                    users.some(function (user) {

                        return (
                            normalizeText(
                                user.correo
                            )
                            ===
                            normalizeText(
                                email
                            )
                        );
                    });


                if (duplicatedEmail) {

                    alert(
                        "Ya existe un usuario registrado con este correo electrónico."
                    );

                    return;
                }


                permissions =
                    getSelectedPermissions();


                if (
                    permissions.length === 0
                ) {

                    alert(
                        "Selecciona al menos un permiso para el personal educativo."
                    );

                    return;
                }
            }


            /* =============================================
               ESTUDIANTE
            ============================================== */

            if (
                role === "Estudiante"
            ) {

                if (
                    !linkedStudent.value
                ) {

                    alert(
                        "Selecciona el estudiante que estará vinculado con esta cuenta."
                    );

                    return;
                }


                studentId =
                    Number(
                        linkedStudent.value
                    );


                const students =
                    getData("students");


                const student =
                    students.find(function (item) {

                        return (
                            Number(item.id)
                            ===
                            studentId
                        );
                    });


                if (!student) {

                    alert(
                        "No se encontró el estudiante seleccionado."
                    );

                    return;
                }


                const studentAlreadyLinked =
                    users.some(function (user) {

                        return (
                            user.rol
                            ===
                            "Estudiante"

                            &&

                            Number(
                                user.studentId
                            )
                            ===
                            studentId
                        );
                    });


                if (studentAlreadyLinked) {

                    alert(
                        "Este estudiante ya tiene una cuenta de usuario vinculada."
                    );

                    return;
                }


                studentName =
                    getStudentName(student);


                accessCode =
                    student.codigo || "";


                if (
                    accessCode === ""
                ) {

                    alert(
                        "El estudiante seleccionado no tiene código estudiantil."
                    );

                    return;
                }


                /*
                    Ya NO usamos los datos escritos
                    manualmente en el formulario.
                */

                name =
                    studentName;


                /*
                    El correo queda únicamente como
                    información de contacto.
                */

                email =
                    student.correo || "";


                permissions =
                    getStudentPermissions();
            }


            /* =============================================
               EVITAR CÓDIGO DE ACCESO DUPLICADO
            ============================================== */

            if (
                role === "Estudiante"
            ) {

                const duplicatedCode =
                    users.some(function (user) {

                        return (
                            user.rol
                            ===
                            "Estudiante"

                            &&

                            normalizeText(
                                user.codigoAcceso
                            )
                            ===
                            normalizeText(
                                accessCode
                            )
                        );
                    });


                if (duplicatedCode) {

                    alert(
                        "Ya existe una cuenta con este código estudiantil."
                    );

                    return;
                }
            }


            /* =============================================
               NUEVO USUARIO
            ============================================== */

            const newUser = {

                id:
                    Date.now(),

                nombre:
                    name,

                correo:
                    email,

                /*
                    PROTOTIPO LOCAL.

                    Más adelante Firebase Authentication
                    reemplazará este almacenamiento.
                */

                password:
                    password,

                rol:
                    role,

                estado:
                    status,

                permisos:
                    permissions,

                studentId:
                    studentId,

                studentName:
                    studentName,

                codigoAcceso:
                    accessCode,

                requiereCambioPassword:
                    role === "Estudiante",

                fechaRegistro:
                    new Date().toISOString(),

                ultimoAcceso:
                    null
            };


            users.push(
                newUser
            );


            saveUsers(
                users
            );


            /* =============================================
               AUDITORÍA
            ============================================== */

            let description =
                "Se creó la cuenta de usuario "
                +
                name
                +
                " con el rol "
                +
                role
                +
                ".";


            if (
                role
                ===
                "Personal educativo"
            ) {

                description =
                    "Se creó la cuenta de "
                    +
                    name
                    +
                    " como Personal educativo con "
                    +
                    permissions.length
                    +
                    " permisos asignados.";
            }


            if (
                role
                ===
                "Estudiante"
            ) {

                description =
                    "Se creó la cuenta estudiantil de "
                    +
                    studentName
                    +
                    " con código de acceso "
                    +
                    accessCode
                    +
                    ".";
            }


            registerAudit(
                "Usuario registrado",
                description,
                studentId,
                studentName
            );


            /* =============================================
               MENSAJE
            ============================================== */

            const message =
                document.getElementById(
                    "userMessage"
                );


            if (message) {

                if (
                    role
                    ===
                    "Estudiante"
                ) {

                    message.innerHTML = `

                        <i class="bi bi-check-circle-fill me-2"></i>

                        Cuenta creada correctamente.

                        <strong>
                            Código:
                            ${accessCode}
                        </strong>

                        &nbsp; | &nbsp;

                        <strong>
                            Contraseña provisional:
                            ${password}
                        </strong>

                    `;

                } else {

                    message.innerHTML = `

                        <i class="bi bi-check-circle-fill me-2"></i>

                        Usuario registrado correctamente.

                    `;
                }


                message.classList.remove(
                    "d-none"
                );


                message.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"
                });
            }


            /* =============================================
               REDIRECCIÓN
            ============================================== */

            /*
                Para Administrador y Personal educativo
                regresamos normalmente.

                Para Estudiante damos más tiempo para
                copiar las credenciales.
            */

            const redirectTime =
                role === "Estudiante"
                    ? 5000
                    : 1000;


            setTimeout(
                function () {

                    window.location.href =
                        "usuarios.html";

                },
                redirectTime
            );
        }
    );


    /* =====================================================
       INICIAR
    ===================================================== */

    loadStudents();

    updateRoleSections();

});