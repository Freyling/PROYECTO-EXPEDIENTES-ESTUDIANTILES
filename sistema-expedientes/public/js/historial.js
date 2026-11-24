document.addEventListener(
    "DOMContentLoaded",
    function () {


        if (
            !document.getElementById(
                "historyTableBody"
            )
        ) {

            return;

        }



        /* =====================================================
           ELEMENTOS
        ===================================================== */

        const tableBody =
            document.getElementById(
                "historyTableBody"
            );


        const tableContainer =
            document.getElementById(
                "historyTableContainer"
            );


        const emptyState =
            document.getElementById(
                "historyEmptyState"
            );


        const resultCount =
            document.getElementById(
                "historyResultCount"
            );



        /* =====================================================
           OBTENER HISTORIAL
        ===================================================== */

        function getHistory() {


            if (
                window.Auditoria
            ) {

                return Auditoria.obtener();

            }


            return [];

        }



        /* =====================================================
           FORMATEAR FECHA
        ===================================================== */

        function formatDate(
            dateString
        ) {


            if (!dateString) {

                return "-";

            }


            const date =
                new Date(
                    dateString
                );


            return date.toLocaleString(
                "es-NI",
                {

                    day:
                        "2-digit",

                    month:
                        "2-digit",

                    year:
                        "numeric",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit"

                }
            );

        }



        /* =====================================================
           CONTADORES
        ===================================================== */

        function updateCounters(
            history
        ) {


            const total =
                document.getElementById(
                    "historyTotalCount"
                );


            const register =
                document.getElementById(
                    "historyRegisterCount"
                );


            const edit =
                document.getElementById(
                    "historyEditCount"
                );


            const documentCount =
                document.getElementById(
                    "historyDocumentCount"
                );



            if (total) {

                total.textContent =
                    history.length;

            }



            if (register) {

                register.textContent =
                    history.filter(
                        function (item) {

                            return (
                                item.accion
                                ===
                                "Registro de estudiante"
                            );

                        }
                    ).length;

            }



            if (edit) {

                edit.textContent =
                    history.filter(
                        function (item) {

                            return (
                                item.accion
                                ===
                                "Modificación de estudiante"
                            );

                        }
                    ).length;

            }



            if (documentCount) {

                documentCount.textContent =
                    history.filter(
                        function (item) {

                            return (
                                item.accion
                                ===
                                "Documento agregado"
                            );

                        }
                    ).length;

            }


        }



        /* =====================================================
           RENDERIZAR
        ===================================================== */

        function renderHistory(
            history
        ) {


            tableBody.innerHTML =
                "";


            if (resultCount) {

                resultCount.textContent =
                    history.length;

            }



            if (
                history.length === 0
            ) {


                tableContainer.classList.add(
                    "d-none"
                );


                emptyState.classList.remove(
                    "d-none"
                );


                return;

            }



            emptyState.classList.add(
                "d-none"
            );


            tableContainer.classList.remove(
                "d-none"
            );



            const orderedHistory =
                [...history]
                    .sort(
                        function (a, b) {

                            return (

                                new Date(
                                    b.fecha
                                )

                                -

                                new Date(
                                    a.fecha
                                )

                            );

                        }
                    );



            orderedHistory.forEach(
                function (item) {


                    let badgeClass =
                        "bg-primary";


                    if (
                        item.accion
                        ===
                        "Registro de estudiante"
                    ) {

                        badgeClass =
                            "bg-success";

                    }


                    if (
                        item.accion
                        ===
                        "Modificación de estudiante"
                    ) {

                        badgeClass =
                            "bg-warning text-dark";

                    }


                    if (
                        item.accion
                        ===
                        "Registro académico"
                    ) {

                        badgeClass =
                            "bg-primary";

                    }


                    if (
                        item.accion
                        ===
                        "Documento agregado"
                    ) {

                        badgeClass =
                            "bg-info text-dark";

                    }



                    const row =
                        document.createElement(
                            "tr"
                        );



                    row.innerHTML = `


                        <td>

                            ${formatDate(
                                item.fecha
                            )}

                        </td>


                        <td>

                            <strong>

                                ${item.usuario || "Administrador"}

                            </strong>

                        </td>


                        <td>

                            <span
                                class="badge ${badgeClass}"
                            >

                                ${item.accion || "-"}

                            </span>

                        </td>


                        <td>

                            ${item.estudianteNombre || "-"}

                        </td>


                        <td>

                            ${item.descripcion || "-"}

                        </td>


                    `;



                    tableBody.appendChild(
                        row
                    );


                }
            );


        }



        /* =====================================================
           CARGAR
        ===================================================== */

        const history =
            getHistory();


        updateCounters(
            history
        );


        renderHistory(
            history
        );



        /* =====================================================
           FILTROS
        ===================================================== */

        const filterForm =
            document.getElementById(
                "historyFilterForm"
            );


        if (filterForm) {


            filterForm.addEventListener(
                "submit",
                function (event) {


                    event.preventDefault();



                    const search =
                        document
                            .getElementById(
                                "historySearch"
                            )
                            .value
                            .trim()
                            .toLowerCase();



                    const action =
                        document
                            .getElementById(
                                "historyAction"
                            )
                            .value;



                    const selectedDate =
                        document
                            .getElementById(
                                "historyDate"
                            )
                            .value;



                    const filtered =
                        history.filter(
                            function (item) {


                                const student =
                                    (
                                        item.estudianteNombre
                                        ||
                                        ""
                                    )
                                    .toLowerCase();



                                const description =
                                    (
                                        item.descripcion
                                        ||
                                        ""
                                    )
                                    .toLowerCase();



                                const matchesSearch =

                                    search
                                    ===
                                    ""

                                    ||

                                    student.includes(
                                        search
                                    )

                                    ||

                                    description.includes(
                                        search
                                    );



                                const matchesAction =

                                    action
                                    ===
                                    ""

                                    ||

                                    item.accion
                                    ===
                                    action;



                                let matchesDate =
                                    true;



                                if (
                                    selectedDate
                                    !==
                                    ""
                                ) {


                                    const itemDate =
                                        new Date(
                                            item.fecha
                                        );


                                    const year =
                                        itemDate.getFullYear();


                                    const month =
                                        String(
                                            itemDate.getMonth()
                                            +
                                            1
                                        )
                                        .padStart(
                                            2,
                                            "0"
                                        );


                                    const day =
                                        String(
                                            itemDate.getDate()
                                        )
                                        .padStart(
                                            2,
                                            "0"
                                        );


                                    const formatted =
                                        `${year}-${month}-${day}`;


                                    matchesDate =
                                        formatted
                                        ===
                                        selectedDate;


                                }



                                return (

                                    matchesSearch

                                    &&

                                    matchesAction

                                    &&

                                    matchesDate

                                );


                            }
                        );



                    renderHistory(
                        filtered
                    );


                }
            );


        }



        /* =====================================================
           LIMPIAR
        ===================================================== */

        const clearButton =
            document.getElementById(
                "clearHistoryFilters"
            );


        if (clearButton) {


            clearButton.addEventListener(
                "click",
                function () {


                    filterForm.reset();


                    renderHistory(
                        history
                    );


                }
            );


        }


    }
);