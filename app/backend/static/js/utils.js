//utils.js
export function toggleModal(modalId, show = true) {
    const modal = document.getElementById(modalId);
    modal.classList.toggle("hidden", !show);
  }
  
// Funzione per mostrare notifiche globali
export function showNotification(message, type = "success") {
  const notificationContainer = document.getElementById("notificationContainer");

  const notification = document.createElement("div");
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

export async function handleEdit(user) {
  try {
      showNotification("Updating user...", "info");
      await onEdit(user);
      showNotification("User updated successfully!", "success");
      loadUsers();  // Ricarica la lista degli utenti
  } catch (error) {
      console.error("Error updating user:", error);
      showNotification("Failed to update user. Please try again.", "error");
  }
}

export async function handleDelete(userId) {
  try {
      showNotification("Deleting user...", "info");
      await onDelete(userId);
      showNotification("User deleted successfully!", "success");
      loadUsers();  // Ricarica la lista degli utenti
  } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Failed to delete user. Please try again.", "error");
  }
}
