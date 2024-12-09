// script.js
import { createUserElement } from './user.js';
import { fetchUsers, updateUserStats } from './api.js';

// Funzione per caricare gli utenti dall'API
async function loadUsers() {
  try {
    const data = await fetchUsers();
    updateUserStats(data.stats);

    // Aggiorna lista utenti
    const userList = document.getElementById("userList");
    userList.replaceChildren(); // Svuota la lista prima di riempirla
    data.users.forEach((user) => {
      const userElement = createUserElement(user);
      userList.appendChild(userElement);
    });
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

// Filtra gli utenti
document.getElementById("searchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const users = document.querySelectorAll("#userList li");
  users.forEach((user) => {
    const userText = user.textContent.toLowerCase();
    user.style.display = userText.includes(searchTerm) ? "" : "none";
  });
});

// Inizializza la pagina
document.addEventListener("DOMContentLoaded", loadUsers);
