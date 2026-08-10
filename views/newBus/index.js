// Referencias del DOM
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
    "Cristóbal Rojas": ["Charallave", "Las Brisas"],
    "Guaicaipuro": ["Los Teques", "San Pedro", "El Jarillo"],
    "Sucre": ["Petare", "Leoncio Martínez", "El Recreo"]
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
    "Libertador": ["Catedral", "Altagracia", "El Recreo", "Sucre (Catia)", "Antímano", "La Vega"]
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

// 2. LÓGICA DE INICIALES (Sólo si se selecciona 'Colegio')
selectClasificacion.addEventListener('change', () => {
  if (selectClasificacion.value === 'colegio') {
    selectIniciales.disabled = false;
    selectIniciales.required = true;
  } else {
    selectIniciales.disabled = true;
    selectIniciales.required = false;
    selectIniciales.selectedIndex = 0; // Reiniciar
  }
});

// 3. CAMBIO DE ESTADO -> LLENAR MUNICIPIOS
selectEstado.addEventListener('change', () => {
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
selectMunicipio.addEventListener('change', () => {
  const estadoSeleccionado = selectEstado.value;
  const municipioSeleccionado = selectMunicipio.value;
  selectParroquia.innerHTML = '<option value="" disabled selected>Elige la parroquia</option>';

  if (ubicacionesVenezuela[estadoSeleccionado] && ubicacionesVenezuela[estadoSeleccionado][municipioSeleccionado]) {
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

// 5. ENVÍO DEL FORMULARIO
busForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Si es colegio, concatenamos las iniciales con el nombre (ej: "U.E.N. Simón Bolívar")
  let nombreFinal = inputNombre.value.trim();
  if (selectClasificacion.value === 'colegio' && selectIniciales.value) {
    nombreFinal = `${selectIniciales.value} ${nombreFinal}`;
  }

  const busPayload = {
    numeroBus: Number(inputNumeroBus.value),
    placa: inputPlaca.value.toUpperCase().trim(),
    nombreEntidad: nombreFinal,
    lugarEntidad: selectParroquia.value, // La tarjeta del listado muestra solo la Parroquia
    estado: selectEstado.value,          // Guardado para el reporte final
    municipio: selectMunicipio.value,    // Guardado para el reporte final
    parroquia: selectParroquia.value,    // Guardado para el reporte final
    cantidadNinos: Number(inputNinos.value),
    cantidadAdultos: Number(inputAdultos.value)
  };

  try {
    await axios.post('/api/buses', busPayload, { withCredentials: true });
    window.location.pathname = '/listBuses/';
  } catch (error) {
    console.error('Error al guardar el bus:', error);
    alert('Ocurrió un error al guardar el bus');
  }
});

// Botón de regresar
btnBack.addEventListener('click', () => {
  window.location.pathname = '/listBuses/';
});