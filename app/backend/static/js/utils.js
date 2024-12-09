export function toggleModal(modalId, show = true) {
    const modal = document.getElementById(modalId);
    modal.classList.toggle("hidden", !show);
  }
  