document.addEventListener('DOMContentLoaded', async () => {
    const btnBack = document.getElementById('btn-volver');
  try {
    // Cuando el endpoint esté disponible en tu backend:
    // const { data } = await axios.get('/api/buses/reporte-momentaneo');

    // Datos estáticos de prueba basados en tu captura
    const data = {
      ninos: 1952,
      adultos: 682,
      total: 2634,
    };

    // Renderizar datos en pantalla
    document.querySelector('#val-ninos').textContent = data.ninos;
    document.querySelector('#val-adultos').textContent = data.adultos;
    document.querySelector('#val-total').textContent = data.total;
  } catch (error) {
    console.error('Error al cargar las estadísticas del reporte:', error);
  }
  
  btnBack.addEventListener('click', () => {
  window.location.pathname = '/configuration/';
});
});