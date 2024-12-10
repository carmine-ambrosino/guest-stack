import {
  activateSearchMode,
  handleSearchInput,
  resetSearchInput,
  blurSearchInput,
  initializeSearchInput,
  isTypingKey,
} from "./search.js";
import {
  toggleModal,
  openAddUserModal,
  areModalsOpen,
  closeAllModals,
} from "./modals.js";
import { loadUsers, confirmDeleteUser } from "./users.js";
import { handleUserFormSubmit, handleProjectFormSubmit } from "./handlers.js";
// Se ci sono modali aperte, blocca tutto tranne ESC
export { initializeApp };

function initializeApp() {
  loadUsers();
  setupEventListeners();
  initializeSearchInput();
}

function setupEventListeners() {
  document.addEventListener("keydown", handleKeyDown);

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }

  const addUserButton = document.getElementById("addUserButton");
  if (addUserButton) {
    addUserButton.addEventListener("click", openAddUserModal);
  }

  const userForm = document.getElementById("userForm");
  if (userForm) {
    userForm.addEventListener("submit", handleUserFormSubmit);
  }

  const confirmDeleteButton = document.getElementById("confirmDeleteButton");
  if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", confirmDeleteUser);
  }

  const projectForm = document.getElementById("projectForm");
  if (projectForm) {
    projectForm.addEventListener("submit", handleProjectFormSubmit);
  }

  setupModalCloseButtons();
}

function handleKeyDown(event) {
  if (areModalsOpen()) {
    if (event.key === "Escape") {
      closeAllModals();
    }
    return;
  }

  if (event.key === "Escape") {
    closeAllModals();
    resetSearchInput();
    blurSearchInput();
    loadUsers();
  } else if (isTypingKey(event)) {
    activateSearchMode();
  }
}

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
