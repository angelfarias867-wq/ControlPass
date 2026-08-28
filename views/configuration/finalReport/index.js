const btnDescargar = document.getElementById('btn-descargar');

// 1. Cargar las estadísticas reales al abrir la página
(async () => {
  try {
    const { data } = await axios.get('/api/buses/finalReport', { withCredentials: true });

    document.querySelector('#val-ninos').textContent = data.ninos || 0;
    document.querySelector('#val-adultos').textContent = data.adultos || 0;
    document.querySelector('#val-total').textContent = data.total || 0;
    document.querySelector('#val-buses').textContent = data.buses || 0;
    
  } catch (error) {
    console.error('Error al cargar las estadísticas del reporte final:', error);
    // Si hay un error, mostramos guiones para que no se quede el número viejo
    document.querySelector('#val-ninos').textContent = '-';
    document.querySelector('#val-adultos').textContent = '-';
    document.querySelector('#val-total').textContent = '-';
    document.querySelector('#val-buses').textContent = '-';
  }
})();

// 2. Lógica para descargar el Excel al hacer clic
btnDescargar?.addEventListener('click', async () => {
  try {
    // Efecto visual de carga para que el usuario sepa que está procesando
    const textoOriginal = btnDescargar.textContent;
    btnDescargar.textContent = 'Descargando...';
    btnDescargar.style.pointerEvents = 'none';

    // Petición al backend pidiendo el archivo Excel
    const response = await axios.get('/api/buses/exportExcel', { 
      withCredentials: true,
      responseType: 'blob' // Esto es vital para que JS lo trate como un archivo
    });

    // Crear un enlace temporal para forzar la descarga en el navegador
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Nombre exacto con el que se guardará el archivo
    link.setAttribute('download', 'Reporte_Final_ControlPass.xlsx'); 
    
    document.body.appendChild(link);
    link.click();
    
    // Limpieza de memoria
    link.remove();
    window.URL.revokeObjectURL(url);
    
    // Restaurar el botón a su estado normal
    btnDescargar.textContent = textoOriginal;
    btnDescargar.style.pointerEvents = 'auto';

  } catch (error) {
    console.error('Error al descargar el archivo xls:', error);
    
    // Si la ruta tira el error 501 que dejamos, mostrará este mensaje temporal
    btnDescargar.textContent = 'En construcción...';
    btnDescargar.style.backgroundColor = '#3b4a54'; 
    
    setTimeout(() => {
      btnDescargar.textContent = 'Descargar';
      btnDescargar.style.pointerEvents = 'auto';
      btnDescargar.style.backgroundColor = 'transparent';
    }, 3000);
  }
});