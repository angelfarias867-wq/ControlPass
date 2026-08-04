const navbar = document.querySelector('#navbar');

const createNavSignup = () => {
    navbar.innerHTML = `
      <div class="wa-nav-container">
        <div class="wa-logo-wrapper">
          <img src="/img/logo.png" alt="ControlPass Logo" style="height: 80px; width: auto; object-fit: contain;" />
        </div>

        <!-- Versión Mobile -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="wa-menu-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>

        <div class="wa-mobile-menu hidden">
          <a href="/login" class="wa-btn">Iniciar Sesión</a>
        </div>
                                  
        <!-- Versión Escritorio (se quitó la barra final) -->
        <div class="wa-desktop-menu">
          <a href="/login" class="wa-btn">Iniciar Sesión</a>
        </div>
      </div>
    `;
};

const createNavLogin = () => {
    navbar.innerHTML = `
      <div class="wa-nav-container">
        <div class="wa-logo-wrapper">
          <img src="/img/logo.png" alt="ControlPass Logo" style="height: 80px; width: auto; object-fit: contain;" />
        </div>

        <!-- Versión Mobile -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="wa-menu-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>

        <div class="wa-mobile-menu hidden">
          <a href="/signup" class="wa-btn wa-btn-mobile">Registrarse</a>
        </div>
                                  
        <!-- Versión Escritorio (se quitó la barra final) -->
        <div class="wa-desktop-menu">
          <a href="/signup" class="wa-btn">Registrarse</a>
        </div>
      </div>
    `;
};

const path = window.location.pathname;

if (path.includes('/signup')) {
    createNavSignup();
} else if (path.includes('/login') || path === '/' || path.endsWith('index.html')) {
    createNavLogin();
}

const navBtn = navbar.querySelector('.wa-menu-icon');

if (navBtn) {
    navBtn.addEventListener('click', () => {
        const menuMobile = navbar.querySelector('.wa-mobile-menu');
        
        if (!navBtn.classList.contains('active')) {
            navBtn.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />`;
            navBtn.classList.add('active');
            menuMobile.classList.remove('hidden');
            menuMobile.classList.add('flex');
        } else {
            navBtn.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />`;
            navBtn.classList.remove('active');
            menuMobile.classList.add('hidden');
            menuMobile.classList.remove('flex');
        }
    });
}