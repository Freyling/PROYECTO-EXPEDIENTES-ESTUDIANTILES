document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CONTROL DE SESIÓN Y PERMISOS
       PROTOTIPO CON LOCALSTORAGE / SESSIONSTORAGE
    ===================================================== */


    /* =====================================================
       OBTENER USUARIO ACTUAL
    ===================================================== */

    function getCurrentUser() {

        let data =
            sessionStorage.getItem("currentUser")
            ||
            localStorage.getItem("currentUser");


        if (!data) {

            return null;

        }


        try {

            const user =
                JSON.parse(data);


            if (
                !user
                ||
                !user.id
                ||
                !user.rol
            ) {

                return null;

            }


            return user;


        } catch (error) {

            console.error(
                "Error al leer la sesión:",
                error
            );


            return null;

        }

    }



    /* =====================================================
       USUARIO ACTUAL
    ===================================================== */

    const currentUser =
        getCurrentUser();



    /* =====================================================
       PROTEGER PÁGINAS
    ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const publicPages = [

        "index.html",
        "login.html",
        ""

    ];



    if (
        !publicPages.includes(currentPage)
        &&
        !currentUser
    ) {

        window.location.replace(
            "login.html"
        );

        return;

    }



    /*
        Si estamos en una página pública,
        no necesitamos continuar aplicando
        controles del dashboard.
    */

    if (!currentUser) {

        return;

    }



    /* =====================================================
       FUNCIONES DE PERMISOS
    ===================================================== */

    function hasPermission(permission) {

        /*
            El Administrador siempre posee
            acceso completo.
        */

        if (
            currentUser.rol
            ===
            "Administrador"
        ) {

            return true;

        }


        const permissions =
            Array.isArray(currentUser.permisos)
                ?
                currentUser.permisos
                :
                [];


        return permissions.includes(
            permission
        );

    }



    function hasAnyPermission(permissionList) {

        if (
            currentUser.rol
            ===
            "Administrador"
        ) {

            return true;

        }


        return permissionList.some(
            function (permission) {

                return hasPermission(
                    permission
                );

            }
        );

    }



    /* =====================================================
       EXPONER SESIÓN GLOBALMENTE

       Esto permitirá que otros archivos JS
       consulten posteriormente el usuario.
    ===================================================== */

    window.Auth = {

        currentUser:
            currentUser,

        hasPermission:
            hasPermission,

        hasAnyPermission:
            hasAnyPermission

    };



    /* =====================================================
       INFORMACIÓN VISUAL DEL USUARIO
    ===================================================== */

    const displayName =
        currentUser.nombre
        ||
        currentUser.studentName
        ||
        "Usuario";


    const displayRole =
        currentUser.rol
        ||
        "Usuario";


    const firstLetter =
        displayName
            .trim()
            .charAt(0)
            .toUpperCase()
        ||
        "U";



    /* =====================================================
       BIENVENIDA
    ===================================================== */

    const welcomeName =
        document.getElementById(
            "currentUserWelcome"
        );


    if (welcomeName) {

        welcomeName.textContent =
            "Bienvenido, "
            +
            displayName;

    }



    /* =====================================================
       NOMBRE EN SIDEBAR
    ===================================================== */

    const sidebarUserName =
        document.getElementById(
            "currentUserName"
        );


    if (sidebarUserName) {

        sidebarUserName.textContent =
            displayName;

    }



    /* =====================================================
       ROL EN SIDEBAR
    ===================================================== */

    const sidebarUserRole =
        document.getElementById(
            "currentUserRole"
        );


    if (sidebarUserRole) {

        sidebarUserRole.textContent =
            displayRole;

    }



    /* =====================================================
       AVATAR SIDEBAR
    ===================================================== */

    const sidebarAvatar =
        document.getElementById(
            "currentUserAvatar"
        );


    if (sidebarAvatar) {

        sidebarAvatar.textContent =
            firstLetter;

    }



    /* =====================================================
       AVATAR HEADER
    ===================================================== */

    const headerAvatar =
        document.getElementById(
            "currentUserHeaderAvatar"
        );


    if (headerAvatar) {

        headerAvatar.textContent =
            firstLetter;

    }



    /* =====================================================
       ELEMENTOS CONTROLADOS POR PERMISOS

       Uso:

       data-permission="permiso"

       o

       data-permissions="permiso1,permiso2"
    ===================================================== */

    const permissionElements =
        document.querySelectorAll(
            "[data-permission]"
        );


    permissionElements.forEach(
        function (element) {

            const permission =
                element.getAttribute(
                    "data-permission"
                );


            if (
                !hasPermission(permission)
            ) {

                element.classList.add(
                    "d-none"
                );

            }

        }
    );



    const multiplePermissionElements =
        document.querySelectorAll(
            "[data-permissions]"
        );


    multiplePermissionElements.forEach(
        function (element) {

            const permissions =
                (
                    element.getAttribute(
                        "data-permissions"
                    )
                    ||
                    ""
                )
                .split(",")
                .map(
                    function (item) {

                        return item.trim();

                    }
                )
                .filter(Boolean);


            if (
                !hasAnyPermission(
                    permissions
                )
            ) {

                element.classList.add(
                    "d-none"
                );

            }

        }
    );



    /* =====================================================
       SECCIÓN ADMINISTRACIÓN
    ===================================================== */

    const adminSection =
        document.getElementById(
            "administrationMenuSection"
        );


    if (adminSection) {

        if (
            currentUser.rol
            !==
            "Administrador"
            &&
            !hasAnyPermission([
                "usuarios.ver",
                "usuarios.gestionar",
                "auditoria.ver"
            ])
        ) {

            adminSection.classList.add(
                "d-none"
            );

        }

    }

    /* =====================================================
       ELEMENTOS EXCLUSIVOS DEL ADMINISTRADOR
    ===================================================== */

    const adminOnlyElements =
        document.querySelectorAll(
            "[data-admin-only]"
        );


    adminOnlyElements.forEach(
        function (element) {

            if (
                currentUser.rol
                !==
                "Administrador"
            ) {

                element.classList.add(
                    "d-none"
                );

            }

        }
    );

    /* =====================================================
       CERRAR SESIÓN
    ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                /* =========================================
                   REGISTRAR AUDITORÍA
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


                    if (
                        !Array.isArray(history)
                    ) {

                        history = [];

                    }

                } catch (error) {

                    history = [];

                }


                history.push({

                    id:
                        Date.now(),

                    usuarioId:
                        currentUser.id,

                    usuarioNombre:
                        displayName,

                    usuario:
                        displayName,

                    rol:
                        displayRole,

                    accion:
                        "Cierre de sesión",

                    descripcion:
                        "El usuario "
                        +
                        displayName
                        +
                        " cerró sesión en el sistema.",

                    estudianteId:
                        currentUser.studentId
                        ||
                        null,

                    estudianteNombre:
                        currentUser.studentName
                        ||
                        "",

                    fecha:
                        new Date().toISOString()

                });


                localStorage.setItem(
                    "auditHistory",
                    JSON.stringify(history)
                );


                /* =========================================
                   ELIMINAR SESIÓN
                ========================================== */

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



    /* =====================================================
       BLOQUEO DE PÁGINAS ADMINISTRATIVAS

       Esto es protección del prototipo en cliente.
       La seguridad real posteriormente será Firebase.
    ===================================================== */

    const adminOnlyPages = [

        "usuarios.html",
        "registrar-usuario.html",
        "editar-usuario.html"

    ];


    if (
        adminOnlyPages.includes(
            currentPage
        )
        &&
        currentUser.rol
        !==
        "Administrador"
    ) {

        alert(
            "No tienes permisos para acceder a esta sección."
        );


        window.location.replace(
            "dashboard.html"
        );


        return;

    }

        /* =====================================================
       PÁGINAS EXCLUSIVAS DEL ADMINISTRADOR
       PARA GESTIÓN DE ESTUDIANTES
    ===================================================== */

    const studentAdminPages = [

        "registrar-estudiante.html",
        "editar-estudiante.html"

    ];


    if (
        studentAdminPages.includes(
            currentPage
        )
        &&
        currentUser.rol
        !==
        "Administrador"
    ) {

        alert(
            "No tienes permisos para realizar esta acción."
        );


        window.location.replace(
            "estudiantes.html"
        );


        return;

    }


    /* =====================================================
       PORTAL DEL ESTUDIANTE

       El estudiante no debe acceder al dashboard
       administrativo escribiendo la URL manualmente.
    ===================================================== */

    /* =====================================================
   PROTECCIÓN GENERAL DE PÁGINAS SEGÚN ROL
===================================================== */

const pagePermissions = {

    "estudiantes.html":
        "estudiantes.ver",

    "detalle-estudiante.html":
        "estudiantes.ver",

    "matriculas.html":
        "matriculas.ver",

    "nueva-matricula.html":
        "matriculas.crear",

    "asignaturas.html":
        "asignaturas.ver",

    "calificaciones.html":
        "calificaciones.ver",

    "expedientes.html":
        "expedientes.ver",

    "expediente-estudiante.html":
        "expedientes.ver",

    "documentos.html":
        "documentos.ver",

   "agregar-documento.html":
    "documentos.crear",

"analitica-predictiva.html":
    "analitica.ver"

};


/* =====================================================
   PÁGINAS EXCLUSIVAS DEL ADMINISTRADOR
===================================================== */

const administratorOnlyPages = [
"asignaciones-docentes.html",
    "registrar-estudiante.html",
    "editar-estudiante.html",

    "busqueda-avanzada.html",
    "reportes.html",

    "usuarios.html",
    "registrar-usuario.html",
    "editar-usuario.html",

    "historial.html",

    "registro-academico.html"
    

];


/* =====================================================
   ESTUDIANTE
   Solo puede utilizar su portal personal
===================================================== */

if (
    currentUser.rol === "Estudiante"
) {

    if (
        currentPage !== "portal-estudiante.html"
    ) {

        window.location.replace(
            "portal-estudiante.html"
        );

        return;
    }
}


/* =====================================================
   PORTAL DEL ESTUDIANTE
   Administrador y personal educativo no deben entrar
===================================================== */

if (
    currentPage === "portal-estudiante.html"
    &&
    currentUser.rol !== "Estudiante"
) {

    window.location.replace(
        "dashboard.html"
    );

    return;
}


/* =====================================================
   PÁGINAS EXCLUSIVAS DEL ADMINISTRADOR
===================================================== */

if (
    administratorOnlyPages.includes(
        currentPage
    )
    &&
    currentUser.rol !== "Administrador"
) {

    window.location.replace(
        "dashboard.html"
    );

    return;
}


/* =====================================================
   PÁGINAS CONTROLADAS POR PERMISOS
===================================================== */

const requiredPermission =
    pagePermissions[
        currentPage
    ];


if (
    requiredPermission
    &&
    currentUser.rol !== "Administrador"
    &&
    !hasPermission(
        requiredPermission
    )
) {

    window.location.replace(
        "dashboard.html"
    );

    return;
}

});