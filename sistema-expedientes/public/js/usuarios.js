document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const userTableBody =
        document.getElementById(
            "userTableBody"
        );


    if (!userTableBody) {
        return;
    }


    const userTableContainer =
        document.getElementById(
            "userTableContainer"
        );


    const userEmptyState =
        document.getElementById(
            "userEmptyState"
        );


    const userSearch =
        document.getElementById(
            "userSearch"
        );


    const userRoleFilter =
        document.getElementById(
            "userRoleFilter"
        );


    const userStatusFilter =
        document.getElementById(
            "userStatusFilter"
        );


    /* =====================================================
       ALMACENAMIENTO
    ===================================================== */

    function getUsers() {

        const data =
            localStorage.getItem(
                "systemUsers"
            );


        if (!data) {
            return [];
        }


        try {

            const users =
                JSON.parse(data);


            return Array.isArray(users)
                ? users
                : [];

        } catch (error) {

            console.error(
                "Error al obtener usuarios:",
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
       USUARIO ADMINISTRADOR INICIAL
    ===================================================== */

    function createInitialAdministrator() {

        const users =
            getUsers();


        if (users.length > 0) {
            return;
        }


        const administrator = {

            id:
                Date.now(),

            nombre:
                "Administrador",

            correo:
                "admin@sistema.edu.ni",

            /*
                Esta contraseña es solamente provisional
                para el prototipo local.

                Cuando implementemos Firebase Authentication
                NO almacenaremos contraseñas de esta forma.
            */

            password:
                "Admin123",

            rol:
                "Administrador",

            estado:
                "Activo",

            permisos: [
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
            ],

            fechaRegistro:
                new Date().toISOString(),

            ultimoAcceso:
                null
        };


        users.push(
            administrator
        );


        saveUsers(
            users
        );
    }


    /* =====================================================
       ESCAPAR HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       NORMALIZAR TEXTO
    ===================================================== */

    function normalizeText(text) {

        return String(text || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );
    }


    /* =====================================================
       FORMATEAR FECHA
    ===================================================== */

    function formatDateTime(value) {

        if (!value) {
            return "Sin acceso";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Sin acceso";
        }


        return date.toLocaleString(
            "es-NI",
            {
                dateStyle:
                    "short",

                timeStyle:
                    "short"
            }
        );
    }


    /* =====================================================
       INICIALES
    ===================================================== */

    function getInitials(name) {

        const words =
            String(name || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (words.length === 0) {
            return "U";
        }


        if (words.length === 1) {

            return words[0]
                .charAt(0)
                .toUpperCase();
        }


        return (
            words[0].charAt(0)
            +
            words[
                words.length - 1
            ].charAt(0)
        )
        .toUpperCase();
    }


    /* =====================================================
       ESTADÍSTICAS
    ===================================================== */

    function updateStatistics() {

        const users =
            getUsers();


        const administrators =
            users.filter(
                function (user) {

                    return (
                        user.rol
                        ===
                        "Administrador"
                    );
                }
            );


        const staff =
            users.filter(
                function (user) {

                    return (
                        user.rol
                        ===
                        "Personal educativo"
                    );
                }
            );


        const students =
            users.filter(
                function (user) {

                    return (
                        user.rol
                        ===
                        "Estudiante"
                    );
                }
            );


        const totalElement =
            document.getElementById(
                "userTotalCount"
            );


        const adminElement =
            document.getElementById(
                "userAdminCount"
            );


        const staffElement =
            document.getElementById(
                "userStaffCount"
            );


        const studentElement =
            document.getElementById(
                "userStudentCount"
            );


        if (totalElement) {

            totalElement.textContent =
                users.length;
        }


        if (adminElement) {

            adminElement.textContent =
                administrators.length;
        }


        if (staffElement) {

            staffElement.textContent =
                staff.length;
        }


        if (studentElement) {

            studentElement.textContent =
                students.length;
        }
    }


    /* =====================================================
       COLOR DEL ROL
    ===================================================== */

    function getRoleBadge(role) {

        if (
            role
            ===
            "Administrador"
        ) {

            return `
                <span class="badge bg-primary">
                    Administrador
                </span>
            `;
        }


        if (
            role
            ===
            "Personal educativo"
        ) {

            return `
                <span class="badge bg-info text-dark">
                    Personal educativo
                </span>
            `;
        }


        if (
            role
            ===
            "Estudiante"
        ) {

            return `
                <span class="badge bg-secondary">
                    Estudiante
                </span>
            `;
        }


        return `
            <span class="badge bg-secondary">
                ${escapeHtml(role || "Sin rol")}
            </span>
        `;
    }


    /* =====================================================
       MOSTRAR USUARIOS
    ===================================================== */

    function renderUsers(users) {

        userTableBody.innerHTML =
            "";


        const showingCount =
            document.getElementById(
                "userShowingCount"
            );


        if (showingCount) {

            showingCount.textContent =
                users.length;
        }


        if (
            users.length
            ===
            0
        ) {

            if (userTableContainer) {

                userTableContainer
                    .classList
                    .add(
                        "d-none"
                    );
            }


            if (userEmptyState) {

                userEmptyState
                    .classList
                    .remove(
                        "d-none"
                    );
            }


            return;
        }


        if (userTableContainer) {

            userTableContainer
                .classList
                .remove(
                    "d-none"
                );
        }


        if (userEmptyState) {

            userEmptyState
                .classList
                .add(
                    "d-none"
                );
        }


        users
            .slice()
            .sort(
                function (a, b) {

                    return (
                        a.nombre
                        ||
                        ""
                    )
                    .localeCompare(
                        b.nombre
                        ||
                        ""
                    );
                }
            )
            .forEach(
                function (user) {


                    const statusClass =
                        user.estado
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

                            <div
                                class="d-flex align-items-center gap-3"
                            >

                                <div
                                    class="user-avatar"
                                    style="
                                        width: 42px;
                                        height: 42px;
                                        min-width: 42px;
                                    "
                                >
                                    ${escapeHtml(getInitials(user.nombre))}
                                </div>


                                <div>

                                    <strong>
                                        ${escapeHtml(user.nombre || "-")}
                                    </strong>

                                    <div
                                        class="small text-muted"
                                    >
                                        ID: ${escapeHtml(user.id)}
                                    </div>

                                </div>

                            </div>

                        </td>


                        <td>

                            <i
                                class="bi bi-envelope me-1 text-muted"
                            ></i>

                            ${escapeHtml(user.correo || "-")}

                        </td>


                        <td>
                            ${getRoleBadge(user.rol)}
                        </td>


                        <td>

                            <span
                                class="badge ${statusClass}"
                            >
                                ${escapeHtml(user.estado || "-")}
                            </span>

                        </td>


                        <td>

                            ${escapeHtml(
                                formatDateTime(
                                    user.ultimoAcceso
                                )
                            )}

                        </td>


                        <td class="text-end">

                            <a
                                href="editar-usuario.html?id=${encodeURIComponent(user.id)}"
                                class="btn btn-outline-primary btn-sm"
                                title="Editar usuario"
                            >
                                <i class="bi bi-pencil"></i>
                            </a>

                        </td>

                    `;


                    userTableBody
                        .appendChild(
                            row
                        );
                }
            );
    }


    /* =====================================================
       FILTROS
    ===================================================== */

    function applyFilters() {

        const users =
            getUsers();


        const searchText =
            normalizeText(
                userSearch
                    ?
                    userSearch.value
                    :
                    ""
            );


        const role =
            userRoleFilter
                ?
                userRoleFilter.value
                :
                "";


        const status =
            userStatusFilter
                ?
                userStatusFilter.value
                :
                "";


        const filtered =
            users.filter(
                function (user) {


                    const name =
                        normalizeText(
                            user.nombre
                        );


                    const email =
                        normalizeText(
                            user.correo
                        );


                    const matchesSearch =
                        searchText === ""
                        ||
                        name.includes(
                            searchText
                        )
                        ||
                        email.includes(
                            searchText
                        );


                    const matchesRole =
                        role === ""
                        ||
                        user.rol
                        ===
                        role;


                    const matchesStatus =
                        status === ""
                        ||
                        user.estado
                        ===
                        status;


                    return (
                        matchesSearch
                        &&
                        matchesRole
                        &&
                        matchesStatus
                    );
                }
            );


        renderUsers(
            filtered
        );
    }


    /* =====================================================
       EVENTOS
    ===================================================== */

    if (userSearch) {

        userSearch.addEventListener(
            "input",
            applyFilters
        );
    }


    if (userRoleFilter) {

        userRoleFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    if (userStatusFilter) {

        userStatusFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    /* =====================================================
       INICIAR
    ===================================================== */

    createInitialAdministrator();

    updateStatistics();

    applyFilters();


});