import { addUser, updateUser } from "./api.js";
import { loadUsers } from "./users.js";
import { showNotification } from "./utils.js";
import { toggleModal } from "./modals.js";
import { getCurrentUserId } from "./state.js";

export { handleUserFormSubmit };

async function handleUserFormSubmit(event) {
  event.preventDefault();
  const user = {
    email: document.getElementById("email").value,
    project: document.getElementById("project").value,
    role: document.getElementById("role").value,
    expiry_time: new Date(
      `${document.getElementById("expiryDate").value}T${
        document.getElementById("expiryClock").value
      }`
    ).toISOString(),
  };

  try {
    const userId = getCurrentUserId();

    if (userId) {
      await updateUser(userId, user);
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
    showNotification("Error: Check fields EMAIL and USERNAME (must be 3+ characters).", "error");
  }
}
