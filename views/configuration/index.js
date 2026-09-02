const adminSection = document.querySelector('#admin-section');
const roleBadge = document.querySelector('#user-role-badge');
const themeToggle = document.querySelector('#theme-toggle');
const btnLogout = document.getElementById('btn-logout');
const userAvatar = document.querySelector('#user-avatar');

  // Botones de administración
const btnChequeo = document.querySelector('#btn-chequeo-dia');
const btnReporteMomentaneo = document.querySelector('#btn-reporte-momentaneo');
const btnReporteFinal = document.querySelector('#btn-reporte-final');
const btnVerificacionPermisos = document.querySelector('#btn-verificacion-permisos');

import { createConfirmation } from '../components/alerts.js';

  // Obtener la sesión del usuario actual
  try {
    const role = localStorage.getItem('role');

  if (role === 'admin') {
    adminSection.classList.remove('hidden');
    roleBadge.textContent = 'Administrador';
  } else {
    roleBadge.textContent = 'Usuario';
  }
  } catch (error) {
    console.error('Error al verificar la sesión:', error);
    // Si la sesión no es válida o expiró, redirigimos al login
    window.location.href = '/';
  }

  // Lógica para el Modo Oscuro (Persistencia en LocalStorage)
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.querySelector('#theme-toggle');
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light') {
    themeToggle.checked = false;
    document.body.classList.add('light-mode');
  } else {
    themeToggle.checked = true;
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
  }

  themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  });
});

  // CARGA INICIAL DE DATA Y USUARIO
(async () => {
  try {
    const storedUser = localStorage.getItem('currentUser');
    console.log("Objeto crudo en localStorage:", storedUser);

    currentUser = storedUser ? JSON.parse(storedUser) : null;
    console.log("Usuario parseado:", currentUser);

    if (userAvatar && currentUser && (currentUser.name || currentUser.username)) {
      const name = currentUser.name || currentUser.username;
      userAvatar.textContent = name.charAt(0).toUpperCase();
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

  // EVENTO DE CIERRE DE SESIÓN
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    try {
      // Petición al backend para borrar la cookie de sesión
      await axios.get('/api/logout', { withCredentials: true });

      // Limpiar datos locales si los hubiera
      localStorage.removeItem('currentUser');

      // Redirigir al usuario al login
      window.location.pathname = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);

      if (error.response && error.response.status === 401) {
        window.location.pathname = '/';
      } else {
        alert('Hubo un problema al intentar cerrar sesión.');
      }
    }
  });
}

  // Listeners para los botones de Reportes del Admin (Placeholders para cuando los definamos)
  if (btnChequeo) {
    btnChequeo.addEventListener('click', () => {
      window.location.href = '/dailyCheck/';
    });
  }

  if (btnReporteMomentaneo) {
  btnReporteMomentaneo.addEventListener('click', () => {
    window.location.href = '/momentaryReport/'; 
  });
}

if (btnReporteFinal) {
  btnReporteFinal.addEventListener('click', (e) => {
    createConfirmation('¿Seguro que quieres recibir el Reporte Final?', () => {
      window.location.href = '/finalReport/';
    });
  });
}

if (btnVerificacionPermisos) {
  btnVerificacionPermisos.addEventListener('click', () => {
    window.location.href = '/permissionVerification/'; 
  });
}