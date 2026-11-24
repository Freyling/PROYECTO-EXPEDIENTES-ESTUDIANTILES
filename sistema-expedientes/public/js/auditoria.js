/* =========================================================
   SISTEMA DE AUDITORÍA
========================================================= */

window.Auditoria = {


    /* =====================================================
       OBTENER HISTORIAL
    ===================================================== */

    obtener: function () {

        const data =
            localStorage.getItem(
                "auditHistory"
            );


        if (!data) {
            return [];
        }


        try {

            const parsed =
                JSON.parse(data);


            return Array.isArray(parsed)
                ? parsed
                : [];


        } catch (error) {

            console.error(
                "Error al leer historial:",
                error
            );

            return [];

        }

    },


    /* =====================================================
       GUARDAR HISTORIAL
    ===================================================== */

    guardar: function (history) {

        localStorage.setItem(
            "auditHistory",
            JSON.stringify(history)
        );

    },


    /* =====================================================
       REGISTRAR ACTIVIDAD
    ===================================================== */

    registrar: function (
        accion,
        descripcion,
        estudianteId = null,
        estudianteNombre = ""
    ) {


        const history =
            this.obtener();


        const record = {

            id:
                Date.now(),

            accion:
                accion,

            descripcion:
                descripcion,

            estudianteId:
                estudianteId,

            estudianteNombre:
                estudianteNombre,

            usuario:
                "Administrador",

            fecha:
                new Date().toISOString()

        };


        history.push(
            record
        );


        this.guardar(
            history
        );


        return record;

    }

};