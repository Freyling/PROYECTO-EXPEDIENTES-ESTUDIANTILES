document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       LAYOUT GLOBAL DEL SISTEMA
       Menú dinámico según usuario y permisos
    ===================================================== */


    /* =====================================================
       OBTENER USUARIO ACTUAL
    ===================================================== */

    function getCurrentUser() {

        const data =
            sessionStorage.getItem("currentUser")
            ||
            localStorage.getItem("currentUser");

        if (!data) {
            return null;
        }

        try {

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "Error al leer el usuario actual:",
                error
            );

            return null;
        }
    }


    const currentUser =
        getCurrentUser();


    if (!currentUser) {
        return;
    }


    /* =====================================================
       DATOS DEL USUARIO
    ===================================================== */

    const userName =
        currentUser.nombre
        ||
        currentUser.studentName
        ||
        "Usuario";


    const userRole =
        currentUser.rol
        ||
        "Usuario";


    const userInitial =
        userName
            .trim()
            .charAt(0)
            .toUpperCase()
        ||
        "U";


    const permissions =
        Array.isArray(currentUser.permisos)
            ?
            currentUser.permisos
            :
            [];


    /* =====================================================
       PERMISOS
    ===================================================== */

    function hasPermission(permission) {

        if (
            userRole
            ===
            "Administrador"
        ) {
            return true;
        }

        return permissions.includes(
            permission
        );
    }


    function isAdmin() {

        return (
            userRole
            ===
            "Administrador"
        );
    }


    /* =====================================================
       PÁGINA ACTUAL
    ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    /* =====================================================
       CREAR ENLACE DEL MENÚ
    ===================================================== */

    function createMenuLink(
        href,
        icon,
        text,
        activePages
    ) {

        const active =
            activePages.includes(currentPage)
                ?
                " active"
                :
                "";


        return `
            <a
                href="${href}"
                class="sidebar-link${active}"
            >
                <i class="bi ${icon}"></i>
                <span>${text}</span>
            </a>
        `;
    }


    /* =====================================================
       CONSTRUIR MENÚ PRINCIPAL
    ===================================================== */

    let menuHTML = "";


    /* INICIO */

    menuHTML +=
        createMenuLink(
            "dashboard.html",
            "bi-grid-1x2-fill",
            "Inicio",
            [
                "dashboard.html"
            ]
        );


    /* =====================================================
       ESTUDIANTES
    ===================================================== */

    if (
        isAdmin()
        ||
        hasPermission(
            "estudiantes.ver"
        )
    ) {

        menuHTML +=
            createMenuLink(
                "estudiantes.html",
                "bi-people-fill",
                "Estudiantes",
                [
                    "estudiantes.html",
                    "detalle-estudiante.html"
                ]
            );
    }


    /* =====================================================
       MATRÍCULAS
    ===================================================== */

    if (
        isAdmin()
        ||
        hasPermission(
            "matriculas.ver"
        )
        ||
        hasPermission(
            "matriculas.crear"
        )
    ) {

        menuHTML +=
            createMenuLink(
                "matriculas.html",
                "bi-journal-check",
                "Matrículas",
                [
                    "matriculas.html"
                ]
            );
    }


    /* =====================================================
       EXPEDIENTES
       Temporalmente seleccionamos estudiante primero.
    ===================================================== */

    if (
        isAdmin()
        ||
        hasPermission(
            "expedientes.ver"
        )
    ) {

        menuHTML +=
            createMenuLink(
        "expedientes.html",
        "bi-folder-fill",
        "Expedientes",
        [
            "expedientes.html",
            "expediente-estudiante.html"
        ]
            );
    }


    /* =====================================================
   DOCUMENTOS
===================================================== */

if (
    isAdmin()
    ||
    hasPermission(
        "documentos.ver"
    )
    ||
    hasPermission(
        "documentos.crear"
    )
) {

    menuHTML +=
        createMenuLink(
            "documentos.html",
            "bi-file-earmark-text-fill",
            "Documentos",
            [
                "documentos.html",
                "agregar-documento.html"
            ]
        );
}


    /* =====================================================
       ASIGNATURAS
    ===================================================== */

    if (
        isAdmin()
        ||
        hasPermission(
            "asignaturas.ver"
        )
    ) {

        menuHTML +=
            createMenuLink(
                "asignaturas.html",
                "bi-book-fill",
                "Asignaturas",
                [
                    "asignaturas.html"
                ]
            );
    }


    /* =====================================================
       CALIFICACIONES
    ===================================================== */

    if (
        isAdmin()
        ||
        hasPermission(
            "calificaciones.ver"
        )
        ||
        hasPermission(
            "calificaciones.crear"
        )
    ) {

        menuHTML +=
            createMenuLink(
                "calificaciones.html",
                "bi-clipboard-check-fill",
                "Calificaciones",
                [
                    "calificaciones.html"
                ]
            );
    }

    
    /* =====================================================
       ANALÍTICA ACADÉMICA
    ===================================================== */

    if (
        isAdmin()
        ||
        hasPermission("analitica.ver")
    ) {

        menuHTML +=
            createMenuLink(
                "analitica-predictiva.html",
                "bi-graph-up-arrow",
                "Analítica Académica",
                [
                    "analitica-predictiva.html"
                ]
            );
    }


    /* =====================================================
       FUNCIONES EXCLUSIVAS DEL ADMINISTRADOR
    ===================================================== */

    if (isAdmin()) {

        menuHTML +=
            createMenuLink(
                "busqueda-avanzada.html",
                "bi-search",
                "Búsqueda avanzada",
                [
                    "busqueda-avanzada.html"
                ]
            );


        menuHTML +=
            createMenuLink(
                "reportes.html",
                "bi-bar-chart-fill",
                "Reportes",
                [
                    "reportes.html"
                ]
            );


        menuHTML += `

            <div class="sidebar-label sidebar-section">
                ADMINISTRACIÓN
            </div>

        `;


        menuHTML +=
            createMenuLink(
                "usuarios.html",
                "bi-person-gear",
                "Usuarios",
                [
                    "usuarios.html",
                    "registrar-usuario.html",
                    "editar-usuario.html"
                ]
            );


        menuHTML +=
            createMenuLink(
                "historial.html",
                "bi-clock-history",
                "Historial",
                [
                    "historial.html"
                ]
            );
    }


    /* =====================================================
       REEMPLAZAR MENÚ EXISTENTE
    ===================================================== */

    const sidebarMenu =
        document.querySelector(
            ".sidebar-menu"
        );


    if (sidebarMenu) {

        sidebarMenu.innerHTML =
            menuHTML;
    }


    /* =====================================================
       ACTUALIZAR USUARIO DEL SIDEBAR
    ===================================================== */

    const sidebarUser =
        document.querySelector(
            ".sidebar-user"
        );


    if (sidebarUser) {

        sidebarUser.innerHTML = `

            <div
                class="user-avatar"
                id="currentUserAvatar"
            >
                ${userInitial}
            </div>

            <div class="sidebar-user-info">

                <strong id="currentUserName">
                    ${userName}
                </strong>

                <span id="currentUserRole">
                    ${userRole}
                </span>

            </div>

        `;
    }


    /* =====================================================
       AVATAR SUPERIOR
    ===================================================== */

    const headerAvatar =
        document.querySelector(
            ".header-avatar"
        );


    if (headerAvatar) {

        headerAvatar.textContent =
            userInitial;
    }


    /* =====================================================
       BOTÓN CERRAR SESIÓN
    ===================================================== */

    const logoutButton =
        document.querySelector(
            ".logout-button"
        );


    if (logoutButton) {

        logoutButton.href =
            "#";

        logoutButton.id =
            "logoutButton";
    }


    /* =====================================================
       BIENVENIDA DEL DASHBOARD
    ===================================================== */

    const welcome =
        document.getElementById(
            "currentUserWelcome"
        );


    if (welcome) {

        welcome.textContent =
            "Bienvenido, "
            +
            userName;
    }

});