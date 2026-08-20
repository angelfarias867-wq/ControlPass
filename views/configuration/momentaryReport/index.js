const btnBack = document.getElementById('btn-volver');

(async () => {
  try {
    const { data } = await axios.get('/api/buses/momentaryReport', { withCredentials: true });

    document.querySelector('#val-ninos').textContent = data.ninos;
    document.querySelector('#val-adultos').textContent = data.adultos;
    document.querySelector('#val-total').textContent = data.total;
  } catch (error) {
    console.error('Error al cargar las estadísticas del reporte:', error);
  }
})();

btnBack.addEventListener('click', () => {
  window.location.pathname = '/configuration/';
});