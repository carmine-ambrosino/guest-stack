import { loadUsers } from "./users.js";
import { setupEventListeners } from "./events.js";

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  setupEventListeners();
});
