const adminSection = document.querySelector('#admin-section');
const roleBadge = document.querySelector('#user-role-badge');
const btnLogout = document.querySelector('#btn-logout');
const themeToggle = document.querySelector('#theme-toggle');

  // Botones de administración
const btnChequeo = document.querySelector('#btn-chequeo-dia');
const btnReporteMomentaneo = document.querySelector('#btn-reporte-momentaneo');
const btnReporteFinal = document.querySelector('#btn-reporte-final');
const btnVerificacionPermisos = document.querySelector('#btn-verificacion-permisos');

import { createConfirmation } from '../components/alerts.js';

  // 1. Obtener la sesión del usuario actual
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

  // 2. Lógica para Cerrar Sesión
  btnLogout.addEventListener('click', async () => {
    try {
      // Petición al backend para limpiar la cookie de sesión
      await axios.post('/api/logout');
      window.location.href = '/';
    } catch (error) {
      // Si no existe el endpoint /api/logout, forzamos redirección
      window.location.href = '/';
    }
  });

  // 3. Lógica para el Modo Oscuro (Persistencia en LocalStorage)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    themeToggle.checked = false;
    document.body.classList.add('light-mode');
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

  // 4. Listeners para los botones de Reportes del Admin (Placeholders para cuando los definamos)
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