// =====================================================
// FIREBASE - ESTUDIANTES
// Sistema de Expedientes Digitales GT10
// =====================================================

import { db } from "./firebase-config.js";

import {
    doc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";


// =====================================================
// GUARDAR ESTUDIANTE EN FIRESTORE
// =====================================================

async function guardarEstudianteFirestore(student) {

    try {

        const studentRef = doc(
            db,
            "estudiantes",
            String(student.id)
        );

        await setDoc(
            studentRef,
            {
                ...student,
                creadoEn: serverTimestamp(),
                actualizadoEn: serverTimestamp()
            }
        );

        console.log(
            "Estudiante guardado en Firestore:",
            student.codigo
        );

        return true;

    } catch (error) {

        console.error(
            "Error al guardar estudiante en Firestore:",
            error
        );

        return false;
    }
}


// =====================================================
// ACTUALIZAR ESTUDIANTE EN FIRESTORE
// =====================================================

async function actualizarEstudianteFirestore(student) {

    try {

        const studentRef = doc(
            db,
            "estudiantes",
            String(student.id)
        );

        await updateDoc(
            studentRef,
            {
                ...student,
                actualizadoEn: serverTimestamp()
            }
        );

        console.log(
            "Estudiante actualizado en Firestore:",
            student.codigo
        );

        return true;

    } catch (error) {

        console.error(
            "Error al actualizar estudiante en Firestore:",
            error
        );

        return false;
    }
}


// =====================================================
// HACER FUNCIONES DISPONIBLES PARA APP.JS
// =====================================================

window.guardarEstudianteFirestore =
    guardarEstudianteFirestore;

window.actualizarEstudianteFirestore =
    actualizarEstudianteFirestore;