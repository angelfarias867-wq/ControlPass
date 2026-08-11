const busForm = document.querySelector('#bus-form');
const btnBack = document.querySelector('#btn-back');
const userAvatar = document.querySelector('#user-avatar');
const inputNumeroBus = document.querySelector('#numeroBus');
const inputPlaca = document.querySelector('#placa');
const selectClasificacion = document.querySelector('#clasificacionEntidad');
const selectIniciales = document.querySelector('#inicialesColegio');
const inputNombre = document.querySelector('#nombreEntidad');
const selectEstado = document.querySelector('#estado');
const selectMunicipio = document.querySelector('#municipio');
const selectParroquia = document.querySelector('#parroquia');
const inputNinos = document.querySelector('#cantidadNinos');
const inputAdultos = document.querySelector('#cantidadAdultos');

const urlParams = new URLSearchParams(window.location.search);
const editBusId = urlParams.get('edit');

import { createNotification } from '../components/notifications.js';

// Base de datos local para Estados, Municipios y Parroquias
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
    "Acevedo": [ "Caucagua", "Araguita", "Arévalo González", "Capaya", "El Café", "Marizapa", "Panaquire", "Ribas"],
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
  "Guarico": {
    "Juan Germán Roscio": ["San Juan de los Morros", "Parapara"],
    "Infante": ["Valle de la Pascua", "Espino"]
  },
  "Anzoategui": {
    "Simón Bolívar": ["Barcelona", "El Carmen", "San Cristóbal"],
    "Juan Antonio Sotillo": ["Puerto La Cruz", "Pozuelos"]
  },
  "Distrito Capital": {
    "Libertador": ["23 de Enero", "Altagracia", "Antímano", "Caricuao", "Catedral", "Coche", "El Junquito", "El Paraíso", "El Recreo", "El Valle", "La Candelaria", "La Pastora", "La Vega", "Macarao", "San Agustín", "San Bernardino", "San José", "San Juan", "Santa Rosalía",  "Santa Teresa", "Sucre (Catia)", "El Recreo"]
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

// 3. CAMBIO DE ESTADO -> LLENAR MUNICIPIOS
selectEstado?.addEventListener('change', () => {
  const estadoSeleccionado = selectEstado.value;
  selectMunicipio.innerHTML = '<option value="" disabled selected>Elige el municipio</option>';
  selectParroquia.innerHTML = '<option value="" disabled selected>Elige la parroquia</option>';
  selectParroquia.disabled = true;

  if (estadoSeleccionado && ubicacionesVenezuela[estadoSeleccionado]) {
    const municipios = Object.keys(ubicacionesVenezuela[estadoSeleccionado]);
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

// 4. CAMBIO DE MUNICIPIO -> LLENAR PARROQUIAS
selectMunicipio?.addEventListener('change', () => {
  const estadoSeleccionado = selectEstado.value;
  const municipioSeleccionado = selectMunicipio.value;
  selectParroquia.innerHTML = '<option value="" disabled selected>Elige la parroquia</option>';

  if (ubicacionesVenezuela[estadoSeleccionado]?.[municipioSeleccionado]) {
    const parroquias = ubicacionesVenezuela[estadoSeleccionado][municipioSeleccionado];
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
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const { data: bus } = await axios.get(`/api/buses/${editBusId}`, { withCredentials: true });

      if (inputNumeroBus) inputNumeroBus.value = bus.numeroBus ?? '';
      if (inputPlaca) inputPlaca.value = bus.placa ?? '';
      if (inputNombre) inputNombre.value = bus.nombreEntidad ?? '';
      if (inputNinos) inputNinos.value = bus.cantidadNinos ?? 0;
      if (inputAdultos) inputAdultos.value = bus.cantidadAdultos ?? 0;

      if (selectEstado && bus.estado) {
        selectEstado.value = bus.estado;
        selectEstado.dispatchEvent(new Event('change'));

        if (selectMunicipio && bus.municipio) {
          selectMunicipio.value = bus.municipio;
          selectMunicipio.dispatchEvent(new Event('change'));

          if (selectParroquia && bus.parroquia) {
            selectParroquia.value = bus.parroquia;
          }
        }
      }

      const btnSubmit = busForm?.querySelector('button[type="submit"]');
      if (btnSubmit) btnSubmit.textContent = 'Guardar Cambios';

    } catch (error) {
      console.error('Error al obtener datos del bus:', error);
      createNotification(true, 'No se pudieron cargar los datos del bus');
    }
  });
}

// 6. UN SOLO UNIFICADO SUBMIT (POST O PUT)
busForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  let nombreFinal = inputNombre.value.trim();
  if (selectClasificacion?.value === 'colegio' && selectIniciales?.value) {
    nombreFinal = `${selectIniciales.value} ${nombreFinal}`;
  }

  const busPayload = {
    numeroBus: Number(inputNumeroBus.value),
    placa: inputPlaca.value.toUpperCase().trim(),
    nombreEntidad: nombreFinal,
    lugarEntidad: selectParroquia.value,
    estado: selectEstado.value,
    municipio: selectMunicipio.value,
    parroquia: selectParroquia.value,
    cantidadNinos: Number(inputNinos.value),
    cantidadAdultos: Number(inputAdultos.value)
  };

  try {
    if (editBusId) {
      // Editar
      await axios.put(`/api/buses/${editBusId}`, busPayload, { withCredentials: true });
      createNotification(false, 'Bus editado exitosamente');
    } else {
      // Crear
      await axios.post('/api/buses', busPayload, { withCredentials: true });
      createNotification(false, 'Bus guardado exitosamente');
    }

    setTimeout(() => {
      window.location.pathname = '/listBuses/';
    }, 1200);

  } catch (error) {
    console.error('Error al procesar el bus:', error);
    createNotification(true, error.response?.data?.error || 'Error al guardar el bus');
  }
});

// Botón de regresar
btnBack?.addEventListener('click', () => {
  window.location.pathname = '/listBuses/';
});