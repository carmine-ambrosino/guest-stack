import { createUserElement } from './user.js';
import { fetchUsers, addUser, updateUser, deleteUser } from './api.js';
import { toggleModal, showNotification } from './utils.js';

let currentUserId = null; // Per identificare l'utente corrente (per aggiornamento o eliminazione)

// Carica utenti dall'API e popola la lista
async function loadUsers() {
    try {
        const data = await fetchUsers();

        // Aggiorna le statistiche
        document.getElementById("totalUsersCount").textContent = data.stats.users;
        document.getElementById("expiringSoonCount").textContent = data.stats.expiring_soon;
        document.getElementById("expiredCount").textContent = data.stats.expired;

        // Aggiorna lista utenti
        const userList = document.getElementById("userList");
        userList.replaceChildren();
        data.users.forEach((user) => {
            const userElement = createUserElement(user, openEditModal, openDeleteModal);
            userList.appendChild(userElement);
        });
    } catch (error) {
        console.error("Error loading users:", error);
        showNotification("Failed to load users. Please try again.", "error");
    }
}

// Apri il modale per aggiungere un utente
document.getElementById("addUserButton").addEventListener("click", () => {
    currentUserId = null;
    document.getElementById("modalTitle").textContent = "Add User";

    // Ripristina i valori del form
    document.getElementById("userForm").reset();

    // Riabilita il campo username quando si aggiunge un nuovo utente
    username = document.getElementById("username")
    if(username.disabled){
      username.disabled = false;
      username.classList.remove("bg-gray-50", "text-gray-400", "cursor-not-allowed");
    }

    toggleModal("userModal", true);  // Mostra il modale per l'aggiunta
});

// Gestione del salvataggio del form
document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ottieni i dati dal form
    const email = document.getElementById("email").value;
    const project = document.getElementById("project").value;
    const role = document.getElementById("role").value;
    const expiryTime = document.getElementById("expiryTime").value;

    // Crea l'oggetto utente
    const user = { email, project, role, expiry_time: expiryTime };

    // Se si sta aggiungendo, aggiungi `username`
    if (!currentUserId) {
        const username = document.getElementById("username").value;
        if (!username) {
            showNotification("Username is required for new users.", "error");
            return;
        }
        user.username = username;
    }

    try {
        if (currentUserId) {
            // Aggiorna l'utente
            await updateUser(currentUserId, user);
            showNotification("User updated successfully!", "success");
        } else {
            // Aggiungi un nuovo utente
            await addUser(user);
            showNotification("User added successfully!", "success");
        }
        toggleModal("userModal", false); // Chiudi il modale
        loadUsers();  // Ricarica la lista degli utenti
    } catch (error) {
        console.error("Error saving user:", error);
        showNotification("Failed to save user. Please try again.", "error");
    }
});

// Apri il modale per modificare un utente
function openEditModal(user) {
    currentUserId = user.id; // Assicurati che user.id sia passato correttamente
    document.getElementById("modalTitle").textContent = "Edit User";

    // Popola il form con i dati dell'utente
    document.getElementById("username").value = user.username;
    document.getElementById("email").value = user.email;
    document.getElementById("project").value = user.project_name;
    document.getElementById("role").value = user.role;
    document.getElementById("expiryTime").value = new Date(user.expiry_time).toISOString().slice(0, 16);

    // Disabilita il campo username in modalità "edit"
    username = document.getElementById("username");
    if(!username.disabled){
      username.disabled = true;
      username.classList.add("bg-gray-50", "text-gray-400", "cursor-not-allowed");
    }

    toggleModal("userModal", true); // Mostra il modale per la modifica
}

// Apri il modale per eliminare un utente
function openDeleteModal(userId) {
    currentUserId = userId;  // Aggiorna currentUserId con l'ID dell'utente
    toggleModal("deleteModal", true);
}

// Conferma l'eliminazione dell'utente
document.getElementById("confirmDeleteButton").addEventListener("click", async () => {
    try {
        toggleModal("deleteModal", false); // Chiudi subito il modale
        await deleteUser(currentUserId);
        showNotification("User deleted successfully!", "success");
        loadUsers();
    } catch (error) {
        console.error("Error deleting user:", error);
        showNotification("Failed to delete user. Please try again.", "error");
    }
});

// Chiudi i modali
document.getElementById("cancelButton").addEventListener("click", () => toggleModal("userModal", false));
document.getElementById("cancelDeleteButton").addEventListener("click", () => toggleModal("deleteModal", false));

// Filtra gli utenti nella lista
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
