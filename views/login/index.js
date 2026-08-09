const emailImput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const form = document.getElementById("form");
const errorText = document.getElementById("error-text");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const user = {
    email: emailImput.value,
    password: passwordInput.value
    }
    // console.log(user);
    await axios.post("/api/login", user);
    window.location.pathname = `/todos/`; // Redirigir a la página de todos después del inicio de sesión exitoso
  } catch (error) {
    console.log(error)
  }
});