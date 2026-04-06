// Enlace oficial de la base de datos de la Biblioteca
const URL_GOOGLE_SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTFJpQqBtRrFtXmFaMP0GJo191BMoV6eFl6r-Tn6SAl3QXORfXCEVUzdcT0dumGk_c0aBxd95hBzwCR/pub?output=csv';

let actividadesGlobales = [];
let diaFiltroActual = 'todos'; 

// 1. Descargar y procesar los datos del Excel
Papa.parse(URL_GOOGLE_SHEET, {
    download: true,
    header: true,
    complete: function(resultados) {
        actividadesGlobales = resultados.data.filter(act => act["Actividad"] && act["Actividad"].trim() !== ""); 
        mostrarActividades(actividadesGlobales);
    },
    error: function(err) {
        console.error("Error al leer el CSV:", err);
        document.getElementById('contenedor-actividades').innerHTML = '<p>Hubo un problema al cargar la agenda.</p>';
    }
});

// 2. Función para crear las tarjetas en la web
function mostrarActividades(actividades) {
    const contenedor = document.getElementById('contenedor-actividades');
    contenedor.innerHTML = ''; 

    if (actividades.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No se encontraron actividades.</p>';
        return;
    }

    actividades.forEach(actividad => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        
        let claseBadge = 'tipo-espontaneo';
        let textoTipo = actividad["Tipo"] ? actividad["Tipo"].trim() : 'Evento';
        if (textoTipo.toLowerCase().includes('recurrente')) {
            claseBadge = 'tipo-recurrente';
        }

        // --- LÓGICA DE HORA DE INICIO Y FIN ---
        const inicio = actividad["Hora"] || '';
        const fin = actividad["Fin"] || '';
        let horarioTexto = inicio;

        if (fin.trim() !== "") {
            horarioTexto = `${inicio} a ${fin}`;
        }

        tarjeta.innerHTML = `
            <div class="badge-tipo ${claseBadge}">${textoTipo}</div>
            <h3>${actividad["Actividad"]}</h3>
            <p><strong>📅 Cuándo:</strong> ${actividad["Día"]} | ${horarioTexto}</p>
            <p><strong>📍 Lugar:</strong> ${actividad["Lugar"]}</p>
            <p><strong>👤 Instructor:</strong> ${actividad["Instructor"]}</p>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// 3. Función para filtrar por Día
function filtrarPorDia(dia) {
    diaFiltroActual = dia;
    document.querySelectorAll('.btn-dia').forEach(btn => btn.classList.remove('active'));
    // Buscamos el botón que se presionó para marcarlo como activo
    if (event) event.target.classList.add('active');
    filtrarResultados();
}

// 4. Lógica de búsqueda y filtrado
const buscador = document.getElementById('buscador');
const filtroTipo = document.getElementById('filtro-tipo');

function filtrarResultados() {
    const textoBusqueda = buscador.value.toLowerCase();
    const tipoSeleccionado = filtroTipo.value.toLowerCase();

    const filtradas = actividadesGlobales.filter(actividad => {
        const textoActividad = (actividad["Actividad"] || '').toLowerCase();
        const textoInstructor = (actividad["Instructor"] || '').toLowerCase();
        const textoLugar = (actividad["Lugar"] || '').toLowerCase();
        const coincideTexto = textoActividad.includes(textoBusqueda) || 
                              textoInstructor.includes(textoBusqueda) ||
                              textoLugar.includes(textoBusqueda);
        
        const textoTipoActividad = (actividad["Tipo"] || '').toLowerCase();
        let coincideTipo = tipoSeleccionado === 'todos' || textoTipoActividad.includes(tipoSeleccionado);

        const textoDiaActividad = (actividad["Día"] || '').toLowerCase();
        let coincideDia = diaFiltroActual === 'todos' || textoDiaActividad.includes(diaFiltroActual.toLowerCase());

        return coincideTexto && coincideTipo && coincideDia;
    });

    mostrarActividades(filtradas);
}

buscador.addEventListener('input', filtrarResultados);
filtroTipo.addEventListener('change', filtrarResultados);
