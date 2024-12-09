import { createUserElement } from './user.js';
import { fetchUsers, addUser, updateUser, deleteUser } from './api.js';

let currentUserId = null; // Per identificare l'utente corrente (per aggiornamento o eliminazione)

// Funzione per mostrare o nascondere i modali
function toggleModal(modalId, show = true) {
  const modal = document.getElementById(modalId);
  modal.classList.toggle("hidden", !show);
}

// Carica utenti dall'API e popola la lista
async function loadUsers() {
  try {
    const data = await fetchUsers();

    // Aggiorna le statistiche
    document.getElementById("totalUsersCount").textContent = data.stats.users;
    document.getElementById("expiringSoonCount").textContent = data.stats.expiring_soon;
    document.getElementById("expiredCount").textContent = data.stats.expired;

    // Aggiorna lista utenti
    const userList = document.getElementById("userList");
    userList.replaceChildren();
    data.users.forEach((user) => {
      const userElement = createUserElement(user);
      userList.appendChild(userElement);
    });
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

// Apri il modale per aggiungere un utente
document.getElementById("addUserButton").addEventListener("click", () => {
  currentUserId = null;
  document.getElementById("modalTitle").textContent = "Add User";
  document.getElementById("userForm").reset();
  toggleModal("userModal", true);
});

// Gestione della sottomissione del form per aggiungere o aggiornare un utente
document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    project: document.getElementById("project").value,
    role: document.getElementById("role").value,
    expiry_time: document.getElementById("expiryTime").value,
  };

  try {
    if (currentUserId) {
      await updateUser(currentUserId, user);
      alert("User updated successfully!");
    } else {
      await addUser(user);
      alert("User added successfully!");
    }
    toggleModal("userModal", false);
    loadUsers();
  } catch (error) {
    console.error("Error saving user:", error);
    alert("Failed to save user. Please try again.");
  }
});

// Apri il modale per eliminare un utente
function openDeleteModal(userId) {
  currentUserId = userId;
  toggleModal("deleteModal", true);
}

// Conferma l'eliminazione dell'utente
document.getElementById("confirmDeleteButton").addEventListener("click", async () => {
  try {
    await deleteUser(currentUserId);
    alert("User deleted successfully!");
    toggleModal("deleteModal", false);
    loadUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Failed to delete user. Please try again.");
  }
});

// Chiudi i modali
document.getElementById("cancelButton").addEventListener("click", () => toggleModal("userModal", false));
document.getElementById("cancelDeleteButton").addEventListener("click", () => toggleModal("deleteModal", false));

// Filtra gli utenti nella lista
document.getElementById("searchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const users = document.querySelectorAll("#userList li");
  users.forEach((user) => {
    const userText = user.textContent.toLowerCase();
    user.style.display = userText.includes(searchTerm) ? "" : "none";
  });
});

// Inizializza la pagina
document.addEventListener("DOMContentLoaded", loadUsers);
