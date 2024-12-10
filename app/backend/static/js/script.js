import { loadUsers } from "./users.js";
import { setupEventListeners } from "./events.js";

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  setupEventListeners();
});
