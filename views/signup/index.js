const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,16}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+(\s+[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+)*$/;

const form = document.querySelector("#form");
const nameInput = document.querySelector("#name-input");
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const confirmPasswordInput = document.querySelector("#match-input");
const formBtn = document.querySelector("#form-btn");
const notification = document.querySelector("#notification")

//import { createNotification } from "/components/notification.js";

let nameTest = false;
let emailTest = false;
let passwordTest = false;
let matchTest = false;

const validation = (element, validationTest) => {
  //Si todos los inputs estan validades el boton se activa
  formBtn.disabled = nameTest && emailTest && passwordTest && matchTest ? false : true;

if (element.value === '') {
   element.classList.remove('border-emerald-500', 'focus:border-emerald-500', 'focus:ring-emerald-500/10','border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-500/10');
    element.classList.add('border-zinc-800', 'focus:border-purple-500', 'focus:ring-purple-500/10');

} else if (validationTest) {
  element.classList.remove('border-zinc-800', 'focus:border-purple-500', 'focus:ring-purple-500/10',
      'border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-500/10');
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

emailInput.addEventListener("input", (e) => {
  emailTest = EMAIL_REGEX.test(e.target.value);
  validation(emailInput, emailTest);
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
      email: emailInput.value,
      password: passwordInput.value,
    };

    // console.log(newUser);
    //Se envia el usuario al backend
    const {data} = await axios.post("/api/users", newUser);

    // console.log(data);

     //createNotification(false, data);
    //setTimeout(() => {
    // notification.innerHTML = ""
    //}, 5000);

    //Limpieza del formulario
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = ""

//Devuelve los inputs a su estado inicial, osea deshabilita el boton
validation(nameInput, false)
validation(emailInput, false)
validation(passwordInput, false)
validation(confirmPasswordInput, false)

  } catch (error) {
    //Llama a la notificacion pero como error
    //createNotification(true, error.response.data.error);
    //setTimeout(() => {
    // notification.innerHTML = ""
    //}, 5000);
  }
});
