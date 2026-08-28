const emailImput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const form = document.getElementById("form");
const errorText = document.getElementById("error-text");

import { createNotification } from '../components/notifications.js';

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const user = {
      email: emailImput.value,
      password: passwordInput.value
    };

    // 1. Hacemos la petición al login
    const { data } = await axios.post("/api/users/login", user); 
    // (O /api/login según como tengas definida tu ruta)

    // 2. Guardamos directamente la respuesta del backend
    localStorage.setItem('currentUser', JSON.stringify(data));
    
    if (data.role) {
      localStorage.setItem("role", data.role);
    }

    // 3. Redirigimos
    window.location.pathname = data.redirectUrl || '/listBuses/';

  } catch (error) {
    createNotification("Usuario/contraseña incorrectos o permiso no autorizado", "error");
    console.log(error);
  }
});