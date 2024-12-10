// modals.js
import { setCurrentUserId, setCurrentProjectUserId } from "./state.js";
import { enableInputFields, disableInputFields } from "./utils.js";

let openModalsCount = 0;

function areModalsOpen() {
  return openModalsCount > 0;
}

function incrementOpenModals() {
  openModalsCount++;
}

function decrementOpenModals() {
  openModalsCount = Math.max(openModalsCount - 1, 0);
}

function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle("hidden", !show);
    if (show) {
      incrementOpenModals();
    } else {
      decrementOpenModals();
    }
  }
}

function openAddUserModal() {
  setCurrentUserId(null); // id reset for new user
  document.getElementById("modalTitle").textContent = "Add User";
  document.getElementById("userForm").reset();
  enableInputFields(["username", "project"]);
  toggleModal("userModal", true);
}

function openEditModal(user) {
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

function openDeleteModal(userId) {
  setCurrentUserId(userId);
  toggleModal("deleteModal", true);
}

function openProjectModal(userId) {
  setCurrentProjectUserId(userId);
  document.getElementById("projectForm").reset();
  toggleModal("projectModal", true);
}

function closeAllModals() {
  ["userModal", "deleteModal", "projectModal"].forEach((modalId) =>
    toggleModal(modalId, false)
  );
}

export {
  areModalsOpen,
  incrementOpenModals,
  decrementOpenModals,
  toggleModal,
  openAddUserModal,
  openEditModal,
  openDeleteModal,
  openProjectModal,
  closeAllModals,
};
