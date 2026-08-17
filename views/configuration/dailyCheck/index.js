const usersListContainer = document.querySelector('#users-list');
const totalBusesToday = document.querySelector('#total-buses-today');
const todayDate = document.querySelector('#today-date');

// Mostrar fecha actual formateada
todayDate.textContent = new Date().toLocaleDateString('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

async function loadDailyCheck() {
  try {
    const { data } = await axios.get('/api/daily-check');
    
    totalBusesToday.textContent = data.totalToday || 0;
    usersListContainer.innerHTML = '';

    if (!data.users || data.users.length === 0) {
      usersListContainer.innerHTML = '<p style="padding: 1rem; color: var(--text-muted); text-align: center;">No hay acreditaciones registradas hoy.</p>';
      return;
    }

    data.users.forEach(item => {
  const card = document.createElement('div');
  card.className = 'bus-card';
  card.innerHTML = `
    <div class="user-info">
      <div class="avatar-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div class="user-details">
        <span class="user-name">${item.name}</span>
        <span class="user-role">Acreditador</span>
      </div>
    </div>
    <div class="count-badge">${item.count} ${item.count === 1 ? 'bus' : 'buses'}</div>
  `;
  usersListContainer.appendChild(card);
});

  } catch (error) {
    console.error('Error cargando chequeo del día:', error);
    usersListContainer.innerHTML = '<p style="padding: 1rem; color: var(--danger-color); text-align: center;">Error al cargar datos.</p>';
  }
}

loadDailyCheck();