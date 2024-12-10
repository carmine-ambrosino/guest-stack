import { resetInput } from "./utils.js";
import { handleUserFormSubmit, handleProjectFormSubmit } from "./handlers.js";
import { toggleModal, openAddUserModal } from "./modals.js";
import { confirmDeleteUser, loadUsers } from "./users.js";

// setup event
function setupEventListeners() {
  document.addEventListener("keydown", handleKeyDown);
  document
    .getElementById("searchInput")
    .addEventListener("input", filterUserList);

  document
    .getElementById("addUserButton")
    .addEventListener("click", openAddUserModal);
  document
    .getElementById("userForm")
    .addEventListener("submit", handleUserFormSubmit);
  document
    .getElementById("confirmDeleteButton")
    .addEventListener("click", confirmDeleteUser);
  document
    .getElementById("projectForm")
    .addEventListener("submit", handleProjectFormSubmit);

  setupModalCloseButtons();
}

// escape management
function handleKeyDown(event) {
  if (event.key === "Escape") {
    ["userModal", "deleteModal", "projectModal"].forEach((modalId) =>
      toggleModal(modalId, false)
    );
    resetInput("searchInput");
    loadUsers();
  }
}

// filter user list
function filterUserList() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const users = document.querySelectorAll("#userList li");
  users.forEach((user) => {
    const userText = user.textContent.toLowerCase();
    user.style.display = userText.includes(searchTerm) ? "" : "none";
  });
}

// modal close button setup
function setupModalCloseButtons() {
  document
    .getElementById("cancelButton")
    .addEventListener("click", () => toggleModal("userModal", false));
  document
    .getElementById("cancelDeleteButton")
    .addEventListener("click", () => toggleModal("deleteModal", false));
  document
    .getElementById("cancelProjectButton")
    .addEventListener("click", () => toggleModal("projectModal", false));
}

export {
  setupEventListeners,
  handleKeyDown,
  filterUserList,
  setupModalCloseButtons,
};
