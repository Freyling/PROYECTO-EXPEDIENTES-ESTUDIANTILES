document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       FORMULARIO
    ===================================================== */

    const form =
        document.getElementById(
            "editUserForm"
        );


    if (!form) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const userId =
        Number(
            params.get("id")
        );


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const nameInput =
        document.getElementById(
            "editUserName"
        );


    const emailInput =
        document.getElementById(
            "editUserEmail"
        );


    const roleInput =
        document.getElementById(
            "editUserRole"
        );


    const statusInput =
        document.getElementById(
            "editUserStatus"
        );


    const normalNameContainer =
        document.getElementById(
            "normalNameContainer"
        );


    const normalEmailContainer =
        document.getElementById(
            "normalEmailContainer"
        );


    const administratorSection =
        document.getElementById(
            "editAdministratorSection"
        );


    const staffSection =
        document.getElementById(
            "editStaffPermissions"
        );


    const studentSection =
        document.getElementById(
            "editStudentSection"
        );


    const linkedStudent =
        document.getElementById(
            "editLinkedStudent"
        );


    const studentCode =
        document.getElementById(
            "editStudentCode"
        );


    const permissionCheckboxes =
        document.querySelectorAll(
            ".edit-permission"
        );


    const deactivateButton =
        document.getElementById(
            "deactivateUserButton"
        );


    /* =====================================================
       STORAGE
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


    function saveUsers(users) {

        localStorage.setItem(
            "systemUsers",
            JSON.stringify(users)
        );
    }


    /* =====================================================
       ESTUDIANTES
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


    function loadStudents() {

        const students =
            getData(
                "students"
            );


        linkedStudent.innerHTML = `

            <option value="">
                Selecciona un estudiante
            </option>

        `;


        students.forEach(
            function (student) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    student.id;


                option.textContent =
                    (
                        student.codigo
                        ||
                        "Sin código"
                    )
                    +
                    " - "
                    +
                    getStudentName(
                        student
                    );


                linkedStudent.appendChild(
                    option
                );
            }
        );
    }


    /* =====================================================
       PERMISOS
    ===================================================== */

    function administratorPermissions() {

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

            "reportes.ver",

            "usuarios.ver",
            "usuarios.crear",
            "usuarios.editar",

            "historial.ver"
        ];
    }


    function studentPermissions() {

        return [
            "portal.ver",
            "perfil.propio.ver",
            "matricula.propia.ver",
            "expediente.propio.ver",
            "calificaciones.propias.ver",
            "documentos.propios.ver"
        ];
    }


    function selectedPermissions() {

        const permissions =
            [];


        permissionCheckboxes.forEach(
            function (checkbox) {

                if (checkbox.checked) {

                    permissions.push(
                        checkbox.value
                    );
                }
            }
        );


        return permissions;
    }


    function setPermissions(permissions) {

        permissionCheckboxes.forEach(
            function (checkbox) {

                checkbox.checked =
                    permissions.includes(
                        checkbox.value
                    );
            }
        );
    }


    /* =====================================================
       SECCIONES POR ROL
    ===================================================== */

    function updateRoleSections() {

        const role =
            roleInput.value;


        administratorSection
            .classList
            .add("d-none");


        staffSection
            .classList
            .add("d-none");


        studentSection
            .classList
            .add("d-none");


        normalNameContainer
            .classList
            .remove("d-none");


        normalEmailContainer
            .classList
            .remove("d-none");


        if (
            role
            ===
            "Administrador"
        ) {

            administratorSection
                .classList
                .remove("d-none");
        }


        if (
            role
            ===
            "Personal educativo"
        ) {

            staffSection
                .classList
                .remove("d-none");
        }


        if (
            role
            ===
            "Estudiante"
        ) {

            studentSection
                .classList
                .remove("d-none");


            /*
                Para estudiante el nombre y correo
                no se editan manualmente.
            */

            normalNameContainer
                .classList
                .add("d-none");


            normalEmailContainer
                .classList
                .add("d-none");
        }
    }


    /* =====================================================
       AUDITORÍA
    ===================================================== */

    function registerAudit(
        action,
        description
    ) {

        const history =
            getData(
                "auditHistory"
            );


        history.push({

            id:
                Date.now(),

            accion:
                action,

            descripcion:
                description,

            estudianteId:
                null,

            estudianteNombre:
                "",

            usuario:
                "Administrador",

            usuarioNombre:
                "Administrador",

            rol:
                "Administrador",

            fecha:
                new Date()
                    .toISOString()

        });


        localStorage.setItem(
            "auditHistory",
            JSON.stringify(history)
        );
    }


    /* =====================================================
       BUSCAR USUARIO
    ===================================================== */

    let users =
        getData(
            "systemUsers"
        );


    let userIndex =
        users.findIndex(
            function (user) {

                return (
                    Number(user.id)
                    ===
                    userId
                );
            }
        );


    if (
        userIndex
        ===
        -1
    ) {

        form.classList.add(
            "d-none"
        );


        document
            .getElementById(
                "userNotFound"
            )
            .classList
            .remove(
                "d-none"
            );


        return;
    }


    let currentUser =
        users[userIndex];


    /* =====================================================
       CARGAR INFORMACIÓN
    ===================================================== */

    function loadUser() {

        nameInput.value =
            currentUser.nombre
            ||
            "";


        emailInput.value =
            currentUser.correo
            ||
            "";


        roleInput.value =
            currentUser.rol
            ||
            "Personal educativo";


        statusInput.value =
            currentUser.estado
            ||
            "Activo";


        updateRoleSections();


        if (
            currentUser.rol
            ===
            "Personal educativo"
        ) {

            setPermissions(
                Array.isArray(
                    currentUser.permisos
                )
                    ?
                    currentUser.permisos
                    :
                    []
            );
        }


        if (
            currentUser.rol
            ===
            "Estudiante"
        ) {

            linkedStudent.value =
                currentUser.studentId
                ||
                "";


            updateStudentCode();
        }


        updateDeactivateButton();
    }


    /* =====================================================
       CÓDIGO ESTUDIANTE
    ===================================================== */

    function updateStudentCode() {

        const studentId =
            Number(
                linkedStudent.value
            );


        const students =
            getData(
                "students"
            );


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


        if (!student) {

            studentCode.value =
                "";

            return;
        }


        studentCode.value =
            student.codigo
            ||
            "";
    }


    linkedStudent.addEventListener(
        "change",
        updateStudentCode
    );


    /* =====================================================
       CAMBIO DE ROL
    ===================================================== */

    roleInput.addEventListener(
        "change",
        function () {

            updateRoleSections();


            if (
                roleInput.value
                ===
                "Personal educativo"
            ) {

                setPermissions(
                    []
                );
            }


            if (
                roleInput.value
                ===
                "Estudiante"
            ) {

                updateStudentCode();
            }
        }
    );


    /* =====================================================
       BOTÓN ACTIVAR / DESACTIVAR
    ===================================================== */

    function updateDeactivateButton() {

        if (
            statusInput.value
            ===
            "Activo"
        ) {

            deactivateButton.innerHTML = `

                <i class="bi bi-person-x me-1"></i>
                Desactivar usuario

            `;


            deactivateButton.className =
                "btn btn-outline-danger";

        } else {

            deactivateButton.innerHTML = `

                <i class="bi bi-person-check me-1"></i>
                Activar usuario

            `;


            deactivateButton.className =
                "btn btn-outline-success";
        }
    }


    statusInput.addEventListener(
        "change",
        updateDeactivateButton
    );


    deactivateButton.addEventListener(
        "click",
        function () {

            if (
                statusInput.value
                ===
                "Activo"
            ) {

                statusInput.value =
                    "Inactivo";

            } else {

                statusInput.value =
                    "Activo";
            }


            updateDeactivateButton();
        }
    );


    /* =====================================================
       GUARDAR CAMBIOS
    ===================================================== */

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const role =
                roleInput.value;


            const status =
                statusInput.value;


            let name =
                nameInput.value.trim();


            let email =
                emailInput.value.trim();


            let permissions =
                [];


            let linkedStudentId =
                null;


            let linkedStudentName =
                "";


            let accessCode =
                null;


            /* =============================================
               ADMINISTRADOR / PERSONAL
            ============================================== */

            if (
                role
                !==
                "Estudiante"
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


                const duplicateEmail =
                    users.some(
                        function (user, index) {

                            return (
                                index
                                !==
                                userIndex

                                &&

                                String(
                                    user.correo
                                    ||
                                    ""
                                )
                                .trim()
                                .toLowerCase()
                                ===
                                email.toLowerCase()
                            );
                        }
                    );


                if (duplicateEmail) {

                    alert(
                        "Ya existe otro usuario con este correo electrónico."
                    );

                    return;
                }
            }


            /* =============================================
               ADMINISTRADOR
            ============================================== */

            if (
                role
                ===
                "Administrador"
            ) {

                permissions =
                    administratorPermissions();
            }


            /* =============================================
               PERSONAL EDUCATIVO
            ============================================== */

            if (
                role
                ===
                "Personal educativo"
            ) {

                permissions =
                    selectedPermissions();


                if (
                    permissions.length
                    ===
                    0
                ) {

                    alert(
                        "Selecciona al menos un permiso para este usuario."
                    );

                    return;
                }
            }


            /* =============================================
               ESTUDIANTE
            ============================================== */

            if (
                role
                ===
                "Estudiante"
            ) {

                linkedStudentId =
                    Number(
                        linkedStudent.value
                    );


                if (!linkedStudentId) {

                    alert(
                        "Selecciona el estudiante vinculado."
                    );

                    return;
                }


                const students =
                    getData(
                        "students"
                    );


                const student =
                    students.find(
                        function (item) {

                            return (
                                Number(item.id)
                                ===
                                linkedStudentId
                            );
                        }
                    );


                if (!student) {

                    alert(
                        "No se encontró el estudiante seleccionado."
                    );

                    return;
                }


                const alreadyLinked =
                    users.some(
                        function (user, index) {

                            return (
                                index
                                !==
                                userIndex

                                &&

                                user.rol
                                ===
                                "Estudiante"

                                &&

                                Number(
                                    user.studentId
                                )
                                ===
                                linkedStudentId
                            );
                        }
                    );


                if (alreadyLinked) {

                    alert(
                        "Este estudiante ya está vinculado con otra cuenta."
                    );

                    return;
                }


                name =
                    getStudentName(
                        student
                    );


                /*
                    Conservamos el correo del estudiante
                    como dato informativo, pero NO será
                    su identificador de inicio de sesión.
                */

                email =
                    student.correo
                    ||
                    "";


                accessCode =
                    student.codigo
                    ||
                    "";


                linkedStudentName =
                    name;


                permissions =
                    studentPermissions();
            }


            /* =============================================
               CONTRASEÑA
            ============================================== */

            const password =
                document
                    .getElementById(
                        "editPassword"
                    )
                    .value;


            const confirmPassword =
                document
                    .getElementById(
                        "editConfirmPassword"
                    )
                    .value;


            if (
                password !== ""
                ||
                confirmPassword !== ""
            ) {

                if (
                    password.length
                    <
                    6
                ) {

                    alert(
                        "La nueva contraseña debe tener al menos 6 caracteres."
                    );

                    return;
                }


                if (
                    password
                    !==
                    confirmPassword
                ) {

                    alert(
                        "Las nuevas contraseñas no coinciden."
                    );

                    return;
                }
            }


            /* =============================================
               ACTUALIZAR
            ============================================== */

            const updatedUser = {

                ...currentUser,

                nombre:
                    name,

                correo:
                    email,

                rol:
                    role,

                estado:
                    status,

                permisos:
                    permissions,

                studentId:
                    linkedStudentId,

                studentName:
                    linkedStudentName,

                codigoAcceso:
                    accessCode,

                fechaModificacion:
                    new Date()
                        .toISOString()

            };


            if (
                password !== ""
            ) {

                /*
                    Solamente para el prototipo local.
                    Firebase Authentication reemplazará
                    este mecanismo posteriormente.
                */

                updatedUser.password =
                    password;
            }


            users[userIndex] =
                updatedUser;


            saveUsers(
                users
            );


            /* =============================================
               AUDITORÍA
            ============================================== */

            registerAudit(
                "Usuario modificado",
                "Se actualizó la cuenta de "
                +
                name
                +
                " con rol "
                +
                role
                +
                " y estado "
                +
                status
                +
                "."
            );


            /* =============================================
               MENSAJE
            ============================================== */

            const message =
                document.getElementById(
                    "editUserMessage"
                );


            message.classList.remove(
                "d-none"
            );


            message.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center"
            });


            setTimeout(
                function () {

                    window.location.href =
                        "usuarios.html";

                },
                900
            );

        }
    );


    /* =====================================================
       INICIAR
    ===================================================== */

    loadStudents();

    loadUser();


});