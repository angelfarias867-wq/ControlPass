// Función para crear confirmaciones flotantes personalizadas
export const createConfirmation = (message, onConfirm) => {
  const modal = document.createElement("div");
  modal.classList.add("custom-modal");

  modal.innerHTML = `
    <div class="modal-content">
      <p class="modal-message">${message}</p>
      <div class="modal-buttons">
        <button class="btn-cancel">Cancelar</button>
        <button class="btn-confirm">Aceptar</button>
      </div>
    </div>
  `;

  document.body.append(modal);

  const btnCancel = modal.querySelector(".btn-cancel");
  const btnConfirm = modal.querySelector(".btn-confirm");

  // Si el usuario cancela, cerramos el modal
  btnCancel.addEventListener("click", () => {
    modal.remove();
  });

  // Si el usuario acepta, cerramos el modal y ejecutamos la acción correspondiente
  btnConfirm.addEventListener("click", () => {
    modal.remove();
    onConfirm();
  });
};