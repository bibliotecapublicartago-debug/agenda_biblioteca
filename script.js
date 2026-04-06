// Enlace oficial de la base de datos de la Biblioteca
const URL_GOOGLE_SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTFJpQqBtRrFtXmFaMP0GJo191BMoV6eFl6r-Tn6SAl3QXORfXCEVUzdcT0dumGk_c0aBxd95hBzwCR/pub?output=csv';

let actividadesGlobales = [];
let diaFiltroActual = 'todos'; // Variable para recordar qué día tenemos seleccionado

// 1. Descargar y procesar los datos del Excel
Papa.parse(URL_GOOGLE_SHEET, {
    download: true,
    header: true,
    complete: function(resultados) {
        // Limpiamos filas vacías y nos aseguramos de que haya una actividad escrita
        actividadesGlobales = resultados.data.filter(act => act["Actividad"] && act["Actividad"].trim() !== ""); 
        mostrarActividades(actividadesGlobales);
    },
    error: function(err) {
        console.error("Error al leer el CSV:", err);
        document.getElementById('contenedor-actividades').innerHTML = '<p>Hubo un problema al cargar la agenda. Por favor, intenta más tarde.</p>';
    }
});

// 2. Función para crear las tarjetas en la web
function mostrarActividades(actividades) {
    const contenedor = document.getElementById('contenedor-actividades');
    contenedor.innerHTML = ''; 

    if (actividades.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No se encontraron actividades para este filtro o día.</p>';
        return;
    }

    actividades.forEach(actividad => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        
        // Configurar la etiqueta de tipo (Recurrente vs Espontáneo)
        let claseBadge = 'tipo-espontaneo';
        let textoTipo = actividad["Tipo"] ? actividad["Tipo"].trim() : 'Evento';
        
        if (textoTipo.toLowerCase().includes('recurrente')) {
            claseBadge = 'tipo-recurrente';
        }

        tarjeta.innerHTML = `
            <div class="badge-tipo ${claseBadge}">${textoTipo}</div>
            <h3>${actividad["Actividad"]}</h3>
            <p><strong>📅 Cuándo:</strong> ${actividad["Día"]} a las ${actividad["Hora"]}</p>
            <p><strong>📍 Lugar:</strong> ${actividad["Lugar"]}</p>
            <p><strong>👤 Instructor:</strong> ${actividad["Instructor"]}</p>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// 3. Nueva función para filtrar por Día (Calendario)
function filtrarPorDia(dia) {
    diaFiltroActual = dia; // Actualizamos el día seleccionado
    
    // Quitamos la clase 'active' de todos los botones y se la ponemos al que tocamos
    document.querySelectorAll('.btn-dia').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    filtrarResultados(); // Llamamos a la función maestra de filtrado
}

// 4. Lógica de búsqueda y filtrado maestra
const buscador = document.getElementById('buscador');
const filtroTipo = document.getElementById('filtro-tipo');

function filtrarResultados() {
    const textoBusqueda = buscador.value.toLowerCase();
    const tipoSeleccionado = filtroTipo.value.toLowerCase();

    const filtradas = actividadesGlobales.filter(actividad => {
        // Filtro de Texto
        const textoActividad = (actividad["Actividad"] || '').toLowerCase();
        const textoInstructor = (actividad["Instructor"] || '').toLowerCase();
        const textoLugar = (actividad["Lugar"] || '').toLowerCase();
        const coincideTexto = textoActividad.includes(textoBusqueda) || 
                              textoInstructor.includes(textoBusqueda) ||
                              textoLugar.includes(textoBusqueda);
        
        // Filtro de Tipo (Recurrente/Espontáneo)
        const textoTipoActividad = (actividad["Tipo"] || '').toLowerCase();
        let coincideTipo = true;
        if (tipoSeleccionado !== 'todos') {
            if (tipoSeleccionado === 'recurrente') {
                coincideTipo = textoTipoActividad.includes('recurrente');
            } else if (tipoSeleccionado === 'espontaneo') {
                coincideTipo = textoTipoActividad.includes('espontáneo') || textoTipoActividad.includes('espontaneo');
            }
        }

        // Filtro de Día (Calendario)
        const textoDiaActividad = (actividad["Día"] || '').toLowerCase();
        let coincideDia = true;
        if (diaFiltroActual !== 'todos') {
            coincideDia = textoDiaActividad.includes(diaFiltroActual.toLowerCase());
        }

        return coincideTexto && coincideTipo && coincideDia;
    });

    mostrarActividades(filtradas);
}

// Eventos
buscador.addEventListener('input', filtrarResultados);
filtroTipo.addEventListener('change', filtrarResultados);
