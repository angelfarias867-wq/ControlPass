const busForm = document.querySelector('#bus-form');
const btnBack = document.querySelector('#btn-back');
const userAvatar = document.querySelector('#user-avatar');
const inputNumeroBus = document.querySelector('#numeroBus');
const inputFoto = document.querySelector('#foto');
const selectClasificacion = document.querySelector('#clasificacionEntidad');
const selectIniciales = document.querySelector('#inicialesColegio');
const inputNombre = document.querySelector('#nombreEntidad');
const selectEstado = document.querySelector('#estado');
const selectMunicipio = document.querySelector('#municipio');
const selectParroquia = document.querySelector('#parroquia');
const inputNinos = document.querySelector('#cantidadNinos');
const inputAdultos = document.querySelector('#cantidadAdultos');
const previewFoto = document.querySelector('#preview-foto');

const urlParams = new URLSearchParams(window.location.search);
const editBusId = urlParams.get('edit');

import { createNotification } from '../components/notifications.js';

// Base de datos local idéntica a tus options del HTML
const ubicacionesVenezuela = {
  "Carabobo": {
    "Valencia": ["San José", "Naguanagua", "Miguel Peña", "Rafael Urdaneta"],
    "Puerto Cabello": ["Bartolomé Salom", "Fraternidad", "Goigoaza"]
  },
  "Aragua": {
    "Girardot": ["Maracay", "Pedro José Ovalles", "Joaquín Crespo"],
    "Santiago Mariño": ["Turmero", "Arévalo Aponte"]
  },
  "Miranda": {
    "Acevedo": ["Caucagua", "Araguita", "Arévalo González", "Capaya", "El Café", "Marizapa", "Panaquire", "Ribas"],
    "Andrés Bello": ["San José de Barlovento", "Cumbo"],
    "Baruta": ["Nuestra Señora del Rosario de Baruta", "El Cafetal", "Las Minas de Baruta"],
    "Brión": ["Higuerote", "Curiepe", "Tacarigua de Mamporal"],
    "Buroz": ["Mamporal"],
    "Carrizal": ["Carrizal"],
    "Chacao": ["Chacao"],
    "Cristóbal Rojas": ["Charallave", "Las Brisas"],
    "El Hatillo": ["El Hatillo"],
    "Guaicaipuro": ["Los Teques", "Altagracia de la Montaña", "Cecilio Acosta", "El Jarillo", "San Pedro", "Tácata", "Paracotos"],
    "Independencia": ["Santa Teresa del Tuy", "Cartanal"],
    "Lander": ["Ocumare del Tuy", "La Democracia", "Santa Bárbara"],
    "Los Salias": ["San Antonio de los Altos"],
    "Páez": ["Río Chico", "El Guapo", "San Fernando de Rey", "Tacarigua de la Laguna", "Paparo"],
    "Paz Castillo": ["Santa Lucía"],
    "Pedro Gual": ["Cúpira", "Machurucuto"],
    "Plaza": ["Guarenas"],
    "Simón Bolívar": ["San Francisco de Yare", "San Antonio de Yare"],
    "Sucre": ["Petare", "Caucagüita", "Fila de Mariches", "La Dolorita", "Leoncio Martínez"],
    "Urdaneta": ["Cúa", "Nueva Cúa"],
    "Zamora": ["Guatire", "Bolívar"]
  },
  "Guárico": {
    "Juan Germán Roscio": ["San Juan de los Morros", "Parapara"],
    "Infante": ["Valle de la Pascua", "Espino"]
  },
  "Anzoátegui": {
    "Simón Bolívar": ["Barcelona", "El Carmen", "San Cristóbal"],
    "Juan Antonio Sotillo": ["Puerto La Cruz", "Pozuelos"]
  },
  "Distrito Capital": {
    "Libertador": ["23 de Enero", "Altagracia", "Antímano", "Caricuao", "Catedral", "Coche", "El Junquito", "El Paraíso", "El Recreo", "El Valle", "La Candelaria", "La Pastora", "La Vega", "Macarao", "San Agustín", "San Bernardino", "San José", "San Juan", "Santa Rosalía", "Santa Teresa", "Sucre (Catia)"]
  },
  "La Guaira": {
    "Vargas": ["La Guaira", "Maiquetía", "Catia La Mar", "Caraballeda", "Macuto"]
  }
};

// 1. CARGA DE USUARIO DESDE LOCALSTORAGE
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (userAvatar && currentUser && currentUser.name) {
  userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
}

// 2. LÓGICA DE INICIALES
selectClasificacion?.addEventListener('change', () => {
  if (selectClasificacion.value === 'colegio') {
    selectIniciales.disabled = false;
    selectIniciales.required = true;
  } else {
    selectIniciales.disabled = true;
    selectIniciales.required = false;
    selectIniciales.selectedIndex = 0;
  }
});

// Variable global para rastrear siempre la clave limpia del estado
let estadoActualKey = '';

// 3. CAMBIO DE ESTADO -> LLENAR MUNICIPIOS
selectEstado?.addEventListener('change', () => {
  const estadoSeleccionado = selectEstado.value;
  selectMunicipio.innerHTML = '<option value="" disabled selected>Elige el municipio</option>';
  selectParroquia.innerHTML = '<option value="" disabled selected>Elige la parroquia</option>';
  selectParroquia.disabled = true;

  // Normalizar para encontrar la llave exacta sin importar acentos o mayúsculas
  const normalizarTexto = (texto) => texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  estadoActualKey = Object.keys(ubicacionesVenezuela).find(est => 
    normalizarTexto(est) === normalizarTexto(estadoSeleccionado)
  ) || estadoSeleccionado;

  if (ubicacionesVenezuela[estadoActualKey]) {
    const municipios = Object.keys(ubicacionesVenezuela[estadoActualKey]);
    municipios.forEach(mun => {
      const option = document.createElement('option');
      option.value = mun;
      option.textContent = mun;
      selectMunicipio.appendChild(option);
    });
    selectMunicipio.disabled = false;
  } else {
    selectMunicipio.disabled = true;
  }
});

// 4. CAMBIO DE MUNICIPIO -> LLENAR PARROQUIAS (Con normalización robusta)
selectMunicipio?.addEventListener('change', () => {
  const municipioSeleccionado = selectMunicipio.value;
  selectParroquia.innerHTML = '<option value="" disabled selected>Elige la parroquia</option>';

  const normalizarTexto = (texto) => texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  // Asegurar que encontramos la clave del estado actual
  if (!ubicacionesVenezuela[estadoActualKey]) {
    estadoActualKey = Object.keys(ubicacionesVenezuela).find(est => 
      normalizarTexto(est) === normalizarTexto(selectEstado.value)
    );
  }

  // Buscar el municipio ignorando diferencias de acentos
  const municipiosDelEstado = ubicacionesVenezuela[estadoActualKey] || {};
  const municipioKey = Object.keys(municipiosDelEstado).find(mun => 
    normalizarTexto(mun) === normalizarTexto(municipioSeleccionado)
  );

  if (municipioKey && municipiosDelEstado[municipioKey]) {
    const parroquias = municipiosDelEstado[municipioKey];
    parroquias.forEach(parr => {
      const option = document.createElement('option');
      option.value = parr;
      option.textContent = parr;
      selectParroquia.appendChild(option);
    });
    selectParroquia.disabled = false;
  } else {
    selectParroquia.disabled = true;
  }
});

// 5. CARGAR DATOS SI ESTAMOS EN MODO EDICIÓN
if (editBusId) {
  (async () => {
    try {
      const { data: bus } = await axios.get(`/api/buses/${editBusId}`, { withCredentials: true });
      console.log("Datos del bus recibidos para editar:", bus);

      if (inputNumeroBus) inputNumeroBus.value = bus.numeroBus ?? '';
      
      if (selectClasificacion && bus.entidad) {
        selectClasificacion.value = bus.entidad;
        selectClasificacion.dispatchEvent(new Event('change'));
      }

      // Separar iniciales y nombre si es colegio
      if (inputNombre) {
        let nombreCompleto = bus.nombreEntidad || '';
        
        if (bus.entidad === 'colegio' && selectIniciales) {
          const opcionesIniciales = Array.from(selectIniciales.options).map(opt => opt.value).filter(Boolean);
          const inicialEncontrada = opcionesIniciales.find(init => nombreCompleto.startsWith(init));
          
          if (inicialEncontrada) {
            selectIniciales.value = inicialEncontrada;
            selectIniciales.disabled = false;
            selectIniciales.required = true;
            nombreCompleto = nombreCompleto.replace(inicialEncontrada, '').trim();
          }
        }
        
        inputNombre.value = nombreCompleto;
      }

      if (inputNinos) inputNinos.value = bus.cantidadNinos ?? 0;
      if (inputAdultos) inputAdultos.value = bus.cantidadAdultos ?? 0;

      // RECUPERAR UBICACIÓN
      let estadoGuardado = bus.estado;
      let municipioGuardado = bus.municipio;
      const parroquiaGuardada = bus.parroquia || bus.lugarEntidad;

      if ((!estadoGuardado || !municipioGuardado) && parroquiaGuardada) {
        for (const [est, munObj] of Object.entries(ubicacionesVenezuela)) {
          for (const [mun, parras] of Object.entries(munObj)) {
            if (parras.includes(parroquiaGuardada)) {
              estadoGuardado = est;
              municipioGuardado = mun;
              break;
            }
          }
          if (estadoGuardado) break;
        }
      }

      if (selectEstado && estadoGuardado) {
        selectEstado.value = estadoGuardado;
        
        if (ubicacionesVenezuela[estadoGuardado]) {
          selectMunicipio.innerHTML = '<option value="" disabled selected>Elige el municipio</option>';
          Object.keys(ubicacionesVenezuela[estadoGuardado]).forEach(mun => {
            const option = document.createElement('option');
            option.value = mun;
            option.textContent = mun;
            selectMunicipio.appendChild(option);
          });
          selectMunicipio.disabled = false;
        }

        if (selectMunicipio && municipioGuardado) {
          selectMunicipio.value = municipioGuardado;

          if (ubicacionesVenezuela[estadoGuardado]?.[municipioGuardado]) {
            selectParroquia.innerHTML = '<option value="" disabled selected>Elige la parroquia</option>';
            ubicacionesVenezuela[estadoGuardado][municipioGuardado].forEach(parr => {
              const option = document.createElement('option');
              option.value = parr;
              option.textContent = parr;
              selectParroquia.appendChild(option);
            });
            selectParroquia.disabled = false;
          }
        }

        if (selectParroquia && parroquiaGuardada) {
          setTimeout(() => {
            selectParroquia.value = parroquiaGuardada;
          }, 50);
        }
      }

      if (previewFoto && bus.foto) {
        const rutaLimpia = bus.foto.replace(/\\/g, '/');
        previewFoto.src = rutaLimpia.startsWith('/') ? rutaLimpia : `/${rutaLimpia}`;
        previewFoto.style.display = 'block';
      }

      const btnSubmit = busForm?.querySelector('button[type="submit"]');
      if (btnSubmit) btnSubmit.textContent = 'Guardar Cambios';

    } catch (error) {
      console.error('Error al obtener datos del bus:', error);
      createNotification(true, 'No se pudieron cargar los datos del bus');
    }
  })();
}

// 6. EVENTO SUBMIT
busForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    let nombreFinal = inputNombre ? inputNombre.value.trim() : '';

    if (selectClasificacion?.value === 'colegio' && selectIniciales?.value) {
      nombreFinal = `${selectIniciales.value} ${nombreFinal}`;
    }

    const parroquiaValor = selectParroquia?.value || '';
    const formData = new FormData();

    formData.append('numeroBus', Number(inputNumeroBus?.value || 0));
    formData.append('entidad', selectClasificacion?.value || '');
    formData.append('nombreEntidad', nombreFinal);
    formData.append('lugarEntidad', parroquiaValor);
    formData.append('estado', selectEstado?.value || '');
    formData.append('municipio', selectMunicipio?.value || '');
    formData.append('parroquia', parroquiaValor);
    formData.append('cantidadNinos', Number(inputNinos?.value || 0));
    formData.append('cantidadAdultos', Number(inputAdultos?.value || 0));

    if (inputFoto?.files[0]) {
      formData.append('foto', inputFoto.files[0]);
    }

    if (editBusId) {
      await axios.put(`/api/buses/${editBusId}`, formData, { withCredentials: true });
      createNotification(false, 'Bus editado exitosamente');
    } else {
      await axios.post('/api/buses', formData, { withCredentials: true });
      createNotification(false, 'Bus guardado exitosamente');
    }

    setTimeout(() => {
      window.location.href = '/listBuses/';
    }, 1200);

  } catch (error) {
    console.error('Error al procesar el bus:', error);
    const mensajeError = error.response?.data?.error || 'Error al guardar los cambios del bus';
    createNotification(true, mensajeError);
  }
});

// Botón regresar
btnBack?.addEventListener('click', () => {
  window.location.href = '/listBuses/';
});