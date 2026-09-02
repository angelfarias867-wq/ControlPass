const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,16}$/;
const NAME_REGEX = /^[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+(\s+[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+)*$/;

const form = document.querySelector("#form");
const nameInput = document.querySelector("#name-input");
const passwordInput = document.querySelector("#password-input");
const confirmPasswordInput = document.querySelector("#match-input");
const formBtn = document.querySelector("#form-btn");
const notification = document.querySelector("#notification");

import { createNotification } from '../components/notifications.js';

let nameTest = false;
let passwordTest = false;
let matchTest = false;

const validation = (element, validationTest) => {
  // Ahora solo valida nombre, contraseña y confirmación para activar el botón
  formBtn.disabled = nameTest && passwordTest && matchTest ? false : true;

  if (element.value === '') {
    element.classList.remove('border-emerald-500', 'focus:border-emerald-500', 'focus:ring-emerald-500/10','border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-500/10');
    element.classList.add('border-zinc-800', 'focus:border-purple-500', 'focus:ring-purple-500/10');
  } else if (validationTest) {
    element.classList.remove('border-zinc-800', 'focus:border-purple-500', 'focus:ring-purple-500/10', 'border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-500/10');
    element.classList.add('border-emerald-500', 'focus:border-emerald-500', 'focus:ring-emerald-500/10');
  } else {
    element.classList.remove('border-zinc-800', 'focus:border-purple-500', 'focus:ring-purple-500/10','border-emerald-500', 'focus:border-emerald-500', 'focus:ring-emerald-500/10');
    element.classList.add('border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-500/10');
  }
};

nameInput.addEventListener("input", (e) => {
  nameTest = NAME_REGEX.test(e.target.value);
  validation(nameInput, nameTest);
});

passwordInput.addEventListener("input", (e) => {
  passwordTest = PASSWORD_REGEX.test(e.target.value);
  matchTest = e.target.value === confirmPasswordInput.value;
  validation(passwordInput, passwordTest);
  validation(confirmPasswordInput, matchTest);
});

confirmPasswordInput.addEventListener("input", (e) => {
  matchTest = e.target.value === passwordInput.value;
  validation(confirmPasswordInput, matchTest);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const newUser = {
      name: nameInput.value,
      password: passwordInput.value,
    };

    // Se envia el usuario al backend (sin email)
    const { data } = await axios.post("/api/users", newUser);

    createNotification(false, data);
    setTimeout(() => {
      notification.innerHTML = "";
    }, 5000);

    // Limpieza del formulario
    nameInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";

    // Devuelve los inputs a su estado inicial y deshabilita el boton
    validation(nameInput, false);
    validation(passwordInput, false);
    validation(confirmPasswordInput, false);

    createNotification(false, '¡Usuario registrado exitosamente!');

    setTimeout(() => {
      window.location.pathname = '/';
    }, 2000);

  } catch (error) {
    createNotification(true, error.response?.data?.error || 'Error en el servidor');
    setTimeout(() => {
      notification.innerHTML = "";
    }, 5000);
  }
});