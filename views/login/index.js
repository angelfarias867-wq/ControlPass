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
    };
    const { data } = await axios.post("/api/login", user);

    if (data.user) {
      localStorage.setItem("currentUser", JSON.stringify(data.user));
    }
    if (data.role) {
      localStorage.setItem("role", data.role);
    }

    window.location.pathname = data.redirectUrl || '/listBuses/';
  } catch (error) {
    console.log(error);
  }
});