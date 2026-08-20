const busListContainer = document.querySelector('#bus-list');
const emptyState = document.querySelector('#empty-state');
const btnConfig = document.querySelector('#btn-config');
const btnNewBus = document.querySelector('#btn-new-bus');
const userAvatar = document.querySelector('#user-avatar');


// Variable global para almacenar el usuario activo
let currentUser = null;

const canEditOrDelete = (bus) => {
  if (!currentUser) return false;

  const activeUserName = (currentUser.name || currentUser.username || '').trim();
  const busOwner = (bus.usuario || '').trim();

  // Retorna true ÚNICAMENTE si los nombres coinciden
  return activeUserName === busOwner;
};

// 1. LÓGICA DE PULSACIÓN LARGA (LONG PRESS) PARA EDITAR Y ELIMINAR
const optionspress = (cardElement, bus) => {
  let timer;

  const startPress = () => {
    // Si no es el creador directo del bus, no se activa el menú
    if (!canEditOrDelete(bus)) return;

    timer = setTimeout(() => {
      mostrarOpcionesBus(bus, cardElement);
    }, 600);
  };

  const cancelPress = () => {
    clearTimeout(timer);
  };

  cardElement.addEventListener('touchstart', startPress);
  cardElement.addEventListener('touchend', cancelPress);
  cardElement.addEventListener('touchmove', cancelPress);

  cardElement.addEventListener('mousedown', startPress);
  cardElement.addEventListener('mouseup', cancelPress);
  cardElement.addEventListener('mouseleave', cancelPress);
};

// 2. MOSTRAR MENÚ FLOTANTE DE OPCIONES (EDITAR / ELIMINAR)
const mostrarOpcionesBus = (bus, cardElement) => {
  const existingMenu = document.querySelector('.bus-options-menu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.classList.add('bus-options-menu');
  menu.innerHTML = `
    <button class="btn-edit">Editar</button>
    <button class="btn-delete">Eliminar</button>
  `;

  cardElement.append(menu);

  // ACCIÓN ELIMINAR (DELETE)
  menu.querySelector('.btn-delete').addEventListener('click', async (e) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar este bus?')) {
      try {
        await axios.delete(`/api/buses/${bus._id || bus.id}`, { withCredentials: true });
        cardElement.remove();

        if (busListContainer.querySelectorAll('.bus-card').length === 0) {
          if (emptyState) emptyState.style.display = 'block';
        }
      } catch (error) {
        console.error('Error al eliminar el bus:', error);
        alert(error.response?.data?.error || 'No tienes permisos para realizar esta acción');
      }
    }
  });

  // ACCIÓN EDITAR
  menu.querySelector('.btn-edit').addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = `/newBus?edit=${bus._id || bus.id}`;
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', function closeMenu(e) {
    if (!cardElement.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });
};

// 3. FUNCIÓN PARA CREAR EL ELEMENTO HTML DE LA TARJETA
const createBusCard = (bus) => {
  const article = document.createElement('article');
  article.id = bus._id || bus.id;
  article.classList.add('bus-card');

  article.innerHTML = `
    <h2 class="driver-name">${bus.usuario}</h2>
    <div class="card-row">
      <span>N: ${bus.numeroBus}</span>
      <span>Placa: ${bus.placa}</span>
    </div>
    <p class="institution">${bus.nombreEntidad} (${bus.lugarEntidad})</p>
    <div class="card-row metrics">
      <span>Niños: ${bus.cantidadNinos}</span>
      <span>Adultos: ${bus.cantidadAdultos}</span>
    </div>
  `;

  optionspress(article, bus);

  return article;
};

// 4. CARGA INICIAL DE DATOS (AUTOEJECUTABLE ASYNC)
(async () => {
  try {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (userAvatar && currentUser && currentUser.name) {
      userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    }

    const { data: buses } = await axios.get('/api/buses', { withCredentials: true });

    if (buses.length > 0) {
      if (emptyState) emptyState.style.display = 'none';

      buses.forEach(bus => {
        const busCard = createBusCard(bus);
        busListContainer.append(busCard);
      });
    } else {
      if (emptyState) emptyState.style.display = 'block';
    }

  } catch (error) {
    console.log("Error al cargar los buses:", error);
  }
})();

// 5. EVENTOS DE NAVEGACIÓN
btnNewBus.addEventListener('click', () => {
  window.location.pathname = '/newBus';
});

btnConfig.addEventListener('click', () => {
  window.location.pathname = '/configuration';
});