import { createNotification } from '../../components/notifications.js'; // Ajusta la ruta según tu estructura de carpetas
import { createConfirmation } from '../../components/alerts.js';

const pendingUsersContainer = document.querySelector('#pending-users-list');

async function loadPendingUsers() {
  try {
    // Petición al backend para obtener los usuarios pendientes (ajusta la ruta del endpoint si es diferente)
    const { data } = await axios.get('/api/users/admin/pending-users');

    pendingUsersContainer.innerHTML = '';

    if (!data.users || data.users.length === 0) {
      pendingUsersContainer.innerHTML = `
        <div class="empty-card">
          <p>No hay usuarios en espera de confirmación.</p>
        </div>
      `;
      return;
    }

    data.users.forEach(user => {
      const userId = user.id;

      const card = document.createElement('div');
      card.className = 'bus-card';

      card.innerHTML = `
    <div class="user-info">
      <div class="user-details">
        <span class="user-name">${user.name}</span>
        <span class="user-role">${user.email}</span>
      </div>
    </div>
    <div class="action-buttons">
      ${user.verified
          ? '<span style="color: var(--accent-green); font-weight: 600; font-size: 0.85rem;">Aprobado</span>'
          : `
          <button class="btn-confirm btn-action-approve" data-id="${userId}">Aprobar</button>
          <button class="btn-cancel btn-action-reject" data-id="${userId}">Rechazar</button>
        `
        }
    </div>`;

      pendingUsersContainer.appendChild(card);
    });

    attachActionListeners();

  } catch (error) {
    console.error('Error al cargar usuarios pendientes:', error);
    pendingUsersContainer.innerHTML = '<p style="padding: 1rem; color: var(--danger-color); text-align: center;">Error al cargar la lista.</p>';
  }
}

function attachActionListeners() {
  document.querySelectorAll('.btn-action-approve').forEach(button => {
    button.addEventListener('click', (e) => {
      const userId = e.currentTarget.getAttribute('data-id');
      console.log('ID del usuario a aprobar:', userId); // <--- Mira esto en la consola del navegador

      createConfirmation('¿Seguro que deseas aprobar a este usuario?', async () => {
        try {
          await axios.post(`/api/users/admin/approve-user/${userId}`);
          createNotification(false, 'Usuario aprobado exitosamente');
          loadPendingUsers();
        } catch (err) {
          createNotification(true, 'No se pudo aprobar al usuario');
        }
      });
    });
  });

  document.querySelectorAll('.btn-action-reject').forEach(button => {
    button.addEventListener('click', (e) => {
      const userId = e.currentTarget.getAttribute('data-id');
      console.log('ID del usuario a rechazar:', userId); // <--- Mira esto en la consola

      createConfirmation('¿Seguro que deseas rechazar/eliminar esta solicitud?', async () => {
        try {
          await axios.post(`/api/users/admin/reject-user/${userId}`);
          createNotification(false, 'Solicitud rechazada');
          loadPendingUsers();
        } catch (err) {
          createNotification(true, 'No se pudo procesar la solicitud');
        }
      });
    });
  });
}
// Cargar la lista al iniciar la vista
loadPendingUsers();