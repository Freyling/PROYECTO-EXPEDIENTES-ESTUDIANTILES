// ==========================================
// FIREBASE - SISTEMA DE EXPEDIENTES GT10
// ==========================================

// Importar Firebase
import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

// Importar Cloud Firestore
import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";


// ==========================================
// CONFIGURACIÓN DEL PROYECTO FIREBASE
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyB76A_HXUt6z3wRIsXGyvKLfSUsufHov4w",
    authDomain: "expedientes-digitales-gt10.firebaseapp.com",
    projectId: "expedientes-digitales-gt10",
    storageBucket: "expedientes-digitales-gt10.firebasestorage.app",
    messagingSenderId: "894453446019",
    appId: "1:894453446019:web:af66e6e2827d9c1d8832b6",
    measurementId: "G-8Q5RXEN8GG"
};


// ==========================================
// INICIALIZAR FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);


// ==========================================
// INICIALIZAR CLOUD FIRESTORE
// ==========================================

const db = getFirestore(app);


// ==========================================
// EXPORTAR FIREBASE Y FIRESTORE
// ==========================================
// Esto permitirá utilizar la misma conexión
// desde otros archivos JavaScript del sistema.

export {
    app,
    db
};


// ==========================================
// COMPROBACIÓN
// ==========================================

console.log(
    "Firebase y Firestore conectados correctamente - GT10"
);