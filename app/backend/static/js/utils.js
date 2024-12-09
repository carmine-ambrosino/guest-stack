// utils.js

// Mostra o nasconde un modale
export function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle("hidden", !show);
  }
}

// Mostra una notifica all'utente
export function showNotification(message, type = "info") {
  const notificationContainer = document.getElementById(
    "notificationContainer"
  );

  const notification = document.createElement("div");
  notification.textContent = message;

  notification.className = `p-4 rounded-lg shadow-lg text-white font-bold transition-transform duration-300 ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;
  
  notification.textContent = message;

  notificationContainer.appendChild(notification);

  // Rimuovi automaticamente la notifica dopo 5 secondi
  setTimeout(() => {
    notification.classList.add("opacity-0");
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Resetta un campo input
export function resetInput(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = "";
    input.classList.remove("focus:ring-2", "focus:ring-gray-400");
    input.classList.add("border-gray-300");
  }
}

// Aggiorna le statistiche
export function updateStats(stats) {
  document.getElementById("totalUsersCount").textContent = stats.users;
  document.getElementById("expiringSoonCount").textContent = stats.expiring_soon;
  document.getElementById("expiredCount").textContent = stats.expired;
}

// Gestione del focus nell'input di ricerca
export function handleSearchFocus(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.classList.add("focus:ring-2", "focus:ring-gray-400");
  }
}
