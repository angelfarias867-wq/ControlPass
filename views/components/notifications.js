const body = document.querySelector("#notification");

export const createNotification = (isError, message) => {
  if (!body) return;

  const div = document.createElement("div");
  const notificationType = isError ? "error" : "success";
  const icon = isError ? "⚠️" : "✅";
  const title = isError ? "Error" : "Éxito";

  div.innerHTML = `
    <div class="notification-card ${notificationType}">
      <span class="notification-icon">${icon}</span>
      <div class="notification-content">
        <span class="notification-title">${title}</span>
        <p class="notification-message">${message}</p>
      </div>
    </div>
  `;

  body.append(div);

  // Remueve la notificación del DOM después de 3.5 segundos
  setTimeout(() => {
    div.remove();
  }, 3500);
};