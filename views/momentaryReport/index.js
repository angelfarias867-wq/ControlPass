document.addEventListener('DOMContentLoaded', async () => {
    const btnBack = document.getElementById('btn-volver');
  try {
    // Cuando el endpoint esté disponible en tu backend:
    // const { data } = await axios.get('/api/buses/reporte-momentaneo');

    // Datos estáticos de prueba basados en tu captura
    const data = {
      buses: 336,
      comunas: 87,
      colegios: 179,
      instituciones: 9,
      ministerios: 5,
      ninos: 1952,
      adultos: 682
    };

    // Renderizar datos en pantalla
    document.querySelector('#val-buses').textContent = data.buses;
    document.querySelector('#val-comunas').textContent = data.comunas;
    document.querySelector('#val-colegios').textContent = data.colegios;
    document.querySelector('#val-instituciones').textContent = data.instituciones;
    document.querySelector('#val-ministerios').textContent = data.ministerios;
    document.querySelector('#val-ninos').textContent = data.ninos;
    document.querySelector('#val-adultos').textContent = data.adultos;

  } catch (error) {
    console.error('Error al cargar las estadísticas del reporte:', error);
  }
  
  btnBack.addEventListener('click', () => {
  window.location.pathname = '/configuration/';
});
});