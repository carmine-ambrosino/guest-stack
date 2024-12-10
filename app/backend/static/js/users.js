import { fetchUsers, deleteUser } from "./api.js";
import { createUserElement } from "./user.js";
import { toggleModal, showNotification } from "./utils.js";
import { setCurrentUserId, setCurrentProjectUserId } from "./state.js";

// Carica gli utenti
export async function loadUsers() {
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
    userList.replaceChildren();

    sortedUsers.forEach((user) => {
      const userElement = createUserElement(
        user,
        () => openEditModal(user),
        () => openDeleteModal(user.id),
        () => openProjectModal(user.id)
      );
      userList.appendChild(userElement);
    });
  } catch (error) {
    console.error("Error loading users:", error);
    showNotification("Failed to load users. Please try again.", "error");
  }
}

// Apertura del modale per aggiungere un utente
export function openAddUserModal() {
  setCurrentUserId(null); // Reset dell'ID per un nuovo utente
  document.getElementById("modalTitle").textContent = "Add User";
  document.getElementById("userForm").reset();
  enableInputFields(["username", "project"]);
  toggleModal("userModal", true);
}

// Apertura del modale per modificare un utente
export function openEditModal(user) {
  setCurrentUserId(user.id); // Imposta l'ID dell'utente corrente
  document.getElementById("modalTitle").textContent = "Edit User";

  document.getElementById("username").value = user.username;
  document.getElementById("email").value = user.email;
  document.getElementById("project").value = user.project_name;
  document.getElementById("role").value = user.role;

  const expiryTime = new Date(user.expiry_time);
  document.getElementById("expiryDate").value = expiryTime.toISOString().slice(0, 10);
  document.getElementById("expiryClock").value = expiryTime.toISOString().slice(11, 16);

  disableInputFields(["username", "project"]); // Disabilita i campi username e project
  toggleModal("userModal", true);
}

// Apertura del modale per eliminare un utente
export function openDeleteModal(userId) {
  setCurrentUserId(userId);
  toggleModal("deleteModal", true);
}

// Apertura del modale per modificare il progetto di un utente
export function openProjectModal(userId) {
  setCurrentProjectUserId(userId);
  document.getElementById("projectForm").reset();
  toggleModal("projectModal", true);
}

// Conferma eliminazione utente
export async function confirmDeleteUser() {
  try {
    const userId = getCurrentUserId();
    toggleModal("deleteModal", false);
    await deleteUser(userId);
    showNotification("User deleted successfully!", "success");
    loadUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    showNotification("Failed to delete user. Please try again.", "error");
  }
}

// Funzioni helper per abilitare/disabilitare campi input
function enableInputFields(fieldIds) {
  fieldIds.forEach((id) => {
    const field = document.getElementById(id);
    field.disabled = false;
    field.classList.remove("bg-gray-50", "text-gray-400", "cursor-not-allowed");
  });
}

function disableInputFields(fieldIds) {
  fieldIds.forEach((id) => {
    const field = document.getElementById(id);
    field.disabled = true;
    field.classList.add("bg-gray-50", "text-gray-400", "cursor-not-allowed");
  });
}
