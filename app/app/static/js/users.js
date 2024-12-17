import { fetchUsers, deleteUser } from "./api.js";
import { createUserElement } from "./card.js";
import { showNotification } from "./utils.js";
import { toggleModal, openDeleteModal, openEditModal } from "./modals.js";
import { getCurrentUserId } from "./state.js";

export { loadUsers, confirmDeleteUser, filterUserList };

// Load users
async function loadUsers() {
  try {
    const data = await fetchUsers();

    // sort by date
    const sortedUsers = data.users.sort(
      (a, b) => new Date(a.expiry_time) - new Date(b.expiry_time)
    );

    // update stats
    document.getElementById("totalUsersCount").textContent = data.stats.users;
    document.getElementById("expiringSoonCount").textContent =
      data.stats.expiring_soon;
    document.getElementById("expiredCount").textContent = data.stats.expired;

    // update list
    const userList = document.getElementById("userList");
    userList.replaceChildren();

    sortedUsers.forEach((user) => {
      const userElement = createUserElement(
        user,
        () => openEditModal(user),
        () => openDeleteModal(user.id)
      );
      userList.appendChild(userElement);
    });
  } catch (error) {
    console.error("Error loading users:", error);
    showNotification("Failed to load users. Please try again.", "error");
  }
}

// Confirm delete user
async function confirmDeleteUser() {
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

function filterUserList() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const users = document.querySelectorAll("#userList li");
  users.forEach((user) => {
    const userText = user.textContent.toLowerCase();
    user.style.display = userText.includes(searchTerm) ? "" : "none";
  });
}
