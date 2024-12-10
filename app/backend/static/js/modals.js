// modals.js
import { setCurrentUserId, setCurrentProjectUserId } from "./state.js";
import { enableInputFields, disableInputFields } from "./utils.js";

// toggle modal
export function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle("hidden", !show);
  }
}

// open add modal
export function openAddUserModal() {
  setCurrentUserId(null); // id reset for new user
  document.getElementById("modalTitle").textContent = "Add User";
  document.getElementById("userForm").reset();
  enableInputFields(["username", "project"]);
  toggleModal("userModal", true);
}

// open edit modal
export function openEditModal(user) {
  setCurrentUserId(user.id);
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

  disableInputFields(["username", "project"]);
  toggleModal("userModal", true);
}

//open delete modal
export function openDeleteModal(userId) {
  setCurrentUserId(userId);
  toggleModal("deleteModal", true);
}

// open add new project modal
export function openProjectModal(userId) {
  setCurrentProjectUserId(userId);
  document.getElementById("projectForm").reset();
  toggleModal("projectModal", true);
}
