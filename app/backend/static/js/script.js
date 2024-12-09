// script.js
import { createUserElement } from "./user.js";
import { fetchUsers, addUser, updateUser, deleteUser } from "./api.js";
import { toggleModal, showNotification } from "./utils.js";

let currentUserId = null;
let currentProjectUserId = null;

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    // Chiudi il modale "userModal", "deleteModal" e "projectModal" se visibili
    const modals = ["userModal", "deleteModal", "projectModal"];
    modals.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (modal && !modal.classList.contains("hidden")) {
        toggleModal(modalId, false); // Chiudi il modale
      }
    });

    // Reset del campo di ricerca e dei bordi
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      // Svuota il campo di ricerca
      searchInput.value = "";

      // Rimuovi il focus e il bordo del focus
      searchInput.classList.remove("focus:ring-2", "focus:ring-gray-400");

      // Ripristina il bordo predefinito
      searchInput.classList.add("border-gray-300"); // Bordo predefinito
    }

    // Carica gli utenti (esegue la funzione loadUsers)
    loadUsers();
  }
});

// Per mantenere il focus visibile quando l'utente clicca nell'input
document.getElementById("searchInput").addEventListener("focus", function () {
  this.classList.add("focus:ring-2", "focus:ring-gray-400");
});

// Carica gli utenti
async function loadUsers() {
  try {
    const data = await fetchUsers();

    // Aggiorna le statistiche
    document.getElementById("totalUsersCount").textContent = data.stats.users;
    document.getElementById("expiringSoonCount").textContent =
      data.stats.expiring_soon;
    document.getElementById("expiredCount").textContent = data.stats.expired;

    // Aggiorna lista utenti
    const userList = document.getElementById("userList");
    userList.replaceChildren();
    data.users.forEach((user) => {
      const userElement = createUserElement(
        user,
        openEditModal,
        openDeleteModal,
        openProjectModal
      );
      userList.appendChild(userElement);
    });
  } catch (error) {
    console.error("Error loading users:", error);
    showNotification("Failed to load users. Please try again.", "error");
  }
}

// Apri il modale per aggiungere un utente
document.getElementById("addUserButton").addEventListener("click", () => {
  currentUserId = null;
  document.getElementById("modalTitle").textContent = "Add User";

  // Ripristina i valori del form
  document.getElementById("userForm").reset();

  // Riabilita i campi username e project per l'aggiunta di un nuovo utente
  const username = document.getElementById("username");
  const project = document.getElementById("project");
  if (username.disabled || project.disabled) {
    username.disabled = false;
    project.disabled = false;
    username.classList.remove(
      "bg-gray-50",
      "text-gray-400",
      "cursor-not-allowed"
    );
    project.classList.remove(
      "bg-gray-50",
      "text-gray-400",
      "cursor-not-allowed"
    );
  }

  toggleModal("userModal", true); // Mostra il modale
});

// Salva un nuovo utente o aggiorna un utente esistente
document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const project = document.getElementById("project").value;
  const role = document.getElementById("role").value;
  const expiryDate = document.getElementById("expiryDate").value;
  const expiryClock = document.getElementById("expiryClock").value;

  const expiryTime = new Date(`${expiryDate}T${expiryClock}`).toISOString();
  const user = { email, project, role, expiry_time: expiryTime };

  if (!currentUserId) {
    const username = document.getElementById("username").value;
    if (!username) {
      showNotification("Username is required for new users.", "error");
      return;
    }
    user.username = username;
  }

  try {
    if (currentUserId) {
      await updateUser(currentUserId, user);
      showNotification("User updated successfully!", "success");
    } else {
      await addUser(user);
      showNotification("User added successfully!", "success");
    }
    toggleModal("userModal", false);
    loadUsers();
  } catch (error) {
    console.error("Error saving user:", error);
    showNotification("Failed to save user. Please try again.", "error");
  }
});

// Apri il modale per modificare un utente
function openEditModal(user) {
  currentUserId = user.id;
  document.getElementById("modalTitle").textContent = "Edit User";

  document.getElementById("username").value = user.username;
  document.getElementById("email").value = user.email;
  document.getElementById("project").value = user.project_name;
  document.getElementById("role").value = user.role;

  const expiryTime = new Date(user.expiry_time);
  document.getElementById("expiryDate").value = expiryTime
    .toISOString()
    .slice(0, 10);
  document.getElementById("expiryClock").value = expiryTime
    .toISOString()
    .slice(11, 16);

  const username = document.getElementById("username");
  const project = document.getElementById("project");
  if (!username.disabled || project.disabled) {
    username.disabled = true;
    project.disabled = true;

    username.classList.add("bg-gray-50", "text-gray-400", "cursor-not-allowed");
    project.classList.add("bg-gray-50", "text-gray-400", "cursor-not-allowed");
  }

  toggleModal("userModal", true);
}

// Apri il modale per eliminare un utente
function openDeleteModal(userId) {
  currentUserId = userId;
  toggleModal("deleteModal", true);
}

// Conferma l'eliminazione di un utente
document
  .getElementById("confirmDeleteButton")
  .addEventListener("click", async () => {
    try {
      toggleModal("deleteModal", false);
      await deleteUser(currentUserId);
      showNotification("User deleted successfully!", "success");
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Failed to delete user. Please try again.", "error");
    }
  });

// Apri il modale per modificare il progetto di un utente
function openProjectModal(userId) {
  currentProjectUserId = userId;
  document.getElementById("projectForm").reset();
  toggleModal("projectModal", true);
}

// Salva le modifiche al progetto
document.getElementById("projectForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const projectName = document.getElementById("projectName").value;

  if (!projectName) {
    showNotification("Project name is required.", "error");
    return;
  }

  try {
    await updateUser(currentProjectUserId, { project: projectName });
    showNotification("Project updated successfully!", "success");
    toggleModal("projectModal", false);
    loadUsers();
  } catch (error) {
    console.error("Error updating project:", error);
    showNotification("Failed to update project. Please try again.", "error");
  }
});

// Chiudi i modali e carica gli utenti
document.getElementById("cancelButton").addEventListener("click", () => {
  toggleModal("userModal", false);
  loadUsers();
});

document.getElementById("cancelDeleteButton").addEventListener("click", () => {
  toggleModal("deleteModal", false);
  loadUsers();
});

document.getElementById("cancelProjectButton").addEventListener("click", () => {
  toggleModal("projectModal", false);
  loadUsers();
});

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
