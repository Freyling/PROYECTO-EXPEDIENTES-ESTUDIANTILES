document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =============================================
           DATOS
        ============================================= */

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
                    "Error al leer " + key,
                    error
                );

                return [];
            }
        }


        const documents =
            getData("studentDocuments");


        const students =
            getData("students");


        /* =============================================
           ELEMENTOS
        ============================================= */

        const tableBody =
            document.getElementById(
                "documentListBody"
            );


        const searchInput =
            document.getElementById(
                "documentSearch"
            );


        const listCount =
            document.getElementById(
                "documentListCount"
            );


        const emptyState =
            document.getElementById(
                "documentListEmpty"
            );


        const totalDocuments =
            document.getElementById(
                "totalDocuments"
            );


        const activeDocuments =
            document.getElementById(
                "activeDocuments"
            );


        const studentsWithDocuments =
            document.getElementById(
                "studentsWithDocuments"
            );


        /* =============================================
           NOMBRE DEL ESTUDIANTE
        ============================================= */

        function getStudentName(student) {

            if (!student) {
                return "Estudiante no encontrado";
            }


            return [

                student.primerNombre,
                student.segundoNombre,
                student.primerApellido,
                student.segundoApellido

            ]
                .filter(Boolean)
                .join(" ")
                .trim()
                ||
                "Sin nombre";
        }


        /* =============================================
           BUSCAR ESTUDIANTE
        ============================================= */

        function getStudent(documentItem) {

            return students.find(
                function (student) {

                    return (
                        Number(student.id)
                        ===
                        Number(documentItem.studentId)
                    );
                }
            );
        }


        /* =============================================
           FECHA
        ============================================= */

        function formatDate(value) {

            if (!value) {
                return "-";
            }


            const parts =
                String(value)
                    .split("-");


            if (parts.length === 3) {

                return (
                    parts[2]
                    +
                    "/"
                    +
                    parts[1]
                    +
                    "/"
                    +
                    parts[0]
                );
            }


            return value;
        }


        /* =============================================
           ESCAPAR HTML
        ============================================= */

        function escapeHtml(value) {

            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }


        /* =============================================
           ESTADÍSTICAS
        ============================================= */

        function updateStatistics() {

            if (totalDocuments) {

                totalDocuments.textContent =
                    documents.length;
            }


            if (activeDocuments) {

                activeDocuments.textContent =
                    documents.filter(
                        function (item) {

                            return (
                                item.estado
                                ===
                                "Vigente"
                            );
                        }
                    ).length;
            }


            if (studentsWithDocuments) {

                const studentIds =
                    new Set();


                documents.forEach(
                    function (item) {

                        if (item.studentId) {

                            studentIds.add(
                                String(item.studentId)
                            );
                        }
                    }
                );


                studentsWithDocuments.textContent =
                    studentIds.size;
            }
        }


        /* =============================================
           RENDERIZAR
        ============================================= */

        function renderDocuments(list) {

            if (!tableBody) {
                return;
            }


            tableBody.innerHTML =
                "";


            if (listCount) {

                listCount.textContent =
                    list.length;
            }


            if (list.length === 0) {

                if (emptyState) {

                    emptyState.classList.remove(
                        "d-none"
                    );
                }

                return;
            }


            if (emptyState) {

                emptyState.classList.add(
                    "d-none"
                );
            }


            list.forEach(
                function (documentItem) {


                    const student =
                        getStudent(
                            documentItem
                        );


                    const studentName =
                        getStudentName(
                            student
                        );


                    const studentCode =
                        student
                            ?
                            student.codigo || "-"
                            :
                            "-";


                    let badgeClass =
                        "bg-secondary";


                    if (
                        documentItem.estado
                        ===
                        "Vigente"
                    ) {

                        badgeClass =
                            "bg-success";
                    }


                    if (
                        documentItem.estado
                        ===
                        "Pendiente"
                    ) {

                        badgeClass =
                            "bg-warning text-dark";
                    }


                    if (
                        documentItem.estado
                        ===
                        "Vencido"
                    ) {

                        badgeClass =
                            "bg-danger";
                    }


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>

                            <strong>
                                ${escapeHtml(
                                    documentItem.nombre
                                    ||
                                    "-"
                                )}
                            </strong>

                        </td>


                        <td>

                            <strong>
                                ${escapeHtml(studentName)}
                            </strong>

                            <div class="small text-muted">

                                ${escapeHtml(studentCode)}

                            </div>

                        </td>


                        <td>

                            ${escapeHtml(
                                documentItem.tipo
                                ||
                                "-"
                            )}

                        </td>


                        <td>

                            <i class="bi bi-paperclip me-1"></i>

                            ${escapeHtml(
                                documentItem.archivo
                                ||
                                "Sin archivo"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                formatDate(
                                    documentItem.fecha
                                )
                            )}

                        </td>


                        <td>

                            <span
                                class="badge ${badgeClass}"
                            >

                                ${escapeHtml(
                                    documentItem.estado
                                    ||
                                    "-"
                                )}

                            </span>

                        </td>


                        <td class="text-end">

                            ${
                                student
                                    ?
                                    `
                                        <a
                                            href="expediente-estudiante.html?id=${encodeURIComponent(student.id)}"
                                            class="btn btn-sm btn-outline-primary"
                                            title="Abrir expediente"
                                        >
                                            <i class="bi bi-folder2-open me-1"></i>
                                            Expediente
                                        </a>
                                    `
                                    :
                                    `<span class="text-muted">-</span>`
                            }

                        </td>

                    `;


                    tableBody.appendChild(
                        row
                    );
                }
            );
        }


        /* =============================================
           BUSCADOR
        ============================================= */

        function filterDocuments() {

            const search =
                String(
                    searchInput
                        ?
                        searchInput.value
                        :
                        ""
                )
                    .trim()
                    .toLowerCase();


            if (!search) {

                renderDocuments(
                    documents
                );

                return;
            }


            const filtered =
                documents.filter(
                    function (documentItem) {


                        const student =
                            getStudent(
                                documentItem
                            );


                        const text = [

                            documentItem.nombre,
                            documentItem.tipo,
                            documentItem.archivo,
                            documentItem.estado,

                            getStudentName(
                                student
                            ),

                            student
                                ?
                                student.codigo
                                :
                                ""

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                        return text.includes(
                            search
                        );
                    }
                );


            renderDocuments(
                filtered
            );
        }


        /* =============================================
           EVENTOS
        ============================================= */

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterDocuments
            );
        }


        /* =============================================
           INICIAR
        ============================================= */

        updateStatistics();

        renderDocuments(
            documents
        );

    }
);