
/* ==========================================
   GT10 - ANALÍTICA ACADÉMICA PREDICTIVA
   Control inicial de gráficos
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    
/* ==========================================
   GT10 - LECTURA DE CALIFICACIONES REALES
========================================== */

function obtenerCalificaciones() {
    try {
        const datos = JSON.parse(
            localStorage.getItem("grades") || "[]"
        );

        return Array.isArray(datos) ? datos : [];

    } catch (error) {
        console.error(
            "GT10: Error al leer las calificaciones:",
            error
        );

        return [];
    }
}

/* ==========================================
   FILTRO DE ANALÍTICA SEGÚN EL USUARIO
========================================== */

function leerRegistros(clave) {
    try {
        const datos = JSON.parse(
            localStorage.getItem(clave) || "[]"
        );

        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        console.error(`Error al leer ${clave}:`, error);
        return [];
    }
}

function obtenerUsuarioActual() {
    if (window.Auth?.currentUser) {
        return window.Auth.currentUser;
    }

    try {
        const guardado =
            sessionStorage.getItem("currentUser") ||
            localStorage.getItem("currentUser");

        return guardado ? JSON.parse(guardado) : null;
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        return null;
    }
}

function normalizar(valor) {
    return String(valor ?? "").trim().toUpperCase();
}

function obtenerCalificacionesAutorizadas() {
    const usuario = obtenerUsuarioActual();

    // Sin sesión, no mostrar información académica.
    if (!usuario) {
        return [];
    }

    const calificaciones = obtenerCalificaciones();

    // El administrador consulta toda la institución.
    if (usuario.rol === "Administrador") {
        return calificaciones;
    }

    // Solo personal educativo con permiso.
    if (
        usuario.rol !== "Personal educativo" ||
        !window.Auth?.hasPermission?.("analitica.ver")
    ) {
        return [];
    }

    const asignaciones = leerRegistros("teacherAssignments")
        .filter(asignacion =>
            normalizar(asignacion.docenteId) ===
                normalizar(usuario.id) &&
            normalizar(asignacion.estado) === "ACTIVA"
        );

    if (asignaciones.length === 0) {
        return [];
    }

    const matriculas = leerRegistros("enrollments");

    const matriculasPorId = new Map(
        matriculas.map(matricula => [
            String(matricula.id),
            matricula
        ])
    );

    return calificaciones.filter(calificacion => {
        const matricula = matriculasPorId.get(
            String(calificacion.enrollmentId)
        );

        if (!matricula) {
            return false;
        }

        // No incluir matrículas canceladas.
        if (normalizar(matricula.estado) === "CANCELADA") {
            return false;
        }

        // Verificar que la nota pertenece a esa matrícula.
        if (
            normalizar(calificacion.studentId) !==
                normalizar(matricula.studentId) ||
            normalizar(calificacion.anioLectivo) !==
                normalizar(matricula.anioLectivo) ||
            normalizar(calificacion.nivel) !==
                normalizar(matricula.nivel)
        ) {
            return false;
        }

        // Comprobar todas las dimensiones de la asignación.
        return asignaciones.some(asignacion =>
            normalizar(asignacion.asignaturaId) ===
                normalizar(calificacion.subjectId) &&
            normalizar(asignacion.grado) ===
                normalizar(matricula.nivel) &&
            normalizar(asignacion.seccion) ===
                normalizar(matricula.seccion) &&
            normalizar(asignacion.anio) ===
                normalizar(matricula.anioLectivo)
        );
    });
}

const calificacionesReales = obtenerCalificacionesAutorizadas();


/* ==========================================
   GT10 - ESTUDIANTES Y CALIFICACIONES
========================================== */

// Leer estudiantes sin modificar los registros
function obtenerEstudiantes() {
    try {
        const datos = JSON.parse(
            localStorage.getItem("students") || "[]"
        );

        return Array.isArray(datos) ? datos : [];

    } catch (error) {
        console.error(
            "GT10: Error al leer estudiantes:",
            error
        );

        return [];
    }
}

// Construir el nombre completo
function obtenerNombreEstudiante(estudiante) {
    if (!estudiante) {
        return "Estudiante no encontrado";
    }

    return [
        estudiante.primerNombre,
        estudiante.segundoNombre,
        estudiante.primerApellido,
        estudiante.segundoApellido
    ]
    .filter(Boolean)
    .join(" ");
}

// Obtener estudiantes registrados
const estudiantesRegistrados = obtenerEstudiantes();

// Crear índice para buscar estudiantes por ID
const estudiantesPorId = new Map();

estudiantesRegistrados.forEach(estudiante => {

    if (
        estudiante.id === undefined ||
        estudiante.id === null
    ) {
        return;
    }

    estudiantesPorId.set(
        String(estudiante.id),
        estudiante
    );
});

// Comprobar la relación entre estudiantes y notas
const estudiantesConCalificaciones = [
    ...new Set(
        calificacionesReales
            .map(registro => registro.studentId)
            .filter(id =>
                id !== undefined &&
                id !== null &&
                String(id).trim() !== ""
            )
            .map(String)
    )
].map(id => {

    const estudiante = estudiantesPorId.get(id);

    return {
        id,
        nombre: obtenerNombreEstudiante(estudiante),
        calificaciones: calificacionesReales.filter(
            registro => String(registro.studentId) === id
        ).length
    };
});

console.table(estudiantesConCalificaciones);

/* ==========================================
   GT10 - PREPARACIÓN DE ALERTAS ACADÉMICAS
========================================== */

// Obtener calificaciones válidas de cada estudiante
const alertasAcademicas = [];

estudiantesConCalificaciones.forEach(registro => {

    const notas = calificacionesReales
        .filter(calificacion =>
            String(calificacion.studentId) === registro.id
        )
        .map(calificacion => calificacion.nota)
        .filter(nota =>
            nota !== null &&
            nota !== undefined &&
            String(nota).trim() !== "" &&
            Number.isFinite(Number(nota)) &&
            Number(nota) >= 0 &&
            Number(nota) <= 100
        )
        .map(Number);

    if (notas.length === 0) {
        return;
    }

    const suma = notas.reduce(
        (total, nota) => total + nota,
        0
    );

    const promedio = suma / notas.length;

  /* ==========================================
   GT10 - CRITERIOS DE ALERTA ACADÉMICA
========================================== */

// Identificar calificaciones inferiores a 60
const notasReprobadas = notas.filter(nota => nota < 60);

// Determinar el motivo de seguimiento
const motivos = [];

if (promedio < 60) {
    motivos.push(
        "Promedio académico inferior a 60 puntos"
    );
}

if (notasReprobadas.length > 0) {
    motivos.push(
        `${notasReprobadas.length} calificación(es) inferior(es) a 60 puntos`
    );
}

// Generar una sola alerta por estudiante
if (motivos.length > 0) {

    alertasAcademicas.push({
        studentId: registro.id,
        nombre: registro.nombre,
        promedio: Number(promedio.toFixed(1)),
        nivel: "Requiere seguimiento",
        motivo: motivos.join(". ")
    });

}

});

// Verificar alertas calculadas
console.table(alertasAcademicas);

/* ==========================================
   GT10 - MOSTRAR ALERTAS EN LA TABLA
========================================== */

const tablaAlertas = document.getElementById(
    "analyticsAlertsTableBody"
);

const estadoAlertas = document.querySelector(
    "#analyticsAlerts .analytics-alerts-status"
);

if (tablaAlertas) {

    // Limpiar únicamente el contenido visual
    tablaAlertas.replaceChildren();

    if (alertasAcademicas.length === 0) {

        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 5;

        celda.innerHTML = `
            <div class="analytics-alerts-empty">
                <i class="bi bi-shield-check"></i>

                <h4>Sin alertas académicas detectadas</h4>

               <p>
    Los estudiantes analizados no presentan
    promedios académicos ni calificaciones
    individuales inferiores a 60 puntos.
</p>
            </div>
        `;

        fila.appendChild(celda);
        tablaAlertas.appendChild(fila);

        if (estadoAlertas) {
            estadoAlertas.innerHTML = `
                <i class="bi bi-check-circle"></i>
                Sin alertas detectadas
            `;
        }

    } else {

        alertasAcademicas.forEach(alerta => {

            const fila = document.createElement("tr");

            const estudiante = document.createElement("td");
            estudiante.textContent = alerta.nombre;

            const promedio = document.createElement("td");
            promedio.textContent = alerta.promedio.toFixed(1);

            const riesgo = document.createElement("td");
            const etiqueta = document.createElement("span");

            etiqueta.className =
                "analytics-risk-badge analytics-risk-high";

            etiqueta.textContent = alerta.nivel;
            riesgo.appendChild(etiqueta);

            const motivo = document.createElement("td");
            motivo.textContent = alerta.motivo;

           /* ==========================================
   GT10 - ACCESO AL EXPEDIENTE DEL ESTUDIANTE
========================================== */

const accion = document.createElement("td");

const botonExpediente = document.createElement("a");

botonExpediente.className =
    "btn btn-sm btn-outline-primary";

botonExpediente.textContent = "Ver expediente";

botonExpediente.href =
    `expediente.html?id=${encodeURIComponent(alerta.studentId)}`;

botonExpediente.setAttribute(
    "aria-label",
    `Ver expediente de ${alerta.nombre}`
);

accion.appendChild(botonExpediente);

            fila.append(
                estudiante,
                promedio,
                riesgo,
                motivo,
                accion
            );

            tablaAlertas.appendChild(fila);
        });

        if (estadoAlertas) {
            estadoAlertas.innerHTML = `
                <i class="bi bi-exclamation-triangle"></i>
                ${alertasAcademicas.length} alerta(s)
            `;
        }
    }
}



/* Contar estudiantes con calificaciones */

const estudiantesUnicos = new Set(
    calificacionesReales
        .filter(nota =>
            nota.studentId !== undefined &&
            nota.studentId !== null &&
            String(nota.studentId).trim() !== ""
        )
        .map(nota => String(nota.studentId))
);

const totalEstudiantesAnalizados = estudiantesUnicos.size;

/* Actualizar el indicador */

const indicadorEstudiantes = document.getElementById(
    "analyticsTotalStudents"
);

if (indicadorEstudiantes) {
    indicadorEstudiantes.textContent =
        totalEstudiantesAnalizados;
}


/* ==========================================
   GT10 - PROMEDIO ACADÉMICO GENERAL
========================================== */

// Obtener únicamente notas numéricas válidas
const notasValidas = calificacionesReales
    .filter(registro => {
        const nota = registro.nota;

        if (nota === null || nota === undefined ||
            String(nota).trim() === "") {
            return false;
        }

        const valor = Number(nota);

        return Number.isFinite(valor) &&
               valor >= 0 &&
               valor <= 100;
    })
    .map(registro => Number(registro.nota));

// Calcular promedio
let promedioGeneral = null;

if (notasValidas.length > 0) {

    const sumaNotas = notasValidas.reduce(
        (total, nota) => total + nota,
        0
    );

    promedioGeneral = sumaNotas / notasValidas.length;
}

// Mostrar resultado
const indicadorPromedio = document.getElementById(
    "analyticsAverageGrade"
);

if (indicadorPromedio) {
    indicadorPromedio.textContent =
        promedioGeneral === null
            ? "—"
            : promedioGeneral.toFixed(1);
}


/* ==========================================
   GT10 - RENDIMIENTO FAVORABLE
========================================== */

// Agrupar notas válidas por estudiante
const notasPorEstudiante = new Map();

calificacionesReales.forEach(registro => {

    const estudianteId = registro.studentId;
    const notaOriginal = registro.nota;

    if (
        estudianteId === undefined ||
        estudianteId === null ||
        String(estudianteId).trim() === "" ||
        notaOriginal === null ||
        notaOriginal === undefined ||
        String(notaOriginal).trim() === ""
    ) {
        return;
    }

    const nota = Number(notaOriginal);

    if (
        !Number.isFinite(nota) ||
        nota < 0 ||
        nota > 100
    ) {
        return;
    }

    const id = String(estudianteId);

    if (!notasPorEstudiante.has(id)) {
        notasPorEstudiante.set(id, []);
    }

    notasPorEstudiante.get(id).push(nota);
});

/* ==========================================
   GT10 - ESTUDIANTES CON RENDIMIENTO FAVORABLE
========================================== */

let estudiantesFavorables = 0;

notasPorEstudiante.forEach(notas => {

    if (notas.length === 0) {
        return;
    }

    const suma = notas.reduce(
        (total, nota) => total + nota,
        0
    );

    const promedio = suma / notas.length;

    const tieneNotaBaja = notas.some(
        nota => nota < 60
    );

    // Favorable únicamente si cumple ambos criterios
    if (promedio >= 60 && !tieneNotaBaja) {
        estudiantesFavorables++;
    }

});
// Actualizar la tercera tarjeta
const indicadorFavorables = document.getElementById(
    "analyticsGoodPerformance"
);

if (indicadorFavorables) {
    indicadorFavorables.textContent =
        estudiantesFavorables;
}

/* ==========================================
   GT10 - ESTUDIANTES QUE REQUIEREN SEGUIMIENTO
========================================== */

let estudiantesSeguimiento = 0;

notasPorEstudiante.forEach(notas => {

    if (notas.length === 0) {
        return;
    }

    const suma = notas.reduce(
        (total, nota) => total + nota,
        0
    );

    const promedio = suma / notas.length;

    const tieneNotaBaja = notas.some(
        nota => nota < 60
    );

    // Seguimiento por promedio bajo o nota individual baja
    if (promedio < 60 || tieneNotaBaja) {
        estudiantesSeguimiento++;
    }

});

// Actualizar la cuarta tarjeta
const indicadorSeguimiento = document.getElementById(
    "analyticsAtRisk"
);

if (indicadorSeguimiento) {
    indicadorSeguimiento.textContent =
        estudiantesSeguimiento;
}


/* ==========================================
   GT10 - PREPARAR TENDENCIAS ACADÉMICAS
========================================== */

// Agrupar calificaciones por año lectivo y semestre
const periodosAcademicos = new Map();

calificacionesReales.forEach(registro => {

    const anio = Number(registro.anioLectivo);
    const semestre = String(registro.semestre || "").trim();
    const notaOriginal = registro.nota;

    if (
        !Number.isInteger(anio) ||
        anio < 1900 ||
        anio > 2200 ||
        !semestre ||
        notaOriginal === null ||
        notaOriginal === undefined ||
        String(notaOriginal).trim() === ""
    ) {
        return;
    }

    const nota = Number(notaOriginal);

    if (
        !Number.isFinite(nota) ||
        nota < 0 ||
        nota > 100
    ) {
        return;
    }

    const clave = `${anio}|${semestre}`;

    if (!periodosAcademicos.has(clave)) {
        periodosAcademicos.set(clave, {
            anio,
            semestre,
            notas: []
        });
    }

    periodosAcademicos.get(clave).notas.push(nota);
});

// Calcular el promedio de cada período
const tendenciasAcademicas = Array.from(
    periodosAcademicos.values()
).map(periodo => {

    const suma = periodo.notas.reduce(
        (total, nota) => total + nota,
        0
    );

    return {
        anio: periodo.anio,
        semestre: periodo.semestre,
        promedio: Number(
            (suma / periodo.notas.length).toFixed(1)
        ),
        evaluaciones: periodo.notas.length
    };

});

// Verificar los resultados antes de graficar
console.table(tendenciasAcademicas);


/* ==========================================
   GT10 - DISTRIBUCIÓN DEL RENDIMIENTO
========================================== */

const distribucionRendimiento = {
    favorable: 0,
    seguimiento: 0
};

/* ==========================================
   GT10 - DISTRIBUCIÓN DEL RENDIMIENTO
========================================== */

notasPorEstudiante.forEach(notas => {

    if (notas.length === 0) {
        return;
    }

    const suma = notas.reduce(
        (total, nota) => total + nota,
        0
    );

    const promedio = suma / notas.length;

    const tieneNotaBaja = notas.some(
        nota => nota < 60
    );

    if (promedio < 60 || tieneNotaBaja) {

        distribucionRendimiento.seguimiento++;

    } else {

        distribucionRendimiento.favorable++;

    }

});

// Comprobar la distribución calculada
console.table(distribucionRendimiento);

/* ==========================================
   GT10 - GRÁFICO DE DISTRIBUCIÓN ACADÉMICA
========================================== */

const canvasDistribucion = document.getElementById(
    "analyticsDistributionChart"
);

const contenedorDistribucion = document.getElementById(
    "analyticsDistribution"
);

const totalDistribucion =
    distribucionRendimiento.favorable +
    distribucionRendimiento.seguimiento;

if (
    canvasDistribucion &&
    contenedorDistribucion &&
    typeof Chart !== "undefined" &&
    totalDistribucion > 0
) {

    // Mostrar el canvas
    canvasDistribucion.style.display = "block";

    // Eliminar el mensaje de espera
    const areaDistribucion = canvasDistribucion.parentElement;

    const mensajeVacio = areaDistribucion.querySelector(
        ".analytics-empty-state"
    );

    if (mensajeVacio) {
        mensajeVacio.remove();
    }

    // Actualizar estado
    const estadoDistribucion =
        contenedorDistribucion.querySelector(
            ".analytics-chart-status"
        );

    if (estadoDistribucion) {
        estadoDistribucion.innerHTML = `
            <i class="bi bi-check-circle"></i>
            Datos disponibles
        `;
    }

    // Crear gráfico circular
    new Chart(canvasDistribucion, {

        type: "doughnut",

        data: {
            labels: [
                "Rendimiento favorable",
                "Requieren seguimiento"
            ],

            datasets: [{
                data: [
                    distribucionRendimiento.favorable,
                    distribucionRendimiento.seguimiento
                ],

                backgroundColor: [
                    "#18c8b4",
                    "#ff7398"
                ],

                borderColor: "#ffffff",
                borderWidth: 4,
                hoverOffset: 8,
                borderRadius: 6
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",

            plugins: {
                legend: {
                    display: true,
                    position: "bottom",

                    labels: {
                        color: "#59617e",
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: "circle",
                        font: {
                            size: 12,
                            weight: "600"
                        }
                    }
                },

                tooltip: {
                    backgroundColor: "#161b42",
                    padding: 12,
                    cornerRadius: 10,

                    callbacks: {
                        label: function(context) {
                            const cantidad = context.parsed;
                            const porcentaje =
                                (cantidad / totalDistribucion) * 100;

                            return (
                                `${context.label}: ${cantidad} ` +
                                `(${porcentaje.toFixed(1)}%)`
                            );
                        }
                    }
                }
            }
        }
    });
}


/* ==========================================
   GT10 - GRÁFICO REAL DE TENDENCIAS
========================================== */

const canvasTendencias = document.getElementById(
    "analyticsTrendsChart"
);

const contenedorTendencias = document.getElementById(
    "analyticsTrends"
);

if (
    canvasTendencias &&
    contenedorTendencias &&
    typeof Chart !== "undefined" &&
    tendenciasAcademicas.length > 0
) {

    // Ordenar los períodos cronológicamente
    const ordenSemestre = (semestre) => {
        const texto = String(semestre).toLowerCase();

        if (texto.includes("ii") || texto.includes("segundo")) {
            return 2;
        }

        return 1;
    };

    const tendenciasOrdenadas = [...tendenciasAcademicas]
        .sort((a, b) =>
            a.anio - b.anio ||
            ordenSemestre(a.semestre) - ordenSemestre(b.semestre)
        );

    // Recuperar el canvas oculto
    canvasTendencias.style.display = "block";

    const areaGrafico = canvasTendencias.parentElement;

    const mensajeVacio = areaGrafico.querySelector(
        ".analytics-empty-state"
    );

    if (mensajeVacio) {
        mensajeVacio.remove();
    }

    // Actualizar estado
    const estado = contenedorTendencias.querySelector(
        ".analytics-chart-status"
    );

    if (estado) {
        estado.innerHTML = `
            <i class="bi bi-check-circle"></i>
            Datos disponibles
        `;
    }

    // Crear gráfico interactivo
    new Chart(canvasTendencias, {
        type: "line",

        data: {
            labels: tendenciasOrdenadas.map(
                periodo => `${periodo.semestre} ${periodo.anio}`
            ),

            datasets: [{
                label: "Promedio académico",
                data: tendenciasOrdenadas.map(
                    periodo => periodo.promedio
                ),

                borderColor: "#6558f5",
                backgroundColor: "rgba(101, 88, 245, 0.10)",

                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: "#6558f5",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 3,

                tension: 0.35,
                fill: true
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    backgroundColor: "#161b42",
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        label: context =>
                            `Promedio: ${context.parsed.y.toFixed(1)}`
                    }
                }
            },

            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: "#8188a3"
                    },
                    grid: {
                        color: "#edf0fa"
                    }
                },

                x: {
                    ticks: {
                        color: "#8188a3"
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}



    // Configuración de los gráficos
    const graficos = [
        {
            canvasId: "analyticsTrendsChart",
            containerId: "analyticsTrends",
            titulo: "Esperando información académica",
            descripcion:
                "El gráfico de tendencias se generará cuando conectemos los registros de calificaciones del sistema GT10.",
            icono: "bi-graph-up-arrow"
        },
        {
            canvasId: "analyticsDistributionChart",
            containerId: "analyticsDistribution",
            titulo: "Sin datos de rendimiento",
            descripcion:
                "La distribución del rendimiento aparecerá cuando conectemos las calificaciones de los estudiantes.",
            icono: "bi-pie-chart"
        }
    ];

    // Mostrar un estado vacío por cada gráfico
    function mostrarEstadoVacio(configuracion) {

        const canvas = document.getElementById(
            configuracion.canvasId
        );

        const contenedor = document.getElementById(
            configuracion.containerId
        );

        if (!canvas || !contenedor) {
            console.warn(
                "GT10: No se encontró el gráfico:",
                configuracion.canvasId
            );
            return;
        }

        const estado = contenedor.querySelector(
            ".analytics-chart-status"
        );

        if (estado) {
            estado.innerHTML = `
                <i class="bi bi-clock-history"></i>
                Pendiente de datos
            `;
        }

        const areaGrafico = canvas.parentElement;

        // Evitar mensajes duplicados
        const mensajeAnterior = areaGrafico.querySelector(
            ".analytics-empty-state"
        );

        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        const mensaje = document.createElement("div");
        mensaje.className = "analytics-empty-state";

        const icono = document.createElement("div");
        icono.className = "analytics-empty-icon";

        const elementoIcono = document.createElement("i");
        elementoIcono.className = `bi ${configuracion.icono}`;

        icono.appendChild(elementoIcono);

        const titulo = document.createElement("h4");
        titulo.textContent = configuracion.titulo;

        const descripcion = document.createElement("p");
        descripcion.textContent = configuracion.descripcion;

        mensaje.appendChild(icono);
        mensaje.appendChild(titulo);
        mensaje.appendChild(descripcion);

        canvas.style.display = "none";
        areaGrafico.appendChild(mensaje);
    }

    
/* ==========================================
   GT10 - ESTADOS VACÍOS DE LOS GRÁFICOS
========================================== */

// Mostrar mensaje solo si no existen tendencias
if (tendenciasAcademicas.length === 0) {
    mostrarEstadoVacio(graficos[0]);
}

// El gráfico de distribución todavía está pendiente

if (totalDistribucion === 0) {
    mostrarEstadoVacio(graficos[1]);
}



/* ==========================================
   GT10 - REPORTE ACADÉMICO INSTITUCIONAL
========================================== */

const botonExportarPDF = document.getElementById(
    "analyticsExportPDF"
);

if (botonExportarPDF) {

    botonExportarPDF.addEventListener("click", function () {

        if (!window.jspdf?.jsPDF) {
            alert("No se pudo cargar la biblioteca PDF.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        const ancho = pdf.internal.pageSize.getWidth();
        const alto = pdf.internal.pageSize.getHeight();
        const margen = 15;
        const contenido = ancho - margen * 2;

        const colores = {
            violeta: [101, 88, 245],
            azul: [50, 148, 255],
            turquesa: [24, 200, 180],
            coral: [255, 115, 152],
            oscuro: [22, 27, 66],
            gris: [100, 109, 139],
            fondo: [245, 246, 255],
            blanco: [255, 255, 255]
        };

        const fecha = new Date().toLocaleDateString("es-NI");

        function colorTexto(color) {
            pdf.setTextColor(...color);
        }

        function tituloSeccion(texto, y) {
            colorTexto(colores.oscuro);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(13);
            pdf.text(texto, margen, y);

            pdf.setDrawColor(225, 228, 242);
            pdf.line(margen, y + 4, ancho - margen, y + 4);
        }

        function nuevaPagina() {
            pdf.addPage();

            pdf.setFillColor(...colores.fondo);
            pdf.rect(0, 0, ancho, 12, "F");
        }

        // ======================================
        // ENCABEZADO
        // ======================================

        pdf.setFillColor(...colores.violeta);
        pdf.rect(0, 0, ancho, 48, "F");

        pdf.setFillColor(...colores.azul);
        pdf.roundedRect(176, 11, 18, 18, 5, 5, "F");

        colorTexto(colores.blanco);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("EXPEDIENTES DIGITALES GT10", margen, 15);

        pdf.setFontSize(20);
        pdf.text("Informe de rendimiento", margen, 29);
        pdf.text("academico", margen, 38);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(`Generado el ${fecha}`, margen, 44);

        // ======================================
        // RESUMEN EJECUTIVO
        // ======================================

        tituloSeccion("Resumen ejecutivo", 61);

        colorTexto(colores.gris);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);

        pdf.text(
            "Indicadores calculados a partir de las calificaciones registradas en GT10.",
            margen,
            72
        );

        const notasValidas = calificacionesReales
            .map(registro => registro.nota)
            .filter(nota =>
                nota !== null &&
                nota !== undefined &&
                String(nota).trim() !== "" &&
                Number.isFinite(Number(nota)) &&
                Number(nota) >= 0 &&
                Number(nota) <= 100
            )
            .map(Number);

        const promedioGeneral = notasValidas.length
            ? notasValidas.reduce((a, b) => a + b, 0) /
              notasValidas.length
            : null;

        const indicadores = [
            {
                etiqueta: "Analizados",
                valor: totalEstudiantesAnalizados,
                color: colores.violeta
            },
            {
                etiqueta: "Promedio",
                valor: promedioGeneral === null
                    ? "S/D"
                    : promedioGeneral.toFixed(1),
                color: colores.azul
            },
            {
                etiqueta: "Favorables",
                valor: estudiantesFavorables,
                color: colores.turquesa
            },
            {
                etiqueta: "Seguimiento",
                valor: estudiantesSeguimiento,
                color: colores.coral
            }
        ];

        const separacion = 3;
        const tarjetaAncho =
            (contenido - separacion * 3) / 4;

        indicadores.forEach((item, indice) => {

            const x = margen +
                indice * (tarjetaAncho + separacion);

            pdf.setFillColor(...colores.fondo);
            pdf.roundedRect(x, 80, tarjetaAncho, 30, 3, 3, "F");

            pdf.setFillColor(...item.color);
            pdf.roundedRect(x, 80, tarjetaAncho, 2, 1, 1, "F");

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(17);
            colorTexto(item.color);

            pdf.text(String(item.valor), x + 5, 95);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            colorTexto(colores.gris);

            pdf.text(item.etiqueta, x + 5, 103);

        });

        // ======================================
        // GRÁFICOS ACADÉMICOS
        // ======================================

        tituloSeccion("Visualizacion del rendimiento", 125);

        const graficoTendencias = document.getElementById(
            "analyticsTrendsChart"
        );

        const graficoDistribucion = document.getElementById(
            "analyticsDistributionChart"
        );

        const graficos = [
            {
                canvas: graficoTendencias,
                titulo: "Tendencias academicas",
                x: margen,
                y: 138,
                ancho: 105,
                alto: 75
            },
            {
                canvas: graficoDistribucion,
                titulo: "Distribucion del rendimiento",
                x: 124,
                y: 138,
                ancho: 71,
                alto: 75
            }
        ];

        graficos.forEach(grafico => {

            pdf.setFillColor(...colores.fondo);
            pdf.roundedRect(
                grafico.x,
                grafico.y,
                grafico.ancho,
                grafico.alto,
                3,
                3,
                "F"
            );

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(9);
            colorTexto(colores.oscuro);

            pdf.text(
                grafico.titulo,
                grafico.x + 5,
                grafico.y + 9
            );

            if (
                grafico.canvas &&
                grafico.canvas.width > 0 &&
                grafico.canvas.height > 0 &&
                typeof Chart !== "undefined" &&
                Chart.getChart(grafico.canvas)
            ) {

                try {

                    const imagen =
                        grafico.canvas.toDataURL("image/png");

                    const espacioAncho = grafico.ancho - 10;
                    const espacioAlto = grafico.alto - 17;

                    const proporcion =
                        grafico.canvas.width /
                        grafico.canvas.height;

                    let imagenAncho = espacioAncho;
                    let imagenAlto = imagenAncho / proporcion;

                    if (imagenAlto > espacioAlto) {
                        imagenAlto = espacioAlto;
                        imagenAncho = imagenAlto * proporcion;
                    }

                    const imagenX =
                        grafico.x +
                        (grafico.ancho - imagenAncho) / 2;

                    pdf.addImage(
                        imagen,
                        "PNG",
                        imagenX,
                        grafico.y + 12,
                        imagenAncho,
                        imagenAlto
                    );

                } catch (error) {

                    console.error(
                        "Error al exportar grafico:",
                        error
                    );

                    pdf.setFont("helvetica", "normal");
                    pdf.setFontSize(8);
                    pdf.text(
                        "Grafico no disponible",
                        grafico.x + 5,
                        grafico.y + 20
                    );
                }

            } else {

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(8);
                colorTexto(colores.gris);

                pdf.text(
                    "Sin datos para graficar",
                    grafico.x + 5,
                    grafico.y + 20
                );
            }

        });

        // ======================================
        // ALERTAS ACADÉMICAS
        // ======================================

        tituloSeccion("Alertas y seguimiento academico", 226);

        let y = 239;

        if (alertasAcademicas.length === 0) {

            pdf.setFillColor(231, 250, 246);
            pdf.roundedRect(margen, y - 5, contenido, 17, 3, 3, "F");

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.setTextColor(20, 150, 132);

            pdf.text(
                "Sin alertas academicas detectadas",
                margen + 6,
                y + 5
            );

        } else {

            alertasAcademicas.forEach(alerta => {

                const nombre = String(
                    alerta.nombre || "Estudiante"
                );

                const motivo = String(
                    alerta.motivo || "Seguimiento academico"
                );

                const lineasNombre =
                    pdf.splitTextToSize(nombre, contenido - 12);

                const lineasMotivo =
                    pdf.splitTextToSize(motivo, contenido - 12);

                const alturaBloque =
                    13 +
                    lineasNombre.length * 5 +
                    lineasMotivo.length * 4;

                if (y + alturaBloque > alto - 18) {
                    nuevaPagina();
                    y = 24;
                }

                pdf.setFillColor(...colores.fondo);
                pdf.roundedRect(
                    margen,
                    y - 5,
                    contenido,
                    alturaBloque,
                    3,
                    3,
                    "F"
                );

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(10);
                colorTexto(colores.oscuro);

                pdf.text(lineasNombre, margen + 5, y + 2);

                const yPromedio =
                    y + 4 + lineasNombre.length * 5;

                pdf.setFontSize(9);
                colorTexto(colores.coral);

                pdf.text(
                    `Promedio: ${alerta.promedio}`,
                    margen + 5,
                    yPromedio
                );

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(8);
                colorTexto(colores.gris);

                pdf.text(
                    lineasMotivo,
                    margen + 5,
                    yPromedio + 5
                );

                y += alturaBloque + 5;

            });

        }

        // ======================================
        // PIE DE PÁGINA
        // ======================================

        const totalPaginas =
            pdf.internal.getNumberOfPages();

        for (let pagina = 1; pagina <= totalPaginas; pagina++) {

            pdf.setPage(pagina);

            pdf.setDrawColor(225, 228, 242);
            pdf.line(margen, alto - 15, ancho - margen, alto - 15);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            colorTexto(colores.gris);

            pdf.text(
                "EXPEDIENTES DIGITALES | INFORME DE RENDIMIENTO ACADEMICO",
                margen,
                alto - 10
            );

            pdf.text(
                `Pagina ${pagina} de ${totalPaginas}`,
                ancho - margen,
                alto - 10,
                { align: "right" }
            );

        }

        pdf.save("GT10_Reporte_Academico.pdf");

    });

}




});
