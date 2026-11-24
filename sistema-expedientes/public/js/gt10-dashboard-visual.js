// Panel visual GT10: los datos proceden del almacenamiento actual del prototipo.
// No calcula probabilidades de deserción ni sustituye un modelo predictivo.
(function(){
  function read(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
  function setText(id,value){const e=document.getElementById(id);if(e)e.textContent=String(value)}
  function safeText(v){return String(v??'').trim()}
  function start(){
    const students=read('students'), academic=read('academicRecords'), documents=read('studentDocuments');
    const active=students.filter(s=>safeText(s.estado).toLowerCase()==='activo').length;
    const other=students.length-active;
    const donut=document.getElementById('gt10Donut');
    if(donut)donut.style.setProperty('--active',(students.length?active/students.length*100:0)+'%');
    setText('gt10DonutTotal',students.length);setText('gt10ActiveCount',active);setText('gt10OtherCount',other);
    
const chart = document.getElementById("gt10SubjectChart");

if (chart) {
    chart.innerHTML = "";

    const grades = read("grades");
    const subjects = read("subjects");
    const totals = new Map();

    const subjectNames = new Map(
        subjects.map(subject => [
            String(subject.id),
            subject.nombre || subject.nombreAsignatura || subject.asignatura || ""
        ])
    );

    grades.forEach(grade => {
        const nota = Number(grade.nota);

        if (!Number.isFinite(nota) || nota < 0 || nota > 100) {
            return;
        }

        // Solo incluir evaluaciones parciales.
        // Evita contar dos veces las notas semestrales.
        if (!["I Parcial", "II Parcial"].includes(grade.evaluacion)) {
            return;
        }

        
const nombreOriginal = safeText(
    grade.asignatura ||
    grade.asignaturaNombre ||
    subjectNames.get(String(grade.subjectId)) ||
    "Sin asignatura"
);

const normalizar = texto =>
    texto.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

const nombresOficiales = {
    "matematicas": "Matemáticas",
    "lengua y literatura": "Lengua y Literatura",
    "ciencias naturales": "Ciencias Naturales",
    "estudios sociales": "Estudios Sociales",
    "ingles": "Inglés",
    "educacion fisica": "Educación Física"
};

const nombre = nombresOficiales[
    normalizar(nombreOriginal)
] || nombreOriginal;


        if (nombre === "Sin asignatura") {
            return;
        }

        const actual = totals.get(nombre) || {
            suma: 0,
            cantidad: 0
        };

        actual.suma += nota;
        actual.cantidad++;

        totals.set(nombre, actual);
    });

    const entries = [...totals.entries()]
        .map(([nombre, datos]) => ({
            nombre,
            promedio: datos.suma / datos.cantidad
        }))
        .sort((a, b) => b.promedio - a.promedio)
        .slice(0, 6);

    if (!entries.length) {
        const empty = document.createElement("div");
        empty.className = "gt10-empty-chart";
        empty.textContent = "Aún no hay calificaciones disponibles.";
        chart.appendChild(empty);

        setText("gt10SubjectNote", "Sin datos académicos.");
    } else {
        entries.forEach(({ nombre, promedio }) => {
            const item = document.createElement("div");
            item.className = "gt10-bar-item";
            item.title = `${nombre}: ${promedio.toFixed(1)} puntos`;

            const number = document.createElement("span");
            number.className = "gt10-bar-number";
            number.textContent = promedio.toFixed(1);

            const bar = document.createElement("div");
            bar.className = "gt10-bar-column";
            bar.style.setProperty(
                "--bar-height",
                `${(promedio / 100) * 110}px`
            );

            const label = document.createElement("span");
            label.className = "gt10-bar-label";
            label.textContent = nombre;

            item.append(number, bar, label);
            chart.appendChild(item);
        });

        setText(
            "gt10SubjectNote",
            "Promedios de evaluaciones parciales (escala de 0 a 100)."
        );
    }
}

    const categories=[['bi-people-fill','Estudiantes',students.length],['bi-folder2-open','Expedientes',students.length],['bi-journal-check','Registros académicos',academic.length],['bi-file-earmark-text','Documentos',documents.length]];
    const container=document.getElementById('gt10CategoryBars');if(container){categories.forEach(([icon,label,count])=>{const item=document.createElement('div');item.className='gt10-category-item';const i=document.createElement('i');i.className='bi '+icon;const strong=document.createElement('strong');strong.textContent=count;const span=document.createElement('span');span.textContent=label;item.append(i,strong,span);container.appendChild(item)})}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
