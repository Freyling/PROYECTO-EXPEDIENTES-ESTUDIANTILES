document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ALMACENAMIENTO
    ===================================================== */

    function getSubjects() {

        try {

            const data =
                JSON.parse(
                    localStorage.getItem("subjects")
                    ||
                    "[]"
                );

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Error al obtener asignaturas:",
                error
            );

            return [];
        }
    }


    function saveSubjects(
        subjects
    ) {

        localStorage.setItem(
            "subjects",
            JSON.stringify(subjects)
        );
    }

/* =====================================================
   GENERAR CÓDIGO AUTOMÁTICO DE ASIGNATURA
===================================================== */

function generarCodigoAsignatura() {

    const subjects = getSubjects();

    let ultimoNumero = 0;

    subjects.forEach(function (subject) {

        const coincidencia = String(subject.codigo || "")
            .match(/^ASG-(\d+)$/i);

        if (coincidencia) {
            const numero = Number(coincidencia[1]);

            if (numero > ultimoNumero) {
                ultimoNumero = numero;
            }
        }
    });

    const siguienteNumero = ultimoNumero + 1;

    return "ASG-" + String(siguienteNumero).padStart(4, "0");
}

    /* =====================================================
       AUDITORÍA
    ===================================================== */

    function registrarAuditoria(
        accion,
        descripcion
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
                "Error al leer auditoría:",
                error
            );

            history = [];
        }


        history.push({

            id:
                Date.now(),

            usuarioId:
                "admin-provisional",

            usuarioNombre:
                "Administrador",

            usuario:
                "Administrador",

            rol:
                "Administrador",

            accion:
                accion,

            descripcion:
                descripcion,

            estudianteId:
                null,

            estudianteNombre:
                "",

            fecha:
                new Date().toISOString()

        });


        localStorage.setItem(
            "auditHistory",
            JSON.stringify(history)
        );
    }


    /* =====================================================
       FORMULARIO
    ===================================================== */

    const subjectForm =
        document.getElementById(
            "subjectForm"
        );
/* MOSTRAR CÓDIGO AUTOMÁTICO */

if (subjectForm) {

    const subjectCode =
        document.getElementById("subjectCode");

    if (subjectCode) {
        subjectCode.value = generarCodigoAsignatura();
    }
}


    if (subjectForm) {

        subjectForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const code = generarCodigoAsignatura();

document.getElementById("subjectCode").value = code;


                const name =
                    document
                        .getElementById(
                            "subjectName"
                        )
                        .value
                        .trim();


                const level =
                    document
                        .getElementById(
                            "subjectLevel"
                        )
                        .value
                        .trim();


                const status =
                    document
                        .getElementById(
                            "subjectStatus"
                        )
                        .value;


                const description =
                    document
                        .getElementById(
                            "subjectDescription"
                        )
                        .value
                        .trim();


                if (
                    code === ""
                    ||
                    name === ""
                    ||
                    level === ""
                    ||
                    status === ""
                ) {

                    alert(
                        "Completa todos los campos obligatorios."
                    );

                    return;
                }


                const subjects =
                    getSubjects();


                /* EVITAR CÓDIGO DUPLICADO */

                const duplicatedCode =
                    subjects.some(
                        function (subject) {

                            return (
                                (
                                    subject.codigo
                                    ||
                                    ""
                                )
                                .toLowerCase()
                                ===
                                code.toLowerCase()
                            );
                        }
                    );


                if (duplicatedCode) {

                    alert(
                        "Ya existe una asignatura con el código "
                        +
                        code
                        +
                        "."
                    );

                    return;
                }


                /* EVITAR MISMA ASIGNATURA EN MISMO NIVEL */

                const duplicatedSubject =
                    subjects.some(
                        function (subject) {

                            return (

                                (
                                    subject.nombre
                                    ||
                                    ""
                                )
                                .toLowerCase()
                                ===
                                name.toLowerCase()

                                &&

                                (
                                    subject.nivel
                                    ||
                                    ""
                                )
                                .toLowerCase()
                                ===
                                level.toLowerCase()
                            );
                        }
                    );


                if (duplicatedSubject) {

                    alert(
                        "Esta asignatura ya está registrada para el nivel seleccionado."
                    );

                    return;
                }


                const newSubject = {

                    id:
                        Date.now(),

                    codigo:
                        code,

                    nombre:
                        name,

                    nivel:
                        level,

                    estado:
                        status,

                    descripcion:
                        description,

                    fechaRegistro:
                        new Date().toISOString()

                };


                subjects.push(
                    newSubject
                );


                saveSubjects(
                    subjects
                );


                /* AUDITORÍA */

                registrarAuditoria(

                    "Asignatura registrada",

                    `Se registró la asignatura ${name} (${code}) para ${level}, estado ${status}.`
                );


                const message =
                    document.getElementById(
                        "subjectMessage"
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
                            "asignaturas.html";

                    },
                    1000
                );
            }
        );
    }


    /* =====================================================
       ELEMENTOS DEL LISTADO
    ===================================================== */

    const subjectTableBody =
        document.getElementById(
            "subjectTableBody"
        );


    const subjectEmptyState =
        document.getElementById(
            "subjectEmptyState"
        );


    const subjectCount =
        document.getElementById(
            "subjectCount"
        );


    const totalSubjects =
        document.getElementById(
            "totalSubjects"
        );


    const activeSubjects =
        document.getElementById(
            "activeSubjects"
        );


    const subjectLevels =
        document.getElementById(
            "subjectLevels"
        );


    /* =====================================================
       RENDERIZAR
    ===================================================== */

    function renderSubjects(
        subjectList
    ) {

        if (!subjectTableBody) {
            return;
        }


        subjectTableBody.innerHTML =
            "";


        if (subjectCount) {

            subjectCount.textContent =
                subjectList.length;
        }


        if (subjectList.length === 0) {

            if (subjectEmptyState) {

                subjectEmptyState
                    .classList
                    .remove(
                        "d-none"
                    );
            }

            return;
        }


        if (subjectEmptyState) {

            subjectEmptyState
                .classList
                .add(
                    "d-none"
                );
        }


        subjectList
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
                function (subject) {


                    let statusClass =
                        "bg-secondary";


                    if (
                        subject.estado
                        ===
                        "Activa"
                    ) {

                        statusClass =
                            "bg-success";
                    }


                    if (
                        subject.estado
                        ===
                        "Inactiva"
                    ) {

                        statusClass =
                            "bg-secondary";
                    }


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>

                            <strong>
                                ${subject.codigo || "-"}
                            </strong>

                        </td>


                        <td>

                            <div class="d-flex align-items-center gap-2">

                                <i class="bi bi-book text-primary"></i>

                                <strong>
                                    ${subject.nombre || "-"}
                                </strong>

                            </div>

                        </td>


                        <td>

                            ${subject.nivel || "-"}

                        </td>


                        <td>

                            ${subject.descripcion || "Sin descripción"}

                        </td>


                        <td>

                            <span
                                class="badge ${statusClass}"
                            >

                                ${subject.estado || "-"}

                            </span>

                        </td>
                    `;


                    subjectTableBody
                        .appendChild(
                            row
                        );
                }
            );
    }


    /* =====================================================
       INICIALIZAR
    ===================================================== */

    if (subjectTableBody) {

        const subjects =
            getSubjects();


        if (totalSubjects) {

            totalSubjects.textContent =
                subjects.length;
        }


        if (activeSubjects) {

            activeSubjects.textContent =
                subjects.filter(
                    function (subject) {

                        return (
                            subject.estado
                            ===
                            "Activa"
                        );
                    }
                ).length;
        }


        if (subjectLevels) {

            const levels =
                new Set();


            subjects.forEach(
                function (subject) {

                    if (subject.nivel) {

                        levels.add(
                            subject.nivel
                                .trim()
                                .toLowerCase()
                        );
                    }
                }
            );


            subjectLevels.textContent =
                levels.size;
        }


        renderSubjects(
            subjects
        );
    }


    /* =====================================================
       BÚSQUEDA
    ===================================================== */

    const subjectSearch =
        document.getElementById(
            "subjectSearch"
        );


    if (subjectSearch) {

        subjectSearch.addEventListener(
            "input",
            function () {


                const searchText =
                    subjectSearch
                        .value
                        .trim()
                        .toLowerCase();


                const subjects =
                    getSubjects();


                const filtered =
                    subjects.filter(
                        function (subject) {


                            const code =
                                (
                                    subject.codigo
                                    ||
                                    ""
                                )
                                .toLowerCase();


                            const name =
                                (
                                    subject.nombre
                                    ||
                                    ""
                                )
                                .toLowerCase();


                            const level =
                                (
                                    subject.nivel
                                    ||
                                    ""
                                )
                                .toLowerCase();


                            return (

                                code.includes(
                                    searchText
                                )

                                ||

                                name.includes(
                                    searchText
                                )

                                ||

                                level.includes(
                                    searchText
                                )
                            );
                        }
                    );


                renderSubjects(
                    filtered
                );
            }
        );
    }

});