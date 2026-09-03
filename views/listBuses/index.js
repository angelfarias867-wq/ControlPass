const busListContainer = document.querySelector('#bus-list');
const emptyState = document.querySelector('#empty-state');
const btnConfig = document.querySelector('#btn-config');
const btnNewBus = document.querySelector('#btn-new-bus');
const searchInput = document.getElementById('bus-search-input');
const userAvatar = document.querySelector('#user-avatar');

import { createConfirmation } from '../components/alerts.js';

// Variable global para almacenar el usuario activo
let currentUser = null;

// VALIDACIÓN ESTRICTA DE PERMISOS
const canEditOrDelete = (bus) => {
  if (!currentUser) return false;

  const userRole = (currentUser.role || currentUser.tipo || '').toLowerCase();
  if (userRole === 'admin' || userRole === 'administrador') {
    return true;
  }

  const activeUserName = (currentUser.name || currentUser.username || currentUser.nombre || '').trim().toLowerCase();
  const busOwner = (bus.usuario || '').trim().toLowerCase();

  return activeUserName === busOwner;
};

// BUSCADOR
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const busCards = document.querySelectorAll('.bus-card');

    busCards.forEach(card => {
      const cardText = card.textContent.toLowerCase();
      if (cardText.includes(query)) {
        card.style.display = ''; 
      } else {
        card.style.display = 'none'; 
      }
    });
  });
}

// LÓGICA DE PULSACIÓN LARGA (LONG PRESS) CON VERIFICACIÓN DE SEGURIDAD
const optionspress = (cardElement, bus) => {
  let timer;

  const startPress = (e) => {
    // Si no tiene permisos, se detiene inmediatamente y no muestra nada
    if (!canEditOrDelete(bus)) {
      console.log("Acción denegada: No eres el propietario de este bus.");
      return;
    }

    timer = setTimeout(() => {
      mostrarOpcionesBus(bus, cardElement);
    }, 600);
  };

  const cancelPress = () => {
    clearTimeout(timer);
  };

  cardElement.addEventListener('touchstart', startPress);
  cardElement.addEventListener('touchend', cancelPress);

  cardElement.addEventListener('mousedown', startPress);
  cardElement.addEventListener('mouseup', cancelPress);
  cardElement.addEventListener('mouseleave', cancelPress);
};

// MOSTRAR MENÚ FLOTANTE DE OPCIONES (EDITAR / ELIMINAR)
const mostrarOpcionesBus = (bus, cardElement) => {
  // Doble seguridad por si acaso
  if (!canEditOrDelete(bus)) return;

  const existingMenu = document.querySelector('.bus-options-menu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.classList.add('bus-options-menu');
  menu.innerHTML = `
    <button class="btn-edit">Editar</button>
    <button class="btn-delete">Eliminar</button>
  `;

  cardElement.append(menu);

  // ACCIÓN ELIMINAR (DELETE) CON ALERTA PERSONALIZADA
  menu.querySelector('.btn-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    menu.remove();

    createConfirmation('¿Estás seguro de que deseas eliminar este bus?', async () => {
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
    });
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

// MODAL PARA AMPLIAR LA FOTO DEL BUS CON INFORMACIÓN COMPLETA
const abrirModalFoto = (bus) => {
  const modal = document.createElement('div');
  modal.classList.add('photo-modal');

  const nombreCreador = bus.usuario || 'Desconocido';

  modal.innerHTML = `
    <div class="photo-modal-content">
      <button class="photo-close-btn">&times;</button>
      <img src="/${bus.foto}" alt="Bus ampliado" class="modal-big-image">
      
      <div class="modal-photo-info">
        <h2 class="driver-name">${nombreCreador}</h2>
        
        <div class="card-row">
          <span>N: ${bus.numeroBus}</span>
          <span>${bus.entidad ? bus.entidad.toUpperCase() : ''}</span>
        </div>
        
        <p class="institution">${bus.nombreEntidad || ''} (${bus.lugarEntidad || ''})</p>
        
        <div class="card-row metrics">
          <span>Niños: ${bus.cantidadNinos}</span>
          <span>Adultos: ${bus.cantidadAdultos}</span>
        </div>
      </div>
    </div>
  `;

  document.body.append(modal);

  modal.querySelector('.photo-close-btn').addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};

// FUNCIÓN PARA CREAR EL ELEMENTO HTML DE LA TARJETA
const createBusCard = (bus) => {
  const article = document.createElement('article');
  article.id = bus._id || bus.id;
  article.classList.add('bus-card');

  const nombreCreador = bus.usuario || 'Desconocido';

  article.innerHTML = `
    ${bus.foto ? `<div class="bus-photo-container" style="margin: 8px 0; cursor: pointer;"><img src="/${bus.foto}" alt="Foto del bus" class="bus-thumbnail" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;"></div>` : ''}

    <h2 class="driver-name">${nombreCreador}</h2>

    <div class="card-row">
      <span>N: ${bus.numeroBus}</span>
      <span>${bus.entidad ? bus.entidad.toUpperCase() : ''}</span>
    </div>
    <p class="institution">${bus.nombreEntidad} (${bus.lugarEntidad})</p>
    <div class="card-row metrics">
      <span>Niños: ${bus.cantidadNinos}</span>
      <span>Adultos: ${bus.cantidadAdultos}</span>
    </div>
  `;

  // Evento para abrir la foto en grande al hacer clic
  if (bus.foto) {
    const imgThumbnail = article.querySelector('.bus-thumbnail');
    imgThumbnail.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirModalFoto(bus);
    });
  }

  optionspress(article, bus);

  return article;
};

// CARGA INICIAL DE DATA Y USUARIO
(async () => {
  try {
    const storedUser = localStorage.getItem('currentUser');
    currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (userAvatar && currentUser && (currentUser.name || currentUser.username || currentUser.nombre || currentUser.nombreCompleto || currentUser.email)) {
      const name = currentUser.name || currentUser.username || currentUser.nombre || currentUser.nombreCompleto || currentUser.email;
      userAvatar.textContent = name.charAt(0).toUpperCase();
    }

    const { data: buses } = await axios.get('/api/buses', { withCredentials: true });

    if (buses.length > 0) {
      if (emptyState) emptyState.style.display = 'none';

      // ORDENAMIENTO NUMÉRICO DE MENOR A MAYOR
      buses.sort((a, b) => Number(a.numeroBus) - Number(b.numeroBus));

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

// EVENTOS DE NAVEGACIÓN
btnNewBus.addEventListener('click', () => {
  window.location.pathname = '/newBus';
});

btnConfig.addEventListener('click', () => {
  window.location.pathname = '/configuration';
});