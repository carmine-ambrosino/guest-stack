import { createUserElement } from "./user.js";
import { fetchUsers, addUser, updateUser, deleteUser } from "./api.js";
import { toggleModal, showNotification, resetInput, updateStats, handleSearchFocus } from "./utils.js";

// Variabili di stato
let currentUserId = null;
let currentProjectUserId = null;


// Carica gli utenti
async function loadUsers() {
  try {
    const data = await fetchUsers();

    // Ordinamento degli utenti per data di scadenza
    const sortedUsers = data.users.sort((a, b) => new Date(a.expiry_time) - new Date(b.expiry_time));

    // Aggiorna le statistiche
    document.getElementById("totalUsersCount").textContent = data.stats.users;
    document.getElementById("expiringSoonCount").textContent = data.stats.expiring_soon;
    document.getElementById("expiredCount").textContent = data.stats.expired;

    // Aggiorna lista utenti
    const userList = document.getElementById("userList");
    userList.replaceChildren(); // Svuota la lista precedente

    sortedUsers.forEach((user) => {
      const userElement = createUserElement(
        user,
        openEditModal,
        openDeleteModal,
        openProjectModal
      );
      userList.appendChild(userElement); // Aggiungi l'elemento utente
    });
  } catch (error) {
    console.error("Error loading users:", error);
    showNotification("Failed to load users. Please try again.", "error");
  }
}


// Gestione eventi principali
function setupEventListeners() {
  document.addEventListener("keydown", handleKeyDown);
  document.getElementById("searchInput").addEventListener("focus", () => handleSearchFocus("searchInput"));
  document.getElementById("searchInput").addEventListener("input", filterUserList);

  document.getElementById("addUserButton").addEventListener("click", openAddUserModal);
  document.getElementById("userForm").addEventListener("submit", handleUserFormSubmit);
  document.getElementById("confirmDeleteButton").addEventListener("click", confirmDeleteUser);
  document.getElementById("projectForm").addEventListener("submit", handleProjectFormSubmit);

  setupModalCloseButtons();
}

// Gestione del tasto Escape per chiudere i modali
function handleKeyDown(event) {
  if (event.key === "Escape") {
    ["userModal", "deleteModal", "projectModal"].forEach((modalId) => toggleModal(modalId, false));
    resetInput("searchInput");
    loadUsers();
  }
}

// Filtra gli utenti nella lista
function filterUserList() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const users = document.querySelectorAll("#userList li");
  users.forEach((user) => {
    const userText = user.textContent.toLowerCase();
    user.style.display = userText.includes(searchTerm) ? "" : "none";
  });
}

// Gestione dei modali
function setupModalCloseButtons() {
  document.getElementById("cancelButton").addEventListener("click", () => toggleModal("userModal", false));
  document.getElementById("cancelDeleteButton").addEventListener("click", () => toggleModal("deleteModal", false));
  document.getElementById("cancelProjectButton").addEventListener("click", () => toggleModal("projectModal", false));
}


// Apertura del modale per aggiungere un utente
function openAddUserModal() {
  currentUserId = null;
  document.getElementById("modalTitle").textContent = "Add User";
  document.getElementById("userForm").reset();
  if (username.disabled || project.disabled) {
    username.disabled = false;
    project.disabled = false;

    username.classList.remove("bg-gray-50", "text-gray-400", "cursor-not-allowed");
    project.classList.remove("bg-gray-50", "text-gray-400", "cursor-not-allowed");
  }

  toggleModal("userModal", true);
}

// Gestione del salvataggio/modifica di un utente
async function handleUserFormSubmit(event) {
  event.preventDefault();
  const user = {
    email: document.getElementById("email").value,
    project: document.getElementById("project").value,
    role: document.getElementById("role").value,
    expiry_time: new Date(`${document.getElementById("expiryDate").value}T${document.getElementById("expiryClock").value}`).toISOString(),
  };

  try {
    if (currentUserId) {
      await updateUser(currentUserId, user);
      showNotification("User updated successfully!", "success");
    } else {
      user.username = document.getElementById("username").value;
      await addUser(user);
      showNotification("User added successfully!", "success");
    }
    toggleModal("userModal", false);
    loadUsers();
  } catch (error) {
    console.error("Error saving user:", error);
    showNotification("Failed to save user. Please try again.", "error");
  }
}

// Conferma eliminazione utente
async function confirmDeleteUser() {
  try {
    toggleModal("deleteModal", false);
    await deleteUser(currentUserId);
    showNotification("User deleted successfully!", "success");
    loadUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    showNotification("Failed to delete user. Please try again.", "error");
  }
}

// Apertura del modale per modificare il progetto
async function handleProjectFormSubmit(event) {
  event.preventDefault();
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
}


// Apertura del modale per modificare un utente
function openEditModal(user) {
  currentUserId = user.id;
  document.getElementById("modalTitle").textContent = "Edit User";

  document.getElementById("username").value = user.username;
  document.getElementById("email").value = user.email;
  document.getElementById("project").value = user.project_name;
  document.getElementById("role").value = user.role;

  const expiryTime = new Date(user.expiry_time);
  document.getElementById("expiryDate").value = expiryTime.toISOString().slice(0, 10);
  document.getElementById("expiryClock").value = expiryTime.toISOString().slice(11, 16);

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

// Apertura del modale per eliminare un utente
function openDeleteModal(userId) {
  currentUserId = userId;
  toggleModal("deleteModal", true);
}

// Apertura del modale per modificare il progetto di un utente
function openProjectModal(userId) {
  currentProjectUserId = userId;
  document.getElementById("projectForm").reset();
  toggleModal("projectModal", true);
}


// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  setupEventListeners();
});
